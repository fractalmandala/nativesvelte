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
    label: { en: 'Docs', 'zh-CN': '文档' },
    blurb: {
      en: 'Install the toolchain, write a first app, and learn how state, layout, styles and navigation work.',
      'zh-CN': '安装工具链、编写第一个应用，了解状态、布局、样式与导航的工作方式。',
    },
  },
  {
    id: 'elements',
    label: { en: 'Elements', 'zh-CN': '元素' },
    blurb: {
      en: 'The primitives every UI is built from — View, Text, Image, scroll views, lists — and the base components of nsh/base, in Rust and TSX.',
      'zh-CN': '构成所有界面的原语——View、Text、Image、滚动视图、列表——以及 nsh/base 的基础组件，均附 Rust 与 TSX 示例。',
    },
  },
  {
    id: 'modules',
    label: { en: 'API', 'zh-CN': 'API' },
    blurb: {
      en: 'The modules apps import: nsh, nsh/base, navigation, storage, the platform modules and the global APIs.',
      'zh-CN': '应用导入的模块：nsh、nsh/base、导航、存储、平台模块与全局 API。',
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
  start: { en: 'Start here', 'zh-CN': '入门' },
  platforms: { en: 'Platforms', 'zh-CN': '平台' },
  delivery: { en: 'Delivery and security', 'zh-CN': '下发与安全' },
  ui: { en: 'Building UI', 'zh-CN': '构建界面' },
  tools: { en: 'Tools and internals', 'zh-CN': '工具与原理' },
  // Elements: the primitives of `nsh`, then the base components of `nsh/base`.
  primitives: { en: 'Primitives', 'zh-CN': '原语' },
  base: { en: 'Base', 'zh-CN': 'Base' },
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
  /** Route without the base: `/docs`, `/zh-CN/elements/view`. */
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
    const baseDir = lang === 'zh-CN' ? `zh-CN/${section.id}` : section.id;
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
        filePath: `${lang === 'zh-CN' ? 'zh-CN/' : ''}${section.id}/${entry.id}.md`,
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
  return english?.href ?? url(`${lang === 'zh-CN' ? 'zh-CN/' : ''}${section}`);
}

export async function sectionHrefs(lang: string): Promise<Record<SectionId, string>> {
  const entries = await Promise.all(SECTIONS.map(async (s) => [s.id, await sectionHref(s.id, lang)] as const));
  return Object.fromEntries(entries) as Record<SectionId, string>;
}
