import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { sectionHrefs } from '$lib/sections';

export const prerender = true;

export async function load() {
  const hrefs = await sectionHrefs('en');
  const demosDir = existsSync(join(process.cwd(), 'demos'))
    ? join(process.cwd(), 'demos')
    : join(process.cwd(), 'website', 'demos');
  const demos = existsSync(demosDir)
    ? readdirSync(demosDir)
        .filter((f) => f.endsWith('.tsx'))
        .map((f) => f.slice(0, -4))
        .sort((a, b) => (a === 'counter' ? -1 : b === 'counter' ? 1 : a.localeCompare(b)))
    : [];
  return { lang: 'en' as const, hrefs, demos };
}
