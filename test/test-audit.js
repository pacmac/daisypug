const { renderPage } = require('../lib/engine');
const fs = require('fs');
const path = require('path');

// Audit 1: No hardcoded Tailwind colors in mixin files
const mixinDir = path.join(__dirname, '..', 'mixins');
const hardcodedColorPattern = /(bg|text|border)-(red|blue|green|yellow|purple|pink|orange|gray|slate|zinc|stone|amber|lime|emerald|teal|cyan|sky|indigo|violet|fuchsia|rose)-\d/;

let auditPass = true;
const mixinFiles = fs.readdirSync(mixinDir).filter(f => f.endsWith('.pug') && f !== 'index.pug');

console.log('=== Audit 1: No hardcoded Tailwind colors ===\n');
for (const file of mixinFiles) {
  const content = fs.readFileSync(path.join(mixinDir, file), 'utf8');
  const match = content.match(hardcodedColorPattern);
  if (match) {
    console.log(`FAIL: ${file} contains hardcoded color: ${match[0]}`);
    auditPass = false;
  }
}
console.log(auditPass ? 'PASS: All mixin files clean\n' : '\n');

// Audit 2: All mixins use &attributes
console.log('=== Audit 2: All mixins have &attributes ===\n');
let attrPass = true;
for (const file of mixinFiles) {
  const content = fs.readFileSync(path.join(mixinDir, file), 'utf8');
  const mixinDefs = content.match(/^mixin\s+\S+/gm) || [];
  // Check that each file that defines mixins has at least one &attributes
  if (mixinDefs.length > 0 && !content.includes('&attributes')) {
    console.log(`FAIL: ${file} defines mixins but has no &attributes`);
    attrPass = false;
  }
}
console.log(attrPass ? 'PASS: All mixin files have attribute passthrough\n' : '\n');

// Audit 3: Render a page with many components across 3 themes
console.log('=== Audit 3: Multi-theme rendering ===\n');

const componentShowcase = `
+navbar({class: 'bg-base-100 shadow-sm'})
  +navbar-start
    +btn({style: 'ghost', text: 'DaisyPug', class: 'text-xl'})
  +navbar-end
    +theme-radios({themes: ['light', 'dark', 'cupcake'], as: 'btn'})

+hero({class: 'py-12 bg-base-200'})
  +hero-content({class: 'text-center'})
    h1.text-4xl.font-bold Component Showcase
    p.py-4 Testing theme compliance

+divider({text: 'Buttons'})

div.flex.gap-2.p-4
  +btn({color: 'primary', text: 'Primary'})
  +btn({color: 'secondary', text: 'Secondary'})
  +btn({color: 'accent', text: 'Accent'})
  +btn({style: 'outline', color: 'info', text: 'Info Outline'})

+divider({text: 'Badges'})

div.flex.gap-2.p-4
  +badge({text: 'Info', color: 'info'})
  +badge({text: 'Success', color: 'success', style: 'outline'})
  +badge({text: 'Warning', color: 'warning', style: 'soft'})
  +badge({text: 'Error', color: 'error'})

+divider({text: 'Form'})

div.p-4.flex.flex-col.gap-2.max-w-md
  +input({color: 'primary', placeholder: 'Email'})
  +textarea({color: 'secondary', placeholder: 'Message'})
  +select({color: 'accent', placeholder: 'Pick one', options: ['A', 'B', 'C']})
  div.flex.gap-2
    +toggle({color: 'primary'})
    +checkbox({color: 'secondary'})
    +radio({color: 'accent', name: 'test'})

+divider({text: 'Card'})

+card({style: 'border', class: 'w-96 mx-auto'})
  +card-body
    +card-title({text: 'Theme Test'})
    p All colors should adapt to the active theme
    +card-actions({class: 'justify-end'})
      +btn({color: 'primary', text: 'Action'})

+divider({text: 'Alert'})

div.flex.flex-col.gap-2.p-4
  +alert({color: 'info', text: 'Info alert'})
  +alert({color: 'success', text: 'Success alert'})
  +alert({color: 'warning', text: 'Warning alert'})
  +alert({color: 'error', text: 'Error alert'})

+divider({text: 'Stats'})

+stats({class: 'shadow w-full'})
  +stat
    +stat-title({text: 'Downloads'})
    +stat-value({text: '31K'})
    +stat-desc({text: 'Jan - Feb'})
  +stat
    +stat-title({text: 'Users'})
    +stat-value({text: '4,200'})
    +stat-desc({text: '+12%'})

+divider({text: 'Progress'})

div.flex.flex-col.gap-2.p-4
  +progress({color: 'primary', value: '70'})
  +radial-progress({value: 70, color: 'primary'})
  +loading({variant: 'spinner', size: 'lg'})

+footer({center: true, class: 'p-4 bg-base-300 text-base-content'})
  p DaisyPug Theme Audit
`;

const themes = ['light', 'dark', 'cupcake'];
let themePass = true;

for (const theme of themes) {
  try {
    const html = renderPage(componentShowcase, { title: `Audit - ${theme}`, theme });

    // Verify theme is set
    if (!html.includes(`data-theme="${theme}"`)) {
      console.log(`FAIL: ${theme} — missing data-theme`);
      themePass = false;
      continue;
    }

    // Verify key DaisyUI classes are present (not stripped by theme)
    const requiredClasses = ['btn-primary', 'badge-info', 'input-primary', 'alert-success', 'card-border', 'progress-primary'];
    for (const cls of requiredClasses) {
      if (!html.includes(cls)) {
        console.log(`FAIL: ${theme} — missing class: ${cls}`);
        themePass = false;
      }
    }

    // Save HTML for manual inspection if needed
    const outDir = path.join(__dirname, '..', 'test-output');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
    fs.writeFileSync(path.join(outDir, `audit-${theme}.html`), html);

    console.log(`PASS: ${theme} — rendered successfully (${html.length} bytes → test-output/audit-${theme}.html)`);
  } catch (e) {
    console.log(`FAIL: ${theme} — render error: ${e.message}`);
    themePass = false;
  }
}

console.log();

const allPassed = auditPass && attrPass && themePass;
console.log(allPassed ? '=== All audits passed! ===' : '=== SOME AUDITS FAILED ===');
process.exit(allPassed ? 0 : 1);
