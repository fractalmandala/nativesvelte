---
title: Layout
description: Flexbox with a column default, CSS grid, sizes and percentages, aspect ratio, absolute positioning, measuring with onLayout, responsive layouts and right-to-left, in Svelte and Rust.
order: 34
group: ui
demo: guide-layout
---

# Layout

NativeSvelte lays out every element with [Taffy](https://github.com/DioxusLabs/taffy), a high-performance Rust implementation of CSS flexbox, grid and block layout, configured so that children stack vertically and do not shrink by default. Layout runs in the engine core after each turn of reactive state, and only changed frames are committed to the native views.

In Svelte, layout properties use standard Tailwind classes (`flex-row`, `gap-4`, `grid-cols-3`, `absolute inset-0`, etc.) or inline styles. In Rust, they are typed methods (`.flex_row()`, `.gap_4()`, `.grid_cols(3)`, `.absolute().inset_0()`).

## Flexbox

A view lays out its children with flexbox. A view that sets no `display` stacks its children in a column; `class="flex-row"` (or `display: "flex"`) makes a row. Where nothing sets them, these defaults apply:

| Property | NativeSvelte default | Web default |
|---|---|---|
| `flexDirection` | `"column"` | `row` |
| `flexShrink` | `0` | `1` |
| `alignContent` | `"flex-start"` (in grids: `"normal"`) | `normal` |
| `alignItems` | `"stretch"` | `stretch` |
| `minWidth` / `minHeight` | `0` | `auto` |
| `position` | `"relative"` | `static` |

```svelte tabs
<div class="flex-row items-center gap-3 p-4">
  <img src={avatar} class="w-10 h-10 rounded-full" alt="" />
  <div class="flex-1 gap-0.5">
    <p class="font-semibold">{name}</p>
    <p class="line-clamp-1 text-muted-foreground">{message}</p>
  </div>
  <p class="text-muted-foreground">{time}</p>
</div>
```

```rust tabs
view()
    .flex_row()
    .items_center()
    .gap_3()
    .p_4()
    .child(image(avatar).size(px(40.0)).rounded(px(20.0)))
    .child(
        view()
            .flex_1()
            .gap_0p5()
            .child(text(name).font_weight(FontWeight::SEMIBOLD))
            .child(text(message).text_color(rgb(0x6e7781)).number_of_lines(1)),
    )
    .child(text(time).text_color(rgb(0x6e7781)))
```

| Property | Values | Rust |
|---|---|---|
| `flexDirection` | `flex-col`, `flex-row`, `flex-col-reverse`, `flex-row-reverse` | `.flex_col()`, `.flex_row()`, `.flex_col_reverse()`, `.flex_row_reverse()` |
| `justifyContent` | `justify-start`, `justify-center`, `justify-end`, `justify-between`, `justify-around`, `justify-evenly` | `.justify_start()`, `.justify_center()`, `.justify_end()`, `.justify_between()`, `.justify_around()` |
| `alignItems` | `items-stretch`, `items-start`, `items-center`, `items-end`, `items-baseline` | `.items_stretch()`, `.items_start()`, `.items_center()`, `.items_end()`, `.items_baseline()` |
| `flex` | `flex-1`, `flex-auto`, `flex-initial`, `flex-none` | `.flex_1()`, `.flex_auto()`, `.flex_none()` |
| `gap` | `gap-2`, `gap-4`, `gap-x-2`, `gap-y-4` | `.gap(length)`, `.gap_2()`, `.gap_x_4()` |

```svelte tabs
<div class="flex-row gap-2">
  <div class="flex-1 h-9 bg-[#c8e1ff]"></div>   <!-- one share -->
  <div class="flex-2 h-9 bg-[#79b8ff]"></div>   <!-- two shares -->
  <div class="w-9 h-9 bg-[#0366d6]"></div>     <!-- fixed -->
</div>
```

```rust tabs
view()
    .flex_row()
    .gap_2()
    // One share.
    .child(view().flex_1().h(px(36.0)).bg(rgb(0xc8e1ff)))
    // Two shares.
    .child(view().flex_grow(2.0).flex_shrink(1.0).basis(px(0.0)).h(px(36.0)).bg(rgb(0x79b8ff)))
    // Fixed.
    .child(view().size(px(36.0)).bg(rgb(0x0366d6)))
```

## Sizes

| Property | Svelte Tailwind class | Rust |
|---|---|---|
| `width`, `height` | `w-10`, `w-full`, `h-32`, `h-full`, `size-10` | `.w(px(..))`, `.h(..)`, `.w_full()`, `.size(px(..))` |
| `minWidth`, `maxWidth` | `min-w-0`, `min-w-full`, `max-w-md`, `max-w-screen` | `.min_w(..)`, `.max_w(..)` |
| `aspectRatio` | `aspect-square`, `aspect-video`, `aspect-[16/9]` | `.aspect_ratio(16.0 / 9.0)`, `.aspect_square()` |
| `padding` | `p-4`, `px-3`, `py-2`, `pt-1`, `pb-1` | `.p(..)`, `.px(..)`, `.py(..)` |
| `margin` | `m-4`, `mx-auto`, `my-2` | `.m(..)`, `.mx(..)` |

```svelte tabs
<div class="w-full aspect-video bg-black" />
```

```rust tabs
view().w_full().aspect_ratio(16.0 / 9.0).bg(black())
```

## Grid

`class="grid"` (`.grid()` in Rust) lays out children in CSS grid tracks:

```svelte tabs
<div class="grid grid-cols-3 gap-2">
  <div class="col-span-2 h-[60px] bg-[#d8b9ff]"></div>
  <div class="h-[60px] bg-[#b083f0]"></div>
  <div class="row-span-2 bg-[#8250df]"></div>
  <div class="col-start-2 col-end-4 h-[60px] bg-[#6639ba]"></div>
</div>
```

```rust tabs
view()
    .grid()
    .grid_template_columns("repeat(3, 1fr)")
    .gap_2()
    .child(view().col_span(2).h(px(60.0)).bg(rgb(0xd8b9ff)))
    .child(view().h(px(60.0)).bg(rgb(0xb083f0)))
    .child(view().row_span(2).bg(rgb(0x8250df)))
    .child(view().col_start(2).col_end(4).h(px(60.0)).bg(rgb(0x6639ba)))
```

```svelte tabs
<div class="grid grid-cols-[16px_1fr_16px]">
  <div class="col-start-2 col-end-3 h-[60px] bg-[#b083f0]"></div>
  <div class="col-start-1 col-end-4 h-[60px] bg-[#8250df]"></div>
</div>
```

```rust tabs
view()
    .grid()
    .grid_template_columns("[full-start] 16px [content-start] 1fr [content-end] 16px [full-end]")
    .child(view().col_start(2).col_end(3).h(px(60.0)).bg(rgb(0xb083f0)))
    .child(view().col_start(1).col_end(4).h(px(60.0)).bg(rgb(0x8250df)))
```

## Absolute positioning

`class="absolute"` (`.absolute()`) takes a view out of the flow and places it relative to its parent container:

```svelte tabs
<div class="h-[200px] relative">
  <img src={cover} class="absolute inset-0 w-full h-full object-cover" alt="" />
  <div class="absolute left-3 right-3 bottom-3">
    <p class="text-white font-bold">Caption</p>
  </div>
</div>
```

```rust tabs
view()
    .h(px(200.0))
    .child(image(cover).absolute().inset_0())
    .child(
        view()
            .absolute()
            .left_3()
            .right_3()
            .bottom_3()
            .child(text("Caption").text_color(white()).font_weight(FontWeight::BOLD)),
    )
```

## Measuring

`onlayout` (`.on_layout(..)`) reports a view's frame, relative to its parent, after each layout:

```svelte tabs
<script>
  let width = $state(0);
</script>

<div onlayout={({ bounds }) => (width = bounds.size.width)}>
  <p>{width} points wide</p>
</div>
```

```rust tabs
let width = signal(0.0_f32);

view()
    .on_layout(move |frame: &Bounds<Points>| width.set(frame.size.width.0))
    .child(text(move || format!("{} points wide", width.get())))
```

For responsive layouts across breakpoints, use Tailwind's responsive modifiers (`sm:`, `md:`, `lg:`):

```svelte tabs
<div class="flex-col md:flex-row" />
```

```rust tabs
view().style_when(|| window().width > px(600.0), |s| s.flex_row())
```

## Safe areas

The root view covers the entire screen, including beneath status bars and home indicator bars. Pad screens by the safe area insets using CSS's `env()`:

```svelte tabs
<div class="flex-1 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
  <!-- Content safely placed within device bounds -->
</div>
```

```rust tabs
view().p_safe_area()
```

## Right to left

NativeSvelte supports RTL layout natively based on the system locale or explicit direction styling:

```svelte tabs
<script>
  let rtl = $state(false);
</script>

<div class={rtl ? "rtl" : "ltr"}>
  <div class="flex-row gap-2">
    <div class="ms-4 rounded-ss-xl w-11 h-11 bg-[#54aeff]"></div>
  </div>
  <button onclick={() => (rtl = !rtl)}>
    <p>{rtl ? "Right to left" : "Left to right"}</p>
  </button>
</div>
```

```rust tabs
view()
    .flex_row()
    .gap_2()
    .child(view().ms_4().rounded_ss(px(12.0)).size(px(44.0)).bg(rgb(0x54aeff)))

let rtl = signal(false);
view()
    .direction(move || if rtl.get() { LayoutDirection::Rtl } else { LayoutDirection::Ltr })
    .on_press(move |_: &()| rtl.set(!rtl.get()))
    .child(text(move || if rtl.get() { "Right to left" } else { "Left to right" }))
```

## Related

- [Styling](./styling.md): How styles combine and visual styles.
- [Scrolling](./scrolling.md) and [Lists](./lists.md): Content larger than the screen.
- [Style reference](../modules/style-reference.md): Every layout property and its type.
