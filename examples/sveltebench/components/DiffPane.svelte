<script lang="ts">
  import { Scroll, Text, View } from "nsh";
  import { workspace } from "../lib/state.svelte";

  const diffRows = [
    { type: "header", text: "@@ Svelte 4 vs Svelte 5 Runes in NativeSvelte @@" },
    { type: "context", text: " <script lang=\"ts\">" },
    { type: "context", text: "   import { Button, View, Text } from \"nsh\";" },
    { type: "del", text: "-  // Legacy Svelte 4 reactive assignments" },
    { type: "del", text: "-  let count = 0;" },
    { type: "del", text: "-  let multiplier = 2;" },
    { type: "del", text: "-  $: total = count * multiplier;" },
    { type: "del", text: "-  $: if (count > 0 && count % 5 === 0) {" },
    { type: "del", text: "-    console.log(\"Milestone: \" + count);" },
    { type: "del", text: "-  }" },
    { type: "add", text: "+  // Svelte 5 Universal Runes: Native Fine-Grained Signals" },
    { type: "add", text: "+  let count = $state(0);" },
    { type: "add", text: "+  let multiplier = $state(2);" },
    { type: "add", text: "+  let total = $derived(count * multiplier);" },
    { type: "add", text: "+  $effect(() => {" },
    { type: "add", text: "+    if (count > 0 && count % 5 === 0) {" },
    { type: "add", text: "+      console.log(`[Benchmark] Milestone: ${count}`);" },
    { type: "add", text: "+    }" },
    { type: "add", text: "+  });" },
    { type: "context", text: " </script>" }
  ];
</script>

<View class="flex-1 flex-col bg-background">
  <!-- Diff Toolbar -->
  <View class="h-10 border-b border-border bg-card px-4 flex-row items-center justify-between">
    <View class="flex-row items-center gap-2">
      <Text class="text-xs font-semibold text-foreground">AST Migration Diff</Text>
      <View class="bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
        <Text class="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">+10 additions, -7 deletions</Text>
      </View>
    </View>

    <View
      testID="apply-diff-btn"
      class="bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded-md cursor-pointer flex-row items-center gap-1.5 shadow-sm"
      onPress={() => workspace.applyPatch()}
    >
      <Text class="text-white text-xs font-bold">✓</Text>
      <Text class="text-white text-xs font-semibold">Apply Runes Migration</Text>
    </View>
  </View>

  <!-- Diff Viewer Rows -->
  <Scroll class="flex-1 p-3">
    <View class="gap-0.5 font-mono text-xs">
      {#each diffRows as row}
        <View
          class="flex-row items-center px-2 py-1 rounded {row.type === 'del' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-l-2 border-rose-500' : row.type === 'add' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-l-2 border-emerald-500' : row.type === 'header' ? 'bg-primary/10 text-primary font-semibold py-1.5' : 'text-muted-foreground'}"
        >
          <Text class="font-mono text-xs {row.type === 'del' ? 'text-rose-600 dark:text-rose-400' : row.type === 'add' ? 'text-emerald-600 dark:text-emerald-400' : row.type === 'header' ? 'text-primary' : 'text-muted-foreground'}">
            {row.text}
          </Text>
        </View>
      {/each}
    </View>
  </Scroll>
</View>
