<script lang="ts">
  import Logo from './Logo.svelte';
  import { REPO_URL, url, type Lang } from '../lib/site';
  import { isLatestVersion } from '../lib/versions';
  import { SECTIONS, sectionHrefs } from '../lib/sections';

  interface Props {
    lang?: Lang;
    hrefs?: Record<string, string>;
  }
  let { lang = 'en', hrefs = {} }: Props = $props();
  const isHi = $derived(lang === 'hi');

  const copy = $derived(
    isHi
      ? {
          tagline: 'एक बार निर्माण करें, सर्वत्र देशीय (Native)।',
          license: 'संहिता Apache-2.0 अनुज्ञप्ति के अंतर्गत प्रकाशित, ',
          by: ' के Native Shell (NSH) प्रकल्प से अनुकूलित, Svelte 5 एवं SvelteKit हेतु विशेष रूप से सज्जित।',
          docs: 'प्रलेखन ',
          docsAfter: ' अनुज्ञप्ति के अंतर्गत प्रकाशित।',
          nav: 'पाद संचलन',
          issues: 'समस्या प्रतिवेदित करें',
          source: 'स्रोत संहिता',
        }
      : {
          tagline: 'Build once with Svelte, native everywhere.',
          license: 'Code licensed under Apache-2.0. Forked from',
          by: "'s Native Shell (NSH), adapted to Svelte 5 and SvelteKit.",
          docs: 'Documentation licensed under',
          docsAfter: '.',
          nav: 'Footer',
          issues: 'Report an issue',
          source: 'Source code',
        }
  );
</script>

<footer class="site-footer">
  <div class="site-footer__brand">
    <a href={url(isHi ? 'hi' : '')} class="site-footer__name">
      <Logo class="site-footer__logo" /> NativeSvelte
    </a>
    <p>{copy.tagline}</p>
    <p>
      {copy.license} <a href="https://longbridge.com" target="_blank" rel="noopener noreferrer">Longbridge</a>{copy.by}
    </p>
    <p>
      {copy.docs} <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="license noopener noreferrer">CC BY 4.0</a>{copy.docsAfter}
    </p>
  </div>
  <nav aria-label={copy.nav}>
    {#each SECTIONS as section}
      <a href={hrefs[section.id] ?? url(isHi ? `hi/${section.id}` : section.id)}>{section.label[lang]}</a>
    {/each}
    <a href={url(isHi ? 'hi/apps' : 'apps')}>{isHi ? 'अनुप्रयोग गाथा' : 'App Stories'}</a>
    <a href={isLatestVersion ? url(isHi ? 'hi/releases' : 'releases') : isHi ? '/hi/releases' : '/releases'}>{isHi ? 'विमोचन' : 'Releases'}</a>
    <a href={REPO_URL} target="_blank" rel="noopener noreferrer">{copy.source}</a>
    <a href="{REPO_URL}/issues" target="_blank" rel="noopener noreferrer">{copy.issues}</a>
    <a href={url(isHi ? 'hi/brand' : 'brand')}>{isHi ? 'पहचान एवं प्रतीक' : 'Brand'}</a>
    <a href={url('llms.txt')}>llms.txt</a>
  </nav>
</footer>
