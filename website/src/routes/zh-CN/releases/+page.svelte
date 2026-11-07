<script lang="ts">
  import Nav from '../../../components/Nav.svelte';
  import Releases from '../../../components/Releases.svelte';
  import SiteFooter from '../../../components/SiteFooter.svelte';
  import { url } from '$lib/site';

  let { data } = $props();
</script>

<svelte:head>
  <title>版本发布 · NativeSvelte</title>
</svelte:head>

<Nav lang="zh-CN" currentPath="/zh-CN/releases" langHref={url('releases')} hrefs={data.hrefs} />
<Releases lang="zh-CN" releases={data.releases} />
<SiteFooter lang="zh-CN" hrefs={data.hrefs} />
