---
title: प्रतिक्रियाशीलता (Reactivity)
description: Svelte 5 रून्स ($state, $derived, $effect) एवं रस्ट सिग्नल आधारित सूक्ष्म
  प्रतिक्रियाशीलता।
order: 31
group: ui
demo: guide-reactivity
---


# Reactivity <span id="reactivity"></span>

NativeSvelte updates the UI with **fine-grained reactivity**: values that know who reads them. When reactive state changes, NativeSvelte runs again exactly the computations that read it (a text interpolation, a dynamic class, an effect) and nothing else. Components do not re-render, and there is zero virtual DOM overhead.

In **Svelte 5**, reactivity is expressed through standard runes:
- `$state` / `$state.raw` — reactive state
- `$derived` / `$derived.by` — computed / derived values
- `$effect` / `$effect.pre` — side effects and DOM/native lifecycle
- `$props` / `$bindable` — reactive component inputs and bindings

In **Rust**, components use the reactive graph in `nsh_core::prelude::*` (`signal`, `computed`, `effect`). Svelte 5 runes compile directly into these exact native signals, tracking dependencies and batching updates natively.

## प्रतिक्रियाशील अवस्था <span id="reactive-state"></span>

```svelte tabs
<script>
  let count = $state(0);

  function increment() {
    count += 1;
  }
</script>

<div onclick={increment}>
  <p>Tapped {count} times</p>
</div>
```

```rust tabs
use nsh_core::prelude::*;

fn counter() -> impl IntoElement {
    let count = signal(0_u32);
    view()
        .on_press(move || count.update(|n| *n += 1))
        .child(text(move || format!("Tapped {} times", count.get())))
}
```

Tapping updates the exact text node that reads `count`. The component function itself runs once when mounted. In Rust, a signal is a `Copy` handle, so closures take it with `move` and use it freely.

### Objects and arrays <span id="objects-and-arrays"></span>

In Svelte 5, `$state` creates deep reactive proxies for objects and arrays. Mutating array elements or object properties automatically notifies readers:

```svelte tabs
<script>
  let todos = $state([]);

  function addTodo(title) {
    todos.push({ id: Date.now(), title, done: false });
  }

  function toggle(id) {
    const item = todos.find((t) => t.id === id);
    if (item) item.done = !item.done;
  }
</script>
```

```rust tabs
let todos = signal(Vec::<Todo>::new());

todos.update(|list| list.push(Todo { id: 3, title: "New".into(), done: false }));
todos.update(|list| {
    if let Some(todo) = list.iter_mut().find(|t| t.id == id) {
        todo.done = true;
    }
});
```

When passing large read-only lists or external models where proxying is unwanted, use `$state.raw(...)`.

## व्युत्पन्न मान (Derived) <span id="derived-computed-values"></span>

Derived values compute their result from other reactive variables. They recompute only when their dependencies change, caching the result:

```svelte tabs
<script>
  let price = $state(12);
  let quantity = $state(2);
  let total = $derived(price * quantity);
</script>

<p>Total: ${total}</p>
```

```rust tabs
let price = signal(12);
let quantity = signal(2);
let total = computed(move || price.get() * quantity.get());

text(move || format!("Total: ${}", total.get()))
```

For complex multi-statement derivations, use `$derived.by(() => ...)`:

```svelte tabs
<script>
  let items = $state([10, 20, 30]);
  let stats = $derived.by(() => {
    const sum = items.reduce((a, b) => a + b, 0);
    return { sum, avg: sum / items.length };
  });
</script>

<p>Sum: {stats.sum}, Avg: {stats.avg}</p>
```

## Effects <span id="cleanup"></span><span id="batch"></span><span id="resource"></span> <span id="effects-span-idcleanupspanspan-idbatchspanspan-idresourcespan"></span>

Effects execute side effects when reactive state changes, such as timers, logging, or network calls:

```svelte tabs
<script>
  let { query } = $props();
  let results = $state([]);

  $effect(() => {
    if (!query) {
      results = [];
      return;
    }
    const controller = new AbortController();
    fetch(`https://api.example.com/search?q=${encodeURIComponent(query)}`, {
      signal: controller.signal
    })
      .then((r) => r.json())
      .then((data) => (results = data.items))
      .catch(() => {});

    return () => controller.abort();
  });
</script>

{#each results as item (item.id)}
  <p>{item.name}</p>
{/each}
```

```rust tabs
#[component]
pub fn Search(props: SearchProps) -> impl IntoElement {
    let results = signal(Vec::<SharedString>::new());
    effect(move || {
        let q = props.query.get();
        if q.is_empty() {
            return;
        }
        spawn(async move {
            if let Ok(response) = fetch(format!("https://api.example.com/search?q={q}")).await {
                results.set(response.text().lines().map(|l| SharedString::from(l.to_owned())).collect());
            }
        });
    });
    view().child(each(results, |item| item.clone(), |item, _| text(item)))
}
```

An effect runs after elements are rendered and can return a cleanup function that runs before the effect executes again or when the component unmounts.

```svelte tabs
<script>
  let seconds = $state(0);

  $effect(() => {
    const timer = setInterval(() => seconds++, 1000);
    return () => clearInterval(timer);
  });
</script>

<p>Seconds: {seconds}</p>
```

```rust tabs
effect(move || {
    let ticker = spawn(async move {
        loop {
            timer(Duration::from_millis(1000)).await;
            seconds.update(|s| *s += 1);
        }
    });
    cleanup(move || ticker.cancel());
});
```

## संदर्भ (Context) <span id="context"></span>

Context shares state throughout a subtree without prop-drilling:

```svelte tabs
<!-- Parent.svelte -->
<script>
  import { setContext } from "svelte";
  import Child from "./Child.svelte";

  let dark = $state(true);
  setContext("theme", {
    get dark() { return dark; },
    toggle: () => (dark = !dark)
  });
</script>

<Child />
```

```svelte tabs
<!-- Child.svelte -->
<script>
  import { getContext } from "svelte";

  const theme = getContext("theme");
</script>

<button onclick={theme.toggle} class={theme.dark ? "bg-black text-white" : "bg-white text-black"}>
  Toggle Theme
</button>
```

```rust tabs
#[derive(Clone, Copy)]
struct Dark(bool);

fn label(content: &'static str) -> impl IntoElement {
    let dark = use_context::<Dark>().is_some_and(|d| d.0);
    text(content).text_color(if dark { rgb(0xffffff) } else { rgb(0x1f2328) })
}

fn screen() -> impl IntoElement {
    provide_context(Dark(true));
    view().child(label("Hello"))
}
```

## त्रुटि सीमाएँ <span id="error-boundaries"></span>

In SvelteKit and NativeSvelte, route boundaries handle component errors gracefully using `+error.svelte`:

```svelte tabs
<!-- src/routes/+error.svelte -->
<script>
  import { page } from "$app/state";
</script>

<div class="p-6 items-center justify-center gap-3">
  <p class="text-xl font-bold text-red-600">Something went wrong</p>
  <p class="text-muted-foreground">{page.error?.message}</p>
</div>
```

```rust tabs
fn profile_card(user: Signal<Option<User>>) -> impl IntoElement {
    catch_error(
        move || profile(user),
        |error, reset| {
            view()
                .child(text(format!("Something went wrong: {error}")))
                .child(text("Try again").on_press(move || reset.reset()))
        },
    )
}
```

## क्या संचालित होता है, और कब <span id="what-runs-and-when"></span>

| Feature | When it runs | Updates when |
|---|---|---|
| Svelte component `<script>` | Once on component mount | Never re-runs the entire script |
| Template interpolation `{value}` | Once during mount | Exactly when `value` or its dependencies change |
| `$derived(...)` | Lazily evaluated | Re-evaluates when dependencies change |
| `$effect(...)` | After mount & DOM/native commit | When tracked state changes |
| `{#if ...}` | On mount | When the condition boolean flips |
| `{#each ... (key)}` | On mount | When list elements or keys change; moves existing native views |

## संबंधित प्रलेखन <span id="related"></span>

- [Components & Templates](./jsx-and-components.md): Svelte 5 components, templates, props, and snippets.
- [Building with Rust](./rust.md): Native Rust extensions and crates.
- [Styling](./styling.md): Native Tailwind styles and adaptive colors.
- [Animation](./animation.md): Smooth 60/120fps native thread animations.
