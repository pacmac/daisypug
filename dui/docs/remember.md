# Remember

Persistent component state across page loads via `.remember` class.

## Overview

The remember plugin saves and restores UI state (selected tab, last visited page) using `localStorage`. Components opt in by adding the `.remember` class. State is namespaced by page ID to avoid collisions, with automatic 30-day TTL expiry.

| Type | Path |
|------|------|
| Plugin | `public/dui/js/plugins/remember-plugin.js` |

## How It Works

1. A component has the `.remember` class and an `id`
2. On user interaction (tab click, page navigate), the plugin saves the value
3. On next page load, the plugin restores the saved value

Storage key format: `rem:<pageId>:<elementId>`

## Supported Components

### Tabs

Add `.remember` to a `+tabs` element. The selected tab title is saved and restored.

```pug
+tabs#detail-tabs.remember
  +tab-item('General')
    p General content
  +tab-item('Advanced')
    p Advanced content
```

User tab clicks are saved automatically. Programmatic `tabs('select', ...)` calls do **not** overwrite the remembered value — the saved tab is re-applied instead.

### Combobox

Add `.remember` to a combobox `+fitem`. The selected value is saved and restored on page load via `combobox('select', saved)`, which fires `onSelect` so dependent logic runs automatically.

```pug
+fitem('Component', {id:'~', name:'COMPONENT', class:'combobox remember', 'data-options':"editable:false, data:[...]"})
```

The element **must have an `id`** — this is used as the storage key. The `combobox('sort')` method also preserves the remembered selection.

### Navigation (last page)

The sidebar nav automatically remembers the last visited page. On app reload, the last page is restored. Uses `_global` scope so it's not tied to any specific page.

## JS API

### `$.remember.get(el, scope)`

Get saved value for an element. Returns `null` if not found, expired, or element has no `id`.

| Param | Type | Description |
|-------|------|-------------|
| `el` | Element/jQuery | The element to look up |
| `scope` | String | Optional scope override (default: current page ID) |

### `$.remember.set(el, value, scope)`

Save a value for an element.

| Param | Type | Description |
|-------|------|-------------|
| `el` | Element/jQuery | The element to save for |
| `value` | any | The value to save (serialized as JSON) |
| `scope` | String | Optional scope override (default: current page ID) |

### `$.remember.remove(el, scope)`

Remove saved value for an element.

### `$.remember.clear(pageId)`

Clear all remembered values for a specific page. If no `pageId` given, clears current page.

### `$.remember.clearAll()`

Clear all remembered values across all pages.

### `$.remember.ttl`

TTL in days (default: 30). Set to `0` to disable expiry.

## Examples

### Component plugin integration pattern

```js
// Inside a component plugin init:
if ($el.hasClass('remember') && $.remember) {
  var saved = $.remember.get($el);
  if (saved !== null) restore(saved);
}

// On state change:
if ($el.hasClass('remember') && $.remember) {
  $.remember.set($el, newValue);
}
```

### Global scope (not page-scoped)

```js
// Save with _global scope (e.g. last visited page)
$.remember.set($('#navmenu'), pageId, '_global');

// Restore
var lastPage = $.remember.get($('#navmenu'), '_global');
```

### Clear remembered state

```js
// Clear current page
$.remember.clear();

// Clear specific page
$.remember.clear('inv^sa_parts');

// Clear everything
$.remember.clearAll();
```

## Notes

### Storage

- Uses `localStorage` — persists across browser sessions
- Values stored as JSON: `{ v: value, t: timestamp }`
- Keys prefixed with `rem:` to avoid collisions with other localStorage usage
- Expired entries are cleaned up on read (lazy expiry)

### Requirements

- Element **must** have an `id` attribute — elements without an id are silently ignored
- Element must have the `.remember` class for auto-wiring (or call `$.remember` API directly)

### Scope

- By default, state is scoped to the current page (`rem:inv^sa_parts:detail-tabs`)
- Use the `scope` parameter to override (e.g. `_global` for app-level state)
- This prevents tab selections on one page from affecting another page with the same element id
