---
name: remember
title: Remember (Persistent State)
description: Save and restore component state across page loads via localStorage
category: Guides
order: 10
---

## Usage

The remember system saves component state to localStorage and auto-restores on page load. Components opt in with the `.remember` class and an `id`.

### Opt-in via Class

```pug
//- Tabs — remembers active tab
+tabs({style: 'lift', class: 'remember'})(id="my-tabs")

//- Combobox — remembers selected value
+dp-fitem('Status', {class: 'combobox remember', name: 'STATUS', id: '~'})

//- Dock — remembers active panel
+dock({size: 'sm', class: 'remember'})(id="main-dock")
```

### Opt-in via JS

```js
dp.remember('#my-tabs');
dp.remember('#my-combo');
dp.remember(document.getElementById('my-dock'));
```

### Auto-init

All elements with `.remember` class and an `id` are automatically initialized after component discovery. No manual calls needed.

### Supported Components

| Component | Saves | Restores via |
|-----------|-------|-------------|
| Tabs | active tab index | `setActive(n)` |
| Select/Combobox | selected value | `setValue(v)` |
| Checkbox/Toggle | checked state | `setChecked(bool)` |
| Input/Textbox | value | `setValue(v)` |
| Range | value | `setValue(n)` |
| Dock | active index | `setActive(n)` |
| Menu | active index | `setActive(n)` |
| Rating | value | `setValue(n)` |
| Vsplit/Hsplit | grid template | style update |

### Storage Format

- Key: `dp:rem:<scope>:<elementId>`
- Value: `{ v: <value>, t: <timestamp> }`
- Scope defaults to current page path
- TTL: 30 days (configurable)

## Code

### API

```js
// Get/set manually
dp.remember.get('my-tabs')              // saved value or null
dp.remember.get('my-tabs', '_global')   // with custom scope
dp.remember.set('my-tabs', 2)           // save value
dp.remember.set('nav', 'parts', '_global')  // global scope

// Remove
dp.remember.remove('my-tabs')

// Clear
dp.remember.clear()                     // clear current page
dp.remember.clear('custom-scope')       // clear specific scope
dp.remember.clearAll()                  // clear everything

// Configure TTL
dp.remember.ttl = 7                     // 7 days
dp.remember.ttl = 0                     // never expire

// Manual init
dp.rememberAll()                        // init all .remember[id] elements
```

### Global Scope

Use `_global` scope for app-level state not tied to a specific page:

```js
// Last visited page
dp.remember.set('last-page', '/inventory', '_global');
const last = dp.remember.get('last-page', '_global');
```

## Examples

### Tabs that remember selection

```pug
+tabs({style: 'lift', class: 'remember'})(id="detail-tabs")
  +tab({name: 'detail', label: 'General', active: true})
  +tab-content
    //- ...
  +tab({name: 'detail', label: 'Advanced'})
  +tab-content
    //- ...
```

User clicks "Advanced" → saved. Next page load → "Advanced" auto-selected.

### Combobox that remembers selection

```pug
+dp-fitem('Component', {class: 'combobox remember', name: 'COMP', id: '~', options: [...]})
```

### Dock that remembers panel

```pug
+dock({size: 'sm', class: 'remember'})(id="nav-dock")
```
