<script lang="ts">
  import Nav from '../../components/Nav.svelte';
  import Brand from '../../components/Brand.svelte';
  import SiteFooter from '../../components/SiteFooter.svelte';
  import { url } from '$lib/site';

  let { data } = $props();
</script>

<svelte:head>
  <title>Brand · NativeSvelte</title>
</svelte:head>

<Nav lang="en" currentPath="/brand" langHref={url('hi/brand')} hrefs={data.hrefs} />
<main id="main">
  <Brand lang="en" />
</main>
<SiteFooter lang="en" hrefs={data.hrefs} />
