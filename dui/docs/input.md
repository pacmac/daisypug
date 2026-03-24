# Input Widgets

Low-level input mixins. Most pages use `+fitem()` which delegates to these automatically based on the `class` attribute.

## Overview

The `+input()` mixin detects the widget type from the CSS class and renders the appropriate HTML element. Specialized mixins (`+combobox`, `+textbox`, etc.) are available for direct use but rarely needed.

| Type | Path |
|------|------|
| Mixin | `html/dui/mixins/input.pug` |
| Plugins | `public/dui/js/plugins/combobox-plugin.js`, `public/dui/js/plugins/spinner-plugin.js`, `public/dui/js/plugins/numberbox-plugin.js`, `public/dui/js/plugins/textbox-plugin.js`, `public/dui/js/plugins/datebox-plugin.js`, `public/dui/js/plugins/timespinner-plugin.js`, `public/dui/js/plugins/validatebox-plugin.js` |
| QBE Plugin | `public/dui/js/plugins/qbe-plugin.js` |

## Mixins

### `+input(input)`

Universal input mixin. Detects widget type from `class` attribute:

- `combobox` or `qbe` -> `<select>`
- `checkbox` -> `<input type="checkbox">`
- `radio` -> `<input type="radio">`
- `multiline` -> `<textarea>` (top-aligned label)
- `textarea` or `multiline:true` -> `<textarea>`
- `numberbox` or `numberspinner` -> `<input type="number">`
- `datebox` -> `<input type="date">`
- `datetimebox` -> `<input type="datetime-local">`
- Default -> `<input type="text">`

### `+combobox(opts)`

Dropdown select with remote data loading and optional navigation arrows.

### `+textbox(opts)`

Text input.

### `+numberbox(opts)`

Number input without spinner buttons.

### `+numberspinner(opts)`

Number input with HTML5 spinner buttons.

### `+spinner(opts)`

Generic spinner with explicit +/- buttons in a `.join` group.

### `+timespinner(opts)`

Time input with +/- buttons.

### `+datebox(opts)`

Date input (`<input type="date">`). The `.today` class auto-sets today's date.

### `+filebox(opts)`

File upload input.

### `+multiline(opts)`

Textarea input. Renders a `<textarea>` with top-aligned label when used inside `+fitem`. The `.spec` class is automatically added (for fill-container styling in tab panels/fieldsets). Use the `rows` attribute to control height (default: 2). No need to specify `class:'spec'` — it is injected automatically.

### `+searchbox(opts)`

Search text input.

### `+passwordbox(opts)`

Password input.

### `+spec(legend, input, opts)`

Alias for `+fitem` with `class:'multiline'`. Renders a labeled textarea.

### `+udf(readonly)`

Renders 10 user-defined fields (USER_1 through USER_10).

### `+qbe(opts)`

Alias for `+combobox`. Used during migration from EUI QBE widgets.

### `+qbemodal()`

Server-rendered modal shell for QBE search. Rendered once per page, shared by all QBE fields. Contains a split panel with filter fields on the left and a datagrid on the right, plus a Search button footer.

Uses a primary-colored titlebar with "Query By Exception" title, `list-filter` icon, and bordered modal box.

```pug
+qbemodal
```

## Parameters

### Combobox class modifiers

| Class | Effect |
|-------|--------|
| `fkey` | Foreign key mode — adds editbox for free-text entry |
| `navi` | Navigation arrows (prev/next) |
| `autonum` | Auto-number behavior |
| `fit` | Full width |
| `ronly-on` | Read-only when form is in read mode |

### Combobox attributes

| Attribute | Description |
|-----------|-------------|
| `_sqlid` | Remote data endpoint (e.g. `'inv^partids'`) |
| `data-options` | Inline data: `"data:[{text:'Yes',value:'y'}]"` |
| `name` | Form field name |
| `id` | Use `'~'` to auto-derive from name |

### Validation

`validType` is converted to both `data-options` and native HTML5 attributes:
- `validType:['length[1,30]']` -> `minlength="1" maxlength="30"`
- `required:true` -> adds `.required-field` class

## Examples

### Combobox with remote data and navigation

```pug
+fitem('Part ID', {class:'combobox fkey navi', name:'PART_ID', id:'~', _sqlid:'inv^partids'})
```

### Inline data combobox

```pug
+fitem('Status', {class:'combobox', name:'STATUS', 'data-options':"data:[{text:'Yes',value:'Y'},{text:'No',value:'N'}]"})
```

### Number inputs

```pug
+fitem('Weight', {class:'numberbox', name:'WEIGHT', precision:2, min:0})
+fitem('Quantity', {class:'numberspinner', name:'QTY', min:0, max:1000, precision:0})
```

### Date with today default

```pug
+fitem('Tx Date', {class:'datebox today', name:'TX_DATE'})
```

### Multiline textarea

Three equivalent ways to render a multiline textarea:

```pug
//- Via class (preferred — same pattern as textbox, numberbox, datebox, etc.)
+fitem('Description', {class:'multiline', name:'DESCRIPTION', rows:4})

//- Via multiline:true property (legacy compatibility)
+fitem('Description', {name:'DESCRIPTION', multiline:true})

//- Via +spec alias
+spec('Description', {name:'DESCRIPTION'})
```

Use `rows` to control the textarea height (default: 2). The label is automatically top-aligned with the first line of the textarea.

### User-defined fields

```pug
+udf         //- editable
+udf(true)   //- readonly
```

## Output

```pug
//- @module dev
+form.three
  //- ── Text Inputs ──────────────────────────────────────
  .divider.text-xs.font-bold.opacity-50.mt-0(style="grid-column:1/-1") TEXT INPUTS
  +fitem('Full Name', {class:'textbox', name:'FULL_NAME', id:'~', placeholder:'Enter your name'})
  +fitem('Email', {class:'textbox', name:'EMAIL', id:'~', placeholder:'user@example.com'})
  +fitem('Search', {class:'searchbox', name:'SEARCH', id:'~', placeholder:'Search...'})
  +fitem('Password', {class:'passwordbox', name:'PASS', id:'~', placeholder:'••••••••'})
  +fitem('Notes', {class:'textbox', name:'NOTES', id:'~', placeholder:'Optional notes'})
  +fitem('Reference', {class:'textbox', name:'REF', id:'~', placeholder:'REF-001'})

  //- ── Combobox Variants ────────────────────────────────
  .divider.text-xs.font-bold.opacity-50(style="grid-column:1/-1") COMBOBOX VARIANTS
  +fitem('Status', {class:'combobox', name:'D_STATUS', id:'~', 'data-options':"data:[{text:'Active',value:'A'},{text:'Inactive',value:'I'},{text:'Pending',value:'P'},{text:'Archived',value:'X'}]"})
  +fitem('Priority', {class:'combobox', name:'D_PRIORITY', id:'~', 'data-options':"data:[{text:'Low',value:'1'},{text:'Medium',value:'2'},{text:'High',value:'3'},{text:'Critical',value:'4'}]"})
  +fitem('Boolean', {class:'combobox', name:'D_BOOL', id:'~', 'data-options':"data:[{text:'Yes',value:'Y'},{text:'No',value:'N'}]"})
  +fitem('Part ID', {class:'combobox fkey navi', name:'D_PART_ID', id:'~', 'data-options':"data:[{text:'A8000 - Hydraulic Pump',value:'A8000'},{text:'B3200 - Bearing Kit',value:'B3200'},{text:'C1500 - Control Valve',value:'C1500'}]"})
  +fitem('Category', {class:'combobox', name:'D_CAT', id:'~', 'data-options':"data:[{text:'Raw Material',value:'RM'},{text:'Component',value:'COMP'},{text:'Finished Good',value:'FG'}]"})
  +fitem('Warehouse', {class:'combobox', name:'D_WH', id:'~', 'data-options':"data:[{text:'Main Store',value:'WH01'},{text:'Sub Store',value:'WH02'},{text:'Yard',value:'WH03'}]"})

  //- ── Number Inputs ────────────────────────────────────
  .divider.text-xs.font-bold.opacity-50(style="grid-column:1/-1") NUMBER INPUTS
  +fitem('Quantity', {class:'numberspinner', name:'QTY', id:'~', min:0, max:9999, precision:0, value:25})
  +fitem('Weight (kg)', {class:'numberbox', name:'WEIGHT', id:'~', precision:2, min:0, value:'12.50'})
  +fitem('Unit Price', {class:'numberbox', name:'PRICE', id:'~', precision:2, min:0, value:'199.99'})

  //- ── Date ─────────────────────────────────────────────
  .divider.text-xs.font-bold.opacity-50(style="grid-column:1/-1") DATE
  +fitem('Order Date', {class:'datebox today', name:'ORDER_DATE', id:'~'})
  +fitem('Due Date', {class:'datebox', name:'DUE_DATE', id:'~'})
  +fitem('Created', {class:'datebox', name:'CREATED', id:'~', value:'2025-12-31'})

  //- ── File Upload ──────────────────────────────────────
  .divider.text-xs.font-bold.opacity-50(style="grid-column:1/-1") FILE UPLOAD
  +fitem('Attachment', {class:'filebox', name:'ATTACH', id:'~', accept:'.pdf,.doc,.xlsx'})

  //- ── Multiline ────────────────────────────────────────
  .divider.text-xs.font-bold.opacity-50(style="grid-column:1/-1") MULTILINE
  div(style="grid-column:1/-1")
    +fitem('Description', {class:'multiline', name:'DESCRIPTION', id:'~', rows:4})
```

```js
// Initialize Lucide icons (for navi arrows)
if (window.lucide) lucide.createIcons({ nodes: document.querySelectorAll('#output-rendered [data-lucide]') });
```

## JS API

### Textbox plugin (`$.fn.textbox`)

```js
$('#NAME').textbox('getValue');        // get current value
$('#NAME').textbox('setValue', 'abc'); // set value
$('#NAME').textbox('clear');           // clear value
$('#NAME').textbox('disable');         // disable input
$('#NAME').textbox('enable');          // enable input
$('#NAME').textbox('readonly', true);  // set read-only
$('#NAME').textbox('isValid');         // validate input
```

### Combobox plugin (`$.fn.combobox`)

```js
$('#STATUS').combobox('getValue');            // get selected value
$('#STATUS').combobox('setValue', 'A');        // set value
$('#STATUS').combobox('getValues');            // get values as array
$('#STATUS').combobox('getData');              // get loaded data array
$('#STATUS').combobox('getRec');               // get full record for selected value
$('#STATUS').combobox('loadData', [{text:'Yes', value:'Y'}]);
$('#STATUS').combobox('reload', '/api/data'); // reload from URL
$('#STATUS').combobox('clear');               // clear selection
$('#STATUS').combobox('select', 'A');         // select and trigger onSelect
$('#STATUS').combobox('enable');              // enable
$('#STATUS').combobox('disable');             // disable
$('#STATUS').combobox('exists', 'A');         // check if value exists
$('#STATUS').combobox('sort');               // sort by textField ascending
$('#STATUS').combobox('sort', {order:'desc'});        // sort descending
$('#STATUS').combobox('sort', {field:'value'});       // sort by a different field
```

### Combobox fkey methods

```js
$('#PART_ID').combobox('editbox');        // toggle to free-text add-new mode
$('#PART_ID').combobox('editbox', true);  // switch back and reload
$('#PART_ID').combobox('formLoad');       // trigger fkey form load
```

### Common methods (all input widgets)

| Method | Description |
|--------|-------------|
| `getValue()` | Get current value |
| `setValue(v)` | Set value |
| `clear()` | Clear to empty |
| `reset()` | Reset to original value |
| `enable()` | Enable input |
| `disable()` | Disable input |
| `isValid()` | Validate (textbox) |

## Notes

### Widget detection

`+fitem` reads the `class` attribute to determine which input to render. If ambiguous, use the `eui` property to force a specific widget type.

### `id:'~'`

The special value `'~'` means "use the `name` attribute as the id". This is a convenience for the common pattern where id and name are identical.

### `.remember` — persistent combobox selection

Add the `remember` class to a combobox to persist its selected value across page loads via `localStorage`.

```pug
+fitem('Component', {id:'~', name:'COMPONENT', class:'combobox remember', 'data-options':"editable:false, data:[...]"})
```

The element **must have an `id`** — this is used as the storage key. On init, the saved value is restored via `combobox('select', saved)`, which fires `onSelect` so dependent logic (e.g. loading a record) runs automatically. The `combobox('sort')` method also preserves the remembered selection.

Requires the `remember-plugin.js` plugin. Storage key format: `rem:<pageId>:<elementId>`. Values expire after 30 days.
