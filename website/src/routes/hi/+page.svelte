<script lang="ts">
  import Nav from '../../components/Nav.svelte';
  import Home from '../../components/Home.svelte';
  import SiteFooter from '../../components/SiteFooter.svelte';
  import { homeAlternates, homeLanguages } from '$lib/home';
  import { url } from '$lib/site';

  let { data } = $props();
</script>

<svelte:head>
  <title>NativeSvelte — एक बार निर्माण करें, सर्वत्र मूलरूप</title>
  <meta
    name="description"
    content="NativeSvelte Rust पर निर्मित एक Svelte-प्रथम मूलरूप UI ढांचा है: Svelte 5 runes एवं SvelteKit के उपयोग से iOS, Android, macOS, Windows, Linux तथा Web हेतु मूल अनुप्रयोगों का निर्माण करें, जो सीधे मंच के मूल दृश्यों द्वारा प्रस्तुत होते हैं।"
  />
  <link rel="icon" type="image/svg+xml" href={url('favicon.svg')} />
  <link rel="apple-touch-icon" href={url('apple-touch-icon.png')} />
  <link rel="canonical" href={url('hi')} />
</svelte:head>

<Nav
  lang="hi"
  currentPath="/hi"
  langHref={url('')}
  languages={homeLanguages()}
  hrefs={data.hrefs}
/>
<Home lang="hi" />
<SiteFooter lang="hi" hrefs={data.hrefs} />
