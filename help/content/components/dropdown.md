---
name: dropdown
description: Dropdown menu with trigger, items, icons, and click events
category: Actions
base: dropdown
---

## Usage

The `dropdown` mixin renders a `<details>` element with DaisyUI dropdown classes. Supports positioning, hover mode, and declarative items with icons.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `position` | string | top, bottom, left, right | Dropdown direction |
| `end` | boolean | | Align to end |
| `hover` | boolean | | Open on hover |
| `open` | boolean | | Force open |
| `class` | string | | Additional CSS classes |

### Sub-mixins

- `+dropdown-trigger(opts)` — trigger element (renders `<summary>`)
- `+dropdown-content(opts)` — menu container (`<ul>`)
- `+dropdown-item(opts)` — individual menu item with icon

### Item Options

| Option | Type | Description |
|--------|------|-------------|
| `text` | string | Item label |
| `icon` | string | Lucide icon name |
| `page` | string | data-page attribute for SPA navigation |
| `href` | string | Link URL |
| `active` | boolean | Active state |
| `disabled` | boolean | Disabled state |

### API (dp.js)

```js
const dd = dp('#my-dropdown')

// Open/close (inherited from DpToggleable)
dd.open() / dd.close() / dd.toggle()
dd.isOpen()
dd.onOpen(fn) / dd.onClose(fn)

// Trigger
dd.trigger                          // the summary element

// Items
dd.getItems()                       // array of item elements
dd.getItemCount()
dd.getItemText(0)                   // text of item at index
dd.getItemTexts()                   // all item texts

// Dynamic items
dd.addItem({text: 'New', icon: 'plus', page: 'new'})
dd.removeItem(2)
dd.clearItems()

// Events
dd.onItemClick(({text, page, index, href}, event) => {
  // Auto-closes dropdown after click
  console.log('Selected:', text, page);
})
```

## Code

### Pug

```pug
//- Basic dropdown
+dropdown
  +dropdown-trigger({text: 'Options', class: 'btn btn-sm'})
  +dropdown-content({class: 'menu bg-base-200 rounded-box shadow-lg w-52'})
    +dropdown-item({text: 'Edit', icon: 'square-pen', page: 'edit'})
    +dropdown-item({text: 'Duplicate', icon: 'copy', page: 'dup'})
    +dropdown-item({text: 'Delete', icon: 'trash-2', page: 'del'})

//- Positioned top (e.g. above a dock)
+dropdown({position: 'top', end: true})
  +dropdown-trigger({text: 'More', class: 'btn btn-sm'})
  +dropdown-content({class: 'menu bg-base-200 rounded-box shadow-lg w-52 mb-2'})
    +dropdown-item({text: 'Settings', icon: 'settings', page: 'settings'})
    +dropdown-item({text: 'Help', icon: 'help-circle', page: 'help'})
    +dropdown-item({text: 'Logout', icon: 'log-out', href: '/logout'})

//- Hover mode
+dropdown({hover: true})
  +dropdown-trigger({text: 'Hover me', class: 'btn btn-sm'})
  +dropdown-content({class: 'menu bg-base-200 rounded-box shadow-lg w-52'})
    +dropdown-item({text: 'Option A'})
    +dropdown-item({text: 'Option B'})
```

### JS — dynamic items

```js
dp.on('ready', () => {
  const dd = dp('#more-dropdown');

  dd.onItemClick(({text, page}) => {
    if (page) loadPanel(page);
  });

  // Add item dynamically
  dd.addItem({text: 'Debug', icon: 'bug', page: 'debug'});
});
```

## Examples

<details class="dp-dropdown dropdown">
  <summary class="btn btn-sm">Options</summary>
  <ul class="dp-dropdown-content dropdown-content menu bg-base-200 rounded-box shadow-lg w-52" tabindex="0">
    <li class="dp-dropdown-item"><a><i data-lucide="square-pen" style="width:16px;height:16px"></i> Edit</a></li>
    <li class="dp-dropdown-item"><a><i data-lucide="copy" style="width:16px;height:16px"></i> Duplicate</a></li>
    <li class="dp-dropdown-item"><a><i data-lucide="trash-2" style="width:16px;height:16px"></i> Delete</a></li>
  </ul>
</details>
