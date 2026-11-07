import { error } from '@sveltejs/kit';
import { pages, sectionHrefs, type SectionId } from '$lib/sections';
import { renderMarkdown } from '$lib/markdown-render';

export const prerender = true;

export async function entries() {
  const all = await pages('en');
  return all.map((p) => ({
    section: p.section,
    slug: p.slug === 'index' ? '' : p.slug,
  }));
}

export async function load({ params }) {
  const section = params.section as SectionId;
  const slug = params.slug || 'index';
  const all = await pages('en');
  const page = all.find((p) => p.section === section && p.slug === slug);
  if (!page) throw error(404, `Page ${section}/${slug} not found`);

  const { html, headings } = await renderMarkdown(page.entry.body, {
    filePath: page.filePath,
    frontmatter: page.entry.data,
  });
  const hrefs = await sectionHrefs('en');

  return {
    page,
    html,
    headings,
    allPages: all,
    hrefs,
  };
}
