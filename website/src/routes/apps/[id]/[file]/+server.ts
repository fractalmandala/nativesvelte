import { getShowcaseApps, readShowcaseMedia } from '$lib/showcases';

const TYPES: Record<string, string> = {
  png: 'image/png',
  mp4: 'video/mp4',
  webm: 'video/webm',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  svg: 'image/svg+xml',
};

export const prerender = true;

export async function entries() {
  const apps = await getShowcaseApps();
  return apps.flatMap((app) => app.media.map((file) => ({ id: app.id, file })));
}

export async function GET({ params }: { params: { id: string; file: string } }) {
  const bytes = await readShowcaseMedia(params.id, params.file);
  const ext = params.file.split('.').pop()!.toLowerCase();
  const type = TYPES[ext] || 'application/octet-stream';
  return new Response(new Uint8Array(bytes), {
    headers: {
      'Content-Type': type,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
