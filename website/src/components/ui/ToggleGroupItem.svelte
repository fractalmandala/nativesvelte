<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    type?: 'single' | 'multiple';
    on?: boolean;
    count?: number | string;
    class?: string;
    children?: Snippet;
    [key: string]: any;
  }

  let {
    type = 'single',
    on = false,
    count,
    class: className,
    children,
    ...rest
  }: Props = $props();
</script>

{#if type === 'single'}
  <button
    type="button"
    data-slot="toggle-group-item"
    role="radio"
    aria-checked={String(on)}
    tabindex={on ? 0 : -1}
    class={className}
    {...rest}
  >
    {@render children?.()}
    {#if count !== undefined}
      <span data-slot="toggle-count">{count}</span>
    {/if}
  </button>
{:else}
  <button
    type="button"
    data-slot="toggle-group-item"
    aria-pressed={String(on)}
    class={className}
    {...rest}
  >
    {@render children?.()}
    {#if count !== undefined}
      <span data-slot="toggle-count">{count}</span>
    {/if}
  </button>
{/if}
