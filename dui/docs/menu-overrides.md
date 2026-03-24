# Menu Overrides

Dev-only menu customisation — add new menu groups and override properties on existing system menu items.

## Overview

`data/menu-overrides.json` is loaded at server startup and applied during `/api/init` when `$.isdev` is true. It supports two operations:

- **Add** — inject new menu groups (e.g. Development sandbox pages)
- **Override** — merge extra properties onto existing system menu items (e.g. migration status indicators)

Production menus are never affected — overrides only apply in dev mode.

| Type | Path |
|------|------|
| Data | `data/menu-overrides.json` |
| Server | `lib/pages.js` — `getMenuOverrides()`, `injectMenuOverrides()` |
| Filter | `lib/routes/api.js` — override merge during `filterTree()` |
| Client | `nav-plugin.js` — `buildMenu()` renders status/badge/cls |
| Pug | `html/dui/mixins/nav.pug` — `+menuItem()` renders status/badge/cls |
| CSS | `public/dui/css/components.css` — `.status-dot`, `.menu-badge` |

## JSON Schema

```json
{
  "add": [
    {
      "id": "dev",
      "text": "Development",
      "icon": "icon-dev",
      "children": [
        { "id": "dev^sbox_pac", "text": "Sandbox PAC" }
      ]
    }
  ],
  "override": {
    "inv^sa_parts": { "status": "green" },
    "inv^tool_request": { "status": "amber" },
    "inv^cp_man": { "status": "red" }
  }
}
```

### `add` — New menu groups

Array of menu group objects. Each is prepended to the menu tree if no group with that `id` already exists. Permissions are auto-generated for all child IDs.

Standard menu node properties:

| Property | Type | Description |
|----------|------|-------------|
| `id` | String | Menu group ID |
| `text` | String | Display label |
| `icon` | String | Icon class (e.g. `icon-dev`) |
| `children` | Array | Child menu items |

### `override` — Property overrides

Object keyed by menu item ID. Values are merged onto the node copy during `filterTree()` — the original `global.$.menus` is never mutated.

#### Override properties

| Property | Type | Description |
|----------|------|-------------|
| `status` | String | `"green"`, `"amber"`, or `"red"` — renders a coloured dot before the menu text |
| `badge` | String | Short text rendered as a pill after the menu text |
| `cls` | String | CSS class(es) added to the menu `<a>` element |

Any other properties are also merged (e.g. override `text`, `icon`).

## Status Dots

The `.status-dot` CSS component renders a 7px coloured circle with a subtle glow:

| Class | Colour | Use |
|-------|--------|-----|
| `.status-dot.status-green` | `--color-success` | Migrated and verified |
| `.status-dot.status-amber` | `--color-warning` | In progress / converted but unverified |
| `.status-dot.status-red` | `--color-error` | Not started / has issues |

Status dots are a general-purpose component defined in `components.css` — usable anywhere, not just menus.

## How It Works

1. Server startup: `getMenuOverrides()` loads and caches `data/menu-overrides.json`
2. `/api/init` request: `injectMenuOverrides()` adds new groups from `add` array + auto-generates permissions
3. `filterTree()` copies each menu node, then merges any matching override properties
4. Client receives enriched menu items with `status`, `badge`, `cls` properties
5. `buildMenu()` (client-side) or `+menuItem()` (server-side) renders the visual indicators

## Examples

### Adding a dev page

Add to the `add[0].children` array:

```json
{ "id": "dev^my_test", "text": "My Test Page" }
```

The page template must exist at `html/dui/mod/dev/my_test.pug`.

### Setting migration status

Add to the `override` object:

```json
"sales^quote_man": { "status": "green" }
```

### Adding a badge

```json
"inv^sa_parts": { "status": "green", "badge": "v2" }
```

### Backward Compatibility

If the JSON file has `id` at the top level (old `devmenu.json` format), it is automatically wrapped as `{ add: [oldObj], override: {} }`.
