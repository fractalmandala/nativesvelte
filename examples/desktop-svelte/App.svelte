<!--
  NativeSvelte Desktop:
  Demonstrates custom window chrome and desktop APIs:
  - Custom draggable title bar with `desktop={{ windowDrag: true }}`
  - Window control insets with `titleBar()`
  - System title bar style toggling with `currentWindow().set({ titleBar: ... })`
  - Cross-platform Application Menu with `Menu.setApplicationMenu`
  - Floating contextual popup menus with `Menu.popup`
  - Svelte 5 runes ($state, $derived, $effect)
-->
<script lang="ts">
  import { colorScheme, platform } from "nsh";
  import { Input } from "nsh/base";
  import { currentWindow, Menu, type MenuItem, titleBar } from "nsh/desktop";

  const mac = platform.os === "macos";

  const win = currentWindow();
  win.set({ title: "NativeSvelte Desktop" });

  let log = $state<string[]>([]);
  let wrap = $state(true);
  let hidden = $state(true);
  let opened = $state<string | null>(null);
  let search = $state("");

  const say = (line: string) => {
    log = [line, ...log].slice(0, 12);
  };

  let dark = $derived(colorScheme() === "dark");
  let barHeight = $derived(titleBar().height || 40);

  const menus: { label: string; submenu: MenuItem[] }[] = $derived([
    {
      label: "File",
      submenu: [
        { label: "New", shortcut: "mod+n", onSelect: () => say("File > New") },
        { label: "Open…", shortcut: "mod+o", onSelect: () => say("File > Open") },
        { label: "Save", shortcut: "mod+s", disabled: true },
        { type: "separator" },
        { label: "Recent", submenu: [{ label: "notes.txt", onSelect: () => say("Recent > notes.txt") }] },
        ...(mac ? [] : [{ type: "separator" } as const, { role: "quit", label: "Exit" } as const]),
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        { label: "Word Wrap", checked: wrap, onSelect: () => { wrap = !wrap; } },
        {
          label: "System Title Bar",
          checked: !hidden,
          shortcut: "mod+shift+t",
          onSelect: () => { hidden = !hidden; },
        },
        { type: "separator" },
        { role: "toggleFullScreen" },
      ],
    },
    {
      label: "Window",
      submenu: [{ role: "minimize" }, { role: "zoom" }, { type: "separator" }, { role: "close" }],
    },
  ]);

  $effect(() => {
    win.set({ titleBar: { style: hidden ? "hidden" : "default", height: 40 } });
  });

  $effect(() => {
    const appMenu: MenuItem[] = mac
      ? [
          {
            label: "NativeSvelte Desktop",
            submenu: [
              { role: "about" },
              { type: "separator" },
              { role: "hide" },
              { role: "hideOthers" },
              { role: "showAll" },
              { type: "separator" },
              { role: "quit" },
            ],
          },
        ]
      : [];

    Menu.setApplicationMenu([...appMenu, ...menus]);
  });

  const buttons: Record<string, { x: number; width: number }> = {};
</script>

<View style={{ flex: 1, backgroundColor: dark ? "#111318" : "#f4f5f7" }}>
  <View
    desktop={{ windowDrag: true }}
    style={{
      height: barHeight,
      paddingLeft: titleBar().left + 8,
      paddingRight: titleBar().right + 8,
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      backgroundColor: dark ? "#1b1e25" : "#e8eaef",
    }}
  >
    <Text style={{ fontSize: 13, fontWeight: "600", color: dark ? "#e6e8ec" : "#1f2328", marginRight: 8 }}>
      NativeSvelte Desktop
    </Text>

    {#if !mac}
      {#each menus as menu}
        <View
          onLayout={(e: any) => { buttons[menu.label] = { x: e.bounds.origin.x, width: e.bounds.size.width }; }}
          onPress={() => {
            const label = menu.label;
            opened = label;
            Menu.popup(menu.submenu, { x: buttons[label]?.x ?? 0, y: barHeight }).then(() => {
              opened = null;
            });
          }}
          style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}
          class="hover:bg-black/10 active:bg-black/15 dark:hover:bg-white/10 dark:active:bg-white/15"
          classList={{ "bg-black/15 dark:bg-white/15": opened === menu.label }}
        >
          <Text style={{ fontSize: 13, color: dark ? "#e6e8ec" : "#1f2328" }}>{menu.label}</Text>
        </View>
      {/each}
    {/if}

    <View style={{ flex: 1 }} />
    <Input
      testID="search-input"
      placeholder="Search"
      bind:value={search}
      style={{
        width: 180,
        height: 26,
        paddingHorizontal: 8,
        borderRadius: 6,
        fontSize: 13,
        backgroundColor: dark ? "#111318" : "#ffffff",
        color: dark ? "#e6e8ec" : "#1f2328",
      }}
    />
  </View>

  <View style={{ height: 1, backgroundColor: dark ? "#2a2e37" : "#d5d8de" }} />

  <View style={{ flex: 1, padding: 24, gap: 12 }}>
    <Text style={{ fontSize: 22, fontWeight: "bold", color: dark ? "#e6e8ec" : "#1f2328" }}>
      A title bar of the app's own
    </Text>
    <Text style={{ fontSize: 14, color: dark ? "#9aa1ad" : "#59636e" }}>
      Drag the bar to move the window, double-click it to maximize. The search field and the menu buttons stay
      clickable. Title bar area: {titleBar().height} high, {titleBar().left} left, {titleBar().right} right.
    </Text>

    <View style={{ flexDirection: "row", gap: 8 }}>
      <View
        onPress={() =>
          Menu.popup([
            { label: "Say hello", onSelect: () => say("Context > Say hello") },
            { label: "Disabled", disabled: true },
            { type: "separator" },
            { label: "Word Wrap", checked: wrap, onSelect: () => { wrap = !wrap; } },
          ])
        }
        style={{ backgroundColor: "#4f46e5", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 }}
      >
        <Text style={{ color: "#ffffff", fontSize: 14 }}>Context menu</Text>
      </View>
      <View
        onPress={() => { hidden = !hidden; }}
        style={{ backgroundColor: "#0f766e", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 }}
      >
        <Text style={{ color: "#ffffff", fontSize: 14 }}>Toggle title bar</Text>
      </View>
    </View>

    <Text style={{ fontSize: 14, color: dark ? "#9aa1ad" : "#59636e" }}>
      Word wrap: {wrap ? "on" : "off"}
    </Text>

    {#each log as line}
      <Text style={{ fontSize: 14, color: dark ? "#e6e8ec" : "#1f2328" }}>• {line}</Text>
    {/each}
  </View>
</View>
