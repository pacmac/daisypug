---
name: badge
description: Status indicators with dynamic text, color, icon, and click events
category: Data Display
base: badge
---

## Usage

The `badge` mixin renders a `<span>` element with DaisyUI `badge` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `color` | string | neutral, primary, secondary, accent, info, success, warning, error | Badge color |
| `size` | string | xs, sm, md, lg, xl | Badge size |
| `style` | string | outline, dash, soft, ghost | Style variant |
| `text` | string | | Text content |
| `class` | string | | Additional CSS classes |

### API (dp.js)

```js
const badge = dp('#status-badge')

// Text
badge.getText()                    // current text
badge.setText('Offline')           // update text (preserves icon)

// Color
badge.getColor()                   // 'success', 'error', etc.
badge.setColor('error')            // change color

// Style
badge.getStyle()                   // 'outline', 'soft', etc.
badge.setStyle('outline')          // change style

// Icon
badge.setIcon('wifi-off')          // add/replace Lucide icon
badge.removeIcon()                 // remove icon

// Events (inherited from DpComponent)
badge.onClick((e, badge) => {
  // toggle state on click
  if (badge.getColor() === 'success') {
    badge.setText('Offline').setColor('error').setIcon('wifi-off');
  } else {
    badge.setText('Online').setColor('success').setIcon('wifi');
  }
})
```

## Code

### Pug

```pug
//- Basic
+badge({color: 'primary', text: 'New'})
+badge({color: 'success', style: 'outline', text: 'Active'})

//- With id for API access
+badge({color: 'success', text: 'Online'})(id="status-badge")
+badge({color: 'info', text: '0'})(id="count-badge")

//- With icon (via block content)
+badge({color: 'warning'})
  +dp-icon('alert-triangle', {size: 'xs'})
  |  Warning
```

### Dynamic updates via JS

```js
// Update badge from API data
dp.on('ready', () => {
  setInterval(async () => {
    const data = await dp.fetchJson('/api/status');
    dp('#count-badge').setText(data.count);
    dp('#status-badge')
      .setText(data.online ? 'Online' : 'Offline')
      .setColor(data.online ? 'success' : 'error');
  }, 5000);
});
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <span class="dp-badge badge badge-primary">Primary</span>
  <span class="dp-badge badge badge-secondary badge-outline">Outline</span>
  <span class="dp-badge badge badge-accent badge-soft">Soft</span>
  <span class="dp-badge badge badge-info badge-lg">Info LG</span>
  <span class="dp-badge badge badge-success badge-dash">Dash</span>
  <span class="dp-badge badge badge-warning">Warning</span>
  <span class="dp-badge badge badge-error">Error</span>
</div>
