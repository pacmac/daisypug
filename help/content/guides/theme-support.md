---
name: theme-support
title: Theme Support
description: Using DaisyUI themes with DaisyPug
category: Guides
order: 4
---

## Usage

DaisyPug supports all 30+ DaisyUI themes. Themes are applied via the `data-theme` attribute on `<html>` and switch all semantic colors automatically.

### Setting a Theme

**CLI:**

```bash
daisypug render page.pug --theme dark
daisypug render page.pug --theme cupcake
daisypug render page.pug --theme synthwave
```

**API:**

```javascript
renderPage(pugContent, { theme: 'dark' });
renderYaml(yamlContent, { theme: 'retro' });
```

### Available Themes

DaisyUI includes these built-in themes:

| Light | Dark |
|-------|------|
| light | dark |
| cupcake | synthwave |
| bumblebee | halloween |
| emerald | forest |
| corporate | black |
| retro | luxury |
| cyberpunk | dracula |
| valentine | night |
| garden | coffee |
| lofi | dim |
| pastel | sunset |
| fantasy | nord |
| wireframe | |
| cmyk | |
| autumn | |
| business | |
| acid | |
| lemonade | |
| winter | |
| aqua | |

### Theme Switching at Runtime

Use the `theme-controller` mixin for CSS-only theme switching:

```pug
//- Toggle between light and dark
+theme-controller({value: 'dark', as: 'toggle'})

//- Radio buttons for multiple themes
+theme-radios({themes: ['light', 'dark', 'cupcake'], as: 'btn', active: 'light'})

//- In a navbar
+navbar({class: 'bg-base-100'})
  +navbar-end
    +theme-radios({themes: ['light', 'dark', 'synthwave'], as: 'btn'})
```

### Semantic Colors

DaisyUI themes work through semantic color names. **Always use these instead of Tailwind color utilities:**

| Semantic | Use For |
|----------|---------|
| `primary` | Main actions, links |
| `secondary` | Secondary actions |
| `accent` | Highlights, accents |
| `neutral` | Neutral elements |
| `base-100/200/300` | Background layers |
| `base-content` | Text on base backgrounds |
| `info` | Informational |
| `success` | Success states |
| `warning` | Warning states |
| `error` | Error states |

## Code

### Theme-Aware Components

All DaisyPug mixins use semantic colors automatically:

```pug
//- These adapt to any theme
+btn({color: 'primary', text: 'Action'})
+alert({color: 'success', text: 'Saved!'})
+badge({color: 'info', text: 'New'})
+progress({color: 'primary', value: '70'})
```

**Never use:**

```pug
//- BAD: hardcoded Tailwind colors break themes
div(class="bg-blue-500 text-white") Don't do this
```

**Instead use:**

```pug
//- GOOD: semantic colors adapt to theme
div(class="bg-primary text-primary-content") Do this
```

### YAML Theme Controller

```yaml
- navbar:
    opts: {class: bg-base-100}
    children:
      - navbar-end:
          children:
            - theme-radios:
                themes: [light, dark, cupcake, synthwave]
                as: btn
                active: light
```

## Examples

The showcase page demonstrates theme switching with 5 themes:

```bash
# Render with different themes
daisypug render examples/showcase.pug --theme light -o light.html
daisypug render examples/showcase.pug --theme dark -o dark.html
daisypug render examples/showcase.pug --theme cupcake -o cupcake.html
```

Each produces identical HTML structure — only the `data-theme` attribute differs. All colors adapt automatically.
