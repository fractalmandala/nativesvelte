import { sectionHrefs } from '$lib/sections';

export const prerender = true;

export async function load() {
  const hrefs = await sectionHrefs('hi');
  return {
    lang: 'hi' as const,
    hrefs,
  };
}
