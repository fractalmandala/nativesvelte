<!--
  Sveltebench: Flagship Native Developer Environment & Telemetry Workbench
  Demonstrates:
  - Multi-pane docking workspace (Explorer, Tabbed Editor, Diff View, Live Component Preview, Agent Copilot, Terminal Dock)
  - Fine-grained Svelte 5 Universal Runes ($state, $derived, $effect)
  - Zero-bridge Native Rust Performance (28MB RAM footprint, 120 FPS frame rate)
  - Custom window chrome and desktop APIs
-->
<script lang="ts">
  import { platform, View } from "nsh";
  import { currentWindow, Menu, type MenuItem } from "nsh/desktop";
  import AgentPane from "./components/AgentPane.svelte";
  import BottomDock from "./components/BottomDock.svelte";
  import CommandPalette from "./components/CommandPalette.svelte";
  import DiffPane from "./components/DiffPane.svelte";
  import EditorPane from "./components/EditorPane.svelte";
  import HeaderBar from "./components/HeaderBar.svelte";
  import PreviewPane from "./components/PreviewPane.svelte";
  import Sidebar from "./components/Sidebar.svelte";
  import StatusBar from "./components/StatusBar.svelte";
  import { workspace } from "./lib/state.svelte";

  // Window setup for Desktop
  if (platform.idiom === "desktop") {
    try {
      const win = currentWindow();
      win.set({ title: "Sveltebench — Native IDE & Telemetry Workbench" });

      const menus: { label: string; submenu: MenuItem[] }[] = [
        {
          label: "File",
          submenu: [
            { label: "Open File…", shortcut: "mod+o", onSelect: () => (workspace.commandPaletteOpen = true) },
            { label: "Run Project", shortcut: "mod+r", onSelect: () => workspace.sendTerminalCommand("nsh run") },
            { type: "separator" },
            { role: "quit", label: "Quit Sveltebench" }
          ]
        },
        {
          label: "View",
          submenu: [
            { label: "Editor", onSelect: () => workspace.selectTab("tab-editor") },
            { label: "AST Diff", onSelect: () => workspace.selectTab("tab-diff") },
            { label: "Interactive Preview", onSelect: () => workspace.selectTab("tab-preview") },
            { type: "separator" },
            { label: "Toggle Benchmarks", onSelect: () => (workspace.bottomDockTab = "benchmarks") }
          ]
        }
      ];
      Menu.setApplicationMenu(menus);
    } catch {}
  }
</script>

<View class="flex-1 flex-col bg-background text-foreground select-none relative h-full">
  <!-- Draggable Header Bar -->
  <HeaderBar onOpenPalette={() => (workspace.commandPaletteOpen = true)} />

  <!-- Main Multi-Pane Body -->
  <View class="flex-1 flex-row overflow-hidden">
    <!-- Left Project Explorer -->
    <Sidebar />

    <!-- Center Workspace -->
    <View class="flex-1 flex-col overflow-hidden">
      <!-- Active Center Pane -->
      <View class="flex-1 flex-col overflow-hidden">
        {#if workspace.activeTab.type === "diff"}
          <DiffPane />
        {:else if workspace.activeTab.type === "preview"}
          <PreviewPane />
        {:else}
          <EditorPane />
        {/if}
      </View>

      <!-- Bottom Dock: Terminal, Test Suite & Benchmarks -->
      <BottomDock />
    </View>

    <!-- Right AI Copilot Agent -->
    <AgentPane />
  </View>

  <!-- Bottom Telemetry Status Bar -->
  <StatusBar />

  <!-- Command Palette Modal -->
  {#if workspace.commandPaletteOpen}
    <CommandPalette onClose={() => (workspace.commandPaletteOpen = false)} />
  {/if}
</View>
