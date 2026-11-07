<script lang="ts">
  import { colorScheme, Text, View } from "nsh";
  import { workspace } from "../lib/state.svelte";

  let { onOpenPalette }: { onOpenPalette: () => void } = $props();

  let dark = $derived(colorScheme() === "dark");
</script>

<View
  class="h-12 border-b border-border bg-card flex-row items-center justify-between px-3 select-none"
  desktop={{ windowDrag: true }}
>
  <!-- Window Drag & Brand -->
  <View class="flex-row items-center gap-3">
    <View class="flex-row items-center gap-2">
      <View class="w-6 h-6 rounded-md bg-primary items-center justify-center">
        <Text class="text-white text-xs font-bold">⚡</Text>
      </View>
      <Text class="font-bold text-foreground text-sm tracking-tight">Sveltebench</Text>
      <View class="bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
        <Text class="text-primary text-[10px] font-semibold">120 FPS</Text>
      </View>
    </View>
  </View>

  <!-- Command Palette Trigger -->
  <View
    testID="command-search-trigger"
    class="flex-row items-center gap-2 bg-muted/60 hover:bg-muted px-3 py-1.5 rounded-lg border border-border/80 w-72 justify-between cursor-pointer"
    onPress={onOpenPalette}
  >
    <View class="flex-row items-center gap-2">
      <Text class="text-xs text-muted-foreground">🔍</Text>
      <Text class="text-xs text-muted-foreground">Search files, commands...</Text>
    </View>
    <View class="bg-card px-1.5 py-0.5 rounded border border-border">
      <Text class="text-[10px] font-mono text-muted-foreground">⌘K</Text>
    </View>
  </View>

  <!-- Workspace Controls -->
  <View class="flex-row items-center gap-2">
    <View
      testID="run-project-btn"
      class="bg-primary hover:bg-primary/90 px-3 py-1.5 rounded-md cursor-pointer flex-row items-center gap-1.5 shadow-sm"
      onPress={() => workspace.sendTerminalCommand("nsh run --target macos")}
    >
      <Text class="text-white text-xs">▶</Text>
      <Text class="text-white text-xs font-semibold">Run</Text>
    </View>

    <View
      testID="run-tests-btn"
      class="bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded-md cursor-pointer flex-row items-center gap-1.5 border border-border"
      onPress={() => workspace.runTests()}
    >
      <Text class="text-foreground text-xs">✓</Text>
      <Text class="text-foreground text-xs font-medium">Tests</Text>
    </View>

    <View
      testID="bench-btn"
      class="bg-secondary hover:bg-secondary/80 px-2.5 py-1.5 rounded-md cursor-pointer border border-border"
      onPress={() => (workspace.bottomDockTab = "benchmarks")}
    >
      <Text class="text-xs font-mono text-muted-foreground">📊 Bench</Text>
    </View>
  </View>
</View>
