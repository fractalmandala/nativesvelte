<script lang="ts">
  import Nav from '../../../components/Nav.svelte';
  import Apps from '../../../components/Apps.svelte';
  import SiteFooter from '../../../components/SiteFooter.svelte';
  import { url } from '$lib/site';

  let { data } = $props();
</script>

<svelte:head>
  <title>应用案例 · NativeSvelte</title>
  <meta name="description" content="使用 Native Shell 构建的跨平台应用：在 iOS、Android、macOS、Windows、Linux 和 Web 上的原生体验。" />
</svelte:head>

<Nav lang="zh-CN" currentPath="/zh-CN/apps" langHref={url('apps')} hrefs={data.hrefs} />
<main id="main">
  <Apps apps={data.apps} lang="zh-CN" />
</main>
<SiteFooter lang="zh-CN" hrefs={data.hrefs} />
