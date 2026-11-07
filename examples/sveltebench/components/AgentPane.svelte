<script lang="ts">
  import { Scroll, Text, View } from "nsh";
  import { workspace } from "../lib/state.svelte";

  let prompt = $state("");

  function submitPrompt() {
    if (!prompt.trim()) return;
    const userText = prompt.trim();
    prompt = "";

    workspace.agentMessages = [
      ...workspace.agentMessages,
      {
        id: `m-${Date.now()}`,
        sender: "user",
        text: userText,
        timestamp: "Just now"
      },
      {
        id: `t-${Date.now()}`,
        sender: "tool",
        text: "Invoked cargo check & Svelte AST validator",
        toolName: "nsh_ast_audit",
        toolOutput: "All 18 signal bindings valid. Zero type errors found.",
        timestamp: "Just now"
      },
      {
        id: `c-${Date.now()}`,
        sender: "copilot",
        text: `Processed "${userText}". Svelte 5 runes analysis completed at 120 FPS native frame rate.`,
        timestamp: "Just now"
      }
    ];
  }
</script>

<View class="w-80 border-l border-border bg-card/60 flex-col h-full">
  <!-- Copilot Header -->
  <View class="p-3 border-b border-border/60 flex-row items-center justify-between">
    <View class="flex-row items-center gap-2">
      <View class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
      <Text class="text-xs font-bold text-foreground tracking-tight">AI Copilot Agent</Text>
    </View>
    <View class="bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
      <Text class="text-[10px] text-primary font-mono font-medium">Rust Core</Text>
    </View>
  </View>

  <!-- Message Stream -->
  <Scroll class="flex-1 p-3">
    <View class="gap-3">
      {#each workspace.agentMessages as msg}
        {#if msg.sender === "user"}
          <View class="bg-primary/10 border border-primary/20 rounded-lg p-2.5 self-end max-w-[90%]">
            <Text class="text-xs text-foreground font-medium">{msg.text}</Text>
            <Text class="text-[9px] text-muted-foreground self-end mt-1">{msg.timestamp}</Text>
          </View>
        {:else if msg.sender === "tool"}
          <View class="bg-muted/40 border border-border/60 rounded-lg p-2 gap-1">
            <View class="flex-row items-center justify-between">
              <View class="flex-row items-center gap-1.5">
                <Text class="text-[10px]">⚙️</Text>
                <Text class="text-[10px] font-mono font-semibold text-primary">{msg.toolName}</Text>
              </View>
              <Text class="text-[9px] text-muted-foreground">{msg.timestamp}</Text>
            </View>
            <Text class="text-[11px] text-muted-foreground font-medium">{msg.text}</Text>
            {#if msg.toolOutput}
              <View class="bg-card/80 p-1.5 rounded border border-border/40 mt-1">
                <Text class="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">{msg.toolOutput}</Text>
              </View>
            {/if}
          </View>
        {:else}
          <View class="bg-card border border-border rounded-lg p-3 gap-2 shadow-sm">
            <View class="flex-row items-center justify-between">
              <View class="flex-row items-center gap-1.5">
                <Text class="text-xs">🤖</Text>
                <Text class="text-xs font-semibold text-foreground">Svelte Copilot</Text>
              </View>
              <Text class="text-[9px] text-muted-foreground">{msg.timestamp}</Text>
            </View>
            <Text class="text-xs text-foreground leading-relaxed">{msg.text}</Text>

            {#if msg.patchApplied !== undefined}
              <View class="pt-1">
                {#if msg.patchApplied}
                  <View class="bg-emerald-500/10 border border-emerald-500/20 rounded p-1.5 flex-row items-center justify-center gap-1">
                    <Text class="text-emerald-600 dark:text-emerald-400 text-xs font-bold">✓</Text>
                    <Text class="text-emerald-600 dark:text-emerald-400 text-xs font-medium">Patch Applied to Workspace</Text>
                  </View>
                {:else}
                  <View
                    testID="agent-apply-patch-btn"
                    class="bg-primary hover:bg-primary/90 rounded p-2 items-center justify-center cursor-pointer shadow-sm"
                    onPress={() => workspace.applyPatch()}
                  >
                    <Text class="text-white text-xs font-semibold">⚡ Apply Runes Patch</Text>
                  </View>
                {/if}
              </View>
            {/if}
          </View>
        {/if}
      {/each}
    </View>
  </Scroll>

  <!-- Prompt Input Bar -->
  <View class="p-2.5 border-t border-border/60 bg-card">
    <View class="flex-row gap-1.5">
      <View class="flex-1 bg-muted/60 rounded-lg px-2.5 py-1.5 border border-border/80">
        <Text class="text-xs text-foreground">
          {prompt || "Ask Copilot to refactor or benchmark..."}
        </Text>
      </View>
      <View
        testID="agent-send-btn"
        class="bg-primary px-3 py-1.5 rounded-lg items-center justify-center cursor-pointer"
        onPress={() => {
          prompt = "Run full NativeSvelte benchmark test";
          submitPrompt();
        }}
      >
        <Text class="text-white text-xs font-bold">↑</Text>
      </View>
    </View>
  </View>
</View>
