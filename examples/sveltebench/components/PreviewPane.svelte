<script lang="ts">
  import { Text, View } from "nsh";
  import { workspace } from "../lib/state.svelte";

  let total = $derived(workspace.previewCounter * workspace.previewMultiplier);
</script>

<View class="flex-1 flex-col bg-muted/20 p-6 items-center justify-center">
  <View class="max-w-md w-full bg-card rounded-xl border border-border p-6 shadow-sm gap-5">
    <!-- Preview Header -->
    <View class="flex-row items-center justify-between border-b border-border/60 pb-3">
      <View class="flex-row items-center gap-2">
        <View class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
        <Text class="text-sm font-bold text-foreground">Interactive Component Preview</Text>
      </View>
      <View class="bg-primary/10 px-2 py-0.5 rounded text-primary">
        <Text class="text-[10px] font-mono font-semibold text-primary">Native Direct</Text>
      </View>
    </View>

    <!-- State Output Display -->
    <View class="bg-muted/40 p-4 rounded-lg items-center gap-1 border border-border/40">
      <Text class="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
        Computed Value ($derived)
      </Text>
      <Text testID="preview-total-display" class="text-3xl font-extrabold text-foreground tracking-tight">
        {total}
      </Text>
      <Text class="text-xs text-muted-foreground font-mono">
        ({workspace.previewCounter} × {workspace.previewMultiplier})
      </Text>
    </View>

    <!-- Counter Actions -->
    <View class="gap-3">
      <View class="flex-row gap-2">
        <View
          testID="preview-inc-btn"
          class="flex-1 bg-primary hover:bg-primary/90 py-2.5 rounded-lg items-center justify-center cursor-pointer shadow-sm"
          onPress={() => workspace.previewCounter++}
        >
          <Text class="text-white font-semibold text-sm">Increment (+1)</Text>
        </View>

        <View
          testID="preview-reset-btn"
          class="bg-secondary hover:bg-secondary/80 px-4 py-2.5 rounded-lg items-center justify-center cursor-pointer border border-border"
          onPress={() => (workspace.previewCounter = 0)}
        >
          <Text class="text-foreground font-medium text-sm">Reset</Text>
        </View>
      </View>

      <!-- Multiplier Pills -->
      <View class="flex-row items-center justify-between pt-1">
        <Text class="text-xs text-muted-foreground font-medium">Multiplier:</Text>
        <View class="flex-row gap-1.5">
          {#each [1, 2, 3, 5] as m}
            <View
              testID="preview-mult-{m}"
              class="px-2.5 py-1 rounded cursor-pointer border {workspace.previewMultiplier === m ? 'bg-primary border-primary text-white' : 'bg-card border-border hover:bg-muted text-foreground'}"
              onPress={() => (workspace.previewMultiplier = m)}
            >
              <Text class="text-xs font-mono {workspace.previewMultiplier === m ? 'text-white font-bold' : 'text-foreground'}">
                {m}×
              </Text>
            </View>
          {/each}
        </View>
      </View>
    </View>

    <!-- Native Telemetry Footnote -->
    <View class="border-t border-border/40 pt-3 flex-row items-center justify-between">
      <Text class="text-[11px] text-muted-foreground">Reactivity Engine:</Text>
      <Text class="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
        0.04ms signal dispatch (zero VDOM)
      </Text>
    </View>
  </View>
</View>
