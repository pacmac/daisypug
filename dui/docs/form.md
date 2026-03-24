# Form

Form containers and field structure mixins for CRUD pages.

## Overview

Forms wrap input fields with layout, validation, and server data binding. The form plugin handles loading, saving, deleting, and mode management (view/add/edit).

| Type | Path |
|------|------|
| Mixin | `html/dui/mixins/form.pug` |
| Plugin | `public/dui/js/plugins/form-plugin.js` |
| CSS | `public/dui/css/forms.css` |

## Mixins

### `+form(opts)`

Renders an HTML `<form>` with `.easyui-form` class for plugin initialization.

### `+fieldset(legend, opts)`

Groups related fields with an optional legend.

### `+fitem(label, input, fitemOpts)`

The primary form field mixin. Renders a label + input pair.

### `+v-group(title)` / `+group(title)`

Lightweight vertical titled group — stacks fitems with a small section heading above them. No border or padding; purely typographic separation. `+group` is an alias for `+v-group`.

### `+h-group(title)`

Horizontal group — places two or more fitems side-by-side in a flex row under a shared heading. Each fitem's primary input and suffix split the available width 50/50.

### `+label(labelOrText)`

Standalone label with translation support.

### `+hint(text, opts)`

DaisyUI fieldset hint text.

### `+validator(opts)`

Input with validation hint.

## Parameters

### `+form` attributes

| Attribute | Description |
|-----------|-------------|
| `id` | Form element ID |
| `class` | `single` (single-record), `multi` (master-detail), `load` (auto-load), `fit` (fill container) |
| `_sqlid` | Server data endpoint (e.g. `'inv^partall'`) |
| `asdpx` | Toolbar buttons: `a`=Add, `s`=Save, `d`=Delete, `x`=Cancel, `p`=Print |
| `cols` | Column count (CSS grid when > 1) |

### Column layout classes

| Class | Columns | Description |
|-------|---------|-------------|
| _(none)_ | 1 | Single column (default) |
| `two` | 2 | `grid-template-columns: repeat(2, 1fr)` |
| `three` | 3 | `grid-template-columns: repeat(3, 1fr)` |

Add directly to the form: `+form.two` or `+form.three`. Fields flow left-to-right, top-to-bottom. Use `.divider(style="grid-column:1/-1")` to insert full-width section headers.

These classes also work on `+fieldset`: `+fieldset('Dimensions').two` for a 2-column fieldset inside a single-column form.

### `+fitem` input properties

| Property | Description |
|----------|-------------|
| `class` | Widget type: `combobox`, `textbox`, `numberbox`, `numberspinner`, `datebox`, `timespinner`, `multiline` |
| `name` | Form field name (maps to database column) |
| `id` | HTML id — use `'~'` to auto-generate from `name` |
| `_sqlid` | Remote data source for combobox |
| `data-options` | EUI-style options string |
| `required` | Boolean — adds validation |
| `readonly` | Boolean |
| `value` | Default value |
| `eui` | Explicit widget type override |
| `validType` | Validation rules, e.g. `['length[1,30]']` |

## Examples

### Single-record form

```pug
+form#head(class='single load', _sqlid='inv^partall', asdpx='asdx')
  +fitem('Part ID', {class:'combobox fkey navi', name:'PART_ID', id:'~'})
  +fitem('Description', {class:'textbox', name:'DESCRIPTION'})
  +fitem('Quantity', {class:'numberbox', name:'QTY', precision:0})
  +fitem('Date', {class:'datebox today', name:'TX_DATE'})
  +fitem('Notes', {class:'multiline', name:'NOTES', rows:4})
```

### Two-column form

```pug
+form#myform.two
  +fitem('First Name', {class:'textbox', name:'FNAME'})
  +fitem('Last Name', {class:'textbox', name:'LNAME'})
  +fitem('Email', {class:'textbox', name:'EMAIL'})
  +fitem('Phone', {class:'textbox', name:'PHONE'})
```

### Three-column form with section dividers

```pug
+form.three
  .divider.text-xs.font-bold.opacity-50.mt-0(style="grid-column:1/-1") PERSONAL
  +fitem('First Name', {class:'textbox', name:'FNAME'})
  +fitem('Last Name', {class:'textbox', name:'LNAME'})
  +fitem('Email', {class:'textbox', name:'EMAIL'})
  .divider.text-xs.font-bold.opacity-50(style="grid-column:1/-1") ADDRESS
  +fitem('Street', {class:'textbox', name:'STREET'})
  +fitem('City', {class:'textbox', name:'CITY'})
  +fitem('Postcode', {class:'textbox', name:'POSTCODE'})
```

### Fieldset grouping

```pug
+fieldset('Dimensions')
  +fitem('Width', {class:'numberbox', name:'WIDTH', precision:2})
  +fitem('Height', {class:'numberbox', name:'HEIGHT', precision:2})
```

### v-group — vertical titled section

Use to visually separate a cluster of related fitems inside a single-column form with a small uppercase heading.

```pug
+form#head(class='single fit', _sqlid='inv^partall', asdpx='asdx')
  +fitem('Part ID', {class:'combobox fkey navi', name:'PART_ID', id:'~'})
  +fitem('Description', {class:'textbox', name:'DESCRIPTION'})
  +v-group('Dimensions')
    +fitem('Width', {class:'numberbox', name:'WIDTH', precision:2})
    +fitem('Height', {class:'numberbox', name:'HEIGHT', precision:2})
    +fitem('Weight', {class:'numberbox', name:'WEIGHT', precision:3})
  +v-group('Financials')
    +fitem('Unit Cost', {class:'numberbox', name:'COST', precision:2})
    +fitem('Currency', {class:'combobox', name:'CURRENCY_ID', id:'~'})
```

`+group` is an alias — `+group('Title')` is identical to `+v-group('Title')`.

### h-group — horizontal compound field

Use when two logically related fields (e.g. a code and its rate, a range start/end) should appear on the same row under a single heading. The primary widget and its suffix split available width 50/50.

```pug
+h-group('Rates')
  +fitem('Currency', {name:'CURRENCY_ID', id:'~', class:'combobox', required:true, 'data-options':"editable:false,panelHeight:'auto'"})
    +input({name:'CURRENCY_RATE', id:'~', class:'numberbox', required:true, precision:8})
  +fitem('GST Code / Rate %', {name:'GST_ID', id:'~', class:'combobox', required:true, 'data-options':"editable:false,panelHeight:'auto'"})
    +input({name:'GST_RATE', id:'~', class:'numberbox', readonly:true, precision:1})
```

The `+input(...)` after each `+fitem(...)` is placed in the `.fitem-suf` slot — it becomes the right-hand companion input sharing the row.

## Output

```pug
+form#demo.two
  +fitem('Part ID', {class:'combobox fkey navi', name:'PART_ID', id:'~', 'data-options':"data:[{text:'A8000 - Hydraulic Pump',value:'A8000'},{text:'B3200 - Bearing Kit',value:'B3200'}]"})
  +fitem('Description', {class:'textbox', name:'DESCRIPTION', id:'~'})
  +fitem('Status', {class:'combobox', name:'STATUS', id:'~', 'data-options':"data:[{text:'Active',value:'A'},{text:'Inactive',value:'I'}]"})
  +fitem('Quantity', {class:'numberspinner', name:'QTY', id:'~', min:0, precision:0})
  +fitem('Unit Cost', {class:'numberbox', name:'COST', id:'~', precision:2})
  +fitem('Order Date', {class:'datebox today', name:'ORDER_DATE', id:'~'})
  +fitem('Email', {class:'textbox', name:'EMAIL', id:'~'})
  +fitem('Revision', {class:'textbox', name:'REV', id:'~'})
```

```js
// Load form data into the rendered demo
$('#demo').form('load', {
  PART_ID: 'A8000', DESCRIPTION: 'Hydraulic Pump Assembly',
  STATUS: 'A', QTY: 12, COST: '199.99', REV: 'B'
});
```

### v-group output

```pug
+form#vgdemo(class='single fit', _sqlid='inv^partall', asdpx='asdx')
  +fitem('Part ID', {class:'combobox fkey navi', name:'PART_ID', id:'~', 'data-options':"data:[{text:'A8000',value:'A8000'}]"})
  +fitem('Description', {class:'textbox', name:'DESCRIPTION', id:'~'})
  +v-group('Dimensions')
    +fitem('Width', {class:'numberbox', name:'WIDTH', id:'~', precision:2})
    +fitem('Height', {class:'numberbox', name:'HEIGHT', id:'~', precision:2})
    +fitem('Weight', {class:'numberbox', name:'WEIGHT', id:'~', precision:3})
  +v-group('Financials')
    +fitem('Unit Cost', {class:'numberbox', name:'COST', id:'~', precision:2})
    +fitem('Currency', {class:'combobox', name:'CURRENCY_ID', id:'~', 'data-options':"data:[{text:'SGD',value:'SGD'},{text:'USD',value:'USD'}]"})
```

```js
$('#vgdemo').form('load', {
  PART_ID: 'A8000', DESCRIPTION: 'Hydraulic Pump Assembly',
  WIDTH: 120.00, HEIGHT: 85.50, WEIGHT: 2.450,
  COST: 199.99, CURRENCY_ID: 'SGD'
});
```

Expected: Part ID and Description appear as plain fitems. Below them, **DIMENSIONS** heading (small caps, primary colour) followed by Width/Height/Weight indented naturally. Then **FINANCIALS** heading followed by Cost/Currency. Groups have `0.75rem` top margin from the preceding fitem; `0.1875rem` gap between heading and first fitem inside the group.

### h-group output

```pug
+form#hgdemo(class='single fit')
  +fitem('Part ID', {class:'combobox fkey navi', name:'PART_ID', id:'~', 'data-options':"data:[{text:'A8000',value:'A8000'}]"})
  +h-group('Rates')
    +fitem('Currency', {name:'CURRENCY_ID', id:'~', class:'combobox', required:true, 'data-options':"data:[{text:'SGD',value:'SGD'},{text:'USD',value:'USD'}]"})
      +input({name:'CURRENCY_RATE', id:'~', class:'numberbox', required:true, precision:8})
    +fitem('GST Code / Rate %', {name:'GST_ID', id:'~', class:'combobox', required:true, 'data-options':"data:[{text:'GST9',value:'GST9'},{text:'GST0',value:'GST0'}]"})
      +input({name:'GST_RATE', id:'~', class:'numberbox', readonly:true, precision:1})
```

```js
$('#hgdemo').form('load', {
  PART_ID: 'A8000',
  CURRENCY_ID: 'SGD', CURRENCY_RATE: 1.00000000,
  GST_ID: 'GST9', GST_RATE: 9.0
});
```

Expected: **RATES** heading spanning full width. Below it, two rows — each row has a combobox on the left half and a numberbox on the right half, sharing the fitem body 50/50 with a `1.5em` gap.

## JS API

### Form plugin (`$.fn.form`)

```js
// Initialize / load data
$('#head').form('load', {PART_ID: 'A8000', DESCRIPTION: 'Pump Assembly'});

// Mode management
$('#head').form('getMode');         // returns 'view', 'add', or 'edit'
$('#head').form('setMode', 'add');

// CRUD operations (usually triggered by toolbar buttons, not page scripts)
$('#head').form('save');
$('#head').form('delete');
$('#head').form('cancel');

// Get/set values
$('#head').form('getData');         // returns object of all field values
$('#head').form('clear');           // clear all fields

// Dirty tracking
$('#head').form('isDirty');         // true if any field changed since last load
```

### Methods

| Method | Args | Description |
|--------|------|-------------|
| `load` | data | Load key-value data into form fields |
| `getData` | — | Get all form field values as an object |
| `clear` | — | Clear all fields to empty |
| `getMode` | — | Returns current mode: `'view'`, `'add'`, `'edit'` |
| `setMode` | mode | Set form mode |
| `save` | — | Submit form data to server via `_sqlid` |
| `delete` | — | Delete current record |
| `cancel` | — | Cancel current operation, restore previous values |
| `isDirty` | — | Check if form has unsaved changes |
| `validate` | — | Run validation on all fields |
| `options` | — | Get current options object |

### Options / callbacks

| Option | Type | Description |
|--------|------|-------------|
| `onChange` | function | Fires when any field value changes |
| `onLoadSuccess` | function(data) | Fires after data loads successfully |
| `onSave` | function | Fires after successful save |

### Form change handler

```js
$('#head').form({
  onChange: function() {
    // Reload dependent datagrid when form field changes
    $('#partdg').datagrid('reload');
  }
});
```

## Notes

### Form classes

| Class | Description |
|-------|-------------|
| `single` | Single-record form (one record at a time) |
| `multi` | Master-detail form (with child datagrids) |
| `load` | Auto-load data when page opens |
| `fit` | Fill parent container height |

### `_sqlid` format

Format is `module^table` (e.g. `inv^partall`). This is passed to the server proxy which forwards to the remote database server.

### `asdpx` toolbar binding

Each character enables a main toolbar button: `a`=Add, `s`=Save, `d`=Delete, `x`=Cancel, `p`=Print. The form plugin reads this and calls `butEn()` to enable the appropriate buttons when form state changes.

### State machine

The form plugin manages a state machine:
- **view** → record loaded, fields read-only, toolbar shows per `asdpx`
- **add** → new record, fields editable, toolbar shows Save + Cancel
- **edit** → editing existing record, fields editable, toolbar shows Save + Cancel

Page scripts should NOT manage toolbar buttons directly — the form plugin handles this automatically based on the state machine and `asdpx` configuration.

### Auto-number (NNG) on Add

Pages that auto-generate IDs on Add declare this via `$.page.register({ autonum })`. The form plugin handles the field state automatically — see [Page Lifecycle: Auto-Number](page-lifecycle.md#auto-number-nng) for full details.

```js
$.page.register({
  autonum: { field: '#ORDER_ID', type: 'SO' }
});
```

On Add: the field goes blank, shows `-AUTONUMBER-`, becomes non-editable. On Save success: server returns `_next` with the generated ID, form-plugin populates the field and triggers `fkeyLoad`.

### `.btn-group` — spaced inline button row

Wrap action buttons at the bottom of a form in `.btn-group` to center and space them:

```pug
+form#myform(class='single fit', _sqlid='inv^partall', asdpx='asdx')
  +fitem('Part ID', {class:'combobox fkey navi', name:'PART_ID', id:'~'})
  +fitem('Description', {class:'textbox', name:'DESCRIPTION'})
  .btn-group
    +button('Save', {color:'primary', iconCls:'icon-save'})
    +button('Cancel', {iconCls:'aicon-cancel'})
```

Flex row, centered, `2em` gap between buttons, `2em` top margin. See also: [button.md](button.md).
