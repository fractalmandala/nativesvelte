<script lang="ts">
  import { Text, View } from "nsh";
  import { workspace } from "../lib/state.svelte";

  let { onClose }: { onClose: () => void } = $props();

  const commands = [
    { id: "c1", icon: "🟧", label: "Open App.svelte", action: () => { workspace.openFile("app-svelte"); onClose(); } },
    { id: "c2", icon: "🟧", label: "Open counter.svelte.ts", action: () => { workspace.openFile("counter-store"); onClose(); } },
    { id: "c3", icon: "🦀", label: "Open lib.rs (Rust Core)", action: () => { workspace.openFile("lib-rs"); onClose(); } },
    { id: "c4", icon: "⚖️", label: "Inspect AST Diff (Svelte 4 → 5)", action: () => { workspace.selectTab("tab-diff"); onClose(); } },
    { id: "c5", icon: "⚡", label: "Open Live Component Preview", action: () => { workspace.selectTab("tab-preview"); onClose(); } },
    { id: "c6", icon: "✓", label: "Run Integration Test Suite", action: () => { workspace.runTests(); onClose(); } },
    { id: "c7", icon: "📊", label: "View Native vs Electron Benchmarks", action: () => { workspace.bottomDockTab = "benchmarks"; onClose(); } }
  ];
</script>

<View class="absolute inset-0 bg-black/60 items-center justify-start pt-20 px-4 z-50">
  <View class="w-full max-w-xl bg-card rounded-xl border border-border shadow-2xl overflow-hidden">
    <!-- Input Field -->
    <View class="p-3 border-b border-border flex-row items-center justify-between">
      <View class="flex-row items-center gap-2 flex-1">
        <Text class="text-sm">🔍</Text>
        <Text class="text-sm text-foreground font-medium">Type a command or file name...</Text>
      </View>
      <View
        testID="close-palette-btn"
        class="w-6 h-6 rounded-md hover:bg-muted items-center justify-center cursor-pointer"
        onPress={onClose}
      >
        <Text class="text-xs text-muted-foreground">✕</Text>
      </View>
    </View>

    <!-- Commands List -->
    <View class="p-2 gap-1">
      {#each commands as cmd}
        <View
          testID="palette-cmd-{cmd.id}"
          class="flex-row items-center justify-between px-3 py-2 rounded-lg hover:bg-muted/70 cursor-pointer transition-colors"
          onPress={cmd.action}
        >
          <View class="flex-row items-center gap-2.5">
            <Text class="text-sm">{cmd.icon}</Text>
            <Text class="text-xs font-medium text-foreground">{cmd.label}</Text>
          </View>
          <Text class="text-[10px] font-mono text-muted-foreground">↵ Select</Text>
        </View>
      {/each}
    </View>

    <!-- Footer -->
    <View class="bg-muted/30 px-3 py-2 border-t border-border/60 flex-row items-center justify-between">
      <Text class="text-[10px] text-muted-foreground">Navigate with arrow keys or pointer</Text>
      <Text class="text-[10px] font-mono text-muted-foreground">ESC to close</Text>
    </View>
  </View>
</View>
