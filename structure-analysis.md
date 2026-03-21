# DaisyUI Component Structure Analysis

## Class Naming Pattern

All components follow a consistent convention:

```
{base}                    → component itself    (btn, card, modal)
{base}-{modifier}         → variant             (btn-primary, card-side)
{base}-{part}             → sub-component       (card-body, modal-box)
{part}-{modifier}         → sub-component variant (chat-bubble-primary)
```

## Structural Complexity Tiers

### Tier 1: Flat (single element, modifiers only)

No children or parts required. Just an element with a base class + optional modifiers.

| Component | Element | Example |
|-----------|---------|---------|
| btn | `<button>` | `<button class="btn btn-primary btn-lg">Text</button>` |
| badge | `<span>` | `<span class="badge badge-info">New</span>` |
| link | `<a>` | `<a class="link link-primary">Click</a>` |
| kbd | `<kbd>` | `<kbd class="kbd kbd-sm">A</kbd>` |
| loading | `<span>` | `<span class="loading loading-spinner loading-md"></span>` |
| progress | `<progress>` | `<progress class="progress progress-primary" value="70" max="100">` |
| skeleton | `<div>` | `<div class="skeleton h-4 w-full"></div>` |
| mask | `<div>` | `<img class="mask mask-hexagon">` |
| status | `<div>` | `<div class="status status-success"></div>` |
| toggle | `<input>` | `<input type="checkbox" class="toggle toggle-primary">` |
| checkbox | `<input>` | `<input type="checkbox" class="checkbox checkbox-primary">` |
| radio | `<input>` | `<input type="radio" class="radio radio-primary">` |
| range | `<input>` | `<input type="range" class="range range-primary">` |
| input | `<input>` | `<input class="input input-primary">` |
| textarea | `<textarea>` | `<textarea class="textarea textarea-primary">` |
| select | `<select>` | `<select class="select select-primary">` |
| file-input | `<input>` | `<input type="file" class="file-input file-input-primary">` |
| divider | `<div>` | `<div class="divider">OR</div>` |
| radial-progress | `<div>` | `<div class="radial-progress" style="--value:70">70%</div>` |
| countdown | `<span>` | `<span class="countdown"><span style="--value:42"></span></span>` |

**Mixin strategy**: Simple — params for modifiers, text content as argument or block.

### Tier 2: Container (parent + child parts)

A root element with defined child part classes. Children are structured but not deeply nested.

| Component | Root | Parts | Structure |
|-----------|------|-------|-----------|
| card | `.card` | body, title, actions | `card > card-body > [card-title, content, card-actions]` |
| alert | `.alert` | — | `alert > [icon, content]` |
| collapse | `.collapse` | title, content | `collapse > [input, collapse-title, collapse-content]` |
| hero | `.hero` | content, overlay | `hero > hero-content > [content]` |
| stat | `.stat` (in `.stats`) | figure, title, value, desc, actions | `stats > stat > [stat-figure, stat-title, stat-value, stat-desc]` |
| tooltip | `.tooltip` | — | `tooltip[data-tip] > child` |
| indicator | `.indicator` | indicator-item | `indicator > [indicator-item, child]` |
| chat | `.chat` | image, header, bubble, footer | `chat > [chat-image, chat-header, chat-bubble, chat-footer]` |
| swap | `.swap` | on, off, indeterminate | `swap > [input, swap-on, swap-off]` |
| diff | `.diff` | item-1, item-2 | `diff > [diff-item-1, diff-item-2]` |
| fieldset | `.fieldset` | legend, label | `fieldset > [fieldset-legend, label, input]` |
| join | `.join` | join-item | `join > [join-item, join-item, ...]` |
| stack | `.stack` | — | `stack > [child, child, ...]` |
| toast | `.toast` | — | `toast > [alerts or children]` |
| list | `.list` | list-row | `list > [list-row, list-row, ...]` |
| dock | `.dock` | dock-label | `dock > [button, button, ...]` |
| footer | `.footer` | footer-title | `footer > [nav > [footer-title, links...]]` |
| rating | `.rating` | rating-hidden | `rating > [input, input, ...]` |
| breadcrumbs | `.breadcrumbs` | — | `breadcrumbs > ul > [li > a]` |
| pagination | `.join` | — | `join > [btn, btn, ...]` |
| mockup-browser | `.mockup-browser` | toolbar | `mockup-browser > [mockup-browser-toolbar, content]` |
| mockup-code | `.mockup-code` | — | `mockup-code > [pre > code]` |
| mockup-phone | `.mockup-phone` | — | `mockup-phone > [artboard content]` |
| mockup-window | `.mockup-window` | — | `mockup-window > [content]` |

**Mixin strategy**: Block-based — base element rendered by mixin, children passed via Pug `block` or as structured params.

### Tier 3: Nested (multi-level structure with interaction patterns)

Complex components with deep nesting, multiple implementation methods, or state management.

| Component | Root | Key Complexity |
|-----------|------|----------------|
| navbar | `.navbar` | Three sections (start/center/end), each can contain any component |
| modal | `<dialog>.modal` | Box + actions + backdrop, uses dialog API |
| dropdown | `.dropdown` | Multiple implementation methods (details, popover, focus) |
| drawer | `.drawer` | Checkbox toggle, content area + sidebar + overlay |
| accordion | collapse × N | Multiple collapses with shared radio name |
| tabs | `.tabs` | Tab buttons + tab-content panels, state management |
| carousel | `.carousel` | Items with anchor-based navigation |
| menu | `.menu` | Recursive nesting (submenus), titles, states |
| steps | `.steps` | Ordered items with per-step color states |
| timeline | `.timeline` | Start/middle/end per item, connecting lines |
| table | `<table>` | Standard HTML table with class enhancements |
| filter | `.filter` | Radio group with reset |
| calendar | — | Third-party library integration only |

**Mixin strategy**: Compound — primary mixin renders the shell, sub-mixins or structured data for children. Some need multiple implementation variants.

## State Management Patterns

Components use several mechanisms for state:

1. **Checkbox toggle**: drawer, swap, collapse, theme-controller
2. **Radio group**: accordion (mutual exclusion), rating, filter
3. **Dialog API**: modal (showModal/close)
4. **Details/summary**: dropdown, collapse (alternative)
5. **Focus/blur**: dropdown (alternative), collapse (alternative)
6. **CSS custom properties**: countdown (--value), radial-progress (--value, --size)
7. **Data attributes**: tooltip (data-tip), mockup-code (data-prefix)
8. **Class toggle**: modal-open, collapse-open, tab-active, menu-active

## Common Modifier Categories

| Category | Pattern | Values | Applies To |
|----------|---------|--------|------------|
| Color | `{base}-{color}` | neutral, primary, secondary, accent, info, success, warning, error | ~25 components |
| Size | `{base}-{size}` | xs, sm, md, lg, xl | ~20 components |
| Style | `{base}-{style}` | outline, dash, soft, ghost, link | btn, badge, alert, card |
| Direction | `{base}-{dir}` | vertical, horizontal | menu, stats, divider, join, timeline, steps |
| Position | `{base}-{pos}` | top, bottom, start, end, center | dropdown, toast, modal, indicator, tooltip |

## Key Design Implications for Mixins

1. **Flat components** map 1:1 to mixins with modifier params — trivial
2. **Container components** need Pug `block` for child content — standard pattern
3. **Nested components** need either:
   - Sub-mixins (e.g., `+navbar` containing `+navbar-start`, `+navbar-center`, `+navbar-end`)
   - Structured data params (YAML defines children declaratively)
4. **State components** need the mixin to emit the correct HTML mechanism (checkbox, dialog, etc.)
5. **Multiple implementation methods** (dropdown, collapse) — pick one default, allow override via param
