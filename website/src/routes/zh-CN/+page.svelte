<script lang="ts">
  import Nav from '../../components/Nav.svelte';
  import Home from '../../components/Home.svelte';
  import SiteFooter from '../../components/SiteFooter.svelte';
  import { homeAlternates, homeLanguages } from '$lib/home';
  import { url } from '$lib/site';

  let { data } = $props();
</script>

<svelte:head>
  <title>NativeSvelte — 一次构建，全平台 Native</title>
  <meta
    name="description"
    content="NativeSvelte 是基于 Rust 构建的 Svelte 优先 Native UI 框架：使用 Svelte 5 runes 与 SvelteKit 构建 iOS、Android、macOS、Windows、Linux 及 Web 应用，直接渲染平台原生视图。"
  />
  <link rel="icon" type="image/svg+xml" href={url('favicon.svg')} />
  <link rel="apple-touch-icon" href={url('apple-touch-icon.png')} />
  <link rel="canonical" href={url('zh-CN')} />
</svelte:head>

<Nav
  lang="zh-CN"
  currentPath="/zh-CN"
  langHref={url('')}
  languages={homeLanguages()}
  hrefs={data.hrefs}
/>
<Home lang="zh-CN" />
<SiteFooter lang="zh-CN" hrefs={data.hrefs} />
