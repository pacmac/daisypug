# Toolbar

Reusable action bar for buttons, filter fields, and separators. Can be placed anywhere in a page layout.

## Overview

A toolbar is a horizontal bar with three logical sections:

```
[ Title (shrink-0) ]  [ Inputs (flex-1) ]  [ Buttons (shrink-0) ]
```

- **Title** — optional icon + text, left-aligned
- **Inputs** — filter fields in a `+form`, stretch to fill available space
- **Buttons** — CRUD buttons + custom buttons + separators, packed right

The toolbar is the single source of truth for toolbar appearance across the application. The datagrid mixin delegates to `+toolbar` internally.

| Type | Path |
|------|------|
| Mixin | `html/dui/mixins/toolbar.pug` |
| CSS | `.toolbar-sep` in `public/dui/css/components.css` |
| JSON | `json/toolbar.<pageName>_<id>.json` or `json/toolbar.<id>.json` |

## Mixins

### `+toolbar(opts)`

Renders a horizontal action bar. Accepts an optional `opts` object and supports block content for additional button children.

```pug
+toolbar#my_bar(title="Ship Lines", icon="package", asdpx="aed")
```

The `id` attribute namespaces child element IDs: `my_bar_add`, `my_bar_edit`, `my_bar_del`.
The toolbar container itself gets ID `my_bar_toolbar`.

### `+toolbar-sep`

Vertical separator between button groups. Theme-aware — adapts to both topnav (dark) and toolbar (light) backgrounds.

```pug
+toolbar#actions(title="Shipment", icon="truck")
  +toolbar-sep
  +button('Trace', {id: 'btn_trace', size: 'xs', style: 'ghost', icon: 'scan-line'})
```

## Parameters

### Toolbar attributes

All attributes can be set via pug attributes, the `opts` object, or JSON config. Priority: pug attributes > opts > JSON config.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `id` | String | — | Toolbar ID; namespaces CRUD button IDs and toolbar container ID |
| `title` | String | — | Optional title text displayed left-aligned |
| `icon` | String | — | Lucide icon name for the title (requires `title`) |
| `asdpx` | String | `""` | CRUD buttons: `a`=Add, `e`=Edit, `d`=Delete |
| `size` | String | `"md"` | Button size: `sm`, `md`, `lg` |

### Size

| Size | Button class | Icon size | Padding | Use case |
|------|-------------|-----------|---------|----------|
| `sm` | `btn-xs` | `sm` | `py-1` | Compact (datagrid rows) |
| `md` | `btn-sm` | `sm` | `py-1` | Default |
| `lg` | `btn-md` | default | `py-1.5` | Prominent (page-level) |

### `asdpx` — CRUD buttons

Each character enables a toolbar button:

| Char | Button | ID | Icon |
|------|--------|----|------|
| `a` | Add | `<id>_add` | `plus` |
| `e` | Edit | `<id>_edit` | `square-pen` |
| `d` | Delete | `<id>_del` | `trash-2` |

CRUD buttons render disabled by default (`.opacity-40.pointer-events-none`). The datagrid plugin enables Edit/Delete on row selection via `tbarEnable()`/`tbarDisable()`.

## JSON Config

Toolbars can be fully configured via JSON files, following the same pattern as datagrid JSON configs. The file is resolved as:

1. `json/toolbar.<pageName>_<id>.json` (page-specific)
2. `json/toolbar.<id>.json` (shared fallback)

### JSON schema

```json
{
  "title": "JSON Toolbar",
  "icon": "database",
  "asdpx": "aed",
  "size": "md",
  "toolbar": [
    { "type": "field", ... },
    { "type": "sep" },
    { "id": "btn_id", "text": "Label", "icon": "icon-name" }
  ]
}
```

Top-level properties (`title`, `icon`, `asdpx`, `size`) are merged with pug attributes (pug wins).

The `toolbar` array contains items routed by `type`:
- `"field"` → rendered as a `+fitem` in the inputs section
- `"sep"` → rendered as a `+toolbar-sep` in the buttons section
- anything else → rendered as a `+button` in the buttons section

### Filter fields

Fields appear in the inputs section (centre of the toolbar) wrapped in a `+form` with ID `<tbId>_filter`.

```json
{ "type": "field", "label": "Part", "id": "TB5_PART", "name": "PART_ID",
  "editor": { "type": "combobox", "options": {
    "data": [{"text":"All","value":""},{"text":"A8000","value":"A8000"}],
    "editable": false } } }
```

| Property | Type | Description |
|----------|------|-------------|
| `type` | String | Must be `"field"` |
| `label` | String | Field label text (rendered with `:` suffix via CSS) |
| `id` | String | Element ID |
| `name` | String | Form field name |
| `editor.type` | String | Widget type: `textbox`, `combobox`, `qbe`, `datebox` |
| `editor.options` | Object | Widget options (`_sqlid`, `data`, `editable`, `panelHeight`) |

### Custom buttons

Buttons appear in the buttons section (right side), after CRUD buttons.

```json
{ "id": "btn_refresh", "text": "Refresh", "icon": "refresh-cw" }
```

| Property | Type | Description |
|----------|------|-------------|
| `text` | String | Button label |
| `id` | String | Button element ID |
| `icon` | String | Lucide icon name |
| `disabled` | Boolean | Render disabled |
| `alwaysEnabled` | Boolean | Keep enabled regardless of form/datagrid state |

## Examples

### 1. Title + custom buttons

```pug
+toolbar#ship(title="Shipment Lines", icon="package")
  +button('Trace', {id: 'ship_trace', size: 'xs', style: 'ghost', icon: 'scan-line'})
  +button('Print Label', {id: 'ship_label', size: 'xs', style: 'ghost', icon: 'printer'})
```

Output:
```
┌──────────────────────────────────────────────────────────────────┐
│ 📦 Shipment Lines                          ✏ Trace  🖨 Print Label │
└──────────────────────────────────────────────────────────────────┘
```

### 2. CRUD buttons only

```pug
+toolbar#parts(asdpx="aed")
```

Output:
```
┌──────────────────────────────────────────────────────────────────┐
│                                          + Add  ✏ Edit  🗑 Delete │
└──────────────────────────────────────────────────────────────────┘
```

### 3. Title + CRUD + custom button with separator

```pug
+toolbar#bom(title="BOM Lines", icon="layers", asdpx="aed")
  +toolbar-sep
  +button('Validate', {id: 'bom_val', size: 'xs', style: 'ghost', icon: 'check-circle'})
```

Output:
```
┌──────────────────────────────────────────────────────────────────┐
│ ☰ BOM Lines                  + Add  ✏ Edit  🗑 Delete │ ✓ Validate │
└──────────────────────────────────────────────────────────────────┘
```

### 4. Buttons only (no title)

```pug
+toolbar#actions
  +button('Export', {id: 'act_export', size: 'xs', style: 'ghost', icon: 'download'})
  +toolbar-sep
  +button('Refresh', {id: 'act_refresh', size: 'xs', style: 'ghost', icon: 'refresh-cw'})
```

Output:
```
┌──────────────────────────────────────────────────────────────────┐
│                                          ↓ Export │ ↻ Refresh     │
└──────────────────────────────────────────────────────────────────┘
```

### 5. JSON-driven toolbar with fields, separators, and buttons

JSON file `json/toolbar.mypage_tbar.json`:

```json
{
  "title": "JSON Toolbar",
  "icon": "database",
  "asdpx": "aed",
  "toolbar": [
    { "type": "field", "label": "Part", "id": "TB_PART", "name": "PART_ID",
      "editor": { "type": "combobox", "options": {
        "data": [{"text":"All","value":""},{"text":"A8000","value":"A8000"}],
        "editable": false } } },
    { "type": "field", "label": "Status", "name": "STATUS",
      "editor": { "type": "combobox", "options": {
        "data": [{"text":"All","value":""},{"text":"Active","value":"A"}],
        "editable": false } } },
    { "type": "sep" },
    { "id": "tb_refresh", "text": "Refresh", "icon": "refresh-cw" },
    { "type": "sep" },
    { "id": "tb_export", "text": "Export", "icon": "download", "disabled": true }
  ]
}
```

Pug:
```pug
+toolbar#tbar
```

Output:
```
┌────────────────────────────────────────────────────────────────────────────────┐
│ 🗄 JSON Toolbar     Part: [All ▼]  Status: [All ▼]    + Add ✏ Edit 🗑 Del │ ↻ Refresh │ ↓ Export │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 6. Size variants

```pug
+toolbar#sm_bar(title="Compact", icon="minimize-2", asdpx="aed", size="sm")

+toolbar#md_bar(title="Default", icon="maximize", asdpx="aed")

+toolbar#lg_bar(title="Prominent", icon="maximize-2", asdpx="aed", size="lg")
```

### Page JS referencing toolbar filter

```js
// QBE init for a toolbar filter field
$('form#tbar_filter #TB_PART').qbe({defid:'part'});

// Form change handler for auto-reload
$('form#tbar_filter').form({
  onChange: function() {
    $('#my_datagrid').datagrid('reload');
  }
});
```

## Output

```pug
//- 1. Title + CRUD buttons
+toolbar#tb1(title="Shipment Lines", icon="package", asdpx="aed", size="sm")

//- 2. CRUD buttons only (no title)
+toolbar#tb2(asdpx="aed", size="sm")

//- 3. Title + CRUD + custom button with separator
+toolbar#tb3(title="BOM Lines", icon="layers", asdpx="aed", size="sm")
  +toolbar-sep
  +button('Validate', {id: 'tb3_val', size: 'xs', style: 'ghost', icon: 'check-circle'})

//- 4. Custom buttons only
+toolbar#tb4(size="sm")
  +button('Export', {id: 'tb4_export', size: 'xs', style: 'ghost', icon: 'download'})
  +toolbar-sep
  +button('Refresh', {id: 'tb4_refresh', size: 'xs', style: 'ghost', icon: 'refresh-cw'})

//- 5. Size variants
+toolbar#tb5sm(title="Small", icon="minimize-2", asdpx="ae", size="sm")
+toolbar#tb5md(title="Default", icon="maximize", asdpx="ae")
+toolbar#tb5lg(title="Large", icon="maximize-2", asdpx="ae", size="lg")
```

```js
if (window.lucide) lucide.createIcons({ nodes: document.querySelectorAll('#output-rendered [data-lucide]') });
```

## JS API

No dedicated JS API — toolbar is a pure server-rendered layout component. Button behaviour comes from the [button plugin](button.md). CRUD button state is managed by the datagrid plugin (`tbarEnable`/`tbarDisable`) or manually via:

```js
// Enable/disable toolbar buttons
$('#parts_edit').button('enable');
$('#parts_edit').button('disable');
```

## Notes

### 3-section layout

The toolbar renders as a single flex row with three sections:

| Section | CSS | Purpose |
|---------|-----|---------|
| Title | `.shrink-0` | Icon + title text, fixed width |
| Inputs | `.flex-1` | Filter `+fitem` fields in a `+form`, stretches to fill |
| Buttons | `.shrink-0` | CRUD + custom buttons + separators, packed right |

When there are no inputs, a `.flex-1` spacer takes their place, pushing buttons to the right.

### CSS classes

The toolbar container:
```
.flex.items-center.gap-1.px-2.bg-base-200.border-b.border-base-300
```

Toolbar filter fields get compact styling via CSS (scoped to `[id$="_toolbar"]`):
- Labels: `width: auto`, right-aligned, `0.75rem` font, `opacity: 0.6`, colon appended via `::after`
- Items: `gap: 0.25rem`, no padding, no max-width
- Form: `margin-left: 5em` gap from title

### Separator

The `+toolbar-sep` mixin renders `.toolbar-sep.self-stretch.my-1` — a 1px vertical rule that stretches to the parent height with small vertical margins.

Two CSS rules handle theme adaptation:

```css
/* Topnav context (dark background) */
.toolbar-sep {
  width: 1px;
  background: color-mix(in oklch, var(--color-primary-content) 50%, transparent);
}

/* Toolbar context (light bg-base-200 background) */
.bg-base-200 > .toolbar-sep,
.bg-base-200 > * > .toolbar-sep {
  background: color-mix(in oklch, var(--color-base-content) 30%, transparent);
}
```

### CRUD button state

CRUD buttons render disabled by default with `.opacity-40.pointer-events-none`. When used inside a datagrid, the datagrid plugin enables Edit/Delete on row selection and disables them on `clearSelections`. The Add button is always enabled once the toolbar activates.

### Relationship to datagrid

The datagrid mixin uses `+toolbar` internally to render its toolbar. The datagrid JSON config (`asdpx`, `toolbar`, `title`, `iconCls`) maps directly to toolbar parameters. This ensures a single source of truth for toolbar appearance.

### Relationship to topnav

The topnav (`+topnav`) is the main dashboard navigation bar — CRUD actions, reports, theme picker, logout. It is NOT a general-purpose toolbar. See [Topnav](topnav.md).
