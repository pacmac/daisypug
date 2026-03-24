# Print & Reports

Report menu, filter dialog, and document viewer.

## Overview

The print system manages report execution: building the Reports dropdown menu, showing a filter dialog before running, and displaying PDF/Excel output in a full-screen viewer. DOM is server-rendered by Pug mixins — the plugin only populates menu items and wires event handlers.

| Type | Path |
|------|------|
| Mixin | `html/dui/mixins/print.pug` |
| Plugin | `public/dui/js/plugins/print-plugin.js` |

## Mixins

### `+print-modals`

Renders two hidden `<dialog>` elements used by the report system. Included once in the dashboard layout — **not used in page templates**.

1. **`#dui-printopt`** — Report filter dialog. Contains a `<form#pops>` with a `#filters` container (populated by `dynadd()` at runtime) and Print/Excel buttons.
2. **`#dui-print-viewer`** — Full-screen PDF/document viewer. Contains an `<iframe>` that loads the report output.

```pug
//- In dashboard layout only:
+print-modals
```

## Parameters

### Report definitions

Reports are defined server-side and loaded into `$.page.reps` keyed by page `appId`. Each report has:

| Property | Type | Description |
|----------|------|-------------|
| `id` | String | Report identifier |
| `name` | String | Display name (shown in menu and dialog title) |
| `fsql` | Array | Filter field definitions (same schema as `dynadd()`) |
| `reptype` | String | `'pho'` for Pentaho, otherwise DiS Excel |
| `fname` | String | Report filename |
| `class` | String | Report class |
| `docref` | String | Document reference |

### Filter fields (`fsql`)

Filter fields use the same JSON schema as `dynadd()` — see [Modal](modal.md#dynadd-field-schema) for the field schema.

Special field types in `fsql`:
- `type: 'validator'` — not rendered; contains a `func` string evaluated before execution to warn or block large reports
- `type: 'hidden'` — hidden field with preset value (e.g. `value: '$udata.cocode'`)

## Examples

### Page with reports (typical pattern)

The page template does nothing special for reports — it's all automatic:

```pug
extends ../content

block content
  +form#head(class='single load', _sqlid='inv^partall', asdpx='asdpx')
    +fitem('Part ID', {class:'combobox fkey navi', name:'PART_ID', id:'~'})
```

The `p` in `asdpx` enables the Print button on the main toolbar. When the page loads, `repmenus()` populates the Reports dropdown from `$.page.reps`.

### beforePrint hook

Use `beforePrint` to inject dynamic values into the report filter:

```js
$.page.register({
  hooks: {
    beforePrint: function(vars, done) {
      vars.PART_ID = $('#PART_ID').combobox('getValue');
      if (!vars.PART_ID) {
        msgbox('Select a part first');
        return;  // don't call done() — cancels print
      }
      done(vars);
    }
  }
});
```

### afterPrint / cancelPrint hooks

```js
$.page.register({
  hooks: {
    afterPrint: function(vars) {
      // Report viewer closed — reload data
      $('#partdg').datagrid('reload');
    },
    cancelPrint: function(vars) {
      // Filter dialog cancelled
    }
  }
});
```

### Open document viewer directly

```js
// Display a document in the full-screen viewer
viewdoc('/?_func=penta&_xldata=myreport&_type=pdf');
```

## JS API

### `repmenus(node)`

Rebuilds the Reports dropdown menu for the current page. Called automatically on page navigation by the framework.

### `printmen(me)`

Opens the filter dialog for a specific report. Called when user clicks a report menu item.

### `viewdoc(url)`

Opens the full-screen document viewer with the given URL loaded in the iframe.

### `onAfterPrint()`

Cleanup function called when the document viewer closes. Fires the `afterPrint` hook.

### Hooks

| Hook | Type | Signature | Description |
|------|------|-----------|-------------|
| `beforePrint` | async | `fn(vars, done)` | Gate before filter dialog opens. Call `done(vars)` to proceed, or return without calling `done()` to cancel. |
| `afterPrint` | sync | `fn(vars)` | Fires after report viewer closes |
| `cancelPrint` | sync | `fn(vars)` | Fires when filter dialog is cancelled |

Register hooks via `$.page.register()` — see [Page Lifecycle](page-lifecycle.md).

## Notes

### Report types

- **Pentaho (`reptype: 'pho'`)** — generates PDF or XLSX via the Pentaho report server. URL is built with `_func=penta` and report parameters.
- **DiS Excel** — server-side Excel templating via `ajaxget`. Returns a download URL or opens PDF in the viewer.

### Filter dialog flow

1. User clicks a report in the Reports dropdown
2. `beforePrint` hook fires (async gate)
3. Filter dialog opens with `dynadd()`-rendered fields from `fsql`
4. User clicks Print or Excel
5. Form validates, dialog closes
6. Report executes (Pentaho URL or AJAX call)
7. Output opens in viewer iframe or downloads as file
8. On viewer close, `afterPrint` hook fires

### Print button lifecycle

The print-plugin manages the Reports button (`#but_print`) directly:
- **Enabled** when the current page has reports in `$.page.reps`
- **Disabled** when no reports exist for the page
- Page scripts should NOT manage the print button

### Global functions

For legacy compatibility, the plugin exposes `window.repmenus`, `window.printmen`, `window.viewdoc`, and `window.onAfterPrint`.
