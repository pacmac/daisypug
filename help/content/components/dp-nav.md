---
name: dp-nav
description: Complete navbar with brand, menu items, actions, and theme switcher
category: Composites
base: dp-nav
---

## Usage

`+dp-nav(brand, opts)` renders a full navbar with brand text, navigation items, action buttons, and optional theme switcher.

### Signature

```
+dp-nav(brand, {opts})
```

| Option | Type | Description |
|--------|------|-------------|
| `items` | array | Nav items — string[] or {text, href}[] |
| `actions` | array | Action buttons — btn opts objects |
| `themes` | array | Theme names for theme-radios switcher |
| `activeTheme` | string | Currently active theme |
| `class` | string | Navbar classes (default: `bg-base-100 shadow-sm`) |

### API (dp.js)

```js
const nav = dp('.dp-nav')
nav.getBrand()             // brand text
nav.setBrand('New Brand')
nav.onNavigate((item, idx) => console.log(item))
```

## Code

```pug
+dp-nav('MyApp', {
  items: ['Home', 'About', 'Contact'],
  actions: [{text: 'Login', color: 'primary'}],
  themes: ['light', 'dark', 'cupcake']
})
```

## Examples

<div class="dp-navbar navbar bg-base-100 shadow-sm">
  <div class="dp-navbar-start navbar-start"><button class="dp-btn btn btn-ghost text-xl">MyApp</button></div>
  <div class="dp-navbar-center navbar-center hidden lg:flex">
    <ul class="dp-menu menu menu-horizontal px-1">
      <li><a>Home</a></li><li><a>About</a></li><li><a>Contact</a></li>
    </ul>
  </div>
  <div class="dp-navbar-end navbar-end"><button class="dp-btn btn btn-primary">Login</button></div>
</div>
