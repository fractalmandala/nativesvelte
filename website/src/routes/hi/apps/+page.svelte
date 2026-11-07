<script lang="ts">
  import Nav from '../../../components/Nav.svelte';
  import Apps from '../../../components/Apps.svelte';
  import SiteFooter from '../../../components/SiteFooter.svelte';
  import { url } from '$lib/site';

  let { data } = $props();
</script>

<svelte:head>
  <title>अनुप्रयोग प्रदर्शन · NativeSvelte</title>
  <meta name="description" content="NativeSvelte द्वारा निर्मित अंतर-मंचीय अनुप्रयोग: iOS, Android, macOS, Windows, Linux एवं Web पर मूलरूप अनुभव।" />
</svelte:head>

<Nav lang="hi" currentPath="/hi/apps" langHref={url('apps')} hrefs={data.hrefs} />
<main id="main">
  <Apps apps={data.apps} lang="hi" />
</main>
<SiteFooter lang="hi" hrefs={data.hrefs} />
