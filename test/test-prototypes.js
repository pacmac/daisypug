const { renderPug, renderPage, renderYaml, yamlToPug } = require('../lib/engine');

console.log('=== Test 1: Button (Tier 1 - Flat) ===\n');

const btnPug = `+btn({text: 'Click me', color: 'primary', size: 'lg'})`;
const btnHtml = renderPug(btnPug);
console.log('Pug input:', btnPug);
console.log('HTML output:', btnHtml);
console.log();

console.log('=== Test 2: Button with attributes ===\n');

const btnAttrPug = `+btn({text: 'Submit', color: 'error', style: 'outline'})(type="submit" id="submit-btn")`;
const btnAttrHtml = renderPug(btnAttrPug);
console.log('Pug input:', btnAttrPug);
console.log('HTML output:', btnAttrHtml);
console.log();

console.log('=== Test 3: Card (Tier 2 - Container) ===\n');

const cardPug = `+card({style: 'border', class: 'w-96'})
  +card-body
    +card-title({text: 'Shoes!'})
    p If a dog chews shoes whose shoes does he choose?
    +card-actions({class: 'justify-end'})
      +btn({color: 'primary', text: 'Buy Now'})`;
const cardHtml = renderPug(cardPug);
console.log('Pug input:');
console.log(cardPug);
console.log('\nHTML output:', cardHtml);
console.log();

console.log('=== Test 4: Navbar (Tier 3 - Nested) ===\n');

const navPug = `+navbar({class: 'bg-base-100 shadow-sm'})
  +navbar-start
    +btn({style: 'ghost', text: 'DaisyPug', class: 'text-xl'})
  +navbar-center
    +btn({style: 'ghost', text: 'Home'})
    +btn({style: 'ghost', text: 'About'})
  +navbar-end
    +btn({color: 'primary', text: 'Sign In'})`;
const navHtml = renderPug(navPug);
console.log('Pug input:');
console.log(navPug);
console.log('\nHTML output:', navHtml);
console.log();

console.log('=== Test 5: Full page render ===\n');

const pageHtml = renderPage(
  `+navbar({class: 'bg-base-100 shadow-sm'})
  +navbar-start
    +btn({style: 'ghost', text: 'My App', class: 'text-xl'})
  +navbar-end
    +btn({color: 'primary', text: 'Login'})`,
  { title: 'My App', theme: 'light' }
);
console.log('Full page HTML (first 500 chars):');
console.log(pageHtml.slice(0, 500));
console.log();

console.log('=== Test 6: YAML → Pug conversion ===\n');

const yamlInput = `
- btn:
    color: primary
    size: lg
    text: Click me

- card:
    opts:
      style: border
      class: w-96
    children:
      - card-body:
          children:
            - card-title:
                text: "Shoes!"
            - p: "If a dog chews shoes whose shoes does he choose?"
            - card-actions:
                opts:
                  class: justify-end
                children:
                  - btn:
                      color: primary
                      text: Buy Now

- navbar:
    opts:
      class: bg-base-100 shadow-sm
    children:
      - navbar-start:
          children:
            - btn:
                style: ghost
                class: text-xl
                text: DaisyPug
      - navbar-center:
          children:
            - btn:
                style: ghost
                text: Home
            - btn:
                style: ghost
                text: About
      - navbar-end:
          children:
            - btn:
                color: primary
                text: Sign In
`;

console.log('YAML input:');
console.log(yamlInput);

const generatedPug = yamlToPug(yamlInput);
console.log('Generated Pug:');
console.log(generatedPug);
console.log();

console.log('=== Test 7: YAML → HTML (full pipeline) ===\n');

const yamlHtml = renderYaml(yamlInput, { title: 'YAML Test' });
console.log('YAML → HTML (first 800 chars):');
console.log(yamlHtml.slice(0, 800));
console.log();

console.log('=== All tests passed! ===');
