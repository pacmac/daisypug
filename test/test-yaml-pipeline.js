const { renderYaml, yamlToPug } = require('../lib/engine');

let pass = 0;
let fail = 0;

function test(name, yamlStr, checks) {
  try {
    const pug = yamlToPug(yamlStr);
    const html = renderYaml(yamlStr, { title: 'Test' });
    const results = checks.map(([desc, fn]) => {
      const ok = fn(html, pug);
      if (!ok) console.log(`  FAIL: ${desc}\n  PUG: ${pug.trim().slice(0, 200)}\n  HTML: ${html.trim().slice(0, 300)}`);
      return ok;
    });
    const allOk = results.every(Boolean);
    console.log(`${allOk ? 'PASS' : 'FAIL'}: ${name}`);
    if (allOk) pass++; else fail++;
  } catch (e) {
    console.log(`FAIL: ${name} — ${e.message}`);
    fail++;
  }
}

// Tier 1: flat via YAML
test('YAML btn shorthand',
  `- btn: Click me`,
  [
    ['generates mixin call', (h, p) => p.includes('+btn')],
    ['renders button', h => h.includes('<button') && h.includes('btn')],
    ['has text', h => h.includes('Click me')],
  ]);

test('YAML btn with opts',
  `- btn:\n    color: primary\n    size: lg\n    text: Submit`,
  [
    ['has primary', h => h.includes('btn-primary')],
    ['has lg', h => h.includes('btn-lg')],
    ['has text', h => h.includes('Submit')],
  ]);

test('YAML badge',
  `- badge:\n    color: info\n    text: New`,
  [['has badge class', h => h.includes('badge-info')]]);

test('YAML input',
  `- input:\n    color: primary\n    attrs:\n      placeholder: Email`,
  [['has input class', h => h.includes('input-primary')]]);

// Tier 2: container via YAML
test('YAML card with nesting',
  `- card:\n    opts:\n      style: border\n    children:\n      - card-body:\n          children:\n            - card-title:\n                text: Hello\n            - p: World\n            - card-actions:\n                children:\n                  - btn:\n                      color: primary\n                      text: OK`,
  [
    ['has card', h => h.includes('card card-border')],
    ['has card-body', h => h.includes('card-body')],
    ['has card-title', h => h.includes('card-title')],
    ['has button', h => h.includes('btn btn-primary')],
  ]);

test('YAML alert',
  `- alert:\n    color: warning\n    text: Watch out!`,
  [['has alert', h => h.includes('alert-warning')]]);

test('YAML stats',
  `- stats:\n    children:\n      - stat:\n          children:\n            - stat-value:\n                text: "42"`,
  [
    ['has stats', h => h.includes('class="stats"')],
    ['has value', h => h.includes('42')],
  ]);

// Tier 3: nested via YAML
test('YAML navbar',
  `- navbar:\n    opts:\n      class: bg-base-100\n    children:\n      - navbar-start:\n          children:\n            - btn:\n                style: ghost\n                text: Logo\n      - navbar-end:\n          children:\n            - btn:\n                color: primary\n                text: Login`,
  [
    ['has navbar', h => h.includes('class="navbar')],
    ['has start', h => h.includes('navbar-start')],
    ['has end', h => h.includes('navbar-end')],
    ['has buttons', h => h.includes('btn-ghost') && h.includes('btn-primary')],
  ]);

test('YAML modal',
  `- modal:\n    opts:\n      id: test-modal\n    children:\n      - modal-box:\n          children:\n            - h3: Title\n            - modal-action:\n                children:\n                  - btn:\n                      text: Close`,
  [
    ['has dialog', h => h.includes('<dialog')],
    ['has id', h => h.includes('test-modal')],
    ['has modal-box', h => h.includes('modal-box')],
  ]);

test('YAML tabs',
  `- tabs:\n    opts:\n      style: box\n    children:\n      - tab:\n          name: t1\n          label: Tab 1\n          active: true\n      - tab-content:\n          children:\n            - p: Content 1`,
  [
    ['has tabs', h => h.includes('tabs-box')],
    ['has tab-content', h => h.includes('tab-content')],
  ]);

test('YAML menu',
  `- menu:\n    opts:\n      class: bg-base-200 w-56\n    children:\n      - menu-title:\n          text: Navigation\n      - menu-item:\n          children:\n            - a: Home`,
  [
    ['has menu', h => h.includes('class="menu')],
    ['has title', h => h.includes('menu-title')],
  ]);

// Mixed raw HTML + components
test('YAML mixed content',
  `- div:\n    class: p-8\n    children:\n      - h1:\n          class: text-3xl font-bold\n          text: Welcome\n      - btn:\n          color: primary\n          text: Get Started`,
  [
    ['has div wrapper', h => h.includes('class="p-8"')],
    ['has h1', h => h.includes('text-3xl')],
    ['has button', h => h.includes('btn btn-primary')],
  ]);

console.log(`\n${pass} passed, ${fail} failed out of ${pass + fail}`);
process.exit(fail > 0 ? 1 : 0);
