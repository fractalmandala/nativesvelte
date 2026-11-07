<script lang="ts">
  import Nav from '../../components/Nav.svelte';
  import Apps from '../../components/Apps.svelte';
  import SiteFooter from '../../components/SiteFooter.svelte';
  import { url } from '$lib/site';

  let { data } = $props();
</script>

<svelte:head>
  <title>App Stories · NativeSvelte</title>
  <meta name="description" content="Apps built with Native Shell: native UI on iOS, Android, macOS, Windows, Linux and the web, from file sharing and system monitoring to reading Markdown." />
</svelte:head>

<Nav lang="en" currentPath="/apps" langHref={url('hi/apps')} hrefs={data.hrefs} />
<main id="main">
  <Apps apps={data.apps} lang="en" />
</main>
<SiteFooter lang="en" hrefs={data.hrefs} />
