---
title: Components & Templates
description: How NativeSvelte describes UI in Svelte 5, templates, runes, props, snippets, control flow, and zero-virtual-DOM native compilation.
order: 30
group: ui
demo: guide-components
---

# Components and templates

NativeSvelte apps describe their UI with elements and components in **Svelte 5** (`.svelte`), or native **Rust**.
- In **Svelte 5**, components use HTML-like templates, runes (`$state`, `$derived`, `$props`, `$bindable`), and standard directives (`onclick`, `bind:value`), compiled with zero virtual DOM directly into native signals and view operations.
- In **Rust**, elements are built using functions and typed builder methods (`view().gap_4().child(..)`).
- **TSX** entries remain supported through the same underlying native renderer.

Either way, a component builds its part of the tree, and fine-grained [reactivity](./reactivity.md) follows signal bindings natively so only changed values update.

## Elements

The **host elements** are each backed by a native view:

| Svelte | Rust | Native view | Page |
|---|---|---|---|
| `<div>`, `<View>` | `view()` | `UIView` / `ViewGroup`: a box for layout, styling and touches | [View](../elements/view.md) |
| `<p>`, `<span>`, `<Text>` | `text(..)` | A native text view; nested text elements are spans | [Text](../elements/text.md) |
| `<img>`, `<Image>` | `image(src)` | An image view (local assets and URLs) | [Image](../elements/image.md) |
| `<Scroll>` | `scroll()` | `UIScrollView` / `ScrollView` | [Scroll](../elements/scroll.md) |
| `<input>`, `<Input>` | `input()` | `UITextField` / `UITextView` / `EditText` | [Input](../elements/input.md) |
| `<button>`, `<Button>` | `button()` | Pressable surface with native states and feedback | [Button](../elements/button.md) |
| `<List>` | `virtual_list(count, row)` | A virtualized, recycling list | [List](../elements/list.md) |
| `<Canvas>`, `<WebView>`, `<Video>` | `canvas(..)`, `web_view(url)`, `video(url)` | A drawing, a web page, a video player | [Elements](../elements/index.md) |
| `<Dialog>` | `nsh_base::dialog()` | A presented layer | [Elements](../elements/index.md) |
| `{#if}`, `{#each}` | `when(..)`, `each(..)` | Control flow, no view of its own | [Control flow](../elements/control-flow.md) |

```svelte tabs
<!-- App.svelte -->
<script>
  let count = $state(0);
</script>

<div class="rounded-xl bg-background p-4" onclick={() => count++}>
  <p class="font-semibold text-foreground">Taps: {count}</p>
</div>
```

```rust tabs
use nsh_core::prelude::*;

#[component]
pub fn Counter() -> impl IntoElement {
    let count = signal(0_u32);
    view()
        .rounded(px(12.0))
        .bg(move || theme().background)
        .p_4()
        .on_press(move || count.update(|c| *c += 1))
        .child(text(move || format!("Taps: {}", count.get())).font_weight(FontWeight::SEMIBOLD))
}
```

In Svelte, styles use Tailwind utility classes in `class`, dynamic classes `{condition ? '...' : ''}`, or inline styles (`style="..."` / `style:property={...}`). Event handlers use standard lowercase directives (`onclick`, `onpointerdown`, `onkeydown`). In Rust, styles are typed methods named as Tailwind's utilities are (`.px_4()`, `.rounded_lg()`, `.bg(..)`), and listeners are methods too (`.on_press(..)`).

```svelte tabs
<script>
  let open = $state(false);
</script>

<div
  class="rounded-xl shadow-md active:opacity-75"
  onclick={() => (open = true)}
>
  <p class="font-semibold">Open</p>
</div>
```

```rust tabs
view()
    .rounded(px(12.0))
    .bg(move || theme().background)
    .on_press(move || open.set(true))
    .child(text("Open").font_weight(FontWeight::SEMIBOLD))
```

> [!IMPORTANT]
> In NativeSvelte, text is displayed inside paragraphs or spans: `<p>`, `<span>`, or `<Text>`. A string directly in an unstyled layout box without text tags is wrapped in an implicit text node or styled paragraph.

## Components

The look of an app is the app's own. NativeSvelte provides two layers: the primitives (the elements above, styles, Tailwind classes) and the unstyled base components of [`nsh/base`](../modules/nsh-base.md) (`nsh_base` in Rust), which own behavior such as navigation, dialogs, the keyboard, the status bar and safe areas. The third layer, the component library, is yours: buttons, cards and every other piece of your UI are components you write in Svelte 5, or in your app's crate ([Building with Rust](./rust.md)).

A Svelte component is written in a `.svelte` file using Svelte 5 runes. Props are declared with `$props()`, and state with `$state()`. A Rust component is a `#[component] fn` that takes its props struct:

```svelte tabs
<!-- Badge.svelte -->
<script>
  let { label, color = "#ddf4ff" } = $props();
</script>

<div
  class="rounded-full px-2.5 py-1"
  style:background-color={color}
>
  <p class="text-xs font-semibold">{label}</p>
</div>
```

```rust tabs
#[derive(Debug, Clone, PartialEq, Props)]
pub struct BadgeProps {
    pub label: Prop<SharedString>,
    #[prop(default = Hsla::from(rgb(0xddf4ff)))]
    pub color: Prop<Hsla>,
}

#[component]
pub fn Badge(props: BadgeProps) -> impl IntoElement {
    view()
        .rounded_full()
        .px(px(10.0))
        .py_1()
        .bg(move || props.color.get())
        .child(text(props.label).text_size(px(13.0)).font_weight(FontWeight::SEMIBOLD))
}
```

Placed in another component's view:

```svelte tabs
<Badge label="{unread} new" color="#fff8c5" />
```

```rust tabs
badge()
    .label(move || format!("{} new", unread.get()))
    .color(rgb(0xfff8c5))
```

In Svelte 5, the component initialization runs **once**, wiring up reactive bindings through runes. The compiled output directly manipulates native signal nodes without virtual DOM diffing. When `unread` changes, only the exact text node that reads it updates.

### What runs again

A value given to an element is set once; a binding follows what it reads. In Svelte, expressions inside template interpolations `{count}` or derived runes `$derived(...)` automatically track the signals they access. In Rust, a binding is a closure (or a signal, a memo, a prop) given where a value goes:

```svelte tabs
<p>{count}</p>
<p>{title}</p>
<p>{user.name}</p>
<div class="transition-opacity {busy ? 'opacity-50' : 'opacity-100'}"></div>
```

```rust tabs
text(move || format!("{}", count.get()))     // follows count
text(props.title)                            // follows the prop
text(label.clone())                          // a plain value: set once
view().opacity(move || if busy.get() { 0.5_f32 } else { 1.0 })   // follows busy
```

A changing prop or child is a small native effect that sets that one prop or replaces that one child. Styles are diffed in Rust, so a style that changes only sends the properties that changed.

Event handlers are set once: a function or closure in Svelte (`onclick={() => count++}`), a closure in Rust (`.on_press(move || count.update(|c| *c += 1))`).

### Props

In Svelte 5, props are declared with the `$props()` rune and can be cleanly destructured with default values:

```svelte tabs
<!-- Title.svelte -->
<script>
  let { text = "Default Title" } = $props();
</script>

<p class="text-xl font-bold">{text}</p>
```

```rust tabs
#[derive(Debug, Clone, PartialEq, Props)]
pub struct TitleProps {
    #[prop(default = SharedString::from("Default Title"))]
    pub text: Prop<SharedString>,
}

#[component]
fn Title(props: TitleProps) -> impl IntoElement {
    text(props.text).text_xl().font_weight(FontWeight::BOLD)
}
```

To derive formatted values from props, use `$derived`:

```svelte tabs
<!-- Price.svelte -->
<script>
  let { cents } = $props();
  let formatted = $derived(`$${(cents / 100).toFixed(2)}`);
</script>

<p class="font-mono">{formatted}</p>
```

```rust tabs
#[component]
fn Price(props: PriceProps) -> impl IntoElement {
    let formatted = move || format!("${:.2}", props.cents.get() as f64 / 100.0);
    text(formatted)
}
```

### Children and Snippets

What a parent places in a component arrives as `children` in Svelte 5, rendered using `{@render children?.()}`:

```svelte tabs
<!-- Card.svelte -->
<script>
  let { title, children } = $props();
</script>

<div class="p-3.5 rounded-xl bg-card border border-border gap-2">
  <p class="font-semibold text-foreground">{title}</p>
  {@render children?.()}
</div>
```

```rust tabs
#[derive(Debug, Clone, PartialEq, Props)]
pub struct CardProps {
    pub title: Prop<SharedString>,
    pub children: Prop<Children>,
}

#[component]
pub fn Card(props: CardProps) -> impl IntoElement {
    view()
        .p(px(14.0))
        .rounded(px(12.0))
        .bg(move || theme().background)
        .gap_2()
        .child(text(props.title).font_weight(FontWeight::SEMIBOLD))
        .child(props.children)
}
```

Used by a parent component:

```svelte tabs
<Card title="Account">
  <p>Signed in as {user.name}</p>
</Card>
```

```rust tabs
card()
    .title("Account")
    .child(text(move || format!("Signed in as {}", user.get().name)))
```

You can also define and pass named snippets in Svelte 5 with `{#snippet name(...)}`:

```svelte tabs
{#snippet row(index)}
  <p class="py-1">Row {index}</p>
{/snippet}

{#each Array(3) as _, i}
  {@render row(i)}
{/each}
```

## Control flow

In Svelte, control flow uses template syntax `{#if}` and `{#each}`. In Rust, `when` and `each` provide fine-grained signal-driven branching:

```svelte tabs
{#if user}
  <p>Hello, {user.name}</p>
{:else}
  <p>Signed out</p>
{/if}

{#each todos as todo, index (todo.id)}
  <p>{index + 1}. {todo.title}</p>
{/each}
```

```rust tabs
when(move || user.get().is_some(), move || {
    text(move || format!("Hello, {}", user.get().map(|u| u.name).unwrap_or_default()))
})
.otherwise(|| text("Signed out"))

each(todos, |todo| todo.id, |todo, index| {
    text(move || format!("{}. {}", index.get() + 1, todo.get().title))
})
```

- **`{#if}`** / **`when`** renders the active branch and updates only when condition boundaries flip.
- **`{#each}`** / **`each`** renders a row per item, keyed by identity (`(todo.id)`). When list order changes, native views are efficiently reordered without tearing down DOM or native elements.

For large or infinite datasets, use [`<List>`](./lists.md) (`virtual_list` in Rust) to recycle native view cells.

## Refs

A ref names a host element for imperative calls: `focus()`, `blur()`, `scrollTo()`, `measure()` ([where a view is](./touch-and-gestures.md#where-a-view-is-measure)).

In Svelte, use `bind:this={element}`. In Rust, `element_ref()` creates a handle:

```svelte tabs
<script>
  let inputRef = $state();

  function focusInput() {
    inputRef?.focus();
  }
</script>

<div class="gap-2">
  <input bind:this={inputRef} placeholder="Search" class="border p-2 rounded" />
  <button onclick={focusInput} class="bg-primary text-white p-2 rounded">
    Focus
  </button>
</div>
```

```rust tabs
fn search() -> impl IntoElement {
    let field = element_ref();
    view()
        .child(input().element_ref(&field).placeholder("Search"))
        .child(text("Focus").on_press(move || field.focus()))
}
```

The ref is attached when the element is created and mounted into the native view hierarchy, so it is accessible in `$effect` runes and event handlers.

## Spreading props

In Svelte, props can be spread onto elements using `{...props}` or destructured cleanly in `$props()`:

```svelte tabs
<!-- Field.svelte -->
<script>
  let { label, ...restProps } = $props();
</script>

<div class="gap-1">
  <p class="text-sm font-medium">{label}</p>
  <input class="border rounded p-2" {...restProps} />
</div>
```

```svelte tabs
<Field label="Email" type="email" placeholder="you@example.com" />
```

## Mounting and the root

In SvelteKit or standalone NativeSvelte apps, the root component is typically `src/routes/+page.svelte` or `App.svelte`:

```svelte tabs
<!-- App.svelte -->
<script>
  import Home from "./Home.svelte";
</script>

<div class="flex-1 bg-background text-foreground">
  <Home />
</div>
```

```rust tabs
// nsh.json: { "rust": ".", "root": "App" }
#[component]
pub fn App() -> impl IntoElement {
    view()
        .flex_1()
        .bg(move || theme().background)
        .child(home())
}
```

Give the root `flex-1` so it fills the screen, and a background color: the surface's own background depends on the platform.

## Related

- [Reactivity](./reactivity.md): Svelte 5 runes, signals, effects, context.
- [Elements](../elements/index.md): every host element and its props.
- [Styling](./styling.md) and [Tailwind](./tailwind.md): the look of your components.
- [Building with Rust](./rust.md): Rust apps and native extensions.
