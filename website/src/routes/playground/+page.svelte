<script lang="ts">
  import Nav from '../../components/Nav.svelte';
  import Playground from '../../components/Playground.svelte';
  import SiteFooter from '../../components/SiteFooter.svelte';
  import { url } from '$lib/site';

  let { data } = $props();
</script>

<svelte:head>
  <title>Playground · NativeSvelte</title>
  <meta name="description" content="Write a NativeSvelte app in the browser: the page compiles it and runs it right away." />
</svelte:head>

<Nav lang="en" currentPath="/playground" langHref={url('zh-CN/playground')} hrefs={data.hrefs} />
<main id="main" data-pagefind-ignore>
  <Playground lang="en" demos={data.demos} />
</main>
<SiteFooter lang="en" hrefs={data.hrefs} />
