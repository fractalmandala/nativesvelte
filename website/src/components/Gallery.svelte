<script lang="ts">
  import { onMount } from 'svelte';
  import { BASE, REPO_URL, url, type Lang } from '../lib/site';
  import Button from './ui/Button.svelte';
  import ToggleGroup from './ui/ToggleGroup.svelte';
  import ToggleGroupItem from './ui/ToggleGroupItem.svelte';
  import { playSelect } from '../lib/sound';

  interface Props {
    lang?: Lang;
    built?: boolean;
  }

  let { lang = 'en', built = false }: Props = $props();
  const isHi = $derived(lang === 'hi');
  const src = `${BASE}play/gallery/index.html`;
  const link = (path: string) => url(isHi ? `hi/${path}` : path);

  const t = $derived(
    isHi
      ? {
          title: 'निदर्शन (Gallery)',
          intro: 'NativeSvelte का निदर्शन अनुप्रयोग: सूची, संचलन, प्रपत्र, संकेत-चेष्टा, सजीवन, चित्रपटल (Canvas), पाठ एवं छवियाँ। यहाँ nsh package --target web द्वारा प्रकाशित संस्करण संचालित है, वही संहिता जो iOS, Android एवं डेस्कटॉप पर चलती है।',
          view: 'विस्तार',
          desktop: 'संगणक / कार्यपीठ',
          phone: 'दूरभाष',
          open: 'नवीन पृष्ठ पर खोलें',
          frame: 'NativeSvelte निदर्शन अनुप्रयोग',
          pending: 'निदर्शन अनुप्रयोग निर्मित नहीं है: bun run dev (या cargo xtask web) चलाकर पुनः लोड करें।',
          how: 'जाल (Web) पर अनुप्रयोग प्रकाशन',
          source: 'स्रोत संहिता',
        }
      : {
          title: 'Gallery',
          intro: 'The NativeSvelte gallery: a whole app with lists, navigation, forms, gestures, animations, canvas, text and images. This is the build nsh package --target web publishes, the same code that runs on iOS, Android and the desktop.',
          view: 'Width',
          desktop: 'Desktop',
          phone: 'Phone',
          open: 'Open in a new tab',
          frame: 'The NativeSvelte gallery',
          pending: 'The gallery is not built: run bun run dev (or cargo xtask web) and reload.',
          how: 'Publishing for the web',
          source: 'Source',
        }
  );

  let mode = $state('desktop');
  let frameEl = $state<HTMLIFrameElement | null>(null);

  function setMode(newMode: string) {
    if (newMode !== mode) playSelect();
    mode = newMode;
    try {
      localStorage.setItem('nsh-gallery-width', newMode);
    } catch {}
  }

  onMount(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem('nsh-gallery-width');
    } catch {}
    mode = saved === 'phone' || window.matchMedia('(max-width: 640px)').matches ? 'phone' : 'desktop';

    if (frameEl) {
      const sync = () => {
        if (frameEl) {
          frameEl.style.colorScheme = document.documentElement.classList.contains('light') ? 'light' : 'dark';
        }
      };
      sync();
      const observer = new MutationObserver(sync);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      return () => observer.disconnect();
    }
  });
</script>

<section class="gallery" data-gallery>
  <header class="gallery__head page-head page-head--compact">
    <div>
      <h1>{t.title}</h1>
      <p>{t.intro}</p>
    </div>
    <div class="gallery__actions">
      <ToggleGroup variant="segmented" size="sm" aria-label={t.view}>
        <ToggleGroupItem type="single" on={mode === 'desktop'} onclick={() => setMode('desktop')}>{t.desktop}</ToggleGroupItem>
        <ToggleGroupItem type="single" on={mode === 'phone'} onclick={() => setMode('phone')}>{t.phone}</ToggleGroupItem>
      </ToggleGroup>
      {#if built}
        <Button size="sm" href={src} target="_blank" rel="noopener">{t.open}</Button>
      {/if}
    </div>
  </header>

  <div class="gallery__stage" data-stage data-mode={mode}>
    {#if built}
      <iframe bind:this={frameEl} class="gallery__frame" {src} title={t.frame} allow="clipboard-write" data-frame></iframe>
    {:else}
      <p class="gallery__pending">{t.pending}</p>
    {/if}
  </div>

  <p class="gallery__links">
    <a href={link('docs/web')}>{t.how}</a>
    <span aria-hidden="true">·</span>
    <a href="{REPO_URL}/tree/main/examples/gallery" target="_blank" rel="noopener noreferrer">{t.source}</a>
  </p>
</section>

<style>
  :global(.gallery) {
    max-width: 1440px;
    margin: 0 auto;
    padding: 2.25rem clamp(1rem, 3vw, 2.5rem) 2.5rem;
  }
  :global(.gallery__head) {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1rem 2rem;
  }
  :global(.gallery__head p) {
    margin: 0.35rem 0 0;
    color: var(--muted-foreground);
    max-width: 52rem;
  }
  :global(.gallery__actions) {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.6rem;
  }
  :global(.gallery__stage) {
    margin-top: 1.25rem;
    display: flex;
    justify-content: center;
  }
  :global(.gallery__frame) {
    display: block;
    width: 100%;
    height: max(560px, calc(100dvh - 15rem));
    border: 1px solid var(--border);
    border-radius: 14px;
    background: #000;
    box-shadow: var(--shadow-panel);
    transition: width 220ms ease;
  }
  :global(.gallery__stage[data-mode="phone"] .gallery__frame) {
    width: 390px;
    max-width: 100%;
    height: min(844px, max(560px, calc(100dvh - 15rem)));
    border-radius: 28px;
  }
  :global(.gallery__pending) {
    padding: 4rem 1rem;
    color: var(--muted-foreground);
    text-align: center;
  }
  :global(.gallery__links) {
    margin: 1rem 0 0;
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    font-size: 0.85rem;
    color: var(--muted-foreground);
  }
  :global(.gallery__links a) {
    color: inherit;
  }
  :global(.gallery__links a:hover) {
    color: var(--foreground);
  }
</style>
