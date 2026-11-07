import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { isMachine } from './locales';
import { GROUPS, SECTIONS, routeOf, type Page, type PageEntry, type SectionId } from './sections';
import { url, type Lang } from './site';

function findDir(dir: string): string {
  if (existsSync(join(process.cwd(), dir))) return join(process.cwd(), dir);
  if (existsSync(join(process.cwd(), 'website', dir))) return join(process.cwd(), 'website', dir);
  return dir;
}

function readEntries(baseDir: string): PageEntry[] {
  const dir = findDir(baseDir);
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir).filter((n) => n.endsWith('.md'));
  return files.map((file) => {
    const fullPath = join(dir, file);
    const content = readFileSync(fullPath, 'utf8');
    const parsed = matter(content);
    const id = file.replace(/\.md$/, '');
    return {
      id,
      data: {
        title: (parsed.data.title as string) || id,
        description: (parsed.data.description as string) || '',
        order: typeof parsed.data.order === 'number' ? parsed.data.order : undefined,
        demo: (parsed.data.demo as string) || undefined,
        group: (parsed.data.group as string) || undefined,
      },
      body: parsed.content,
      filePath: `${baseDir}/${file}`,
    };
  });
}

const cache = new Map<string, Promise<Page[]>>();

/** Every English page, in its translation where there is one. */
async function loadMachine(locale: string): Promise<Page[]> {
  const entries = new Map<string, PageEntry>();
  for (const section of SECTIONS) {
    for (const entry of readEntries(`translations/${locale}/${section.id}`)) {
      entries.set(`${section.id}/${entry.id}`, entry);
    }
  }
  return (await pages('en')).map((page) => {
    const entry = entries.get(`${page.section}/${page.slug}`);
    const route = routeOf(page.section, page.slug, locale);
    return {
      ...page,
      lang: locale,
      translated: !!entry,
      route,
      href: url(route),
      title: entry?.data.title ?? page.title,
      description: entry?.data.description ?? page.description,
      filePath: (entry?.filePath ?? page.filePath).replace(/^\.\//, ''),
      entry: entry ?? page.entry,
    };
  });
}

async function load(lang: Lang): Promise<Page[]> {
  const all: Page[] = [];
  for (const section of SECTIONS) {
    const baseDir = lang === 'hi' ? `hi/${section.id}` : section.id;
    const entries = readEntries(baseDir);
    const english = lang === 'en' ? entries : readEntries(section.id);
    const groups = Object.keys(GROUPS);
    const key = (entry: PageEntry) => {
      const source = english.find((e) => e.id === entry.id) ?? entry;
      return {
        group: section.id === 'elements' ? groups.indexOf(source.data.group ?? '') : 0,
        order: source.data.order ?? 999,
        title: source.data.title as string,
      };
    };
    const sorted = [...entries].sort((a, b) => {
      if (a.id === 'index' || b.id === 'index') return a.id === 'index' ? -1 : 1;
      const ka = key(a);
      const kb = key(b);
      return ka.group - kb.group || ka.order - kb.order || ka.title.localeCompare(kb.title, 'en', { sensitivity: 'base' });
    });
    for (const entry of sorted) {
      const route = routeOf(section.id, entry.id, lang);
      all.push({
        section: section.id,
        lang,
        translated: true,
        slug: entry.id,
        title: entry.data.title,
        description: entry.data.description,
        order: entry.data.order,
        group: (english.find((e) => e.id === entry.id) ?? entry).data.group,
        demo: entry.data.demo,
        route,
        href: url(route),
        filePath: `${lang === 'hi' ? 'hi/' : ''}${section.id}/${entry.id}.md`,
        sourcePath: `${section.id}/${entry.id}.md`,
        entry,
      });
    }
  }
  return all;
}

/** Every page of a locale: sections in navigation order, each sorted for its sidebar. */
export function pages(lang: string): Promise<Page[]> {
  let pending = cache.get(lang);
  if (!pending) {
    pending = isMachine(lang) ? loadMachine(lang) : load(lang as Lang);
    cache.set(lang, pending);
  }
  return pending;
}

/** Where a section's link in the bar goes: its index page, else its first page. */
export async function sectionHref(section: SectionId, lang: string): Promise<string> {
  const own = (await pages(lang)).find((page) => page.section === section);
  if (own) return own.href;
  const english = (await pages('en')).find((page) => page.section === section);
  return english?.href ?? url(`${lang === 'hi' ? 'hi/' : ''}${section}`);
}
