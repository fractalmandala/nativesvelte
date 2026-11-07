//! Svelte and SvelteKit compiler for NSH.
//!
//! Transforms `.svelte` single-file components to native NSH modules
//! by lowering markup to NSH primitives, compiling Svelte 5 runes into
//! NSH's native reactive graph, and routing SvelteKit directory structures.

pub mod kit;
pub mod lower;
pub mod runes;
pub mod template;

use std::path::Path;

/// Compiles a `.svelte` source string into a TSX module ready for NSH's JSX compiler.
pub fn compile_svelte(path: &Path, source: &str, is_entry: bool) -> Result<String, String> {
    let file_name = path
        .file_name()
        .and_then(|f| f.to_str())
        .unwrap_or("Component.svelte");
    let doc = template::parse(source)
        .map_err(|e| format!("{file_name}:{}: template parse error: {}", e.offset, e.message))?;
    let lowered = lower::lower_to_tsx(&doc, file_name, is_entry)?;
    Ok(lowered.tsx)
}
