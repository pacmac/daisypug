---
name: dock
description: Bottom navigation bar with icons, labels, and active state
category: Navigation
base: dock
---

## Usage

The `dock` mixin renders a bottom navigation bar. Supports declarative items with icons and labels, or individual `+dock-item` children.

### Options

| Option | Type | Description |
|--------|------|-------------|
| `size` | string | xs, sm, md, lg, xl |
| `class` | string | Additional CSS classes |
| `items` | array | Declarative items (see below) |

### Item Options

| Option | Type | Description |
|--------|------|-------------|
| `name` | string | Item identifier / data-panel value |
| `panel` | string | Panel name (defaults to name) |
| `text` | string | Label text |
| `label` | string | Alias for text |
| `icon` | string | Icon class (e.g. `bi bi-house`) |
| `active` | boolean | Mark as active |
| `class` | string | Additional classes |

### Sub-mixins

- `+dock-item(opts)` — individual dock button with icon + label
- `+dock-label(opts)` — label span inside a dock button

### API (dp.js)

```js
const dock = dp('.dp-dock')

// Active state
dock.getActive()                    // active index (-1 if none)
dock.setActive(2)                   // set by index
dock.getActivePanel()               // data-panel of active item
dock.setActiveByPanel('settings')   // set by panel name

// Items
dock.getItems()                     // array of DpComponent
dock.getItemCount()                 // number of items
dock.getLabel(0)                    // label text at index
dock.getLabels()                    // all labels

// Events
dock.onSelect(({index, panel, label}, event) => {
  showPanel(panel)
})
dock.onChange(({index, panel}) => ...)
```

## Code

### Pug — Declarative items

```pug
+dock({size: 'sm', items: [
  {name: 'data', icon: 'bi bi-lightning-charge-fill', text: 'Data', active: true},
  {name: 'events', icon: 'bi bi-calendar-event', text: 'Events'},
  {name: 'stats', icon: 'bi bi-bar-chart', text: 'Stats'},
  {name: 'settings', icon: 'bi bi-gear', text: 'More'},
]})
```

### Pug — Individual items

```pug
+dock({size: 'sm'})
  +dock-item({name: 'home', icon: 'bi bi-house', text: 'Home', active: true})
  +dock-item({name: 'search', icon: 'bi bi-search', text: 'Search'})
  +dock-item({name: 'profile', icon: 'bi bi-person', text: 'Profile'})
```

### Pug — With panel switching

```pug
+dock({size: 'sm', class: 'bg-base-200'})(id="main-dock")

script.
  dp.on('ready', () => {
    dp('#main-dock').onSelect(({panel}) => {
      document.querySelectorAll('.panel').forEach(p => p.style.display = 'none');
      document.getElementById('panel-' + panel).style.display = '';
    });
  });
```

## Examples

<div class="dp-dock dock dock-sm bg-base-200" style="position:static">
  <button class="dock-active"><span style="font-size:1.2rem">&#9889;</span><span class="dp-dock-label dock-label">Data</span></button>
  <button><span style="font-size:1.2rem">&#128197;</span><span class="dp-dock-label dock-label">Events</span></button>
  <button><span style="font-size:1.2rem">&#128202;</span><span class="dp-dock-label dock-label">Stats</span></button>
  <button><span style="font-size:1.2rem">&#9881;</span><span class="dp-dock-label dock-label">Settings</span></button>
</div>
