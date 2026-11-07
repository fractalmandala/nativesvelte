<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    selected?: boolean;
    class?: string;
    children?: Snippet;
    [key: string]: any;
  }

  let { selected = false, class: className, children, ...rest }: Props = $props();
</script>

<button
  type="button"
  data-slot="tabs-trigger"
  role="tab"
  aria-selected={String(selected)}
  tabindex={selected ? 0 : -1}
  class={className}
  {...rest}
>
  {@render children?.()}
</button>
