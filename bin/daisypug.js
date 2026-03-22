#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const { renderPug, renderPage, renderYaml, yamlToPug } = require('../lib/engine');

const VERSION = require('../package.json').version;

program
  .name('daisypug')
  .description('DaisyUI component render engine — Pug/YAML → HTML')
  .version(VERSION);

// --- render command ---

program
  .command('render [file]')
  .description(`Render a Pug or YAML file to HTML

  Examples:
    daisypug render page.pug
    daisypug render page.yaml --theme dark --title "My Page"
    daisypug render page.pug --fragment
    daisypug render page.yaml -o output.html
    daisypug render page.pug --css local --title "Production"
    cat page.pug | daisypug render --format pug
    echo '+btn({text: "Hi", color: "primary"})' | daisypug render -f pug --fragment`)
  .option('-f, --format <fmt>', 'input format: pug, yaml (auto-detected from extension)')
  .option('-t, --theme <theme>', 'DaisyUI theme (e.g. light, dark, cupcake)')
  .option('--title <title>', 'page title', 'DaisyPug')
  .option('--lang <lang>', 'html lang attribute', 'en')
  .option('--css <mode>', 'CSS mode: cdn (default) or local (compiled Tailwind+DaisyUI)', 'cdn')
  .option('--minify', 'minify compiled CSS (only with --css local)')
  .option('--api', 'include dp.js component API for interactive pages')
  .option('--fragment', 'render without HTML layout wrapper')
  .option('-o, --output <file>', 'write output to file instead of stdout')
  .action(async (file, opts) => {
    try {
      const input = await readInput(file);
      const format = detectFormat(file, opts.format, input);
      const layoutOpts = {
        title: opts.title,
        theme: opts.theme,
        lang: opts.lang,
        css: opts.css,
        minify: opts.minify,
        api: opts.api,
      };

      let html;
      if (format === 'yaml') {
        if (opts.fragment) {
          const pugContent = yamlToPug(input);
          html = renderPug(pugContent);
        } else {
          html = await renderYaml(input, layoutOpts);
        }
      } else {
        if (opts.fragment) {
          html = renderPug(input);
        } else {
          html = await renderPage(input, layoutOpts);
        }
      }

      writeOutput(html, opts.output);
    } catch (err) {
      handleError(err);
    }
  });

// --- convert command ---

program
  .command('convert [file]')
  .description(`Convert YAML to Pug (no HTML rendering)

  Examples:
    daisypug convert page.yaml
    daisypug convert page.yaml -o page.pug
    cat page.yaml | daisypug convert`)
  .option('-o, --output <file>', 'write output to file instead of stdout')
  .action(async (file, opts) => {
    try {
      const input = await readInput(file);
      const pug = yamlToPug(input);
      writeOutput(pug, opts.output);
    } catch (err) {
      handleError(err);
    }
  });

// --- serve command ---

program
  .command('serve [dir]')
  .description(`Serve a directory of static files

  Examples:
    daisypug serve examples/
    daisypug serve examples/ --port 3000
    daisypug serve .`)
  .option('-p, --port <port>', 'port number', '8090')
  .action((dir, opts) => {
    const http = require('http');
    const serveDir = path.resolve(dir || '.');
    if (!fs.existsSync(serveDir) || !fs.statSync(serveDir).isDirectory()) {
      process.stderr.write(`Error: Not a directory: ${serveDir}\n`);
      process.exit(1);
    }

    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.pug': 'text/plain; charset=utf-8',
      '.yaml': 'text/plain; charset=utf-8',
      '.yml': 'text/plain; charset=utf-8',
    };

    const server = http.createServer((req, res) => {
      const url = new URL(req.url, `http://${req.headers.host}`);
      let filePath = path.join(serveDir, url.pathname === '/' ? 'index.html' : url.pathname);

      if (!fs.existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
        return;
      }

      if (fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
        if (!fs.existsSync(filePath)) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not found');
          return;
        }
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });

    const port = parseInt(opts.port, 10);
    server.listen(port, '0.0.0.0', () => {
      process.stderr.write(`Serving ${serveDir} at http://0.0.0.0:${port}/\n`);
    });
  });

// --- helpers ---

async function readInput(file) {
  if (file) {
    const resolved = path.resolve(file);
    if (!fs.existsSync(resolved)) {
      throw new UserError(`File not found: ${file}`);
    }
    return fs.readFileSync(resolved, 'utf8');
  }

  // Read from stdin
  if (process.stdin.isTTY) {
    throw new UserError('No input file specified and no data on stdin.\nUsage: daisypug render <file> or pipe input via stdin.');
  }

  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => data += chunk);
    process.stdin.on('end', () => {
      if (!data.trim()) {
        reject(new UserError('Empty input received on stdin.'));
      } else {
        resolve(data);
      }
    });
    process.stdin.on('error', reject);
  });
}

function detectFormat(file, explicit, content) {
  if (explicit) {
    const fmt = explicit.toLowerCase();
    if (['pug', 'yaml', 'yml'].includes(fmt)) {
      return fmt === 'yml' ? 'yaml' : fmt;
    }
    throw new UserError(`Unknown format: ${explicit}. Use 'pug' or 'yaml'.`);
  }

  if (file) {
    const ext = path.extname(file).toLowerCase();
    if (ext === '.pug') return 'pug';
    if (ext === '.yaml' || ext === '.yml') return 'yaml';
    throw new UserError(`Cannot detect format from extension '${ext}'. Use --format pug or --format yaml.`);
  }

  // Try to guess from content
  if (content.trimStart().startsWith('-') || content.trimStart().startsWith('#')) {
    return 'yaml';
  }
  if (content.includes('mixin ') || content.includes('+')) {
    return 'pug';
  }

  throw new UserError('Cannot auto-detect format from stdin. Use --format pug or --format yaml.');
}

function writeOutput(content, outputFile) {
  if (outputFile) {
    const resolved = path.resolve(outputFile);
    fs.writeFileSync(resolved, content, 'utf8');
    process.stderr.write(`Written to ${resolved}\n`);
  } else {
    process.stdout.write(content);
  }
}

class UserError extends Error {
  constructor(message) {
    super(message);
    this.isUserError = true;
  }
}

function handleError(err) {
  if (err.isUserError) {
    process.stderr.write(`Error: ${err.message}\n`);
    process.exit(1);
  }

  // YAML parse errors
  if (err.name === 'YAMLException') {
    process.stderr.write(`YAML parse error: ${err.message}\n`);
    process.exit(1);
  }

  // Pug compile errors
  if (err.code === 'PUG:') {
    process.stderr.write(`Pug compile error: ${err.message}\n`);
    process.exit(1);
  }

  // Unknown errors — show message but not full stack
  process.stderr.write(`Error: ${err.message}\n`);
  process.exit(1);
}

program.parse();
