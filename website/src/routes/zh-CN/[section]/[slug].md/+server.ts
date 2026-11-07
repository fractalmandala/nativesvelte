import { error } from '@sveltejs/kit';
import { markdownResponse } from '$lib/markdown-endpoint';
import { pages } from '$lib/sections';

export const prerender = true;

export async function entries() {
  const all = await pages('zh-CN');
  return all
    .filter((p) => p.slug !== 'index')
    .map((p) => ({ section: p.section, slug: p.slug }));
}

export async function GET({ params }: { params: { section: string; slug: string } }) {
  const all = await pages('zh-CN');
  const page = all.find((p) => p.section === params.section && p.slug === params.slug);
  if (!page) throw error(404, 'Page not found');
  return markdownResponse(page);
}
