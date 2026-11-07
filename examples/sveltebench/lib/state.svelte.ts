import type { AgentMessage, BenchmarkMetric, ProjectFile, TestItem, WorkspaceTab } from "./types";

declare function $state<T>(initial: T): T;
declare function $derived<T>(expr: T): T;
declare function $effect(fn: () => void | (() => void)): void;

export const INITIAL_FILES: ProjectFile[] = [
  {
    id: "app-svelte",
    name: "App.svelte",
    path: "src/App.svelte",
    folder: "src",
    language: "svelte",
    modified: true,
    content: `<script lang="ts">
  import { Button, Card, Text, View } from "nsh";

  // Svelte 5 Runes: fine-grained native state
  let count = $state(0);
  let multiplier = $state(2);
  let total = $derived(count * multiplier);

  $effect(() => {
    if (count > 0 && count % 5 === 0) {
      console.log(\`[Benchmark] Milestone reached: \${count}\`);
    }
  });
</script>

<View class="p-6 gap-4 bg-background">
  <Text class="text-xl font-bold text-foreground">
    Counter: {count} × {multiplier} = {total}
  </Text>
  <View class="flex-row gap-2">
    <Button variant="primary" onclick={() => count++}>
      <Text class="text-white font-medium">Increment</Text>
    </Button>
    <Button variant="secondary" onclick={() => (count = 0)}>
      <Text>Reset</Text>
    </Button>
  </View>
</View>`
  },
  {
    id: "counter-store",
    name: "counter.svelte.ts",
    path: "src/lib/counter.svelte.ts",
    folder: "src/lib",
    language: "svelte",
    content: `export class CounterEngine {
  count = $state(0);
  step = $state(1);

  double = $derived(this.count * 2);
  triple = $derived(this.count * 3);

  inc() {
    this.count += this.step;
  }

  dec() {
    this.count = Math.max(0, this.count - this.step);
  }
}`
  },
  {
    id: "lib-rs",
    name: "lib.rs",
    path: "crates/engine/src/lib.rs",
    folder: "crates",
    language: "rust",
    content: `use nsh_core::prelude::*;

#[derive(Default)]
pub struct BenchmarkEngine {
    pub tick_rate: u32,
    pub active_signals: usize,
}

impl BenchmarkEngine {
    pub fn new() -> Self {
        Self { tick_rate: 120, active_signals: 1420 }
    }

    pub fn commit_frame(&self) -> f32 {
        0.42 // sub-millisecond commit latency (ms)
    }
}`
  },
  {
    id: "readme",
    name: "README.md",
    path: "README.md",
    folder: "root",
    language: "markdown",
    content: `# Sveltebench

Sveltebench is a flagship native developer environment and telemetry workbench
built entirely with NativeSvelte (Svelte 5 runes + Rust).

- Zero-bridge direct signals
- Native docking workspace
- Multi-pane editor with AST diffing
- Memory footprint: ~28 MB (vs 680 MB in Electron)`
  }
];

export const BENCHMARKS: BenchmarkMetric[] = [
  { metric: "RAM Usage (Idle)", nativeSvelte: "28.4 MB", electron: "680 MB", reactNative: "185 MB", advantage: "24× lower memory" },
  { metric: "Cold Start Time", nativeSvelte: "85 ms", electron: "1,420 ms", reactNative: "650 ms", advantage: "16× faster boot" },
  { metric: "Frame Commit Latency", nativeSvelte: "0.42 ms", electron: "12.8 ms", reactNative: "8.4 ms", advantage: "30× lower latency" },
  { metric: "Reactivity Model", nativeSvelte: "Fine-grained Signals", electron: "VDOM Reconciliation", reactNative: "Async Bridge Queue", advantage: "Zero VDOM diffing" },
  { metric: "Cross-Platform Targets", nativeSvelte: "Desktop + Mobile + TUI", electron: "Desktop Only", reactNative: "Mobile + Web", advantage: "Single codebase runs anywhere" }
];

export class WorkspaceStore {
  files = $state<ProjectFile[]>(INITIAL_FILES);
  activeFileId = $state<string>("app-svelte");

  tabs = $state<WorkspaceTab[]>([
    { id: "tab-editor", title: "App.svelte", type: "file", fileId: "app-svelte" },
    { id: "tab-diff", title: "Diff: Svelte 4 → 5", type: "diff" },
    { id: "tab-preview", title: "Live Preview", type: "preview" }
  ]);
  activeTabId = $state<string>("tab-editor");

  bottomDockTab = $state<"terminal" | "tests" | "benchmarks">("terminal");
  dockCollapsed = $state<boolean>(false);

  terminalLogs = $state<string[]>([
    "$ nsh check --target macos",
    "✓ Verified 4 source targets in 42ms [0 errors]",
    "$ cargo test -p sveltebench-engine --quiet",
    "test result: ok. 14 passed; 0 failed; finished in 0.18s",
    "NativeSvelte engine ready on macOS AppKit (120 FPS target)"
  ]);

  terminalInput = $state<string>("");

  agentMessages = $state<AgentMessage[]>([
    {
      id: "m1",
      sender: "user",
      text: "Can you analyze this component and modernize any legacy reactive statements to Svelte 5 runes?",
      timestamp: "10:14 AM"
    },
    {
      id: "m2",
      sender: "tool",
      text: "Executed AST analysis on src/App.svelte",
      toolName: "ast_parse",
      toolOutput: "Found: 1 legacy $: statement, 2 mutable declarations. Migrated to $state and $derived.",
      timestamp: "10:14 AM"
    },
    {
      id: "m3",
      sender: "copilot",
      text: "I've refactored App.svelte to use Svelte 5's $state and $derived runes. You can review the changes in the Diff tab or click below to apply the patch directly.",
      timestamp: "10:15 AM",
      patchApplied: false
    }
  ]);

  testItems = $state<TestItem[]>([
    { id: "t1", name: "Direct Rust native event dispatch", status: "pass", durationMs: 0.12 },
    { id: "t2", name: "Svelte 5 runes reactivity graph update", status: "pass", durationMs: 0.35 },
    { id: "t3", name: "DockArea layout calculation (flex-1)", status: "pass", durationMs: 0.48 },
    { id: "t4", name: "Terminal PTY stream buffering", status: "pass", durationMs: 0.22 },
    { id: "t5", name: "Memory stays below 30 MB ceiling", status: "pass", durationMs: 0.05 },
    { id: "t6", name: "Window drag region boundary test", status: "pass", durationMs: 0.18 }
  ]);

  commandPaletteOpen = $state<boolean>(false);
  commandQuery = $state<string>("");

  // Live preview interactive state
  previewCounter = $state<number>(0);
  previewMultiplier = $state<number>(3);
  previewRunning = $state<boolean>(true);

  activeFile = $derived(
    this.files.find((f) => f.id === this.activeFileId) ?? this.files[0]
  );

  activeTab = $derived(
    this.tabs.find((t) => t.id === this.activeTabId) ?? this.tabs[0]
  );

  openFile(fileId: string) {
    this.activeFileId = fileId;
    const existing = this.tabs.find((t) => t.fileId === fileId);
    if (existing) {
      this.activeTabId = existing.id;
    } else {
      const file = this.files.find((f) => f.id === fileId);
      if (file) {
        const newTab: WorkspaceTab = {
          id: `tab-${file.id}`,
          title: file.name,
          type: "file",
          fileId: file.id,
          closable: true
        };
        this.tabs = [...this.tabs, newTab];
        this.activeTabId = newTab.id;
      }
    }
  }

  selectTab(tabId: string) {
    this.activeTabId = tabId;
    const tab = this.tabs.find((t) => t.id === tabId);
    if (tab && tab.fileId) {
      this.activeFileId = tab.fileId;
    }
  }

  closeTab(tabId: string) {
    if (this.tabs.length <= 1) return;
    const index = this.tabs.findIndex((t) => t.id === tabId);
    this.tabs = this.tabs.filter((t) => t.id !== tabId);
    if (this.activeTabId === tabId) {
      const nextTab = this.tabs[Math.max(0, index - 1)];
      this.selectTab(nextTab.id);
    }
  }

  applyPatch() {
    const copilotMsg = this.agentMessages.find((m) => m.sender === "copilot");
    if (copilotMsg) {
      copilotMsg.patchApplied = true;
    }
    const appFile = this.files.find((f) => f.id === "app-svelte");
    if (appFile) {
      appFile.modified = false;
    }
    this.terminalLogs = [
      ...this.terminalLogs,
      "$ git apply patch-svelte5-runes.diff",
      "✓ Applied runes patch cleanly to src/App.svelte [1 file modified]",
      "$ nsh check",
      "✓ Typecheck passed [100% clean]"
    ];
  }

  sendTerminalCommand(cmd?: string) {
    const c = cmd ?? this.terminalInput.trim();
    if (!c) return;
    this.terminalLogs = [
      ...this.terminalLogs,
      `$ ${c}`,
      c.includes("test")
        ? "Running 6 integration benchmarks... all tests passing [1.2ms]"
        : c.includes("bench")
          ? "FPS: 120 · Frame time: 0.42ms · Heap: 28.4 MB"
          : `Executed ${c} with exit code 0`
    ];
    this.terminalInput = "";
  }

  runTests() {
    this.bottomDockTab = "tests";
    for (const t of this.testItems) {
      t.status = "pass";
      t.durationMs = Math.round((Math.random() * 0.4 + 0.05) * 100) / 100;
    }
    this.terminalLogs = [
      ...this.terminalLogs,
      "$ bun test --timeout 2000",
      `✓ 6 passed across 2 suites (${this.testItems.reduce((acc, x) => acc + x.durationMs, 0).toFixed(2)}ms total)`
    ];
  }
}

export const workspace = new WorkspaceStore();
