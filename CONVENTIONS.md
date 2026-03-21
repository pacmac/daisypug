# DaisyPug Conventions

Reference for creating and maintaining DaisyUI component mixins.

## Mixin Naming

- Match the DaisyUI base class: `btn`, `card`, `navbar`, `badge`, etc.
- Sub-components use the full DaisyUI class: `card-body`, `card-title`, `navbar-start`, etc.
- No prefix — DaisyUI names are sufficiently unique.
- File names match the primary component: `mixins/btn.pug`, `mixins/card.pug`.
- Sub-component mixins live in the same file as their parent.

## Mixin Signature

All mixins follow one universal pattern:

```pug
mixin component-name(opts)
  - opts = opts || {}
  - const cls = [BASE_CLASSES, CONDITIONAL_MODIFIERS, opts.class].filter(Boolean).join(' ')
  element(class=cls)&attributes(attributes)
    if opts.text
      | #{opts.text}
    block
```

### Standard opts keys

| Key | Type | Description |
|-----|------|-------------|
| `color` | string | neutral, primary, secondary, accent, info, success, warning, error |
| `size` | string | xs, sm, md, lg, xl |
| `style` | string | outline, dash, soft, ghost, link |
| `class` | string | Extra CSS classes (Tailwind utilities) |
| `text` | string | Simple text content |

Component-specific keys are added as needed (e.g. `shape` for btn, `side` for card).

### Class building pattern

Always use this pattern — no exceptions:

```javascript
const cls = [
  'base-class',                           // always present
  opts.color && `base-${opts.color}`,     // conditional modifier
  opts.size && `base-${opts.size}`,
  opts.style && `base-${opts.style}`,
  opts.boolProp && 'base-modifier',       // boolean modifier
  opts.class                              // user's extra classes (always last)
].filter(Boolean).join(' ')
```

### Attribute passthrough

Every mixin MUST include `&attributes(attributes)` on its root element. This allows callers to pass arbitrary HTML attributes:

```pug
+btn({color: 'primary'})(id="my-btn" data-action="submit")
```

## Content Passing

Two methods, applicable to all mixins:

1. **`opts.text`** — simple text content, no nesting
2. **Pug `block`** — rich content (other mixins, HTML, mixed)

If both are present, block renders after opts.text.

## Component Tiers

### Tier 1: Flat (single element)

~20 components. Opts map directly to modifier classes.

**Template:**
```pug
mixin example(opts)
  - opts = opts || {}
  - const cls = ['example', opts.color && `example-${opts.color}`, opts.size && `example-${opts.size}`, opts.class].filter(Boolean).join(' ')
  div(class=cls)&attributes(attributes)
    if opts.text
      | #{opts.text}
    block
```

**Components:** btn, badge, link, kbd, loading, progress, skeleton, mask, status, toggle, checkbox, radio, range, input, textarea, select, file-input, divider, radial-progress, countdown

### Tier 2: Container (parent + child parts)

~24 components. Root element + sub-component mixins for children.

**Rules:**
- Parent mixin renders the root element with `block` for children
- Each sub-component gets its own mixin in the same file
- Sub-component mixins follow the same signature pattern

**Template:**
```pug
mixin parent(opts)
  - opts = opts || {}
  - const cls = ['parent', opts.class].filter(Boolean).join(' ')
  div(class=cls)&attributes(attributes)
    block

mixin parent-child(opts)
  - opts = opts || {}
  - const cls = ['parent-child', opts.class].filter(Boolean).join(' ')
  div(class=cls)&attributes(attributes)
    if opts.text
      | #{opts.text}
    block
```

**Components:** card, alert, collapse, hero, stat/stats, tooltip, indicator, chat, swap, diff, fieldset, join, stack, toast, list, dock, footer, rating, breadcrumbs, mockup-browser, mockup-code, mockup-phone, mockup-window

### Tier 3: Nested (multi-level with state)

~13 components. Shell mixin + sub-mixins + auto-emitted state markup.

**Rules:**
- Shell mixin emits the state mechanism (checkbox, dialog element, etc.)
- Auto-generate IDs when needed (`opts.id || random`)
- Sub-mixins for each structural section

**Components:** navbar, modal, dropdown, drawer, accordion, tabs, carousel, menu, steps, timeline, table, filter, calendar

## Adding a New Component

1. Check `components.yaml` for the component's base class, parts, and modifiers
2. Check `structure-analysis.md` for its tier classification
3. Create `mixins/{base}.pug` (or add to existing file for sub-components)
4. Follow the tier template above
5. Add an `include` line in `mixins/index.pug`
6. Write a test in `test/` verifying HTML output matches DaisyUI's expected structure

### Checklist

- [ ] Base class in first position of cls array
- [ ] All documented modifiers wired to opts keys
- [ ] `&attributes(attributes)` on root element
- [ ] `opts.text` + `block` support
- [ ] `opts.class` as last item in cls array
- [ ] Included in `mixins/index.pug`
- [ ] Test written and passing

## YAML Schema

When users send YAML instead of Pug, the engine converts it using these rules:

### Component node (name matches registry)

```yaml
# Shorthand — string value becomes text
btn: "Click me"

# Shorthand — flat keys become opts
btn:
  color: primary
  text: "Click me"

# Explicit — structural keys
btn:
  opts:
    color: primary
  attrs:
    id: my-btn
  text: "Click me"
  children:
    - ...
```

### Raw HTML node (name not in registry)

```yaml
# All keys except text/children become HTML attributes
h1:
  class: "text-5xl font-bold"
  text: "Welcome"
```

### Disambiguation

- `opts`, `attrs`, `children` → explicit structural mode
- `text` alone with other keys → shorthand opts mode (text is extracted, rest are opts)
- No structural keys → all keys are shorthand opts

### Registry

Components are identified by:
- Catalog key name (e.g. `button`, `card`)
- Base class name (e.g. `btn`, `card`)
- Sub-part names (e.g. `card-body`, `navbar-start`)

## Engine API

```javascript
const { renderPug, renderPage, renderYaml, yamlToPug } = require('./lib/engine');

// Fragment — returns HTML without layout wrapper
renderPug(pugString, options)

// Full page — wraps in base layout with DaisyUI CSS
renderPage(pugString, { title, theme, lang })

// YAML input — converts to Pug then renders as full page
renderYaml(yamlString, { title, theme, lang })

// YAML to Pug — conversion only, no render
yamlToPug(yamlString)
```
