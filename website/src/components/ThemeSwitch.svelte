<script lang="ts">
  import { onMount } from 'svelte';
  import type { Lang } from '../lib/site';
  import ToggleGroup from './ui/ToggleGroup.svelte';
  import ToggleGroupItem from './ui/ToggleGroupItem.svelte';
  import { playSelect } from '../lib/sound';

  interface Props {
    lang?: Lang;
  }
  let { lang = 'en' }: Props = $props();

  const names = $derived(
    lang === 'hi'
      ? { label: 'स्वरूप', system: 'तंत्रानुरूप', light: 'प्रकाश', dark: 'श्याम' }
      : { label: 'Appearance', system: 'System', light: 'Light', dark: 'Dark' }
  );

  let currentPref = $state('system');

  function choose(pref: string) {
    if (pref !== currentPref) playSelect();
    currentPref = pref;
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.dataset.themePref = pref;
      try {
        if (pref === 'system') localStorage.removeItem('theme');
        else localStorage.setItem('theme', pref);
      } catch {}
      (window as unknown as { __applyTheme?: () => void }).__applyTheme?.();
    }
  }

  onMount(() => {
    const root = document.documentElement;
    currentPref = root.dataset.themePref ?? 'system';
  });
</script>

<ToggleGroup class="theme-switch" variant="segmented" size="xs" aria-label={names.label}>
  <ToggleGroupItem
    type="single"
    on={currentPref === 'system'}
    onclick={() => choose('system')}
    data-pref="system"
    aria-label={names.system}
    title={names.system}
  >
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  </ToggleGroupItem>

  <ToggleGroupItem
    type="single"
    on={currentPref === 'light'}
    onclick={() => choose('light')}
    data-pref="light"
    aria-label={names.light}
    title={names.light}
  >
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  </ToggleGroupItem>

  <ToggleGroupItem
    type="single"
    on={currentPref === 'dark'}
    onclick={() => choose('dark')}
    data-pref="dark"
    aria-label={names.dark}
    title={names.dark}
  >
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
    </svg>
  </ToggleGroupItem>
</ToggleGroup>

<style>
  :global(.theme-switch) {
    flex-shrink: 0;
    margin-right: 0.25rem;
  }
</style>
