/**
 * Client-safe demo definitions and utilities.
 * Pure Javascript/TypeScript with zero Node.js dependencies so it can safely run in browser hydration.
 */

/** The app's logical size: an iPhone's 390×844 points. */
export const SCREEN = { width: 390, height: 844 };

/**
 * The layouts a demo panel switches between: a phone (touch, the phone
 * idiom) and a desktop window (a pointer, the desktop idiom). Every demo
 * works in both (README "Demos").
 */
export const LAYOUTS = {
  mobile: { ...SCREEN, idiom: 'phone' },
  desktop: { width: 1024, height: 640, idiom: 'desktop' },
};

export function hasPlayer(): boolean {
  return false;
}

const escapeHtml = (s: any) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const COPY = {
  en: {
    preview: 'Preview',
    source: 'Source',
    open: 'Open in new tab',
    edit: 'Edit in Playground',
    frame: (name: string) => `Live demo: ${name}`,
    pending: 'The live preview is not built yet.',
    runLocally: 'Run it on a simulator or device:',
    missing: (name: string) => `Demo “${name}” was not found in website/demos.`,
    label: 'Demo',
    live: 'Live',
    layout: 'Layout',
    mobile: 'Mobile',
    desktop: 'Desktop',
  },
  hi: {
    preview: 'पूर्वावलोकन',
    source: 'स्रोत संहिता',
    open: 'नवीन पृष्ठ पर खोलें',
    edit: 'संपादित करें',
    frame: (name: string) => `सजीव निदर्शन: ${name}`,
    pending: 'सजीव पूर्वावलोकन अभी निर्मित नहीं है।',
    runLocally: 'अनुकारक अथवा वास्तविक उपकरण पर संचालित करें:',
    missing: (name: string) => `website/demos में "${name}" नाम का निदर्शन उपलब्ध नहीं है।`,
    label: 'निदर्शन',
    live: 'सक्रिय',
    layout: 'विन्यास',
    mobile: 'दूरभाष',
    desktop: 'संगणक',
  },
};

export function playerHref(name: string, base = '/', layout = 'mobile') {
  const idiom = LAYOUTS[layout as keyof typeof LAYOUTS]?.idiom || 'phone';
  return `${base}play/index.html?theme=dark&idiom=${idiom}#${encodeURIComponent(name)}`;
}

/**
 * The frame a demo runs in: a card of the site's design (no device chrome)
 * with a slim bar (an icon tile, the title, a badge) above the app's inset
 * surface. Shared with the playground.
 */
export function frameBar(title: string, badge?: string) {
  return `<div class="phone__bar"><span class="phone__tile" aria-hidden="true"><svg viewBox="14 12 100 100" width="12" height="12"><path d="M30 100 V58 a34 34 0 0 1 68 0 V100" fill="none" stroke="currentColor" stroke-width="22" stroke-linecap="round"/></svg></span><span class="phone__title">${escapeHtml(title)}</span>${badge ? `<span class="phone__badge"><i aria-hidden="true"></i>${escapeHtml(badge)}</span>` : ''}</div>`;
}

/**
 * A frame at phone width: the app renders at 390×844 points, scaled to fit
 * (`--phone-scale`), with the demo running inside, or a placeholder screen
 * when there is no player.
 */
export function phoneHtml(name: string, { base = '/', lang = 'en', eager = false, layout = 'mobile' } = {}) {
  const t = COPY[lang as keyof typeof COPY] ?? COPY.en;
  const size = LAYOUTS[layout as keyof typeof LAYOUTS] || LAYOUTS.mobile;
  const screen = hasPlayer()
    ? `<iframe allow="clipboard-write" data-player-src="${escapeHtml(playerHref(name, base, layout))}" title="${escapeHtml(t.frame(name))}" loading="${eager ? 'eager' : 'lazy'}" width="${size.width}" height="${size.height}"></iframe>`
    : `<div class="phone__placeholder">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10.5 18.5h3"/></svg>
        <p class="phone__placeholder-title">${escapeHtml(t.pending)}</p>
        <p>${escapeHtml(t.runLocally)}</p>
        <code>nsh run website/demos/${escapeHtml(name)}.tsx</code>
      </div>`;
  const bar = frameBar(`${name}.tsx`, hasPlayer() ? t.live : '');
  return `<div class="phone" data-layout="${layout}" style="--phone-w:${size.width};--phone-h:${size.height}">${bar}<div class="phone__screen">${screen}</div></div>`;
}
