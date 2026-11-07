---
title: Text
description: Showing text with paragraphs and text elements in Svelte and Rust - nested spans and links, inline views, fonts and decorations, truncation, system text size, selection and onTextLayout.
order: 35
group: ui
---

# Text

In NativeSvelte, text is rendered with standard HTML paragraph tags (`<p>`, `<span>`) or native `<Text>` elements, and `text(..)` in Rust. A text element represents a paragraph typeset by the platform's native text engine (CoreText on Apple platforms, `StaticLayout` on Android) on the engine thread and drawn on the main thread. Nested text elements are spans of the same paragraph, not separate native views.

```svelte tabs
<p class="text-base leading-6 text-[#1f2328]">
  By continuing you agree to the{' '}
  <span class="text-[#0969da] underline" onclick={openTerms}>
    Terms of service
  </span>.
</p>
```

```rust tabs
text("By continuing you agree to the ")
    .text_size(px(16.0))
    .line_height(px(24.0))
    .text_color(rgb(0x1f2328))
    .child(
        text("Terms of service")
            .text_color(rgb(0x0969da))
            .underline()
            .on_press(open_terms),
    )
    .child(".")
```

> [!IMPORTANT]
> Strings should always be placed inside text tags: `<p>`, `<span>`, or `<Text>`.

The element itself is documented on [text](../elements/text.md); this page is about using it.

## Strings and whitespace

In Svelte, expressions in text dynamically update when reactive state changes. Line breaks `\n` or template strings `{name}` are rendered as written:

```svelte tabs
<p>
  Hello, {name}!{'\n'}
  Welcome back.
</p>
```

```rust tabs
text(move || format!("Hello, {}!\nWelcome back.", name.get()))
```

## Spans and inheritance

A span inside a paragraph inherits the text style of its parent and overrides what it sets:

```svelte tabs
<p class="text-[17px] text-[#1f2328]">
  <span class="font-light">Light </span>
  <span class="font-bold">Bold </span>
  <span class="italic">Italic </span>
  <span class="tracking-widest">Spaced</span>
</p>
```

```rust tabs
text("")
    .text_size(px(17.0))
    .text_color(rgb(0x1f2328))
    .child(text("Light ").font_weight(FontWeight::LIGHT))
    .child(text("Bold ").font_weight(FontWeight::BOLD))
    .child(text("Italic ").italic())
    .child(text("Spaced").letter_spacing(px(4.0)))
```

Text styles also pass down from views, as in CSS: `class="text-white text-sm"` on a parent container styles the text inside it.

### Links

A span with a click handler (`onclick` or `on_press(..)`) acts as a link: a tap on its characters triggers the span's handler, while a tap elsewhere triggers the paragraph.

```svelte tabs
<p onclick={() => log("the sentence")}>
  Read the <span class="text-[#0969da] underline" onclick={() => open(termsUrl)}>terms</span> first.
</p>
```

```rust tabs
text("Read the ")
    .on_press(move || tapped.set("the sentence"))
    .child(text("terms").text_color(rgb(0x0969da)).on_press(move || tapped.set("terms")))
    .child(" first.")
```

### Backgrounds of spans

A span's background color and corner radius paint a box behind its characters on each line it reaches:

```svelte tabs
<p>
  Run <span class="font-mono bg-[#eff1f3] rounded px-1">npm test</span> first.
</p>
```

```rust tabs
text("Run ")
    .child(text(" npm test ").font_family("ui-monospace").bg(rgb(0xeff1f3)).rounded(px(4.0)))
    .child(" first.")
```

### Views and images inside text

Inline views or images can be nested inside text and wrap with words:

```svelte tabs
<p class="text-base leading-[26px]">
  Made with <img src={logo} class="w-[18px] h-[18px] inline-block" alt="" /> NativeSvelte. Status{' '}
  <span class="bg-[#1a7f37] rounded-full px-2 py-0.5 text-white text-xs font-bold inline-block">
    LIVE
  </span>
</p>
```

```rust tabs
text("Made with ")
    .text_size(px(16.0))
    .line_height(px(26.0))
    .child(image(LOGO).size(px(18.0)))
    .child(" nsh. Status ")
    .child(
        view()
            .bg(rgb(0x1a7f37))
            .rounded(px(9.0))
            .px(px(7.0))
            .h(px(18.0))
            .justify_center()
            .child(text("LIVE").text_color(white()).text_size(px(11.0)).font_weight(FontWeight::BOLD)),
    )
```

## Text styles

| Property | Svelte Tailwind class | Rust |
|---|---|---|
| Color | `text-[#...]`, `text-primary` | `.text_color(..)` |
| Font size | `text-sm`, `text-base`, `text-lg`, `text-[17px]` | `.text_size(px(..))` |
| Font weight | `font-normal`, `font-semibold`, `font-bold` | `.font_weight(FontWeight::BOLD)` |
| Italic | `italic` | `.italic()` |
| Font family | `font-sans`, `font-mono`, `font-[...]` | `.font_family(..)` |
| Line height | `leading-6`, `leading-[24px]` | `.line_height(px(..))` |
| Alignment | `text-left`, `text-center`, `text-right` | `.text_left()`, `.text_center()`, `.text_right()` |
| Decoration | `underline`, `line-through`, `decoration-wavy` | `.underline()`, `.line_through()`, `.text_decoration_wavy()` |
| Tabular numbers | `font-mono`, `tabular-nums` | `.tabular_nums()` |

```svelte tabs
<p class="text-lg font-mono">{price.toFixed(2)}</p>
<p class="underline decoration-wavy decoration-[#cf222e]">Typo</p>
<p class="text-3xl font-extrabold text-white [text-shadow:2px_2px_4px_rgba(0,0,0,0.6)]">
  Shadow
</p>
```

```rust tabs
text(move || format!("{:.2}", price.get())).text_size(px(18.0)).tabular_nums()
text("Typo").underline().text_decoration_wavy().text_decoration_color(rgb(0xcf222e))
text("Shadow")
    .text_size(px(26.0))
    .font_weight(FontWeight::EXTRA_BOLD)
    .text_color(white())
    .text_shadow([TextShadow {
        offset_x: px(2.0),
        offset_y: px(2.0),
        radius: px(4.0),
        color: rgba(0x00000099).into(),
    }])
```

`tabular-nums` gives every digit the same width, keeping counters and prices from jittering as they change.

## Truncation

```svelte tabs
<p class="line-clamp-2">{longDescription}</p>
<p class="truncate">{filePath}</p>
```

```rust tabs
text(long_description).number_of_lines(2)
text(file_path).number_of_lines(1).text_overflow(EllipsizeMode::Middle)
```

The Tailwind classes `line-clamp-*`, `text-ellipsis` and `text-clip` control multi-line limits, and `truncate` cuts on one line with an ellipsis.

## Selection

The class `select-text` lets the user select and copy text using the platform's native text selection and context menu:

```svelte tabs
<p class="select-text selection:bg-[#7c3aed] selection:text-white">{orderNumber}</p>
```

```rust tabs
text(order_number).select_text().selection_color(rgb(0x7c3aed))
```

## onTextLayout

In Svelte, use `ontextlayout` or `<Text onTextLayout={...}>` to measure lines after layout:

```svelte tabs
<Text
  onTextLayout={(e) => {
    lines = e.lines.length;
  }}
>
  {body}
</Text>
```

```rust tabs
text(move || body.get()).on(EventKind::TextLayout, move |e: &EventPayload| {
    if let EventPayload::TextLayout(laid_out) = e {
        lines.set(laid_out.len());
    }
})
```

## Related

- [Fonts](./fonts.md): Custom fonts and weights.
- [text element](../elements/text.md): Every prop.
- [Forms and keyboard](./forms-and-keyboard.md): Text input and text fields.
