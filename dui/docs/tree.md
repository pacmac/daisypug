# Tree

Hierarchical tree component using DaisyUI `ul.menu` with native `<details>/<summary>` for expand/collapse.

## Overview

The tree component renders hierarchical data as nested DaisyUI menus. Supports navigation trees (click to select), checkbox trees (toggle access), and checkbox+status trees (icons + checkboxes). Nodes can be server-rendered via pug mixins or loaded dynamically via the JS API.

| Type | Path |
|------|------|
| Mixin | `html/dui/mixins/tree.pug` |
| Plugin | `public/dui/js/plugins/tree-plugin.js` |

## Mixins

### `+tree(opts)`

Tree container. Renders a `ul.menu` with data attributes and a `<template>` for dynamic node creation.

### `+tree-render(opts)`

Wrapper for `+tree` that propagates checkbox state to child `+tree-node` calls. Use this when building trees with `+tree-node` children.

### `+tree-node(node)`

Recursive node renderer. Branches use `<details>/<summary>`, leaves use `<a>`.

## Parameters

### `+tree` / `+tree-render` options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `checkbox` | Boolean | `false` | Show checkboxes on nodes |
| `cascadeCheck` | Boolean | `true` | Cascade check/uncheck to parent and children |
| `onlyLeafCheck` | Boolean | `false` | Only show checkboxes on leaf nodes |
| `url` | String | — | AJAX endpoint for remote data |
| `animate` | Boolean | `false` | Animate expand/collapse |
| `lines` | Boolean | `false` | Show connector lines (reserved) |

### `+tree-node` properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | String | Node identifier |
| `text` | String | Display text |
| `iconCls` | String | Icon class (mapped via `getIcon` server-side, `$.dui.getIcon` client-side) |
| `state` | String | `'open'` or `'closed'` (default: `'closed'`) |
| `checked` | Boolean | Checkbox state |
| `children` | Array | Child nodes (makes this a branch) |
| `cls` | String | Extra CSS classes on the `<li>` |
| `attributes` | Object | Extra data stored on the node |

## Examples

### Navigation tree (server-rendered)

```pug
- var treeData = [{id:'inv', text:'Inventory', iconCls:'icon-inout', state:'open', children: [{id:'inv^sa_parts', text:'Part Masters', iconCls:'icon-part'}, {id:'inv^gate_pass', text:'Gate Pass', iconCls:'icon-gate_pass'}]}, {id:'sa', text:'Sales', iconCls:'icon-money', children: [{id:'sa^sorder', text:'Sales Order', iconCls:'icon-cart'}]}]

+tree-render#navTree
  each node in treeData
    +tree-node(node)
```

### Checkbox tree

```pug
- var accessData = [{id:'mod_inv', text:'Inventory', state:'open', children: [{id:'acc_parts', text:'Part Masters', checked: true}, {id:'acc_gp', text:'Gate Pass', checked: false}]}]

+tree-render({checkbox: true, cascadeCheck: false})#accessTree
  each node in accessData
    +tree-node(node)
```

### Dynamic tree (loaded via JS)

```pug
+tree#dynTree

block script
  script.
    $('#dynTree').tree({
      checkbox: true,
      onSelect: function(node) { console.log('selected:', node.text); },
      onCheck: function(node, checked) { console.log('check:', node.text, checked); }
    });
    $('#dynTree').tree('loadData', [
      { id: 'd1', text: 'Documents', state: 'open', children: [
        { id: 'd1a', text: 'Invoices' },
        { id: 'd1b', text: 'Contracts' }
      ]}
    ]);
```

### Remote data tree

```pug
+tree#remoteTree

block script
  script.
    $('#remoteTree').tree({
      url: '/',
      queryParams: { _func: 'get', _sqlid: 'admin^menutree' },
      loadFilter: function(data) { return data.rows || data; },
      onLoadSuccess: function(node, data) { console.log('loaded', data.length, 'nodes'); }
    });
```

## Output

```pug
+tree-render#navTree
  +tree-node({id:'inv', text:'Inventory', iconCls:'icon-inout', state:'open', children: [{id:'inv^sa_parts', text:'Part Masters', iconCls:'icon-part'}, {id:'inv^gate_pass', text:'Gate Pass', iconCls:'icon-gate_pass'}]})
  +tree-node({id:'sa', text:'Sales', iconCls:'icon-money', children: [{id:'sa^sorder', text:'Sales Order', iconCls:'icon-cart'}]})
```

```js
// Initialize and select a node
$('#navTree').tree({
  onSelect: function(node) {
    console.log('Selected:', node.id, node.text);
  }
});
var node = $('#navTree').tree('find', 'inv^sa_parts');
$('#navTree').tree('select', node.target);
```

## JS API

### Tree plugin (`$.fn.tree`)

```js
// Initialize with options
$('#myTree').tree({ checkbox: true, cascadeCheck: false });

// Load data
$('#myTree').tree('loadData', [{ id: 'n1', text: 'Root', children: [...] }]);

// Query
$('#myTree').tree('find', 'nodeId');          // find by id → node object
$('#myTree').tree('getSelected');              // → selected node or null
$('#myTree').tree('getRoots');                 // → array of root nodes
$('#myTree').tree('getChildren', target);      // → array of child nodes
$('#myTree').tree('getParent', target);        // → parent node or null
$('#myTree').tree('getChecked');               // → array of checked nodes
$('#myTree').tree('getChecked', 'unchecked');  // → array of unchecked nodes
$('#myTree').tree('getChecked', 'indeterminate'); // → partially checked
$('#myTree').tree('isLeaf', target);           // → boolean
$('#myTree').tree('getLevel', target);         // → number (0=root)

// Selection
$('#myTree').tree('select', target);           // select a node
$('#myTree').tree('lock', target);             // disable a node
$('#myTree').tree('unlock', target);           // re-enable a node

// Expand / Collapse
$('#myTree').tree('expand', target);
$('#myTree').tree('collapse', target);
$('#myTree').tree('toggle', target);
$('#myTree').tree('expandAll');
$('#myTree').tree('collapseAll');
$('#myTree').tree('expandTo', target);         // expand all ancestors
$('#myTree').tree('scrollTo', target);         // expandTo + scrollIntoView

// Checkbox
$('#myTree').tree('check', target);
$('#myTree').tree('uncheck', target);

// Mutation
$('#myTree').tree('append', { parent: target, data: [...] });
$('#myTree').tree('insert', { before: target, data: {...} });
$('#myTree').tree('insert', { after: target, data: {...} });
$('#myTree').tree('remove', target);
$('#myTree').tree('pop', target);              // remove and return node
$('#myTree').tree('update', { target: t, text: 'New', iconCls: 'icon-part' });
$('#myTree').tree('reload');                   // reload from url
```

### Methods

| Method | Args | Returns | Description |
|--------|------|---------|-------------|
| `options` | — | Object | Get current options |
| `find` | id | node/null | Find node by id |
| `getSelected` | — | node/null | Get selected node |
| `getNode` | target | node/null | Get node for a DOM element |
| `getData` | target? | Array | Get child data (or all roots) |
| `getRoots` | — | Array | Get root-level nodes |
| `getRoot` | target? | node/null | Get topmost ancestor |
| `getParent` | target | node/null | Get parent node |
| `getChildren` | target? | Array | Get direct children |
| `getLevel` | target | Number | Nesting depth (0=root) |
| `isLeaf` | target | Boolean | True if no children |
| `getChecked` | state? | Array | Get checked/unchecked/indeterminate nodes |
| `getLeafs` | target? | Array | Get all leaf nodes |
| `select` | target | jq | Select a node |
| `lock` | target | jq | Lock (disable) a node |
| `unlock` | target | jq | Unlock a node |
| `setFocus` | target | jq | Scroll node into view |
| `expand` | target | jq | Open a branch node |
| `collapse` | target | jq | Close a branch node |
| `toggle` | target | jq | Toggle open/closed |
| `expandAll` | — | jq | Open all branches |
| `collapseAll` | — | jq | Close all branches |
| `expandTo` | target | jq | Open all ancestor branches |
| `scrollTo` | target | jq | expandTo + scrollIntoView |
| `check` | target | jq | Check a checkbox node |
| `uncheck` | target | jq | Uncheck a checkbox node |
| `loadData` | data | jq | Replace tree content from array |
| `append` | param | jq | Add children: `{parent, data:[...]}` |
| `insert` | param | jq | Insert node: `{before/after, data:{...}}` |
| `remove` | target | jq | Remove a node from the tree |
| `pop` | target | node | Remove and return a node |
| `update` | param | jq | Update node: `{target, text?, iconCls?, checked?}` |
| `reload` | url? | jq | Reload from remote URL |

### Options / Defaults

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | String | `null` | Remote data endpoint |
| `method` | String | `'post'` | HTTP method for remote loading |
| `checkbox` | Boolean | `false` | Enable checkboxes |
| `cascadeCheck` | Boolean | `true` | Cascade check to parent/children |
| `onlyLeafCheck` | Boolean | `false` | Checkboxes on leaves only |
| `animate` | Boolean | `false` | Animate expand/collapse |
| `lines` | Boolean | `false` | Show connector lines (reserved) |
| `data` | Array | `null` | Initial data (loaded on init) |
| `queryParams` | Object | `{}` | Extra params for remote requests |
| `loadFilter` | Function | `null` | Transform remote data before loading |

### Events

| Event | Args | Description |
|-------|------|-------------|
| `onBeforeSelect` | node | Return `false` to cancel selection |
| `onSelect` | node | Fired after a node is selected |
| `onBeforeCheck` | node, checked | Return `false` to cancel check |
| `onCheck` | node, checked | Fired after checkbox changes |
| `onExpand` | node | Fired when a branch opens |
| `onCollapse` | node | Fired when a branch closes |
| `onDblClick` | node | Fired on double-click |
| `onContextMenu` | event, node | Fired on right-click |
| `onBeforeLoad` | node, params | Return `false` to cancel remote load |
| `onLoadSuccess` | node, data | Fired after remote data loads |
| `onLoadError` | arguments | Fired on remote load failure |

### Node object

All query methods return node objects with this structure:

```js
{
  id: 'inv^sa_parts',    // node id
  target: <li>,           // DOM element
  text: 'Part Masters',   // display text
  iconCls: 'icon-part',   // icon class
  checked: false,          // checkbox state
  state: 'open',           // 'open' or 'closed'
  children: [],            // child nodes
  attributes: {}           // extra data
}
```

The `target` property is always the `<li>` DOM element. Pass it to methods that accept a `target` parameter.

## Notes

### Icon resolution

Server-rendered trees resolve icons via `getIcon()` in `_iconmap.pug`. Dynamic nodes use `$.dui.getIcon()` (exposed by nav-plugin) which has the same mapping. If `$.dui.getIcon` is not available, `iconCls` is passed through as a Lucide icon name.

### Checkbox cascade

When `cascadeCheck: true` (default), checking a parent checks all children, and checking/unchecking children updates parent state (checked, unchecked, or indeterminate). Set `cascadeCheck: false` for independent checkboxes (like the admin/users access tree).

### Template-based node creation

Dynamic nodes are created by cloning `<template class="tree-node-tpl">` inside the tree container. This is consistent with the datagrid and dynadd template pattern.

### Phase 2 (deferred)

Drag-and-drop (`enableDnd`/`disableDnd`), inline editing (`beginEdit`/`endEdit`/`cancelEdit`), and filtering (`doFilter`) are stubbed but not implemented. When tree DnD is implemented, it will use `drag-plugin.js` — see [Drag & Drop](drag-drop.md).
