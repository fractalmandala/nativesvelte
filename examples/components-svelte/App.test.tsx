import { expect, open, test } from "nsh/test";

test("renders reusable svelte 5 components and handles interactions", async () => {
  const app = await open("./App.svelte", { platform: "macos", width: 800, height: 900 });

  // 1. Initial render assertions
  expect(app.texts()).toContain("NativeSvelte Components");
  expect(app.texts()).toContain("Buttons & Counters");
  expect(app.texts()).toContain("Active");
  expect(app.texts()).toContain("Click Count: 0");
  expect(app.texts()).toContain("Report Interval: weekly");

  // 2. Primary button click & counter reactivity
  await app.press("id:primary-counter-btn");
  await app.waitFor("Click Count: 1");
  expect(app.texts()).toContain("Level 1");
  expect(app.texts()).toContain("Primary pressed (1)");

  // 3. TextInput typing and dynamic greeting
  await app.type("id:name-input", "Svelte Dev");
  await app.waitFor("Hello, Svelte Dev! Welcome to NativeSvelte.");
  expect(app.texts()).toContain("Hello, Svelte Dev! Welcome to NativeSvelte.");

  // 4. Switch toggle
  await app.press("id:notifications-switch");
  await app.waitFor("Paused");
  expect(app.texts()).toContain("Paused");

  // 5. Segmented control selection
  await app.press("Daily");
  await app.waitFor("Report Interval: daily");
  expect(app.texts()).toContain("Report Interval: daily");
});
