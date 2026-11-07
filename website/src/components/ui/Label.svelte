<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    class?: string;
    children?: Snippet;
    [key: string]: any;
  }

  let { class: className, children, ...rest }: Props = $props();
</script>

<label data-slot="label" class={className} {...rest}>
  {@render children?.()}
</label>
