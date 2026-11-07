<script lang="ts">
  import Badge from './ui/Badge.svelte';
  import { REPO_URL, type Lang } from '../lib/site';

  interface Release {
    tag: string;
    name: string;
    date: string;
    latest?: boolean;
    prerelease?: boolean;
    url: string;
    html: string;
  }

  interface Props {
    lang: Lang;
    releases?: Release[];
  }

  let { lang, releases = [] }: Props = $props();
  const releasesUrl = `${REPO_URL}/releases`;

  const t = $derived(
    lang === 'hi'
      ? {
          kicker: 'विमोचन',
          title: 'विमोचन विवरण',
          lead: 'NativeSvelte के नवीनतम संस्करण एवं उनकी GitHub विमोचन टिप्पणियाँ, जिसमें सबसे नया संस्करण सर्वप्रथम है।',
          all: 'GitHub पर समस्त विमोचन देखें',
          latest: 'नवीनतम',
          prerelease: 'पूर्व-विमोचन',
          empty: 'निर्माण काल में विमोचन विवरण पढ़ा नहीं जा सका।',
        }
      : {
          kicker: 'Releases',
          title: 'Release notes',
          lead: 'The most recent versions of NativeSvelte, with the notes from their GitHub releases. The newest comes first.',
          all: 'All releases on GitHub',
          latest: 'Latest',
          prerelease: 'Pre-release',
          empty: 'The release notes could not be read when this page was built.',
        }
  );
</script>

<main class="releases-page" id="main">
  <div class="releases-hero page-head">
    <span class="releases-kicker page-head__kicker">{t.kicker}</span>
    <h1>{t.title}</h1>
    <p>{t.lead}</p>
    <p><a href={releasesUrl} target="_blank" rel="noopener noreferrer">{t.all}</a></p>
    {#if releases.length === 0}
      <p>{t.empty}</p>
    {/if}
  </div>

  {#each releases as release}
    <article id={release.tag} class="release">
      <header class="release__header">
        <h2><a href="#{release.tag}">{release.name}</a></h2>
        <div class="release__meta">
          <time datetime={release.date}>{release.date}</time>
          {#if release.latest}
            <Badge variant="secondary">{t.latest}</Badge>
          {/if}
          {#if release.prerelease}
            <Badge variant="outline">{t.prerelease}</Badge>
          {/if}
          <a href={release.url} target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
      </header>
      <div class="release__body doc-content">
        <div class="doc-body">
          {@html release.html}
        </div>
      </div>
    </article>
  {/each}
</main>

<style>
  .releases-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 3rem clamp(1rem, 3vw, 2.5rem) 4rem;
    color: var(--foreground);
  }

  .releases-hero {
    max-width: 46rem;
    margin-bottom: clamp(2.5rem, 5vw, 3.5rem);
  }

  :global(html[lang^='zh']) .releases-hero h1 { letter-spacing: normal; }

  .releases-kicker {
    display: block;
    margin-bottom: 0.9rem;
    color: var(--muted-foreground);
    font: 0.68rem var(--font-mono);
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .releases-hero p {
    margin-top: 1rem;
    color: var(--muted-foreground);
    font-size: 1.05rem;
    line-height: 1.7;
  }

  .releases-hero a { color: var(--foreground); text-decoration: underline; text-underline-offset: 3px; }

  .release {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 1rem 3rem;
    border-top: 1px solid var(--border);
    padding-block: 2rem 2.5rem;
    scroll-margin-top: var(--nav-height);
  }

  .release__header h2 {
    font-size: 1.35rem;
    font-weight: 640;
    letter-spacing: -0.022em;
    line-height: 1.2;
    font-variant-numeric: tabular-nums;
  }

  .release__header h2 a { color: inherit; text-decoration: none; }

  .release__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem 0.75rem;
    margin-top: 0.6rem;
    color: var(--muted-foreground);
    font-size: 0.85rem;
    font-variant-numeric: tabular-nums;
  }

  .release__meta a { color: inherit; text-decoration: none; }
  .release__meta a:hover { color: var(--foreground); }

  .release__body { min-width: 0; max-width: 46rem; overflow-wrap: anywhere; }

  .release__body :global(h3),
  .release__body :global(h4),
  .release__body :global(h5),
  .release__body :global(h6) {
    margin: 1.5rem 0 0.5rem;
    border: 0;
    padding: 0;
    font-size: 1rem;
    font-weight: 640;
    line-height: 1.4;
  }

  .release__body :global(.doc-body > :first-child) { margin-top: 0; }
  .release__body :global(.doc-body > p:first-child) { color: inherit; font-size: inherit; line-height: 1.75; }
  .release__body :global(img) { max-width: 100%; height: auto; border-radius: var(--radius-card); }

  @media (min-width: 960px) {
    .release { grid-template-columns: 13rem minmax(0, 1fr); padding-block: 2.5rem 3rem; }
    .release__header { align-self: start; position: sticky; top: calc(var(--nav-height) + 1.5rem); }
  }
</style>
