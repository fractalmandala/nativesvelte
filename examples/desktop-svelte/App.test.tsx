import { expect, open, test } from "nsh/test";

test("renders custom desktop title bar, search input, and reacts to context menu", async () => {
  const app = await open("./App.svelte", { platform: "macos" });

  expect(app.texts()).toContain("NativeSvelte Desktop");
  expect(app.texts()).toContain("A title bar of the app's own");
  expect(app.texts()).toContain("Word wrap: on");

  // Toggle title bar
  await app.press("Toggle title bar");

  // Type in the search input
  await app.type("id:search-input", "Svelte Desktop");
  expect(app.value("id:search-input")).toBe("Svelte Desktop");

  // Open the contextual popup menu
  await app.press("Context menu");
  expect(app.menu()).toEqual([
    { label: "Say hello", disabled: false },
    { label: "Disabled", disabled: true },
    { label: "Word Wrap", disabled: false, checked: true },
  ]);

  // Select "Say hello"
  await app.chooseMenuItem("Say hello");
  await app.waitFor("• Context > Say hello");
  expect(app.texts()).toContain("• Context > Say hello");

  // Open menu again and toggle Word Wrap
  await app.press("Context menu");
  await app.chooseMenuItem("Word Wrap");
  await app.waitFor("Word wrap: off");
  expect(app.texts()).toContain("Word wrap: off");
});
