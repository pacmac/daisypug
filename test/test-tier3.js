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

// Modal
test('modal with box and actions',
  `+modal({id: 'test_modal'})\n  +modal-box\n    h3 Hello\n    +modal-action\n      form(method="dialog")\n        +btn({text: 'Close'})`,
  [
    ['is dialog', h => h.includes('<dialog')],
    ['has id', h => h.includes('id="test_modal"')],
    ['has modal class', h => h.includes('class="dp-modal modal"')],
    ['has modal-box', h => h.includes('modal-box')],
    ['has modal-action', h => h.includes('modal-action')],
    ['has backdrop', h => h.includes('modal-backdrop')],
  ]);

test('modal without backdrop',
  `+modal({id: 'no_bg', backdrop: false})\n  +modal-box\n    p Content`,
  [['no backdrop', h => !h.includes('modal-backdrop')]]);

// Dropdown
test('dropdown with content',
  `+dropdown\n  +dropdown-trigger({text: 'Click', class: 'btn m-1'})\n  +dropdown-content({class: 'menu bg-base-100 rounded-box z-1 w-52 p-2 shadow'})\n    li\n      a Item 1\n    li\n      a Item 2`,
  [
    ['is details', h => h.includes('<details')],
    ['has dropdown class', h => h.includes('class="dp-dropdown dropdown"')],
    ['has summary', h => h.includes('<summary')],
    ['has dropdown-content', h => h.includes('dropdown-content')],
  ]);

test('dropdown with position',
  `+dropdown({position: 'top', end: true})\n  +dropdown-trigger({text: 'Open'})`,
  [
    ['has dropdown-top', h => h.includes('dropdown-top')],
    ['has dropdown-end', h => h.includes('dropdown-end')],
  ]);

// Drawer
test('drawer with sidebar',
  `+drawer({id: 'my-drawer'})\n  +drawer-content\n    +drawer-button({for: 'my-drawer', text: 'Open'})\n  +drawer-side({for: 'my-drawer'})\n    +menu({class: 'bg-base-200 min-h-full w-80 p-4'})\n      +menu-item\n        a Home`,
  [
    ['has drawer', h => h.includes('class="dp-drawer drawer"')],
    ['has toggle', h => h.includes('drawer-toggle')],
    ['has content', h => h.includes('drawer-content')],
    ['has side', h => h.includes('drawer-side')],
    ['has overlay', h => h.includes('drawer-overlay')],
    ['has drawer-button', h => h.includes('drawer-button')],
  ]);

// Tabs
test('tabs with content',
  `+tabs({style: 'lift'})\n  +tab({name: 'tabs1', label: 'Tab 1', active: true})\n  +tab-content\n    p Content 1\n  +tab({name: 'tabs1', label: 'Tab 2'})\n  +tab-content\n    p Content 2`,
  [
    ['has tabs class', h => h.includes('tabs tabs-lift')],
    ['has role tablist', h => h.includes('role="tablist"')],
    ['has tab inputs', h => (h.match(/role="tab"/g) || []).length === 2],
    ['has tab-content', h => (h.match(/dp-tab-content/g) || []).length === 2],
    ['has checked', h => h.includes('checked="checked"')],
  ]);

// Carousel
test('carousel with items',
  `+carousel({center: true, class: 'rounded-box'})\n  +carousel-item({id: 'slide1'})\n    img(src="/1.jpg")\n  +carousel-item({id: 'slide2'})\n    img(src="/2.jpg")`,
  [
    ['has carousel', h => h.includes('carousel carousel-center rounded-box')],
    ['has items', h => (h.match(/dp-carousel-item/g) || []).length === 2],
    ['has ids', h => h.includes('id="slide1"') && h.includes('id="slide2"')],
  ]);

// Menu
test('menu with items and title',
  `+menu({size: 'sm', class: 'bg-base-200 rounded-box w-56'})\n  +menu-title({text: 'Section'})\n  +menu-item({active: true})\n    a Dashboard\n  +menu-item\n    a Settings\n  +menu-dropdown({text: 'More'})\n    +menu-item\n      a Sub item`,
  [
    ['has menu class', h => h.includes('menu menu-sm')],
    ['has title', h => h.includes('menu-title')],
    ['has active', h => h.includes('menu-active')],
    ['has dropdown', h => h.includes('<details')],
    ['has summary', h => h.includes('<summary')],
  ]);

test('menu horizontal',
  `+menu({direction: 'horizontal'})\n  +menu-item\n    a Home`,
  [['has horizontal', h => h.includes('menu-horizontal')]]);

// Steps
test('steps with colors',
  `+steps\n  +step({color: 'primary', text: 'Register'})\n  +step({color: 'primary', text: 'Choose plan'})\n  +step({text: 'Purchase'})`,
  [
    ['has steps', h => h.includes('class="dp-steps steps"')],
    ['has step-primary', h => h.includes('step step-primary')],
    ['has plain step', h => h.includes('class="dp-step step"')],
    ['has text', h => h.includes('Register')],
  ]);

// Timeline
test('timeline',
  `+timeline({direction: 'vertical'})\n  +timeline-item\n    +timeline-start({text: '1984'})\n    +timeline-middle\n    +timeline-end({text: 'Event 1'})\n    +timeline-hr`,
  [
    ['has timeline', h => h.includes('timeline timeline-vertical')],
    ['has start', h => h.includes('timeline-start')],
    ['has middle', h => h.includes('timeline-middle')],
    ['has end', h => h.includes('timeline-end')],
    ['has hr', h => h.includes('<hr')],
  ]);

// Table
test('table with headers and rows',
  `+table({zebra: true, headers: ['Name', 'Age'], rows: [['Alice', '30'], ['Bob', '25']]})`,
  [
    ['has table class', h => h.includes('table table-zebra')],
    ['has thead', h => h.includes('<thead')],
    ['has th', h => h.includes('Name</th>')],
    ['has tbody', h => h.includes('<tbody')],
    ['has data', h => h.includes('Alice') && h.includes('30')],
  ]);

test('table with pin',
  `+table({pinRows: true, pinCols: true})`,
  [
    ['has pin-rows', h => h.includes('table-pin-rows')],
    ['has pin-cols', h => h.includes('table-pin-cols')],
  ]);

// Filter
test('filter with items',
  `+filter({name: 'my-filter', reset: 'All', items: ['Bug', 'Feature', 'Enhancement']})`,
  [
    ['has filter', h => h.includes('class="dp-filter filter"')],
    ['has reset', h => h.includes('filter-reset')],
    ['has items', h => h.includes('Bug') && h.includes('Feature')],
    ['has radios', h => (h.match(/type="radio"/g) || []).length === 4],
  ]);

// Calendar (minimal — just a wrapper)
test('calendar',
  `+calendar({class: 'p-4'})\n  div Calendar widget here`,
  [['has calendar', h => h.includes('class="dp-calendar calendar p-4"')]]);

// Accordion (uses collapse internally)
test('accordion with collapses',
  `+accordion\n  +collapse-checkbox({name: 'faq', arrow: true, class: 'bg-base-100 border'})\n    +collapse-title({text: 'Q1?'})\n    +collapse-content\n      p Answer 1\n  +collapse-checkbox({name: 'faq', arrow: true, class: 'bg-base-100 border'})\n    +collapse-title({text: 'Q2?'})\n    +collapse-content\n      p Answer 2`,
  [
    ['has collapses', h => (h.match(/collapse-arrow/g) || []).length === 2],
    ['has shared name', h => (h.match(/name="faq"/g) || []).length === 2],
    ['has titles', h => h.includes('Q1?') && h.includes('Q2?')],
  ]);

console.log(`\n${pass} passed, ${fail} failed out of ${pass + fail}`);
process.exit(fail > 0 ? 1 : 0);
