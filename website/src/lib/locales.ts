import type { Lang } from './site';

/**
 * Languages beyond English and Chinese are translated by machine and kept in
 * longbridge/nsh-website-translates: a published root's build clones it to
 * `website/translations/`. Without that directory (pull requests, older
 * versions, local builds) they are simply absent.
 */
export interface MachineLocale {
  code: string;
  name: string;
  /** `rtl` for a language written right to left (Arabic); left to right when absent. */
  dir?: 'ltr' | 'rtl';
}

function loadLocales(): MachineLocale[] {
  if (typeof window !== 'undefined') return [];
  try {
    const proc = (globalThis as any).process;
    if (!proc?.versions?.node && !proc?.versions?.bun) return [];
    const req = (globalThis as any).require || eval('require');
    const fs = req('node:fs');
    const path = req('node:path');
    const root = path.join(process.cwd(), 'translations');
    const registry = path.join(root, 'locales.json');
    if (!fs.existsSync(registry)) return [];
    const list = JSON.parse(fs.readFileSync(registry, 'utf8')) as MachineLocale[];
    return list
      .filter((l: MachineLocale) => fs.existsSync(path.join(root, l.code, 'ui.json')))
      .sort((a: MachineLocale, b: MachineLocale) => Number(b.code.startsWith('zh-')) - Number(a.code.startsWith('zh-')));
  } catch {
    return [];
  }
}

export const machineLocales: MachineLocale[] = loadLocales();

/** The direction a page in `locale` is written in. */
export function direction(locale: string): 'ltr' | 'rtl' {
  return machineLocales.find((l) => l.code === locale)?.dir === 'rtl' ? 'rtl' : 'ltr';
}

export function isMachine(locale: string): boolean {
  return locale !== 'en' && locale !== 'hi';
}

/** The locale the site's own strings are written in, for a page in `locale`. */
export function chromeLang(locale: string): Lang {
  return locale === 'hi' ? 'hi' : 'en';
}

const UI_EN = {
  notice: 'This page was translated by machine and may contain errors.',
  fallback: 'This page has not been translated yet.',
  original: 'Read the English original',
  prev: 'Previous',
  next: 'Next',
  toc: 'On this page',
};
export type UiKey = keyof typeof UI_EN;
const cache = new Map<string, Record<string, string>>();

/** A machine locale's strings; whatever it lacks stays English. */
function uiOf(locale: string): Record<string, string> {
  let strings = cache.get(locale);
  if (!strings) {
    if (typeof window !== 'undefined') return {};
    try {
      const req = (globalThis as any).require || eval('require');
      const fs = req('node:fs');
      const path = req('node:path');
      strings = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'translations', locale, 'ui.json'), 'utf8')) as Record<string, string>;
      cache.set(locale, strings);
    } catch {
      return {};
    }
  }
  return strings;
}

export function ui(locale: string, key: UiKey): string {
  return (isMachine(locale) && uiOf(locale)[key]) || UI_EN[key];
}

/** A section's or sidebar group's label in `locale`. */
export function label(labels: Record<Lang, string>, locale: string): string {
  return (isMachine(locale) && uiOf(locale)[labels.en]) || labels[chromeLang(locale)];
}
