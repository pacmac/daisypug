---
name: dp-pagelayout
description: Full page layout with drawer sidebar, navbar, and content area
category: Composites
base: dp-pagelayout
---

## Usage

`+dp-pagelayout(opts)` renders a complete page shell with a collapsible sidebar drawer, navbar, and content area. Content goes in the Pug block.

### Options

| Option | Type | Description |
|--------|------|-------------|
| `brand` | string | App name shown in navbar and sidebar |
| `nav` | array | Navbar items — string[] or {text, href}[] |
| `sidebar` | array | Sidebar menu items — string[] or {text, href, active}[] |
| `themes` | array | Theme names for switcher |
| `activeTheme` | string | Current theme |
| `drawerId` | string | Drawer toggle ID (default: `main-drawer`) |

### API (dp.js)

```js
const layout = dp('.dp-pagelayout')
layout.isSidebarOpen()
layout.toggleSidebar()
layout.openSidebar()
layout.closeSidebar()
layout.getNav()        // DpNavbar component
layout.getContent()    // content area component
```

## Code

```pug
+dp-pagelayout({
  brand: 'MyApp',
  nav: ['Home', 'About', 'Contact'],
  sidebar: [
    {text: 'Dashboard', href: '/dashboard', active: true},
    'Settings',
    'Profile',
    'Logout',
  ],
  themes: ['light', 'dark']
})
  h1 Dashboard
  p Welcome to your dashboard
  +card({style: 'border'})
    +card-body
      +card-title({text: 'Stats'})
      p Your content here
```

## Examples

<div class="dp-drawer drawer">
  <input id="demo-drawer" type="checkbox" class="drawer-toggle">
  <div class="dp-drawer-content drawer-content">
    <div class="dp-navbar navbar bg-base-100 shadow-sm">
      <div class="dp-navbar-start navbar-start"><button class="dp-btn btn btn-ghost text-xl">MyApp</button></div>
      <div class="dp-navbar-end navbar-end"><button class="dp-btn btn btn-primary btn-sm">Login</button></div>
    </div>
    <div class="dp-pagelayout-content p-4">
      <h1>Dashboard</h1>
      <p>Your content here</p>
    </div>
  </div>
  <div class="dp-drawer-side drawer-side">
    <label for="demo-drawer" class="drawer-overlay"></label>
    <ul class="dp-menu menu bg-base-200 min-h-full w-80 p-4">
      <li class="dp-menu-title menu-title">MyApp</li>
      <li class="menu-active"><a>Dashboard</a></li>
      <li><a>Settings</a></li>
      <li><a>Profile</a></li>
    </ul>
  </div>
</div>
