<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAnchorAttributes, HTMLAttributes } from 'svelte/elements';

  interface Props {
    variant?: 'default' | 'secondary' | 'outline' | 'destructive';
    href?: string;
    class?: string;
    children?: Snippet;
    [key: string]: any;
  }

  let { variant = 'default', href, class: className, children, ...rest }: Props = $props();
</script>

{#if href}
  <a data-slot="badge" data-variant={variant} {href} class={className} {...rest}>
    {@render children?.()}
  </a>
{:else}
  <span data-slot="badge" data-variant={variant} class={className} {...rest}>
    {@render children?.()}
  </span>
{/if}
