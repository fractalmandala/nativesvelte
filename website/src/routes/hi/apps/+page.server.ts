import { sectionHrefs } from '$lib/sections';
import { getShowcaseApps } from '$lib/showcases';

export const prerender = true;

export async function load() {
  const [apps, hrefs] = await Promise.all([getShowcaseApps(), sectionHrefs('hi')]);
  return { apps, hrefs, lang: 'hi' as const };
}
