<script lang="ts">
  import Nav from '../../../components/Nav.svelte';
  import Playground from '../../../components/Playground.svelte';
  import SiteFooter from '../../../components/SiteFooter.svelte';
  import { url } from '$lib/site';

  let { data } = $props();
</script>

<svelte:head>
  <title>Playground · NativeSvelte</title>
  <meta name="description" content="ब्राउज़र में NativeSvelte अनुप्रयोग लिखें: संहिता सीधे इस पृष्ठ पर संकलित होकर तुरंत संचालित होती है।" />
</svelte:head>

<Nav lang="hi" currentPath="/hi/playground" langHref={url('playground')} hrefs={data.hrefs} />
<main id="main" data-pagefind-ignore>
  <Playground lang="hi" demos={data.demos} />
</main>
<SiteFooter lang="hi" hrefs={data.hrefs} />
