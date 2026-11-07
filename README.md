# NativeSvelte

> ! This project is a complete experiment, mostly vibe coded, and I might not really know what I'm doing. What I'm trying to do is NativeShell except it works with Svelte out-of-the-box. You are currently safer going to NativeShell directly !

**Build once with Svelte, native everywhere.** NativeSvelte is a native UI framework for iOS, Android, macOS, Windows,
Linux and the web, built in Rust. It unifies components, fine-grained state, logic and APIs, with app-owned visual design and
platform rendering: native views on iOS (UIKit), Android (Views), macOS (AppKit), Windows (Win32/Direct2D), and Linux (GTK 4),
GPUI in GPUI apps, HTML on the web, character cells in a terminal, with the platform's own text, input and interaction.
Write your app in **Svelte 5** (runes) or **SvelteKit** (file-based routing), in **Rust**, in **TSX**, or combine them with shared Rust components.

> **Attribution & Origin**: NativeSvelte is forked from and extends [Native Shell (NSH)](https://github.com/longbridge/nsh) by Longbridge. It brings Svelte 5's fine-grained reactive model (`$state`, `$derived`, `$effect`, `$props`) and SvelteKit routing directly to NSH's high-performance native Rust core and platform view backends.

Documentation, guides and live demos: **[nativesvelte.dev](https://nativesvelte.dev)**.

## Goals

Native views and interaction, with an app-owned design: NativeSvelte shares components, state and APIs across platforms,
while the app controls colors, typography, spacing, shapes and motion. `nsh/base` provides the behavior and accessible
structure of common controls such as `Button`, `Checkbox` and `Switch`; apps and community libraries give them a look.
Platform modules expose capabilities specific to their platforms, such as the mobile system tab bar.

## Features

- **Svelte 5 Runes & SvelteKit**: Write components using `$state`, `$derived`, `$effect`, and `$props`, and use file-based routing (`src/routes/+layout.svelte`, `+page.svelte`, client `load()`).
- **Native everywhere**: Renders with each platform's own UI views, sharing the same reactive engine, flexbox and grid layout (Taffy), system text, input and accessibility.
- **Drawn with zero virtual DOM**: Svelte runes compile directly to native signals and native view ops (`element`, `prop`, `bindProp`, `insert`, `each`, `append`).
- **Write in Svelte, TSX, Rust, or all three**: Interoperate seamlessly — Svelte components can render TSX and native Rust components, and vice versa.
- **App-owned look**: Tailwind utility classes, reactive theme tokens, and an unstyled UI foundation (`nsh/base`: navigation, safe areas, dialogs, keyboard, status bar).
- **Fast iterations**: Instant Hot Module Replacement (HMR) preserving signal state, headless tracing, and a single Rust-built CLI for building and packaging.

### Platforms

| Platform | Drawn with | Embed with | Requires |
|---|---|---|---|
| iOS | UIKit, CoreText | `NshAppView` (Swift, `NativeShell.xcframework`) | iOS 15+ |
| Android | Android views, `StaticLayout` | `NshView` (Java / Kotlin, `nsh.aar`) | Android 9 (API 28)+ |
| macOS | AppKit, Core Animation, CoreText | `AppView` (Rust, `nsh-platform-macos`) | macOS 14+ |
| Windows | Win32, Direct2D, DirectWrite | `AppView` (Rust, `nsh-platform-windows`) | Windows 10 1809+ |
| Linux | GTK 4, Pango | `AppView` (Rust, `nsh-platform-linux`) | GTK 4.14+ |
| GPUI (macOS, Windows, Linux) | GPUI (GPUI Fast) | `AppView` (Rust, a GPUI view, `nsh-platform-gpui`) | macOS, Windows; Linux with Vulkan |
| Terminal | ratatui, the terminal's Cell grid | `AppView` (Rust, an area of a ratatui frame, `nsh-platform-tui`) | Terminals on macOS, Windows, Linux |
| Web | HTML, CSS | `createPlayer` (JavaScript) or an iframe | Modern browsers |

Each desktop runs and packages apps with its own backend (AppKit, Win32, GTK 4). The GPUI backend draws with GPUI on
all three desktops and embeds NSH in GPUI and GPUI Kit apps; `nsh run --target gpui` shows an app as they do. The web
platform (`nsh run --target web`, `nsh package --target web`) publishes apps as static sites and runs the website's
live demos.
The terminal backend (`nsh run --target tui`) draws apps on a terminal's character grid in its own colors, with the
keyboard and the mouse.

## Quick start

Install the `nsh` command ([other ways](https://nsh.dev/docs/installation)):

<details open>
<summary>macOS / Linux</summary>

```sh
curl -fsSL https://nsh.dev/install.sh | sh
```

Build and install the latest `main` from source (Git, Rust and the
[platform build dependencies](https://nsh.dev/docs/installation) required):

```sh
curl -fsSL https://nsh.dev/install.sh | sh -s -- --source
```

Re-run to update. The checkout stays in `~/.nsh/source` for runtime builds.

</details>

<details>
<summary>Homebrew</summary>

```sh
brew install longbridge/tap/nsh
```

</details>

<details>
<summary>Windows (PowerShell)</summary>

```powershell
irm https://nsh.dev/install.ps1 | iex
```

</details>

Choose how to write your app:

| | Rust | TSX |
|---|---|---|
| Create | `nsh init my-app --template rust` | `nsh init my-app --template ts` |
| Write | Rust components, typed styles and signals | TSX components, Tailwind classes and signals |
| Iterate | Rebuild and restart on Rust changes | Hot updates that preserve state |
| Toolchain | `nsh` and [Rust](https://rustup.rs) | `nsh` |

You can also combine them (`nsh init my-app --template mixed`): TSX screens import your Rust components and modules. See
[Building with Rust](https://nsh.dev/docs/rust) for Rust apps and mixed projects.

Run either app on your chosen platform:

<details>
<summary>iOS</summary>

```sh
nsh run my-app --target ios        # iOS simulator; requires Xcode
nsh run my-app --target catalyst   # Mac Catalyst window on macOS
```

</details>

<details>
<summary>Android</summary>

```sh
nsh run my-app --target android    # emulator or device; requires the Android SDK
```

</details>

<details>
<summary>macOS</summary>

```sh
nsh run my-app --target macos      # AppKit window
```

</details>

<details>
<summary>Windows</summary>

```sh
nsh run my-app --target windows    # Win32 window
```

</details>

<details>
<summary>Linux</summary>

```sh
nsh run my-app --target linux      # GTK 4 window
```

</details>

<details>
<summary>GPUI (macOS, Windows, Linux)</summary>

```sh
nsh run my-app --target gpui       # as GPUI apps that embed it show it
```

</details>

<details>
<summary>Terminal</summary>

```sh
nsh run my-app --target tui        # in the current terminal
```

</details>

<details>
<summary>Web</summary>

```sh
nsh run my-app --target web        # open in the browser
```

</details>

The Rust template includes a Cargo project with its root component in `src/lib.rs`. The TSX template includes
`App.tsx`, `nsh.json` and `tsconfig.json`, with generated TypeScript declarations in `.nsh/types` for your editor.
Logs and errors show in the terminal. What each platform needs:
[Installation](https://nsh.dev/docs/installation#platform-tools).

## Examples

| Example | What it shows |
|---|---|
| [`examples/gallery-rs`](examples/gallery-rs) | The gallery written in Rust: an app with no TSX and no QuickJS |
| [`examples/rust-exports`](examples/rust-exports) | A TSX app using a component, a module and a class of its own Rust crate |
| [`examples/gallery`](examples/gallery) | A tour of what NSH supports: lists, navigation, forms, controls, gestures, animation, images, styles, text, web view and video, `fetch` |
| [`examples/counter`](examples/counter) | The smallest app |
| [`examples/tasks-rs`](examples/tasks-rs) | A small Rust app with a store, pages, a list, a system alert and tests, laid out as the Coding Guides say |
| [`examples/tasks`](examples/tasks) | The same app in TSX |
| [`examples/hopper`](examples/hopper) | A dark, tabbed dashboard built only from primitives: interactive canvas charts, sliders, menus, animation |
| [`examples/desktop`](examples/desktop) | A desktop app with a title bar and menus of its own (`nsh/desktop`) |
| [`examples/embed-ios`](examples/embed-ios), [`examples/embed-android`](examples/embed-android) | NSH inside existing native apps, with a native component the app registers |
| [`examples/bench`](examples/bench) | Rust components against the same components in TSX |

```sh
cargo run
```

## Skills for AI coding agents

Install the NSH skills for your coding agent (Claude Code, Codex, Cursor, Gemini CLI and others), so it follows
NSH's model in Rust, Rust with TSX, or TSX:

```sh
npx skills add longbridge/nsh
```

| Skill | What it gives the agent |
|---|---|
| [`nsh`](skills/nsh/SKILL.md) | Building apps in Rust (preferred), Rust with TSX, or TSX: the Coding Guides, a page per mode, tooling, and a tested app in Rust and in TSX |
| [`nsh-design-guides`](skills/nsh-design-guides/SKILL.md) | The Design Guides, for any screen, interaction or interface copy |

## Acknowledgements

NSH builds on the ideas of these projects:

- [GPUI](https://gpui.rs), Zed's UI framework: the typed units and geometry (`Points`, `Point`, `Size`,
  `Bounds`, `Edges`), `SharedString`, typed styles in Rust and much of the vocabulary of NSH's API.
- [GPUI Kit](https://gpui-kit.com): `gpui-base`'s unstyled base components, which `nsh-base`
  follows in names and scope, and the Coding and Design Guides.
- [shadcn/ui](https://ui.shadcn.com): the design tokens of NSH's theme, its default theme (`neutral`) and the
  `cssVars` theme files apps write or export from shadcn's themes and tweakcn.
- [Solid](https://solidjs.com): the reactive graph, signals, memos, effects, owners and context, which both the
  Rust and the TSX side of NSH run on.

## License

Licensed under the [Apache License, Version 2.0](LICENSE-APACHE).

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in this project by you, as
defined in the Apache-2.0 license, shall be licensed under Apache-2.0, without any additional terms or conditions.
