//! Lowers a parsed Svelte [`Document`] to TSX targeting NSH's JSX compiler.
//!
//! 1. HTML elements map to NSH primitives (`div` -> `View`, `p` / `span` -> `Text`,
//!    `input` -> `Input`, `img` -> `Image`, `button` -> `View` with button role).
//! 2. Loose text / expressions inside views are wrapped in `<Text>`.
//! 3. Svelte control flow (`{#if}`, `{#each}`) becomes `<If>` and `<Each>`.
//! 4. Svelte event directives (`onclick`, `on:click`) become NSH events (`onPress`).
//! 5. Two-way bindings (`bind:value={x}`) become value + onChange handlers.
//! 6. Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`) are rewritten
//!    to NSH's native reactive graph.

use std::collections::HashSet;

use oxc::{
    allocator::Allocator,
    parser::Parser,
    span::{GetSpan, SourceType},
};

use super::{
    runes::{self, HELPERS},
    template::{Attr, Document, Node, Part},
};

#[allow(dead_code)]
pub(crate) struct LowerOutput {
    pub(crate) tsx: String,
    pub(crate) component_name: String,
}

pub(crate) fn lower_to_tsx(
    doc: &Document,
    file_name: &str,
    is_entry: bool,
) -> Result<LowerOutput, String> {
    let component_name = derive_component_name(file_name);
    let mut module_code = String::new();
    if let Some(m) = &doc.module {
        module_code.push_str(&m.content);
        module_code.push('\n');
    }

    let mut top_level_imports = String::new();
    let mut instance_code = String::new();
    if let Some(inst) = &doc.instance {
        let allocator = Allocator::default();
        let parsed = Parser::new(&allocator, &inst.content, SourceType::ts()).parse();
        if parsed.diagnostics.is_empty() {
            for stmt in &parsed.program.body {
                let span = stmt.span();
                let text = &inst.content[span.start as usize..span.end as usize];
                if matches!(stmt, oxc::ast::ast::Statement::ImportDeclaration(_)) {
                    top_level_imports.push_str(text);
                    top_level_imports.push('\n');
                } else {
                    instance_code.push_str(text);
                    instance_code.push('\n');
                }
            }
        } else {
            for line in inst.content.lines() {
                let trimmed = line.trim();
                if trimmed.starts_with("import ") || trimmed.starts_with("import{") {
                    top_level_imports.push_str(line);
                    top_level_imports.push('\n');
                } else {
                    instance_code.push_str(line);
                    instance_code.push('\n');
                }
            }
        }
    }

    let mut used_nsh_primitives = HashSet::new();
    let mut markup_buf = String::new();

    // Lower snippets first as local functions inside the component
    for node in &doc.nodes {
        if let Node::Snippet { name, params, body } = node {
            markup_buf.push_str(&format!("const {name} = ({params}) => (\n"));
            lower_nodes(body, &mut markup_buf, &mut used_nsh_primitives, false);
            markup_buf.push_str(");\n");
        }
    }

    // Lower the main template nodes
    let non_snippet_nodes: Vec<_> = doc
        .nodes
        .iter()
        .filter(|n| !matches!(n, Node::Snippet { .. }))
        .cloned()
        .collect();

    let root_markup = if non_snippet_nodes.is_empty() {
        "<View />".to_string()
    } else if non_snippet_nodes.len() == 1 {
        let mut buf = String::new();
        lower_node(&non_snippet_nodes[0], &mut buf, &mut used_nsh_primitives, false);
        buf
    } else {
        // Group multiple root nodes in a View
        used_nsh_primitives.insert("View");
        let mut buf = String::new();
        buf.push_str("<View>\n");
        lower_nodes(&non_snippet_nodes, &mut buf, &mut used_nsh_primitives, false);
        buf.push_str("</View>\n");
        buf
    };

    // Construct un-rewritten TSX
    let mut raw_tsx = String::new();
    raw_tsx.push_str(&module_code);
    raw_tsx.push_str("\n");
    raw_tsx.push_str(&top_level_imports);
    raw_tsx.push_str("\n");
    raw_tsx.push_str(&format!("export default function {component_name}(__props: Record<string, any> = {{}}) {{\n"));
    raw_tsx.push_str(&instance_code);
    raw_tsx.push_str("\n");
    raw_tsx.push_str(&markup_buf);
    raw_tsx.push_str("\n  return (\n");
    raw_tsx.push_str(&root_markup);
    raw_tsx.push_str("\n  );\n}\n");

    if is_entry {
        raw_tsx.push_str(&format!("\nmount({component_name});\n"));
        used_nsh_primitives.insert("mount");
    }

    // Rewrite runes
    let rewritten = runes::rewrite(&raw_tsx, SourceType::tsx(), &HashSet::new())
        .map_err(|e| format!("{file_name}:{}: rune error: {}", e.offset, e.message))?;

    // Inject imports from "nsh"
    let mut imports = Vec::new();
    // Default primitives
    used_nsh_primitives.insert("View");
    used_nsh_primitives.insert("Text");

    let mut import_items: Vec<_> = used_nsh_primitives
        .into_iter()
        .filter(|&p| p != "If" && p != "Each")
        .collect();
    import_items.sort();
    imports.push(format!(
        "import {{ {} }} from \"nsh\";",
        import_items.join(", ")
    ));
    imports.push("import { signal as __nsh_signal, computed as __nsh_computed, effect as __nsh_effect } from \"nsh\";".to_string());

    let mut final_code = String::new();
    for imp in imports {
        final_code.push_str(&imp);
        final_code.push('\n');
    }

    if rewritten.helpers {
        final_code.push_str(HELPERS);
        final_code.push('\n');
    }

    final_code.push_str(&rewritten.code);

    Ok(LowerOutput {
        tsx: final_code,
        component_name,
    })
}

fn derive_component_name(file_name: &str) -> String {
    let stem = std::path::Path::new(file_name)
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("Component");
    let clean: String = stem
        .chars()
        .filter(|c| c.is_ascii_alphanumeric() || *c == '_')
        .collect();
    if clean.is_empty() || clean.starts_with(|c: char| c.is_ascii_digit()) {
        "SvelteComponent".to_string()
    } else {
        // Uppercase first char
        let mut chars = clean.chars();
        match chars.next() {
            None => "SvelteComponent".to_string(),
            Some(first) => first.to_uppercase().collect::<String>() + chars.as_str(),
        }
    }
}

fn is_text_container(tag: &str) -> bool {
    matches!(
        tag,
        "Text"
            | "p"
            | "span"
            | "h1"
            | "h2"
            | "h3"
            | "h4"
            | "h5"
            | "h6"
            | "label"
            | "b"
            | "strong"
            | "i"
            | "em"
            | "small"
            | "code"
    )
}

fn map_html_tag<'a>(tag: &'a str, used: &mut HashSet<&'static str>) -> (&'a str, Option<&'static str>) {
    match tag {
        "div" | "section" | "article" | "header" | "footer" | "main" | "nav" | "aside" => {
            used.insert("View");
            ("View", None)
        }
        "p" | "span" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "label" | "b" | "strong"
        | "i" | "em" | "small" | "code" => {
            used.insert("Text");
            ("Text", None)
        }
        "button" => {
            used.insert("View");
            ("View", Some("role=\"button\""))
        }
        "input" => {
            used.insert("Input");
            ("Input", None)
        }
        "img" => {
            used.insert("Image");
            ("Image", None)
        }
        "a" => {
            used.insert("Text");
            ("Text", None)
        }
        other => (other, None),
    }
}

fn lower_nodes(
    nodes: &[Node],
    out: &mut String,
    used: &mut HashSet<&'static str>,
    in_text: bool,
) {
    let mut i = 0;
    while i < nodes.len() {
        let node = &nodes[i];
        if !in_text && is_loose_inline(node) {
            // Group consecutive inline text/expr nodes into a <Text> element
            used.insert("Text");
            out.push_str("<Text>");
            while i < nodes.len() && is_loose_inline(&nodes[i]) {
                lower_inline(&nodes[i], out);
                i += 1;
            }
            out.push_str("</Text>\n");
        } else {
            lower_node(node, out, used, in_text);
            i += 1;
        }
    }
}

fn is_loose_inline(node: &Node) -> bool {
    match node {
        Node::Text(t) => !t.trim().is_empty(),
        Node::Expr(_) => true,
        _ => false,
    }
}

fn lower_inline(node: &Node, out: &mut String) {
    match node {
        Node::Text(t) => out.push_str(t),
        Node::Expr(e) => {
            out.push('{');
            out.push_str(e);
            out.push('}');
        }
        _ => {}
    }
}

fn lower_node(
    node: &Node,
    out: &mut String,
    used: &mut HashSet<&'static str>,
    in_text: bool,
) {
    match node {
        Node::Text(t) => {
            if in_text {
                out.push_str(t);
            } else if !t.trim().is_empty() {
                used.insert("Text");
                out.push_str("<Text>");
                out.push_str(t);
                out.push_str("</Text>\n");
            }
        }
        Node::Expr(e) => {
            if in_text {
                out.push('{');
                out.push_str(e);
                out.push('}');
            } else {
                used.insert("Text");
                out.push_str("<Text>{");
                out.push_str(e);
                out.push_str("}</Text>\n");
            }
        }
        Node::Element {
            name,
            attrs,
            children,
            ..
        } if name == "slot" => {
            if children.is_empty() {
                out.push_str("{(__props.children ? __props.children : null)}\n");
            } else {
                out.push_str("{(__props.children ? __props.children : (\n<>\n");
                lower_nodes(children, out, used, in_text);
                out.push_str("</>\n))}\n");
            }
        }
        Node::Element {
            name,
            attrs,
            children,
            ..
        } => {
            let is_container_text = is_text_container(name);
            let (target_tag, extra_attr) = map_html_tag(name, used);

            out.push('<');
            out.push_str(target_tag);
            if let Some(extra) = extra_attr {
                out.push(' ');
                out.push_str(extra);
            }

            for attr in attrs {
                out.push(' ');
                lower_attr(attr, out);
            }

            if children.is_empty() {
                out.push_str(" />\n");
            } else {
                out.push('>');
                lower_nodes(children, out, used, is_container_text);
                out.push_str("</");
                out.push_str(target_tag);
                out.push_str(">\n");
            }
        }
        Node::If {
            branches,
            otherwise,
        } => {
            used.insert("If");
            lower_if_chain(branches, otherwise, out, used, in_text);
        }
        Node::Each {
            of,
            pattern,
            index,
            key,
            body,
            otherwise: _,
        } => {
            used.insert("Each");
            let pattern = pattern.as_deref().unwrap_or("item");
            let index = index.as_deref().unwrap_or("index");

            out.push_str(&format!("<Each of={{{of}}}"));
            if let Some(k) = key {
                // If key is a simple ident e.g. (id) or (item.id)
                if k.contains('(') || k.contains('.') {
                    out.push_str(&format!(" key={{({pattern}) => {k}}}"));
                } else {
                    out.push_str(&format!(" key={{({pattern}) => {pattern}.{k}}}"));
                }
            }
            out.push_str(&format!(">{{({pattern}, {index}) => (\n"));
            out.push_str("<>\n");
            lower_nodes(body, out, used, in_text);
            out.push_str("</>\n");
            out.push_str(")}</Each>\n");
        }
        Node::Render(expr) => {
            out.push_str(&format!("{{{expr}}}\n"));
        }
        Node::Snippet { .. } => {}
    }
}

fn lower_if_chain(
    branches: &[(String, Vec<Node>)],
    otherwise: &Option<Vec<Node>>,
    out: &mut String,
    used: &mut HashSet<&'static str>,
    in_text: bool,
) {
    if branches.is_empty() {
        if let Some(other) = otherwise {
            lower_nodes(other, out, used, in_text);
        }
        return;
    }

    let (cond, body) = &branches[0];
    let remaining = &branches[1..];

    out.push_str(&format!("<If when={{{cond}}}"));

    if remaining.is_empty() {
        if let Some(other) = otherwise {
            out.push_str(" else={<>\n");
            lower_nodes(other, out, used, in_text);
            out.push_str("</>}\n");
        }
    } else {
        out.push_str(" else={\n");
        lower_if_chain(remaining, otherwise, out, used, in_text);
        out.push_str("}\n");
    }

    out.push_str("><>\n");
    lower_nodes(body, out, used, in_text);
    out.push_str("</></If>\n");
}

fn lower_attr(attr: &Attr, out: &mut String) {
    match attr {
        Attr::Static(name, val) => {
            let (mapped_name, mapped_val) = map_attr_name_val(name, val);
            out.push_str(&mapped_name);
            out.push_str("=\"");
            out.push_str(&mapped_val);
            out.push('"');
        }
        Attr::Bool(name) => {
            let (mapped_name, _) = map_attr_name_val(name, "");
            out.push_str(&mapped_name);
        }
        Attr::Expr(name, expr) => {
            if let Some(target) = name.strip_prefix("bind:") {
                // Two-way binding for inputs
                match target {
                    "value" => {
                        out.push_str(&format!("value={{{expr}}} onChange={{({{ value }}) => {expr} = value}}"));
                    }
                    "checked" => {
                        out.push_str(&format!("checked={{{expr}}} onChange={{({{ checked }}) => {expr} = checked}}"));
                    }
                    other => {
                        out.push_str(&format!("{other}={{{expr}}}"));
                    }
                }
                return;
            }

            let (mapped_name, _) = map_attr_name_val(name, "");
            out.push_str(&mapped_name);
            out.push_str("={");
            out.push_str(expr);
            out.push('}');
        }
        Attr::Shorthand(name) => {
            out.push_str(name);
            out.push_str("={");
            out.push_str(name);
            out.push('}');
        }
        Attr::Spread(expr) => {
            out.push_str("{...");
            out.push_str(expr);
            out.push('}');
        }
        Attr::Template(name, parts) => {
            let (mapped_name, _) = map_attr_name_val(name, "");
            out.push_str(&mapped_name);
            out.push_str("={`");
            for part in parts {
                match part {
                    Part::Text(t) => out.push_str(t),
                    Part::Expr(e) => {
                        out.push_str("${");
                        out.push_str(e);
                        out.push('}');
                    }
                }
            }
            out.push_str("`}");
        }
    }
}

fn map_attr_name_val<'a>(name: &'a str, val: &'a str) -> (String, String) {
    let clean_name = if let Some(ev) = name.strip_prefix("on:") {
        format!("on{ev}")
    } else {
        name.to_string()
    };

    match clean_name.to_ascii_lowercase().as_str() {
        "onclick" | "onpress" => ("onPress".to_string(), val.to_string()),
        "oninput" | "onchange" => ("onChange".to_string(), val.to_string()),
        "class" => ("class".to_string(), val.to_string()),
        _ => (clean_name, val.to_string()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::svelte::template::parse;

    #[test]
    fn lowers_counter_svelte_to_valid_tsx() {
        let svelte = r#"<script>
  let count = $state(0);
  let double = $derived(count * 2);
  function inc() { count++; }
</script>

<div class="p-4 bg-white">
  <h1>Counter</h1>
  <p>Count is: {count}, Double is: {double}</p>
  <button onclick={inc}>Increment</button>
  {#if count > 5}
    <span>High!</span>
  {:else}
    <span>Keep going</span>
  {/if}
</div>
"#;
        let doc = parse(svelte).unwrap();
        let lowered = lower_to_tsx(&doc, "Counter.svelte", false).unwrap();
        assert!(lowered.tsx.contains("function Counter("), "{}", lowered.tsx);
        assert!(lowered.tsx.contains("let count = __nsh_state(0)"), "{}", lowered.tsx);
        assert!(lowered.tsx.contains("let double = __nsh_computed(() => (count() * 2))"), "{}", lowered.tsx);
        assert!(lowered.tsx.contains("onPress={inc}"), "{}", lowered.tsx);
        assert!(lowered.tsx.contains("<View class=\"p-4 bg-white\">"), "{}", lowered.tsx);
        assert!(lowered.tsx.contains("<Text>High!</Text>"), "{}", lowered.tsx);
        assert!(lowered.tsx.contains("<If when={count() > 5}"), "{}", lowered.tsx);
    }
}
