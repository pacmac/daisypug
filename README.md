# DaisyPug

A Node.js render engine that wraps every [DaisyUI](https://daisyui.com/) v5 component as a composable [Pug](https://pugjs.org/) mixin. Write Pug or YAML, get production-ready HTML with full theme support.

## Features

- **65+ Pug mixins** covering all 62 DaisyUI components + 8 composite patterns
- **Two input formats** — Pug (full control) or YAML (declarative, easy to generate)
- **30+ themes** — DaisyUI theme switching with zero code changes
- **CSS compilation** — CDN mode for dev, compiled Tailwind+DaisyUI for production
- **CLI** — render, convert, and build from the command line
- **Client-side API** (dp.js) — programmatic component interaction with events, methods, and properties
- **Form API** — typed getters/setters, validation, dirty checking, API loading/saving
- **Ajax** — built-in fetch wrappers with JSON handling
- **Help dashboard** — interactive docs with 72 component pages and 8 guides

## Quick Start

```bash
pnpm add github:pacmac/daisypug
```

Create `page.pug`:

```pug
+navbar({class: 'bg-base-100 shadow-sm'})
  +navbar-start
    +btn({style: 'ghost', text: 'MyApp', class: 'text-xl'})
  +navbar-end
    +btn({color: 'primary', text: 'Login'})

+hero({class: 'min-h-screen bg-base-200'})
  +hero-content({class: 'text-center'})
    h1.text-5xl.font-bold Hello World
    p.py-6 Built with DaisyPug
    +btn({color: 'primary', size: 'lg', text: 'Get Started'})
```

Render:

```bash
npx daisypug render page.pug --theme light -o page.html
```

## Usage

### CLI

```bash
# Render Pug to HTML
daisypug render page.pug --theme dark --title "My Page"

# Render YAML to HTML
daisypug render page.yaml -o output.html

# Production build (self-contained, no CDN)
daisypug render page.pug --css local --minify -o production.html

# Include component API for interactive pages
daisypug render page.pug --api -o app.html

# Convert YAML to Pug
daisypug convert page.yaml -o page.pug

# Pipe from stdin
echo '+btn({text: "Hi", color: "primary"})' | daisypug render -f pug --fragment
```

### Node.js API

```js
const { renderPage, renderYaml, renderPug, compileCss } = require('daisypug');

// Render Pug to full HTML page
const html = renderPage('+btn({text: "Click", color: "primary"})', {
  title: 'My Page',
  theme: 'dark',
});

// Render YAML
const html2 = renderYaml('- btn: {color: primary, text: Click}');

// Self-contained (compiled CSS inlined)
const html3 = await renderPage(pugContent, { css: 'local' });

// With component API included
const html4 = renderPage(pugContent, { api: true });
```

### YAML Input

```yaml
- navbar:
    opts:
      class: bg-base-100 shadow-sm
    children:
      - navbar-start:
          children:
            - btn: {style: ghost, text: MyApp}
      - navbar-end:
          children:
            - btn: {color: primary, text: Login}

- hero:
    opts:
      class: min-h-screen bg-base-200
    children:
      - hero-content:
          opts: {class: text-center}
          children:
            - h1: {class: text-5xl font-bold, text: Hello World}
            - btn: {color: primary, text: Get Started}
```

## Components

### Base Components (DaisyUI v5)

All 62 DaisyUI components with `dp-{name}` class hooks for API access:

| Category | Components |
|----------|-----------|
| **Actions** | btn, dropdown, modal, swap, theme-controller, fab |
| **Data Display** | accordion, avatar, badge, card, carousel, chat, collapse, countdown, diff, kbd, list, stat, status, table, timeline |
| **Data Input** | checkbox, fieldset, file-input, filter, input, label, radio, range, rating, select, textarea, toggle |
| **Navigation** | breadcrumbs, dock, link, menu, navbar, pagination, steps, tabs |
| **Feedback** | alert, loading, progress, radial-progress, skeleton, toast, tooltip |
| **Layout** | divider, drawer, footer, hero, indicator, join, mask, stack |
| **Mockup** | mockup-browser, mockup-code, mockup-phone, mockup-window |

### Composite Mixins (dp- prefix)

Higher-level patterns built on base components:

```pug
//- Form field: label + input pair
+dp-formfield('Email', {type: 'email', color: 'primary', placeholder: 'you@example.com'})

//- Form card: card with auto-generated form
+dp-formcard('Sign Up', {color: 'primary'}, [
  {label: 'Name', required: true},
  {label: 'Email', type: 'email'},
  {label: 'Role', as: 'select', options: ['Admin', 'User']},
], {submit: 'Create'})

//- Navigation bar
+dp-nav('MyApp', {items: ['Home', 'About'], themes: ['light', 'dark']})

//- Data table with pagination
+dp-datatable({headers: ['Name', 'Age'], rows: data, pagination: {current: 1, total: 5}})

//- Chat conversation
+dp-conversation([
  {from: 'Alice', text: 'Hello!', position: 'start', color: 'primary'},
  {from: 'Bob', text: 'Hi there', position: 'end'},
])

//- Modal with form
+dp-modalform('edit-user', 'Edit User', {color: 'primary'}, fields, {submit: 'Save'})

//- Hero with CTA buttons
+dp-herocta({title: 'Welcome', primary: {text: 'Start', color: 'primary'}})

//- Full page layout with sidebar
+dp-pagelayout({brand: 'App', nav: ['Home'], sidebar: ['Dashboard', 'Settings']})
  h1 Content here
```

## Client-Side API (dp.js)

Include with `--api` flag. Zero dependencies, auto-discovers components via `dp-` class hooks.

```js
dp.on('ready', () => {
  // Find components
  dp('#my-btn').onClick((e, btn) => console.log('clicked'));
  dp('#email').onChange(val => console.log(val));

  // Tables
  dp('#users').loadData('/api/users');
  dp('#users').onRowClick(({data}) => dp('#modal').open());

  // Modals
  dp('#edit-modal').open();
  dp('#edit-modal').close();

  // Tabs
  dp('#my-tabs').setActive(2);
  dp('#my-tabs').onTabChange(({index}) => console.log(index));

  // Steps
  dp('#wizard').next();

  // Theme
  dp.findAll('.dp-theme-controller')[0].onThemeChange(t => console.log(t));
});
```

### Form API

```js
const form = dp.form('#my-fieldset');

// Typed getters/setters
form.get.text('email');
form.get.select('country');
form.get.checkbox('agree');
form.set.text('email', 'alice@example.com')
    .set.checkbox('agree', true);

// Bulk operations
form.getData();                      // {email: '...', agree: true}
form.setData({email: '...', agree: true});

// Validation with custom rules
form.rules({
  email: v => v.includes('@') || 'Invalid email',
  password: v => v.length >= 8 || 'Min 8 chars',
});
const { valid, errors } = form.validate();
form.errors();                       // show inline errors
form.clearErrors();

// API integration
await form.load('/api/user/1');      // GET + populate fields
await form.save('/api/user/1');      // POST form data
form.autoSave('/api/user/1', 2000);  // debounced auto-save

// Reactivity
form.watch('email', val => console.log(val));
form.computed('fullName', data => `${data.first} ${data.last}`);

// State
form.snapshot();
form.isDirty();                      // true if changed
form.disable() / form.enable();
form.showField('advanced') / form.hideField('advanced');

// Serialization
form.toFormData();                   // for file uploads
form.toQueryString();                // URL params
form.serialize() / form.deserialize(json);
```

### Table Pagination

Client-side or server-side, with built-in parsers for common API response formats:

```js
// Client-side: all data in browser, pages sliced locally
const table = dp('.dp-datatable');
table.paginate({ pageSize: 20 });

// Server-side: fetch each page from API
table.loadData('/api/users', {
  pagination: true,
  pageSize: 20,
});
// → GET /api/users?page=1&limit=20

// Custom response format: { total: 500, rows: [...] }
table.loadData('/api/users', {
  pagination: true,
  parse: (data) => ({ rows: data.items, total: data.totalCount }),
});

// Built-in parsers for common API formats
table.paginate({ url: '/api/users', parse: DpDataTable.parsers.default }); // {rows, total}
table.paginate({ url: '/api/users', parse: DpDataTable.parsers.meta });    // {data, meta:{total}}
table.paginate({ url: '/api/users', parse: DpDataTable.parsers.spring });  // {content, totalElements}
table.paginate({ url: '/api/users', parse: DpDataTable.parsers.array });   // [] + x-total header

// Navigation
table.nextPage() / table.prevPage();
table.setPage(3) / table.firstPage() / table.lastPage();
table.getPageCount() / table.getTotalRows();
table.setPageSize(50);
table.onPageChange(({page, total}) => console.log(page));
```

### Ajax

```js
dp.baseUrl('/api');
dp.headers({ 'Authorization': 'Bearer ' + token });

const users = await dp.fetchJson('/users');
await dp.post('/users', { name: 'Alice' });
await dp.put('/users/1', data);
await dp.delete('/users/1');

// Component-level
dp('#widget').load('/api/widget');
dp('#table').loadData('/api/users');
dp('#form').submit('/api/save');
```

## CSS Modes

| Mode | Flag | Output | Use Case |
|------|------|--------|----------|
| CDN | `--css cdn` (default) | Small HTML, loads from CDN | Development |
| Local | `--css local` | Self-contained, all CSS inlined | Production |

```bash
# Dev (fast, needs internet)
daisypug render page.pug

# Production (no external deps)
daisypug render page.pug --css local --minify -o dist/page.html
```

## Themes

All 30+ DaisyUI themes work out of the box:

```bash
daisypug render page.pug --theme dark
daisypug render page.pug --theme cupcake
daisypug render page.pug --theme synthwave
```

Runtime theme switching:

```pug
+theme-radios({themes: ['light', 'dark', 'cupcake'], as: 'btn', active: 'light'})
```

## Help Dashboard

Interactive documentation with all components and guides:

```bash
node help/server.js 8080
# Open http://0.0.0.0:8080/
```

- 72 component docs with usage, code examples, and rendered output
- 8 guides: getting started, CLI, YAML schema, themes, CSS compilation, component API, form API, ajax

## Project Structure

```
daisypug/
  bin/daisypug.js          # CLI
  lib/
    engine.js              # Core render engine
    css.js                 # Tailwind/DaisyUI CSS compiler
    dp.js                  # Client-side component API (~2000 lines)
  mixins/                  # 65+ Pug mixin files
    btn.pug, card.pug, ...
    dp-formfield.pug, dp-nav.pug, ...
    index.pug              # includes all mixins
  layouts/
    base.pug               # HTML page layout
  examples/
    showcase.pug / .yaml   # Full demo pages
  help/
    server.js              # Help dashboard server
    shell.pug              # Dashboard UI
    content/
      components/          # 72 component .md docs
      guides/              # 8 guide .md docs
  components.yaml          # DaisyUI component catalog
  api-design.md            # Full API design spec
  index.js                 # Library entry point
```

## Dependencies

- [Pug](https://pugjs.org/) v3 — template engine
- [DaisyUI](https://daisyui.com/) v5 — component CSS
- [Tailwind CSS](https://tailwindcss.com/) v4 — utility CSS
- [Commander](https://github.com/tj/commander.js) — CLI framework
- [js-yaml](https://github.com/nodeca/js-yaml) — YAML parser
- [marked](https://github.com/markedjs/marked) — Markdown parser (help docs)
- [PostCSS](https://postcss.org/) — CSS compilation

## License

ISC
