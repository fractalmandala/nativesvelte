<script lang="ts">
  import type { Snippet } from 'svelte';
  import Nav from '../components/Nav.svelte';
  import Sidebar from '../components/Sidebar.svelte';
  import Toc, { type Heading } from '../components/Toc.svelte';
  import SiteFooter from '../components/SiteFooter.svelte';
  import { BASE, EDIT_BASE, type Lang } from '../lib/site';
  import { chromeLang, direction, isMachine, label, machineLocales, ui } from '../lib/locales';
  import { SECTIONS, type Page } from '../lib/sections';

  interface Props {
    page: Page;
    headings?: Heading[];
    html?: string;
    allPages?: Page[];
    hrefs?: Record<string, string>;
    currentPath?: string;
    children?: Snippet;
  }

  let {
    page,
    headings = [],
    html = '',
    allPages = [],
    hrefs = {},
    currentPath = page.route,
    children,
  }: Props = $props();

  const locale = $derived(page.lang);
  const machine = $derived(isMachine(locale));
  const lang: Lang = $derived(chromeLang(locale));
  const isZh = $derived(lang === 'zh-CN');
  const section = $derived(SECTIONS.find((s) => s.id === page.section)!);

  const sidebar = $derived(allPages.filter((p) => p.section === page.section));
  const at = $derived(allPages.findIndex((p) => p.route === page.route));
  const prev = $derived(at > 0 ? allPages[at - 1] : undefined);
  const next = $derived(at >= 0 && at < allPages.length - 1 ? allPages[at + 1] : undefined);

  const english = $derived(allPages.find((p) => p.section === page.section && p.slug === page.slug && p.lang === 'en') ?? page);
  const otherLang: Lang = $derived(isZh ? 'en' : 'zh-CN');
  const counterpart = $derived(allPages.find((p) => p.section === page.section && p.slug === page.slug && p.lang === otherLang));
  const otherSection = $derived(allPages.find((p) => p.section === page.section && p.lang === otherLang));
  const langHref = $derived(counterpart?.href ?? otherSection?.href);

  const editUrl = $derived(`${EDIT_BASE}website/${machine ? english?.sourcePath : page.sourcePath}`);
  const t = $derived(
    isZh
      ? { prev: '上一页', next: '下一页', edit: '在 GitHub 上编辑此页', markdown: 'Markdown 原文', pager: '翻页' }
      : { prev: 'Previous', next: 'Next', edit: 'Edit this page on GitHub', markdown: 'View as Markdown', pager: 'Pagination' }
  );
  const prevLabel = $derived(machine ? ui(locale, 'prev') : t.prev);
  const nextLabel = $derived(machine ? ui(locale, 'next') : t.next);
  const sectionOf = (p: Page) => label(SECTIONS.find((s) => s.id === p.section)!.label, locale);
</script>

<svelte:head>
  <title>{page.title} · NativeSvelte</title>
  <meta name="description" content={page.description} />
</svelte:head>

<Nav
  {lang}
  {locale}
  {currentPath}
  {langHref}
  {hrefs}
/>

<div class="docs-layout">
  <Sidebar
    title={label(section.label, locale)}
    pages={sidebar}
    current={page.route}
    {lang}
    {locale}
  />

  <main class="docs-main" id="main">
    {#if machine}
      <p class="doc-machine-notice" data-pagefind-ignore>
        {ui(locale, page.translated ? 'notice' : 'fallback')}{' '}
        <a href={english?.href} hreflang="en">{ui(locale, 'original')}</a>
      </p>
    {/if}

    <article class="doc-content" data-pagefind-body>
      <header class="doc-header">
        <p class="doc-header__kicker" data-pagefind-ignore>{label(section.label, locale)}</p>
        <h1 data-pagefind-meta="title">{page.title}</h1>
      </header>
      <div class="doc-body">
        {#if html}
          {@html html}
        {:else}
          {@render children?.()}
        {/if}
      </div>
    </article>

    <div class="doc-meta">
      <a href={editUrl} target="_blank" rel="noopener noreferrer">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 20h9" /><path d="M16.38 3.62a2.12 2.12 0 1 1 3 3L7.37 18.64a2 2 0 0 1-.86.5l-2.87.84.84-2.87a2 2 0 0 1 .5-.86z" />
        </svg>
        {t.edit}
      </a>
      <a href="{page.href}.md">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
        </svg>
        {t.markdown}
      </a>
    </div>

    {#if prev || next}
      <nav class="doc-pager" aria-label={t.pager}>
        {#if prev}
          <a class="doc-pager__link" href={prev.href} rel="prev">
            <span class="doc-pager__label">
              <span class="doc-pager__arrow" aria-hidden="true">←</span> {prevLabel}{prev.section !== page.section ? ` · ${sectionOf(prev)}` : ''}
            </span>
            <span class="doc-pager__title">{prev.title}</span>
          </a>
        {:else}
          <span></span>
        {/if}
        {#if next}
          <a class="doc-pager__link doc-pager__link--next" href={next.href} rel="next">
            <span class="doc-pager__label">
              {next.section !== page.section ? `${sectionOf(next)} · ` : ''}{nextLabel} <span class="doc-pager__arrow" aria-hidden="true">→</span>
            </span>
            <span class="doc-pager__title">{next.title}</span>
          </a>
        {/if}
      </nav>
    {/if}
  </main>

  <Toc {headings} {lang} />
</div>

<SiteFooter {lang} {hrefs} />
