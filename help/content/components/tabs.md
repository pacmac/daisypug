---
name: tabs
description: Tabbed content with multiple style variants
category: Navigation
base: tabs
---

## Usage

The `tabs` mixin renders a tabbed interface using radio inputs. Each tab has associated content shown when selected.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `style` | string | box, border, lift | Tab visual style |
| `size` | string | xs, sm, md, lg, xl | Tab size |
| `placement` | string | top, bottom | Tab position relative to content |
| `class` | string | | Additional CSS classes |

### Sub-mixins

- `+tab(opts)` — Individual tab radio input
  - `name` (string) — shared radio group name
  - `label` (string) — tab label text
  - `active` (boolean) — mark as active/selected
  - `disabled` (boolean) — disable the tab
- `+tab-content(opts)` — Content panel shown when preceding tab is selected

## Code

### Pug

```pug
+tabs({style: 'lift'})
  +tab({name: 'my-tabs', label: 'Tab 1', active: true})
  +tab-content({class: 'bg-base-200 p-6'})
    p Content for tab 1
  +tab({name: 'my-tabs', label: 'Tab 2'})
  +tab-content({class: 'bg-base-200 p-6'})
    p Content for tab 2
  +tab({name: 'my-tabs', label: 'Tab 3'})
  +tab-content({class: 'bg-base-200 p-6'})
    p Content for tab 3
```

### YAML

```yaml
- tabs:
    opts:
      style: lift
    children:
      - tab: {name: my-tabs, label: Tab 1, active: true}
      - tab-content:
          opts: {class: bg-base-200 p-6}
          children:
            - p: Content for tab 1
      - tab: {name: my-tabs, label: Tab 2}
      - tab-content:
          opts: {class: bg-base-200 p-6}
          children:
            - p: Content for tab 2
```

## Examples

<div class="p-4 flex flex-col gap-6">
  <div>
    <h4 class="font-semibold mb-2">Box Style</h4>
    <div class="tabs tabs-box" role="tablist">
      <input type="radio" name="demo-box" class="tab" role="tab" aria-label="Tab 1" checked />
      <div class="tab-content p-4" role="tabpanel">Box tab 1 content</div>
      <input type="radio" name="demo-box" class="tab" role="tab" aria-label="Tab 2" />
      <div class="tab-content p-4" role="tabpanel">Box tab 2 content</div>
    </div>
  </div>

  <div>
    <h4 class="font-semibold mb-2">Lift Style</h4>
    <div class="tabs tabs-lift" role="tablist">
      <input type="radio" name="demo-lift" class="tab" role="tab" aria-label="Tab A" checked />
      <div class="tab-content bg-base-200 p-4 rounded-box" role="tabpanel">Lift tab A content</div>
      <input type="radio" name="demo-lift" class="tab" role="tab" aria-label="Tab B" />
      <div class="tab-content bg-base-200 p-4 rounded-box" role="tabpanel">Lift tab B content</div>
    </div>
  </div>

  <div>
    <h4 class="font-semibold mb-2">Border Style</h4>
    <div class="tabs tabs-border" role="tablist">
      <input type="radio" name="demo-border" class="tab" role="tab" aria-label="First" checked />
      <div class="tab-content p-4" role="tabpanel">Border tab content</div>
      <input type="radio" name="demo-border" class="tab" role="tab" aria-label="Second" />
      <div class="tab-content p-4" role="tabpanel">Second tab content</div>
    </div>
  </div>
</div>
