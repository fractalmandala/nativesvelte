<script lang="ts">
  import { onMount } from 'svelte';
  import { initSelects } from '../../lib/ui/select';

  export interface SelectOption {
    value: string;
    label: string;
  }

  interface Props {
    id: string;
    options: SelectOption[];
    value?: string;
    label?: string;
    labelledby?: string;
    size?: 'default' | 'sm';
    triggerClass?: string;
    class?: string;
    [key: string]: any;
  }

  let {
    id,
    options,
    value,
    label,
    labelledby,
    size = 'default',
    triggerClass,
    class: className,
    ...rest
  }: Props = $props();

  let currentValue = $derived(value ?? options[0]?.value);
  let current = $derived(options.find((option) => option.value === currentValue) ?? options[0]);

  onMount(() => {
    initSelects();
  });
</script>

<div data-slot="select" data-value={current?.value} class={className} {...rest}>
  <button
    type="button"
    data-slot="select-trigger"
    data-size={size}
    class={triggerClass}
    id="{id}-trigger"
    role="combobox"
    aria-haspopup="listbox"
    aria-expanded="false"
    aria-controls="{id}-content"
    aria-label={label}
    aria-labelledby={labelledby ? `${labelledby} ${id}-value` : undefined}
  >
    <span data-slot="select-value" id="{id}-value">{current?.label}</span>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  </button>
  <div data-slot="select-content" id="{id}-content" role="listbox" tabindex="-1" aria-label={label} aria-labelledby={labelledby} hidden>
    {#each options as option, i}
      <div
        data-slot="select-item"
        role="option"
        id="{id}-option-{i}"
        data-value={option.value}
        aria-selected={String(option.value === current?.value)}
      >
        <span data-slot="select-item-indicator">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <span data-slot="select-item-text">{option.label}</span>
      </div>
    {/each}
  </div>
</div>
