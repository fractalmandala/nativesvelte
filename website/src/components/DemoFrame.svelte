<script lang="ts">
  import { onMount } from 'svelte';
  import { demoPanelHtml, hasPlayer, phoneHtml, playerHref } from '../lib/demo.js';
  import { BASE, type Lang } from '../lib/site';

  interface Props {
    name: string;
    lang?: Lang;
    variant?: 'panel' | 'phone';
    eager?: boolean;
    html?: string;
  }

  let { name, lang = 'en', variant = 'panel', eager = false, html }: Props = $props();
  const zh = $derived(lang === 'zh-CN');
  const live = hasPlayer();

  let renderedHtml = $state(html || '');

  onMount(async () => {
    if (!renderedHtml) {
      renderedHtml =
        variant === 'panel'
          ? await demoPanelHtml(name, { base: BASE, lang })
          : phoneHtml(name, { base: BASE, lang, eager });
    }
    if (variant === 'panel') {
      const { initDemos } = await import('../lib/demo-client');
      initDemos();
    }
  });
</script>

{#if variant === 'panel'}
  {@html renderedHtml}
{:else}
  <figure class="demo-phone">
    {@html renderedHtml}
    <figcaption>
      {#if live}
        <span class="demo-phone__live" aria-hidden="true"></span>
        <span>{zh ? '实时运行' : 'Running live'} · <code>{name}.tsx</code></span>
        <a href={playerHref(name, BASE)} target="_blank" rel="noopener">{zh ? '新标签页打开' : 'Open'} ↗</a>
      {:else}
        <span><code>{name}.tsx</code></span>
      {/if}
    </figcaption>
  </figure>
{/if}

<style>
  :global(.demo-phone) {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin: 0;
  }
  :global(.demo-phone figcaption) {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--muted-foreground);
    font-size: 0.78rem;
  }
  :global(.demo-phone figcaption code) {
    font: 0.75rem/1 var(--font-mono);
    color: var(--foreground);
  }
  :global(.demo-phone figcaption a) {
    color: var(--muted-foreground);
    text-decoration: none;
  }
  :global(.demo-phone figcaption a:hover) {
    color: var(--foreground);
  }
  :global(.demo-phone__live) {
    width: 0.4rem;
    height: 0.4rem;
    border-radius: 50%;
    background: var(--success);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--success) 20%, transparent);
  }
  @media (prefers-reduced-motion: no-preference) {
    :global(.demo-phone__live) {
      animation: demo-pulse 2.4s ease-in-out infinite;
    }
  }
  @keyframes demo-pulse {
    50% {
      box-shadow: 0 0 0 5px color-mix(in srgb, var(--success) 8%, transparent);
    }
  }
</style>
