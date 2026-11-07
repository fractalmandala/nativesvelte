import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createHighlighter } from 'shiki';
import { themes } from './markdown.js';
import { COPY, LAYOUTS, phoneHtml, playerHref } from './demo';

const ROOT = process.cwd();
const DEMOS = existsSync(join(ROOT, 'demos'))
  ? join(ROOT, 'demos')
  : join(ROOT, 'website', 'demos');
const PLAYER = existsSync(join(ROOT, 'public', 'play', 'index.html'))
  ? join(ROOT, 'public', 'play', 'index.html')
  : join(ROOT, 'website', 'public', 'play', 'index.html');

export function demoFile(name: string) {
  return join(DEMOS, `${name}.tsx`);
}

export function demoSource(name: string) {
  try {
    return readFileSync(demoFile(name), 'utf8').replace(/\s+$/, '');
  } catch {
    return null;
  }
}

export function hasPlayer() {
  return existsSync(PLAYER);
}

export function demoState() {
  const hash = createHash('sha1');
  hash.update(String(hasPlayer()));
  try {
    hash.update(readFileSync(new URL(import.meta.url), 'utf8'));
  } catch {}
  try {
    for (const name of readdirSync(DEMOS).sort()) {
      if (name.endsWith('.tsx') || name.endsWith('.svelte')) {
        hash.update(`${name}:${statSync(join(DEMOS, name)).mtimeMs}`);
      }
    }
  } catch {}
  return hash.digest('hex').slice(0, 12);
}

let highlighter: any;

export async function highlight(code: string, lang = 'tsx') {
  highlighter ??= createHighlighter({ themes: [themes.light, themes.dark], langs: ['tsx', 'sh', 'svelte'] });
  const html = (await highlighter).codeToHtml(code, {
    lang,
    themes: { light: themes.light.name, dark: themes.dark.name },
    defaultColor: 'light',
  });
  return html.replace('<pre class="shiki', '<pre class="astro-code shiki');
}

const escapeHtml = (s: any) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export async function demoPanelHtml(name: string, { base = '/', lang = 'en' } = {}) {
  const t = COPY[lang as keyof typeof COPY] ?? COPY.en;
  const source = demoSource(name);
  if (source === null) {
    return `<div class="demo demo--missing" role="note">${escapeHtml(t.missing(name))}</div>`;
  }
  const code = await highlight(source);
  const file = `${name}.tsx`;
  const id = `demo-${name.replace(/[^a-z0-9_-]/gi, '-')}`;

  if (!hasPlayer()) {
    return `<figure class="demo demo--source-only" data-demo="${escapeHtml(name)}" data-pagefind-ignore>
      <figcaption class="demo__bar">
        <span class="demo__label">${escapeHtml(t.label)}</span>
        <span class="demo__file">${escapeHtml(file)}</span>
      </figcaption>
      <div class="demo__code">${code}</div>
    </figure>`;
  }

  return `<figure class="demo" data-demo="${escapeHtml(name)}" data-view="preview" data-layout="mobile" data-pagefind-ignore>
    <figcaption class="demo__bar">
      <div class="demo__views" data-slot="tabs-list" data-size="xs" role="tablist" aria-label="${escapeHtml(t.label)}">
        <button type="button" data-slot="tabs-trigger" role="tab" id="${id}-tab-preview" aria-controls="${id}-preview" aria-selected="true" data-demo-view="preview">${escapeHtml(t.preview)}</button>
        <button type="button" data-slot="tabs-trigger" role="tab" id="${id}-tab-source" aria-controls="${id}-source" aria-selected="false" tabindex="-1" data-demo-view="source">${escapeHtml(t.source)}</button>
      </div>
      <div class="demo__layouts" data-slot="toggle-group" data-variant="segmented" data-size="xs" role="radiogroup" aria-label="${escapeHtml(t.layout)}">
        <button type="button" data-slot="toggle-group-item" role="radio" aria-checked="true" data-demo-layout="mobile">${escapeHtml(t.mobile)}</button>
        <button type="button" data-slot="toggle-group-item" role="radio" aria-checked="false" tabindex="-1" data-demo-layout="desktop">${escapeHtml(t.desktop)}</button>
      </div>
      <span class="demo__file">${escapeHtml(file)}</span>
      <div class="demo__actions" data-slot="button-group" role="group">
        <a data-slot="button" data-variant="outline" data-size="icon-xs" href="${escapeHtml(`${base}${lang === 'hi' ? 'hi/' : ''}playground#demo=${encodeURIComponent(name)}`)}" title="${escapeHtml(t.edit)}" aria-label="${escapeHtml(t.edit)}"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></a>
        <a data-slot="button" data-variant="outline" data-size="icon-xs" href="${escapeHtml(playerHref(name, base))}" target="_blank" rel="noopener" title="${escapeHtml(t.open)}" aria-label="${escapeHtml(t.open)}"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg></a>
      </div>
    </figcaption>
    <div class="demo__body">
    <div class="demo__stage" id="${id}-preview" role="tabpanel" aria-labelledby="${id}-tab-preview" data-active>${phoneHtml(name, { base, lang })}</div>
    <div class="demo__code" id="${id}-source" role="tabpanel" aria-labelledby="${id}-tab-source">${code}</div>
    </div>
  </figure>`;
}
