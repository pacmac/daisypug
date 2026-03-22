const path = require('path');
const fs = require('fs');

const ROOT = __dirname;
const engine = require('./lib/engine');

// Paths
const paths = {
  root: ROOT,
  mixins: path.join(ROOT, 'mixins'),
  mixinIndex: path.join(ROOT, 'mixins', 'index.pug'),
  dpJs: path.join(ROOT, 'lib', 'dp.js'),
  css: path.join(ROOT, 'public', 'dp.css'),
  publicDir: path.join(ROOT, 'public'),
  layouts: path.join(ROOT, 'layouts'),
  components: path.join(ROOT, 'components.yaml'),
  lucideCDN: 'https://unpkg.com/lucide@latest',
  version: require('./package.json').version,
};

/**
 * Setup DaisyPug with an Express app.
 *
 * @param {Express} app - Express app instance
 * @param {object} opts
 * @param {string} opts.prefix - URL prefix for static files (default: '/dp')
 * @param {boolean} opts.api - include dp.js (default: true)
 * @param {boolean} opts.lucide - include Lucide CDN (default: true)
 */
function setup(app, opts = {}) {
  const prefix = opts.prefix || '/dp';
  const includeApi = opts.api !== false;
  const includeLucide = opts.lucide !== false;

  // Serve dp.js and dp.css from memory — no static files needed
  const _cache = {};
  function readOnce(key, filePath) {
    if (!_cache[key]) _cache[key] = fs.readFileSync(filePath, 'utf8');
    return _cache[key];
  }

  // Pre-load into cache and log sizes
  const jsContent = readOnce('js', paths.dpJs);
  const cssContent = readOnce('css', paths.css);
  const jsKB = (Buffer.byteLength(jsContent) / 1024).toFixed(1);
  const cssKB = (Buffer.byteLength(cssContent) / 1024).toFixed(1);
  console.log(`[daisypug] v${paths.version} loaded — dp.js: ${jsKB}KB, dp.css: ${cssKB}KB (in-memory at ${prefix}/)`);

  app.get(`${prefix}/dp.js`, (req, res) => {
    res.type('application/javascript').send(_cache.js);
  });
  app.get(`${prefix}/dp.css`, (req, res) => {
    res.type('text/css').send(_cache.css);
  });

  // Pre-compile all DaisyPug mixin AST nodes (once at startup)
  const pug = require('pug');
  const mixinSrc = fs.readFileSync(paths.mixinIndex, 'utf8');
  const _mixinNodes = [];
  pug.compile(mixinSrc, {
    filename: paths.mixinIndex,
    basedir: paths.root,
    plugins: [{
      preCodeGen(ast) {
        (function walk(nodes) {
          for (const n of nodes) {
            if (n.type === 'Mixin' && n.call === false) _mixinNodes.push(n);
            if (n.nodes) walk(n.nodes);
            if (n.block && n.block.nodes) walk(n.block.nodes);
          }
        })(ast.nodes);
        return ast;
      }
    }]
  });
  console.log(`[daisypug] ${_mixinNodes.length} mixins compiled into AST`);

  // Pug plugin that injects mixin definitions into every template
  const dpPlugin = {
    preCodeGen(ast) {
      ast.nodes = [..._mixinNodes, ...ast.nodes];
      return ast;
    }
  };

  // Override Pug engine — auto-inject mixins via AST, works with extends
  app.engine('pug', (filePath, options, callback) => {
    try {
      const fn = pug.compileFile(filePath, {
        ...options,
        filename: filePath,
        basedir: options.basedir || paths.root,
        plugins: [dpPlugin, ...(options.plugins || [])],
      });
      callback(null, fn(options));
    } catch (err) {
      callback(err);
    }
  });

  // Set Pug locals so templates can reference assets
  app.locals.basedir = paths.root;
  app.locals.dpCss = `${prefix}/dp.css`;
  app.locals.dpJs = includeApi ? `${prefix}/dp.js` : null;
  app.locals.dpLucide = includeLucide ? paths.lucideCDN : null;
  app.locals.dpVersion = paths.version;
  app.locals.dpMixinPath = paths.mixinIndex;
}

/**
 * Pug middleware — adds mixin path to Pug options.
 * For apps not using Express, call this to get the Pug options.
 */
function pugOptions(opts = {}) {
  return {
    basedir: paths.root,
    // App should add this to their Pug render options
  };
}

module.exports = {
  // Express integration
  setup,
  pugOptions,

  // Paths for manual wiring
  paths,
  ...paths,

  // Engine (standalone render — CLI, SSG)
  ...engine,
};
