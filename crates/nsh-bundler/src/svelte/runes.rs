//! Svelte's runes on NSH's reactive graph: a text-to-text pass over the TSX
//! a `.svelte` file became (or a `.svelte.ts` module), which knows bindings
//! by their scopes (oxc's semantic analysis), so a shadowing local name is
//! left alone.
//!
//! | Svelte | becomes |
//! |---|---|
//! | `let x = $state(v)` | `let x = __nsh_state(v)`: reads `x()`, writes `x.set(…)`; objects and arrays are deeply reactive (a proxy) |
//! | `const x = $state({…})` | `const x = __nsh_proxy({…})`: the proxy itself, read as it is |
//! | `$state.raw(v)` | `__nsh_signal(v)`: reads `x()`, writes `x.set(…)` |
//! | `$derived(e)` / `$derived.by(f)` | `__nsh_computed(() => (e))` / `__nsh_computed(f)`: reads `x()` |
//! | `$effect(f)` / `$effect.pre(f)` | `__nsh_effect(f)` |
//! | `let { a, b = 1, ...rest } = $props()` | reads of `__props.a`, `__props.b` (default when `undefined`), `__props` |
//! | `$state.snapshot(x)` | `__nsh_snapshot(x)` |
//! | `$inspect(a, b)` | `__nsh_effect(() => console.log(a, b))` |
//!
//! `#each` rows' item and index (accessors in NSH) are bindings the markup
//! generator names by offset: reads become calls.

use std::collections::{HashMap, HashSet};

use oxc::{
    allocator::Allocator,
    ast::ast::{
        Argument, AssignmentExpression, AssignmentOperator, AssignmentTarget, BindingIdentifier,
        BindingPattern, CallExpression, Expression, IdentifierReference, ObjectProperty,
        PropertyKey, SimpleAssignmentTarget, UpdateExpression, UpdateOperator,
        VariableDeclaration, VariableDeclarationKind,
    },
    ast_visit::{Visit, walk},
    parser::Parser,
    semantic::{Scoping, SemanticBuilder, SymbolId},
    span::{GetSpan, SourceType, Span},
};

/// What a binding made with a rune is.
#[derive(Debug, Clone)]
enum Kind {
    /// `$state` (`let`) and `$state.raw`: read `x()`, written `x.set(v)`.
    Signal,
    /// `$derived`, `#each` items and indexes: read `x()`, not written.
    ReadOnly(&'static str),
    /// A prop: `__props.key`, its default when it is `undefined`.
    Prop { key: String, default: Option<String> },
    /// `...rest` of `$props()`, or `let props = $props()`.
    Props,
}

/// An error at a byte offset of the code the pass ran on.
#[derive(Debug)]
pub(crate) struct RuneError {
    pub(crate) message: String,
    pub(crate) offset: u32,
}

/// What the pass made.
pub(crate) struct Runes {
    pub(crate) code: String,
    /// Whether `__nsh_state` / `__nsh_proxy` / `__nsh_snapshot` are used:
    /// the caller adds their definitions ([`HELPERS`]).
    pub(crate) helpers: bool,
}

/// Rewrites the runes of `code` (TSX, or TS for `.svelte.ts` modules).
/// `accessors` are the offsets of binding identifiers that are accessors
/// (`#each` items and indexes).
pub(crate) fn rewrite(
    code: &str,
    source_type: SourceType,
    accessors: &HashSet<u32>,
) -> Result<Runes, RuneError> {
    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, code, source_type).parse();
    if let Some(err) = parsed.diagnostics.into_iter().next() {
        let offset = err.labels.first().map_or(0, |l| l.offset() as u32);
        return Err(RuneError {
            message: err.message.to_string(),
            offset,
        });
    }
    let program = parsed.program;
    let scoping = SemanticBuilder::new().build(&program).semantic.into_scoping();
    let mut collect = Collect {
        code,
        accessors,
        kinds: HashMap::new(),
        edits: Vec::new(),
        skip: HashSet::new(),
        helpers: false,
        error: None,
    };
    collect.visit_program(&program);
    if let Some(e) = collect.error {
        return Err(e);
    }
    let mut rewrite = Rewrite {
        code,
        scoping: &scoping,
        kinds: &collect.kinds,
        edits: collect.edits,
        skip: &collect.skip,
        error: None,
    };
    rewrite.visit_program(&program);
    if let Some(e) = rewrite.error {
        return Err(e);
    }
    Ok(Runes {
        code: apply(code, rewrite.edits),
        helpers: collect.helpers,
    })
}

/// Applies non-overlapping edits `(start, end, text)`.
fn apply(code: &str, mut edits: Vec<(u32, u32, String)>) -> String {
    edits.sort_by_key(|e| (e.0, e.1));
    let mut out = String::with_capacity(code.len() + edits.len() * 8);
    let mut at = 0usize;
    for (start, end, text) in edits {
        let (start, end) = (start as usize, end as usize);
        if start < at {
            // Overlapping edits only come from nested rewrites the visitors
            // skip; keep the first.
            continue;
        }
        out.push_str(&code[at..start]);
        out.push_str(&text);
        at = end;
    }
    out.push_str(&code[at..]);
    out
}

/// The rune a call is: `$state`, `$state.raw`, `$derived.by`, …
fn rune_name(call: &CallExpression<'_>) -> Option<String> {
    match &call.callee {
        Expression::Identifier(id) if id.name.starts_with('$') => Some(id.name.to_string()),
        Expression::StaticMemberExpression(m) => match &m.object {
            Expression::Identifier(id) if id.name.starts_with('$') => {
                Some(format!("{}.{}", id.name, m.property.name))
            }
            _ => None,
        },
        _ => None,
    }
}

const RUNES: &[&str] = &[
    "$state",
    "$state.raw",
    "$state.snapshot",
    "$derived",
    "$derived.by",
    "$effect",
    "$effect.pre",
    "$props",
    "$bindable",
    "$inspect",
];

fn symbol(id: &BindingIdentifier<'_>) -> Option<SymbolId> {
    id.symbol_id.get()
}

/// Pass 1: the bindings runes make, and the edits of the rune calls.
struct Collect<'c> {
    code: &'c str,
    accessors: &'c HashSet<u32>,
    kinds: HashMap<SymbolId, Kind>,
    edits: Vec<(u32, u32, String)>,
    /// Declarations removed whole (`$props()`): pass 2 does not enter them.
    skip: HashSet<u32>,
    helpers: bool,
    error: Option<RuneError>,
}

impl Collect<'_> {
    fn fail(&mut self, message: impl Into<String>, span: Span) {
        if self.error.is_none() {
            self.error = Some(RuneError {
                message: message.into(),
                offset: span.start,
            });
        }
    }

    fn text(&self, span: Span) -> &str {
        &self.code[span.start as usize..span.end as usize]
    }

    /// The bindings of `let { a, b = 1, ...rest } = $props()`.
    fn props(&mut self, pattern: &BindingPattern<'_>) {
        match pattern {
            BindingPattern::BindingIdentifier(id) => {
                if let Some(s) = symbol(id) {
                    self.kinds.insert(s, Kind::Props);
                }
            }
            BindingPattern::ObjectPattern(obj) => {
                for p in &obj.properties {
                    let key = match &p.key {
                        PropertyKey::StaticIdentifier(k) => k.name.to_string(),
                        PropertyKey::StringLiteral(s) => s.value.to_string(),
                        other => {
                            self.fail("a prop's name must be written out", other.span());
                            return;
                        }
                    };
                    let (binding, default) = match &p.value {
                        BindingPattern::BindingIdentifier(id) => (id, None),
                        BindingPattern::AssignmentPattern(a) => match &a.left {
                            BindingPattern::BindingIdentifier(id) => {
                                (id, Some(self.default_text(&a.right)))
                            }
                            other => {
                                self.fail("nested destructuring of props is not supported", other.span());
                                return;
                            }
                        },
                        other => {
                            self.fail("nested destructuring of props is not supported", other.span());
                            return;
                        }
                    };
                    if let Some(s) = symbol(binding) {
                        self.kinds.insert(s, Kind::Prop { key, default });
                    }
                }
                if let Some(rest) = &obj.rest
                    && let BindingPattern::BindingIdentifier(id) = &rest.argument
                    && let Some(s) = symbol(id)
                {
                    self.kinds.insert(s, Kind::Props);
                }
            }
            other => self.fail("`$props()` is destructured with `{ … }`", other.span()),
        }
    }

    /// A prop's default as text; `$bindable(v)` is `v` (NSH props are
    /// one-way).
    fn default_text(&self, e: &Expression<'_>) -> String {
        if let Expression::CallExpression(call) = e
            && rune_name(call).as_deref() == Some("$bindable")
        {
            return call
                .arguments
                .first()
                .map_or_else(|| "undefined".to_owned(), |a| self.text(a.span()).to_owned());
        }
        self.text(e.span()).to_owned()
    }
}

impl<'a> Visit<'a> for Collect<'_> {
    fn visit_variable_declaration(&mut self, it: &VariableDeclaration<'a>) {
        let props = it.declarations.iter().any(|d| {
            matches!(&d.init, Some(Expression::CallExpression(c)) if rune_name(c).as_deref() == Some("$props"))
        });
        if props {
            if it.declarations.len() != 1 {
                self.fail("declare `$props()` on its own", it.span);
                return;
            }
            self.props(&it.declarations[0].id);
            self.skip.insert(it.span.start);
            self.edits.push((it.span.start, it.span.end, String::new()));
            return;
        }
        for d in &it.declarations {
            let Some(Expression::CallExpression(call)) = &d.init else {
                continue;
            };
            let Some(rune) = rune_name(call) else {
                continue;
            };
            let BindingPattern::BindingIdentifier(id) = &d.id else {
                if matches!(rune.as_str(), "$state" | "$state.raw" | "$derived" | "$derived.by") {
                    self.fail(format!("`{rune}` is declared with a name: `let x = {rune}(…)`"), d.id.span());
                }
                continue;
            };
            let Some(s) = symbol(id) else { continue };
            match rune.as_str() {
                "$state" if it.kind == VariableDeclarationKind::Const => {
                    // A constant object is the proxy itself.
                    self.helpers = true;
                    self.edits.push((call.callee.span().start, call.callee.span().end, "__nsh_proxy".into()));
                }
                "$state" => {
                    self.helpers = true;
                    self.kinds.insert(s, Kind::Signal);
                    self.edits.push((call.callee.span().start, call.callee.span().end, "__nsh_state".into()));
                }
                "$state.raw" => {
                    self.kinds.insert(s, Kind::Signal);
                    self.edits.push((call.callee.span().start, call.callee.span().end, "__nsh_signal".into()));
                }
                "$derived" => {
                    self.kinds.insert(s, Kind::ReadOnly("a $derived value"));
                }
                "$derived.by" => {
                    self.kinds.insert(s, Kind::ReadOnly("a $derived value"));
                }
                _ => {}
            }
        }
        walk::walk_variable_declaration(self, it);
    }

    fn visit_call_expression(&mut self, call: &CallExpression<'a>) {
        if let Some(rune) = rune_name(call) {
            let callee = call.callee.span();
            let wrap = |this: &mut Self, before: &str, after: &str| {
                // `rune(a, b)` → `before a, b after`.
                match (call.arguments.first(), call.arguments.last()) {
                    (Some(first), Some(last)) => {
                        this.edits.push((call.span.start, first.span().start, before.to_owned()));
                        this.edits.push((last.span().end, call.span.end, after.to_owned()));
                    }
                    _ => this.edits.push((call.span.start, call.span.end, format!("{before}undefined{after}"))),
                }
            };
            match rune.as_str() {
                // Declarations made these (pass 1, above) or are errors.
                "$state" | "$state.raw" | "$props" => {}
                "$derived" => wrap(self, "__nsh_computed(() => (", "))"),
                "$derived.by" => self.edits.push((callee.start, callee.end, "__nsh_computed".into())),
                "$effect" | "$effect.pre" => {
                    self.edits.push((callee.start, callee.end, "__nsh_effect".into()));
                }
                "$state.snapshot" => {
                    self.helpers = true;
                    self.edits.push((callee.start, callee.end, "__nsh_snapshot".into()));
                }
                "$inspect" => wrap(self, "__nsh_effect(() => console.log(", "))"),
                "$bindable" => {
                    self.fail("`$bindable` is only a prop's default", call.span);
                }
                other if other.starts_with("$state")
                    || other.starts_with("$derived")
                    || other.starts_with("$effect")
                    || other.starts_with("$props")
                    || other.starts_with("$inspect")
                    || other == "$host" =>
                {
                    self.fail(format!("`{other}` is not supported in NSH apps"), call.span);
                }
                _ => {}
            }
            let _ = RUNES;
        }
        walk::walk_call_expression(self, call);
    }

    fn visit_binding_identifier(&mut self, it: &BindingIdentifier<'a>) {
        if self.accessors.contains(&it.span.start)
            && let Some(s) = symbol(it)
        {
            self.kinds.insert(s, Kind::ReadOnly("an #each item or index"));
        }
    }
}

/// Pass 2: reads and writes of the bindings.
struct Rewrite<'c> {
    code: &'c str,
    scoping: &'c Scoping,
    kinds: &'c HashMap<SymbolId, Kind>,
    edits: Vec<(u32, u32, String)>,
    skip: &'c HashSet<u32>,
    error: Option<RuneError>,
}

impl Rewrite<'_> {
    fn fail(&mut self, message: impl Into<String>, span: Span) {
        if self.error.is_none() {
            self.error = Some(RuneError {
                message: message.into(),
                offset: span.start,
            });
        }
    }

    fn kind(&self, id: &IdentifierReference<'_>) -> Option<&Kind> {
        let reference = id.reference_id.get()?;
        let symbol = self.scoping.get_reference(reference).symbol_id()?;
        self.kinds.get(&symbol)
    }

    /// How a read of `id` is written.
    fn read(&self, id: &IdentifierReference<'_>, kind: &Kind) -> String {
        match kind {
            Kind::Signal | Kind::ReadOnly(_) => format!("{}()", id.name),
            Kind::Prop { key, default: None } => prop_access(key),
            Kind::Prop {
                key,
                default: Some(d),
            } => {
                let access = prop_access(key);
                format!("({access} === undefined ? ({d}) : {access})")
            }
            Kind::Props => "__props".to_owned(),
        }
    }

    fn not_writable(&mut self, id: &IdentifierReference<'_>, kind: &Kind) {
        let what = match kind {
            Kind::ReadOnly(what) => *what,
            Kind::Prop { .. } | Kind::Props => "a prop (NSH props are one-way: pass a callback)",
            Kind::Signal => "state",
        };
        self.fail(format!("`{}` is {what} and cannot be assigned", id.name), id.span);
    }
}

fn prop_access(key: &str) -> String {
    if key.chars().all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '$')
        && !key.starts_with(|c: char| c.is_ascii_digit())
    {
        format!("__props.{key}")
    } else {
        format!("__props[{}]", serde_json::to_string(key).expect("a string"))
    }
}

impl<'a> Visit<'a> for Rewrite<'_> {
    fn visit_variable_declaration(&mut self, it: &VariableDeclaration<'a>) {
        if self.skip.contains(&it.span.start) {
            return;
        }
        walk::walk_variable_declaration(self, it);
    }

    fn visit_assignment_expression(&mut self, it: &AssignmentExpression<'a>) {
        if let AssignmentTarget::AssignmentTargetIdentifier(id) = &it.left
            && let Some(kind) = self.kind(id).cloned()
        {
            if !matches!(kind, Kind::Signal) {
                self.not_writable(id, &kind);
                return;
            }
            let name = &id.name;
            let right = it.right.span();
            let before = if it.operator == AssignmentOperator::Assign {
                format!("{name}.set(")
            } else {
                let op = it.operator.as_str();
                let op = &op[..op.len() - 1];
                format!("{name}.set({name}() {op} (")
            };
            let after = if it.operator == AssignmentOperator::Assign { ")" } else { "))" };
            self.edits.push((it.span.start, right.start, before));
            self.edits.push((right.end, it.span.end, after.to_owned()));
            self.visit_expression(&it.right);
            return;
        }
        walk::walk_assignment_expression(self, it);
    }

    fn visit_update_expression(&mut self, it: &UpdateExpression<'a>) {
        if let SimpleAssignmentTarget::AssignmentTargetIdentifier(id) = &it.argument
            && let Some(kind) = self.kind(id).cloned()
        {
            if !matches!(kind, Kind::Signal) {
                self.not_writable(id, &kind);
                return;
            }
            let name = &id.name;
            let (op, undo) = match it.operator {
                UpdateOperator::Increment => ("+", "-"),
                UpdateOperator::Decrement => ("-", "+"),
            };
            let text = if it.prefix {
                format!("({name}.set({name}() {op} 1), {name}())")
            } else {
                format!("({name}.set({name}() {op} 1), {name}() {undo} 1)")
            };
            self.edits.push((it.span.start, it.span.end, text));
            return;
        }
        walk::walk_update_expression(self, it);
    }

    fn visit_object_property(&mut self, it: &ObjectProperty<'a>) {
        if it.shorthand
            && let Expression::Identifier(id) = &it.value
            && let Some(kind) = self.kind(id).cloned()
        {
            let read = self.read(id, &kind);
            self.edits.push((it.span.start, it.span.end, format!("{}: {read}", id.name)));
            return;
        }
        walk::walk_object_property(self, it);
    }

    fn visit_identifier_reference(&mut self, it: &IdentifierReference<'a>) {
        let Some(kind) = self.kind(it).cloned() else {
            return;
        };
        let reference = self
            .scoping
            .get_reference(it.reference_id.get().expect("resolved"));
        if reference.is_write() {
            // Assignments and updates of these are handled above; any other
            // write (destructuring, `for (x of …)`) is not supported.
            if matches!(kind, Kind::Signal) {
                self.fail(
                    format!("`{}` is state: assign it with `{} = …`", it.name, it.name),
                    it.span,
                );
            } else {
                self.not_writable(it, &kind);
            }
            return;
        }
        let text = self.read(it, &kind);
        let _ = self.code;
        self.edits.push((it.span.start, it.span.end, text));
    }

    fn visit_argument(&mut self, it: &Argument<'a>) {
        walk::walk_argument(self, it);
    }
}

/// The runtime of `$state`: a signal of the value, whose plain objects and
/// arrays are read through proxies; reading through them tracks one
/// version signal and writing through them bumps it, so `todos.push(t)` and
/// `todo.done = true` update what read `todos`.
pub(crate) const HELPERS: &str = r#"
const __nsh_raw = Symbol("nsh.raw");
function __nsh_deep(track, bump) {
  const cache = new WeakMap();
  const wrap = (v) => {
    if (v === null || typeof v !== "object") return v;
    const proto = Object.getPrototypeOf(v);
    if (proto !== Object.prototype && proto !== Array.prototype && proto !== null) return v;
    let p = cache.get(v);
    if (!p) {
      p = new Proxy(v, {
        get(t, k) {
          if (k === __nsh_raw) return t;
          track();
          return wrap(t[k]);
        },
        has(t, k) { track(); return k in t; },
        ownKeys(t) { track(); return Reflect.ownKeys(t); },
        set(t, k, value) {
          const raw = __nsh_unwrap(value);
          if (t[k] !== raw || (Array.isArray(t) && k === "length")) { t[k] = raw; bump(); }
          return true;
        },
        deleteProperty(t, k) { if (k in t) { delete t[k]; bump(); } return true; },
      });
      cache.set(v, p);
    }
    return p;
  };
  return wrap;
}
function __nsh_unwrap(v) {
  return v !== null && typeof v === "object" && v[__nsh_raw] ? v[__nsh_raw] : v;
}
function __nsh_versioned() {
  const version = __nsh_signal(0);
  let n = 0;
  return __nsh_deep(() => version(), () => version.set(++n));
}
function __nsh_state(init) {
  const value = __nsh_signal(__nsh_unwrap(init));
  const wrap = __nsh_versioned();
  const read = () => wrap(value());
  read.set = (v) => value.set(__nsh_unwrap(v));
  read.update = (f) => value.set(__nsh_unwrap(f(read())));
  return read;
}
function __nsh_proxy(init) {
  return __nsh_versioned()(__nsh_unwrap(init));
}
function __nsh_snapshot(v) {
  v = __nsh_unwrap(v);
  if (v === null || typeof v !== "object") return v;
  if (Array.isArray(v)) return v.map(__nsh_snapshot);
  const out = {};
  for (const k of Object.keys(v)) out[k] = __nsh_snapshot(v[k]);
  return out;
}
"#;

#[cfg(test)]
mod tests {
    use super::*;

    fn run(code: &str) -> String {
        rewrite(code, SourceType::tsx(), &HashSet::new()).unwrap().code
    }

    #[test]
    fn state_reads_and_writes() {
        let out = run("function C(__props) { let count = $state(0); const inc = () => { count++; count += 2; count = count * 2; }; return <T>{count}</T>; }");
        assert!(out.contains("let count = __nsh_state(0)"), "{out}");
        assert!(out.contains("(count.set(count() + 1), count() - 1)"), "{out}");
        assert!(out.contains("count.set(count() + (2))"), "{out}");
        assert!(out.contains("count.set(count() * 2)"), "{out}");
        assert!(out.contains("<T>{count()}</T>"), "{out}");
    }

    #[test]
    fn shadowed_names_are_left_alone() {
        let out = run("function C() { let n = $state(0); const f = (n) => n + 1; return n; }");
        assert!(out.contains("(n) => n + 1"), "{out}");
        assert!(out.contains("return n()"), "{out}");
    }

    #[test]
    fn derived_effect_and_shorthand() {
        let out = run("function C() { let a = $state(1); let d = $derived(a * 2); $effect(() => { console.log({ d }); }); }");
        assert!(out.contains("let d = __nsh_computed(() => (a() * 2))"), "{out}");
        assert!(out.contains("__nsh_effect(() =>"), "{out}");
        assert!(out.contains("{ d: d() }"), "{out}");
    }

    #[test]
    fn props_become_reads_of_the_props_object() {
        let out = run("function C(__props) { let { title, count = 1, 'data-x': x, ...rest } = $props(); return [title, count, x, rest]; }");
        assert!(!out.contains("$props"), "{out}");
        assert!(out.contains("__props.title"), "{out}");
        assert!(out.contains("(__props.count === undefined ? (1) : __props.count)"), "{out}");
        assert!(out.contains("__props[\"data-x\"]"), "{out}");
        assert!(out.contains(", __props]"), "{out}");
    }

    #[test]
    fn writing_derived_or_props_is_an_error() {
        let err = rewrite("function C() { let d = $derived(1); d = 2; }", SourceType::tsx(), &HashSet::new())
            .err()
            .unwrap();
        assert!(err.message.contains("$derived"), "{}", err.message);
        let err = rewrite("function C() { let { a } = $props(); a = 2; }", SourceType::tsx(), &HashSet::new())
            .err()
            .unwrap();
        assert!(err.message.contains("prop"), "{}", err.message);
    }

    #[test]
    fn const_state_is_the_proxy() {
        let r = rewrite("const s = $state({ n: 0 }); s.n++;", SourceType::ts(), &HashSet::new()).unwrap();
        assert!(r.code.contains("const s = __nsh_proxy({ n: 0 })"), "{}", r.code);
        assert!(r.code.contains("s.n++"), "{}", r.code);
        assert!(r.helpers);
    }
}
