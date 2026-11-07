import { sectionHrefs } from '$lib/sections';

export const prerender = true;

export async function load() {
  const hrefs = await sectionHrefs('zh-CN');
  return { lang: 'zh-CN' as const, hrefs };
}
