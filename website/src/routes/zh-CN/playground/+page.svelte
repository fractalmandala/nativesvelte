<script lang="ts">
  import Nav from '../../../components/Nav.svelte';
  import Playground from '../../../components/Playground.svelte';
  import SiteFooter from '../../../components/SiteFooter.svelte';
  import { url } from '$lib/site';

  let { data } = $props();
</script>

<svelte:head>
  <title>Playground · NativeSvelte</title>
  <meta name="description" content="在浏览器里编写 NativeSvelte 应用：代码直接在本页编译并立即运行。" />
</svelte:head>

<Nav lang="zh-CN" currentPath="/zh-CN/playground" langHref={url('playground')} hrefs={data.hrefs} />
<main id="main" data-pagefind-ignore>
  <Playground lang="zh-CN" demos={data.demos} />
</main>
<SiteFooter lang="zh-CN" hrefs={data.hrefs} />
