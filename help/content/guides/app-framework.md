---
name: app-framework
title: Application Framework
description: Building dashboard apps with vsplit/hsplit, fitem, toolbar, and panels
category: Guides
order: 9
---

## Usage

DaisyPug includes application-level components for building full CRUD dashboards. These are evolved from the DUI (DaisyUI Interface) framework.

### Core Principle: No Body Scroll

Dashboard pages fill the viewport exactly. The body never scrolls. Only individual panel bodies scroll internally.

```pug
div.flex.flex-col.h-screen.overflow-hidden
  +dp-toolbar({title: 'My App', icon: 'layout-grid'})
  div.flex-1.min-h-0
    +dp-vsplit('300px')
      +dp-panel('west')
        //- sidebar (scrolls internally)
      +dp-panel('center')
        //- content (scrolls internally)
```

### Layout Components

| Mixin | Purpose |
|-------|---------|
| `+dp-vsplit(size)` | Side-by-side split (left \| right) |
| `+dp-hsplit(size)` | Stacked split (top \| bottom) |
| `+dp-panel(name, opts)` | Named panel with optional header |
| `+dp-toolbar(opts)` | Action bar with title, CRUD buttons |
| `+dp-toolbar-sep` | Vertical separator in toolbar |

### Form Components

| Mixin | Purpose |
|-------|---------|
| `+dp-form(opts)` | Form container (.two/.three/.four for columns) |
| `+dp-fitem(label, input)` | Auto-detecting form field |
| `+dp-group(title)` | Vertical section heading |
| `+dp-hgroup(title)` | Horizontal field group |
| `+dp-icon(name, opts)` | Lucide icon |

### Padding Rules

1. **Parent never sets child padding** — panel body has `padding: 0`
2. **Child decides its own spacing** — wrap content in `div.p-3` or `div.p-4`
3. **No double borders** — tables inside panels have `border: none`
4. **Fit utilities** — `.fit` (w+h 100%), `.fit-w`, `.fit-h`

## Code

### Complete CRUD Page

```pug
div.flex.flex-col.h-screen.overflow-hidden

  +dp-toolbar({title: 'Inventory', icon: 'package'})

  div.flex-1.min-h-0
    +dp-vsplit('350px')
      +dp-panel('west')
        +dp-toolbar({title: 'Part', icon: 'search', asdpx: 'asdx'})
        div.p-3
          +dp-form({id: 'head'})
            +dp-fitem('Part ID', {class: 'combobox', name: 'PART_ID', id: '~', pre: 'package', options: [...]})
            +dp-fitem('Description', {class: 'textbox', name: 'DESC', id: '~'})
            +dp-group('Dimensions')
              +dp-fitem('Width', {class: 'numberbox', name: 'WIDTH', id: '~', precision: 2})
              +dp-fitem('Height', {class: 'numberbox', name: 'HEIGHT', id: '~', precision: 2})
            +dp-group('Cost')
              +dp-fitem('Price', {class: 'numberbox', name: 'PRICE', id: '~', precision: 2, pre: 'dollar-sign'})
              +dp-fitem('Currency', {class: 'combobox', name: 'CUR', id: '~', options: ['SGD', 'USD']})

      +dp-panel('center')
        +dp-toolbar({title: 'Stock Balances', icon: 'warehouse', asdpx: 'aed'})
        div.p-2
          +table({headers: ['Location', 'On Hand', 'Available'], rows: [...], zebra: true, size: 'sm'})
```

### Interactive with dp.js

```js
dp.on('ready', () => {
  // Form field with post-click handler
  const partField = dp('.dp-fitem');  // or find by input name
  partField.onPostClick((value) => {
    // Open lookup modal
    dp('#lookup-modal').open();
  });

  // Toolbar button handlers
  dp('#head_add').onClick(() => {
    dp.form('#head').clear();
  });

  dp('#head_save').onClick(async () => {
    const data = dp.form('#head').getData();
    await dp.post('/api/parts', data);
  });

  // Table row click loads form
  dp('.dp-table').onRowClick(({data}) => {
    dp.form('#head').setData({
      PART_ID: data[0],
      DESC: data[1],
    });
  });
});
```

## Examples

See the showcase at `examples/showcase-app.pug` — the "Full App" tab demonstrates a complete CRUD page with vsplit, toolbar, fitem form, and data table.

```bash
daisypug serve examples/
# Open http://0.0.0.0:8090/showcase-app.html → Full App tab
```
