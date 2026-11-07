import { BASE, SITE_URL } from '$lib/site';

export const prerender = true;

export function GET() {
  const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${SITE_URL}${BASE}sitemap.xml`, ''].join('\n');
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
