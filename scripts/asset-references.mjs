import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Markdown from 'react-markdown';
import { JSDOM } from 'jsdom';
import ts from 'typescript';
import { parseDocument } from 'yaml';

const mediaPath = /\.(?:webp|png|jpe?g|gif|avif|svg|glb|gltf|bin|woff2?|ttf|otf|hdr|ktx2?)(?:[?#].*)?$/i;

/** Inspect asset-bearing syntax without treating ordinary hyperlinks as assets.
 * All parsers are already direct, locked project dependencies; source is never executed.
 */
export function assetReferences(content, filename) {
  const references = new Map();
  const add = (url, kind = 'asset') => {
    if (typeof url === 'string' && url.trim() && !url.trim().startsWith('#')) references.set(url.trim(), { url: url.trim(), kind });
  };
  const css = value => {
    for (const match of value.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^\s)]+))\s*\)/gi)) add(match[1] ?? match[2] ?? match[3]);
    for (const match of value.matchAll(/@import\s+["']([^"']+)["']/gi)) add(match[1], 'code');
  };
  const attributes = (tag, values) => {
    if (['img', 'source', 'video', 'audio', 'track', 'embed', 'input', 'script'].includes(tag)) add(values.get('src'), tag === 'script' ? 'code' : 'asset');
    if (['img', 'source'].includes(tag)) {
      for (const candidate of (values.get('srcset') ?? '').split(',')) add(candidate.trim().split(/\s+/)[0]);
    }
    if (tag === 'video') add(values.get('poster'));
    if (tag === 'object') add(values.get('data'));
    if (tag === 'image' || tag === 'use') add(values.get('href') ?? values.get('xlink:href') ?? values.get('xlinkhref'));
    if (tag === 'link') {
      const rel = (values.get('rel') ?? '').toLowerCase().split(/\s+/);
      if (rel.some(value => ['icon', 'stylesheet', 'preload', 'modulepreload'].includes(value))) add(values.get('href'), rel.includes('stylesheet') || rel.includes('modulepreload') || ['script', 'style'].includes(values.get('as')) ? 'code' : 'asset');
    }
    if (values.has('style')) css(values.get('style'));
  };
  if (filename.endsWith('.md')) {
    const frontmatter = content.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    if (frontmatter) {
      const document = parseDocument(frontmatter[1], { uniqueKeys: true });
      if (!document.errors.length) add(document.toJS({ maxAliasCount: 20 })?.coverImage);
    }
    // Use the same Markdown parser as the reader, so full, collapsed and shortcut
    // image references, normalized labels, escapes and inline titles resolve alike.
    renderToStaticMarkup(createElement(Markdown, {
      skipHtml: true,
      urlTransform: url => url,
      components: { img: ({ src }) => { add(src); return null; } },
    }, frontmatter ? content.slice(frontmatter[0].length) : content));
  } else if (/\.(?:html|svg)$/.test(filename)) {
    // Default JSDOM parses HTML only: no scripts or resource loading are enabled.
    const dom = new JSDOM(content);
    for (const element of dom.window.document.querySelectorAll('*')) attributes(element.localName, new Map([...element.attributes].map(attribute => [attribute.name.toLowerCase(), attribute.value])));
    for (const style of dom.window.document.querySelectorAll('style')) css(style.textContent);
    dom.window.close();
  } else if (filename.endsWith('.css')) {
    css(content.replace(/\/\*[\s\S]*?\*\//g, ''));
  } else {
    const source = ts.createSourceFile(filename, content, ts.ScriptTarget.Latest, true);
    const literal = expression => expression && ts.isStringLiteralLike(expression) ? expression.text : undefined;
    const visit = node => {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const values = new Map();
        for (const attribute of node.attributes.properties) {
          if (!ts.isJsxAttribute(attribute)) continue;
          const value = attribute.initializer && ts.isJsxExpression(attribute.initializer) ? literal(attribute.initializer.expression) : literal(attribute.initializer);
          if (value !== undefined) values.set(attribute.name.getText(source).toLowerCase(), value);
        }
        attributes(node.tagName.getText(source).toLowerCase(), values);
      }
      if (ts.isNewExpression(node) && node.expression.getText(source) === 'URL' && node.arguments?.[1]?.getText(source) === 'import.meta.url') add(literal(node.arguments[0]));
      if (ts.isStringLiteralLike(node)) {
        let parent = node.parent;
        while (parent && !ts.isJsxAttribute(parent) && !ts.isStatement(parent)) parent = parent.parent;
        // JSX URL attributes were handled by their semantic role above. In
        // particular, href/to on text links must not become image downloads.
        if (parent && ts.isJsxAttribute(parent) && parent.name.getText(source) === 'style') css(node.text);
        if (!parent || !ts.isJsxAttribute(parent)) {
          if (mediaPath.test(node.text)) add(node.text);
          css(node.text);
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
  return [...references.values()];
}
