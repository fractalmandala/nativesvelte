<script lang="ts">
  import { onMount } from 'svelte';
  import Nav from '../components/Nav.svelte';
  import SiteFooter from '../components/SiteFooter.svelte';
  import Button from '../components/ui/Button.svelte';
  import { url } from '$lib/site';

  let isZh = $state(false);

  onMount(() => {
    if (typeof location !== 'undefined' && /^\/(?:[^/]+\/)*zh-CN(?:\/|$)/.test(location.pathname)) {
      isZh = true;
      document.documentElement.lang = 'zh-CN';
    }
  });
</script>

<svelte:head>
  <title>Page not found · NativeSvelte</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<Nav lang={isZh ? 'zh-CN' : 'en'} currentPath="/404" langHref={url(isZh ? '' : 'zh-CN')} />

<main class="not-found" id="main">
  <p class="not-found__code">404</p>
  <h1>{isZh ? '页面不存在。' : 'This page does not exist.'}</h1>
  {#if !isZh}
    <p class="not-found__zh" lang="zh-CN">页面不存在。</p>
  {/if}
  <div class="not-found__actions">
    <Button size="lg" href={url(isZh ? 'zh-CN' : '')}>{isZh ? '返回首页' : 'Go home'}</Button>
    <Button size="lg" variant="secondary" href={url(isZh ? 'zh-CN/docs' : 'docs')}>{isZh ? '阅读指南' : 'Read the guide'}</Button>
  </div>
</main>

<SiteFooter lang={isZh ? 'zh-CN' : 'en'} />

<style>
  .not-found {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    min-height: calc(100vh - var(--nav-height) - 12rem);
    padding: 4rem 1rem;
    text-align: center;
  }
  .not-found__code {
    margin: 0;
    color: var(--muted-foreground);
    font: 600 0.75rem/1 var(--font-mono);
    letter-spacing: 0.14em;
  }
  h1 {
    margin: 0;
    font-size: clamp(1.8rem, 4vw, 2.6rem);
    font-weight: 680;
    letter-spacing: -0.04em;
  }
  .not-found__zh {
    margin: 0;
    color: var(--muted-foreground);
  }
  .not-found__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.6rem;
    margin-top: 1rem;
  }
</style>
