const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CLI = path.join(__dirname, '..', 'bin', 'daisypug.js');
const EXAMPLES = path.join(__dirname, '..', 'examples');
const TMP = path.join(__dirname, '..', 'test-output');

let pass = 0;
let fail = 0;

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: 'utf8', timeout: 10000, ...opts });
  } catch (e) {
    if (opts.expectFail) return e.stderr || e.message;
    throw e;
  }
}

function test(name, fn) {
  try {
    fn();
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

// --- Tests ---

test('--help shows usage', () => {
  const out = run(`node ${CLI} --help`);
  assert(out.includes('DaisyUI component render engine'), 'missing description');
  assert(out.includes('render'), 'missing render command');
  assert(out.includes('convert'), 'missing convert command');
});

test('--version shows version', () => {
  const out = run(`node ${CLI} --version`);
  assert(out.trim() === '1.0.0', `expected 1.0.0, got ${out.trim()}`);
});

test('render .pug file', () => {
  const out = run(`node ${CLI} render ${EXAMPLES}/showcase.pug --title "Test"`);
  assert(out.includes('<!DOCTYPE html>'), 'missing doctype');
  assert(out.includes('DaisyPug'), 'missing content');
  assert(out.includes('btn'), 'missing button classes');
});

test('render .yaml file', () => {
  const out = run(`node ${CLI} render ${EXAMPLES}/showcase.yaml --title "Test"`);
  assert(out.includes('<!DOCTYPE html>'), 'missing doctype');
  assert(out.includes('DaisyPug'), 'missing content');
});

test('render with --theme', () => {
  const out = run(`node ${CLI} render ${EXAMPLES}/showcase.pug --theme dark`);
  assert(out.includes('data-theme="dark"'), 'missing dark theme');
});

test('render with --fragment (no layout)', () => {
  const out = run(`node ${CLI} render ${EXAMPLES}/showcase.pug --fragment`);
  assert(!out.includes('<!DOCTYPE html>'), 'should not have doctype in fragment mode');
  assert(out.includes('navbar'), 'should have component output');
});

test('render with --output flag', () => {
  const outFile = path.join(TMP, 'cli-test-output.html');
  run(`node ${CLI} render ${EXAMPLES}/showcase.pug --title "CLI Test" -o ${outFile}`);
  assert(fs.existsSync(outFile), 'output file not created');
  const content = fs.readFileSync(outFile, 'utf8');
  assert(content.includes('CLI Test'), 'output file missing title');
  fs.unlinkSync(outFile);
});

test('render stdin pipe (pug)', () => {
  const out = run(`echo '+btn({text: "Hello", color: "primary"})' | node ${CLI} render -f pug --fragment`);
  assert(out.includes('btn btn-primary'), 'missing button class');
  assert(out.includes('Hello'), 'missing text');
});

test('render stdin pipe (yaml)', () => {
  const out = run(`echo '- btn: {color: primary, text: Hello}' | node ${CLI} render -f yaml --fragment`);
  assert(out.includes('btn btn-primary'), 'missing button class');
});

test('convert yaml to pug', () => {
  const out = run(`echo '- btn: {color: primary, text: Click}' | node ${CLI} convert`);
  assert(out.includes('+btn'), 'missing mixin call');
  assert(out.includes('primary'), 'missing color');
});

test('convert file to pug', () => {
  const out = run(`node ${CLI} convert ${EXAMPLES}/showcase.yaml`);
  assert(out.includes('+navbar'), 'missing navbar mixin');
  assert(out.includes('+btn'), 'missing btn mixin');
  assert(out.includes('+hero'), 'missing hero mixin');
});

test('convert with --output', () => {
  const outFile = path.join(TMP, 'cli-test-convert.pug');
  run(`node ${CLI} convert ${EXAMPLES}/showcase.yaml -o ${outFile}`);
  assert(fs.existsSync(outFile), 'output file not created');
  const content = fs.readFileSync(outFile, 'utf8');
  assert(content.includes('+navbar'), 'output missing navbar');
  fs.unlinkSync(outFile);
});

test('error: missing file', () => {
  try {
    execSync(`node ${CLI} render nonexistent.pug`, { encoding: 'utf8', stdio: 'pipe' });
    throw new Error('should have thrown');
  } catch (e) {
    const output = (e.stderr || '') + (e.stdout || '');
    assert(output.includes('File not found'), `missing error message, got: ${output}`);
  }
});

test('error: unknown format', () => {
  try {
    execSync(`node ${CLI} render ${EXAMPLES}/showcase.yaml --format xyz`, { encoding: 'utf8', stdio: 'pipe' });
    throw new Error('should have thrown');
  } catch (e) {
    const output = (e.stderr || '') + (e.stdout || '');
    assert(output.includes('Unknown format'), `missing error message, got: ${output}`);
  }
});

test('render showcase.pug produces valid HTML', () => {
  const out = run(`node ${CLI} render ${EXAMPLES}/showcase.pug --theme light --title "Showcase"`);
  assert(out.includes('<html'), 'missing html tag');
  assert(out.includes('</html>'), 'missing closing html');
  assert(out.includes('navbar'), 'missing navbar');
  assert(out.includes('hero'), 'missing hero');
  assert(out.includes('card'), 'missing card');
  assert(out.includes('stat'), 'missing stat');
  assert(out.includes('footer'), 'missing footer');
  assert(out.includes('theme-controller'), 'missing theme controller');
});

test('render showcase.yaml produces valid HTML', () => {
  const out = run(`node ${CLI} render ${EXAMPLES}/showcase.yaml --theme light --title "Showcase"`);
  assert(out.includes('<html'), 'missing html tag');
  assert(out.includes('navbar'), 'missing navbar');
  assert(out.includes('hero'), 'missing hero');
  assert(out.includes('card'), 'missing card');
  assert(out.includes('footer'), 'missing footer');
});

test('format auto-detection from extension', () => {
  // .pug → renders as pug
  const pugOut = run(`node ${CLI} render ${EXAMPLES}/showcase.pug --fragment`);
  assert(pugOut.includes('navbar'), 'pug detection failed');

  // .yaml → renders as yaml
  const yamlOut = run(`node ${CLI} render ${EXAMPLES}/showcase.yaml --fragment`);
  assert(yamlOut.includes('navbar'), 'yaml detection failed');
});

console.log(`\n${pass} passed, ${fail} failed out of ${pass + fail}`);
process.exit(fail > 0 ? 1 : 0);
