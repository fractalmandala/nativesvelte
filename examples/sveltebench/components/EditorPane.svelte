<script lang="ts">
  import { Scroll, Text, View } from "nsh";
  import { workspace } from "../lib/state.svelte";

  const lines = $derived(workspace.activeFile.content.split("\n"));
</script>

<View class="flex-1 flex-col bg-background">
  <!-- Tab Header Bar -->
  <View class="h-9 border-b border-border bg-muted/40 flex-row items-center px-1">
    {#each workspace.tabs as tab}
      <View
        testID="tab-{tab.id}"
        class="flex-row items-center gap-2 px-3 py-1.5 border-r border-border cursor-pointer transition-colors {workspace.activeTabId === tab.id ? 'bg-background border-b-2 border-b-primary font-medium text-primary' : 'bg-muted/20 hover:bg-muted/50 text-muted-foreground'}"
        onPress={() => workspace.selectTab(tab.id)}
      >
        <Text class="text-xs font-mono {workspace.activeTabId === tab.id ? 'text-primary' : 'text-foreground'}">
          {tab.title}
        </Text>
        {#if tab.closable}
          <View
            testID="close-tab-{tab.id}"
            class="w-4 h-4 rounded hover:bg-muted items-center justify-center cursor-pointer"
            onPress={() => workspace.closeTab(tab.id)}
          >
            <Text class="text-[10px] text-muted-foreground">✕</Text>
          </View>
        {/if}
      </View>
    {/each}
  </View>

  <!-- Breadcrumbs & Meta -->
  <View class="h-7 border-b border-border/40 px-3 flex-row items-center justify-between bg-card/30">
    <View class="flex-row items-center gap-1.5">
      <Text class="text-[11px] text-muted-foreground font-mono">{workspace.activeFile.path}</Text>
      {#if workspace.activeFile.modified}
        <Text class="text-[10px] text-amber-500 font-bold">• modified</Text>
      {/if}
    </View>
    <View class="flex-row items-center gap-3">
      <Text class="text-[10px] text-muted-foreground font-mono">{lines.length} lines</Text>
      <Text class="text-[10px] text-muted-foreground font-mono">UTF-8</Text>
      <Text class="text-[10px] text-primary font-mono font-semibold uppercase">{workspace.activeFile.language}</Text>
    </View>
  </View>

  <!-- Editor Content with Line Numbers -->
  <Scroll class="flex-1 p-3">
    <View class="flex-row">
      <!-- Line Numbers Column -->
      <View class="w-10 pr-3 border-r border-border/40 select-none items-end gap-1">
        {#each lines as _, idx}
          <Text class="text-xs font-mono text-muted-foreground/60 leading-5">
            {idx + 1}
          </Text>
        {/each}
      </View>

      <!-- Code Text Column -->
      <View class="flex-1 pl-3 gap-1">
        {#each lines as line}
          <View class="flex-row">
            <Text class="text-xs font-mono leading-5 {line.includes('$state') || line.includes('$derived') || line.includes('$effect') ? 'text-amber-500 font-semibold' : line.includes('import') || line.includes('export') || line.includes('let') || line.includes('const') ? 'text-blue-500 font-medium' : line.includes('<') || line.includes('>') ? 'text-emerald-500' : 'text-foreground'}">
              {line || " "}
            </Text>
          </View>
        {/each}
      </View>
    </View>
  </Scroll>
</View>
