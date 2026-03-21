const { renderPage, renderYaml, compileCss } = require('../lib/engine');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CLI = path.join(__dirname, '..', 'bin', 'daisypug.js');
const EXAMPLES = path.join(__dirname, '..', 'examples');
const TMP = path.join(__dirname, '..', 'test-output');

let pass = 0;
let fail = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`PASS: ${name}`);
    pass++;
  } catch (e) {
    console.log(`FAIL: ${name}`);
    console.log(`  ${e.message}`);
    fail++;
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function run() {

  // compileCss standalone
  await test('compileCss returns CSS with DaisyUI classes', async () => {
    const html = '<button class="btn btn-primary">Hi</button><div class="card"><div class="card-body">X</div></div>';
    const css = await compileCss(html);
    assert(css.length > 1000, `CSS too short: ${css.length}`);
    assert(css.includes('.btn'), 'missing .btn');
    assert(css.includes('.card'), 'missing .card');
  });

  await test('compileCss includes Tailwind utilities', async () => {
    const html = '<div class="flex gap-4 p-8 text-center mx-auto">content</div>';
    const css = await compileCss(html);
    assert(css.includes('flex'), 'missing flex');
    assert(css.includes('gap-'), 'missing gap');
  });

  await test('compileCss includes theme variables', async () => {
    const html = '<html data-theme="dark"><button class="btn btn-primary">X</button></html>';
    const css = await compileCss(html);
    assert(css.includes('data-theme') || css.includes('--p'), 'missing theme support');
  });

  // renderPage with css: 'cdn' (default)
  await test('renderPage css:cdn has CDN links', async () => {
    const html = renderPage('+btn({text: "Hi"})', { css: 'cdn' });
    assert(html.includes('cdn.jsdelivr'), 'missing CDN links');
    assert(!html.includes('<style>'), 'should not have inline style');
  });

  await test('renderPage default is cdn', async () => {
    const html = renderPage('+btn({text: "Hi"})');
    assert(html.includes('cdn.jsdelivr'), 'default should be cdn');
  });

  // renderPage with css: 'local'
  await test('renderPage css:local has inline CSS', async () => {
    const html = await renderPage('+btn({text: "Hi", color: "primary"})', { css: 'local' });
    assert(html.includes('<style>'), 'missing <style> tag');
    assert(!html.includes('cdn.jsdelivr'), 'should not have CDN links');
    assert(html.includes('.btn'), 'CSS missing .btn class');
    assert(html.includes('<button'), 'missing button HTML');
  });

  await test('renderPage css:local with theme', async () => {
    const html = await renderPage('+btn({text: "Hi"})', { css: 'local', theme: 'dark' });
    assert(html.includes('data-theme="dark"'), 'missing theme');
    assert(html.includes('<style>'), 'missing style');
  });

  // renderYaml with css: 'local'
  await test('renderYaml css:local works', async () => {
    const html = await renderYaml('- btn: {color: primary, text: Click}', { css: 'local' });
    assert(html.includes('<style>'), 'missing style');
    assert(!html.includes('cdn.jsdelivr'), 'should not have CDN');
    assert(html.includes('.btn'), 'missing btn CSS');
  });

  // CLI --css local
  await test('CLI --css local produces self-contained HTML', async () => {
    const outFile = path.join(TMP, 'cli-local-test.html');
    execSync(`node ${CLI} render ${EXAMPLES}/showcase.pug --css local --title "CLI Local" -o ${outFile}`, {
      encoding: 'utf8',
      timeout: 30000,
    });
    const html = fs.readFileSync(outFile, 'utf8');
    assert(html.includes('<style>'), 'missing style tag');
    assert(!html.includes('cdn.jsdelivr'), 'should not have CDN');
    assert(html.includes('.btn'), 'missing btn CSS');
    assert(html.includes('.card'), 'missing card CSS');
    assert(html.includes('.navbar'), 'missing navbar CSS');
    assert(html.includes('navbar'), 'missing navbar HTML');
    fs.unlinkSync(outFile);
  });

  await test('CLI --css cdn still works', async () => {
    const html = execSync(`node ${CLI} render ${EXAMPLES}/showcase.pug --css cdn`, {
      encoding: 'utf8',
      timeout: 10000,
    });
    assert(html.includes('cdn.jsdelivr'), 'missing CDN links');
  });

  await test('CLI --css local with YAML', async () => {
    const outFile = path.join(TMP, 'cli-local-yaml.html');
    execSync(`node ${CLI} render ${EXAMPLES}/showcase.yaml --css local -o ${outFile}`, {
      encoding: 'utf8',
      timeout: 30000,
    });
    const html = fs.readFileSync(outFile, 'utf8');
    assert(html.includes('<style>'), 'missing style');
    assert(!html.includes('cdn.jsdelivr'), 'no CDN');
    fs.unlinkSync(outFile);
  });

  // Size comparison
  await test('local CSS is reasonable size', async () => {
    const html = await renderPage('+btn({text: "Hi", color: "primary"})', { css: 'local' });
    const cdnHtml = renderPage('+btn({text: "Hi", color: "primary"})');
    assert(html.length > cdnHtml.length, 'local should be larger (includes CSS)');
    assert(html.length < 500000, `local HTML too large: ${html.length}`);
    console.log(`    cdn: ${cdnHtml.length} bytes, local: ${html.length} bytes`);
  });

  console.log(`\n${pass} passed, ${fail} failed out of ${pass + fail}`);
  process.exit(fail > 0 ? 1 : 0);
}

run();
