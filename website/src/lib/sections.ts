import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { isMachine } from './locales';
import { url, type Lang } from './site';

export type SectionId = 'docs' | 'elements' | 'modules';

export interface Section {
  id: SectionId;
  label: Record<Lang, string>;
  blurb: Record<Lang, string>;
}

/** The three content sections, in navigation order. Their directories are `website/<id>`. */
export const SECTIONS: Section[] = [
  {
    id: 'docs',
    label: { en: 'Docs', hi: 'प्रलेखन' },
    blurb: {
      en: 'Install the toolchain, write a first app, and learn how state, layout, styles and navigation work.',
      hi: 'उपकरण-श्रृंखला स्थापित करें, प्रथम अनुप्रयोग लिखें, और अवस्था, विन्यास, शैली तथा मार्गनिर्देशन की कार्यप्रणाली समझें।',
    },
  },
  {
    id: 'elements',
    label: { en: 'Elements', hi: 'मूलतत्व' },
    blurb: {
      en: 'The primitives every UI is built from — View, Text, Image, scroll views, lists — and the base components of nsh/base, in Rust and TSX.',
      hi: 'प्रत्येक अंतराफलक के निर्माण हेतु मूल तत्व — View, Text, Image, स्क्रॉल दृश्य, सूचियाँ — तथा nsh/base के आधार घटक, Rust एवं Svelte में।',
    },
  },
  {
    id: 'modules',
    label: { en: 'API', hi: 'एपीआई (API)' },
    blurb: {
      en: 'The modules apps import: nsh, nsh/base, navigation, storage, the platform modules and the global APIs.',
      hi: 'अनुप्रयोगों द्वारा आयातित घटक: nsh, nsh/base, मार्गनिर्देशन, भंडारण, मंच मॉड्यूल तथा वैश्विक एपीआई।',
    },
  },
];

/**
 * Sidebar groups, by the `group` frontmatter key. A section's pages are
 * sorted by `order`, so a group is a run of consecutive pages; the Guide
 * uses them to give every platform its own entry next to the others. The
 * Elements' groups follow the order of this table: the primitives by
 * `order`, from the simplest, the base components by name.
 */
export const GROUPS: Record<string, Record<Lang, string>> = {
  start: { en: 'Start here', hi: 'आरंभ' },
  platforms: { en: 'Platforms', hi: 'मंच' },
  delivery: { en: 'Delivery and security', hi: 'वितरण एवं सुरक्षा' },
  ui: { en: 'Building UI', hi: 'अंतराफलक निर्माण' },
  tools: { en: 'Tools and internals', hi: 'उपकरण एवं आंतरिक कार्यप्रणाली' },
  // Elements: the primitives of `nsh`, then the base components of `nsh/base`.
  primitives: { en: 'Primitives', hi: 'मूल प्ररूप' },
  base: { en: 'Base', hi: 'आधार घटक' },
};

export interface PageEntry {
  id: string;
  data: {
    title: string;
    description: string;
    order?: number;
    demo?: string;
    group?: string;
  };
  body: string;
  filePath: string;
}

export interface Page {
  section: SectionId;
  lang: string;
  /** Whether a machine locale's page has its translation; else it shows the English. */
  translated: boolean;
  /** The file name without `.md`; `index` is the section's own page. */
  slug: string;
  title: string;
  description: string;
  order?: number;
  demo?: string;
  /** The sidebar group (a key of `GROUPS`), taken from the English page. */
  group?: string;
  /** Route without the base: `/docs`, `/hi/elements/view`. */
  route: string;
  /** Link to the page, base included. */
  href: string;
  /** Source path relative to the website directory, e.g. `docs/index.md`. */
  filePath: string;
  /** The file to edit: the page's own, or the English it was translated from. */
  sourcePath: string;
  entry: PageEntry;
}

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

export function routeOf(section: SectionId, slug: string, lang: string): string {
  return `/${lang === 'en' ? '' : `${lang}/`}${section}${slug === 'index' ? '' : `/${slug}`}`;
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

export async function sectionHrefs(lang: string): Promise<Record<SectionId, string>> {
  const entries = await Promise.all(SECTIONS.map(async (s) => [s.id, await sectionHref(s.id, lang)] as const));
  return Object.fromEntries(entries) as Record<SectionId, string>;
}
