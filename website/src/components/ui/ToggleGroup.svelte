<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    type?: 'single' | 'multiple';
    variant?: 'default' | 'outline' | 'segmented';
    size?: 'default' | 'sm' | 'xs' | 'lg';
    spacing?: number;
    style?: string;
    class?: string;
    children?: Snippet;
    [key: string]: any;
  }

  let {
    type = 'single',
    variant = 'default',
    size = 'default',
    spacing = 0,
    style = '',
    class: className,
    children,
    ...rest
  }: Props = $props();

  let gap = $derived(variant === 'segmented' ? undefined : `--gap: calc(var(--spacing) * ${spacing})`);
  let fullStyle = $derived([gap, style].filter(Boolean).join(';') || undefined);
</script>

<div
  data-slot="toggle-group"
  data-variant={variant}
  data-size={size}
  data-spacing={variant === 'segmented' ? undefined : spacing}
  role={type === 'single' ? 'radiogroup' : 'group'}
  style={fullStyle}
  class={className}
  {...rest}
>
  {@render children?.()}
</div>
