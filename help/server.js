#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const { renderPage } = require('../lib/engine');

const PORT = parseInt(process.argv[2] || '8080', 10);
const CONTENT_BASE = path.join(__dirname, 'content');
const COMPONENTS_DIR = path.join(CONTENT_BASE, 'components');
const GUIDES_DIR = path.join(CONTENT_BASE, 'guides');
const SHELL_PUG = path.join(__dirname, 'shell.pug');

// Parse front matter from markdown
function parseFrontMatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };

  const meta = {};
  match[1].split('\n').forEach(line => {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) meta[key.trim()] = rest.join(':').trim();
  });

  return { meta, body: match[2] };
}

// Split markdown body into tab sections by ## headings
function splitTabs(body) {
  const tabs = {};
  let current = null;
  const lines = body.split('\n');

  for (const line of lines) {
    const heading = line.match(/^## (.+)$/);
    if (heading) {
      current = heading[1].toLowerCase().trim();
      tabs[current] = '';
    } else if (current) {
      tabs[current] += line + '\n';
    }
  }

  // Render each tab's markdown to HTML
  const rendered = {};
  for (const [key, md] of Object.entries(tabs)) {
    rendered[key] = marked(md.trim());
  }

  // Wrap code blocks in mockup-code styling
  if (rendered.code) {
    rendered.code = wrapCodeBlocks(rendered.code);
  }

  // Generate rendered examples from code blocks
  if (tabs.code) {
    rendered.examples = renderExamples(tabs.code);
  }

  return rendered;
}

// Wrap <pre><code> blocks in mockup-code DaisyUI styling
function wrapCodeBlocks(html) {
  return html.replace(/<pre><code(?:\s+class="language-(\w+)")?>([\s\S]*?)<\/code><\/pre>/g,
    (match, lang, code) => {
      const label = lang ? `<div class="badge badge-sm badge-ghost absolute top-2 right-2">${lang}</div>` : '';
      const lines = code.trim().split('\n');
      const prefixedLines = lines.map(line =>
        `<pre data-prefix=" "><code>${line}</code></pre>`
      ).join('\n');
      return `<div class="mockup-code relative my-4">${label}\n${prefixedLines}\n</div>`;
    });
}

// Extract pug/yaml code blocks from raw markdown, render them through the engine
function renderExamples(rawMarkdown) {
  const { renderPug } = require('../lib/engine');
  const codeBlocks = [];

  // Extract fenced code blocks with language
  const regex = /```(pug|yaml)\n([\s\S]*?)```/g;
  let m;
  while ((m = regex.exec(rawMarkdown)) !== null) {
    codeBlocks.push({ lang: m[1], code: m[2].trim() });
  }

  if (codeBlocks.length === 0) {
    return '<p class="text-base-content/40 italic">No renderable examples found.</p>';
  }

  const sections = [];
  for (const block of codeBlocks) {
    try {
      let html;
      if (block.lang === 'pug') {
        html = renderPug(block.code);
      } else if (block.lang === 'yaml') {
        const { yamlToPug } = require('../lib/engine');
        const pug = yamlToPug(block.code);
        html = renderPug(pug);
      }

      if (html && html.trim()) {
        sections.push(
          `<div class="mb-6">` +
          `<div class="badge badge-sm badge-outline mb-2">${block.lang}</div>` +
          `<div class="mockup-browser border border-base-300">` +
          `<div class="mockup-browser-toolbar"><div class="input">rendered output</div></div>` +
          `<div class="p-4 bg-base-200">${html}</div>` +
          `</div></div>`
        );
      }
    } catch (e) {
      sections.push(
        `<div class="mb-6">` +
        `<div class="badge badge-sm badge-error mb-2">${block.lang} — render error</div>` +
        `<pre class="text-error text-sm">${e.message}</pre>` +
        `</div>`
      );
    }
  }

  return sections.join('\n') || '<p class="text-base-content/40 italic">No renderable examples.</p>';
}

// Scan a content directory for .md files
function scanDir(dir, type) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const content = fs.readFileSync(path.join(dir, f), 'utf8');
      const { meta } = parseFrontMatter(content);
      return {
        name: meta.name || f.replace('.md', ''),
        title: meta.title || meta.name || f.replace('.md', ''),
        description: meta.description || '',
        category: meta.category || 'Other',
        base: meta.base || '',
        order: parseInt(meta.order || '99', 10),
        type,
      };
    });
}

// Get full navigation: guides + components
function getNavigation() {
  const guides = scanDir(GUIDES_DIR, 'guide')
    .sort((a, b) => a.order - b.order);

  const components = scanDir(COMPONENTS_DIR, 'component')
    .sort((a, b) => {
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.name.localeCompare(b.name);
    });

  return { guides, components };
}

// Get single item data with tab content
function getItem(type, name) {
  const dir = type === 'guide' ? GUIDES_DIR : COMPONENTS_DIR;
  const filePath = path.join(dir, `${name}.md`);
  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, 'utf8');
  const { meta, body } = parseFrontMatter(content);
  const tabs = splitTabs(body);

  return {
    name: meta.name || name,
    title: meta.title || meta.name || name,
    description: meta.description || '',
    category: meta.category || 'Other',
    base: meta.base || '',
    type,
    tabs,
  };
}

// Render the shell HTML
function renderShell() {
  const pugContent = fs.readFileSync(SHELL_PUG, 'utf8');
  return renderPage(pugContent, { title: 'DaisyPug Docs', theme: 'light' });
}

// HTTP server
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // API: full navigation (guides + components)
  if (url.pathname === '/api/nav') {
    const nav = getNavigation();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(nav));
    return;
  }

  // API: component list (backward compat)
  if (url.pathname === '/api/components') {
    const nav = getNavigation();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(nav.components));
    return;
  }

  // API: guides list
  if (url.pathname === '/api/guides') {
    const nav = getNavigation();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(nav.guides));
    return;
  }

  // API: single component
  const compMatch = url.pathname.match(/^\/api\/component\/(.+)$/);
  if (compMatch) {
    const data = getItem('component', compMatch[1]);
    if (!data) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Component not found' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
    return;
  }

  // API: single guide
  const guideMatch = url.pathname.match(/^\/api\/guide\/(.+)$/);
  if (guideMatch) {
    const data = getItem('guide', guideMatch[1]);
    if (!data) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Guide not found' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
    return;
  }

  // Shell HTML
  if (url.pathname === '/' || url.pathname === '/index.html') {
    try {
      const html = renderShell();
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Render error: ${err.message}`);
    }
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`DaisyPug Help Dashboard running at http://0.0.0.0:${PORT}/`);
  console.log(`Content: ${CONTENT_BASE}`);
  console.log(`Press Ctrl+C to stop.`);
});
