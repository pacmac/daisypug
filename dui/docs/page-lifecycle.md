# Page Lifecycle

How DUI pages initialize, register hooks, and interact with the framework.

## Overview

DUI owns the page. It manages navigation, toolbar state, data loading, form mode transitions, and cleanup. A page script is a guest — it does not drive the lifecycle, it participates in it.

`$.page.register()` is the contract between a page and DUI. The page declares what it wants to handle (hooks, utility functions), and DUI agrees to call those handlers at the right moments. In return, DUI guarantees the hooks fire in order, before/after semantics are respected, and everything registered is cleaned up automatically on navigation.

A page that registers nothing is fully functional — DUI handles Add/Save/Delete/Cancel with no page code required. Registration is only needed when the page has something specific to contribute: load a child grid after a record loads, validate before save, add a custom toolbar button.

`$.page.ready()` is the entry point. It runs once when the page is active and the DOM is ready. Everything a page script does lives inside it.

| Type | Path |
|------|------|
| Plugin | `public/dui/js/plugins/page-plugin.js` |
| Namespace | `public/dui/js/plugins/dui-namespace.js` |

## Mixins

### `+script(name)`

Wraps an inline script block with an `id` attribute so panel-plugin can identify it when moving scripts to `<head>`.

**Defined in:** `html/dui/mixins/utils.pug`

```pug
mixin script(name)
  script(id=name)
    block
```

**Usage in page templates:**

```pug
block script
  +script('sa_parts')
    include js/sa_parts.js
  +script('sa_parts_bom')
    include js/sa_parts_bom.js
```

**How it works:**

1. Pug renders `+script('sa_parts')` as `<script id="sa_parts">...code...</script>` inside the page content
2. When panel-plugin loads the page via AJAX, `runInlineScripts()` finds all `<script>` tags in the response
3. Each script is moved to `<head>` with a `data-page-script` attribute (for cleanup on navigation)
4. The `id` is preserved — scripts are identifiable in `<head>` by their original filename

**Result in `<head>`:**

```html
<script id="sa_parts" data-page-script>...page code...</script>
<script id="sa_parts_bom" data-page-script>...bom code...</script>
```

**Cleanup:** On navigation, `$('head script[data-page-script]').remove()` clears the previous page's scripts before loading the next page.

**Backward compatible:** Pages using the old `script: include js/x.js` pattern still work — scripts without an `id` are moved to `<head>` anonymously. The `+script` mixin simply adds identity.

## Parameters

### `$.page.state`

| Property | Type | Description |
|----------|------|-------------|
| `pageId` | String | Current page ID (e.g. `'inv^sa_parts'`) |
| `fkey` | String | Current foreign key value |
| `mode` | String | Form mode: `null`, `'add'`, `'edit'` |
| `loading` | Boolean | `true` during data load |
| `ronly` | Boolean | `true` if page is read-only |

### `$.dui` (global state)

| Property | Description |
|----------|-------------|
| `$.dui.bhave` | Behavior settings (from `admin^bhave`) |
| `$.dui.pdata` | Global parameter data |
| `$.dui.udata` | Current user data |
| `$.dui.ronly` | Global read-only flag |
| `$.dui.runmode` | Runtime mode |

### Hook conventions

| Pattern | Behavior |
|---------|----------|
| `before*` | **Async** — receives `done()` callback. Must call `done()` to proceed. Omitting cancels the action. |
| `after*` | **Sync** — fire-and-forget, no callback. |

### Available hooks

| Hook | Called When | Signature |
|------|-----------|-----------|
| `afterLoad` | Form data loaded from server | `fn(data)` |
| `beforeAdd` | Before entering add mode | `fn(done)` |
| `afterAdd` | After entering add mode | `fn()` |
| `beforeSave` | Before form save | `fn(done)` |
| `afterSave` | After successful save | `fn(result)` |
| `beforeDelete` | Before record delete | `fn(done)` |
| `afterDelete` | After successful delete | `fn()` |
| `beforePrint` | Before report generation | `fn()` |

## Examples

### Minimal page script

```js
$.page.ready(function() {
  $.page.register({
    hooks: {
      afterLoad: function(data) {
        if (data.rows && data.rows.length > 0) {
          $('#partdg').datagrid('loadData', data);
        }
      }
    }
  });
});
```

### Validation before save

```js
$.page.ready(function() {
  $.page.register({
    hooks: {
      beforeSave: function(done) {
        var qty = parseInt($('#QTY').val(), 10);
        if (qty <= 0) {
          $.messager.alert('Error', 'Quantity must be positive');
          return;  // don't call done() — cancels save
        }
        done();
      }
    }
  });
});
```

### Page-specific utilities and events

```js
$.page.ready(function() {
  $.page.register({
    fn: {
      reloadGrid: function() {
        $('#partdg').datagrid('reload');
      }
    }
  });

  // Auto-cleanup event handlers
  $.page.on('#refreshBtn', 'click', function() {
    $.page.fn.reloadGrid();
  });

  // Auto-cleanup timers
  $.page.setInterval(fn, 1000);
  $.page.setTimeout(fn, 5000);
});
```

## JS API

### `$.page.ready(fn)`

Entry point for page scripts. Replaces `$(document).ready()`. DOM is already available when `fn` runs.

### `$.page.register(opts)`

Register hooks (`opts.hooks`), utility functions (`opts.fn`), and autonum config (`opts.autonum`).

| Key | Type | Description |
|-----|------|-------------|
| `hooks` | Object | Hook functions keyed by name (see Available Hooks) |
| `fn` | Object | Page utility functions → merged into `$.page.fn` |
| `autonum` | Object | Auto-number config → stored on `$.page.autonum` |

### `$.page.hook(name, ...args)`

Invoke a hook by name. Used internally by plugins (form-plugin, toolbar-plugin), not by page scripts. If no hook is registered, `before*` hooks call `done()` immediately, `after*` hooks are no-ops.

### `$.page.on(selector, event, handler)`

Attach an event handler that auto-removes on page navigation.

### `$.page.setInterval(fn, ms)` / `$.page.setTimeout(fn, ms)`

Timers that auto-clear on page navigation.

### `$.page.fn.*`

Page-specific utility functions registered via `$.page.register()`. Cleared on navigation via `$.page.reset()`.

### `$.page.autonum`

Auto-number configuration registered via `$.page.register({ autonum: {...} })`. Cleared on navigation via `$.page.reset()`.

| Property | Type | Description |
|----------|------|-------------|
| `field` | String | jQuery selector for the autonum field (e.g. `'#QUOTE_ID'`) |
| `type` | String | NNG type code — the `TYPE` value from the `NNG` table (e.g. `'QUOTE'`, `'SO'`, `'PO'`) |

---

## Auto-Number (NNG)

Pages that generate sequential IDs on Add (quotes, sales orders, purchase orders, gate passes, etc.) declare their autonum config via `$.page.register()`. This is the **single source of truth** — no `.autonum` CSS class is involved.

### How it works

1. **Add** — form-plugin reads `$.page.autonum`, finds the field, blanks its value, sets placeholder to `-AUTONUMBER-`, and makes it non-editable
2. **Save** — form submits with blank ID field. Server-side `PURE_NNG` stored procedure generates the next number, inserts the record, and returns `{ _next, _key }` in the response. Form-plugin reads `data._next`, populates the field, restores editability and placeholder, and triggers `fkeyLoad` to reload the form with the new record
3. **Cancel** — toolbar-plugin restores the field's original placeholder and editability

### Page declaration

```js
$.page.ready(function() {
  $.page.register({
    autonum: { field: '#QUOTE_ID', type: 'QUOTE' }
  });
});
```

### Server request/response

Request (`_func=add`, ID field is blank):
```
QUOTE_ID=&QUOTE_FORMAT=STANDARD&STATUS=A&...
&_sqlid=sales%5Equotehead&_func=add
```

Response:
```json
{
  "error": false,
  "msg": "QUOTE_ID next number QUOTE-0006-26 OK.",
  "_next": "QUOTE-0006-26",
  "_key": "QUOTE_ID"
}
```

### Plugin responsibilities

| Plugin | Action |
|--------|--------|
| `page-plugin.js` | Stores `autonum` config on `$.page.autonum`, clears on `$.page.reset()` |
| `form-plugin.js` | Reads `$.page.autonum` in `beginAdd()` and save success handler |
| `toolbar-plugin.js` | Reads `$.page.autonum` in cancel handler to restore field state |

### Supported widget types

| Widget | Add behavior | Save success behavior |
|--------|-------------|----------------------|
| `combobox` | `editbox()` swap (existing) | `editbox(next)` reload (existing) |
| `searchbox` | Blank + non-editable + `-AUTONUMBER-` placeholder | Restore editable + set value + `fkeyLoad` |

### Pages using autonum

| Page | Field | Type | Widget |
|------|-------|------|--------|
| `sales/quote_man` | `#QUOTE_ID` | `QUOTE` | searchbox |
| `sales/sa_sorder` | `#ORDER_ID` | `SO` | searchbox |
| `sales/sa_ship` | `#SHIP_ID` | `SHIP` | searchbox |
| `inv/purchase_manager` | `#ORDER_ID` | `PO` | qbe/searchbox |
| `inv/inv_gpass` | `#GATEPASS_ID` | `GATEPASS` | qbe/searchbox |

> **Note:** The `type` value must match the `TYPE` column in the `NNG` table for the relevant module. Check `Sales → Masters → Next Numbers` (or equivalent) to find the correct type code.

## Notes

### Migration from EUI

| EUI (dwap) | DUI |
|------------|-----|
| `dwap.page.loadData = fn` | `$.page.register({ hooks: { afterLoad: fn }})` |
| `dwap.page.onBeforePrint = fn` | `$.page.register({ hooks: { beforePrint: fn }})` |
| `dwap.page.customFn = fn` | `$.page.register({ fn: { customFn: fn }})` |
| `dwap.bhave` | `$.dui.bhave` |
| `dwap.udata` | `$.dui.udata` |
| `dwap.pdata` | `$.dui.pdata` |
| `dwap.ronly` | `$.dui.ronly` |
| `dwap.appid` | `$.page.state.pageId` |
| `dwap.runmode` | `$.dui.runmode` |

---

## Toolbar Button Control

The top nav has five standard buttons: **Add**, **Save**, **Delete**, **Cancel**, **Print**. The form plugin owns their state when a form with `asdpx` is on the page. Pages that need non-standard button behaviour work through three mechanisms.

### 1. `asdpx` — declare which buttons the form uses

Set on the `+form` element. The form plugin reads this and automatically enables/disables the correct buttons as the form moves between view/add/edit states. No JS needed for standard CRUD.

```pug
+form#head(class='single fit', _sqlid='inv^partall', asdpx='asdx')
```

| Character | Button |
|-----------|--------|
| `a` | Add |
| `s` | Save |
| `d` | Delete |
| `x` | Cancel |
| `p` | Print |

Pages without a form (dashboards, report viewers) call `butEn()` directly:

```js
butEn('');        // disable all
butEn('a');       // Add only
butEn('asdx');    // Add + Save + Delete + Cancel
```

**Important:** when a form with state machine is active, `butEn()` calls from page scripts are silently intercepted and ignored. The form plugin is authoritative — do not fight it.

---

### 2. `toolbut()` — add custom buttons to the toolbar

Appends page-specific buttons to the `#toolbut` slot (right side of toolbar). These persist alongside the standard buttons.

```js
$.page.ready(function() {
  toolbut([
    { id: 'btn_approve', text: 'Approve', iconCls: 'icon-ok', onclick: function() {
      // approval logic
    }},
    {},  // vertical separator
    { id: 'btn_reject', text: 'Reject', iconCls: 'icon-cancel', onclick: function() {
      // rejection logic
    }}
  ]);
});
```

Button definition properties:

| Property | Description |
|----------|-------------|
| `id` | Button element ID (auto-derived from `text` if omitted) |
| `text` | Button label |
| `iconCls` | Icon class (e.g. `'icon-ok'`, `'aicon-print'`) |
| `onclick` | Click handler function |
| `noText` | `true` — icon-only, no label text |

Pass an empty object `{}` to insert a vertical separator.

---

### 3. Hooks — intercept standard button actions

Use `beforeSave`, `beforeDelete`, `beforeAdd` to intercept and optionally cancel standard button actions. Use `afterSave`, `afterDelete`, `afterLoad` for post-action work.

```js
$.page.ready(function() {
  $.page.register({
    hooks: {
      // Block save with custom validation
      beforeSave: function(done) {
        var status = $('#STATUS').combobox('getValue');
        var approver = $('#APPROVER_ID').val();
        if (status === 'APPROVED' && !approver) {
          $.messager.alert('Validation', 'Approved records require an Approver.');
          return;  // do NOT call done() — save is cancelled
        }
        done();  // proceed with save
      },

      // Reload child datagrid after form loads
      afterLoad: function(data) {
        $('#lines').datagrid('load', { ID: data.ID });
      },

      // Redirect after delete
      afterDelete: function() {
        $('#head').form('clear');
        butEn('a');
      }
    }
  });
});
```

---

### 4. Pages without a form (no state machine)

Pages that show dashboards, reports, or custom views with no `+form` must manage buttons manually. The form state machine is not active so `butEn()` calls work directly.

```js
$.page.ready(function() {
  butEn('');  // start with all disabled

  $('#filterBtn').on('click', function() {
    loadReport();
  });

  function loadReport() {
    butEn('');  // disable while loading
    // ... load data ...
    butEn('p'); // enable Print when done
  }
});
```

---

### Summary — who owns the buttons

| Scenario | Who controls buttons |
|----------|---------------------|
| Form with `asdpx` present | **Form plugin** — automatic, do not call `butEn()` |
| Custom toolbar buttons | **`toolbut()`** — add to `#toolbut` slot |
| No form on page | **Page script** — call `butEn()` directly |
| Intercept Add/Save/Delete | **`$.page.register({ hooks: {...} })`** |
