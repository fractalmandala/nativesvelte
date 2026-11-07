<script lang="ts">
  import { onMount } from 'svelte';
  import { BASE, type Lang } from '../lib/site';
  import { frameBar, hasPlayer } from '../lib/demo.js';
  import Button from './ui/Button.svelte';
  import Select from './ui/Select.svelte';
  import Toggle from './ui/Toggle.svelte';

  interface Props {
    lang?: Lang;
    demos?: string[];
  }

  let { lang = 'en', demos = [] }: Props = $props();
  const isHi = $derived(lang === 'hi');
  const player = `${BASE}play/index.html?playground&theme=dark`;

  const t = $derived(
    isHi
      ? {
          title: 'प्रयोगशाला (Playground)',
          intro: 'ब्राउज़र में NativeSvelte अनुप्रयोग लिखें: संहिता इसी पृष्ठ पर संकलित होकर तत्काल चलती है।',
          example: 'उदाहरण',
          run: 'चलाएँ',
          share: 'साझा करें',
          copied: 'संपर्क प्रतिलिपि हो गया',
          reset: 'पुनः स्थापित करें',
          output: 'परिणाम',
          clear: 'रिक्त करें',
          empty: 'कोई परिणाम नहीं। console.log और त्रुटियाँ यहाँ दिखेंगी।',
          compiled: 'संकलित एवं संचालित',
          loading: 'संचालन तंत्र लोड हो रहा है…',
          dark: 'श्याम (Dark)',
          live: 'सक्रिय',
          noPlayer: 'प्लेयर निर्मित नहीं है: bun run dev (या cargo xtask web) चलाएँ।',
          note: 'केवल nsh के मॉड्यूल (nsh, nsh/*) आयात किए जा सकते हैं; कोई नेटवर्क या सापेक्ष आयात नहीं।',
        }
      : {
          title: 'Playground',
          intro: 'Write a NativeSvelte app in the browser: the page compiles it and runs it right away.',
          example: 'Example',
          run: 'Run',
          share: 'Share',
          copied: 'Link copied',
          reset: 'Reset',
          output: 'Output',
          clear: 'Clear',
          empty: 'No output. console.log calls and errors show up here.',
          compiled: 'Compiled and running',
          loading: 'Loading the runtime…',
          dark: 'Dark',
          live: 'Live',
          noPlayer: 'The player is not built: run bun run dev (or cargo xtask web) and reload.',
          note: 'Imports are nsh’s modules only (nsh, nsh/*); no network, no relative imports.',
        }
  );

  let playgroundEl = $state<HTMLElement | null>(null);

  onMount(async () => {
    if (playgroundEl) {
      const { mountPlayground } = await import('../lib/playground-client');
      mountPlayground(playgroundEl);
    }
  });
</script>

<section
  bind:this={playgroundEl}
  class="playground"
  data-playground
  data-player={player}
  data-has-player={hasPlayer() ? '' : undefined}
  data-copy={JSON.stringify(t)}
>
  <header class="playground__head">
    <div>
      <h1>{t.title}</h1>
      <p>{t.intro}</p>
    </div>
  </header>

  <div class="playground__toolbar">
    <div class="playground__field">
      <span id="pg-example-label">{t.example}</span>
      <Select
        id="pg-example"
        size="sm"
        labelledby="pg-example-label"
        class="playground__example"
        options={demos.map((name) => ({ value: name, label: `${name}.tsx` }))}
        data-example
      />
    </div>
    <span class="playground__status" data-status aria-live="polite"></span>
    <div class="playground__actions">
      <Toggle variant="outline" size="sm" pressed data-dark>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
        </svg>
        {t.dark}
      </Toggle>
      <Button variant="secondary" size="sm" data-reset>{t.reset}</Button>
      <Button variant="secondary" size="sm" data-share>{t.share}</Button>
      <Button size="sm" data-run title="Ctrl / ⌘ + Enter">{t.run}</Button>
    </div>
  </div>

  <div class="playground__body">
    <div class="playground__editor" data-editor></div>
    <div class="playground__side">
      <div class="playground__stage">
        <div class="phone" style="--phone-w:390;--phone-h:844">
          {@html frameBar('App.tsx', hasPlayer() ? t.live : '')}
          <div class="phone__screen">
            {#if hasPlayer()}
              <iframe data-frame allow="clipboard-write" title={t.title} width="390" height="844"></iframe>
            {:else}
              <div class="phone__placeholder"><p class="phone__placeholder-title">{t.noPlayer}</p></div>
            {/if}
          </div>
        </div>
      </div>
      <div class="playground__output">
        <div class="playground__output-head">
          <span>{t.output}</span>
          <Button variant="ghost" size="xs" data-clear>{t.clear}</Button>
        </div>
        <div class="playground__log" data-log><p class="playground__empty">{t.empty}</p></div>
      </div>
    </div>
  </div>
  <p class="playground__note">{t.note}</p>
</section>

<style>
  :global(.playground) {
    max-width: 1440px;
    margin: 0 auto;
    padding: 2.25rem clamp(1rem, 3vw, 2.5rem) 2.5rem;
  }
  :global(.playground__head h1) { margin: 0; font-size: 1.75rem; letter-spacing: -0.02em; }
  :global(.playground__head p) { margin: 0.35rem 0 0; color: var(--muted-foreground); max-width: 46rem; }
  :global(.playground__toolbar) {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
    margin: 1.25rem 0 0.75rem;
  }
  :global(.playground__field) { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--muted-foreground); }
  :global(.playground__example) { width: 14rem; font-family: var(--font-mono); }
  :global(.playground__status) { min-width: 0; max-width: 40ch; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.8rem; color: var(--muted-foreground); }
  :global(.playground__status[data-kind="error"]) { color: var(--destructive); }
  :global(.playground__status[data-kind="ok"]) { color: var(--success); }
  :global(.playground__actions) { margin-left: auto; display: flex; align-items: center; gap: 0.5rem; }
  :global(.playground__body) {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 1rem;
    height: calc(100vh - 13rem);
    min-height: 34rem;
  }
  :global(.playground__editor) {
    min-width: 0;
    border: 1px solid var(--line);
    border-radius: var(--radius-surface);
    overflow: hidden;
    background: var(--code-bg);
    box-shadow: var(--finish-inset);
  }
  :global(.playground__editor .cm-editor) { height: 100%; font-size: 13px; }
  :global(.playground__editor .cm-scroller) { font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace); line-height: 1.6; }
  :global(.playground__editor .cm-focused) { outline: none; }
  :global(.playground__side) { display: flex; flex-direction: column; gap: 0.75rem; min-height: 0; width: calc(390px * 0.72 + 20px); }
  :global(.playground__stage) { display: flex; justify-content: center; }
  :global(.playground__stage .phone) { --phone-scale: 0.72; }
  :global(.playground__output) {
    flex: 1;
    min-height: 6rem;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    overflow: hidden;
    background: var(--finish-card-bg);
    box-shadow: var(--finish-flat);
  }
  :global(.playground__output-head) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.35rem 0.75rem;
    border-bottom: 1px solid var(--line);
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--faint);
  }
  :global(.playground__log) {
    flex: 1;
    overflow: auto;
    padding: 0.5rem 0.75rem;
    font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
    font-size: 0.75rem;
    line-height: 1.5;
  }
  :global(.playground__log pre) { margin: 0 0 0.4rem; white-space: pre-wrap; word-break: break-word; font: inherit; }
  :global(.playground__log [data-level="error"]) { color: var(--destructive); }
  :global(.playground__log [data-level="warn"]) { color: var(--warning); }
  :global(.playground__empty) { margin: 0; color: var(--muted-foreground); font-family: inherit; }
  :global(.playground__note) { margin: 0.75rem 0 0; font-size: 0.8rem; color: var(--muted-foreground); }

  :global(.playground .tok-keyword) { color: var(--code-keyword); }
  :global(.playground .tok-string), :global(.playground .tok-string2) { color: var(--code-string); }
  :global(.playground .tok-comment) { color: var(--code-comment); font-style: italic; }
  :global(.playground .tok-number), :global(.playground .tok-bool), :global(.playground .tok-atom) { color: var(--code-number); }
  :global(.playground .tok-typeName), :global(.playground .tok-className) { color: var(--code-type); }
  :global(.playground .tok-propertyName) { color: var(--code-property); }
  :global(.playground .tok-variableName2), :global(.playground .tok-definition) { color: var(--code-fn); }
  :global(.playground .tok-tagName) { color: var(--code-keyword); }
  :global(.playground .tok-attributeName) { color: var(--code-type); }
  :global(.playground .cm-gutters) { background: var(--code-bg); border-right: 1px solid var(--line); color: var(--faint); }
  :global(.playground .cm-activeLine), :global(.playground .cm-activeLineGutter) { background: color-mix(in srgb, var(--foreground) 4%, transparent); }
  :global(.playground .cm-content) { caret-color: var(--citrus); color: var(--code-fg); }
  :global(.playground .cm-selectionBackground), :global(.playground .cm-focused .cm-selectionBackground) { background: color-mix(in srgb, var(--selection) 30%, transparent) !important; }

  @media (max-width: 900px) {
    :global(.playground__body) { grid-template-columns: 1fr; height: auto; }
    :global(.playground__editor) { height: 28rem; }
    :global(.playground__side) { width: auto; }
    :global(.playground__output) { min-height: 10rem; }
    :global(.playground__actions) { margin-left: 0; flex-wrap: wrap; }
  }
</style>
