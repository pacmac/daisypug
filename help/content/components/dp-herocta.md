---
name: dp-herocta
description: Hero section with title, subtitle, and call-to-action buttons
category: Composites
base: dp-herocta
---

## Usage

`+dp-herocta(opts)` renders a hero section with title, subtitle, and primary/secondary CTA buttons.

### Options

| Option | Type | Description |
|--------|------|-------------|
| `title` | string | Heading text |
| `subtitle` | string | Description text |
| `primary` | object | Primary button opts (text, color) |
| `secondary` | object | Secondary button opts (text, style) |
| `class` | string | Hero wrapper classes |
| `maxWidth` | string | Content width class (default: `max-w-2xl`) |

### API (dp.js)

```js
const hero = dp('.dp-herocta')
hero.getTitle()
hero.setTitle('New Title')
hero.getSubtitle()
hero.setSubtitle('New subtitle')
hero.onPrimaryClick(() => navigate('/signup'))
```

## Code

```pug
+dp-herocta({
  title: 'Welcome to DaisyPug',
  subtitle: 'Build beautiful, theme-aware pages with clean component mixins.',
  primary: {text: 'Get Started', color: 'primary'},
  secondary: {text: 'Learn More', style: 'outline'},
  class: 'min-h-screen bg-base-200'
})
```

## Examples

<div class="dp-hero hero min-h-[50vh] bg-base-200">
  <div class="dp-hero-content hero-content text-center">
    <div class="max-w-2xl">
      <h1 class="text-5xl font-bold">Welcome to DaisyPug</h1>
      <p class="py-6 text-lg text-base-content opacity-80">Build beautiful, theme-aware pages with clean component mixins.</p>
      <div class="flex gap-4 justify-center">
        <button class="dp-btn btn btn-primary btn-lg">Get Started</button>
        <button class="dp-btn btn btn-outline btn-lg">Learn More</button>
      </div>
    </div>
  </div>
</div>
