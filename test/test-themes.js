const { renderPug, renderPage } = require('../lib/engine');

console.log('=== Test 1: Theme-controller toggle ===\n');

const togglePug = `+theme-controller({value: 'dark', as: 'toggle'})`;
const toggleHtml = renderPug(togglePug);
console.log('Pug:', togglePug);
console.log('HTML:', toggleHtml);

const expected1 = toggleHtml.includes('class="theme-controller toggle"') &&
  toggleHtml.includes('value="dark"') &&
  toggleHtml.includes('type="checkbox"');
console.log('PASS:', expected1);
console.log();

console.log('=== Test 2: Theme-controller radio ===\n');

const radioPug = `+theme-controller({value: 'retro', as: 'radio', name: 'my-theme', color: 'primary'})`;
const radioHtml = renderPug(radioPug);
console.log('Pug:', radioPug);
console.log('HTML:', radioHtml);

const expected2 = radioHtml.includes('theme-controller') &&
  radioHtml.includes('radio') &&
  radioHtml.includes('radio-primary') &&
  radioHtml.includes('type="radio"') &&
  radioHtml.includes('name="my-theme"');
console.log('PASS:', expected2);
console.log();

console.log('=== Test 3: Theme radios convenience mixin ===\n');

const radiosPug = `+theme-radios({themes: ['light', 'dark', 'cupcake'], active: 'light'})`;
const radiosHtml = renderPug(radiosPug);
console.log('Pug:', radiosPug);
console.log('HTML:', radiosHtml);

const expected3 = radiosHtml.includes('value="light"') &&
  radiosHtml.includes('value="dark"') &&
  radiosHtml.includes('value="cupcake"') &&
  (radiosHtml.match(/theme-controller/g) || []).length === 3;
console.log('PASS:', expected3);
console.log();

console.log('=== Test 4: data-theme on page ===\n');

const pageHtml = renderPage(
  `+btn({text: 'Hello', color: 'primary'})`,
  { theme: 'dark', title: 'Theme Test' }
);
const expected4 = pageHtml.includes('data-theme="dark"');
console.log('data-theme="dark" present:', expected4);
console.log();

console.log('=== Test 5: No theme (default) ===\n');

const defaultHtml = renderPage(
  `+btn({text: 'Hello', color: 'primary'})`,
  { title: 'No Theme' }
);
const expected5 = !defaultHtml.includes('data-theme=');
console.log('No data-theme attribute:', expected5);
console.log();

console.log('=== Test 6: Full page with theme switcher ===\n');

const fullPug = `+navbar({class: 'bg-base-100 shadow-sm'})
  +navbar-start
    +btn({style: 'ghost', text: 'DaisyPug', class: 'text-xl'})
  +navbar-end
    +theme-radios({themes: ['light', 'dark', 'cupcake'], as: 'btn', active: 'light'})
+card({style: 'border', class: 'w-96 mx-auto mt-8'})
  +card-body
    +card-title({text: 'Theme Demo'})
    p This page supports theme switching
    +card-actions({class: 'justify-end'})
      +btn({color: 'primary', text: 'Action'})`;

const fullHtml = renderPage(fullPug, { title: 'Theme Demo', theme: 'light' });
console.log('Full page (first 1000 chars):');
console.log(fullHtml.slice(0, 1000));

const expected6 = fullHtml.includes('data-theme="light"') &&
  fullHtml.includes('theme-controller') &&
  fullHtml.includes('value="dark"') &&
  fullHtml.includes('value="cupcake"') &&
  fullHtml.includes('btn btn-primary');
console.log('\nPASS:', expected6);
console.log();

const allPassed = expected1 && expected2 && expected3 && expected4 && expected5 && expected6;
console.log(allPassed ? '=== All theme tests passed! ===' : '=== SOME TESTS FAILED ===');
process.exit(allPassed ? 0 : 1);
