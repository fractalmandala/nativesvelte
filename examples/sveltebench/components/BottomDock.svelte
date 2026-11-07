<script lang="ts">
  import { Scroll, Text, View } from "nsh";
  import { BENCHMARKS, workspace } from "../lib/state.svelte";
</script>

<View class="h-48 border-t border-border bg-card/80 flex-col">
  <!-- Dock Tabs Header -->
  <View class="h-8 border-b border-border/80 bg-muted/30 px-2 flex-row items-center justify-between">
    <View class="flex-row items-center gap-1">
      <View
        testID="dock-tab-terminal"
        class="px-2.5 py-1 rounded cursor-pointer transition-colors {workspace.bottomDockTab === 'terminal' ? 'bg-background font-semibold text-primary border-b border-primary' : 'text-muted-foreground hover:bg-muted/40'}"
        onPress={() => (workspace.bottomDockTab = "terminal")}
      >
        <Text class="text-xs font-mono {workspace.bottomDockTab === 'terminal' ? 'text-primary' : 'text-muted-foreground'}">
          Terminal
        </Text>
      </View>

      <View
        testID="dock-tab-tests"
        class="px-2.5 py-1 rounded cursor-pointer flex-row items-center gap-1.5 transition-colors {workspace.bottomDockTab === 'tests' ? 'bg-background font-semibold text-primary border-b border-primary' : 'text-muted-foreground hover:bg-muted/40'}"
        onPress={() => (workspace.bottomDockTab = "tests")}
      >
        <Text class="text-xs font-mono {workspace.bottomDockTab === 'tests' ? 'text-primary' : 'text-muted-foreground'}">
          Test Suite
        </Text>
        <View class="bg-emerald-500/15 px-1.5 py-0.2 rounded">
          <Text class="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">6 pass</Text>
        </View>
      </View>

      <View
        testID="dock-tab-benchmarks"
        class="px-2.5 py-1 rounded cursor-pointer flex-row items-center gap-1.5 transition-colors {workspace.bottomDockTab === 'benchmarks' ? 'bg-background font-semibold text-primary border-b border-primary' : 'text-muted-foreground hover:bg-muted/40'}"
        onPress={() => (workspace.bottomDockTab = "benchmarks")}
      >
        <Text class="text-xs font-mono {workspace.bottomDockTab === 'benchmarks' ? 'text-primary' : 'text-muted-foreground'}">
          Benchmarks
        </Text>
        <View class="bg-primary/10 px-1.5 py-0.2 rounded">
          <Text class="text-[10px] text-primary font-mono font-bold">vs Electron</Text>
        </View>
      </View>
    </View>

    <View class="flex-row items-center gap-2">
      <View
        class="px-2 py-0.5 rounded hover:bg-muted cursor-pointer"
        onPress={() => workspace.sendTerminalCommand("cargo check")}
      >
        <Text class="text-[11px] text-muted-foreground font-mono">⚡ cargo check</Text>
      </View>
      <View
        class="px-2 py-0.5 rounded hover:bg-muted cursor-pointer"
        onPress={() => (workspace.terminalLogs = ["$ clear"])}
      >
        <Text class="text-[11px] text-muted-foreground">Clear</Text>
      </View>
    </View>
  </View>

  <!-- Dock Body -->
  {#if workspace.bottomDockTab === "terminal"}
    <View class="flex-1 flex-col p-2.5 bg-black/90 dark:bg-black font-mono">
      <Scroll class="flex-1">
        <View class="gap-1">
          {#each workspace.terminalLogs as log}
            <Text class="text-xs font-mono {log.startsWith('$') ? 'text-emerald-400 font-bold' : log.includes('✓') ? 'text-emerald-300' : 'text-zinc-300'}">
              {log}
            </Text>
          {/each}
        </View>
      </Scroll>
      <View class="flex-row items-center gap-1.5 pt-1.5 border-t border-zinc-800">
        <Text class="text-xs text-emerald-400 font-mono font-bold">❯</Text>
        <View
          testID="terminal-quick-input"
          class="flex-1 cursor-pointer"
          onPress={() => workspace.sendTerminalCommand("nsh test --target macos")}
        >
          <Text class="text-xs font-mono text-zinc-400">
            {workspace.terminalInput || "nsh test --target macos (click to run)"}
          </Text>
        </View>
      </View>
    </View>
  {:else if workspace.bottomDockTab === "tests"}
    <Scroll class="flex-1 p-3 bg-card">
      <View class="gap-1.5">
        {#each workspace.testItems as test}
          <View class="flex-row items-center justify-between p-2 rounded bg-muted/20 border border-border/40">
            <View class="flex-row items-center gap-2">
              <Text class="text-xs font-bold text-emerald-600 dark:text-emerald-400">✓</Text>
              <Text class="text-xs font-medium text-foreground">{test.name}</Text>
            </View>
            <Text class="text-xs font-mono text-muted-foreground">{test.durationMs}ms</Text>
          </View>
        {/each}
      </View>
    </Scroll>
  {:else if workspace.bottomDockTab === "benchmarks"}
    <Scroll class="flex-1 p-3 bg-card">
      <View class="gap-2">
        <View class="flex-row items-center justify-between pb-1 border-b border-border/60 font-semibold text-xs text-muted-foreground">
          <Text class="w-1/4">Metric</Text>
          <Text class="w-1/5 text-primary">NativeSvelte</Text>
          <Text class="w-1/5">Electron</Text>
          <Text class="w-1/5">React Native</Text>
          <Text class="w-1/5 text-emerald-600 dark:text-emerald-400">Advantage</Text>
        </View>
        {#each BENCHMARKS as b}
          <View class="flex-row items-center justify-between py-1 text-xs border-b border-border/20">
            <Text class="w-1/4 font-medium text-foreground">{b.metric}</Text>
            <Text class="w-1/5 font-mono font-bold text-primary">{b.nativeSvelte}</Text>
            <Text class="w-1/5 font-mono text-muted-foreground">{b.electron}</Text>
            <Text class="w-1/5 font-mono text-muted-foreground">{b.reactNative}</Text>
            <Text class="w-1/5 font-semibold text-emerald-600 dark:text-emerald-400">{b.advantage}</Text>
          </View>
        {/each}
      </View>
    </Scroll>
  {/if}
</View>
