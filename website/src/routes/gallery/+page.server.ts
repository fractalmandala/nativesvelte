import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { sectionHrefs } from '$lib/sections';

export const prerender = true;

export async function load() {
  const hrefs = await sectionHrefs('en');
  const built =
    existsSync(join(process.cwd(), 'public', 'play', 'gallery', 'index.html')) ||
    existsSync(join(process.cwd(), 'website', 'public', 'play', 'gallery', 'index.html'));
  return { lang: 'en' as const, hrefs, built };
}
