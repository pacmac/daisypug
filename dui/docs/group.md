# Grouping Components

Container components for organizing related content.

## Overview

Grouping mixins wrap content in DaisyUI structural components — cards, join groups, lists, and indicators. These are presentational containers, not layout primitives.

| Type | Path |
|------|------|
| Mixin | `html/dui/mixins/group.pug` |

## Mixins

### `+card(opts)`

DaisyUI card container. Use with `+card_body` and `+card_actions`.

### `+card_body(title, opts)`

Card body with optional title rendered as `<h2>`.

### `+card_actions(opts)`

Card action bar (`.card-actions`).

### `+join(opts)`

DaisyUI join group — merges child elements into a single visual unit with shared borders.

### `+list(opts)` / `+list_row(opts)`

DaisyUI list container and row items.

### `+indicator(opts)` / `+indicator_item(text, opts)`

DaisyUI indicator badge overlay.

## Parameters

None. These mixins pass through any Pug attributes to the outer element.

## Examples

### Card with body and actions

```pug
+card
  +card_body('Title')
    p Card content
  +card_actions
    +button('Action', {color:'primary', size:'sm'})
```

### Join group (input + button)

```pug
+join
  input.join-item.input.input-bordered(type="text")
  +button('Go', {class:'join-item'})
```

### List

```pug
+list
  +list_row
    span Item 1
  +list_row
    span Item 2
```

### Indicator badge

```pug
+indicator
  +indicator_item('99+', {class:'badge badge-primary'})
  +button('Inbox')
```

## Output

### Card

```pug
+card
  +card_body('Title')
    p Card content
  +card_actions(class='justify-end')
    +button('Action', {color:'primary', size:'sm'})
```

### Join

```pug
+join
  input.join-item.input.input-bordered(type='text')
  +button('Go', {class:'join-item'})
```

```js
// Grouping components are pure HTML — no JS initialization needed
```

## JS API

No JavaScript plugin — these are pure CSS/HTML structural wrappers. Interact with them using standard DOM methods:

```js
// Card visibility
$('#myCard').show();
$('#myCard').hide();

// Dynamic content
$('#myCard .card-body').html('<p>New content</p>');

// Join group — add/remove items
$('#myJoin').append('<button class="join-item btn">New</button>');

// List rows
$('#myList').find('.list-row').length;  // count rows
```

## Notes

These are thin wrappers around DaisyUI component classes. They add no JS behavior — purely structural markup helpers.
