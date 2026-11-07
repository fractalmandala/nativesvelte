---
title: टेलविंड (Tailwind)
description: Tailwind CSS वर्गों का देशीय समाधान, प्रसंग टोकन एवं परिवर्त (Variants)।
order: 33
group: ui
demo: guide-tailwind
---


# Tailwind <span id="tailwind"></span>

NativeSvelte's styles follow Tailwind CSS 4. In Svelte, every element accepts Tailwind classes in `class`, resolved natively against Tailwind 4's default theme. In Rust, Tailwind's utilities are typed style methods with the same names and values (`.p_4()` is `p-4`, `.rounded_2xl()` is `rounded-2xl`, `ZINC.shade(900)` is `zinc-900`):

```svelte tabs
<div class="flex-row items-center gap-3 rounded-2xl bg-white p-4 shadow-lg active:scale-[0.98] dark:bg-zinc-800">
  <p class="text-base font-semibold text-zinc-900 dark:text-white">Tailwind on native views</p>
</div>
```

```rust tabs
use nsh_core::element::palette::ZINC;

view()
    .flex_row()
    .items_center()
    .gap_3()
    .rounded_2xl()
    .bg(AdaptiveColor::new(white(), ZINC.shade(800)))
    .p_4()
    .shadow_lg()
    .active(|s| s.scale(0.98))
    .child(
        text("Tailwind on native views")
            .text_base()
            .font_weight(FontWeight::SEMIBOLD)
            .text_color(AdaptiveColor::new(ZINC.shade(900), white())),
    )
```

Typed methods lower into the same style rules the classes compile to, with no string to parse. For classes, no CSS is generated and nothing runs in JavaScript: the string is passed to the core, which parses each distinct class string once (and caches it), turns it into style rules, and applies them. Variants that depend on state (pressed, dark mode, window width) are re-applied by the core when that state changes, and pressed and focused states are tracked natively, so `active:` feedback (`.active(..)` in Rust) has no round trip to your JavaScript code.

Classes and the [`style` prop](./styling.md) produce the same native styles and can be combined; this page covers what is specific to classes and their typed equivalents. The [Tailwind reference](../modules/tailwind-reference.md) lists every supported utility.

## Classes and dynamic styles <span id="classes-and-dynamic-styles"></span>

```svelte tabs
<div
  class="rounded-lg px-4 py-2 transition-colors {selected ? 'bg-indigo-600' : 'bg-zinc-200'} {busy ? 'opacity-50' : ''}"
/>
```

```rust tabs
view()
    .rounded_lg()
    .px_4()
    .py_2()
    .transition_colors()
    .bg(move || if selected.get() { INDIGO.shade(600) } else { ZINC.shade(200) })
    .style_when(busy, |s| s.opacity(0.5))
```

- **`class`** is a string of classes. It can be dynamic: `class="h-6 rounded bg-{color}-500"` works because classes are resolved at run time.
- **In Svelte**, reactive class interpolation `{condition ? 'class-a' : 'class-b'}` conditionally applies classes when reactive state updates.
- **In Rust**, a method given a closure or a signal follows it (`.bg(move || ..)`), `.style_when(condition, |s| ..)` applies styles while a condition holds, and `.when(condition, |v| ..)` decides once, when the element is made.

How conflicts resolve:

1. **Later classes win** over earlier ones in the same string: `"p-2 p-4"` is `p-4`. There is no need for `tailwind-merge`: a component can append the `class` its caller passes. Later methods win in Rust too.
2. **Variant classes apply after plain ones**, ordered by Tailwind's variant order (`hover:` before `active:`, `max-*:` widest first, breakpoints ascending, `dark:` last), whatever their position in the string.
3. **`style` wins over classes.** A style key is the CSS property of its name, the one the classes set, so it replaces only that property: `style="padding-left: 8px"` replaces `pl-4` and keeps `pr-4`.
4. `!` makes a class important: `!p-0`.

## Variants <span id="variants"></span>

| Variant | Applies when | Rust |
|---|---|---|
| `active:` | The view is pressed | `.active(\|s\| ..)` |
| `hover:` | A pointer is over the view (iPad and Mac pointers) | `.hover(\|s\| ..)` |
| `focus:`, `focus-visible:` | An input has focus | `.focus(\|s\| ..)` |
| `focus-within:` | The view or a descendant has focus | `.focus_within(..)` |
| `disabled:`, `enabled:` | The element is disabled / enabled | `.disabled_style(\|s\| ..)` |
| `selected:` | The element is selected | `.selected_style(..)` |
| `checked:` | The element is checked | `.checked_style(..)` |
| `placeholder:` | Styles an input's placeholder (`placeholder:text-zinc-400`) | `.placeholder_color(..)` |
| `selection:` | Colors selection highlight (`selection:bg-violet-200`) | `.selection_color(..)` |
| `dark:` | The system appearance is dark | An `AdaptiveColor`, or `.dark(\|s\| ..)` |
| `sm:`, `md:`, `lg:`, `xl:`, `2xl:` | Window width breakpoints | `.style_when(..)` |
| `ios:`, `android:`, `web:` | The platform | `.when(os() == Os::Ios, ..)` |

Variants combine: `dark:active:bg-zinc-700`, `md:landscape:flex-row`.

```svelte tabs
<div class="group flex-row items-center gap-3 rounded-xl bg-white p-3 active:bg-zinc-50">
  <p class="flex-1 text-zinc-900">Settings</p>
  <p class="text-zinc-300 transition-transform group-active:translate-x-1">›</p>
</div>
```

```rust tabs
view()
    .group()
    .flex_row()
    .items_center()
    .gap_3()
    .rounded_xl()
    .bg(white())
    .p_3()
    .active(|s| s.bg(ZINC.shade(50)))
    .child(text("Settings").flex_1().text_color(ZINC.shade(900)))
    .child(
        text("›")
            .text_color(ZINC.shade(300))
            .transition_transform()
            .group_active(|s| s.translate_x(px(4.0))),
    )
```

`disabled` on any element applies `disabled:` classes and removes its press handlers from what is mounted:

```svelte tabs
<button
  disabled={saving}
  onclick={save}
  class="rounded-lg bg-emerald-500 px-4 py-2 active:bg-emerald-600 disabled:opacity-40"
>
  <span class="font-medium text-white">Save</span>
</button>
```

```rust tabs
view()
    .disabled(saving)
    .on_press(save)
    .rounded_lg()
    .bg(EMERALD.shade(500))
    .px_4()
    .py_2()
    .active(|s| s.bg(EMERALD.shade(600)))
    .disabled_style(|s| s.opacity(0.4))
    .child(text("Save").font_weight(FontWeight::MEDIUM).text_color(white()))
```

## विषय-वस्तु प्रतीकक (Theme Tokens) <span id="theme-tokens"></span>

The app's theme (`"theme"` in `nsh.json`) holds its design tokens: shadcn/ui's colors (`background`, `foreground`, `primary`, `muted-foreground`, `border`, `ring`, `chart-1`, `sidebar`, ...), its `radius`, its fonts `font-sans` and `font-mono`, and any token the app adds. Classes name them as Tailwind names the variables of a CSS `@theme`, Rust components read them with `theme()` from `nsh_base`, and Svelte reads them with `token()` from `nsh`:

```svelte tabs
<div class="rounded-(--radius) border border-border bg-card p-4">
  <p class="text-card-foreground">Balance</p>
  <p class="text-muted-foreground">Updated just now</p>
  <button class="rounded-(--radius) bg-primary px-4 py-2 active:bg-primary/90 mt-2">
    <span class="text-primary-foreground font-medium">Continue</span>
  </button>
</div>
```

```rust tabs
use nsh_base::theme;

view()
    .rounded(move || theme().radius)
    .border_1()
    .border_color(move || theme().border)
    .bg(move || theme().card)
    .p_4()
    .child(text("Balance").text_color(move || theme().card_foreground))
    .child(text("Updated just now").text_color(move || theme().muted_foreground))
    .child(
        view()
            .rounded(move || theme().radius)
            .bg(move || theme().primary)
            .px_4()
            .py_2()
            .active(|s| s.bg(move || theme().primary.opacity(0.9)))
            .child(text("Continue").text_color(move || theme().primary_foreground)),
    )
```

In canvas or charting contexts where classes cannot be used, `token(name)` provides reactive token values:

```svelte
<script>
  import { Canvas, token } from "nsh";
</script>

<Canvas
  class="h-40"
  draw={(cx, { width, height }) => {
    cx.beginPath();
    cx.moveTo(0, height);
    cx.lineTo(width, 0);
    cx.strokeStyle = token("chart-1");
    cx.lineWidth = 2;
    cx.stroke();
  }}
/>
```

## संबंधित प्रलेखन <span id="related"></span>

- [Styling](./styling.md): Inline styles, typed methods and platform limits.
- [Tailwind reference](../modules/tailwind-reference.md): Every utility and variant.
- [Layout](./layout.md): Flexbox and grid.
