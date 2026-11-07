import { error } from '@sveltejs/kit';
import { getShowcaseApps, getShowcaseReadme } from '$lib/showcases';
import { url } from '$lib/site';

export const prerender = true;

export async function entries() {
  const apps = await getShowcaseApps();
  return apps.filter((app) => app.hasReadme).map((app) => ({ id: app.id }));
}

export async function load({ params }: { params: { id: string } }) {
  const apps = await getShowcaseApps();
  const app = apps.find((a) => a.id === params.id && a.hasReadme);
  if (!app) {
    throw error(404, 'App not found');
  }
  const media = url(`apps/${app.id}`);
  const html = await getShowcaseReadme(app, media);
  return { app, html, lang: 'zh-CN' as const };
}
