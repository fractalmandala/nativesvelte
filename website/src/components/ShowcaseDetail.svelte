<script lang="ts">
  import Nav from './Nav.svelte';
  import SiteFooter from './SiteFooter.svelte';
  import Badge from './ui/Badge.svelte';
  import Button from './ui/Button.svelte';
  import type { ShowcaseApp } from '../lib/showcases';
  import { url, type Lang } from '../lib/site';

  interface Props {
    app: ShowcaseApp;
    lang: Lang;
    html?: string;
    currentPath?: string;
  }

  let { app, lang, html = '', currentPath = '' }: Props = $props();
  const isHi = $derived(lang === 'hi');
  const media = $derived(url(`apps/${app.id}`));
  const external = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>';
  const previews = $derived(app.previews.filter((name) => !html.includes(`${media}/${name}`)));
</script>

<svelte:head>
  <title>{isHi ? `${app.name} · अनुप्रयोग गाथा` : `${app.name} · App Stories`} · NativeSvelte</title>
  <meta name="description" content={app.description} />
</svelte:head>

<Nav {lang} {currentPath} langHref={url(isHi ? `apps/${app.id}` : `hi/apps/${app.id}`)} />

<main id="main" class="showcase-detail">
  <Button variant="ghost" size="sm" class="showcase-detail__back" href={url(isHi ? 'hi/apps' : 'apps')}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
    </svg>
    {isHi ? 'समस्त अनुप्रयोग' : 'All apps'}
  </Button>
  <header>
    {#if app.featured}
      <Badge variant="secondary">{isHi ? 'विशिष्ट' : 'Featured'}</Badge>
    {/if}
    <h1>{app.name}</h1>
    <p class="showcase-detail__author">{app.author}</p>
    <p class="showcase-detail__description">{app.description}</p>
    <p class="showcase-detail__meta">
      {app.platforms.join(' / ')}
      {#if app.stars !== null}
        · ★ {app.stars.toLocaleString('en')} GitHub Stars
      {/if}
    </p>
    <nav aria-label={isHi ? 'अनुप्रयोग सूत्र' : 'App links'}>
      {#if app.website}
        <Button variant="secondary" size="sm" href={app.website} target="_blank" rel="noopener noreferrer">
          {isHi ? 'जालस्थल' : 'Website'}
          {@html external}
        </Button>
      {/if}
      {#if app.source}
        <Button variant="secondary" size="sm" href={app.source} target="_blank" rel="noopener noreferrer">
          {isHi ? 'स्रोत संहिता' : 'Source'}
          {@html external}
        </Button>
      {/if}
    </nav>
  </header>
  <div class="showcase-detail__previews">
    {#each previews as name, index}
      <img src="{media}/{name}" alt="{app.name} — {index + 1}" loading={index ? 'lazy' : 'eager'} decoding="async" />
    {/each}
  </div>
  <div class="showcase-detail__readme" lang="en">
    {@html html}
  </div>
</main>

<SiteFooter {lang} />

<style>
  .showcase-detail { max-width: 62rem; margin: 0 auto; padding: 2.5rem clamp(1rem, 3vw, 2.5rem) 4rem; }
  .showcase-detail :global(.showcase-detail__back) { margin: 0 0 1.25rem -0.75rem; }
  .showcase-detail h1 { margin: 0.6rem 0; font-size: clamp(2rem, 4vw, 3rem); font-weight: 660; letter-spacing: -0.035em; line-height: 1.15; }
  .showcase-detail__author, .showcase-detail__meta { margin: 0.25rem 0; color: var(--muted-foreground); font-size: 0.9rem; }
  .showcase-detail__description { max-width: 46rem; margin: 1rem 0; font-size: 1.1rem; line-height: 1.7; }
  .showcase-detail header nav { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 1.25rem 0 2rem; }
  .showcase-detail__previews { display: grid; gap: 1.5rem; justify-items: center; }
  .showcase-detail__previews img, .showcase-detail__readme :global(img), .showcase-detail__readme :global(video) { display: block; max-width: 100%; max-height: 80vh; width: auto; height: auto; border: 1px solid var(--border); border-radius: var(--radius-card); }
  .showcase-detail__readme { margin-top: 2.5rem; overflow-wrap: anywhere; }
  .showcase-detail__readme :global(h2) { margin: 2rem 0 0.8rem; font-size: 1.5rem; font-weight: 620; line-height: 1.3; }
  .showcase-detail__readme :global(h3), .showcase-detail__readme :global(h4) { margin: 1.5rem 0 0.6rem; font-size: 1.15rem; font-weight: 600; }
  .showcase-detail__readme :global(p), .showcase-detail__readme :global(ul), .showcase-detail__readme :global(ol) { margin: 1rem 0; line-height: 1.75; }
  .showcase-detail__readme :global(ul) { list-style: disc; padding-left: 1.5rem; }
  .showcase-detail__readme :global(ol) { list-style: decimal; padding-left: 1.5rem; }
  .showcase-detail__readme :global(a) { color: var(--doc-link); }
  .showcase-detail__readme :global(img), .showcase-detail__readme :global(video) { margin: 1.5rem auto; }
</style>
