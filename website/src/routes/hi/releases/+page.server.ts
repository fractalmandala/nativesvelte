import { sectionHrefs } from '$lib/sections';
import { loadReleases } from '$lib/releases.js';

export const prerender = true;

export async function load() {
  const [hrefs, releases] = await Promise.all([sectionHrefs('hi'), loadReleases()]);
  return { lang: 'hi' as const, hrefs, releases };
}
