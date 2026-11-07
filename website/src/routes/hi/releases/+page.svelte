<script lang="ts">
  import Nav from '../../../components/Nav.svelte';
  import Releases from '../../../components/Releases.svelte';
  import SiteFooter from '../../../components/SiteFooter.svelte';
  import { url } from '$lib/site';

  let { data } = $props();
</script>

<svelte:head>
  <title>नवीन विमोचन · NativeSvelte</title>
</svelte:head>

<Nav lang="hi" currentPath="/hi/releases" langHref={url('releases')} hrefs={data.hrefs} />
<Releases lang="hi" releases={data.releases} />
<SiteFooter lang="hi" hrefs={data.hrefs} />
