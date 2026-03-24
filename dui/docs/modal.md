# Modal

Dialog windows using native HTML `<dialog>` with DaisyUI modal styling, plus dynamic modal/field builders.

## Overview

Modals use the native `<dialog>` element styled with DaisyUI modal classes. They support headers, form content, and standard action footers. The unified modal plugin provides EUI-compatible jQuery methods via `$.fn.modal`, with `$.fn.dialog` and `$.fn.window` as backward-compatibility aliases.

For runtime-generated modals, `dynDialog()` creates a complete dialog from a JSON field definition, and `dynadd()` renders form fields dynamically into any container.

| Type | Path |
|------|------|
| Mixin | `html/dui/mixins/feedback.pug` |
| Plugin | `public/dui/js/plugins/modal-plugin.js` |
| Dynadd plugin | `public/dui/js/plugins/dynadd-plugin.js` |

## Mixins

### `+modal(opts)`

Renders a native `<dialog>` with DaisyUI modal structure.

### `+modal-footer`

Action bar at the bottom of a modal. Auto-adds a Cancel button as the last item.

### `+dialog(opts)` / `+window(opts)`

Aliases for `+modal`. Backward compatibility with EUI APIs.

## Parameters

### `+modal` attributes

| Attribute | Description |
|-----------|-------------|
| `id` | Dialog element ID (required for JS control) |
| `title` | Header text — rendered as bare `<h3>` by default, or inside a titlebar when `titlebar` is set |
| `titlebar` | Boolean. Renders a primary-colored title bar (`bg-primary text-primary-content`) with close button instead of bare `<h3>`. Matches the main toolbar style |
| `iconCls` | Lucide icon name displayed in the titlebar (e.g. `"square-pen"`, `"list-filter"`). Only visible when `titlebar` is set |
| `bordered` | Boolean. Adds `border border-base-300` around the modal box |
| `style` | Applied to `.modal-box` |
| `max-w` | Tailwind max-width: `sm`, `md`, `lg`, `xl`, `2xl`, `3xl` (width only, height auto) |
| `size` | Size preset with both width and height: `small` (30vw×40vh), `medium` (50vw×60vh), `large` (70vw×80vh), `fullscreen` (90vw×90vh) |
| `fullscreen` | Boolean. Shorthand for `size="fullscreen"` |
| `no-form` | Skip auto-form wrapper (use when block already contains a manual `<form>`) |

EUI compat attributes (stripped silently): `closed`, `modal`, `draggable`

### Auto-form

By default, `+modal` wraps the block content in a `<form id="{modalId}-form">`. This means `+fitem` fields inside a modal are automatically inside a form — no need to add `+form` manually.

If your modal already contains a manual `<form>` element, add the `no-form` attribute to prevent double-wrapping:

```pug
//- Auto-form (default) — block is wrapped in <form id="editwin-form">
+modal#editwin(title="Edit Record")
  +fitem('Name', {class:'textbox', name:'NAME'})

//- Manual form — no-form skips the auto-wrapper
+modal#mymodal(title="Custom" no-form)
  form#my-custom-form
    input(name="FIELD")
```

### `dynDialog(vars, buts)` parameters

Creates a modal dialog with dynamically generated form fields entirely from JS.

Available as `$.dui.fn.dynDialog()`, `window.dynDialog()`, or `$.modal.create()`.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `vars.id` | string | `'_ebox'` | Dialog element ID (reused if already exists) |
| `vars.title` | string | `'Enter Data'` | Dialog header text |
| `vars.titlebar` | boolean | `false` | Render a primary-colored title bar |
| `vars.iconCls` | string | `''` | Lucide icon name for the titlebar |
| `vars.bordered` | boolean | `false` | Add border around the modal box |
| `vars.modal` | boolean | `false` | Whether backdrop blocks interaction |
| `vars.fields` | Array | — | Field definitions (same schema as `dynadd`) |
| `buts` | Array | `[]` | Button definitions: `[{ id, text, iconCls, handler }]` |

### `dynadd(target, fields)` parameters

Renders form fields from a JSON array into a container at runtime. Available as `window.dynadd()` (via `dynadd-plugin.js`).

Used by report filters (`print-plugin.js`), part number generator (`pn_gen.js`), `dynDialog()`, and toolbar-plugin.

| Param | Type | Description |
|-------|------|-------------|
| `target` | jQuery | Container element — will be emptied before rendering |
| `fields` | Array | JSON field definitions (see field schema below) |

### `dynadd` field schema

Each element in the `fields` array is an object:

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Field name attribute |
| `type` | string | `hidden`, `label`, `combobox`, `datebox`, `textbox`, `numberbox`, `numberspinner`, `qbe`, `validator` |
| `label` | string/object | Label text, or `{ text: '...' }` with extra attributes |
| `value` | string | Preset value. Prefix with `$` to resolve via `dotval()` (e.g. `$udata.cocode`) |
| `target` | string | ID or name of an existing page field to copy data/value from |
| `data` | Array | Static combobox options: `[{ value, text }, ...]` |
| `sqlid` | string | Remote data source for combobox (loaded via `_sqlid` proxy) |
| `required` | boolean | Adds `required` attribute to the input |
| `class` | string | CSS classes. Datebox with `today` class auto-defaults to current date |

Type `validator` is skipped (no output). Type `qbe` falls back to `textbox`.

If a `<template id="dui-fitem-tpl">` exists inside the parent form, `dynadd` clones it for each field row (matching `+fitem` structure). Otherwise it creates a plain `<div class="frow">` wrapper.

## Examples

### Basic modal with form

```pug
+modal#editwin(title="Edit Record" max-w="lg")
  +fitem('Name', {class:'textbox', name:'NAME'})
  +fitem('Value', {class:'numberbox', name:'VALUE'})
  +modal-footer
    +button('Save', {color:'primary', size:'sm', 'data-action':'save'})
```

The block is auto-wrapped in `<form id="editwin-form">` — no need to add `+form` manually.

### Modal with titlebar, icon, and border

```pug
+modal#editwin(title="Edit Record" titlebar iconCls="square-pen" bordered max-w="lg")
  +fitem('Name', {class:'textbox', name:'NAME'})
  +fitem('Value', {class:'numberbox', name:'VALUE'})
  +modal-footer
    +button('Save', {color:'primary', size:'sm', 'data-action':'save'})
```

Renders a primary-colored header bar with a pen icon, "Edit Record" title text, and a circle-x close button. The modal box has a visible border.

### Simple confirmation dialog

```pug
+modal#confirm(title="Confirm Delete" max-w="sm")
  p Are you sure you want to delete this record?
  +modal-footer
    +button('Delete', {color:'error', size:'sm', 'data-action':'delete'})
```

### Modal with JS buttons option

```js
// Render buttons into .modal-action footer via the buttons option
$('#editwin').modal({
  buttons: [
    { id: 'btnSave', text: 'Save', handler: function() {
        console.log('Saving...');
        $('#editwin').modal('close');
    }},
    { id: 'btnDelete', text: 'Delete', iconCls: 'btn-error', handler: function() {
        console.log('Deleting...');
    }}
  ]
});
$('#editwin').modal('open');
```

### Dynamic dialog from JS

```js
// Create a dialog with fields and buttons entirely from JavaScript
var dlg = dynDialog({
  id: 'myDialog',
  title: 'Enter Details',
  modal: true,
  fields: [
    { id: 'QTY',  type: 'numberbox', label: 'Quantity' },
    { id: 'NOTE', type: 'textbox',   label: 'Remarks' }
  ]
}, [
  {
    text: 'Save',
    handler: function() {
      var qty  = $('#myDialog [name="QTY"]').val();
      var note = $('#myDialog [name="NOTE"]').val();
      console.log('Save:', qty, note);
      $('#myDialog').modal('close');
    }
  }
]);
dlg.modal('open');
```

### Dynamic fields with dynadd

```js
// Build report filter fields dynamically into a container
var $filters = $('#report-filters');
dynadd($filters, [
  { id: 'DATE_FROM', type: 'datebox', label: 'From Date', class: 'today' },
  { id: 'DATE_TO',   type: 'datebox', label: 'To Date',   class: 'today' },
  { id: 'STATUS',    type: 'combobox', label: 'Status',
    data: [{ value: 'O', text: 'Open' }, { value: 'C', text: 'Closed' }] },
  { id: 'PART_ID',   type: 'combobox', label: 'Part', target: 'ID' },
  { id: 'HIDDEN_CO', type: 'hidden',   value: '$udata.cocode' }
]);
```

## Output

```pug
.p-4.flex.gap-2
  +button('Basic Modal', {id:'btn-open-basic', color:'primary', size:'sm'})
  +button('Titlebar Modal', {id:'btn-open-titlebar', color:'secondary', size:'sm'})

+modal#editwin(title='Edit Record' max-w='sm')
  +fitem('Name', {name:'NAME'})
  +fitem('Value', {class:'numberbox', name:'VALUE'})
  +modal-footer
    +button('Save', {color:'primary', size:'sm', 'data-action':'save'})

+modal#titlewin(title='Edit Details' titlebar iconCls='square-pen' bordered max-w='sm')
  +fitem('Part ID', {name:'PART_ID'})
  +fitem('Quantity', {class:'numberbox', name:'QTY'})
  +modal-footer
    +button('Save', {color:'primary', size:'sm', 'data-action':'save'})
```

```js
// Open basic modal
$('#btn-open-basic').on('click', function() {
  $('#editwin').modal('open');
});

// Open titlebar modal
$('#btn-open-titlebar').on('click', function() {
  $('#titlewin').modal('open');
});

// Initialize Lucide icons for titlebar
if (window.lucide) lucide.createIcons({ nodes: document.querySelectorAll('#output-rendered [data-lucide]') });
```

## JS API

### Modal plugin (`$.fn.modal`)

The primary API. `$.fn.dialog` and `$.fn.window` are aliases — all three call the same plugin.

```js
// Initialise with options
$('#editwin').modal({ title: 'Edit', closed: true });

// Open and close
$('#editwin').modal('open');    // calls <dialog>.showModal() or $(el).show()
$('#editwin').modal('close');   // calls <dialog>.close() or $(el).hide()

// Set title at runtime
$('#editwin').modal('setTitle', 'New Title');

// Get options object
var opts = $('#editwin').modal('options');

// Get the form inside modal-box
var $form = $('#editwin').modal('form');

// Destroy — remove from DOM
$('#editwin').modal('destroy');

// Using backward-compat aliases (identical behaviour)
$('#editwin').dialog('open');
$('#editwin').window('close');
```

### Methods

| Method | Args | Returns | Description |
|--------|------|---------|-------------|
| `options` | — | Object | Get current options object |
| `open` | — | jq | Show modal (`showModal()` for `<dialog>`, `show()` for others). Fires `onOpen` |
| `close` | — | jq | Close modal. Fires `onClose` |
| `destroy` | — | jq | Remove element from DOM and clean up data |
| `setTitle` | title | jq | Update title text — handles both titlebar `[data-modal-titlebar]` and bare `<h3>` modes |
| `form` | — | jQuery | Get the `<form>` inside `.modal-box` |
| `resize` | param | jq | No-op stub (native `<dialog>` handles sizing via CSS) |
| `move` | param | jq | No-op stub (native `<dialog>` is centered by browser) |
| `window` | — | jq | Returns self (EUI compat: `.window('window')`) |

### Options / Defaults

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | string | `null` | Dialog title text |
| `titlebar` | boolean | `false` | Render a primary-colored title bar instead of bare `<h3>` |
| `iconCls` | string | `null` | Lucide icon name for the titlebar (e.g. `'square-pen'`) |
| `bordered` | boolean | `false` | Add visible border around the modal box |
| `modal` | boolean | `false` | Whether to block background interaction |
| `closed` | boolean | `false` | Start closed (non-`<dialog>` elements are hidden) |
| `buttons` | Array | `null` | Button definitions: `[{ id, text, iconCls, handler }]` |
| `onOpen` | function | `noop` | Called after modal is shown |
| `onClose` | function | `noop` | Called after modal is closed |
| `draggable` | boolean | `true` | Enable titlebar drag-to-move (requires `titlebar`). See [Drag & Drop](drag-drop.md) |
| `onSave` | function | `noop` | Save callback (for page script use) |

### Buttons option

Pass an array of button definitions to render buttons into the `.modal-action` footer inside `.modal-box`:

```js
$('#editwin').modal({
  buttons: [
    { id: 'btnSave', text: 'Save', iconCls: 'btn-primary', handler: function() {
        // 'this' is the button element
        $('#editwin').modal('close');
    }},
    { text: 'Reset', handler: function() { /* ... */ } }
  ]
});
```

Each button definition:

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Button element ID (optional) |
| `text` | string | Button label text |
| `iconCls` | string | CSS class added to button (e.g. `btn-primary`, `btn-error`) |
| `handler` | function | Click handler — `this` is the button element |

Buttons are rendered as `<button class="btn btn-sm">` with `data-js-button="1"`. If a server-rendered Cancel button exists in `.modal-action`, JS buttons are inserted before it.

### Backward compatibility aliases

```js
// These are identical — all point to $.fn.modal
$.fn.dialog  === $.fn.modal   // true
$.fn.window  === $.fn.modal   // true

// Methods and defaults are also shared
$.fn.dialog.methods  === $.fn.modal.methods   // true
$.fn.window.defaults === $.fn.modal.defaults  // true
```

All legacy code using `.dialog(...)` or `.window(...)` works without changes.

### `dynDialog(vars, buts)` — dynamic dialog builder

Creates a native `<dialog>` with form fields from JSON, appends it to `document.body`, and returns the jQuery element.

```js
var dlg = dynDialog({
  id: 'enterQty',
  title: 'Enter Quantity',
  modal: true,
  fields: [
    { id: 'QTY', type: 'numberspinner', label: 'Qty', required: true },
    { id: 'WAREHOUSE', type: 'combobox', label: 'Warehouse', sqlid: 'inv^warehouselist' }
  ]
}, [
  { text: 'OK', handler: function() {
      var qty = $('#enterQty [name="QTY"]').val();
      // process...
      $('#enterQty').modal('close');
  }}
]);
dlg.modal('open');
```

- If a dialog with the same `id` already exists, returns the existing element (not recreated)
- Fields rendered via `dynadd()` into a `<form>` inside the dialog
- Buttons rendered via the `buttons` option into `.modal-action`
- Returns jQuery element for chaining
- Also available as `$.modal.create(vars, buts)`

### `dynadd(target, fields)` — dynamic field renderer

Populates a container with form fields from a JSON array. Empties the container first.

```js
// Populate filter form for a report
dynadd($('#printopt-filters'), reportDef.fsql);

// Combobox with remote data source
dynadd($form, [
  { id: 'CUST', type: 'combobox', label: 'Customer', sqlid: 'sa^custlist' }
]);

// Combobox copying data from an existing page field
dynadd($form, [
  { id: 'PART_ID', type: 'combobox', label: 'Part', target: 'ID' }
]);
```

## Notes

### Print modals

The report system uses two special modals defined in `print.pug` and managed by `print-plugin.js`:
- `#dui-printopt` — Report filter dialog (uses `dynadd()` to render filter fields from `fsql`)
- `#dui-print-viewer` — Full-screen PDF viewer

These are included once via `+print-modals` in the dashboard layout.

### Backdrop click

Clicking the modal backdrop (outside the modal-box) closes the dialog. For `+modal` pug mixin, this uses the DaisyUI backdrop button. For `dynDialog()`, the backdrop has an explicit close handler.

### Titlebar drag-to-move

Modals with a `titlebar` are draggable by default — users can click and drag the titlebar to reposition the modal. The `.modal-box` is translated (not the `<dialog>`) so the backdrop stays stationary. Drag is auto-initialized when `showModal()` is called.

To disable: `$('#id').modal({ draggable: false })`.

For full details see [Drag & Drop](drag-drop.md#modal-drag-titlebar-move).

### Plugin architecture

The `modal-plugin.js` replaces the former `window-plugin.js` + `dialog-plugin.js` pair with a single unified plugin. All data is stored under the `'modal'` jQuery data key regardless of whether the element was initialised via `.modal()`, `.dialog()`, or `.window()`.

### Native `showModal()` patching

The plugin patches `HTMLDialogElement.prototype.showModal` to auto-initialize drag on any `<dialog>` with `[data-modal-titlebar]`. This means all modals get drag support regardless of whether they are opened via `.modal('open')` or `element.showModal()` directly.
