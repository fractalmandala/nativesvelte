//! The parser of `.svelte` files: the `<script>` and `<style>` blocks and the
//! markup, as a tree of [`Node`]s whose expressions are kept as source text
//! (they are TypeScript, compiled with the rest of the module).

/// A `<script>` or `<style>` block.
#[derive(Debug, Clone)]
pub(crate) struct Block {
    /// The attributes of the opening tag, as written (`lang="ts" module`).
    pub(crate) attrs: String,
    /// What is between the tags.
    pub(crate) content: String,
}

/// A parsed `.svelte` file.
#[derive(Debug, Default)]
pub(crate) struct Document {
    /// The instance script (`<script>`), run once per component.
    pub(crate) instance: Option<Block>,
    /// The module script (`<script module>`), run once per module.
    pub(crate) module: Option<Block>,
    /// `<style>` blocks (not supported: NSH styles with classes).
    pub(crate) styles: Vec<Block>,
    /// The markup.
    pub(crate) nodes: Vec<Node>,
}

#[allow(dead_code)]
#[derive(Debug, Clone)]
pub(crate) enum Node {
    /// `<name attrs>children</name>`; the name as written.
    Element {
        name: String,
        attrs: Vec<Attr>,
        children: Vec<Node>,
        offset: usize,
    },
    /// Text between tags, HTML entities included.
    Text(String),
    /// `{expr}`.
    Expr(String),
    /// `{#if a}…{:else if b}…{:else}…{/if}`.
    If {
        branches: Vec<(String, Vec<Node>)>,
        otherwise: Option<Vec<Node>>,
    },
    /// `{#each of as pattern, index (key)}…{:else}…{/each}`.
    Each {
        of: String,
        pattern: Option<String>,
        index: Option<String>,
        key: Option<String>,
        body: Vec<Node>,
        otherwise: Option<Vec<Node>>,
    },
    /// `{#snippet name(params)}…{/snippet}`.
    Snippet {
        name: String,
        params: String,
        body: Vec<Node>,
    },
    /// `{@render expr}`.
    Render(String),
}

#[derive(Debug, Clone)]
pub(crate) enum Attr {
    /// `name="text"`, `name='text'` or `name=text`.
    Static(String, String),
    /// `name` alone.
    Bool(String),
    /// `name={expr}`.
    Expr(String, String),
    /// `name="text {expr} text"`.
    Template(String, Vec<Part>),
    /// `{name}`.
    Shorthand(String),
    /// `{...expr}`.
    Spread(String),
}

#[allow(dead_code)]
impl Attr {
    pub(crate) fn name(&self) -> Option<&str> {
        match self {
            Attr::Static(n, _)
            | Attr::Bool(n)
            | Attr::Expr(n, _)
            | Attr::Template(n, _)
            | Attr::Shorthand(n) => Some(n),
            Attr::Spread(_) => None,
        }
    }
}

/// A piece of a quoted attribute value.
#[derive(Debug, Clone)]
pub(crate) enum Part {
    Text(String),
    Expr(String),
}

/// A parse error: its message and its byte offset in the file.
#[derive(Debug, Clone)]
pub(crate) struct ParseError {
    pub(crate) message: String,
    pub(crate) offset: usize,
}

type Result<T> = std::result::Result<T, ParseError>;

/// Elements without content in HTML: `<img>` closes itself.
const VOID: &[&str] = &[
    "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track",
    "wbr",
];

pub(crate) fn parse(source: &str) -> Result<Document> {
    let mut p = Parser {
        s: source,
        b: source.as_bytes(),
        i: 0,
    };
    let mut doc = Document::default();
    let (nodes, stop) = p.fragment(&mut Some(&mut doc), None)?;
    if let Some(stop) = stop {
        return Err(p.error_at(format!("unexpected `{stop}`"), p.i));
    }
    doc.nodes = nodes;
    Ok(doc)
}

struct Parser<'s> {
    s: &'s str,
    b: &'s [u8],
    i: usize,
}

/// What ended a fragment: a closing tag or a block clause (`{:else}`,
/// `{/if}`), which the caller reads.
#[derive(Debug)]
enum Stop {
    Close(String),
    Clause(String),
}

impl std::fmt::Display for Stop {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Stop::Close(n) => write!(f, "</{n}>"),
            Stop::Clause(c) => write!(f, "{{{c}}}"),
        }
    }
}

impl<'s> Parser<'s> {
    fn error_at(&self, message: impl Into<String>, offset: usize) -> ParseError {
        ParseError {
            message: message.into(),
            offset,
        }
    }

    fn starts_with(&self, s: &str) -> bool {
        self.s[self.i..].starts_with(s)
    }

    fn skip_ws(&mut self) {
        while self.i < self.b.len() && self.b[self.i].is_ascii_whitespace() {
            self.i += 1;
        }
    }

    /// Nodes up to the end of the file, a closing tag or a block clause.
    /// `doc` is set at the top level, where `<script>` and `<style>` go.
    fn fragment(
        &mut self,
        doc: &mut Option<&mut Document>,
        parent: Option<&str>,
    ) -> Result<(Vec<Node>, Option<Stop>)> {
        let mut nodes = Vec::new();
        let mut text = String::new();
        let flush = |text: &mut String, nodes: &mut Vec<Node>| {
            if !text.is_empty() {
                nodes.push(Node::Text(std::mem::take(text)));
            }
        };
        while self.i < self.b.len() {
            if self.starts_with("<!--") {
                let end = self.s[self.i..]
                    .find("-->")
                    .ok_or_else(|| self.error_at("unclosed comment", self.i))?;
                self.i += end + 3;
                continue;
            }
            if self.starts_with("</") {
                flush(&mut text, &mut nodes);
                let at = self.i;
                self.i += 2;
                let name = self.tag_name();
                self.skip_ws();
                if !self.starts_with(">") {
                    return Err(self.error_at("expected `>`", self.i));
                }
                self.i += 1;
                if parent.is_none() {
                    return Err(self.error_at(format!("`</{name}>` closes nothing"), at));
                }
                return Ok((nodes, Some(Stop::Close(name))));
            }
            if self.b[self.i] == b'<'
                && self
                    .b
                    .get(self.i + 1)
                    .is_some_and(|c| c.is_ascii_alphabetic())
            {
                flush(&mut text, &mut nodes);
                let at = self.i;
                self.i += 1;
                let name = self.tag_name();
                if (name == "script" || name == "style")
                    && let Some(doc) = doc.as_deref_mut()
                {
                    let block = self.raw_block(&name, at)?;
                    if name == "style" {
                        doc.styles.push(block);
                    } else if has_word(&block.attrs, "module") || block.attrs.contains("context=")
                    {
                        doc.module = Some(block);
                    } else {
                        doc.instance = Some(block);
                    }
                    continue;
                }
                nodes.push(self.element(name, at)?);
                continue;
            }
            if self.b[self.i] == b'{' {
                flush(&mut text, &mut nodes);
                let at = self.i;
                let close = find_close(self.s, self.i + 1)
                    .ok_or_else(|| self.error_at("unclosed `{`", at))?;
                let inner = self.s[self.i + 1..close].trim().to_owned();
                self.i = close + 1;
                match inner.as_bytes().first() {
                    Some(b'#') => nodes.push(self.block(&inner[1..], at)?),
                    Some(b':') | Some(b'/') => return Ok((nodes, Some(Stop::Clause(inner)))),
                    Some(b'@') => {
                        let (tag, rest) = split_word(&inner[1..]);
                        match tag {
                            "render" => nodes.push(Node::Render(rest.trim().to_owned())),
                            "debug" => {}
                            other => {
                                return Err(self.error_at(
                                    format!("`{{@{other}}}` is not supported in NSH apps"),
                                    at,
                                ));
                            }
                        }
                    }
                    _ => nodes.push(Node::Expr(inner)),
                }
                continue;
            }
            let start = self.i;
            while self.i < self.b.len() && self.b[self.i] != b'<' && self.b[self.i] != b'{' {
                self.i += 1;
            }
            text.push_str(&self.s[start..self.i]);
        }
        flush(&mut text, &mut nodes);
        Ok((nodes, None))
    }

    fn tag_name(&mut self) -> String {
        let start = self.i;
        while self.i < self.b.len()
            && (self.b[self.i].is_ascii_alphanumeric() || matches!(self.b[self.i], b'-' | b':' | b'.' | b'_'))
        {
            self.i += 1;
        }
        self.s[start..self.i].to_owned()
    }

    /// The rest of `<script …>…</script>` (or `<style>`), its content raw.
    fn raw_block(&mut self, name: &str, at: usize) -> Result<Block> {
        let end = self.s[self.i..]
            .find('>')
            .ok_or_else(|| self.error_at(format!("unclosed <{name}>"), at))?;
        let attrs = self.s[self.i..self.i + end].trim().to_owned();
        self.i += end + 1;
        let close = format!("</{name}>");
        let end = self.s[self.i..]
            .find(&close)
            .ok_or_else(|| self.error_at(format!("no `{close}`"), at))?;
        let content = self.s[self.i..self.i + end].to_owned();
        self.i += end + close.len();
        Ok(Block { attrs, content })
    }

    fn element(&mut self, name: String, offset: usize) -> Result<Node> {
        let mut attrs = Vec::new();
        loop {
            self.skip_ws();
            if self.i >= self.b.len() {
                return Err(self.error_at(format!("unclosed <{name}>"), offset));
            }
            if self.starts_with("/>") {
                self.i += 2;
                return Ok(Node::Element {
                    name,
                    attrs,
                    children: Vec::new(),
                    offset,
                });
            }
            if self.starts_with(">") {
                self.i += 1;
                break;
            }
            attrs.push(self.attr()?);
        }
        if VOID.contains(&name.as_str()) {
            return Ok(Node::Element {
                name,
                attrs,
                children: Vec::new(),
                offset,
            });
        }
        let (children, stop) = self.fragment(&mut None, Some(&name))?;
        match stop {
            Some(Stop::Close(n)) if n == name => Ok(Node::Element {
                name,
                attrs,
                children,
                offset,
            }),
            Some(other) => Err(self.error_at(
                format!("<{name}> is closed by `{other}`"),
                self.i,
            )),
            None => Err(self.error_at(format!("unclosed <{name}>"), offset)),
        }
    }

    fn attr(&mut self) -> Result<Attr> {
        let at = self.i;
        if self.b[self.i] == b'{' {
            let close = find_close(self.s, self.i + 1)
                .ok_or_else(|| self.error_at("unclosed `{`", at))?;
            let inner = self.s[self.i + 1..close].trim().to_owned();
            self.i = close + 1;
            return Ok(match inner.strip_prefix("...") {
                Some(spread) => Attr::Spread(spread.trim().to_owned()),
                None => Attr::Shorthand(inner),
            });
        }
        let start = self.i;
        while self.i < self.b.len()
            && !self.b[self.i].is_ascii_whitespace()
            && !matches!(self.b[self.i], b'=' | b'>' | b'/' | b'{' | b'"' | b'\'')
        {
            self.i += 1;
        }
        let name = self.s[start..self.i].to_owned();
        if name.is_empty() {
            return Err(self.error_at("expected an attribute", at));
        }
        self.skip_ws();
        if !self.starts_with("=") {
            return Ok(Attr::Bool(name));
        }
        self.i += 1;
        self.skip_ws();
        match self.b.get(self.i) {
            Some(b'{') => {
                let close = find_close(self.s, self.i + 1)
                    .ok_or_else(|| self.error_at("unclosed `{`", self.i))?;
                let expr = self.s[self.i + 1..close].trim().to_owned();
                self.i = close + 1;
                Ok(Attr::Expr(name, expr))
            }
            Some(&q @ (b'"' | b'\'')) => {
                self.i += 1;
                let mut parts = Vec::new();
                let mut text = String::new();
                loop {
                    let Some(&c) = self.b.get(self.i) else {
                        return Err(self.error_at("unclosed attribute value", at));
                    };
                    if c == q {
                        self.i += 1;
                        break;
                    }
                    if c == b'{' {
                        let close = find_close(self.s, self.i + 1)
                            .ok_or_else(|| self.error_at("unclosed `{`", self.i))?;
                        if !text.is_empty() {
                            parts.push(Part::Text(std::mem::take(&mut text)));
                        }
                        parts.push(Part::Expr(self.s[self.i + 1..close].trim().to_owned()));
                        self.i = close + 1;
                        continue;
                    }
                    let ch = self.s[self.i..].chars().next().expect("in bounds");
                    text.push(ch);
                    self.i += ch.len_utf8();
                }
                if !text.is_empty() {
                    parts.push(Part::Text(text));
                }
                Ok(match parts.as_slice() {
                    [] => Attr::Static(name, String::new()),
                    [Part::Text(t)] => Attr::Static(name, t.clone()),
                    [Part::Expr(e)] => Attr::Expr(name, e.clone()),
                    _ => Attr::Template(name, parts),
                })
            }
            _ => {
                let start = self.i;
                while self.i < self.b.len()
                    && !self.b[self.i].is_ascii_whitespace()
                    && !matches!(self.b[self.i], b'>')
                    && !self.starts_with("/>")
                {
                    self.i += 1;
                }
                Ok(Attr::Static(name, self.s[start..self.i].to_owned()))
            }
        }
    }

    /// A block after its `{#`: `if …`, `each …`, `snippet …`.
    fn block(&mut self, header: &str, at: usize) -> Result<Node> {
        let (kind, rest) = split_word(header);
        let rest = rest.trim();
        match kind {
            "if" => {
                let mut branches = Vec::new();
                let mut cond = rest.to_owned();
                loop {
                    let (body, stop) = self.fragment(&mut None, Some("if"))?;
                    branches.push((cond, body));
                    match stop {
                        Some(Stop::Clause(c)) if c == "/if" => {
                            return Ok(Node::If {
                                branches,
                                otherwise: None,
                            });
                        }
                        Some(Stop::Clause(c)) if c.starts_with(":else") => {
                            let after = c[5..].trim();
                            if let Some(next) = after.strip_prefix("if ") {
                                cond = next.trim().to_owned();
                                continue;
                            }
                            let (body, stop) = self.fragment(&mut None, Some("if"))?;
                            match stop {
                                Some(Stop::Clause(c)) if c == "/if" => {
                                    return Ok(Node::If {
                                        branches,
                                        otherwise: Some(body),
                                    });
                                }
                                _ => return Err(self.error_at("expected `{/if}`", at)),
                            }
                        }
                        _ => return Err(self.error_at("`{#if}` is not closed by `{/if}`", at)),
                    }
                }
            }
            "each" => {
                let (of, pattern, index, key) = each_header(rest)
                    .ok_or_else(|| self.error_at(format!("cannot read `{{#each {rest}}}`"), at))?;
                let (body, stop) = self.fragment(&mut None, Some("each"))?;
                let otherwise = match stop {
                    Some(Stop::Clause(c)) if c == "/each" => None,
                    Some(Stop::Clause(c)) if c == ":else" => {
                        let (body, stop) = self.fragment(&mut None, Some("each"))?;
                        match stop {
                            Some(Stop::Clause(c)) if c == "/each" => Some(body),
                            _ => return Err(self.error_at("expected `{/each}`", at)),
                        }
                    }
                    _ => return Err(self.error_at("`{#each}` is not closed by `{/each}`", at)),
                };
                Ok(Node::Each {
                    of,
                    pattern,
                    index,
                    key,
                    body,
                    otherwise,
                })
            }
            "snippet" => {
                let open = rest
                    .find('(')
                    .ok_or_else(|| self.error_at("a snippet is `{#snippet name(params)}`", at))?;
                let name = rest[..open].trim().to_owned();
                let params = rest[open + 1..rest.rfind(')').unwrap_or(rest.len())]
                    .trim()
                    .to_owned();
                let (body, stop) = self.fragment(&mut None, Some("snippet"))?;
                match stop {
                    Some(Stop::Clause(c)) if c == "/snippet" => Ok(Node::Snippet { name, params, body }),
                    _ => Err(self.error_at("`{#snippet}` is not closed by `{/snippet}`", at)),
                }
            }
            other => Err(self.error_at(
                format!("`{{#{other}}}` is not supported in NSH apps (supported: if, each, snippet)"),
                at,
            )),
        }
    }
}

/// The first word of `s` and the rest.
fn split_word(s: &str) -> (&str, &str) {
    let end = s
        .find(|c: char| c.is_whitespace())
        .unwrap_or(s.len());
    (&s[..end], &s[end..])
}

fn has_word(s: &str, word: &str) -> bool {
    s.split(|c: char| c.is_whitespace() || c == '=')
        .any(|w| w == word)
}

/// `items as item, i (key)`: the list, the item pattern, the index and the
/// key. `items` alone (and `items, i`) has no pattern.
#[allow(clippy::type_complexity)]
fn each_header(s: &str) -> Option<(String, Option<String>, Option<String>, Option<String>)> {
    let Some(as_at) = find_top_level(s, " as ") else {
        // `{#each items}` / `{#each items, i}`.
        let parts = split_top_level(s, ',');
        let of = parts.first()?.trim().to_owned();
        let index = parts.get(1).map(|i| i.trim().to_owned());
        return Some((of, None, index, None));
    };
    let of = s[..as_at].trim().to_owned();
    let mut rest = s[as_at + 4..].trim();
    let mut key = None;
    if rest.ends_with(')') {
        // The key is the last parenthesized group at the top level.
        let bytes = rest.as_bytes();
        let mut depth = 0i32;
        let mut open = None;
        for (i, &c) in bytes.iter().enumerate().rev() {
            match c {
                b')' => depth += 1,
                b'(' => {
                    depth -= 1;
                    if depth == 0 {
                        open = Some(i);
                        break;
                    }
                }
                _ => {}
            }
        }
        let open = open?;
        // `(a, b) …` destructuring with parens is not a thing; a key needs
        // something before it.
        if open > 0 {
            key = Some(rest[open + 1..rest.len() - 1].trim().to_owned());
            rest = rest[..open].trim();
        }
    }
    let parts = split_top_level(rest, ',');
    let pattern = parts.first()?.trim().to_owned();
    let index = parts.get(1).map(|i| i.trim().to_owned());
    Some((of, Some(pattern), index, key))
}

/// The first `needle` in `s` outside brackets and strings.
fn find_top_level(s: &str, needle: &str) -> Option<usize> {
    let b = s.as_bytes();
    let mut depth = 0i32;
    let mut i = 0;
    while i < b.len() {
        match b[i] {
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            b'"' | b'\'' | b'`' => {
                i = skip_string(s, i);
                continue;
            }
            _ if depth == 0 && s[i..].starts_with(needle) => return Some(i),
            _ => {}
        }
        i += 1;
    }
    None
}

fn split_top_level(s: &str, sep: char) -> Vec<&str> {
    let b = s.as_bytes();
    let mut out = Vec::new();
    let mut depth = 0i32;
    let mut start = 0;
    let mut i = 0;
    while i < b.len() {
        match b[i] {
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            b'"' | b'\'' | b'`' => {
                i = skip_string(s, i);
                continue;
            }
            c if depth == 0 && c == sep as u8 => {
                out.push(&s[start..i]);
                start = i + 1;
            }
            _ => {}
        }
        i += 1;
    }
    out.push(&s[start..]);
    out
}

/// The index after the string (or template literal) starting at `i`.
fn skip_string(s: &str, i: usize) -> usize {
    let b = s.as_bytes();
    let q = b[i];
    let mut j = i + 1;
    while j < b.len() {
        match b[j] {
            b'\\' => j += 2,
            c if c == q => return j + 1,
            b'$' if q == b'`' && b.get(j + 1) == Some(&b'{') => {
                j = match find_close(s, j + 2) {
                    Some(close) => close + 1,
                    None => return b.len(),
                };
            }
            _ => j += 1,
        }
    }
    b.len()
}

/// The index of the `}` closing the expression that starts at `i` (just
/// after its `{`), skipping strings, template literals, comments and nested
/// braces.
pub(crate) fn find_close(s: &str, mut i: usize) -> Option<usize> {
    let b = s.as_bytes();
    let mut depth = 0u32;
    while i < b.len() {
        match b[i] {
            b'"' | b'\'' | b'`' => {
                i = skip_string(s, i);
                continue;
            }
            b'/' if b.get(i + 1) == Some(&b'/') => {
                while i < b.len() && b[i] != b'\n' {
                    i += 1;
                }
                continue;
            }
            b'/' if b.get(i + 1) == Some(&b'*') => {
                i = s[i + 2..].find("*/").map_or(b.len(), |e| i + 2 + e + 2);
                continue;
            }
            b'{' => depth += 1,
            b'}' => {
                if depth == 0 {
                    return Some(i);
                }
                depth -= 1;
            }
            _ => {}
        }
        i += 1;
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_scripts_markup_and_blocks() {
        let doc = parse(
            r#"<script lang="ts">
  let count = $state(0);
</script>

<div class="p-4 {extra}" onclick={() => count++}>
  <!-- a comment -->
  <p>Count: {count}</p>
  {#if count > 1}
    <span>many</span>
  {:else if count === 1}
    <span>one</span>
  {:else}
    <span>none</span>
  {/if}
  {#each items as { id, title }, i (id)}
    <Row {title} {...rest} disabled />
  {:else}
    <p>empty</p>
  {/each}
  <img src="a.png">
</div>
<style>p { color: red }</style>
"#,
        )
        .unwrap();
        assert!(doc.instance.unwrap().content.contains("$state(0)"));
        assert_eq!(doc.styles.len(), 1);
        let Node::Element { name, attrs, children, .. } = doc
            .nodes
            .iter()
            .find(|n| matches!(n, Node::Element { .. }))
            .unwrap()
        else {
            unreachable!()
        };
        assert_eq!(name, "div");
        assert!(matches!(&attrs[0], Attr::Template(n, parts) if n == "class" && parts.len() == 2));
        assert!(matches!(&attrs[1], Attr::Expr(n, e) if n == "onclick" && e == "() => count++"));
        let ifs: Vec<_> = children.iter().filter(|n| matches!(n, Node::If { .. })).collect();
        let Node::If { branches, otherwise } = ifs[0] else { unreachable!() };
        assert_eq!(branches.len(), 2);
        assert_eq!(branches[1].0, "count === 1");
        assert!(otherwise.is_some());
        let each = children.iter().find(|n| matches!(n, Node::Each { .. })).unwrap();
        let Node::Each { of, pattern, index, key, otherwise, .. } = each else { unreachable!() };
        assert_eq!(of, "items");
        assert_eq!(pattern.as_deref(), Some("{ id, title }"));
        assert_eq!(index.as_deref(), Some("i"));
        assert_eq!(key.as_deref(), Some("id"));
        assert!(otherwise.is_some());
        assert!(children.iter().any(|n| matches!(n, Node::Element { name, .. } if name == "img")));
    }

    #[test]
    fn braces_in_strings_and_templates_do_not_close() {
        let doc = parse("<p>{fmt(`}${a + `{`}`, '}')}</p>").unwrap();
        let Node::Element { children, .. } = &doc.nodes[0] else { unreachable!() };
        assert!(matches!(&children[0], Node::Expr(e) if e == "fmt(`}${a + `{`}`, '}')"));
    }

    #[test]
    fn errors_name_the_problem() {
        assert!(parse("<div>").unwrap_err().message.contains("unclosed <div>"));
        assert!(parse("{#await p}{/await}").unwrap_err().message.contains("not supported"));
        assert!(parse("<a></b>").unwrap_err().message.contains("closed by"));
    }
}
