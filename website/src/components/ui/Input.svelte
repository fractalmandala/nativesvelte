<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    size?: 'default' | 'sm';
    class?: string;
    icon?: Snippet;
    [key: string]: any;
  }

  let { size = 'default', class: className, icon, ...rest }: Props = $props();
</script>

{#if icon}
  <div data-slot="input-group">
    <span data-slot="input-group-addon" aria-hidden="true">
      {@render icon()}
    </span>
    <input data-slot="input" data-size={size} class={className} {...rest} />
  </div>
{:else}
  <input data-slot="input" data-size={size} class={className} {...rest} />
{/if}
