import Base
import ./core.bend as Core

# 1. AST Migration: Migrating legacy Svelte 4 code always yields Svelte 5 Runes mode
law migration_yields_svelte5_runes:
  {Core.migrate_to_runes(True{}) == Core.RunesSvelte5{} : Core.RunesMode}

# 2. Idempotent Migration: Svelte 5 code remains Svelte 5 Runes mode
law migration_idempotent_on_runes:
  {Core.migrate_to_runes(False{}) == Core.RunesSvelte5{} : Core.RunesMode}

# 3. Patch Application: Applying an AST migration patch resets dirty file to Clean
law apply_patch_resets_dirty_clean:
  {Core.apply_patch_dirty(Core.Modified{}, True{}) == Core.Clean{} : Core.FileDirty}

# 4. Patch Preservation: Not applying patch preserves unmodified file state
law unapplied_patch_keeps_dirty:
  {Core.apply_patch_dirty(Core.Modified{}, False{}) == Core.Modified{} : Core.FileDirty}

# 5. Native Telemetry: Sveltebench default 28 MB RAM is within native budget (<= 32 MB)
law sveltebench_default_ram_within_budget:
  {Core.ram_within_budget(28n) == True{} : Bool}

# 6. Native Telemetry: Exceeding 32 MB is flagged as over budget
law excess_ram_outside_budget:
  {Core.ram_within_budget(48n) == False{} : Bool}

# 7. Native FPS Target: 120 FPS satisfies the target frame rate
law target_fps_satisfied:
  {Core.fps_at_target(120n) == True{} : Bool}

# 8. Frame Drop: 60 FPS is not the 120 FPS high-refresh target
law lower_fps_not_target:
  {Core.fps_at_target(60n) == False{} : Bool}

# 9. Zero Virtual DOM: Native execution has 0 VDOM overhead cost
law native_execution_zero_vdom_cost:
  {Core.vdom_overhead_cost(True{}) == 0n : Nat}

# 10. Non-native overhead: Non-native bridge carries non-zero overhead
law non_native_has_vdom_cost:
  {Core.vdom_overhead_cost(False{}) == 15n : Nat}

# 11. Preview Counter: Reset always sets counter to 0
law preview_counter_reset_is_zero:
  {Core.counter_reset() == 0n : Nat}

# 12. Preview Counter Step: Stepping by 1 with multiplier 5 advances from 0 to 5
law preview_counter_advance_step:
  {Core.counter_step(0n, 1n, 5n) == 5n : Nat}

# 13. Tab Closing Gate: Cannot close tab when tab count is 0
law cannot_close_zero_tabs:
  {Core.can_close_active_tab(0n) == False{} : Bool}

# 14. Tab Closing Gate: Can close tab when tab count is >= 1
law can_close_existing_tab:
  for p: Nat
  {Core.can_close_active_tab(1n+p) == True{} : Bool}

# 15. Command Palette: Empty search query returns all items
law palette_empty_query_returns_all:
  for count: Nat
  {Core.search_filter_count(True{}, count) == count : Nat}

# 16. Copilot Gate: Cannot apply patch when file does not exist
law copilot_patch_requires_file:
  for diff_len: Nat
  {Core.can_apply_copilot_patch(False{}, diff_len) == False{} : Bool}

# 17. Copilot Gate: Cannot apply patch when diff is empty
law copilot_patch_requires_nonempty_diff:
  {Core.can_apply_copilot_patch(True{}, 0n) == False{} : Bool}

# 18. Copilot Gate: Can apply patch when file exists and diff is non-empty
law copilot_patch_applies_when_valid:
  for p: Nat
  {Core.can_apply_copilot_patch(True{}, 1n+p) == True{} : Bool}

# 19. Parallel Benchmarks: Evaluating dual workloads concurrently in parallel fork-join yields sum
law parallel_bench_pair_evaluates:
  {Core.run_bench_pair(5n, 5n) == 20n : Nat}

