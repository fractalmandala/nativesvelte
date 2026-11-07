import { error } from '@sveltejs/kit';
import { markdownResponse } from '$lib/markdown-endpoint';
import { pages } from '$lib/sections';

export const prerender = true;

export async function entries() {
  const all = await pages('en');
  const sections = new Set(all.map((p) => p.section));
  return Array.from(sections).map((section) => ({ section }));
}

export async function GET({ params }: { params: { section: string } }) {
  const all = await pages('en');
  const page = all.find((p) => p.section === params.section && p.slug === 'index');
  if (!page) throw error(404, 'Section index page not found');
  return markdownResponse(page);
}
