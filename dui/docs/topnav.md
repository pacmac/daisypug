# Topnav

The main navigation bar — CRUD actions, reports, theme picker, logout. Rendered once in the dashboard layout.

## Overview

The topnav renders once at the top of the dashboard. Page templates never use it directly — they control button state via `asdpx` attributes on forms and datagrid JSON config. For reusable toolbars inside pages, see [Toolbar](toolbar.md).

| Type | Path |
|------|------|
| Topnav mixin | `html/dui/mixins/toolbar.pug` |
| Toolbar plugin | `public/dui/js/plugins/toolbar-plugin.js` |
| Button plugin | `public/dui/js/plugins/button-plugin.js` |

## Mixins

### `+topnav(opts)`

Complete main navbar. Included once in dashboard layout — **not used in page templates**.

| Arg | Type | Default | Description |
|-----|------|---------|-------------|
| `opts.drawerId` | String | `'dashboard-drawer'` | Sidebar drawer ID |
| `opts.layout` | String | `'drawer'` | `'drawer'` or `'sidebar'` |

### `+topnav-sep`

Vertical separator between toolbar groups.

## Parameters

### Main toolbar sections

| Section | Mixin | Button IDs |
|---------|-------|-----------|
| Navigation | `+topnav-nav` | `but_bak` |
| Actions | `+topnav-actions` | `but_add`, `but_addm`, `but_save`, `but_del`, `but_clr` |
| Output | `+topnav-output` | `but_print` (menubutton) |
| Theme | `+topnav-theme` | — |
| Session | `+topnav-session` | — (logout link) |
| Status | `+topnav-status` | `toolbar-status` |
| Brand | `+topnav-brand` | — |

### Main toolbar layout

```
[Back] | [Add Add+ Save Delete Cancel] | [Reports ▾] | [Theme ▾] | [Logout] | ...status... | PURE4
```

### Datagrid toolbar (JSON config)

Datagrid toolbars are defined in JSON config files, not in pug templates. See [Datagrid](datagrid.md) for the full `toolbar` array spec.

```json
"toolbar": [
  { "type": "field", "label": "Part", "id": "PART_ID_", "name": "PART_ID",
    "editor": { "type": "qbe", "options": { "_sqlid": "inv^partid_qbe" } } },
  { "text": "Refresh", "id": "btn_refresh", "icon": "refresh-cw" }
]
```

The datagrid mixin renders filter fields inside a `<form id="<dgId>_filter">` and buttons as `+button` elements.

### `asdpx` — CRUD button control

Forms and datagrids use `asdpx` strings to declare which CRUD buttons they need:

| Char | Button | Description |
|------|--------|-------------|
| `a` | Add | Create new record |
| `s` | Save | Save changes |
| `d` | Delete | Delete record |
| `x` | Cancel | Cancel edit |
| `p` | Print | Print/report |

**Forms:** `+form#head(asdpx='asdx')` — controls main toolbar buttons via `butEn()`
**Datagrids:** `"asdpx": "aed"` in JSON — renders buttons above the grid with IDs `<dgId>_add`, `<dgId>_edit`, `<dgId>_del`

## Examples

### Main toolbar (in dashboard layout only)

```pug
//- In dashboard_sidebar.pug:
+topnav({layout: 'sidebar'})
```

### Form controlling main toolbar

```pug
+form#head(class='single load', _sqlid='inv^partall', asdpx='asdx')
  +fitem('Part ID', {class:'combobox fkey navi', name:'PART_ID', id:'~'})
```

When a record loads, the form plugin enables Add, Save, Delete, Cancel on the main toolbar. The `asdpx` string determines which buttons are allowed.

### Datagrid with toolbar filter fields

```pug
+datagrid#partbal
```

With JSON config:
```json
{
  "asdpx": "aed",
  "toolbar": [
    { "type": "field", "label": "Status", "name": "STATUS",
      "editor": { "type": "combobox", "options": {
        "data": [{"text":"All","value":""},{"text":"Active","value":"A"}],
        "editable": false } } }
  ],
  "columns": [...]
}
```

## Output

```pug
//- Main toolbar is rendered once in the dashboard layout:
+topnav({layout: 'sidebar'})
//- It is NOT used inside page templates.
//- Page templates control buttons via form asdpx and datagrid JSON config.
```

```js
// Initialize Lucide icons in the rendered toolbar
if (window.lucide) lucide.createIcons({ nodes: document.querySelectorAll('#output-rendered [data-lucide]') });
```

## JS API

### `butEn(flags, src)`

Controls which main toolbar buttons are enabled. Called by form-plugin and toolbar-plugin — **page scripts should not call this directly**.

```js
// Internal: enable Add and Save
$.toolbar.butEn('as');

// Internal: enable all CRUD + cancel
$.toolbar.butEn('asdx');
```

### Button enable/disable

```js
// Enable/disable any button
$('#but_save').button('enable');
$('#but_save').button('disable');

// Legacy alias works too
$('#but_save').linkbutton('enable');
```

### Toolbar status area

The `#toolbar-status` element can display page status messages:

```js
$('#toolbar-status').text('Saved');
```

## Notes

### Button state management

Action buttons render disabled by default (`.opacity-40.pointer-events-none`). The form plugin calls `butEn()` when form state changes:
- Record loaded → enable per `asdpx`
- Add mode → enable Save, Cancel
- No record → disable all

### Datagrid toolbar buttons

Datagrid CRUD buttons are separate from the main toolbar. They use IDs `<dgId>_add`, `<dgId>_edit`, `<dgId>_del` and are managed by `datagrid-plugin.js`. Edit/Delete auto-disable when no row is selected.

### Page scripts should not manage buttons

- **Form plugin** manages main toolbar button state via `asdpx`
- **Datagrid plugin** manages its own toolbar buttons
- **Toolbar plugin** intercepts `butEn()` calls
- Page scripts only need `loadData` hooks — button management is automatic
