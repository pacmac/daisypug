---
name: combobox
description: Data-aware select with remote loading, getRec, and DUI-compatible API
category: Inputs
base: dp-combobox
---

## Usage

Add `dp-combobox` class to a `<select>` element to get data loading, internal data store, and full row access via `getRec()`. Extends DpSelect with all its methods.

### Pug

```pug
select.dp-combobox.select.select-bordered.select-sm.w-full(id="status")
  option(disabled selected) Choose...
```

Or inside a `+dp-fitem`:

```pug
+dp-fitem('Status', {class: 'combobox', name: 'STATUS', id: '~'})
```

### API (dp.js)

```js
const combo = dp('#status')

// Load data from array
combo.loadData([
  { value: 'A', text: 'Active', color: 'green' },
  { value: 'I', text: 'Inactive', color: 'red' },
  { value: 'H', text: 'On Hold', color: 'orange' },
])

// Load from server
await combo.load('/api/statuses', {
  valueField: 'code',
  textField: 'name',
})

// Re-fetch from configured URL
await combo.reload()

// Get/set value
combo.getValue()              // 'A'
combo.getText()               // 'Active'
combo.setValue('I')

// Full row access
combo.getRec()                // { value: 'I', text: 'Inactive', color: 'red' }
combo.getRec('H')             // { value: 'H', text: 'On Hold', color: 'orange' }
combo.getData()               // all loaded rows
combo.exists('A')             // true
combo.exists('X')             // false

// Configuration
combo.config({
  valueField: 'code',         // default: 'value'
  textField: 'name',          // default: 'text'
  url: '/api/statuses',
  queryParams: { active: true },
  loadFilter: (data) => data.rows || data,
})

// Events
combo.onSelect(({ value, text, rec, index }) => {
  console.log('Selected:', text, 'extra:', rec.color)
})
combo.onLoadSuccess((data) => console.log('Loaded:', data.length))
combo.onLoadError((err) => console.error('Failed:', err))
```

### Editor Modal Integration {#editor}

Combobox in datagrid editor columns can be populated dynamically via `onBeforeRender`:

```js
table.columns([
  { field: 'STATUS', title: 'Status',
    editor: {
      type: 'combobox',
      // Static data (loaded at modal build time):
      data: [{ value: 'A', text: 'Active' }, { value: 'I', text: 'Inactive' }],

      // OR dynamic data (loaded each time modal opens):
      onBeforeRender: async (input, row) => {
        const data = await dp.get('/api/statuses');
        dp(input).loadData(data);
      },
    }
  },
])
```

- `data` — static options, loaded once when modal is built
- `onBeforeRender(input, row)` — called before modal opens; `input` is the `<select>` element, `row` is the current row (null for add mode). Supports async (return a Promise).

### Data Format

```js
// Array of objects (default fields: value, text)
[{ value: 'A', text: 'Active' }]

// Wrapped in {rows: [...]}
{ rows: [{ value: 'A', text: 'Active' }] }

// Custom fields via config
combo.config({ valueField: 'id', textField: 'name' })
combo.loadData([{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }])
```

Field fallback chain:
- value: `valueField` → `value` → `VALUE` → `id` → `ID`
- text: `textField` → `text` → `TEXT` → `name` → `NAME` → value

### Methods

| Method | Args | Returns | Description |
|--------|------|---------|-------------|
| `loadData` | array or {rows} | this | Populate options from data |
| `load` | url, opts? | Promise | Fetch from server then loadData |
| `reload` | url? | Promise | Re-fetch from configured URL |
| `getData` | — | array | All loaded rows |
| `getRec` | value? | object/null | Full row for value (no arg = selected) |
| `exists` | value | boolean | Check if value in data |
| `getValue` | — | string | Selected value |
| `setValue` | value | this | Set value (queues autoload if missing) |
| `getText` | — | string | Selected option text |
| `clear` | — | this | Reset to placeholder |
| `config` | opts | this | Set valueField, textField, url, etc. |
| `onSelect` | fn | this | `{value, text, rec, index}` |
| `onLoadSuccess` | fn | this | Fires after loadData |
| `onLoadError` | fn | this | Fires on fetch error |
