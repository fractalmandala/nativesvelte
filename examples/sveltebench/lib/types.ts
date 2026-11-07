export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  folder: string;
  language: "svelte" | "rust" | "json" | "markdown";
  modified?: boolean;
  content: string;
}

export interface WorkspaceTab {
  id: string;
  title: string;
  type: "file" | "diff" | "preview";
  fileId?: string;
  closable?: boolean;
}

export interface AgentMessage {
  id: string;
  sender: "user" | "copilot" | "tool";
  text: string;
  toolName?: string;
  toolOutput?: string;
  timestamp: string;
  patchApplied?: boolean;
}

export interface TestItem {
  id: string;
  name: string;
  status: "pass" | "fail" | "running";
  durationMs: number;
}

export interface BenchmarkMetric {
  metric: string;
  nativeSvelte: string;
  electron: string;
  reactNative: string;
  advantage: string;
}
