const pug = require('pug');
const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs');

const PROJECT_ROOT = path.join(__dirname, '..');
const MIXINS_DIR = path.join(PROJECT_ROOT, 'mixins');
const LAYOUTS_DIR = path.join(PROJECT_ROOT, 'layouts');

// Lazy-load dp.js script content
let _dpScript = null;
function getDpScript() {
  if (!_dpScript) _dpScript = fs.readFileSync(path.join(__dirname, 'dp.js'), 'utf8');
  return _dpScript;
}

// Lazy-load dp.css content
let _dpCss = null;
function getDpCss() {
  if (!_dpCss) _dpCss = fs.readFileSync(path.join(PROJECT_ROOT, 'public', 'dp.css'), 'utf8');
  return _dpCss;
}

// Components registered in the engine (loaded from components.yaml)
const COMPONENT_REGISTRY = new Set();

function loadRegistry() {
  if (COMPONENT_REGISTRY.size > 0) return;
  const catalogPath = path.join(__dirname, '..', 'components.yaml');
  const catalog = yaml.load(fs.readFileSync(catalogPath, 'utf8'));
  for (const category of Object.values(catalog)) {
    for (const name of Object.keys(category)) {
      COMPONENT_REGISTRY.add(name);
      const comp = category[name];
      // Register by base class name too (e.g. 'btn' for 'button')
      if (comp.base) {
        COMPONENT_REGISTRY.add(comp.base);
      }
      // Register sub-parts
      if (comp.parts) {
        for (const part of comp.parts) {
          COMPONENT_REGISTRY.add(part);
        }
      }
    }
  }
}

// Structural keys that are not opts or attributes
const STRUCTURAL_KEYS = new Set(['opts', 'attrs', 'text', 'children']);

function isComponent(name) {
  loadRegistry();
  return COMPONENT_REGISTRY.has(name);
}

/**
 * Convert a YAML node to Pug string
 */
function yamlNodeToPug(node, indent = 0) {
  const pad = '  '.repeat(indent);
  const lines = [];

  if (typeof node === 'string') {
    lines.push(`${pad}| ${node}`);
    return lines.join('\n');
  }

  if (Array.isArray(node)) {
    for (const item of node) {
      lines.push(yamlNodeToPug(item, indent));
    }
    return lines.join('\n');
  }

  if (typeof node === 'object' && node !== null) {
    for (const [tag, value] of Object.entries(node)) {
      if (isComponent(tag)) {
        lines.push(componentToPug(tag, value, indent));
      } else {
        lines.push(rawHtmlToPug(tag, value, indent));
      }
    }
  }

  return lines.join('\n');
}

function componentToPug(name, value, indent) {
  const pad = '  '.repeat(indent);
  const lines = [];

  // Shorthand: +btn("Click")
  if (typeof value === 'string') {
    lines.push(`${pad}+${name}({text: '${escapeStr(value)}'})`);
    return lines.join('\n');
  }

  if (typeof value !== 'object' || value === null) {
    lines.push(`${pad}+${name}`);
    return lines.join('\n');
  }

  // Determine if using explicit opts/children/attrs or shorthand
  // 'text' alone doesn't trigger structural mode — it's valid as a shorthand opt
  const EXPLICIT_STRUCTURAL = new Set(['opts', 'attrs', 'children']);
  const hasExplicitStructural = Object.keys(value).some(k => EXPLICIT_STRUCTURAL.has(k));

  let opts, attrs, text, children;

  if (hasExplicitStructural) {
    // Extract structural keys; remaining non-structural keys merge into opts
    const { opts: explicitOpts, attrs: explicitAttrs, text: explicitText, children: explicitChildren, ...extraOpts } = value;
    opts = { ...extraOpts, ...explicitOpts };
    attrs = explicitAttrs || {};
    text = explicitText;
    children = explicitChildren;
  } else {
    // All keys are shorthand opts (text is treated as an opt too)
    opts = { ...value };
    text = opts.text;
    delete opts.text;
    attrs = {};
    children = null;
  }

  // Build opts string
  const optsStr = Object.keys(opts).length > 0 ? `(${formatOpts(opts)})` : '';

  // Build attrs string
  const attrsStr = Object.keys(attrs).length > 0 ? `(${formatAttrs(attrs)})` : '';

  let line = `${pad}+${name}${optsStr}${attrsStr}`;

  if (text && !children) {
    lines.push(line);
    lines.push(`${pad}  | ${text}`);
  } else if (children) {
    lines.push(line);
    lines.push(yamlNodeToPug(children, indent + 1));
  } else if (text) {
    lines.push(line);
    lines.push(`${pad}  | ${text}`);
  } else {
    lines.push(line);
  }

  return lines.join('\n');
}

function rawHtmlToPug(tag, value, indent) {
  const pad = '  '.repeat(indent);
  const lines = [];

  // Shorthand: p "Hello"
  if (typeof value === 'string') {
    lines.push(`${pad}${tag} ${value}`);
    return lines.join('\n');
  }

  if (typeof value !== 'object' || value === null) {
    lines.push(`${pad}${tag}`);
    return lines.join('\n');
  }

  const { text, children, ...attrs } = value;

  const attrsStr = Object.keys(attrs).length > 0 ? `(${formatAttrs(attrs)})` : '';

  if (text && !children) {
    lines.push(`${pad}${tag}${attrsStr} ${text}`);
  } else if (children) {
    lines.push(`${pad}${tag}${attrsStr}`);
    lines.push(yamlNodeToPug(children, indent + 1));
  } else {
    lines.push(`${pad}${tag}${attrsStr}`);
  }

  return lines.join('\n');
}

function formatOpts(opts) {
  const parts = [];
  for (const [k, v] of Object.entries(opts)) {
    if (typeof v === 'boolean') {
      parts.push(`${k}: ${v}`);
    } else if (typeof v === 'number') {
      parts.push(`${k}: ${v}`);
    } else {
      parts.push(`${k}: '${escapeStr(String(v))}'`);
    }
  }
  return `{${parts.join(', ')}}`;
}

function formatAttrs(attrs) {
  const parts = [];
  for (const [k, v] of Object.entries(attrs)) {
    parts.push(`${k}="${escapeStr(String(v))}"`);
  }
  return parts.join(', ');
}

function escapeStr(s) {
  return s.replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

/**
 * Render Pug content to HTML
 * @param {string} pugContent - Raw Pug content (mixins are auto-included)
 * @param {object} layoutOpts - Layout options (title, theme, lang, head)
 * @returns {string} Rendered HTML
 */
function renderPug(pugContent, layoutOpts = {}) {
  // Strip any user-added mixin includes — engine handles this automatically
  const cleaned = pugContent.replace(/^\s*include\s+.*mixins.*(?:index)?\.pug\s*$/gm, '');
  const mixinInclude = `include ../mixins/index.pug\n`;
  const fullPug = mixinInclude + cleaned;

  return pug.render(fullPug, {
    filename: path.join(__dirname, 'render.pug'),
    basedir: PROJECT_ROOT,
    pretty: true,
    ...layoutOpts,
  });
}

/**
 * Render Pug content wrapped in the base layout
 * @param {string} pugContent - Raw Pug content
 * @param {object} layoutOpts - Layout options (title, theme, lang, css)
 * @param {string} layoutOpts.css - CSS mode: 'cdn' (default) or 'local' (compiled)
 * @returns {string|Promise<string>} Full HTML page (async when css='local')
 */
function renderPage(pugContent, layoutOpts = {}) {
  const cssMode = layoutOpts.css || 'cdn';

  if (cssMode === 'local') {
    return renderPageLocal(pugContent, layoutOpts);
  }

  return renderPageSync(pugContent, layoutOpts);
}

function renderPageSync(pugContent, layoutOpts, extraLocals = {}) {
  // Strip any user-added mixin includes
  pugContent = pugContent.replace(/^\s*include\s+.*mixins.*(?:index)?\.pug\s*$/gm, '');
  const mixinInclude = `include ../mixins/index.pug`;
  const layoutExtend = `extends ../layouts/base.pug`;

  const fullPug = `${layoutExtend}\n${mixinInclude}\nblock content\n${indent(pugContent, 1)}`;

  return pug.render(fullPug, {
    filename: path.join(__dirname, 'render.pug'),
    basedir: PROJECT_ROOT,
    pretty: true,
    title: layoutOpts.title || 'DaisyPug',
    theme: layoutOpts.theme,
    lang: layoutOpts.lang || 'en',
    head: layoutOpts.head || '',
    cssMode: extraLocals.cssMode || 'cdn',
    compiledCss: extraLocals.compiledCss || '',
    api: layoutOpts.api || false,
    fontSize: layoutOpts.fontSize,
    dpScript: layoutOpts.api ? getDpScript() : '',
    dpCssInline: getDpCss(),
  });
}

async function renderPageLocal(pugContent, layoutOpts) {
  const { compileCss } = require('./css');

  // First render with cdn to get HTML for class scanning
  const cdnHtml = renderPageSync(pugContent, layoutOpts);

  // Compile CSS from the rendered HTML
  const compiledCss = await compileCss(cdnHtml, { minify: layoutOpts.minify });

  // Re-render with compiled CSS inlined
  return renderPageSync(pugContent, layoutOpts, {
    cssMode: 'local',
    compiledCss,
  });
}

/**
 * Render YAML content to HTML
 * @param {string} yamlContent - YAML string describing the page
 * @param {object} layoutOpts - Layout options (css: 'cdn'|'local')
 * @returns {string|Promise<string>} Rendered HTML (async when css='local')
 */
function renderYaml(yamlContent, layoutOpts = {}) {
  const parsed = yaml.load(yamlContent);

  // Extract layout config if present at top level
  if (parsed && parsed.layout) {
    const { layout, ...rest } = parsed;
    layoutOpts = { ...layout, ...layoutOpts };
  }

  const pugContent = yamlNodeToPug(Array.isArray(parsed) ? parsed : [parsed]);
  return renderPage(pugContent, layoutOpts);
}

/**
 * Convert YAML to Pug (without rendering)
 * @param {string} yamlContent - YAML string
 * @returns {string} Generated Pug content
 */
function yamlToPug(yamlContent) {
  const parsed = yaml.load(yamlContent);
  return yamlNodeToPug(Array.isArray(parsed) ? parsed : [parsed]);
}

function indent(str, level) {
  const pad = '  '.repeat(level);
  return str.split('\n').map(line => line ? pad + line : line).join('\n');
}

module.exports = {
  renderPug,
  renderPage,
  renderYaml,
  yamlToPug,
  isComponent,
  compileCss: (...args) => require('./css').compileCss(...args),
};
