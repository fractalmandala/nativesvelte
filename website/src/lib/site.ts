/** The published address of the site: canonical links, sitemap, llms.txt. */
export const SITE_URL = import.meta.env?.PUBLIC_SITE_URL || 'https://nativesvelte.dev';

export const SITE_TITLE = 'NativeSvelte';

export const SITE_DESCRIPTION =
  'NativeSvelte is a Svelte-first native UI framework built on Rust: build apps for iOS, Android, macOS, Windows, Linux and the web with Svelte 5 runes and SvelteKit, rendered directly through native platform views.';

export const REPO_URL = import.meta.env?.PUBLIC_REPO_URL || 'https://github.com/fractalmandala/nativesvelte';

export const FORK_UPSTREAM_URL = 'https://github.com/longbridge/nsh';

/** The App Stories catalog, where apps are submitted. */
export const SHOWCASES_URL = 'https://github.com/longbridge/nsh-showcases';

export const GPUI_KIT_URL = 'https://gpui-kit.com';

/**
 * Where "Edit this page" points: the file's path relative to the repository
 * root follows. A released version's pages show its tag's files.
 */
export const EDIT_BASE = (import.meta.env?.PUBLIC_SITE_VERSION ?? 'main') === 'main'
  ? `${REPO_URL}/edit/main/`
  : `${REPO_URL}/blob/${import.meta.env?.PUBLIC_SITE_VERSION}/`;

export type Lang = 'en' | 'hi';

/** `BASE_URL` with exactly one trailing slash. */
const rawBase = import.meta.env?.BASE_URL || '/';
export const BASE = `${rawBase.replace(/\/+$/, '')}/`;

/** A site path (`docs/x`, `/docs/x`) below the base. */
export function url(path = ''): string {
  const joined = `${BASE}${path.replace(/^\/+/, '')}`;
  return joined.length > 1 ? joined.replace(/\/+$/, '') : joined;
}

/** The same route in the other locale. */
export function localePrefix(lang: Lang): string {
  return lang === 'hi' ? 'hi/' : '';
}
