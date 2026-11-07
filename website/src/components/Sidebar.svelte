<script lang="ts">
  import { onMount } from 'svelte';
  import { label } from '../lib/locales';
  import { GROUPS, type Page } from '../lib/sections';
  import type { Lang } from '../lib/site';

  interface Props {
    title: string;
    pages: Page[];
    current: string;
    lang?: Lang;
    locale?: string;
  }

  let { title, pages, current, lang = 'en', locale = lang }: Props = $props();
  const isHi = $derived(lang === 'hi');
  const currentPage = $derived(pages.find((page) => page.route === current));

  const groupLabel = (index: number) => {
    const group = pages[index].group;
    if (!group || group === pages[index - 1]?.group) return undefined;
    return GROUPS[group] && label(GROUPS[group], locale);
  };

  let isMobileOpen = $state(false);
  let sidebarEl = $state<HTMLElement | null>(null);

  onMount(() => {
    if (!sidebarEl) return;
    const active = sidebarEl.querySelector('.sidebar-item.active') as HTMLElement | null;
    if (active && window.matchMedia('(min-width: 960px)').matches) {
      const box = sidebarEl.getBoundingClientRect();
      const item = active.getBoundingClientRect();
      if (item.bottom > box.bottom || item.top < box.top) {
        sidebarEl.scrollTop = active.offsetTop - sidebarEl.clientHeight / 2;
      }
    }
  });
</script>

<aside
  bind:this={sidebarEl}
  class="docs-sidebar"
  class:data-mobile-open={isMobileOpen}
  data-mobile-open={String(isMobileOpen)}
  data-nav-ready=""
  aria-label={isHi ? 'प्रलेखन अनुक्रमणिका' : 'Documentation'}
>
  <button
    class="docs-sidebar__toggle"
    type="button"
    aria-controls="docs-sidebar-nav"
    aria-expanded={String(isMobileOpen)}
    onclick={() => (isMobileOpen = !isMobileOpen)}
  >
    <span class="docs-sidebar__toggle-label">
      <span class="docs-sidebar__toggle-section">{title}</span>
      {#if currentPage}
        <span class="docs-sidebar__toggle-page">{currentPage.title}</span>
      {/if}
    </span>
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  </button>
  <nav id="docs-sidebar-nav">
    <p class="sidebar-group__title">{title}</p>
    <ul class="sidebar-group__items">
      {#each pages as page, index}
        {#if groupLabel(index)}
          <li class="sidebar-subgroup" role="presentation">{groupLabel(index)}</li>
        {/if}
        <li>
          <a
            href={page.href}
            class="sidebar-item"
            class:active={page.route === current}
            aria-current={page.route === current ? 'page' : undefined}
          >
            {page.title}
          </a>
        </li>
      {/each}
    </ul>
  </nav>
</aside>
