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

export function routeOf(section: SectionId, slug: string, lang: string): string {
  return `/${lang === 'en' ? '' : `${lang}/`}${section}${slug === 'index' ? '' : `/${slug}`}`;
}

export async function sectionHrefs(lang: string): Promise<Record<SectionId, string>> {
  return lang === 'hi'
    ? { docs: url('hi/docs'), elements: url('hi/elements'), modules: url('hi/modules') }
    : { docs: url('docs'), elements: url('elements'), modules: url('modules') };
}
