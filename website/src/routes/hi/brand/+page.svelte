<script lang="ts">
  import Nav from '../../../components/Nav.svelte';
  import Brand from '../../../components/Brand.svelte';
  import SiteFooter from '../../../components/SiteFooter.svelte';
  import { url } from '$lib/site';

  let { data } = $props();
</script>

<svelte:head>
  <title>ब्रांड एवं संपदा · NativeSvelte</title>
</svelte:head>

<Nav lang="hi" currentPath="/hi/brand" langHref={url('brand')} hrefs={data.hrefs} />
<main id="main">
  <Brand lang="hi" />
</main>
<SiteFooter lang="hi" hrefs={data.hrefs} />
