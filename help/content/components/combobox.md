---
name: combobox
description: Custom dropdown with data store, search, lazy loading, keyboard navigation
category: Inputs
base: dp-combobox
---

## Usage

Add `dp-combobox` class to a wrapper `<div>` to get a custom dropdown with data loading, search, keyboard navigation, and full row access via `getRec()`. Extends DpComponent.

### Pug

```pug
//- Inside a +dp-fitem (recommended)
+dp-fitem('Status', {class: 'combobox', name: 'STATUS', id: '~'})

//- With placeholder and searchable
+dp-fitem('State', {class: 'combobox', name: 'STATE', id: '~', placeholder: 'Search...', editable: true})

//- With static options
+dp-fitem('Priority', {class: 'combobox', name: 'PRIORITY', id: '~', placeholder: 'Choose...', options: [{value: 'H', text: 'High'}, {value: 'M', text: 'Medium'}, {value: 'L', text: 'Low'}]})
```

Manual HTML structure:

```pug
div.dp-combobox.w-full(id="status")
  input.dp-cb-display.input.input-bordered.input-sm.w-full(type="text" readonly placeholder="Choose...")
  input(type="hidden" name="STATUS")
  button.dp-cb-toggle(type="button" tabindex="-1")
  ul.dp-cb-dropdown.menu
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
combo.clear()

// Full row access
combo.getRec()                // { value: 'I', text: 'Inactive', color: 'red' }
combo.getRec('H')             // { value: 'H', text: 'On Hold', color: 'orange' }
combo.getData()               // all loaded rows
combo.exists('A')             // true

// Open/close
combo.open()
combo.close()
combo.isOpen()

// Configuration
combo.config({
  valueField: 'code',         // default: 'value'
  textField: 'name',          // default: 'text'
  url: '/api/statuses',
  queryParams: { active: true },
  loadFilter: (data) => data.rows || data,
  editable: true,             // make searchable (type to filter)
  mode: 'remote',             // 'remote' = debounced server search
  delay: 300,                 // debounce ms for remote search
  pageSize: 50,               // lazy render batch size
  formatter: (row, anchor) => {
    // Custom dropdown option rendering — modify anchor DOM or return string
    anchor.textContent = row.name + ' (' + row.code + ')'
  },
  displayFormatter: (row, el) => {
    // Custom selected display — render rich content (colored dots, icons, etc.)
    // el is a div overlay on top of the input
    const dot = document.createElement('span')
    dot.style.cssText = 'width:8px;height:8px;border-radius:50%;background:' + row.color
    el.appendChild(dot)
    el.appendChild(document.createTextNode(' ' + row.name))
  },
  filter: (row) => {          // custom local filter function
    return row.name.includes(query)
  },
})

// Events
combo.onSelect(({ value, text, rec }) => {
  console.log('Selected:', text, 'extra:', rec.color)
})
combo.onLoadSuccess((data) => console.log('Loaded:', data.length))
combo.onLoadError((err) => console.error('Failed:', err))
```

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `ArrowDown` | Open dropdown / move highlight down |
| `ArrowUp` | Move highlight up |
| `Enter` | Select highlighted item / open if closed |
| `Escape` | Close dropdown |
| `Tab` | Close dropdown, move to next field |

When `editable: true`, typing filters the list in real time.

### Editor Modal Integration {#editor}

Combobox in datagrid editor columns:

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
- `onBeforeRender(input, row)` — called before modal opens; `input` is the wrapper div, `row` is the current row (null for add mode). Supports async.

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

### DOM Structure

```
div.dp-combobox          ← wrapper (position: relative)
  input.dp-cb-display    ← visible text input (readonly or searchable)
  div.dp-cb-selected     ← selected display overlay (for rich content via displayFormatter)
  input[type=hidden]     ← form value (carries name attribute)
  button.dp-cb-toggle    ← chevron button
  ul.dp-cb-dropdown      ← dropdown panel (absolute, z-50)
    li[data-value]       ← option items (template-cloned)
      a                  ← clickable anchor (.active for selected, .dp-cb-highlight for keyboard)
```

### CSS Classes

| Class | Element | Purpose |
|-------|---------|---------|
| `dp-combobox` | wrapper div | Component identifier |
| `dp-cb-display` | text input | Display input |
| `dp-cb-selected` | div | Selected display overlay (rich content) |
| `dp-cb-toggle` | button | Chevron toggle |
| `dp-cb-dropdown` | ul | Dropdown panel |
| `dp-cb-open` | wrapper | Added when dropdown is open |
| `dp-cb-highlight` | li > a | Keyboard navigation highlight |
| `active` | li > a | Currently selected item |

### Methods

| Method | Args | Returns | Description |
|--------|------|---------|-------------|
| `loadData` | array or {rows} | this | Populate options from data |
| `load` | url, opts? | Promise | Fetch from server then loadData |
| `reload` | url? | Promise | Re-fetch from configured URL |
| `getData` | — | array | All loaded rows |
| `getRec` | value? | object/null | Full row for value (no arg = selected) |
| `exists` | value | boolean | Check if value in data |
| `getValue` | — | string | Selected value (from hidden input) |
| `setValue` | value | this | Set value + update display text |
| `getText` | — | string | Display input text |
| `setText` | text | this | Set display text directly |
| `getName` | — | string | Hidden input name |
| `setName` | str | this | Set hidden input name |
| `clear` | — | this | Clear value and display |
| `config` | opts | this | Set options (see Config section) |
| `open` | — | this | Open dropdown |
| `close` | — | this | Close dropdown |
| `toggleDropdown` | — | this | Toggle open/close |
| `isOpen` | — | boolean | Dropdown state |
| `enable` | — | this | Enable input |
| `disable` | — | this | Disable + close |
| `focus` | — | this | Focus display input |
| `blur` | — | this | Blur display input |
| `onSelect` | fn | this | `{value, text, rec}` |
| `onLoadSuccess` | fn | this | Fires after loadData |
| `onLoadError` | fn | this | Fires on fetch error |

### Config Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `valueField` | string | `'value'` | Row field for option value |
| `textField` | string | `'text'` | Row field for display text |
| `url` | string | — | Remote data URL |
| `queryParams` | object | — | Query params for fetch |
| `loadFilter` | function | — | Transform response before storing |
| `editable` | boolean | `false` | Make input searchable |
| `mode` | string | `'local'` | `'remote'` for server-side search |
| `delay` | number | `300` | Debounce ms for remote search |
| `pageSize` | number | `50` | Lazy render batch size |
| `formatter` | function | — | Custom dropdown option rendering `(row, anchor)` |
| `displayFormatter` | function | — | Custom selected display rendering `(row, el)` — el is a DOM overlay |
| `filter` | function | — | Custom local filter `(row) → bool` |
