<script lang="ts">
  import Nav from '../../../components/Nav.svelte';
  import Gallery from '../../../components/Gallery.svelte';
  import SiteFooter from '../../../components/SiteFooter.svelte';
  import { url } from '$lib/site';

  let { data } = $props();
</script>

<svelte:head>
  <title>Gallery · NativeSvelte</title>
</svelte:head>

<Nav lang="hi" currentPath="/hi/gallery" langHref={url('gallery')} hrefs={data.hrefs} />
<main id="main" data-pagefind-ignore>
  <Gallery lang="hi" built={data.built} />
</main>
<SiteFooter lang="hi" hrefs={data.hrefs} />
