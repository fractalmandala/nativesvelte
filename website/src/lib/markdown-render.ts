import { resolve } from 'node:path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeShiki from '@shikijs/rehype';
import { visit } from 'unist-util-visit';
import { toString } from 'hast-util-to-string';
import { headingRank } from 'hast-util-heading-rank';
import GithubSlugger from 'github-slugger';
import { remarkStripTitle } from './remark-strip-title.js';
import { remarkCallouts } from './remark-callouts.js';
import { remarkCodeTabs } from './remark-code-tabs.js';
import { remarkDocLinks } from './remark-doc-links.js';
import { remarkDemo } from './remark-demo.js';
import { rehypeHeadingAnchors } from './rehype-heading-anchors.js';
import { demoState } from './demo.js';
import { themes } from './markdown.js';
import { BASE } from './site.js';

export interface Heading {
  depth: number;
  slug: string;
  text: string;
}

export interface RenderOptions {
  base?: string;
  state?: any;
  filePath?: string;
  frontmatter?: Record<string, any>;
}

function rehypeSlugWithCollapsing() {
  const slugger = new GithubSlugger();
  return (tree: any) => {
    slugger.reset();
    visit(tree, 'element', (node: any) => {
      if (headingRank(node) && !node.properties?.id) {
        node.properties = node.properties || {};
        const raw = slugger.slug(toString(node));
        const collapsed = raw.replace(/-{2,}/g, '-');
        node.properties.id = raw;
        if (collapsed !== raw) {
          node.children = node.children || [];
          node.children.unshift({
            type: 'element',
            tagName: 'span',
            properties: { id: collapsed },
            children: [],
          });
        }
      }
    });
  };
}

export async function renderMarkdown(
  markdown: string,
  options: RenderOptions = {}
): Promise<{ html: string; headings: Heading[] }> {
  const headings: Heading[] = [];
  const base = options.base ?? BASE;
  const state = options.state ?? demoState();

  const extractHeadingsPlugin = () => (tree: any) => {
    visit(tree, 'element', (node: any) => {
      if (/^h[1-6]$/.test(node.tagName)) {
        const depth = Number(node.tagName[1]);
        const id = node.properties?.id;
        const text = toString(node);
        headings.push({
          depth,
          slug: String(id || ''),
          text,
        });
      }
    });
  };

  const processor = unified()
    .use(remarkParse)
    .use(remarkStripTitle)
    .use(remarkCallouts)
    .use(remarkCodeTabs)
    .use(remarkDocLinks, { base })
    .use(remarkDemo, { base, state })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlugWithCollapsing)
    .use(extractHeadingsPlugin)
    .use(rehypeHeadingAnchors)
    .use(rehypeShiki, {
      themes,
      defaultColor: 'light',
    })
    .use(rehypeStringify, { allowDangerousHtml: true });

  const fileInput: { value: string; path?: string; data?: any } = { value: markdown };
  if (options.filePath) {
    fileInput.path = resolve(options.filePath);
  }
  if (options.frontmatter) {
    fileInput.data = { frontmatter: options.frontmatter };
  }

  const result = await processor.process(fileInput);
  return {
    html: String(result),
    headings,
  };
}
