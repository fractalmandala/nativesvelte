<script lang="ts">
  import Button from './ui/Button.svelte';
  import { url, type Lang } from '../lib/site';

  interface Props {
    lang: Lang;
  }

  let { lang }: Props = $props();
  const isHi = $derived(lang === 'hi');
  const asset = (name: string) => url(`brand/${name}`);

  const t = $derived(
    isHi
      ? {
          title: 'पहचान एवं प्रतीक',
          usage: 'प्रतीक चिह्न (Logo) उपयोग',
          usageLead: 'NativeSvelte द्वारा विकसित अनुप्रयोगों के प्रचार-प्रसार हेतु आप NativeSvelte के प्रतीक चिह्न का निःसंकोच उपयोग कर सकते हैं।',
          logo: 'प्रतीक चिह्न (Logo)',
          logoLead: 'बाह्य आवरण एक दीप्तिमान हरित नली है, जिसके भीतर के मणके संचालित मॉड्यूल दर्शाते हैं। श्याम एवं श्वेत पृष्ठभूमि हेतु पृथक संस्करण उपलब्ध हैं।',
          onDark: 'श्याम पृष्ठभूमि',
          onLight: 'प्रकाश पृष्ठभूमि',
          solid: 'एकरंगी प्रतीक',
          solidLead: 'समान रूपरेखा, केवल एक रंग में। एकरंगी मुद्रण, जलचिह्न एवं रंगीन पृष्ठभूमि हेतु उपयुक्त।',
          white: 'श्वेत',
          black: 'श्याम',
          citrusName: 'हरित पीत',
          icon: 'अनुप्रयोग प्रतीक (App Icon)',
          iconLead: '1024×1024 पूर्ण वर्गाकार, जिसके किनारे तंत्र द्वारा सुडौल किए जाते हैं। अनुप्रयोग भंडार एवं कार्यपीठ हेतु उपयुक्त।',
          banners: 'README शीर्ष पट्टिका (Banner)',
          bannersLead: '1600×500, द्विगुण विभेदन में निर्यातित, README एवं लेखों के शीर्ष हेतु।',
          social: 'सामाजिक पूर्वावलोकन चित्र',
          socialLead: '1280×640, GitHub कोष के सामाजिक पूर्वावलोकन हेतु।',
          link: 'संपर्क पूर्वावलोकन चित्र',
          linkLead: '1200×630, जालस्थल का og:image चित्र।',
          colors: 'रंग योजना',
          type: 'मुद्रण लिपि (Typography)',
          typeLead: 'शीर्षक, ध्येयवाक्य एवं मंच के नाम हेतु Figtree लिपि का प्रयोग: शीर्षक 600, ध्येयवाक्य 400, मंच 300।',
          name: 'नामकरण',
          nameLead: 'औपचारिक अवसरों पर NativeSvelte लिखें, संहिता में लघु अक्षरों में nativesvelte अथवा nsh प्रयुक्त करें।',
          dark: 'श्याम (Dark)',
          light: 'प्रकाश (Light)',
          citrus: 'दीप्त हरित (श्याम पृष्ठभूमि)',
          olive: 'जैतून हरित (प्रकाश पृष्ठभूमि)',
          inkDark: 'श्याम पृष्ठभूमि',
          inkLight: 'प्रकाश लेख',
        }
      : {
          title: 'Brand',
          usage: 'Using the logo',
          usageLead: 'Any app built with NativeSvelte is free to use the brand logo in its promotion.',
          logo: 'Logo',
          logoLead: 'The shell is a lit citrus tube, and the bead inside it is the module it runs. There is a version for dark backgrounds and one for light.',
          onDark: 'On dark',
          onLight: 'On light',
          solid: 'Solid logo',
          solidLead: 'The same outline in one color, for single-color print, watermarks, and photos or colored grounds.',
          white: 'White',
          black: 'Black',
          citrusName: 'Citrus',
          icon: 'App icon',
          iconLead: '1024×1024 and full-bleed: the system rounds the corners. For app stores and home screens.',
          banners: 'README banner',
          bannersLead: '1600×500, exported at twice that resolution, for READMEs and article headers.',
          social: 'Social preview',
          socialLead: "1280×640, for a GitHub repository's social preview. The mark sits in the middle band, so it stays whole when a topic page crops the image.",
          link: 'Link preview',
          linkLead: "1200×630, the site's og:image.",
          colors: 'Colors',
          type: 'Typeface',
          typeLead: 'The name, slogan and platforms are set in Figtree: the name at 600, the slogan at 400, the platforms at 300.',
          name: 'Name',
          nameLead: 'Write NativeSvelte in formal places. Lowercase nativesvelte / nsh is for code.',
          dark: 'Dark',
          light: 'Light',
          citrus: 'Citrus, on dark',
          olive: 'Olive, on light',
          inkDark: 'Dark ground',
          inkLight: 'Ink, on light',
        }
  );

  const banners = $derived([
    { name: 'nsh-banner-light.png', label: t.light, ratio: '1600 / 500' },
    { name: 'nsh-banner-dark.png', label: t.dark, ratio: '1600 / 500' },
  ]);
  const socials = $derived([
    { name: 'nsh-social-preview-light.png', label: t.light, ratio: '1280 / 640' },
    { name: 'nsh-social-preview-dark.png', label: t.dark, ratio: '1280 / 640' },
  ]);
  const swatches = $derived([
    { hex: '#a9d63f', label: t.citrus },
    { hex: '#4a6d0a', label: t.olive },
    { hex: '#0d1117', label: t.inkDark },
    { hex: '#1f2328', label: t.inkLight },
    { hex: '#e6edf3', label: isHi ? 'श्याम पृष्ठभूमि पर लेख' : 'Ink, on dark' },
    { hex: '#f2f4f4', label: isHi ? 'प्रकाश पृष्ठभूमि' : 'Light ground' },
  ]);
</script>

<div class="brand">
  <header class="brand__hero page-head">
    <h1>{t.title}</h1>
  </header>

  <section>
    <h2>{t.usage}</h2>
    <p>{t.usageLead}</p>
  </section>

  <section>
    <h2>{t.logo}</h2>
    <p>{t.logoLead}</p>
    <div class="brand__grid">
      {#each [{ file: 'on-dark', label: t.onDark, cls: 'brand__tile--dark' }, { file: 'on-light', label: t.onLight, cls: 'brand__tile--light' }] as logo}
        <figure>
          <div class="brand__tile {logo.cls}">
            <img src={asset(`nsh-logo-${logo.file}.svg`)} alt="NativeSvelte logo, {logo.label}" width="160" height="90" />
          </div>
          <figcaption>
            <span>{logo.label}</span>
            <span class="brand__links">
              <Button variant="outline" size="xs" href={asset(`nsh-logo-${logo.file}.svg`)} download>SVG</Button>
              <Button variant="outline" size="xs" href={asset(`nsh-logo-${logo.file}.png`)} download>PNG</Button>
            </span>
          </figcaption>
        </figure>
      {/each}
    </div>
  </section>

  <section>
    <h2>{t.solid}</h2>
    <p>{t.solidLead}</p>
    <div class="brand__grid">
      {#each [{ file: 'white', label: t.white, cls: 'brand__tile--dark' }, { file: 'black', label: t.black, cls: 'brand__tile--light' }, { file: 'citrus', label: t.citrusName, cls: 'brand__tile--dark' }] as solid}
        <figure>
          <div class="brand__tile {solid.cls}">
            <img src={asset(`nsh-logo-solid-${solid.file}.svg`)} alt="NativeSvelte solid logo, {solid.label}" width="160" height="90" />
          </div>
          <figcaption>
            <span>{solid.label}</span>
            <span class="brand__links">
              <Button variant="outline" size="xs" href={asset(`nsh-logo-solid-${solid.file}.svg`)} download>SVG</Button>
              <Button variant="outline" size="xs" href={asset(`nsh-logo-solid-${solid.file}.png`)} download>PNG</Button>
            </span>
          </figcaption>
        </figure>
      {/each}
    </div>
  </section>

  <section>
    <h2>{t.icon}</h2>
    <p>{t.iconLead}</p>
    <div class="brand__grid">
      {#each [{ file: 'dark', label: t.dark, cls: 'brand__tile--dark' }, { file: 'light', label: t.light, cls: 'brand__tile--light' }] as icon}
        <figure>
          <div class="brand__tile {icon.cls}">
            <img class="brand__icon" src={asset(`nsh-app-icon-${icon.file}.png`)} alt="NativeSvelte icon, {icon.label}" width="144" height="144" />
          </div>
          <figcaption>
            <span>{icon.label}</span>
            <span class="brand__links">
              <Button variant="outline" size="xs" href={asset(`nsh-app-icon-${icon.file}.png`)} download>PNG</Button>
            </span>
          </figcaption>
        </figure>
      {/each}
    </div>
  </section>

  <section>
    <h2>{t.banners}</h2>
    <p>{t.bannersLead}</p>
    <div class="brand__stack">
      {#each banners as item}
        <figure>
          <img class="brand__image" src={asset(item.name)} alt="NativeSvelte banner, {item.label}" style="aspect-ratio: {item.ratio}" loading="lazy" />
          <figcaption>
            <span>{item.label}</span>
            <Button variant="outline" size="xs" href={asset(item.name)} download>PNG</Button>
          </figcaption>
        </figure>
      {/each}
    </div>
  </section>

  <section>
    <h2>{t.social}</h2>
    <p>{t.socialLead}</p>
    <div class="brand__grid">
      {#each socials as item}
        <figure>
          <img class="brand__image" src={asset(item.name)} alt="NativeSvelte social preview, {item.label}" style="aspect-ratio: {item.ratio}" loading="lazy" />
          <figcaption>
            <span>{item.label}</span>
            <Button variant="outline" size="xs" href={asset(item.name)} download>PNG</Button>
          </figcaption>
        </figure>
      {/each}
    </div>
  </section>

  <section>
    <h2>{t.link}</h2>
    <p>{t.linkLead}</p>
    <figure class="brand__single">
      <img class="brand__image" src={url('og-image.png')} alt="NativeSvelte link preview" style="aspect-ratio: 1200 / 630" loading="lazy" />
      <figcaption>
        <span>og-image.png</span>
        <Button variant="outline" size="xs" href={url('og-image.png')} download>PNG</Button>
      </figcaption>
    </figure>
  </section>

  <section>
    <h2>{t.colors}</h2>
    <ul class="brand__swatches">
      {#each swatches as swatch}
        <li>
          <span class="brand__chip" style="background: {swatch.hex}"></span>
          <code>{swatch.hex}</code>
          <span>{swatch.label}</span>
        </li>
      {/each}
    </ul>
  </section>

  <section class="brand__notes">
    <div>
      <h2>{t.type}</h2>
      <p>{t.typeLead}</p>
      <p><a href="https://fonts.google.com/specimen/Figtree" target="_blank" rel="noopener noreferrer">Figtree</a></p>
    </div>
    <div>
      <h2>{t.name}</h2>
      <p>{t.nameLead}</p>
    </div>
  </section>
</div>

<style>
  .brand {
    max-width: 1200px;
    margin: 0 auto;
    padding: 3rem clamp(1rem, 3vw, 2.5rem) 4rem;
    color: var(--foreground);
  }

  .brand__hero { max-width: 46rem; margin-bottom: clamp(2.5rem, 5vw, 3.5rem); }

  :global(html[lang^='zh']) .brand__hero h1 { letter-spacing: normal; }

  .brand p { color: var(--muted-foreground); line-height: 1.7; }
  .brand a:not([data-slot]) { color: var(--foreground); text-decoration: underline; text-underline-offset: 3px; }

  .brand section { border-top: 1px solid var(--border); padding-block: 2rem 2.5rem; }
  .brand h2 { font-size: 1.35rem; font-weight: 620; letter-spacing: -0.02em; }
  .brand section > p { margin-top: 0.5rem; max-width: 46rem; }

  .brand__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr)); gap: 1.25rem; margin-top: 1.5rem; }
  .brand__stack { display: grid; gap: 1.25rem; margin-top: 1.5rem; }
  .brand__single { margin-top: 1.5rem; max-width: 40rem; }

  .brand figure { margin: 0; min-width: 0; }

  .brand figcaption {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-top: 0.6rem;
    color: var(--muted-foreground);
    font-size: 0.875rem;
  }

  .brand__links { display: flex; gap: 0.4rem; }

  .brand__tile {
    display: grid;
    place-items: center;
    aspect-ratio: 16 / 9;
    border: 1px solid var(--border);
    border-radius: 12px;
  }

  .brand__tile img { width: clamp(6rem, 30%, 9rem); height: auto; }
  .brand__tile img.brand__icon { border-radius: 22.37%; }
  .brand__tile--dark { background: #0d1117; }
  .brand__tile--light { background: #f2f4f4; }

  .brand__image { display: block; width: 100%; height: auto; border: 1px solid var(--border); border-radius: 12px; }

  .brand__swatches {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 13rem), 1fr));
    gap: 1rem;
    margin: 1.25rem 0 0;
    padding: 0;
    list-style: none;
  }

  .brand__swatches li { display: grid; gap: 0.25rem; color: var(--muted-foreground); font-size: 0.875rem; }
  .brand__swatches code { color: var(--foreground); font: 0.8rem var(--font-mono); }
  .brand__chip { display: block; height: 4rem; margin-bottom: 0.35rem; border: 1px solid var(--border); border-radius: 10px; }

  .brand__notes { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr)); gap: 2rem; }
  .brand__notes p { margin-top: 0.5rem; }
</style>
