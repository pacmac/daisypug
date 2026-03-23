---
name: dp-datatable
description: Data table with headers, rows, zebra striping, and flexible pagination
category: Composites
base: dp-datatable
---

## Usage

`+dp-datatable(opts)` renders a table with optional pagination controls. Columns auto-fit content width by default.

### Mixin Options

| Option | Type | Description |
|--------|------|-------------|
| `headers` | string[] | Column headers |
| `rows` | string[][] | Row data |
| `zebra` | boolean | Zebra striping |
| `size` | string | Table size (xs, sm, md, lg, xl) |
| `autoWidth` | boolean | Fit columns to content (default: true) |
| `pagination` | object | `{current: 1, total: 5}` — static pagination buttons |

### Table API (dp.js)

```js
const table = dp('.dp-datatable')

// Data CRUD
table.getData()                    // all row data
table.setData(rows)                // replace all rows
table.addRow(['Alice', '30'])      // append row
table.removeRow(0)                 // remove by index
table.updateRow(0, ['Bob', '25'])  // replace row
table.getRow(0)                    // get row data
table.getRows()                    // alias for getData
table.getCell(0, 1)                // get cell value
table.setCell(0, 1, '31')          // set cell value

// Selection
table.selectRow(1)                 // highlight row
table.deselectRow()                // clear selection
table.getSelectedRow()             // selected row data
table.getSelectedIndex()           // selected index

// Sort / Filter / Search
table.sort(0, 'asc')              // sort by column
table.filter(row => row[1] > 25)  // filter rows
table.clearFilter()                // show all
table.search('Alice')              // text search

// Export
table.toCSV()                      // CSV string
table.toJSON()                     // array of objects

// Events
table.onRowClick(({data, index}) => ...)
table.onRowDblClick(fn)
table.onRowSelect(fn)
table.onCellClick(({value, field, rowIdx, colIdx}) => ...)
table.onSort(fn)
table.onDataChange(fn)
```

### Column Definitions (Datagrid Mode) {#columns}

Define columns for full datagrid functionality — object-based rows, hidden columns, formatters, cell styling, row styling.

#### Column properties

| Property | Type | Description |
|----------|------|-------------|
| `field` | string | Data field name (key in row object) |
| `title` | string | Display header text (defaults to `field`) |
| `width` | number/string | Column width (`120` = px, `'20%'`) |
| `hidden` | boolean | Hide column (data still loaded, not rendered) |
| `align` | string | `'left'` (default), `'right'`, `'center'` |
| `formatter` | function | `(value, row, index) → html` |
| `style` | string/function | Inline style: string or `(value, row, index) → style` |
| `cellClass` | string/function | Cell class: string or `(value, row, index) → className` |
| `headerClass` | string | Class for the `<th>` element |
| `headerStyle` | string | Inline style for the `<th>` element |
| `editor` | object | Editor config for row-edit modal (see [Editor Modal](#editor)) |

#### Setup

```js
const table = dp('.dp-datatable')

table.columns([
  { field: 'PART_ID', title: 'Part ID', width: 120 },
  { field: 'DESCRIPTION', title: 'Description', width: 250 },
  { field: 'QTY', title: 'Qty', width: 80, align: 'right',
    formatter: (v) => Number(v).toLocaleString() },
  { field: 'STATUS', title: 'Status', width: 80,
    formatter: (v) => v === 'A'
      ? '<span class="badge badge-success badge-sm">Active</span>'
      : '<span class="badge badge-error badge-sm">Inactive</span>',
    cellClass: (v) => v === 'A' ? 'text-success' : 'text-error' },
  { field: 'ROWID', hidden: true },
])

table.idField('ROWID')
```

#### Object-based rows

When columns are defined, all data methods work with objects:

```js
table.setData([
  { PART_ID: 'A8000', DESCRIPTION: 'Hydraulic Pump', QTY: 12, STATUS: 'A', ROWID: 1 },
  { PART_ID: 'B3200', DESCRIPTION: 'Bearing Kit', QTY: 48, STATUS: 'A', ROWID: 2 },
])

table.getRow(0)          // → {PART_ID: 'A8000', DESCRIPTION: ..., ROWID: 1}
table.getData()          // → [{...}, {...}] — includes hidden fields
table.addRow({ PART_ID: 'X1', DESCRIPTION: 'New', QTY: 0, STATUS: 'A', ROWID: 99 })
table.updateRow(0, { QTY: 15 })   // merge into existing row
table.getCell(0, 'QTY')           // → 12
table.setCell(0, 'QTY', 20)
```

#### Selection by ID

```js
table.idField('ROWID')
table.selectRecord(42)     // find and select row where ROWID === 42
table.getSelectedRow()     // → {PART_ID: ..., ROWID: 42}
```

#### Show/hide columns

```js
table.hideColumn('DESCRIPTION')    // hide — data kept, column removed from DOM
table.showColumn('DESCRIPTION')    // show again
```

#### Row styler

```js
table.rowStyler((index, row) => {
  if (row.STATUS === 'I') return { class: 'opacity-40' };
  if (row.QTY < 5) return { style: 'background: oklch(0.95 0.05 25)' };
})
```

#### Sort / filter / search with fields

```js
table.sort('QTY', 'desc')                    // sort by field name
table.filter(row => row.STATUS === 'A')       // filter objects
table.search('pump')                          // searches all field values
table.groupBy(row => row.STATUS)              // group by any expression
table.groupByCol('STATUS')                    // group by field name
table.groupByCol('STATUS', v => v === 'A' ? 'Active' : 'Inactive')
```

#### Events with field info

```js
table.onCellClick(({ value, field, rowIdx, colIdx }) => {
  console.log(`Clicked ${field}=${value} on row ${rowIdx}`)
})

table.onRowDblClick(({ data, index, field, value }) => {
  console.log('Double-clicked row:', data)
})
```

### Editor Modal {#editor}

Columns with an `editor` property enable a row-edit modal. When any column has an editor, `table.rowEditor()` auto-builds a `<dialog>` modal with form fields for each editable column.

#### Editor types

| Type | Description | Options |
|------|-------------|---------|
| `textbox` | Text input | `readonly`, `required` |
| `numberbox` | Number input | `min`, `max`, `precision`, `required` |
| `combobox` | Dropdown select | `data: [{value, text}]`, `url`, `required` |
| `datebox` | Date picker | `required` |
| `textarea` | Multi-line text | `rows`, `required` |

#### Column editor config

```js
table.columns([
  { field: 'PART_ID', title: 'Part ID', width: 120,
    editor: { type: 'textbox', readonly: true } },
  { field: 'QTY', title: 'Qty', width: 80, align: 'right',
    editor: { type: 'numberbox', min: 0, precision: 0 } },
  { field: 'STATUS', title: 'Status', width: 80,
    editor: { type: 'combobox', data: [
      { value: 'A', text: 'Active' },
      { value: 'I', text: 'Inactive' },
    ]} },
  { field: 'NOTES', title: 'Notes',
    editor: { type: 'textarea', rows: 3 } },
  { field: 'ROWID', hidden: true },
])
```

#### Opening the editor

```js
// Auto-build and wire the editor modal
table.rowEditor({
  addData: { STATUS: 'A', QTY: 1 },   // defaults for new rows
  onEndEdit: ({ mode, index, row, formData }) => {
    // mode: 'add' | 'edit'
    dp.post('/api/parts', row).then(() => table.loadData('/api/parts'));
  },
  onValidateRow: ({ index, row }) => {
    if (row.QTY <= 0) return 'Qty must be > 0';
    // return string to show error; return falsy to proceed
  },
  onDeleteRow: ({ index, row }) => {
    dp.delete('/api/parts/' + row.ROWID);
  },
})

// Editor opens on:
// - Double-click row (edit mode)
// - Programmatic: table.editRow(index) or table.addRow()
```

#### How it works

1. `rowEditor()` creates a `<dialog>` with form fields from column editor definitions
2. Hidden columns without editors become `<input type="hidden">` (data round-trips)
3. **Add**: clears form, applies `addData` defaults, opens modal
4. **Edit**: fills form with selected row data by field name, opens modal
5. **Save**: collects form values → runs `onValidateRow` → calls `onEndEdit` → updates grid → closes modal

### Pagination

Two modes: client-side (all data in browser) or server-side (fetch each page from API).

#### Client-side pagination

```js
// Load all data, paginate locally
table.paginate({ pageSize: 20 })
table.nextPage() / table.prevPage()
table.setPage(3)
table.getPageCount()
```

#### Server-side pagination

```js
// Fetch each page from API
table.loadData('/api/users', {
  pagination: true,
  pageSize: 20,
})
// → GET /api/users?page=1&limit=20

// Custom query params
table.paginate({
  url: '/api/users',
  pageSize: 20,
  pageParam: 'p',        // default: 'page'
  sizeParam: 'per_page', // default: 'limit'
})
```

#### Response format adapters

Different APIs return data differently. Use `parse` to adapt:

```js
// Default: { rows: [], total: 500 }
table.paginate({ url, parse: DpDataTable.parsers.default })

// Meta style: { data: [], meta: { total: 500 } }
table.paginate({ url, parse: DpDataTable.parsers.meta })

// Spring Boot: { content: [], totalElements: 500 }
table.paginate({ url, parse: DpDataTable.parsers.spring })

// Plain array with total in header
table.paginate({ url, parse: DpDataTable.parsers.array })

// Fully custom
table.paginate({
  url: '/api/search',
  parse: (data) => ({
    rows: data.results.map(r => [r.name, r.email]),
    total: data.hits,
  }),
})
```

#### Pagination navigation

```js
table.nextPage()       // next page
table.prevPage()       // previous page
table.setPage(n)       // go to page
table.firstPage()      // first page
table.lastPage()       // last page
table.getPage()        // current page number
table.getPageCount()   // total pages
table.getTotalRows()   // total row count
table.setPageSize(50)  // change page size
table.onPageChange(({page, total, pageCount}) => ...)
```

### Row Grouping {#grouping}

Insert section headers when a group value changes. Works with pagination — groups render within each page.

#### Group by function

```js
// Group by date extracted from timestamp
table.groupBy(
  row => row[0].substring(0, 10),           // key: '2026-03-22'
  key => new Date(key).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short'
  })                                         // label: 'Sat, 22 Mar'
);
```

#### Group by column value

```js
table.groupByCol(2);                         // group by 3rd column
table.groupByCol(0, val => `Category: ${val}`);  // with formatter

// Column mode: use field name
table.groupByCol('STATUS');
table.groupByCol('STATUS', v => v === 'A' ? 'Active' : 'Inactive');
```

#### Clear grouping

```js
table.groupBy(null);
table.groupByCol(null);
```

Renders:
```
── Sat, 22 Mar ──
01:34  C-03-10  Iren
01:08  C-03-10  Iren
── Fri, 21 Mar ──
22:38  B-05-08  Peter
22:37  B-05-08  Peter
```

Group headers are `<tr class="dp-group-header">` — excluded from `getData()`, `getRow()`, `selectRow()` etc.

## Code

### Pug

```pug
+dp-datatable({
  headers: ['Name', 'Age', 'Role'],
  rows: [['Alice', '30', 'Admin'], ['Bob', '25', 'User'], ['Carol', '28', 'Editor']],
  zebra: true,
  size: 'sm',
  pagination: {current: 1, total: 3}
})
```

### Datagrid with columns

```js
dp.on('ready', () => {
  const table = dp('#parts');

  table.columns([
    { field: 'PART_ID', title: 'Part ID', width: 120 },
    { field: 'DESCRIPTION', title: 'Description', width: 250 },
    { field: 'QTY', title: 'Qty', width: 80, align: 'right' },
    { field: 'STATUS', title: 'Status', width: 80,
      formatter: (v) => v === 'A' ? 'Active' : 'Inactive',
      cellClass: (v) => v === 'A' ? 'text-success' : 'text-error' },
    { field: 'ROWID', hidden: true },
  ]);

  table.idField('ROWID');

  table.rowStyler((i, row) => {
    if (row.STATUS === 'I') return { class: 'opacity-40' };
  });

  table.setData([
    { PART_ID: 'A8000', DESCRIPTION: 'Hydraulic Pump', QTY: 12, STATUS: 'A', ROWID: 1 },
    { PART_ID: 'B3200', DESCRIPTION: 'Bearing Kit', QTY: 48, STATUS: 'A', ROWID: 2 },
  ]);

  table.onRowClick(({ data, index }) => {
    table.selectRow(index);
    console.log('Selected:', data.PART_ID);
  });
});
```

### Server-side pagination

```js
dp.on('ready', () => {
  const table = dp('.dp-datatable');

  // Load from API with server-side pagination
  table.loadData('/api/users', {
    pagination: true,
    pageSize: 10,
    parse: (data) => ({ rows: data.rows, total: data.total }),
  });

  table.onRowClick(({data, index}) => {
    console.log('Clicked row:', data);
  });

  table.onPageChange(({page, total}) => {
    console.log(`Page ${page}, ${total} total rows`);
  });
});
```

## Examples

<div class="dp-datatable">
  <table class="dp-table table table-zebra table-sm">
    <thead><tr><th style="width:1%;white-space:nowrap">Name</th><th style="width:1%;white-space:nowrap">Age</th><th style="width:1%;white-space:nowrap">Role</th><th></th></tr></thead>
    <tbody>
      <tr><td style="width:1%;white-space:nowrap">Alice</td><td style="width:1%;white-space:nowrap">30</td><td style="width:1%;white-space:nowrap">Admin</td><td></td></tr>
      <tr><td style="width:1%;white-space:nowrap">Bob</td><td style="width:1%;white-space:nowrap">25</td><td style="width:1%;white-space:nowrap">User</td><td></td></tr>
      <tr><td style="width:1%;white-space:nowrap">Carol</td><td style="width:1%;white-space:nowrap">28</td><td style="width:1%;white-space:nowrap">Editor</td><td></td></tr>
    </tbody>
  </table>
  <div class="flex justify-center mt-4">
    <div class="dp-join join">
      <button class="dp-btn btn btn-sm btn-primary join-item">1</button>
      <button class="dp-btn btn btn-sm join-item">2</button>
      <button class="dp-btn btn btn-sm join-item">3</button>
    </div>
  </div>
</div>
