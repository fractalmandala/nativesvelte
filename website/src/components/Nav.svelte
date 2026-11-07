<script lang="ts">
  import { onMount } from 'svelte';
  import DocSearch from './DocSearch.svelte';
  import Logo from './Logo.svelte';
  import ThemeSwitch from './ThemeSwitch.svelte';
  import Button from './ui/Button.svelte';
  import { BASE, GPUI_KIT_URL, REPO_URL, url, type Lang } from '../lib/site';
  import { label, machineLocales } from '../lib/locales';
  import { SECTIONS, sectionHrefs } from '../lib/sections';
  import { currentVersion, isLatestVersion, latestVersion, siteVersions, versionHref, versionPath } from '../lib/versions';

  interface Props {
    lang?: Lang;
    currentPath?: string;
    langHref?: string;
    locale?: string;
    languages?: { code: string; name: string; href?: string }[];
    hrefs?: Record<string, string>;
  }

  let {
    lang = 'en',
    locale = lang,
    currentPath = '',
    langHref,
    languages,
    hrefs = {},
  }: Props = $props();

  const isZh = $derived(lang === 'zh-CN');
  const switchHref = $derived(langHref ?? url(isZh ? '' : 'zh-CN'));

  const rest = $derived(currentPath.startsWith(BASE) ? currentPath.slice(BASE.length) : currentPath.replace(/^\/+/, ''));
  const localeSegment = $derived(new RegExp(`^(?:${['zh-CN', ...machineLocales.map((l) => l.code)].join('|')})(/|$)`));
  const activeSection = $derived(rest.replace(localeSegment, '').split('/')[0]);
  const isMachinePage = $derived(locale !== lang);
  const home = $derived(url(isMachinePage ? locale : isZh ? 'zh-CN' : ''));

  const menu = $derived(
    languages ?? [
      { code: 'en', name: 'English', href: url('') },
      { code: 'zh-CN', name: '简体中文', href: url('zh-CN') },
      ...machineLocales.map(({ code, name }) => ({ code, name, href: url(code) })),
    ]
  );
  const currentLanguage = $derived(menu.find((l) => l.code === locale)?.name ?? locale);

  const pagePath = $derived(
    versionPath(currentPath, BASE).replace(isMachinePage ? new RegExp(`^/${locale}(?=/|$)`) : /$^/, '')
  );
  const currentLabel = $derived(
    siteVersions.find((version) => version.id === currentVersion)?.label ?? currentVersion
  );
  const appsHref = $derived(isLatestVersion ? url(isZh ? 'zh-CN/apps' : 'apps') : isZh ? '/zh-CN/apps' : '/apps');
  const releasesHref = $derived(
    isLatestVersion ? url(isZh ? 'zh-CN/releases' : 'releases') : isZh ? '/zh-CN/releases' : '/releases'
  );
  const onRootPage = $derived(/^\/(zh-CN\/)?(apps|releases)(\/|$)/.test(pagePath));

  let isMenuOpen = $state(false);

  onMount(() => {
    const menus = document.querySelectorAll<HTMLDetailsElement>('.site-nav__projects, .site-nav__versions');
    const closeMenus = (event: MouseEvent) => {
      for (const m of menus) {
        if (m.open && !m.contains(event.target as Node)) m.open = false;
      }
    };
    document.addEventListener('click', closeMenus);

    for (const link of document.querySelectorAll<HTMLAnchorElement>('[data-version-link]')) {
      link.addEventListener('click', async (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        event.preventDefault();
        let found = false;
        try {
          found = (await fetch(link.href, { method: 'HEAD' })).ok;
        } catch {}
        location.href = found ? link.href : (link.dataset.versionHome ?? link.href);
      });
    }

    return () => document.removeEventListener('click', closeMenus);
  });
</script>

<header class="site-nav">
  <div class="site-nav__inner">
    <a href={home} class="site-nav__brand" aria-label="NativeSvelte">
      <Logo class="site-nav__logo" />
      <span>NativeSvelte</span>
    </a>

    <details class="site-nav__projects">
      <summary aria-label={isZh ? '切换项目' : 'Switch project'} title={isZh ? '切换项目' : 'Switch project'}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <div class="site-nav__projects-menu">
        <a href={home} class="is-current" aria-current="true">
          <Logo class="site-nav__project-logo" />
          <div class="site-nav__project-copy">
            <strong>NativeSvelte</strong>
            <span>{isZh ? 'Svelte 与 Rust 的全平台 Native UI 框架' : 'Svelte & Rust native UI framework for every platform'}</span>
          </div>
        </a>
        <a href={GPUI_KIT_URL} target="_blank" rel="noopener noreferrer">
          <svg class="site-nav__project-logo site-nav__gpui-kit-logo" viewBox="0 0 32 32" aria-hidden="true">
            <path d="M4 4h24v5H10v14h18v5H4V4Z" fill="currentColor" />
            <path d="M16 13h12v10h-5v-5h-7v-5Z" fill="#3B82F6" />
          </svg>
          <div class="site-nav__project-copy">
            <strong>GPUI Kit</strong>
            <span>{isZh ? 'GPUI 桌面应用的组件与工具集' : 'Components and tools for GPUI desktop apps'}</span>
          </div>
        </a>
      </div>
    </details>

    <nav
      class="site-nav__links"
      class:is-open={isMenuOpen}
      id="site-nav-links"
      aria-label={isZh ? '主导航' : 'Primary'}
    >
      {#each SECTIONS as section}
        <a
          href={hrefs[section.id] ?? url(isZh ? `zh-CN/${section.id}` : section.id)}
          class="site-nav__link"
          class:active={activeSection === section.id}
          aria-current={activeSection === section.id ? 'true' : undefined}
          onclick={() => (isMenuOpen = false)}
        >
          {label(section.label, locale)}
        </a>
      {/each}
      <a
        href={url(isZh ? 'zh-CN/gallery' : 'gallery')}
        class="site-nav__link"
        class:active={activeSection === 'gallery'}
        aria-current={activeSection === 'gallery' ? 'true' : undefined}
        onclick={() => (isMenuOpen = false)}
      >
        {isZh ? '示例应用' : 'Gallery'}
      </a>
      <a
        href={appsHref}
        class="site-nav__link"
        class:active={activeSection === 'apps'}
        aria-current={activeSection === 'apps' ? 'true' : undefined}
        onclick={() => (isMenuOpen = false)}
      >
        {isZh ? '应用案例' : 'App Stories'}
      </a>
      <a
        href={releasesHref}
        class="site-nav__link"
        class:active={activeSection === 'releases'}
        aria-current={activeSection === 'releases' ? 'true' : undefined}
        onclick={() => (isMenuOpen = false)}
      >
        {isZh ? '版本发布' : 'Releases'}
      </a>
    </nav>

    <div class="site-nav__actions">
      {#if siteVersions.length > 1}
        <details class="site-nav__versions">
          <summary title={isZh ? '文档版本' : 'Documentation version'}>
            {currentLabel}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <div class="site-nav__versions-menu" aria-label={isZh ? '版本' : 'Versions'}>
            {#each siteVersions as version}
              <a
                href={onRootPage ? pagePath : versionHref(version, pagePath)}
                data-version-link
                data-version-home={versionHref(version, isZh ? '/zh-CN' : '/')}
                class:is-current={version.id === currentVersion}
                aria-current={version.id === currentVersion ? 'page' : undefined}
              >
                {version.label}
                {#if version.id === latestVersion}
                  <span>{isZh ? '最新' : 'latest'}</span>
                {/if}
              </a>
            {/each}
          </div>
        </details>
      {/if}

      <DocSearch {lang} />

      {#if machineLocales.length > 0}
        <details class="site-nav__versions site-nav__languages">
          <summary title={isZh ? '语言' : 'Language'}>
            {currentLanguage}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <div class="site-nav__versions-menu" aria-label={isZh ? '语言' : 'Languages'}>
            {#each menu.filter((l) => l.href) as l}
              <a
                href={l.href}
                hreflang={l.code}
                lang={l.code}
                class:is-current={l.code === locale}
                aria-current={l.code === locale ? 'page' : undefined}
              >
                {l.name}
              </a>
            {/each}
          </div>
        </details>
      {:else}
        <Button
          variant="ghost"
          size="sm"
          href={switchHref}
          class="site-nav__lang-btn"
          hreflang={isZh ? 'en' : 'zh-CN'}
          lang={isZh ? 'en' : 'zh-CN'}
          title={isZh ? 'English' : '中文'}
        >
          {isZh ? 'EN' : '中文'}
        </Button>
      {/if}

      <ThemeSwitch {lang} />

      <Button variant="ghost" size="icon-sm" href={REPO_URL} target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
        </svg>
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        id="nav-burger"
        class="site-nav__burger"
        aria-label={isZh ? '菜单' : 'Menu'}
        aria-expanded={String(isMenuOpen)}
        aria-controls="site-nav-links"
        onclick={() => (isMenuOpen = !isMenuOpen)}
      >
        <svg class="site-nav__burger-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
        <svg class="site-nav__burger-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </Button>
    </div>
  </div>
</header>
