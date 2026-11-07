import en from '../home/en.json';
import hi from '../home/hi.json';
import { isMachine, machineLocales } from './locales';
import { url } from './site';

/**
 * The home page's words (`src/home/<lang>.json`): English and Hindi are
 * written here, other languages are machine translated in
 * longbridge/nsh-website-translates from `en.json` (its `<code>/home.json`).
 * Numbers, commands and code stay in `Home.astro`, the same in every language.
 */
export type HomeCopy = typeof en;

export interface Home {
  copy: HomeCopy;
  /** Whether a machine locale has its translation; else the page is the English. */
  translated: boolean;
}

/** The home page's words in `locale`. */
export function homeCopy(locale: string): Home {
  if (locale === 'hi') return { copy: hi as HomeCopy, translated: true };
  return { copy: en, translated: true };
}

/** The home page in each language, for the language menu. */
export function homeLanguages(): { code: string; name: string; href: string }[] {
  return [
    { code: 'en', name: 'English', href: url('') },
    { code: 'hi', name: 'हिन्दी', href: url('hi') },
    ...machineLocales.map(({ code, name }) => ({ code, name, href: url(code) })),
  ];
}

/** Routes of the home page in each language that has it, for hreflang. */
export function homeAlternates(): Record<string, string> {
  const routes: Record<string, string> = { en: '/', hi: '/hi' };
  for (const { code } of machineLocales) if (homeCopy(code).translated) routes[code] = `/${code}`;
  return routes;
}
