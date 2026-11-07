<script lang="ts">
  import { onMount } from 'svelte';
  import type { Lang } from '../lib/site';

  export interface Heading {
    depth: number;
    slug: string;
    text: string;
  }

  interface Props {
    headings?: Heading[];
    lang?: Lang;
    title?: string;
  }

  let { headings = [], lang = 'en', title }: Props = $props();
  const items = $derived(headings.filter((h) => h.depth === 2 || h.depth === 3));
  const label = $derived(title ?? (lang === 'hi' ? 'इस पृष्ठ पर' : 'On this page'));

  onMount(() => {
    const links = new Map<string, HTMLAnchorElement>();
    document.querySelectorAll<HTMLAnchorElement>('.toc a[href^="#"]').forEach((a) => {
      links.set(decodeURIComponent(a.hash.slice(1)), a);
    });

    if (links.size > 0) {
      const targets = [...links.keys()]
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null);

      let current: HTMLAnchorElement | null = null;
      const setCurrent = (id: string | undefined) => {
        const next = id ? links.get(id) ?? null : null;
        if (next === current) return;
        current?.classList.remove('is-current');
        next?.classList.add('is-current');
        current = next;
      };

      const seen = new Set<string>();
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) seen.add(entry.target.id);
            else seen.delete(entry.target.id);
          }
          const first = targets.find((el) => seen.has(el.id));
          if (first) return setCurrent(first.id);
          let passed: string | undefined;
          for (const el of targets) {
            if (el.getBoundingClientRect().top <= 88) passed = el.id;
          }
          if (passed) setCurrent(passed);
        },
        { rootMargin: '-88px 0px -55% 0px', threshold: 0 }
      );
      targets.forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    }
  });
</script>

<nav class="toc" aria-label={label}>
  {#if items.length > 1}
    <p class="toc__label">{label}</p>
    <ul>
      {#each items as h}
        <li class="toc__item" class:toc__item--sub={h.depth === 3}>
          <a href="#{h.slug}">{h.text}</a>
        </li>
      {/each}
    </ul>
  {/if}
</nav>
