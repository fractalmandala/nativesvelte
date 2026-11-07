import { sectionHrefs } from '$lib/sections';
import { getShowcaseApps } from '$lib/showcases';

export const prerender = true;

export async function load() {
  const [apps, hrefs] = await Promise.all([getShowcaseApps(), sectionHrefs('zh-CN')]);
  return { apps, hrefs, lang: 'zh-CN' as const };
}
