import Base

type Pane is Data:
  EditorPane{}
  DiffPane{}
  PreviewPane{}
  AgentPane{}

type DockTab is Data:
  TerminalTab{}
  TestsTab{}
  BenchmarksTab{}

type FileDirty is Data:
  Clean{}
  Modified{}

type RunesMode is Data:
  RunesSvelte5{}
  LegacySvelte4{}

# AST Migration logic: Always lowers to Svelte 5 Runes
def migrate_to_runes(is_legacy: Bool) -> RunesMode:
  match is_legacy:
    case True{}:
      RunesSvelte5{}
    case False{}:
      RunesSvelte5{}

# Dirty state after migration patch application: applied patch resets dirty to Clean
def apply_patch_dirty(prev: FileDirty, patch_applied: Bool) -> FileDirty:
  match patch_applied:
    case True{}:
      Clean{}
    case False{}:
      prev

# Telemetry Budget: <= 32 MB RAM is within native budget
def ram_within_budget(mb: Nat) -> Bool:
  Nat.is_le(mb, 32n)

# Telemetry Budget: 120 FPS target check
def fps_at_target(fps: Nat) -> Bool:
  Nat.is_eq(fps, 120n)

# Zero-bridge execution: Native signals have 0 VDOM overhead
def vdom_overhead_cost(is_native: Bool) -> Nat:
  match is_native:
    case True{}:
      0n
    case False{}:
      15n

# Counter preview calculation: increment by step * multiplier
def counter_step(current: Nat, step: Nat, mult: Nat) -> Nat:
  Nat.add(current, Nat.mul(step, mult))

# Counter reset always resets to 0
def counter_reset() -> Nat:
  0n

# Workspace Tab management: can only close tab if count > 0
def can_close_active_tab(tab_count: Nat) -> Bool:
  match tab_count:
    case 0n:
      False{}
    case 1n+p:
      True{}

# Command palette filter: empty query returns total items
def search_filter_count(is_empty_query: Bool, total_items: Nat) -> Nat:
  match is_empty_query:
    case True{}:
      total_items
    case False{}:
      1n

# Parallel benchmark workload execution using Bend fork-join
def bench_workload(w: Nat) -> Nat:
  Nat.mul(w, 2n)

def run_bench_pair(w1: Nat, w2: Nat) -> Nat:
  r1 r2 = bench_workload(w1) bench_workload(w2)
  Nat.add(r1, r2)

# Agent Copilot tool dispatch: patch can only be applied when file exists and diff is non-empty
def can_apply_copilot_patch(file_exists: Bool, diff_len: Nat) -> Bool:
  match file_exists:
    case False{}:
      False{}
    case True{}:
      match diff_len:
        case 0n:
          False{}
        case 1n+p:
          True{}
