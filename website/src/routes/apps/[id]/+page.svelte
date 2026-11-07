<script lang="ts">
  import ShowcaseDetail from '../../../components/ShowcaseDetail.svelte';
  import { page } from '$app/state';

  let { data } = $props();
</script>

<ShowcaseDetail app={data.app} lang={data.lang} html={data.html} currentPath={page.url.pathname} />
