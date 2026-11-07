<script lang="ts">
  import Nav from '../../../components/Nav.svelte';
  import Brand from '../../../components/Brand.svelte';
  import SiteFooter from '../../../components/SiteFooter.svelte';
  import { url } from '$lib/site';

  let { data } = $props();
</script>

<svelte:head>
  <title>品牌素材 · NativeSvelte</title>
</svelte:head>

<Nav lang="zh-CN" currentPath="/zh-CN/brand" langHref={url('brand')} hrefs={data.hrefs} />
<main id="main">
  <Brand lang="zh-CN" />
</main>
<SiteFooter lang="zh-CN" hrefs={data.hrefs} />
