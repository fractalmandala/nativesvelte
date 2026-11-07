---
title: Styling
description: Typed style methods in Rust and Tailwind CSS classes in Svelte - flexbox, grid and CSS effects - colors, borders, corners, shadows, gradients, filters, transforms and transitions, with platform differences.
order: 32
group: ui
demo: guide-styling
---

# Styling

Every element is styled with the same native styles. In Svelte, elements use [Tailwind classes](./tailwind.md) (`class="..."`), dynamic classes, or inline styles (`style:property={...}`). In Rust, styles are typed methods chained on the element (`.p_4()`, `.rounded(px(12.0))`, `.bg(color)`). Both compile into native properties with full support for box shadows, gradients, filters, outlines, transitions and grid, and only the properties that changed are sent to the native view.

Lengths are points (`16`, `"50%"`, `"auto"`; Tailwind classes take standard units), the defaults are native layout's (listed below), and what the platforms do beyond CSS has [extensions](#extensions) of its own.

```svelte tabs
<div
  class="p-4 rounded-xl bg-white border border-[#d0d7de] shadow-lg"
>
  <p class="text-[17px] font-semibold text-[#1f2328]">Card</p>
</div>
```

```rust tabs
view()
    .p_4()
    .rounded(px(12.0))
    .bg(white())
    .border_1()
    .border_color(rgb(0xd0d7de))
    .shadow([BoxShadow {
        offset_y: px(4.0),
        blur: px(12.0),
        color: rgba(0x0000001f).into(),
        ..BoxShadow::default()
    }])
    .child(
        text("Card")
            .text_size(px(17.0))
            .font_weight(FontWeight::SEMIBOLD)
            .text_color(rgb(0x1f2328)),
    )
```

This page covers how styles combine and the visual properties. Layout properties (flexbox, grid, sizes, positions) are on [Layout](./layout.md), text properties on [Text](./text.md), and every property with its type is listed in the [style reference](../modules/style-reference.md).

## Combining styles

In Svelte, conditional styles are expressed with class bindings or ternary template strings:

```svelte tabs
<script>
  let { danger = false, busy = false } = $props();
</script>

<button
  class="px-4 py-2.5 rounded-[10px] bg-[#0969da] {danger ? 'bg-[#cf222e]' : ''} {busy ? 'opacity-40' : ''}"
>
  Click
</button>
```

```rust tabs
fn button(danger: bool, busy: Signal<bool>) -> View {
    view()
        .px_4()
        .py(px(10.0))
        .rounded(px(10.0))
        .bg(rgb(0x0969da))
        .when(danger, |v| v.bg(rgb(0xcf222e)))
        .style_when(busy, |s| s.opacity(0.4))
}
```

A style that reads reactive state follows it automatically. In Svelte, a dynamic class or style attribute updates reactively; NativeSvelte diffs the changes and sends only the properties whose values changed:

```svelte tabs
<div class="p-3 {selected ? 'bg-[#ddf4ff]' : 'bg-white'}" />
```

```rust tabs
view()
    .p_3()
    .bg(move || if selected.get() { rgb(0xddf4ff) } else { rgb(0xffffff) })
```

## Units and values

- **Lengths are points** (density-independent pixels): `100` in points is 200 or 300 physical pixels on a 2× or 3× screen.
- **Percentages** (`"50%"`, `relative(0.5)` in Rust) are relative to the parent, for sizes, positions, margins and paddings ([Layout](./layout.md)).
- **Angles** are `deg(45.0)`, `radians(0.5)` or `turn(0.25)` in Rust, and degrees as numbers or strings with a unit in Svelte: `"45deg"`, `"0.5rad"`, `"0.25turn"`.
- **Durations** are milliseconds: `.duration(150.0)` in Rust, numbers or strings (`"150ms"`, `"0.2s"`).

## Defaults

Where nothing sets a property, NativeSvelte's defaults apply:

| | Default |
|---|---|
| Layout of a view's children | a column (a flex container with `flexDirection: "column"`); `display: "flex"` makes a row unless `flexDirection` is set, as in CSS |
| `flexShrink` | `0` (children do not shrink unless asked) |
| `alignContent` | `"flex-start"` (in grids, CSS's `"normal"`) |
| `position` | `"relative"` |
| `minWidth` / `minHeight` | `0` |
| `backgroundColor` | transparent |
| Text | black, 14pt, weight 400 |
| Border and outline color | the text color (CSS's `currentColor`) |

New views carry no style at all until you give them one, so unstyled wrappers cost nothing on the native side.

## Colors

In Svelte, colors accept standard Tailwind utilities (`bg-zinc-900`, `text-primary`, `border-border`) and CSS color formats (`#0099ff`, `rgba(0, 0, 0, 0.5)`, `hsl(210 100% 50%)`, `oklch(62.3% 0.214 259.8)`).

For dark mode in Svelte, use Tailwind's `dark:` variant:

```svelte tabs
<div class="flex-1 bg-white text-[#1f2328] dark:bg-[#0d1117] dark:text-[#e6edf3]">
  <p>Follows the system appearance</p>
</div>
```

```rust tabs
view()
    .flex_1()
    .bg(AdaptiveColor::rgb(0xffffff, 0x0d1117))
    .child(text("Follows the system appearance").text_color(AdaptiveColor::rgb(0x1f2328, 0xe6edf3)))
```

In Rust, colors are typed values: `rgb(0x0099ff)`, `rgba(0x0099ffcc)`, `hsla(..)`, `white()`, `black()`, and Tailwind's palette as `nsh_core::element::palette` (`BLUE.shade(500)`). Color methods take an `AdaptiveColor`, a light and a dark value: `AdaptiveColor::rgb(0xffffff, 0x0d1117)` switches with the system appearance natively, with no render.

## Borders and corners

```svelte tabs
<div
  class="border border-dashed border-[#d0d7de] rounded-xl rounded-tl-[24px] border-b-[3px] border-b-[#0969da]"
/>
```

```rust tabs
view()
    .border_1()
    .border_color(rgb(0xd0d7de))
    .border_dashed()               // .border_solid() | .border_dashed() | .border_dotted()
    .rounded(px(12.0))
    .rounded_tl(px(24.0))          // per corner, overrides .rounded(..)
    .border_b(px(3.0))             // per side
    .border_b_color(rgb(0x0969da))
```

- **Widths and colors** per side: `border-t`, `border-r`, `border-b`, `border-l`, and logical sides `border-s` and `border-e` which follow [layout direction](./layout.md#right-to-left).
- **`borderCurve: "continuous"`** (`corner-squircle` class) draws superellipse corners, whose curvature eases into the edges, like iOS app icons.
- **`overflow-hidden`** clips children to the rounded shape.

## Shadows

Views cast CSS's `boxShadow`, and Android adds its material elevation:

```svelte tabs
<!-- CSS box-shadow and elevation with Tailwind classes -->
<div class="shadow-sm shadow-black/10" />
<div class="shadow-2xl shadow-black/15" />
<div class="bg-white rounded-xl shadow-lg" />
```

```rust tabs
// CSS box-shadow: several layers, with spread and inset.
view().shadow([
    BoxShadow { offset_y: px(1.0), blur: px(2.0), color: rgba(0x00000014).into(), ..BoxShadow::default() },
    BoxShadow { offset_y: px(8.0), blur: px(24.0), color: rgba(0x0000001f).into(), ..BoxShadow::default() },
])
view().shadow([BoxShadow { offset_y: px(2.0), blur: px(4.0), color: rgba(0x00000026).into(), inset: true, ..BoxShadow::default() }])

// A preset in a color of its own.
view().shadow_lg().shadow_color(rgba(0x0969da66))

// Android's material elevation.
view().elevation(px(6.0)).bg(white()).rounded(px(12.0))
```

## Gradients

`backgroundImage` takes CSS gradients, drawn over the background color:

```svelte tabs
<div class="h-[120px] rounded-2xl bg-gradient-to-br from-[#54aeff] to-[#8250df]" />
<div class="bg-[radial-gradient(circle_at_top_left,#fff8c5,#fd8c73)]" />
<div class="bg-[conic-gradient(red,yellow,lime,aqua,blue,magenta,red)]" />
```

```rust tabs
view().h(px(120.0)).rounded(px(16.0)).bg_linear(deg(135.0)).gradient_from(rgb(0x54aeff)).gradient_to(rgb(0x8250df))
view().bg_radial().gradient_from(rgb(0xfff8c5)).gradient_to(rgb(0xfd8c73))
view().bg_conic(deg(0.0)).gradient_from(rgb(0xff0000)).gradient_via(rgb(0x00ff00)).gradient_to(rgb(0x0000ff))
```

## Filters and blending

| Property | Value | Rust |
|---|---|---|
| `filter` | CSS filters of the view and its content: `brightness()`, `contrast()`, `grayscale()`, `hue-rotate()`, `invert()`, `saturate()`, `sepia()`, `opacity()`, `blur()`, `drop-shadow()` | `.brightness(n)`, `.contrast(n)`, `.grayscale(n)`, `.blur(px(..))` |
| `backdropFilter` | Filters of what is behind the view: `"blur(10px)"` (frosted glass) | `.backdrop_blur(px(10.0))`, `.backdrop_saturate(n)` |
| `mixBlendMode` | How the view blends with what is behind it: `"multiply"`, `"screen"`, `"overlay"` | `.mix_blend_mode(BlendMode::Multiply)` |

```svelte tabs
<img src={photo} class="w-[120px] h-[120px] grayscale contrast-125" alt="" />
<div class="absolute bottom-0 left-0 right-0 p-3 bg-white/40 backdrop-blur-md" />
```

```rust tabs
image(photo).size(px(120.0)).grayscale(1.0).contrast(1.2)
view()
    .absolute()
    .bottom_0()
    .left_0()
    .right_0()
    .p_3()
    .bg(rgba(0xffffff66))
    .backdrop_blur(px(12.0))
```

### Progressive blur

```svelte
<!-- ProgressiveBlur.svelte -->
<script>
  let { radius = 30 } = $props();
  const LAYERS = 5;
</script>

<div class="pointer-events-none relative">
  {#each Array(LAYERS) as _, i}
    <div
      class="absolute inset-0"
      style="backdrop-filter: blur({radius / 2 ** (LAYERS - 1 - i)}px); -webkit-mask-image: linear-gradient(to bottom, transparent {(i / LAYERS) * 100}%, black {((i + 1) / LAYERS) * 100}%);"
    ></div>
  {/each}
</div>
```

## Transforms

Transforms use standard CSS utilities and functions:

```svelte tabs
<div class="translate-x-5 -rotate-[8deg] scale-90" />
<div class="[perspective:600px] [transform:rotateY(35deg)] [backface-visibility:hidden]" />
<div class="origin-top-left rotate-[30deg]" />
```

```rust tabs
view().translate_x(px(20.0)).rotate(deg(-8.0)).scale(0.9)
view().perspective(px(600.0)).child(view().rotate_y(deg(35.0)).backface_hidden())
view().origin_top_left().rotate(deg(30.0))
```

## Transitions

A view animates changes of its own style when you name what to animate. The animation runs natively at 60/120fps; none of your JavaScript code runs per frame:

```svelte tabs
<script>
  let open = $state(false);
</script>

<button
  onclick={() => (open = !open)}
  class="w-[150px] h-[72px] transition-all duration-300 ease-in-out {open ? 'rounded-[36px] bg-[#8250df] translate-x-[120px]' : 'rounded-[12px] bg-[#54aeff]'}"
>
</button>
```

```rust tabs
let open = signal(false);

view()
    .on_press(move || open.update(|o| *o = !*o))
    .w(px(150.0))
    .h(px(72.0))
    .rounded(move || px(if open.get() { 36.0 } else { 12.0 }))
    .bg(move || if open.get() { rgb(0x8250df) } else { rgb(0x54aeff) })
    .translate_x(move || px(if open.get() { 120.0 } else { 0.0 }))
    .transition_all()
    .duration(300.0)
    .ease_in_out()
```

### Keyframe animations

Tailwind keyframe animations run natively: `animate-spin`, `animate-ping`, `animate-pulse`, `animate-bounce`:

```svelte tabs
<div class="w-6 h-6 rounded bg-[#0969da] animate-spin" />
```

```rust tabs
view()
    .size(px(24.0))
    .rounded(px(4.0))
    .bg(rgb(0x0969da))
    .animation(KeyframeAnimation::new(Keyframes::Spin).duration(1000.0).easing([0.0, 0.0, 1.0, 1.0]))
```

## Press feedback

Press feedback is applied natively without a round trip to JavaScript:

```svelte tabs
<button class="bg-[#0969da] active:opacity-60 active:scale-95 transition-transform px-4 py-2 rounded-lg text-white">
  Tap me
</button>
```

```rust tabs
view()
    .bg(rgb(0x0969da))
    .active(|s| s.opacity(0.6).scale(0.95))
    .px_4()
    .py_2()
    .rounded_lg()
```

## Extensions

These utilities and classes carry what native platforms do beyond CSS:

| Class | What it does |
|---|---|
| `placeholder:text-*` | An input's placeholder color |
| `selection:bg-*` | The selection highlight of an input or selectable text |
| `tint-*` | Recolors an image's opaque pixels (template images, icons) |
| `corner-squircle` | Corners that ease into the edges, as the system's own (Apple's continuous corners) |
| `ios:`, `android:`, `web:` | Classes for one platform (`ios:pt-2`) |

## Related

- [Tailwind](./tailwind.md): Tailwind classes, variants for dark mode, pressed states and breakpoints.
- [Layout](./layout.md) and [Text](./text.md).
- [Animation](./animation.md): Animating values with native springs and timing curves.
- [Style reference](../modules/style-reference.md): Every style property and its type.
