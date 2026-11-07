//! SvelteKit file-based routing generator for NSH apps.
//!
//! Scans `src/routes` (or `routes`) and generates the root router module
//! connecting `+layout.svelte`, `+page.svelte`, parameters `[id]`, and
//! stores (`$app/stores`, `$app/navigation`).

use std::{
    collections::HashMap,
    path::{Path, PathBuf},
};

/// A discovered SvelteKit route page, its layouts chain, and optional client load module.
#[derive(Debug, Clone)]
pub struct RouteEntry {
    /// Pattern e.g. `/` or `/users/[id]`
    pub pattern: String,
    /// Path to `+page.svelte`
    pub page_path: PathBuf,
    /// Chain of `+layout.svelte` files from root down to this page's directory
    pub layouts: Vec<PathBuf>,
    /// Optional path to client `+page.ts` or `+page.js`
    pub load_path: Option<PathBuf>,
}

/// Discovers SvelteKit routes from a project root.
pub fn discover_routes(root: &Path) -> Vec<RouteEntry> {
    let routes_dir = if root.join("src/routes").is_dir() {
        root.join("src/routes")
    } else if root.join("routes").is_dir() {
        root.join("routes")
    } else {
        return Vec::new();
    };

    let mut entries = Vec::new();
    scan_dir(&routes_dir, &routes_dir, &mut entries);
    entries.sort_by(|a, b| a.pattern.cmp(&b.pattern));
    entries
}

fn scan_dir(base: &Path, dir: &Path, entries: &mut Vec<RouteEntry>) {
    let Ok(read) = std::fs::read_dir(dir) else { return };
    for entry in read.flatten() {
        let path = entry.path();
        if path.is_dir() {
            scan_dir(base, &path, entries);
        } else if path.file_name().and_then(|n| n.to_str()) == Some("+page.svelte") {
            let rel = path.parent().unwrap().strip_prefix(base).unwrap_or(Path::new(""));
            let pattern = if rel.as_os_str().is_empty() {
                "/".to_string()
            } else {
                format!("/{}", rel.to_string_lossy().replace('\\', "/"))
            };
            let layouts = collect_layouts(dir, base);
            let load_path = find_load_script(dir);
            entries.push(RouteEntry {
                pattern,
                page_path: path,
                layouts,
                load_path,
            });
        }
    }
}

fn collect_layouts(mut current: &Path, base: &Path) -> Vec<PathBuf> {
    let mut layouts = Vec::new();
    loop {
        let layout = current.join("+layout.svelte");
        if layout.is_file() {
            layouts.push(layout);
        }
        if current == base {
            break;
        }
        let Some(parent) = current.parent() else { break };
        current = parent;
    }
    // Outermost (root) layout first
    layouts.reverse();
    layouts
}

fn find_load_script(dir: &Path) -> Option<PathBuf> {
    let ts = dir.join("+page.ts");
    if ts.is_file() {
        return Some(ts);
    }
    let js = dir.join("+page.js");
    if js.is_file() {
        return Some(js);
    }
    None
}

/// Generates a SvelteKit virtual router ES module that mounts a NavStack
/// with nested layouts, client `load()` data lifecycle, `$page` signal, and `goto()`.
pub fn generate_kit_router(routes: &[RouteEntry]) -> String {
    let mut imports = String::new();
    let mut layout_map: HashMap<PathBuf, String> = HashMap::new();
    let mut layout_counter = 0;

    imports.push_str("import { mount, signal, effect, View, Text } from \"nsh\";\n");

    // Layout imports
    for r in routes {
        for l in &r.layouts {
            if !layout_map.contains_key(l) {
                let name = format!("Layout{}", layout_counter);
                layout_counter += 1;
                imports.push_str(&format!(
                    "import {name} from {:?};\n",
                    l.to_string_lossy()
                ));
                layout_map.insert(l.clone(), name);
            }
        }
    }

    let mut route_cases = String::new();

    for (idx, r) in routes.iter().enumerate() {
        let page_import = format!("RoutePage{}", idx);
        imports.push_str(&format!(
            "import {page_import} from {:?};\n",
            r.page_path.to_string_lossy()
        ));

        let load_import = if let Some(lp) = &r.load_path {
            let name = format!("loadRoute{}", idx);
            imports.push_str(&format!(
                "import {{ load as {name} }} from {:?};\n",
                lp.to_string_lossy()
            ));
            Some(name)
        } else {
            None
        };

        // Construct layout hierarchy wrapper
        let mut inner = format!("<{page_import} params={{params}} data={{pageData()}} />");
        for l in r.layouts.iter().rev() {
            let layout_name = &layout_map[l];
            inner = format!("<{layout_name} params={{params}} data={{pageData()}}>{inner}</{layout_name}>");
        }

        let load_call = if let Some(fn_name) = load_import {
            format!(
                "  if ({fn_name}) {{ Promise.resolve({fn_name}({{ params, url: {{ pathname: path }} }})).then((d) => pageData.set(d || {{}})); }}\n"
            )
        } else {
            "  pageData.set({});\n".to_string()
        };

        let is_param = r.pattern.contains('[');
        if is_param {
            let regex_str = r.pattern.replace("[", "(?<").replace("]", ">[^/]+)");
            route_cases.push_str(&format!(
                "  const m{idx} = path.match(new RegExp(\"^{regex_str}$\"));\n\
                   if (m{idx}) {{\n\
                     const params = m{idx}.groups || {{}};\n\
{load_call}\
                     return {inner};\n\
                   }}\n"
            ));
        } else {
            route_cases.push_str(&format!(
                "  if (path === {:?}) {{\n\
                     const params = {{}};\n\
{load_call}\
                     return {inner};\n\
                   }}\n",
                r.pattern
            ));
        }
    }

    let not_found_color = "#666";
    format!(
        r#"{imports}

export const currentPath = signal("/");
export const currentParams = signal({{}});
export const pageData = signal({{}});

export function goto(url) {{
  currentPath.set(url);
}}

export const page = {{
  get url() {{
    return {{ pathname: currentPath() }};
  }},
  get params() {{
    return currentParams();
  }},
  get data() {{
    return pageData();
  }}
}};

export default function SvelteKitApp() {{
  return (
    <View style={{{{ flex: 1 }}}}>
      {{(() => {{
        const path = currentPath();
{route_cases}
        return (
          <View style={{{{ flex: 1, padding: 24, justifyContent: "center", alignItems: "center" }}}}>
            <Text style={{{{ fontSize: 18, color: {not_found_color:?} }}}}>404 - Not Found: {{path()}}</Text>
          </View>
        );
      }})()}}
    </View>
  );
}}

mount(SvelteKitApp);
"#
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn discovers_routes_and_generates_router() {
        let dir = std::env::temp_dir().join(format!("nsh-kit-test-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&dir);
        let routes = dir.join("src/routes");
        std::fs::create_dir_all(routes.join("users/[id]")).unwrap();
        std::fs::create_dir_all(routes.join("about")).unwrap();

        std::fs::write(routes.join("+page.svelte"), "<p>Home</p>").unwrap();
        std::fs::write(routes.join("+layout.svelte"), "<slot />").unwrap();
        std::fs::write(routes.join("about/+layout.svelte"), "<slot />").unwrap();
        std::fs::write(routes.join("about/+page.svelte"), "<p>About</p>").unwrap();
        std::fs::write(routes.join("about/+page.ts"), "export async function load() { return { msg: 'hi' }; }").unwrap();
        std::fs::write(routes.join("users/[id]/+page.svelte"), "<p>User</p>").unwrap();

        let entries = discover_routes(&dir);
        assert_eq!(entries.len(), 3);
        assert_eq!(entries[0].pattern, "/");
        assert_eq!(entries[1].pattern, "/about");
        assert_eq!(entries[2].pattern, "/users/[id]");

        // About has two nested layouts
        assert_eq!(entries[1].layouts.len(), 2);
        assert!(entries[1].load_path.is_some());

        let router = generate_kit_router(&entries);
        assert!(router.contains("Layout0"), "{router}");
        assert!(router.contains("Layout1"), "{router}");
        assert!(router.contains("loadRoute1"), "{router}");
        assert!(router.contains("pageData"), "{router}");
        assert!(router.contains("RoutePage0"), "{router}");
        assert!(router.contains("RoutePage1"), "{router}");
        assert!(router.contains("RoutePage2"), "{router}");
        assert!(router.contains("currentPath"), "{router}");
        assert!(router.contains("goto(url)"), "{router}");
        assert!(router.contains("export const page"), "{router}");

        let _ = std::fs::remove_dir_all(dir);
    }
}
