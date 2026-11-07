<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'default' | 'outline';
    size?: 'default' | 'sm' | 'xs' | 'lg';
    pressed?: boolean;
    class?: string;
    children?: Snippet;
    [key: string]: any;
  }

  let {
    variant = 'default',
    size = 'default',
    pressed = false,
    class: className,
    children,
    ...rest
  }: Props = $props();
</script>

<button
  type="button"
  data-slot="toggle"
  data-variant={variant}
  data-size={size}
  aria-pressed={String(pressed)}
  class={className}
  {...rest}
>
  {@render children?.()}
</button>
