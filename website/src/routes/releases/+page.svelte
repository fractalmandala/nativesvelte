<script lang="ts">
  import Nav from '../../components/Nav.svelte';
  import Releases from '../../components/Releases.svelte';
  import SiteFooter from '../../components/SiteFooter.svelte';
  import { url } from '$lib/site';

  let { data } = $props();
</script>

<svelte:head>
  <title>Releases · NativeSvelte</title>
</svelte:head>

<Nav lang="en" currentPath="/releases" langHref={url('zh-CN/releases')} hrefs={data.hrefs} />
<Releases lang="en" releases={data.releases} />
<SiteFooter lang="en" hrefs={data.hrefs} />
