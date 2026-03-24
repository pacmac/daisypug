# Datagrid

Data table with server-rendered headers and client-side row rendering.

## Overview

Datagrids display tabular data with sorting, selection, and optional inline editing. Column definitions live in JSON config files — the mixin reads the config and renders the table structure.

| Type | Path |
|------|------|
| Mixin | `html/dui/mixins/datagrid.pug` |
| Plugin | `public/dui/js/plugins/datagrid-plugin.js` |
| JSON configs | `html/dui/mod/<module>/json/datagrid.<id>.json` |

## Mixins

### `+datagrid(opts)`

Renders a `<table>` with headers from a JSON config file. The `id` attribute is required and links to the config file.

```pug
+datagrid#partbal
```

This reads `html/dui/mod/<current-module>/json/datagrid.partbal.json`.

## Parameters

### JSON config properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `url` | String | `"/"` | Data endpoint URL |
| `method` | String | `"get"` | HTTP method |
| `singleSelect` | Boolean | `false` | Single row selection |
| `fitColumns` | Boolean | `false` | Stretch columns to fill width |
| `striped` | Boolean | `false` | Zebra striping |
| `rownumbers` | Boolean | `false` | Row number column |
| `pagination` | Boolean | `false` | Enable pagination |
| `filler` | Boolean | `true` | Blank spacer column at end |
| `asdpx` | String | `""` | Toolbar buttons: `a`=Add, `e`=Edit, `d`=Delete |
| `idField` | String | — | Primary key field name (used by `selectRecord`) |
| `queryParams._sqlid` | String | — | Server data endpoint |

### Column properties

| Property | Type | Description |
|----------|------|-------------|
| `field` | String | Database column name |
| `title` | String | Display header text |
| `width` | Number | Column width in px |
| `hidden` | Boolean | Hide column (data still loaded) |
| `align` | String | `'right'` for right-aligned |
| `formatter` | String | Client-side formatter function name |
| `editor` | Object | Enables row editing |

### Editor types

`textbox`, `combobox`, `numberbox`, `numberspinner`, `datebox`

When any column has an `editor`, the mixin auto-generates an edit modal (`#<dgId>_editor`). The modal uses a primary-colored titlebar with `square-pen` icon.

### `asdpx` — toolbar CRUD buttons

Each character enables a toolbar button above the datagrid:

| Char | Button | ID |
|------|--------|-----|
| `a` | Add | `<dgId>_add` |
| `e` | Edit | `<dgId>_edit` |
| `d` | Delete | `<dgId>_del` |
| `p` | Print | `<dgId>_print` |
| `x` | Export | `<dgId>_export` |

Edit/Delete auto-disable when no row is selected.

### `toolbar` — filter fields

The JSON config can include a `toolbar` array for filter fields rendered above the datagrid columns. Each entry is either a field or a button:

```json
"toolbar": [
  { "type": "field", "label": "Part Filter", "id": "PART_ID_", "name": "PART_ID",
    "editor": { "type": "qbe", "options": { "_sqlid": "inv^partid_qbe" } } },
  { "type": "field", "label": "Status", "name": "STATUS",
    "editor": { "type": "combobox", "options": { "data": [{"text":"All","value":"ALL"}], "editable": false } } },
  { "text": "Validate", "id": "bomval", "icon": "check-circle" }
]
```

The mixin auto-generates a filter form with ID `<dgId>_filter`. Page JS references this form for `queryParams` and change handlers.

## Examples

### Basic datagrid

```pug
+vsplit('400px')
  +panel('west')
    +form#head(class='single load', _sqlid='inv^partall')
      +fitem('Part ID', {class:'combobox fkey navi', name:'PART_ID', id:'~'})
  +panel('center')
    +datagrid#partbal
```

### JSON config example

```json
{
  "url": "/",
  "method": "get",
  "singleSelect": true,
  "striped": true,
  "rownumbers": true,
  "asdpx": "aed",
  "queryParams": {
    "_sqlid": "inv^partbal",
    "_func": "get"
  },
  "toolbar": [
    { "type": "field", "label": "Part", "id": "PART_ID_", "name": "PART_ID",
      "editor": { "type": "qbe", "options": { "_sqlid": "inv^partid_qbe" } } },
    { "type": "field", "label": "Status", "name": "STATUS",
      "editor": { "type": "combobox", "options": {
        "data": [{"text":"All","value":""},{"text":"Active","value":"A"},{"text":"Inactive","value":"I"}],
        "editable": false } } }
  ],
  "columns": [
    { "field": "PART_ID", "title": "Part ID", "width": 120 },
    { "field": "DESCRIPTION", "title": "Description", "width": 200 },
    { "field": "QTY", "title": "Quantity", "width": 80, "align": "right",
      "formatter": "$.page.fn.fmtQty" },
    {
      "field": "STATUS", "title": "Status", "width": 80,
      "editor": {
        "type": "combobox",
        "options": {
          "data": [{"text": "Active", "value": "A"}, {"text": "Inactive", "value": "I"}]
        }
      }
    }
  ]
}
```

### Formatter references

Column formatters in JSON are string references to JS functions:
- `"formatter": "$.page.fn.docref"` — page-specific formatter defined in the page JS
- `"formatter": "$.dui.fmt.date"` — built-in date formatter
- `"formatter": "$.dui.fmt.currency"` — built-in currency formatter
- `"formatter": "$.dui.fmt.integer"` — built-in integer formatter

The function must exist at render time. Page formatters are defined under `$.page.fn` in the page JS file.

## Output

```pug
//- @module dev
+datagrid#ui_help_testgrid
```

```js
// Initialize the datagrid plugin (binds events, wires editor modal)
$('#ui_help_testgrid').datagrid();
// Load sample data into the rendered datagrid
$('#ui_help_testgrid').datagrid('loadData', {
  total: 5,
  rows: [
    { LINE: 1, PART_ID: 'A8000', DESCRIPTION: 'Hydraulic Pump Assembly', QTY: 12, STATUS: 'Active' },
    { LINE: 2, PART_ID: 'B3200', DESCRIPTION: 'Bearing Kit — Inner Race', QTY: 48, STATUS: 'Active' },
    { LINE: 3, PART_ID: 'C1500', DESCRIPTION: 'Control Valve Body', QTY: 5, STATUS: 'Active' },
    { LINE: 4, PART_ID: 'D0420', DESCRIPTION: 'Drive Shaft Coupling', QTY: 20, STATUS: 'Inactive' },
    { LINE: 5, PART_ID: 'E7100', DESCRIPTION: 'Exhaust Manifold Gasket', QTY: 100, STATUS: 'Active' }
  ]
});
```

## JS API

### Core methods (`$.fn.datagrid`)

```js
$('#partbal').datagrid('reload');                       // reload from server
$('#partbal').datagrid('reload', {PART_ID: 'A8000'});   // reload with extra params
$('#partbal').datagrid('load', {PART_ID: 'A8000'});     // load with params (no column re-render)
$('#partbal').datagrid('loadData', data);                // load local data ({total, rows} or array)
$('#partbal').datagrid('getData');                       // get {total, rows}
$('#partbal').datagrid('getRows');                       // get rows array
$('#partbal').datagrid('getSelected');                   // get selected row object (or null)
$('#partbal').datagrid('getSelections');                  // get selected rows as array
$('#partbal').datagrid('clearSelections');                // deselect all rows
```

### Selection methods

```js
$('#partbal').datagrid('selectRow', 0);                  // select row at index
$('#partbal').datagrid('unselectRow', 0);                // unselect row at index
$('#partbal').datagrid('selectRecord', 'A8000');          // select row by idField value
```

### Row manipulation

```js
$('#partbal').datagrid('appendRow', {PART_ID: 'X1', DESCRIPTION: 'New'});
$('#partbal').datagrid('updateRow', {index: 0, row: {QTY: 99}});
$('#partbal').datagrid('deleteRow', 2);                  // delete row at index
```

### Methods table

| Method | Args | Description |
|--------|------|-------------|
| `reload` | params | Re-render columns and reload data from server |
| `load` | params | Merge params and reload data (no column re-render) |
| `loadData` | data | Load local data: `{total, rows}` or plain array |
| `getData` | — | Returns `{total, rows}` |
| `getRows` | — | Returns rows array |
| `getSelected` | — | Selected row object or null |
| `getSelections` | — | Array of selected rows |
| `clearSelections` | — | Deselect all, disable edit/delete buttons |
| `selectRow` | index | Select row by index (fires onBeforeSelect → onSelect, scrolls into view) |
| `unselectRow` | index | Unselect row by index (fires onBeforeUnselect → onUnselect) |
| `selectRecord` | id | Select row by `idField` value (searches rows, delegates to selectRow) |
| `appendRow` | row | Append row to data and DOM |
| `updateRow` | `{index, row}` | Merge data into existing row |
| `deleteRow` | index | Remove row at index |
| `options` | — | Get current options object |

### Callbacks (in JSON config or options)

| Callback | Args | Description |
|----------|------|-------------|
| `onBeforeLoad` | queryParams | Fires before AJAX; return `false` to cancel |
| `onLoadSuccess` | data | Fires after loadData completes |
| `onBeforeSelect` | index, row | Fires before selection; return `false` to cancel |
| `onSelect` | index, row | Fires after a row is selected |
| `onBeforeUnselect` | index, row | Fires before unselection; return `false` to cancel |
| `onUnselect` | index, row | Fires after a row is unselected |
| `onClickRow` | index, row | Fires on every row click (always, even if already selected) |
| `onClickCell` | index, field, value | Fires on cell click (always, alongside onClickRow) |
| `onDblClickRow` | index, row | Fires on row double-click; return `false` to prevent editor |
| `onDblClickCell` | index, field, value | Fires on cell double-click |
| `onRowContextMenu` | e, index, row | Fires on right-click; `e` is the native event |
| `onDeleteRow` | index, row | Fires when delete button clicked |

### Toolbar conventions

When `asdpx` is set in JSON config, toolbar buttons are auto-wired by ID:

```js
// Button IDs: <gridId>_add, <gridId>_edit, <gridId>_del
// Edit/Delete auto-disable when no row selected, enable on selection
// Add button is always enabled
```

## Notes

### JSON config location

Config files must be at `html/dui/mod/<module>/json/datagrid.<id>.json`. The module is determined from the page's directory.

### Toolbar buttons

When `asdpx` is set, button IDs are namespaced: `<dgId>_add`, `<dgId>_edit`, `<dgId>_del`.

### Editor modal

When any column has an `editor`, a `<dialog>` is auto-generated with form fields for each editable column. The modal id is `<dgId>_editor`.

The editor modal uses a primary-colored titlebar with a `square-pen` icon, "Edit Row" title, close button, and a visible border (`titlebar`, `iconCls="square-pen"`, `bordered`).

### Selection behaviour

Selection follows the EUI jQuery EasyUI datagrid model:

- **singleSelect mode**: plain click always selects (never toggles). Clicking an already-selected row keeps it selected.
- **Multi-select mode**: plain click clears all selections then selects the clicked row. Ctrl/Meta+click toggles individual rows.
- **onBeforeSelect** can return `false` to prevent selection.
- **selectRecord(id)** searches loaded rows for a match on the `idField` config property and delegates to selectRow.

### Click event sequence

Every click fires events in this order:

1. `onClickCell(index, field, value)` — if click target is inside a `td[data-field]`
2. Selection logic — `onBeforeSelect` → highlight → `onSelect` (or unselect for ctrl+click)
3. `onClickRow(index, row)` — always fires, regardless of selection change

Double-click fires:

1. `onDblClickCell(index, field, value)` — if inside a `td[data-field]`
2. `onDblClickRow(index, row)` — return `false` to prevent editor opening
3. Editor modal opens (only if `onDblClickRow` is not defined or did not return `false`)

### Modal padding for datagrids

When a modal contains a datagrid table, CSS automatically applies tight padding (`0.25rem`) instead of the default `p-6`, so the table fills edge-to-edge. This is controlled by:

```css
.modal-box:has(table.table) { padding: 0.25rem; }
```

Plain modals without tables keep the default `p-6` padding.

### Bridge pattern (`$.page.fn.opts`)

When a datagrid needs dynamic JS callbacks (rowStyler, loadFilter, onLoadSuccess, inline function editors), define them in `$.page.fn.opts` and merge with the JSON config:

```js
$.page.fn.opts = {
  rowStyler: function(index, row) {
    if (row.STATUS === 'I') return { class: 'text-error' };
  },
  loadFilter: function(data) {
    return data.rows ? data : { total: data.length, rows: data };
  }
};
$('#partbal').datagrid($.page.fn.opts);
```

The JSON config provides static columns, settings, and toolbar. The JS opts overlay dynamic callbacks. This is the correct pattern — do NOT put static columns in JS when they belong in JSON.

### Filter form reference

The mixin auto-generates the toolbar filter form with ID `<dgId>_filter`. Page JS must reference this ID:

```js
// QBE init for a toolbar filter field
$('form#partbal_filter #PART_ID_').qbe({defid:'part'});

// Form change handler for auto-reload
$('form#partbal_filter').form({
  onChange: function() {
    $('#partbal').datagrid('reload');
  }
});

// queryParams referencing the filter form
queryParams: frm2dic($('form#partbal_filter'))
```
