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

// Alert
test('alert with color and style',
  `+alert({color: 'warning', style: 'soft'})\n  span Check your input`,
  [
    ['has alert class', h => h.includes('alert alert-warning alert-soft')],
    ['has role', h => h.includes('role="alert"')],
    ['has content', h => h.includes('Check your input')],
  ]);

test('alert with text opt',
  `+alert({text: 'Saved!', color: 'success'})`,
  [
    ['has text in span', h => h.includes('<span>Saved!</span>')],
  ]);

// Collapse
test('collapse with arrow',
  `+collapse({arrow: true, class: 'bg-base-100'})\n  +collapse-title({text: 'Question'})\n  +collapse-content\n    p Answer here`,
  [
    ['has collapse-arrow', h => h.includes('collapse-arrow')],
    ['has title', h => h.includes('collapse-title')],
    ['has content', h => h.includes('collapse-content')],
    ['has tabindex', h => h.includes('tabindex="0"')],
  ]);

// Hero
test('hero with content',
  `+hero({class: 'min-h-screen bg-base-200'})\n  +hero-content({class: 'text-center'})\n    h1 Welcome`,
  [
    ['has hero class', h => h.includes('hero min-h-screen bg-base-200')],
    ['has hero-content', h => h.includes('hero-content text-center')],
    ['has heading', h => h.includes('Welcome')],
  ]);

// Stats
test('stats with stat children',
  `+stats({class: 'shadow'})\n  +stat\n    +stat-title({text: 'Views'})\n    +stat-value({text: '89K'})\n    +stat-desc({text: '+21%'})`,
  [
    ['has stats', h => h.includes('class="dp-stats stats shadow"')],
    ['has stat', h => h.includes('class="dp-stat stat"')],
    ['has title', h => h.includes('stat-title')],
    ['has value', h => h.includes('89K')],
    ['has desc', h => h.includes('+21%')],
  ]);

// Tooltip
test('tooltip',
  `+tooltip({tip: 'Hello', color: 'primary'})\n  +btn({text: 'Hover me'})`,
  [
    ['has tooltip class', h => h.includes('tooltip tooltip-primary')],
    ['has data-tip', h => h.includes('data-tip="Hello"')],
    ['has button child', h => h.includes('<button')],
  ]);

// Indicator
test('indicator with badge',
  `+indicator\n  +indicator-item\n    +badge({text: '99+', color: 'secondary'})\n  +btn({text: 'Inbox'})`,
  [
    ['has indicator', h => h.includes('class="dp-indicator indicator"')],
    ['has indicator-item', h => h.includes('indicator-item')],
  ]);

// Chat
test('chat bubble',
  `+chat({position: 'start'})\n  +chat-header({text: 'Alice'})\n  +chat-bubble({text: 'Hello!', color: 'primary'})\n  +chat-footer({text: 'Seen'})`,
  [
    ['has chat-start', h => h.includes('chat chat-start')],
    ['has header', h => h.includes('chat-header')],
    ['has bubble', h => h.includes('chat-bubble chat-bubble-primary')],
    ['has footer', h => h.includes('chat-footer')],
    ['has text', h => h.includes('Hello!')],
  ]);

// Swap
test('swap rotate',
  `+swap({rotate: true})\n  +swap-on({text: 'ON'})\n  +swap-off({text: 'OFF'})`,
  [
    ['has swap-rotate', h => h.includes('swap swap-rotate')],
    ['has checkbox', h => h.includes('type="checkbox"')],
    ['has on', h => h.includes('swap-on')],
    ['has off', h => h.includes('swap-off')],
  ]);

// Diff
test('diff',
  `+diff\n  +diff-item-1\n    | Before\n  +diff-item-2\n    | After`,
  [
    ['has diff', h => h.includes('class="dp-diff diff"')],
    ['has item-1', h => h.includes('diff-item-1')],
    ['has item-2', h => h.includes('diff-item-2')],
  ]);

// Fieldset
test('fieldset with legend',
  `+fieldset\n  +fieldset-legend({text: 'Personal Info'})\n  +input({placeholder: 'Name'})`,
  [
    ['is fieldset element', h => h.includes('<fieldset')],
    ['has legend', h => h.includes('fieldset-legend')],
    ['has text', h => h.includes('Personal Info')],
  ]);

// Join
test('join horizontal',
  `+join\n  +join-item\n    +btn({text: 'A'})\n  +join-item\n    +btn({text: 'B'})`,
  [
    ['has join', h => h.includes('class="dp-join join"')],
    ['has items', h => (h.match(/dp-join-item/g) || []).length === 2],
  ]);

// Stack
test('stack',
  `+stack\n  div Card 1\n  div Card 2`,
  [['has stack', h => h.includes('class="dp-stack stack"')]]);

// Toast
test('toast with position',
  `+toast({position: 'end bottom'})\n  +alert({text: 'Message sent', color: 'info'})`,
  [
    ['has toast classes', h => h.includes('toast toast-end toast-bottom')],
    ['has alert child', h => h.includes('alert')],
  ]);

// List
test('list with rows',
  `+list\n  +list-row({text: 'Item 1'})\n  +list-row({text: 'Item 2'})`,
  [
    ['is ul', h => h.includes('<ul')],
    ['has list class', h => h.includes('class="dp-list list"')],
    ['has rows', h => (h.match(/dp-list-row/g) || []).length === 2],
  ]);

// Dock
test('dock',
  `+dock\n  button Home\n  button About`,
  [['has dock', h => h.includes('class="dp-dock dock"')]]);

// Footer
test('footer with title',
  `+footer({center: true, class: 'p-4'})\n  +footer-title({text: 'Company'})`,
  [
    ['is footer element', h => h.includes('<footer')],
    ['has footer-center', h => h.includes('footer-center')],
    ['has title', h => h.includes('footer-title')],
  ]);

// Breadcrumbs
test('breadcrumbs with items',
  `+breadcrumbs({items: [{text: 'Home', href: '/'}, {text: 'Docs', href: '/docs'}, 'Current']})`,
  [
    ['has breadcrumbs', h => h.includes('class="dp-breadcrumbs breadcrumbs"')],
    ['has ul', h => h.includes('<ul')],
    ['has links', h => h.includes('href="/"')],
    ['has current', h => h.includes('Current')],
  ]);

// Mockup Browser
test('mockup-browser with url',
  `+mockup-browser({url: 'https://example.com', class: 'border border-base-300'})\n  div.p-4 Content`,
  [
    ['has class', h => h.includes('mockup-browser')],
    ['has toolbar', h => h.includes('mockup-browser-toolbar')],
    ['has url', h => h.includes('example.com')],
  ]);

// Mockup Code
test('mockup-code with lines',
  `+mockup-code({lines: ['npm install', {prefix: '>', text: 'done'}]})`,
  [
    ['has class', h => h.includes('mockup-code')],
    ['has pre', h => h.includes('<pre')],
    ['has code', h => h.includes('npm install')],
  ]);

// Mockup Phone
test('mockup-phone',
  `+mockup-phone\n  div.p-4 Screen content`,
  [
    ['has class', h => h.includes('mockup-phone')],
    ['has camera', h => h.includes('camera')],
    ['has display', h => h.includes('display')],
  ]);

// Mockup Window
test('mockup-window',
  `+mockup-window({class: 'border border-base-300'})\n  div.p-4 Content`,
  [['has class', h => h.includes('mockup-window')]]);

// Rating
test('rating with stars',
  `+rating({name: 'rating-1', stars: 5, value: 3})`,
  [
    ['has rating', h => h.includes('class="dp-rating rating"')],
    ['has inputs', h => (h.match(/type="radio"/g) || []).length === 5],
    ['has mask-star', h => h.includes('mask-star-2')],
  ]);

console.log(`\n${pass} passed, ${fail} failed out of ${pass + fail}`);
process.exit(fail > 0 ? 1 : 0);
