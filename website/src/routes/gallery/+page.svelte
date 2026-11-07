<script lang="ts">
  import Nav from '../../components/Nav.svelte';
  import Gallery from '../../components/Gallery.svelte';
  import SiteFooter from '../../components/SiteFooter.svelte';
  import { url } from '$lib/site';

  let { data } = $props();
</script>

<svelte:head>
  <title>Gallery · NativeSvelte</title>
</svelte:head>

<Nav lang="en" currentPath="/gallery" langHref={url('zh-CN/gallery')} hrefs={data.hrefs} />
<main id="main" data-pagefind-ignore>
  <Gallery lang="en" built={data.built} />
</main>
<SiteFooter lang="en" hrefs={data.hrefs} />
