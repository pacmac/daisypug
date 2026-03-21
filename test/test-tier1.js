const { renderPug } = require('../lib/engine');

let pass = 0;
let fail = 0;

function test(name, pugStr, checks) {
  const html = renderPug(pugStr);
  const results = checks.map(([desc, fn]) => {
    const ok = fn(html);
    if (!ok) console.log(`  FAIL: ${desc}\n  HTML: ${html.trim()}`);
    return ok;
  });
  const allOk = results.every(Boolean);
  console.log(`${allOk ? 'PASS' : 'FAIL'}: ${name}`);
  if (allOk) pass++; else fail++;
}

test('badge with color and size',
  `+badge({text: 'New', color: 'info', size: 'sm'})`,
  [
    ['has badge class', h => h.includes('class="dp-badge badge badge-info badge-sm"')],
    ['has text', h => h.includes('New')],
    ['is span', h => h.includes('<span')],
  ]);

test('badge with style',
  `+badge({text: 'Draft', style: 'outline'})`,
  [['has outline', h => h.includes('badge-outline')]]);

test('link with color',
  `+link({text: 'Click here', color: 'primary', href: '/foo'})`,
  [
    ['has link class', h => h.includes('link link-primary')],
    ['has href', h => h.includes('href="/foo"')],
    ['is anchor', h => h.includes('<a')],
  ]);

test('link hover',
  `+link({text: 'Hover me', hover: true})`,
  [['has link-hover', h => h.includes('link-hover')]]);

test('kbd',
  `+kbd({text: 'Ctrl', size: 'lg'})`,
  [
    ['has kbd class', h => h.includes('kbd kbd-lg')],
    ['is kbd element', h => h.includes('<kbd')],
  ]);

test('loading spinner',
  `+loading({variant: 'spinner', size: 'lg'})`,
  [
    ['has loading class', h => h.includes('loading loading-spinner loading-lg')],
    ['is span', h => h.includes('<span')],
  ]);

test('loading dots with color',
  `+loading({variant: 'dots', color: 'primary'})`,
  [['has text-primary', h => h.includes('text-primary')]]);

test('progress with color',
  `+progress({color: 'primary', value: '70'})`,
  [
    ['has progress class', h => h.includes('progress progress-primary')],
    ['has value', h => h.includes('value="70"')],
    ['is progress element', h => h.includes('<progress')],
  ]);

test('skeleton',
  `+skeleton({class: 'h-4 w-full'})`,
  [['has skeleton class', h => h.includes('skeleton h-4 w-full')]]);

test('mask',
  `+mask({shape: 'hexagon'})`,
  [['has mask class', h => h.includes('mask mask-hexagon')]]);

test('status with color',
  `+status({color: 'success', size: 'sm'})`,
  [['has status class', h => h.includes('status status-success status-sm')]]);

test('toggle with color',
  `+toggle({color: 'primary'})`,
  [
    ['has toggle class', h => h.includes('toggle toggle-primary')],
    ['is checkbox', h => h.includes('type="checkbox"')],
  ]);

test('checkbox with color and size',
  `+checkbox({color: 'secondary', size: 'lg'})`,
  [
    ['has checkbox class', h => h.includes('checkbox checkbox-secondary checkbox-lg')],
    ['is checkbox', h => h.includes('type="checkbox"')],
  ]);

test('radio with name and value',
  `+radio({color: 'accent', name: 'choice', value: 'a'})`,
  [
    ['has radio class', h => h.includes('radio radio-accent')],
    ['has name', h => h.includes('name="choice"')],
    ['has value', h => h.includes('value="a"')],
  ]);

test('range with color',
  `+range({color: 'primary', value: '50'})`,
  [
    ['has range class', h => h.includes('range range-primary')],
    ['is range input', h => h.includes('type="range"')],
    ['has value', h => h.includes('value="50"')],
  ]);

test('input with color and placeholder',
  `+input({color: 'primary', size: 'lg', placeholder: 'Enter email'})`,
  [
    ['has input class', h => h.includes('input input-primary input-lg')],
    ['has placeholder', h => h.includes('placeholder="Enter email"')],
  ]);

test('input ghost style',
  `+input({style: 'ghost'})`,
  [['has ghost', h => h.includes('input-ghost')]]);

test('textarea with color',
  `+textarea({color: 'info', placeholder: 'Write here'})`,
  [
    ['has textarea class', h => h.includes('textarea textarea-info')],
    ['is textarea element', h => h.includes('<textarea')],
    ['has placeholder', h => h.includes('placeholder="Write here"')],
  ]);

test('select with options',
  `+select({color: 'primary', placeholder: 'Pick one', options: ['A', 'B', 'C']})`,
  [
    ['has select class', h => h.includes('select select-primary')],
    ['has placeholder option', h => h.includes('Pick one')],
    ['has options', h => h.includes('<option>A</option>')],
  ]);

test('file-input with color',
  `+file-input({color: 'secondary', size: 'sm'})`,
  [
    ['has file-input class', h => h.includes('file-input file-input-secondary file-input-sm')],
    ['is file input', h => h.includes('type="file"')],
  ]);

test('divider with text',
  `+divider({text: 'OR', color: 'primary'})`,
  [
    ['has divider class', h => h.includes('divider divider-primary')],
    ['has text', h => h.includes('OR')],
  ]);

test('radial-progress',
  `+radial-progress({value: 70, color: 'primary'})`,
  [
    ['has class', h => h.includes('radial-progress')],
    ['has --value', h => h.includes('--value:70')],
    ['shows percentage', h => h.includes('70%')],
  ]);

test('countdown',
  `+countdown({value: 42})`,
  [
    ['has countdown class', h => h.includes('countdown')],
    ['has --value', h => h.includes('--value:42')],
  ]);

console.log(`\n${pass} passed, ${fail} failed out of ${pass + fail}`);
process.exit(fail > 0 ? 1 : 0);
