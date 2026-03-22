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

  // Serve static files: /dp/dp.js, /dp/dp.css
  const express = require('express');
  app.use(prefix, express.static(paths.publicDir));
  // Also serve dp.js from lib/
  app.get(`${prefix}/dp.js`, (req, res) => {
    res.type('application/javascript').sendFile(paths.dpJs);
  });

  // Add mixins path to Pug basedir for absolute includes
  const viewDirs = [].concat(app.get('views') || []);
  if (!viewDirs.includes(paths.mixins)) {
    app.set('views', [...viewDirs, paths.mixins]);
  }

  // Set Pug locals so templates can reference assets
  app.locals.dpCss = `${prefix}/dp.css`;
  app.locals.dpJs = includeApi ? `${prefix}/dp.js` : null;
  app.locals.dpLucide = includeLucide ? paths.lucideCDN : null;
  app.locals.dpVersion = paths.version;
  app.locals.dpMixinPath = paths.mixinIndex;

  // Pug needs basedir for absolute includes
  if (!app.locals.basedir) {
    app.locals.basedir = path.dirname(require.resolve('./package.json'));
  }
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
