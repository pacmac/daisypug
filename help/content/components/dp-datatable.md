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
table.onCellClick(({value, rowIdx, colIdx}) => ...)
table.onSort(fn)
table.onDataChange(fn)
```

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
