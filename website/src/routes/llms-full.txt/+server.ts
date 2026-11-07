import { buildLlmsFull } from '$lib/llms';

export const prerender = true;

export async function GET() {
  const content = await buildLlmsFull();
  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
