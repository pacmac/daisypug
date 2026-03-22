---
name: dp-toolbar
description: Action bar with title, icon, CRUD buttons via asdpx shorthand
category: Layout
base: dp-toolbar
---

## Usage

`+dp-toolbar(opts)` renders a horizontal action bar with three sections: title, inputs, and buttons. The `asdpx` shorthand generates standard CRUD buttons with Lucide icons.

### Options

| Option | Type | Description |
|--------|------|-------------|
| `title` | string | Title text (left-aligned) |
| `icon` | string | Lucide icon name for title |
| `asdpx` | string | CRUD button shorthand |
| `size` | string | Button size: sm, md (default), lg |
| `id` | string | Namespaces button IDs |

### asdpx Characters

| Char | Button | Icon | ID suffix |
|------|--------|------|-----------|
| `a` | Add | plus | `_add` |
| `s` | Save | save | `_save` |
| `e` | Edit | square-pen | `_edit` |
| `d` | Delete | trash-2 | `_del` |
| `p` | Print | printer | `_print` |
| `x` | Cancel | x | `_cancel` |

CRUD buttons render disabled by default (except Add). Enable/disable via dp.js.

### Sub-mixins

- `+dp-toolbar-sep` — vertical separator between button groups

## Code

```pug
//- Title + CRUD
+dp-toolbar({title: 'Parts', icon: 'box', asdpx: 'aed'})

//- With custom buttons
+dp-toolbar({title: 'BOM', icon: 'layers', asdpx: 'aed'})
  +dp-toolbar-sep
  +btn({size: 'xs', style: 'ghost'})
    +dp-icon('check-circle', {size: 'sm'})
    |  Validate

//- Form CRUD
+dp-toolbar({title: 'Order', icon: 'shopping-cart', asdpx: 'asdx'})

//- No title, custom buttons only
+dp-toolbar
  +btn({size: 'xs', style: 'ghost'})
    +dp-icon('refresh-cw', {size: 'sm'})
    |  Refresh
  +dp-toolbar-sep
  +btn({size: 'xs', style: 'ghost'})
    +dp-icon('download', {size: 'sm'})
    |  Export
```

## Examples

<div class="bg-base-100 rounded-lg overflow-hidden">
  <div class="dp-toolbar flex items-center gap-1 px-2 py-1 bg-base-200 border-b border-base-300">
    <div class="flex items-center gap-1.5 shrink-0 mr-2"><i data-lucide="box" style="width:16px;height:16px"></i><span class="font-semibold text-sm">Parts List</span></div>
    <div class="flex-1"></div>
    <div class="flex items-center gap-1 shrink-0">
      <button class="dp-btn btn btn-sm btn-ghost"><i data-lucide="plus" style="width:16px;height:16px"></i> Add</button>
      <button class="dp-btn btn btn-sm btn-ghost btn-disabled"><i data-lucide="square-pen" style="width:16px;height:16px"></i> Edit</button>
      <button class="dp-btn btn btn-sm btn-ghost btn-disabled"><i data-lucide="trash-2" style="width:16px;height:16px"></i> Delete</button>
    </div>
  </div>
</div>
