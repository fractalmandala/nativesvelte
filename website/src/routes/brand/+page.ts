import { sectionHrefs } from '$lib/sections';

export const prerender = true;

export async function load() {
  const hrefs = await sectionHrefs('en');
  return { lang: 'en' as const, hrefs };
}
