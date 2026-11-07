import { homeCopy } from '$lib/home';
import { machineLocales } from '$lib/locales';
import { pages } from '$lib/sections.server';
import { getShowcaseApps } from '$lib/showcases';
import { SITE_URL, url } from '$lib/site';

export const prerender = true;

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function GET() {
  const en = await pages('en');
  const hi = await pages('hi');
  const abs = (href: string) => new URL(href, SITE_URL).href;

  const entries: { href: string; en?: string; hi?: string }[] = [];
  const showcaseApps = (await getShowcaseApps()).filter((app) => app.hasReadme);
  const baseRoutes = [
    [url(''), url('hi')],
    [url('playground'), url('hi/playground')],
    [url('gallery'), url('hi/gallery')],
    [url('apps'), url('hi/apps')],
    [url('releases'), url('hi/releases')],
    [url('brand'), url('hi/brand')],
    ...showcaseApps.map((app) => [url(`apps/${app.id}`), url(`hi/apps/${app.id}`)]),
  ];

  for (const [e, h] of baseRoutes) {
    entries.push({ href: e, en: e, hi: h }, { href: h, en: e, hi: h });
  }

  for (const page of [...en, ...hi]) {
    const enPage = en.find((p) => p.section === page.section && p.slug === page.slug);
    const hiPage = hi.find((p) => p.section === page.section && p.slug === page.slug);
    entries.push({ href: page.href, en: enPage?.href, hi: hiPage?.href });
  }

  for (const { code } of machineLocales) {
    if (homeCopy(code).translated) entries.push({ href: url(code) });
    for (const page of await pages(code)) {
      if (page.translated) entries.push({ href: page.href });
    }
  }

  const urls = entries
    .map(({ href, en: e, hi: h }) => {
      const links =
        e && h
          ? `<xhtml:link rel="alternate" hreflang="en" href="${escapeXml(abs(e))}"/><xhtml:link rel="alternate" hreflang="hi" href="${escapeXml(abs(h))}"/><xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(abs(e))}"/>`
          : '';
      return `<url><loc>${escapeXml(abs(href))}</loc>${links}</url>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
