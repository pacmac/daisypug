# Searchbox

Type-to-search widget for large datasets with multi-column dropdown, filters, recents, and field mapping.

## Overview

The searchbox is a composite widget that replaces EUI's QBE (Query By Exception). It combines a search input with a dropdown showing tabular results, optional filter fields, recent selections, and automatic field population when a result is selected.

The widget is split across three layers:

| Layer | Path | Role |
|-------|------|------|
| Pug mixin | `html/dui/mixins/input.pug` (`+searchbox`) | Server-renders the DOM: input, dropdown shell, table headers, filter fields, row template |
| JSON config | `html/dui/json/searchbox.<entity>.json` | Defines endpoint, columns, filters, field mappings — one per search entity |
| JS plugin | `public/dui/js/plugins/searchbox-plugin.js` | Client-side: search, pagination, keyboard nav, recents, filter apply, field population |
| CSS | `public/dui/css/searchbox.css` | Dropdown positioning, table layout, filter accordion, status bar |

### How it works

1. **Server** renders the searchbox input + dropdown skeleton (table headers, filter fitems, row `<template>`)
2. **Plugin** reads the JSON config from `data-searchbox` (base64-encoded) and wires events
3. **User clicks** the input → dropdown opens showing table headers and any recent selections
4. **User types** → plugin debounces, sends AJAX request with search term + filter values
5. **Results arrive** → plugin clones the `<template>` row for each result and populates cells
6. **User selects a row** → plugin sets the searchbox value and populates mapped form fields via the `fields` array

## Mixins

### `+searchbox(opts)`

Renders inside `+fitem()`. The mixin builds the complete DOM structure including dropdown, filters, and row template.

```pug
+fitem('Search Part', {class:'searchbox fkey', name:'PART_ID', id:'BD_SEARCH', sbref:'part'})
```

The `class:'searchbox'` triggers the searchbox mixin inside `+fitem`. The `sbref` property tells the mixin which shared JSON config to load.

#### DOM structure produced

```
span.searchbox-wrap
  input.input[type=search][eui=searchbox][data-searchbox=<base64 JSON>]
  .searchbox-dropdown
    .searchbox-filters                    ← only if filters[] defined
      .searchbox-filters-hdr
      .searchbox-filters-body
        .searchbox-filters-grid
          .fitem (per filter)             ← standard +fitem() — inherits framework styling
        .searchbox-filters-actions
          button.searchbox-filters-apply
          button.searchbox-filters-clear
    .searchbox-list
      table.searchbox-table               ← only if columns[] defined
        thead > tr > th (per column)
        tbody
    .searchbox-recents
      .searchbox-recents-hdr
      table.searchbox-table > tbody
    .searchbox-status
    template.searchbox-row-tpl            ← cloned per result row
      tr.searchbox-item > td (per column)
```

## Parameters

### JSON config properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `url` | String | `null` | Endpoint URL for search requests |
| `queryParams` | Object | `{}` | Extra params sent with every request (e.g. `_sqlid`, `_func`) |
| `valueField` | String | `"value"` | Row field used as the selected value |
| `textField` | String | `"text"` | Row field displayed in the input after selection |
| `searchParam` | String | `"q"` | Query parameter name for the search term |
| `searchSuffix` | String | `""` | Appended to search term (e.g. `"%"` for SQL LIKE) |
| `pageSize` | Number | `20` | Results per page |
| `maxRecents` | Number | `5` | Max recent selections stored in localStorage |
| `autocomplete` | String | `"off"` | Browser autocomplete attribute |
| `delay` | Number | `300` | Debounce delay (ms) before searching |
| `minChars` | Number | `2` | Minimum characters before search triggers |
| `columns` | Array | `[]` | Column definitions for the results table |
| `filters` | Array | `[]` | Filter field definitions for the filter accordion |
| `fields` | Array | `[]` | Field mappings — populate form fields when a row is selected |

### Column definition

Each entry in `columns[]`:

| Property | Type | Description |
|----------|------|-------------|
| `field` | String | Data field name from the response row |
| `title` | String | Column header text (defaults to `field`) |
| `width` | Number | Column width in pixels |
| `align` | String | Text alignment: `"left"`, `"center"`, `"right"` |

### Filter definition

Each entry in `filters[]`:

| Property | Type | Description |
|----------|------|-------------|
| `field` | String | Query parameter name sent to the server |
| `title` | String | Label text for the filter fitem |
| `editor` | String or Object | Editor type — see below |

#### Filter editor types

Three editor types are supported:

**`textbox`** — plain text input (default):
```json
{ "field": "DESCRIPTION", "title": "Description", "editor": "textbox" }
```

**`datebox`** — date picker input:
```json
{ "field": "ORDER_DATE", "title": "Order Date", "editor": "datebox" }
```

**`combobox` with `_sqlid`** — dropdown that loads options from the server via AJAX:
```json
{
  "field": "CURRENCY_ID",
  "title": "Currency",
  "editor": {
    "type": "combobox",
    "options": { "_sqlid": "admin^curr" }
  }
}
```

The `_sqlid` is set as a DOM attribute on the rendered `<input>`. The combobox plugin reads it and loads options via `/?_func=get&_combo=y&_sqlid=<value>`. Use this for any field backed by a database lookup table (customers, vendors, currencies, departments, resources, etc.).

**`combobox` with inline `data`** — dropdown with hardcoded options (for fixed-code fields like STATUS, Y/N flags):
```json
{
  "field": "STATUS",
  "title": "Status",
  "editor": {
    "type": "combobox",
    "options": {
      "data": [
        { "value": "", "text": "All" },
        { "value": "H", "text": "On Hold" },
        { "value": "R", "text": "Released" },
        { "value": "C", "text": "Closed" }
      ]
    }
  }
}
```

Inline data entries use `{ "value": "...", "text": "..." }`. Use `"value": ""` for an "All" option that sends no filter. Only use inline data for fixed codes (STATUS, ACTIVE Y/N, GP_TYPE C/V) — never for database-backed lookups.

### Field mapping

Each entry in `fields[]`:

| Property | Type | Description |
|----------|------|-------------|
| `field` | String | Source field name from the selected result row |
| `name` | String | Target form field name (DOM `name` attribute) to populate |

When a user selects a result, the plugin iterates `fields[]` and sets each target field's value from the corresponding source field in the row data.

## Config Location (SSOT)

All searchbox JSON configs live in a single shared directory — regardless of whether they are used by one page or many:

```
html/dui/json/                          ← Single source of truth
  searchbox.part.json                   ← Part search
  searchbox.sorder.json                 ← Sales order search
  searchbox.soref_ids.json              ← SO reference search
  searchbox.job.json                    ← Job search
  searchbox.customer_ids.json           ← Customer search
  searchbox.ship_ids.json               ← Shipment search
  searchbox.po_ids.json                 ← Purchase order search
  searchbox.receipt_ids.json            ← Receipt search
  searchbox.operator.json               ← Operator search
  searchbox.gauge_ids.json              ← Gauge search
  searchbox.everslik_ids.json           ← Everslik search
  searchbox.caas_aw95.json              ← CAAS AW95 search
  searchbox.gatepass_ids.json           ← Gatepass search
  searchbox.opnrefs.json                ← Open operation refs search
```

No searchbox configs in module directories. One place, one file per search entity.

### `sbref` property

The `sbref` property on the fitem tells the mixin which config to load:

```pug
+fitem('Order ID', {class:'searchbox fkey', name:'ID', sbref:'sorder'})
```

`sbref:'sorder'` → loads `html/dui/json/searchbox.sorder.json`

That's it. No alias files, no `$ref` indirection, no per-module JSON duplication.

### Available sbref values

These map 1:1 to the EUI `qbedef.js` entries:

| sbref | EUI qbedef key | sqlid | Description |
|-------|---------------|-------|-------------|
| `part` | `part` | `inv^partid_qbe` | Part ID search with class/traceable/dimension filters |
| `sorder` | `sales_ids` | `sales^soids_qbe` | Sales order search with status combobox, date filter |
| `soref_ids` | `soref_ids` | `sales^sor_qbe` | SO reference lines with want date filter |
| `job` | `job` | `vwltsa^basid_qbe` | Job search with status combobox, want date filter |
| `customer_ids` | `customer_ids` | `vwltsa^custall_qbe` | Customer search (address, contact, currency) |
| `ship_ids` | `ship_ids` | `vwltsa^ship_ids_qbe` | Shipment search with 3 date filters |
| `po_ids` | `po_ids` | `inv^po_qbe` | Purchase order with status, order/delivery dates |
| `receipt_ids` | `receipt_ids` | `inv^receipt_ids_qbe` | Receipt search with delivery/create dates |
| `operator` | `operator` | `vwltsa^operators_qbe` | Operator search with active Y/N filter |
| `gauge_ids` | `gauge_ids` | `dqm^gauge_qbe` | Gauge search (type, department, manufacturer) |
| `everslik_ids` | `everslik_ids` | `dqm^everslik_ids_qbe` | Everslik search with status filter |
| `caas_aw95` | `caas_aw95` | `dqm^caas_aw95_qbe` | CAAS AW95 form search with status filter |
| `gatepass_ids` | `gatepass_ids` | `inv^gatepass_qbe` | Gatepass with GP type/tx type/doc type comboboxes |
| `opnrefs` | `opnrefs` | `vwltsa^opnrefs_qbe` | Open operation refs with status filter (default: Released) |

### jsonRead lookup chain

The `fn.pug.jsonRead()` function searches three locations in order:

1. **Template directory** — `html/dui/mod/<module>/searchbox.<name>.json`
2. **Template json/ subfolder** — `html/dui/mod/<module>/json/searchbox.<name>.json`
3. **Shared json/ directory** — `html/dui/json/searchbox.<name>.json`

With `sbref`, the config is always found at step 3 (shared directory).

### Legacy fallback

If no `sbref` is set, the mixin falls back to the old page-specific lookup: `searchbox.<pageName>_<elementId>.json`. This keeps existing pages working without changes.

## Examples

### Using sbref (recommended)

Pug template — just add `sbref` to point to the shared config:
```pug
+fitem('Search Part', {class:'searchbox fkey', name:'PART_ID', id:'BD_SEARCH', sbref:'part'})
+fitem('Description', {name:'BD_DESC', readonly:true})
+fitem('Part Class', {name:'BD_CLASS', readonly:true})
+fitem('UOM', {name:'BD_UOM', readonly:true})
```

JSON config (`html/dui/json/searchbox.part.json`):
```json
{
  "url": "/",
  "queryParams": {
    "_sqlid": "inv^partid_qbe",
    "_func": "get",
    "_combo": "y"
  },
  "valueField": "value",
  "textField": "text",
  "searchParam": "ID_LIKE_",
  "searchSuffix": "%",
  "maxRecents": 5,
  "autocomplete": "off",
  "pageSize": 20,
  "columns": [
    { "field": "value",        "title": "Part ID",       "width": 100 },
    { "field": "DESCRIPTION",  "title": "Description",   "width": 200 },
    { "field": "ALIAS_DESC",   "title": "Alias",         "width": 150 },
    { "field": "TRACEABLE",    "title": "Traceable",     "width": 70 },
    { "field": "PRODUCT_CODE", "title": "Product Code",  "width": 100 },
    { "field": "DIM_TRACKED",  "title": "Dimensions",    "width": 80 },
    { "field": "PART_CLASS_ID","title": "Part Class",    "width": 100 },
    { "field": "USER_1",       "title": "UDF 1",         "width": 80 },
    { "field": "USER_2",       "title": "UDF 2",         "width": 80 },
    { "field": "USER_3",       "title": "UDF 3",         "width": 80 },
    { "field": "USER_4",       "title": "UDF 4",         "width": 80 },
    { "field": "USER_5",       "title": "UDF 5",         "width": 80 }
  ],
  "filters": [
    { "field": "DESCRIPTION", "title": "Description", "editor": "textbox" },
    { "field": "ALIAS_DESC", "title": "Alias", "editor": "textbox" },
    { "field": "TRACEABLE", "title": "Traceable", "editor": {
        "type": "combobox",
        "options": {
          "data": [
            { "value": "", "text": "All" },
            { "value": "Y", "text": "Yes" },
            { "value": "N", "text": "No" }
          ]
        }
      }
    },
    { "field": "PRODUCT_CODE", "title": "Product Code", "editor": "textbox" },
    { "field": "DIM_TRACKED", "title": "Dimensions", "editor": {
        "type": "combobox",
        "options": {
          "data": [
            { "value": "", "text": "All" },
            { "value": "Y", "text": "Yes" },
            { "value": "N", "text": "No" }
          ]
        }
      }
    },
    { "field": "PART_CLASS_ID", "title": "Part Class", "editor": {
        "type": "combobox",
        "options": {
          "data": [
            { "value": "", "text": "All" },
            { "value": "FG", "text": "Finished Goods" },
            { "value": "COMP", "text": "Component" },
            { "value": "CONSUMABLE", "text": "Consumable" },
            { "value": "MAKE_STAGED", "text": "Make Staged" },
            { "value": "MAKE_NOSTAGE", "text": "Make Unstaged" }
          ]
        }
      }
    },
    { "field": "USER_1", "title": "UDF 1", "editor": "textbox" },
    { "field": "USER_2", "title": "UDF 2", "editor": "textbox" },
    { "field": "USER_3", "title": "UDF 3", "editor": "textbox" },
    { "field": "USER_4", "title": "UDF 4", "editor": "textbox" },
    { "field": "USER_5", "title": "UDF 5", "editor": "textbox" }
  ],
  "fields": [
    { "field": "DESCRIPTION",   "name": "BD_DESC" },
    { "field": "PART_CLASS_ID", "name": "BD_CLASS" },
    { "field": "UOM_ID",        "name": "BD_UOM" },
    { "field": "PRODUCT_CODE",  "name": "BD_PRODUCT" },
    { "field": "TRACEABLE",     "name": "BD_TRACE" },
    { "field": "BAL_QTY",       "name": "BD_QTY" }
  ]
}
```

### Sales order searchbox

```pug
+fitem('Order ID', {class:'searchbox fkey navi autonum', name:'ID', sbref:'sorder'})
```

### Searchbox with inline options (no JSON)

For simple cases without columns or filters:
```pug
+fitem('Search', {class:'searchbox', name:'Q', id:'SIMPLE_SEARCH', url:'/', valueField:'id', textField:'name'})
```

## Output

```pug
//- Renders a searchbox with filters, columns, and field mapping
+fitem('Search Part', {class:'searchbox fkey', name:'PART_ID', id:'BD_SEARCH', sbref:'part'})
+fitem('Description', {name:'BD_DESC', readonly:true})
+fitem('Part Class', {name:'BD_CLASS', readonly:true})
+fitem('UOM', {name:'BD_UOM', readonly:true})
```

## JS API

### jQuery plugin (`$.fn.searchbox`)

| Method | Signature | Description |
|--------|-----------|-------------|
| `getValue` | `.searchbox('getValue')` | Returns the current selected value |
| `getText` | `.searchbox('getText')` | Returns the current display text |
| `setValue` | `.searchbox('setValue', val)` | Sets value and updates display text from cached rows |
| `setText` | `.searchbox('setText', text)` | Sets display text directly |
| `clear` | `.searchbox('clear')` | Clears value, text, and hides dropdown |
| `enable` | `.searchbox('enable')` | Enables the input |
| `disable` | `.searchbox('disable')` | Disables the input and hides dropdown |
| `readonly` | `.searchbox('readonly', bool)` | Sets readonly state |
| `textbox` | `.searchbox('textbox')` | Returns the jQuery input element |
| `options` | `.searchbox('options')` | Returns the current options object |
| `destroy` | `.searchbox('destroy')` | Removes all events, state, and dropdown |

### Callbacks

| Callback | Signature | Description |
|----------|-----------|-------------|
| `onSelect` | `function(row)` | Fired when a result row is selected. `row` is the full data object |
| `onLoadSuccess` | `function(data)` | Fired after successful search response |
| `onLoadError` | `function(error)` | Fired on search request failure |
| `formatter` | `function(row)` | Custom row formatter (div mode only, not used with columns) |

### Form plugin integration

The searchbox is registered as a field type in the form plugin. `getValue`/`setValue` work automatically for form save/load cycles — no extra wiring needed.

```js
// Get value
$('#BD_SEARCH').searchbox('getValue');  // → "A8000"

// Set value programmatically
$('#BD_SEARCH').searchbox('setValue', 'A8000');

// Clear
$('#BD_SEARCH').searchbox('clear');

// Listen for selection
$('#BD_SEARCH').searchbox({ onSelect: function(row) {
  console.log('Selected:', row.value, row.DESCRIPTION);
}});
```

## Notes

### Recents

Recent selections are stored in `localStorage` via `$.remember` with a 2-day TTL. Each entry is timestamped on selection; expired entries are pruned on read. The `maxRecents` config controls how many are kept (default 5). Recents are shown below the results when the dropdown opens.

Recents are guarded against corrupt localStorage — if the stored value is not a valid array, it is silently discarded.

### QBE conflict prevention

Page scripts that call `$("#ID").qbe()` will not override searchbox elements. The QBE plugin has a guard that skips elements with `eui="searchbox"` to prevent conflicts.

### Form focusFirst exclusion

The form plugin's `focusFirst` logic excludes searchbox inputs (`[eui="searchbox"]`) to prevent a misleading blinking cursor on page load.

### Parse error visibility

If a searchbox filter's `data-options` attribute has a parse error, the parser plugin shows both `console.error` and a `$.messager` toast with error styling, so the problem is visible to developers and users.

### Dropdown positioning

The dropdown is rendered inside the page form in server HTML, then moved to `document.body` by the plugin on init. This avoids nested form issues and ensures the dropdown can overflow any container. The plugin positions it absolutely below the input.

### Filter fitems

Filter fields inside the dropdown are standard `+fitem()` calls rendered by the Pug mixin. They inherit all framework styling (label width, input height, spacing). Filter IDs are prefixed with `_sbf_` to avoid collision with main form field IDs.

Filter values with `"value": ""` (empty string) are excluded from the search query — this is the convention for "All" options.

### Click behaviour

Clicking the searchbox input always opens the dropdown, showing the table headers immediately (even before any data loads). The input is cleared ready for typing. If recents exist, they are shown below the table.

### EUI migration

The DUI searchbox replaces EUI's QBE (Query By Exception) system. The EUI equivalent used `qbedef.js` — a global JS object with named search definitions shared across pages. The DUI equivalent is `sbref` pointing to JSON configs in `html/dui/json/`.

| EUI | DUI |
|-----|-----|
| `qbedef.js` global object | `html/dui/json/searchbox.<entity>.json` configs |
| `eui.qbe_def.part` | `sbref:'part'` → `searchbox.part.json` |
| `eui.qbe_def.sales_ids` | `sbref:'sorder'` → `searchbox.sorder.json` |
| `eui.qbe_def.job` | `sbref:'job'` → `searchbox.job.json` |
| Per-page `$('#ID').qbe({defid:'...'})` | `+fitem('Label', {class:'searchbox', sbref:'<entity>'})` |
| `.combo('getValue')` | `.searchbox('getValue')` |
| `onSelect` callback | `onSelect` callback (same pattern) |

### Creating a new searchbox config

To add a new searchbox entity:

1. Create `html/dui/json/searchbox.<entity>.json` with `url`, `queryParams`, `columns`, `filters`
2. In the Pug template, add `sbref:'<entity>'` to the fitem
3. No plugin changes needed — the mixin and plugin handle everything from the JSON config
