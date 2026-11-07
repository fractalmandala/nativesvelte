<script lang="ts">
  import type { Snippet } from 'svelte';

  export type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  export type ButtonSize = 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-xs' | 'icon-lg';

  interface Props {
    variant?: ButtonVariant;
    size?: ButtonSize;
    href?: string;
    type?: 'button' | 'submit' | 'reset';
    class?: string;
    children?: Snippet;
    [key: string]: any;
  }

  let {
    variant = 'default',
    size = 'default',
    href,
    type = 'button',
    class: className,
    children,
    ...rest
  }: Props = $props();
</script>

{#if href}
  <a data-slot="button" data-variant={variant} data-size={size} {href} class={className} {...rest}>
    {@render children?.()}
  </a>
{:else}
  <button data-slot="button" data-variant={variant} data-size={size} {type} class={className} {...rest}>
    {@render children?.()}
  </button>
{/if}
