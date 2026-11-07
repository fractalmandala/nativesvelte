<script lang="ts">
  import Nav from '../components/Nav.svelte';
  import Home from '../components/Home.svelte';
  import SiteFooter from '../components/SiteFooter.svelte';
  import { homeAlternates, homeLanguages } from '$lib/home';
  import { url } from '$lib/site';

  let { data } = $props();
</script>

<svelte:head>
  <title>NativeSvelte — Build once with Svelte, native everywhere</title>
  <meta
    name="description"
    content="NativeSvelte is a Svelte-first native UI framework built on Rust: build apps for iOS, Android, macOS, Windows, Linux and the web with Svelte 5 runes and SvelteKit, rendered directly through native platform views."
  />
  <link rel="icon" type="image/svg+xml" href={url('favicon.svg')} />
  <link rel="apple-touch-icon" href={url('apple-touch-icon.png')} />
  <link rel="canonical" href={url('')} />
</svelte:head>

<Nav
  lang="en"
  currentPath="/"
  langHref={url('zh-CN')}
  languages={homeLanguages()}
  hrefs={data.hrefs}
/>
<Home lang="en" />
<SiteFooter lang="en" hrefs={data.hrefs} />
