---
name: dp-datatable
description: Data table with headers, rows, zebra striping, and pagination
category: Composites
base: dp-datatable
---

## Usage

`+dp-datatable(opts)` renders a table with optional pagination controls.

### Options

| Option | Type | Description |
|--------|------|-------------|
| `headers` | string[] | Column headers |
| `rows` | string[][] | Row data |
| `zebra` | boolean | Zebra striping |
| `size` | string | Table size |
| `pagination` | object | `{current: 1, total: 5}` |

### API (dp.js)

```js
const table = dp('.dp-datatable')
table.getData()                  // all rows
table.addRow(['Alice', '30'])
table.removeRow(0)
table.selectRow(1)
table.sort(0, 'asc')
table.filter(row => row[1] > 25)
table.toCSV()
table.toJSON()
// Pagination
table.nextPage()
table.prevPage()
table.getPage()
table.setPageSize(20)
table.onPageChange(page => console.log(page))
table.onRowClick(({data, index}) => console.log(data))
```

## Code

```pug
+dp-datatable({
  headers: ['Name', 'Age', 'Role'],
  rows: [['Alice', '30', 'Admin'], ['Bob', '25', 'User'], ['Carol', '28', 'Editor']],
  zebra: true,
  pagination: {current: 1, total: 3}
})
```

## Examples

<div class="dp-datatable">
  <table class="dp-table table table-zebra">
    <thead><tr><th>Name</th><th>Age</th><th>Role</th></tr></thead>
    <tbody>
      <tr><td>Alice</td><td>30</td><td>Admin</td></tr>
      <tr><td>Bob</td><td>25</td><td>User</td></tr>
      <tr><td>Carol</td><td>28</td><td>Editor</td></tr>
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
