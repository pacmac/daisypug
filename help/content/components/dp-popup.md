---
name: dp-popup
description: Externally triggered popup menu — open/close from any button
category: Actions
base: dp-popup
---

## Usage

`+dp-popup(opts)` renders a hidden popup menu that can be opened/closed programmatically from any trigger. Unlike `+dropdown` (which uses `<details>` and requires an internal `<summary>` trigger), popup is designed for external triggering — e.g. a dock "More" button that opens a menu above it.

### When to use popup vs dropdown

| Use case | Component |
|----------|-----------|
| Self-contained toggle (click button → shows menu) | `+dropdown` |
| External trigger (dock button, toolbar button opens menu elsewhere) | `+dp-popup` |

### Options

| Option | Type | Description |
|--------|------|-------------|
| `position` | string | `top` (positions above anchor) or omit for below |
| `class` | string | Additional classes on wrapper |
| `menuClass` | string | Classes on the `<ul>` menu (default: `w-52`) |
| `items` | array | Declarative items: `[{text, icon, page, href}]` |

### API (dp.js) {#api}

```js
const popup = dp('#more-menu')

// Open/close — pass anchor element for auto-positioning
popup.open('#more-btn')            // position relative to button
popup.open(dp('#dock'))            // accepts DpComponent too
popup.close()
popup.toggle('#more-btn')
popup.isOpen()

// Events
popup.onOpen(fn)
popup.onClose(fn)

// Items
popup.getItems()
popup.addItem({text: 'Debug', icon: 'bug', page: 'debug'})
popup.removeItem(2)
popup.onItemClick(({text, page, index}) => {
  loadPanel(page);
})
```

Auto-closes when clicking outside the popup.

## Code

### Pug — declarative items

```pug
+dp-popup({position: 'top', items: [
  {text: 'Settings', icon: 'settings', page: 'settings'},
  {text: 'Help', icon: 'help-circle', page: 'help'},
  {text: 'Logout', icon: 'log-out', href: '/logout'},
]})(id="more-menu")
```

### Pug — manual items

```pug
+dp-popup({position: 'top'})(id="more-menu")
  ul.menu.bg-base-200.rounded-box.shadow-lg.w-52
    +dropdown-item({text: 'My Settings', icon: 'settings', page: 'user'})
    +dropdown-item({text: 'Help', icon: 'help-circle', page: 'help'})
    +dropdown-item({text: 'Online Users', icon: 'users', page: 'online'})
```

### JS — wire to dock More button

```js
dp.on('ready', () => {
  const popup = dp('#more-menu');
  const dock = dp('#main-dock');

  dock.onSelect(({panel}) => {
    if (panel === 'more') {
      popup.toggle('#main-dock');
    } else {
      popup.close();
      loadPanel(panel);
    }
  });

  popup.onItemClick(({page}) => {
    if (page) loadPanel(page);
  });
});
```

## Examples

<div style="position:relative; height:120px; background: oklch(var(--b2)); border-radius: 0.5rem; padding: 1rem;">
  <div class="dp-popup" style="position:absolute; bottom:10px; right:10px; z-index:50">
    <ul class="menu bg-base-200 rounded-box shadow-lg w-52">
      <li class="dp-dropdown-item"><a><i data-lucide="settings" style="width:16px;height:16px"></i> Settings</a></li>
      <li class="dp-dropdown-item"><a><i data-lucide="help-circle" style="width:16px;height:16px"></i> Help</a></li>
      <li class="dp-dropdown-item"><a><i data-lucide="log-out" style="width:16px;height:16px"></i> Logout</a></li>
    </ul>
  </div>
</div>
