<script lang="ts">
  import { Scroll, Text, View } from "nsh";
  import { workspace } from "../lib/state.svelte";

  let filter = $state("");

  const filteredFiles = $derived(
    filter.trim()
      ? workspace.files.filter((f) =>
          f.name.toLowerCase().includes(filter.toLowerCase()) ||
          f.path.toLowerCase().includes(filter.toLowerCase())
        )
      : workspace.files
  );
</script>

<View class="w-60 border-r border-border bg-card/60 flex-col h-full">
  <!-- Explorer Header -->
  <View class="p-3 border-b border-border/60 flex-row items-center justify-between">
    <Text class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      Project Explorer
    </Text>
    <View class="bg-primary/10 px-1.5 py-0.5 rounded">
      <Text class="text-[10px] text-primary font-mono">nsh</Text>
    </View>
  </View>

  <!-- Quick Filter -->
  <View class="px-2.5 py-2 border-b border-border/40">
    <View class="bg-muted/50 rounded px-2 py-1 flex-row items-center gap-1.5 border border-border/40">
      <Text class="text-xs text-muted-foreground">🔎</Text>
      <Text class="text-xs text-muted-foreground">Filter files...</Text>
    </View>
  </View>

  <!-- File Tree Scroll -->
  <Scroll class="flex-1 py-1">
    <View class="px-2 gap-0.5">
      {#each filteredFiles as file}
        <View
          testID="file-item-{file.id}"
          class="flex-row items-center justify-between px-2.5 py-1.5 rounded cursor-pointer transition-colors {workspace.activeFileId === file.id ? 'bg-primary/15 text-primary font-medium' : 'hover:bg-muted/60 text-foreground'}"
          onPress={() => workspace.openFile(file.id)}
        >
          <View class="flex-row items-center gap-2">
            <Text class="text-xs">
              {file.language === "svelte" ? "🟧" : file.language === "rust" ? "🦀" : "📄"}
            </Text>
            <Text class="text-xs font-mono {workspace.activeFileId === file.id ? 'text-primary font-semibold' : 'text-foreground'}">
              {file.name}
            </Text>
          </View>
          {#if file.modified}
            <View class="w-2 h-2 rounded-full bg-amber-500 shadow-sm" />
          {/if}
        </View>
      {/each}
    </View>
  </Scroll>

  <!-- Git Section -->
  <View class="p-2.5 border-t border-border/60 bg-muted/20">
    <View class="flex-row items-center justify-between">
      <View class="flex-row items-center gap-1.5">
        <Text class="text-xs">🌿</Text>
        <Text class="text-xs font-mono font-medium text-foreground">main</Text>
      </View>
      <View class="bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
        <Text class="text-[10px] text-amber-600 dark:text-amber-400 font-mono">1 uncommitted</Text>
      </View>
    </View>
  </View>
</View>
