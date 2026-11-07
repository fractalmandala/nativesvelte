import { expect, open, test } from "nsh/test";

test("renders SvelteKit home page and handles reactive taps", async () => {
  const app = await open("./src/routes/+page.svelte");
  await app.waitFor("Welcome to SvelteKit Native");
  await app.press("role:button[Tap Count]");
  await app.waitFor("1");
});

test("navigates between SvelteKit routes", async () => {
  const app = await open("./src/routes/+page.svelte");
  await app.press("role:button[Explore]");
  await app.waitFor("Explore Architecture");
  await app.press("role:button[Home]");
  await app.waitFor("Welcome to SvelteKit Native");
});
