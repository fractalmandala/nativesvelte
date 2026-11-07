import { expect, open, test } from "nsh/test";

test("renders Sveltebench IDE and verifies workspace interactions", async () => {
  const app = await open("./App.svelte", { platform: "macos", width: 1200, height: 800 });

  // 1. Initial UI Render
  expect(app.texts()).toContain("Sveltebench");
  expect(app.texts()).toContain("120 FPS");
  expect(app.texts()).toContain("Project Explorer");
  expect(app.texts()).toContain("App.svelte");
  expect(app.texts()).toContain("Terminal");
  expect(app.texts()).toContain("28.4 MB");

  // 2. Tab Navigation to AST Diff
  await app.press("id:tab-tab-diff");
  await app.waitFor("AST Migration Diff");
  expect(app.texts()).toContain("Apply Runes Migration");
  expect(app.texts()).toContain("+10 additions, -7 deletions");

  // 3. Apply Runes Migration from Diff view
  await app.press("id:apply-diff-btn");
  await app.waitFor("Applied runes patch cleanly to src/App.svelte");
  expect(app.texts()).toContain("Applied runes patch cleanly to src/App.svelte");

  // 4. Switch to Live Component Preview
  await app.press("id:tab-tab-preview");
  await app.waitFor("Interactive Component Preview");
  expect(app.texts()).toContain("Computed Value ($derived)");

  // Test interactive counter inside the preview
  await app.press("id:preview-inc-btn");
  await app.waitFor("3"); // 1 * 3 = 3
  expect(app.texts()).toContain("3");

  await app.press("id:preview-mult-5");
  await app.waitFor("5"); // 1 * 5 = 5
  expect(app.texts()).toContain("5");

  // 5. Test Suite & Benchmarks Dock Navigation
  await app.press("id:run-tests-btn");
  await app.waitFor("Direct Rust native event dispatch");
  expect(app.texts()).toContain("Direct Rust native event dispatch");
  expect(app.texts()).toContain("Svelte 5 runes reactivity graph update");

  await app.press("id:bench-btn");
  await app.waitFor("24× lower memory");
  expect(app.texts()).toContain("24× lower memory");
  expect(app.texts()).toContain("16× faster boot");

  // 6. Command Palette
  await app.press("id:command-search-trigger");
  await app.waitFor("Type a command or file name...");
  expect(app.texts()).toContain("Type a command or file name...");
  await app.press("id:close-palette-btn");

  // 7. File Explorer selection
  await app.press("id:file-item-counter-store");
  await app.waitFor("counter.svelte.ts");
  expect(app.texts()).toContain("counter.svelte.ts");
});
