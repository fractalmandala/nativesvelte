<script lang="ts">
  import '@pagefind/default-ui/css/ui.css';
  import { onMount } from 'svelte';
  import type { Lang } from '../lib/site';

  interface Props {
    lang?: Lang;
  }
  let { lang = 'en' }: Props = $props();
  const isHi = $derived(lang === 'hi');

  const copy = $derived(
    isHi
      ? {
          label: 'खोजें',
          title: 'प्रलेखन खोजें',
          emptyTitle: 'प्रलेखन खोजें',
          emptyBody: 'मार्गदर्शिका, घटक एवं एपीआई (API) संदर्भ खोजें।',
          navigate: 'संचलन',
          enter: 'खोलें',
          esc: 'बंद करें',
        }
      : {
          label: 'Search',
          title: 'Search documentation',
          emptyTitle: 'Search documentation',
          emptyBody: 'Find guides, elements and API references.',
          navigate: 'Navigate',
          enter: 'Open',
          esc: 'Close',
        }
  );

  let modalEl = $state<HTMLDialogElement | null>(null);
  let emptyEl = $state<HTMLElement | null>(null);
  let pagefindUI: any = null;

  function withoutTrailingSlash(url: string) {
    const [path, hash] = url.split('#');
    const trimmed = path.length > 1 ? path.replace(/\/+$/, '') : path;
    return hash === undefined ? trimmed : `${trimmed}#${hash}`;
  }

  function syncEmptyState() {
    const input = modalEl?.querySelector<HTMLInputElement>('.pagefind-ui__search-input');
    if (emptyEl) {
      emptyEl.hidden = (input?.value.trim() ?? '') !== '';
    }
  }

  async function openModal() {
    if (!modalEl) return;
    if (!pagefindUI) {
      try {
        const { PagefindUI } = await import('@pagefind/default-ui');
        pagefindUI = new PagefindUI({
          element: '#search-ui',
          showImages: false,
          resetStyles: false,
          showSubResults: true,
          processResult: (result: any) => {
            result.url = withoutTrailingSlash(result.url);
            for (const sub of result.sub_results ?? []) sub.url = withoutTrailingSlash(sub.url);
            return result;
          },
        });
      } catch (e) {
        console.warn('Pagefind UI load error:', e);
      }
    }
    if (!modalEl.open) modalEl.showModal();
    requestAnimationFrame(() => {
      const input = modalEl?.querySelector<HTMLInputElement>('.pagefind-ui__search-input');
      input?.focus();
      syncEmptyState();
    });
  }

  function handleModalClick(event: MouseEvent) {
    if (!modalEl) return;
    const box = modalEl.getBoundingClientRect();
    const outside =
      event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
    if (outside) modalEl.close();
  }

  function handleModalKeyDown(event: KeyboardEvent) {
    if (!modalEl) return;
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const links = [...modalEl.querySelectorAll<HTMLAnchorElement>('.pagefind-ui__result-link')].filter(
      (link) => link.getClientRects().length > 0
    );
    if (links.length === 0) return;
    event.preventDefault();
    const at = links.indexOf(document.activeElement as HTMLAnchorElement);
    const next = event.key === 'ArrowDown' ? (at < links.length - 1 ? at + 1 : 0) : at > 0 ? at - 1 : links.length - 1;
    links[next]?.focus();
  }

  onMount(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== '/' || modalEl?.open) return;
      const target = event.target as HTMLElement | null;
      if (target && (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable)) return;
      event.preventDefault();
      openModal();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });
</script>

<div class="docsearch">
  <button type="button" id="search-open" class="site-nav__search-btn" aria-keyshortcuts="/" onclick={openModal}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
    </svg>
    <span class="site-nav__search-hint">{copy.label}</span>
    <kbd data-slot="kbd" class="site-nav__search-key" aria-hidden="true">/</kbd>
  </button>

  <dialog
    bind:this={modalEl}
    id="search-modal"
    aria-labelledby="search-modal-title"
    onclick={handleModalClick}
    onkeydown={handleModalKeyDown}
    oninput={syncEmptyState}
  >
    <h2 id="search-modal-title" class="sr-only">{copy.title}</h2>
    <div id="search-ui"></div>
    <div bind:this={emptyEl} id="search-empty" class="search-blank" hidden>
      <p class="search-blank__title">{copy.emptyTitle}</p>
      <p class="search-blank__body">{copy.emptyBody}</p>
    </div>
    <p class="search-footer" aria-hidden="true">
      <span><kbd data-slot="kbd">↑</kbd><kbd data-slot="kbd">↓</kbd> {copy.navigate}</span>
      <span><kbd data-slot="kbd">↵</kbd> {copy.enter}</span>
      <span><kbd data-slot="kbd">Esc</kbd> {copy.esc}</span>
    </p>
  </dialog>
</div>
