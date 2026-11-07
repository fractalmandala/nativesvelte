---
title: सुगम्यता (Accessibility)
description: VoiceOver एवं TalkBack के साथ अनुप्रयोग संचालन - नामपत्र (Labels), भूमिकाएँ,
  अवस्थाएँ, मान, स्वैच्छिक क्रियाएँ, समूहन, घोषणाएँ एवं दृष्टि सुगमता।
order: 48
group: ui
---


# Accessibility <span id="accessibility"></span>

NSH renders with native views, so the platforms' assistive technologies (VoiceOver on iOS and Mac Catalyst, TalkBack on Android, Switch Control, Voice Control, ...) see your app's real view hierarchy. What you add are the descriptions those technologies cannot infer: what an element is, what it says, what state it is in and what it can do. Every element accepts the methods (Rust) and props (TSX) below.

## स्वतः प्राप्त सुविधाएँ <span id="what-you-get-without-doing-anything"></span>

- **Text is read.** A text element is an accessibility element whose label is its text. A view without a label is read as the texts inside it.
- **Pressable views are elements.** A view with a press or long press handler (`.on_press`, `onPress`) is an accessibility element by default, and activating it (double tap with VoiceOver or TalkBack) presses it.
- **Inputs are text fields**, with their placeholder, value and keyboard.
- **Text follows the user's size setting.** See [Text size](#text-size).

## नामपत्र, संकेत एवं भूमिकाएँ <span id="labels-hints-and-roles"></span>

```rust tabs
view()
    .on_press(play)
    .role(AccessibilityRole::Button)
    .label("Play")
    .hint("Starts the song")
    .size(px(44.0))
    .items_center()
    .justify_center()
    .child(text("▶"))
```

```svelte tabs
<button
  onclick={play}
  aria-label="Play"
  accessibilityHint="Starts the song"
  class="w-11 h-11 items-center justify-center"
>
  <span>▶</span>
</button>
```

| Rust | Svelte | प्रकार (Type) | विवरण (Description) |
|---|---|---|---|
| `.accessible(..)` | `accessible` | `boolean` | The view is one element for assistive technologies; its children are not exposed separately. |
| `.label(..)` | `accessibilityLabel` | `string` | What screen readers read, instead of the texts inside. |
| `.hint(..)` | `accessibilityHint` | `string` | What activating the element does, read after a pause. |
| `.role(..)` | `role` | `AccessibilityRole` | What the element is. |
| `.accessibility_state(..)` | `accessibilityState` | `AccessibilityState` | Its state: disabled, selected, checked, busy, expanded, pressed, current, has popup. `selected` also applies the selected style, `checked` the checked style when true and the indeterminate style when `"mixed"`, `pressed` the pressed style when true. |
| `.accessibility_level(..)` | `accessibilityLevel` | `number` | The level of a heading (1 the top), the depth of a tree item (1 at the top). |
| `.accessibility_value(..)` | `accessibilityValue` | `{ min?, max?, now?, text? }` | The value of a range or textual element. |
| | `accessibilityActions` | `{ name, label? }[]` | Actions offered to assistive technologies. |
| `.on_accessibility_action(..)` | `onAccessibilityAction` | `(e: { actionName }) => void` | An action was performed (Rust: its name). |
| `.accessibility_elements_hidden(..)` | `accessibilityElementsHidden` | `boolean` | Hides the view and its subtree from assistive technologies. |
| | `importantForAccessibility` | `"auto" \| "yes" \| "no" \| "no-hide-descendants"` | Whether the view (and its subtree) is exposed. |
| | `android={{ accessibilityLiveRegion }}` | `"none" \| "polite" \| "assertive"` | Android: how changes of the view are announced to TalkBack. |
| `.test_id(..)` | `testID` | `string` | An identifier for UI tests (the accessibility identifier on iOS, the resource id on Android); not read aloud. |

Give every icon-only control a label: a screen reader cannot read a glyph or an image. Keep labels short and do not include the role ("Play", not "Play button"): the role is announced on its own.

### Roles <span id="roles"></span>

The role (`.role(AccessibilityRole::Header)`, `role="header"`) tells the user what kind of element this is and how to operate it. In Rust it is an `AccessibilityRole` variant (`Button`, `Header`, `Switch`, ...); the TSX values are `"none"`, `"button"`, `"link"`, `"search"`, `"image"`, `"imagebutton"`, `"keyboardkey"`, `"text"`, `"adjustable"`, `"header"`, `"summary"`, `"alert"`, `"checkbox"`, `"combobox"`, `"menu"`, `"menubar"`, `"menuitem"`, `"progressbar"`, `"radio"`, `"radiogroup"`, `"scrollbar"`, `"spinbutton"`, `"switch"`, `"tab"`, `"tablist"`, `"timer"`, `"toolbar"`, `"list"`, `"grid"`, `"table"`, `"rowgroup"`, `"row"`, `"columnheader"` and `"cell"` (the roles of [`Table`](../elements/table.md)'s parts), `"listbox"` and `"option"` (a list of options to choose from, such as [`Select`](../elements/select.md)'s list, and its options, the chosen one marked by `accessibilityState.selected`), `"group"` (related elements that belong together), `"region"` (a section worth reaching on its own, such as an accordion's panel), `"navigation"` (links that move around the app, such as a pagination), `"tree"` and `"treeitem"` (items that expand and collapse, each at its `accessibilityLevel`), `"menuitemcheckbox"` and `"menuitemradio"` (menu items that are checked, alone or as one choice of a group).

The most useful ones:

- `"button"` for anything pressable that is not a link; `"link"` for navigation to content.
- `"header"` for section titles: screen reader users jump between headers to skim a screen. `accessibilityLevel` gives its level (1 the top) where the platform reads one.
- `"button"` with `accessibilityState.pressed` for a toggle button, one that stays on or off (bold in a toolbar).
- `"navigation"` around links that move between pages, the link of the shown page with `accessibilityState.current: "page"`.
- `"switch"`, `"checkbox"`, `"radio"` with `accessibilityState.checked`.
- `"adjustable"` for sliders and steppers, with `accessibilityValue` and the `increment` / `decrement` actions
  (each thumb of a [`Slider`](../elements/slider.md) is one).
- `"spinbutton"` for a field that holds a number the user can also step, with the same value and actions (the
  field of a [`NumberInput`](../elements/number-input.md)).
- `"image"` for meaningful images, with a label; decorative images should be hidden instead.

```rust tabs
text("Settings")
    .role(AccessibilityRole::Header)
    .text_size(px(22.0))
    .font_weight(FontWeight::BOLD)
```

```svelte tabs
<h1 role="header" class="text-[22px] font-bold">Settings</h1>
```

### अवस्थाएँ एवं मान <span id="states-and-values"></span>

For an on / off control in an app, use [`Switch`](../elements/switch.md) from `nsh/base`, which sets the role and state itself. The example shows what a role and state on a view do.

```rust tabs
use nsh_core::{Checked, prelude::*};

// A toggle drawn with views.
view()
    .on_press(move || on.update(|v| *v = !*v))
    .role(AccessibilityRole::Switch)
    .label("Wi-Fi")
    .accessibility_state(move || AccessibilityState {
        checked: Some(if on.get() { Checked::True } else { Checked::False }),
        ..AccessibilityState::default()
    })
    .hit_slop(EdgeInsets::all(px(8.0)))
    .w(px(51.0))
    .h(px(31.0))
    .rounded_full()
    .p(px(2.0))
    .bg(move || if on.get() { rgb(0x22c55e) } else { rgb(0xd4d4d8) })
    .child(
        view()
            .size(px(27.0))
            .rounded_full()
            .bg(white())
            .style_with(move |s| s.translate_x(px(if on.get() { 20.0 } else { 0.0 }))),
    )
```

```svelte tabs
<!-- A toggle drawn with views -->
<button
  onclick={() => (on = !on)}
  role="switch"
  aria-label="Wi-Fi"
  aria-checked={on}
  hitSlop={8}
  class="h-[31px] w-[51px] rounded-full p-0.5 transition-colors {on ? 'bg-green-500' : 'bg-zinc-300'}"
>
  <div class="size-[27px] rounded-full bg-white transition-transform {on ? 'translate-x-5' : ''}"></div>
</button>
```

The state is `AccessibilityState { disabled, selected, checked: Option<Checked>, busy, expanded, pressed: Option<Checked>, current: Option<AccessibilityCurrent>, has_popup }` in Rust and `{ disabled?, selected?, checked?: boolean | "mixed", busy?, expanded?, pressed?: boolean | "mixed", current?: boolean | "page" | "step" | "location" | "date" | "time", hasPopup? }` in TSX. `pressed` makes a button a toggle button (ARIA's `aria-pressed`); `current` marks the current item of a set (ARIA's `aria-current`): a pagination's page, a wizard's step; `hasPopup` marks the trigger of a popup, a menu or a list (ARIA's `aria-haspopup`), whose `expanded` says whether it is open, where an `expanded` element without it is a disclosure that shows its content in place (`Popover`, `Menu`, `HoverCard`, `Select`, `Combobox` and `DatePicker` set it on their triggers). `disabled` is also implied by disabling the view (`.disabled(..)`, `disabled`). `accessibilityValue` with `min`, `max` and `now` is read as a percentage; with `text` it is read as given ("3 of 10", "Medium").

## Actions <span id="actions"></span>

A pressable view supports activation already. For anything else, declare actions with `accessibilityActions` and handle them with `onAccessibilityAction`; a Rust component hears the performed action's name with `.on_accessibility_action(|name: &str| ..)`:

```svelte
<script>
  let n = $state(1);
</script>

<div
  accessible
  role="adjustable"
  aria-label="Quantity"
  accessibilityValue={{ text: String(n) }}
  accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
  onaccessibilityaction={(e) => {
    if (e.actionName === "increment") n++;
    if (e.actionName === "decrement") n = Math.max(0, n - 1);
  }}
  class="flex-row items-center gap-3"
>
  <button onclick={() => (n = Math.max(0, n - 1))}><span>−</span></button>
  <span>{n}</span>
  <button onclick={() => n++}><span>+</span></button>
</div>
```

Some action names are standard and map to the platforms' own gestures:

| Name | iOS (VoiceOver) | Android (TalkBack) |
|---|---|---|
| `activate` | Double tap | Double tap (click) |
| `increment`, `decrement` | Swipe up / down, then VoiceOver reads the new value | Scroll forward / backward |
| `longpress` | | Double tap and hold |
| `expand`, `collapse` | | Expand / collapse |
| `magicTap` | Two-finger double tap | |
| `escape` | Two-finger Z scrub | |

An element with `increment` or `decrement` is adjustable whatever its role: a chart keeps its `"image"` role and steps through its points with VoiceOver's swipes and TalkBack's scrolls, its `accessibilityValue` read after each step.

Any other name becomes a custom action, listed in VoiceOver's actions rotor and TalkBack's actions menu with its `label` (or its name). Custom actions are the accessible form of swipe-to-delete and similar gestures:

```svelte
<div
  accessibilityActions={[{ name: "archive", label: "Archive" }, { name: "delete", label: "Delete" }]}
  onaccessibilityaction={(e) => (e.actionName === "archive" ? archive(mail.id) : remove(mail.id))}
>
  …
</div>
```

## समूहन एवं गोपन <span id="grouping-and-hiding"></span>

Making a view accessible (`.accessible(true)`, `accessible`) makes a view one element: a card with a title, a subtitle and a price is read in one go, instead of the user swiping through three texts.

```rust tabs
view()
    .accessible(true)
    .on_press(open)
    .role(AccessibilityRole::Button)
    .p(px(16.0))
    .child(text("Blue jacket"))
    .child(text("Size M"))
    .child(text("$120"))
```

```svelte tabs
<div accessible onclick={open} role="button" class="p-4">
  <span>Blue jacket</span>
  <span>Size M</span>
  <span>$120</span>
</div>
```

Hide what adds nothing: decorative images, dividers, an icon next to a text that already says the same.

```svelte
<img src={decoration} alt="" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />
```

`accessibilityElementsHidden` (iOS's name) and `importantForAccessibility="no-hide-descendants"` (Android's) both hide the subtree on both platforms; setting both is harmless.

## screen reader and  user's settings <span id="the-screen-reader-and-the-users-settings"></span>

In Rust, the prelude reports the user's settings and talks to the screen reader: `screen_reader()` and `reduce_motion()` are reactive, `announce_for_accessibility(message)` has the screen reader read a message, and an element's `element_ref()` moves the screen reader's focus to it with `set_accessibility_focus()`. In TSX, `nsh`'s accessibility API reports the user's settings and lets you talk to the screen reader.

| Member | Description |
|---|---|
| `screenReaderEnabled()` | Whether VoiceOver or TalkBack runs (reactive). |
| `reduceMotion()` | Whether the user asked for less motion (reactive). |
| `announce(message)` | The screen reader reads `message`. |
| `setAccessibilityFocus(ref)` | Moves the screen reader's focus to a view. |

The settings are accessors: read them in a binding or an effect, and what reads them updates when the user changes the setting, with no cleanup.

```rust tabs
use nsh_core::prelude::*;

fn upload() -> impl IntoElement {
    let done = signal(false);
    let result = element_ref();
    let finish = move || {
        done.set(true);
        announce_for_accessibility("Upload complete");
        result.set_accessibility_focus();
    };
    view()
        .gap(px(12.0))
        // Autoplaying carousels are hard to use with a screen reader: show a list instead.
        .child(when(move || !screen_reader(), photo_carousel).otherwise(photo_list))
        .child(
            text(move || if done.get() { "Uploaded 3 photos" } else { "Uploading…" })
                .element_ref(&result),
        )
}
```

```svelte tabs
<script>
  import { announce, screenReaderEnabled, setAccessibilityFocus } from "nsh";

  let done = $state(false);
  let result = $state();

  function finish() {
    done = true;
    announce("Upload complete");
    if (result) setAccessibilityFocus(result);
  }
</script>

<div class="gap-3">
  <!-- Autoplaying carousels are hard to use with a screen reader: show a list instead -->
  {#if !screenReaderEnabled()}
    <PhotoCarousel />
  {:else}
    <PhotoList />
  {/if}
  <span bind:this={result}>{done ? "Uploaded 3 photos" : "Uploading…"}</span>
</div>
```

Announce changes the user would otherwise miss: a background save finishing, an error appearing away from the focus, a timer ending. On Android, `android={{ accessibilityLiveRegion: "polite" }}` on a view makes TalkBack announce its changes by itself.

## पाठ का आकार <span id="text-size"></span>

Text and inputs follow the system text size (Dynamic Type on iOS, font size on Android) unless you turn it off (`.allow_font_scaling(false)`, `allowFontScaling={false}`). Rather than turning it off, design for it:

- Let text wrap: avoid fixed heights on views that contain text.
- Cap very large headings with `.max_font_size_multiplier(..)` / `maxFontSizeMultiplier` instead of disabling scaling.
- Switch layouts when the text is large: read `font_scale()` (Rust) or `fontScale()` from `nsh` (TSX) (for example, stack a label and its value vertically above 1.3).

See [Device and environment](./device-and-environment.md#text-size).

## गति संकोच (Reduced Motion) <span id="reduced-motion"></span>

`reduce_motion()` (Rust) and `reduceMotion()` (TSX) are `true` when the user turned on iOS's Reduce Motion or Android's remove animations setting. Your animations run as you write them, so use it, or the `motion-reduce:` and `motion-safe:` Tailwind variants, to replace large movement with a fade or an instant change:

```rust tabs
use nsh_core::{element::LayoutAnimation, prelude::*};

let toggle = move || {
    if !reduce_motion() {
        animate_layout(LayoutAnimation::SPRING);
    }
    expanded.update(|e| *e = !*e);
};

view()
    .on_press(toggle)
    .when(!reduce_motion(), |v| v.active(|s| s.scale(0.95)))
```

```svelte tabs
<script>
  import { reduceMotion, LayoutAnimation } from "nsh";

  let expanded = $state(false);

  function toggle() {
    if (!reduceMotion()) LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    expanded = !expanded;
  }
</script>

<button onclick={open} class="transition active:scale-95 motion-reduce:transition-none"></button>
<div class="motion-safe:animate-bounce"></div>
```

## Touch targets <span id="touch-targets"></span>

Make pressable elements at least 44 × 44 points. When a control must look smaller, extend its touch area with the hit slop (`.hit_slop(..)`, `hitSlop`) instead of its size; see [Touch and gestures](./touch-and-gestures.md#hit-areas-hitslop).

## Checking your app <span id="checking-your-app"></span>

- Turn on VoiceOver (iOS Settings, Accessibility, or triple-click the side button if set up) or TalkBack, and use the app without looking: every control should say what it is and what it does.
- On iOS simulators, Xcode's Accessibility Inspector shows each element's label, traits and value.
- Try the largest text size and dark mode.
- A test id (`.test_id(..)`, `testID`) gives UI tests a stable handle that does not change with the label's language.

## संबंधित प्रलेखन <span id="related"></span>

- [`nsh`'s accessibility API](../modules/nsh.md#accessibility): the reference.
- [`View`](../elements/view.md): every accessibility prop.
- [Animation](./animation.md#reduced-motion) and [Device and environment](./device-and-environment.md).
