<script lang="ts">
  import DocsLayout from '$layouts/DocsLayout.svelte';

  let { data } = $props();
</script>

<DocsLayout
  page={data.page}
  headings={data.headings}
  html={data.html}
  allPages={data.allPages}
  hrefs={data.hrefs}
  currentPath={data.page.route}
/>
