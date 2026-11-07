<script lang="ts">
  import '@fontsource-variable/figtree/wght.css';
  import '../styles/global.css';
  import 'virtual:nsh-gallery-ui.css';
  import type { Snippet } from 'svelte';

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();
</script>

<a class="skip-link" href="#main">Skip to content</a>
{@render children?.()}
