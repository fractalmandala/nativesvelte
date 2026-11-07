<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    size?: 'default' | 'sm' | 'xs';
    class?: string;
    children?: Snippet;
    [key: string]: any;
  }

  let { size = 'default', class: className, children, ...rest }: Props = $props();
</script>

<div data-slot="tabs-list" data-size={size} role="tablist" class={className} {...rest}>
  {@render children?.()}
</div>
