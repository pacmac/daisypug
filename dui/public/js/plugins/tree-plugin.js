/**
 * DUI Tree Plugin — EasyUI-compatible tree API
 *
 * Pure DaisyUI markup: ul.menu + details/summary for expand/collapse.
 * Supports navigation, checkbox, and checkbox+status trees.
 * Dynamic nodes created from <template class="tree-node-tpl">.
 *
 * Usage:
 *   $('#myTree').tree({ checkbox: true, onSelect: fn })
 *   $('#myTree').tree('loadData', [...])
 *   $('#myTree').tree('getChecked')
 */
(function($) {
  'use strict';

  if ($.fn.tree) return;

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /** Get the <li> that owns a target element */
  function nodeEl(target) {
    var $t = $(target);
    return $t.is('li') ? $t : $t.closest('li');
  }

  /** Build an EUI-compatible node object from a <li> element */
  function buildNode($li) {
    if (!$li || !$li.length) return null;
    var stored = $.data($li[0], 'tree-node');
    if (stored) {
      stored.target = $li[0];
      return stored;
    }
    // Build from DOM
    var textEl = $li.find('> a .tree-text, > details > summary .tree-text').first();
    var text = textEl.length ? textEl.text() : $li.find('> a, > details > summary').first().text().trim();
    var id = $li.attr('id') || $li.attr('data-node-id') || '';
    var iconEl = $li.find('> a [data-lucide], > details > summary [data-lucide]').first();
    var cssIconEl = !iconEl.length ? $li.find('> a > .tree-icon, > details > summary > .tree-icon').first() : $();
    var iconCls = iconEl.length ? iconEl.attr('data-lucide') : (cssIconEl.length ? cssIconEl[0].className.replace('tree-icon','').trim() : '');
    var node = {
      id: id,
      target: $li[0],
      text: text,
      iconCls: iconCls,
      checked: false,
      state: $li.children('details').length ? ($li.children('details').prop('open') ? 'open' : 'closed') : 'open',
      children: [],
      attributes: {}
    };
    // Check checkbox state
    var cb = $li.find('> a input[type="checkbox"], > details > summary input[type="checkbox"]').first();
    if (cb.length) node.checked = cb.prop('checked');
    $.data($li[0], 'tree-node', node);
    return node;
  }

  /** Create a tree node DOM element from data, using template if available */
  function createNodeEl(tree, nodeData, opts) {
    var tpl = tree.querySelector('template.tree-node-tpl');
    var hasChildren = nodeData.children && nodeData.children.length > 0;
    var li = document.createElement('li');
    if (nodeData.id) { li.id = nodeData.id; li.setAttribute('data-node-id', nodeData.id); }
    if (nodeData.cls) li.className = nodeData.cls;

    // Store node data early so formatter can access full node via storedData
    var storedData = $.extend({}, nodeData);
    storedData.target = li;
    $.data(li, 'tree-node', storedData);

    // Call formatter to get display text/HTML
    var formatted = opts.formatter(storedData);
    var isHTML = /</.test(formatted);

    if (hasChildren) {
      // Branch node — use details/summary
      var details = document.createElement('details');
      if (nodeData.state !== 'closed') details.open = true;
      var summary = document.createElement('summary');

      // Icon: CSS-class icon (span.tree-icon) or Lucide icon
      if (nodeData.iconCls) {
        var lucideIcon = $.dui.icon(nodeData.iconCls, { color: nodeData.iconColor });
        if (lucideIcon) {
          summary.appendChild(lucideIcon);
        } else {
          var iconSpan = document.createElement('span');
          iconSpan.className = 'tree-icon ' + nodeData.iconCls;
          summary.appendChild(iconSpan);
        }
      }

      if (opts.checkbox && !opts.onlyLeafCheck) {
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'checkbox checkbox-sm';
        if (nodeData.checked) cb.checked = true;
        summary.appendChild(cb);
      }

      var textSpan = document.createElement('span');
      textSpan.className = 'tree-text tree-title';
      if (isHTML) textSpan.innerHTML = formatted;
      else textSpan.textContent = formatted;
      summary.appendChild(textSpan);
      details.appendChild(summary);

      var childUl = document.createElement('ul');
      childUl.className = 'menu';
      nodeData.children.forEach(function(child) {
        childUl.appendChild(createNodeEl(tree, child, opts));
      });
      details.appendChild(childUl);
      li.appendChild(details);
    } else {
      // Leaf node — use <a>
      var a = document.createElement('a');
      if (nodeData.id) a.setAttribute('data-node-id', nodeData.id);

      // Icon: CSS-class icon (span.tree-icon) or Lucide icon
      if (nodeData.iconCls) {
        var lucideIcon = $.dui.icon(nodeData.iconCls, { color: nodeData.iconColor });
        if (lucideIcon) {
          a.appendChild(lucideIcon);
        } else {
          var iconSpan = document.createElement('span');
          iconSpan.className = 'tree-icon ' + nodeData.iconCls;
          a.appendChild(iconSpan);
        }
      }

      if (opts.checkbox) {
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'checkbox checkbox-sm';
        if (nodeData.checked) cb.checked = true;
        a.appendChild(cb);
      }

      var textSpan = document.createElement('span');
      textSpan.className = 'tree-text tree-title';
      if (isHTML) textSpan.innerHTML = formatted;
      else textSpan.textContent = formatted;
      a.appendChild(textSpan);
      li.appendChild(a);
    }

    return li;
  }

  /** Resolve icon class — uses $.dui.getIcon (from nav-plugin) or passes through */
  function resolveIcon(iconCls) {
    if (!iconCls) return '';
    // Use shared icon resolver from nav-plugin if available
    if ($ && $.dui && $.dui.getIcon) {
      var resolved = $.dui.getIcon(iconCls);
      if (resolved) return resolved;
    }
    // Pass through (already a Lucide name, or no resolver loaded)
    return iconCls;
  }

  /** Recursively collect all <li> nodes under a root */
  function allNodes($root) {
    return $root.find('li');
  }

  /** Get direct child <li> elements of a node */
  function childLis($li) {
    var $details = $li.children('details');
    if ($details.length) {
      return $details.children('ul').children('li');
    }
    return $li.children('ul').children('li');
  }

  /** Update parent checkbox indeterminate/checked state (cascade up) */
  function updateParentCheck($li) {
    var $parentLi = $li.parent('ul').closest('li');
    if (!$parentLi.length) return;
    var $children = childLis($parentLi);
    var total = $children.length;
    var checkedCount = 0;
    $children.each(function() {
      var cb = $(this).find('> a input[type="checkbox"], > details > summary input[type="checkbox"]').first();
      if (cb.prop('checked')) checkedCount++;
    });
    var parentCb = $parentLi.find('> details > summary input[type="checkbox"]').first();
    if (parentCb.length) {
      if (checkedCount === 0) {
        parentCb.prop('checked', false).prop('indeterminate', false);
      } else if (checkedCount === total) {
        parentCb.prop('checked', true).prop('indeterminate', false);
      } else {
        parentCb.prop('checked', false).prop('indeterminate', true);
      }
      // Update stored node data
      var node = $.data($parentLi[0], 'tree-node');
      if (node) node.checked = parentCb.prop('checked');
    }
    updateParentCheck($parentLi);
  }

  /** Cascade check state down to all children */
  function cascadeDown($li, checked) {
    childLis($li).each(function() {
      var $child = $(this);
      var cb = $child.find('> a input[type="checkbox"], > details > summary input[type="checkbox"]').first();
      if (cb.length) {
        cb.prop('checked', checked).prop('indeterminate', false);
        var node = $.data($child[0], 'tree-node');
        if (node) node.checked = checked;
      }
      cascadeDown($child, checked);
    });
  }

  /** Initialize Lucide icons in a container */
  function initIcons(el) {
    if (window.lucide && typeof lucide.createIcons === 'function') {
      lucide.createIcons({ nodes: el.querySelectorAll('[data-lucide]') });
    }
  }

  // ---------------------------------------------------------------------------
  // Plugin entry
  // ---------------------------------------------------------------------------
  $.fn.tree = function(options, param) {
    // Method call
    if (typeof options === 'string') {
      var method = $.fn.tree.methods[options];
      if (method) {
        return method(this, param);
      }
      console.warn('[tree] unknown method:', options);
      return this;
    }

    // Initialization
    return this.each(function() {
      var el = this;
      var $el = $(el);
      var state = $.data(el, 'tree');

      if (state) {
        // Merge new options
        $.extend(state.options, options);
        return;
      }

      // Read data attributes from mixin
      var dataOpts = {};
      if ($el.data('checkbox') === true || $el.attr('data-checkbox') === 'true') dataOpts.checkbox = true;
      if ($el.attr('data-cascade-check') === 'false') dataOpts.cascadeCheck = false;
      if ($el.data('only-leaf-check') === true || $el.attr('data-only-leaf-check') === 'true') dataOpts.onlyLeafCheck = true;
      if ($el.attr('data-url')) dataOpts.url = $el.attr('data-url');
      if ($el.attr('data-animate') === 'true') dataOpts.animate = true;

      var opts = $.extend({}, $.fn.tree.defaults, dataOpts, options);
      state = { options: opts };
      $.data(el, 'tree', state);

      // Ensure required CSS classes are present (raw UL elements
      // initialized via JS won't have classes from the +tree() mixin)
      if (!$el.hasClass('dui-tree')) $el.addClass('menu menu-sm dui-tree');

      // Build node data for pre-rendered nodes
      $el.find('li').each(function() {
        buildNode($(this));
      });

      // --- Delegated event handlers ---

      // Click on leaf <a> — select
      $el.on('click', 'a[data-node-id], a:not(details a)', function(e) {
        // Don't select when clicking a checkbox
        if ($(e.target).is('input[type="checkbox"]')) return;
        var $li = nodeEl(this);
        if (!$li.length) return;
        var node = buildNode($li);
        if (!node) return;

        // onBeforeSelect
        if (opts.onBeforeSelect && opts.onBeforeSelect.call(el, node) === false) return;

        // Deselect previous
        $el.find('a.tree-selected').removeClass('tree-selected');
        // Select this
        $(this).addClass('tree-selected');

        if (opts.onSelect) opts.onSelect.call(el, node);
        if (opts.onClick) opts.onClick.call(el, node);
      });

      // Click on summary text — select branch
      $el.on('click', 'summary', function(e) {
        if ($(e.target).is('input[type="checkbox"]')) return;
        var $li = nodeEl(this);
        if (!$li.length) return;
        var node = buildNode($li);

        // Deselect previous
        $el.find('a.tree-selected, summary.tree-selected').removeClass('tree-selected');
        $(this).addClass('tree-selected');

        if (opts.onSelect) opts.onSelect.call(el, node);
      });

      // Double-click
      $el.on('dblclick', 'a[data-node-id], summary', function(e) {
        var $li = nodeEl(this);
        if (!$li.length) return;
        var node = buildNode($li);
        if (opts.onDblClick) opts.onDblClick.call(el, node);
      });

      // Context menu
      $el.on('contextmenu', 'a[data-node-id], summary', function(e) {
        var $li = nodeEl(this);
        if (!$li.length) return;
        var node = buildNode($li);
        if (opts.onContextMenu) {
          opts.onContextMenu.call(el, e, node);
        }
      });

      // Prevent checkbox click from toggling parent <details> or triggering <a> selection
      $el.on('click', 'input[type="checkbox"]', function(e) {
        e.stopPropagation();
      });

      // Checkbox change
      $el.on('change', 'input[type="checkbox"]', function(e) {
        var $li = nodeEl(this);
        if (!$li.length) return;
        var checked = $(this).prop('checked');
        var node = buildNode($li);
        if (node) node.checked = checked;

        // onBeforeCheck
        if (opts.onBeforeCheck && opts.onBeforeCheck.call(el, node, checked) === false) {
          $(this).prop('checked', !checked);
          if (node) node.checked = !checked;
          return;
        }

        // Cascade
        if (opts.cascadeCheck) {
          cascadeDown($li, checked);
          updateParentCheck($li);
        }

        if (opts.onCheck) opts.onCheck.call(el, node, checked);
      });

      // Expand/collapse via details toggle
      $el.on('toggle', 'details', function(e) {
        var $li = $(this).closest('li');
        if (!$li.length) return;
        var node = buildNode($li);
        if (this.open) {
          if (opts.onBeforeExpand && opts.onBeforeExpand.call(el, node) === false) {
            this.open = false;
            return;
          }
          if (node) node.state = 'open';
          if (opts.onExpand) opts.onExpand.call(el, node);
        } else {
          if (node) node.state = 'closed';
          if (opts.onCollapse) opts.onCollapse.call(el, node);
        }
      });

      // Load remote data if url is set (respect init:false to defer loading)
      if (opts.url && opts.init !== false) {
        $.fn.tree.methods.reload($el);
      }

      // If data option is provided, load it (apply loadFilter like the AJAX path)
      if (opts.data && Array.isArray(opts.data)) {
        var d = opts.data;
        if (opts.loadFilter) d = opts.loadFilter.call(el, d, null);
        $.fn.tree.methods.loadData($el, d);
      }
    });
  };

  // ---------------------------------------------------------------------------
  // Methods
  // ---------------------------------------------------------------------------
  $.fn.tree.methods = {

    // --- Options ---
    options: function(jq) {
      var state = $.data(jq[0], 'tree');
      return state ? state.options : {};
    },

    // --- Query methods ---

    /** Find a node by id. Returns node object or null */
    find: function(jq, id) {
      if (!id) return null;
      var el = jq[0];
      // Try by element id first
      var li = el.querySelector('#' + CSS.escape(id));
      if (!li) {
        // Try by data-node-id
        li = el.querySelector('li[data-node-id="' + id + '"]');
      }
      if (!li) return null;
      return buildNode($(li));
    },

    /** Get the currently selected node */
    getSelected: function(jq) {
      var $active = jq.find('a.tree-selected, summary.tree-selected').first();
      if (!$active.length) return null;
      return buildNode(nodeEl($active));
    },

    /** Get node object for a target DOM element */
    getNode: function(jq, target) {
      if (!target) return null;
      return buildNode(nodeEl(target));
    },

    /** Get data array for a node's children (or all root data if no target) */
    getData: function(jq, target) {
      if (!target) {
        // Return all root node data
        var roots = [];
        jq.children('li').each(function() {
          roots.push(buildNode($(this)));
        });
        return roots;
      }
      var $li = nodeEl(target);
      var children = [];
      childLis($li).each(function() {
        children.push(buildNode($(this)));
      });
      return children;
    },

    /** Get all root-level nodes */
    getRoots: function(jq) {
      var roots = [];
      jq.children('li').each(function() {
        roots.push(buildNode($(this)));
      });
      return roots;
    },

    /** Get the root node for a given target (topmost ancestor) */
    getRoot: function(jq, target) {
      if (!target) {
        var roots = $.fn.tree.methods.getRoots(jq);
        return roots.length ? roots[0] : null;
      }
      var $li = nodeEl(target);
      // Walk up to the topmost <li> inside the tree
      while ($li.parent('ul').closest('li', jq[0]).length) {
        $li = $li.parent('ul').closest('li', jq[0]);
      }
      return buildNode($li);
    },

    /** Get parent node */
    getParent: function(jq, target) {
      if (!target) return null;
      var $li = nodeEl(target);
      var $parentLi = $li.parent('ul').closest('li', jq[0]);
      if (!$parentLi.length) return null;
      return buildNode($parentLi);
    },

    /** Get direct children of a node */
    getChildren: function(jq, target) {
      if (!target) {
        return $.fn.tree.methods.getRoots(jq);
      }
      var $li = nodeEl(target);
      var children = [];
      childLis($li).each(function() {
        children.push(buildNode($(this)));
      });
      return children;
    },

    /** Get nesting level (1 = root, matches EasyUI) */
    getLevel: function(jq, target) {
      if (!target) return 0;
      var $li = nodeEl(target);
      var level = 1;
      var $p = $li.parent('ul').closest('li', jq[0]);
      while ($p.length) {
        level++;
        $p = $p.parent('ul').closest('li', jq[0]);
      }
      return level;
    },

    /** Check if node is a leaf (no children) */
    isLeaf: function(jq, target) {
      if (!target) return true;
      var $li = nodeEl(target);
      return !$li.children('details').length && !$li.children('ul').children('li').length;
    },

    /** Get all checked nodes */
    getChecked: function(jq, state) {
      // state: 'checked' (default), 'unchecked', 'indeterminate'
      var which = state || 'checked';
      var result = [];
      jq.find('input[type="checkbox"]').each(function() {
        var cb = $(this);
        var $li = nodeEl(this);
        var match = false;
        if (which === 'checked' && cb.prop('checked') && !cb.prop('indeterminate')) match = true;
        else if (which === 'unchecked' && !cb.prop('checked') && !cb.prop('indeterminate')) match = true;
        else if (which === 'indeterminate' && cb.prop('indeterminate')) match = true;
        if (match) result.push(buildNode($li));
      });
      return result;
    },

    /** Get all leaf nodes under a parent (or all if no target) */
    getLeafs: function(jq, target) {
      var $scope = target ? nodeEl(target) : jq;
      var result = [];
      $scope.find('li').each(function() {
        var $li = $(this);
        if (!$li.children('details').length && !$li.children('ul').children('li').length) {
          result.push(buildNode($li));
        }
      });
      return result;
    },

    // --- Selection ---

    /** Select a node */
    select: function(jq, target) {
      if (!target) return jq;
      var $li = nodeEl(target);
      var node = buildNode($li);
      var state = $.data(jq[0], 'tree');
      var opts = state ? state.options : {};

      if (opts.onBeforeSelect && opts.onBeforeSelect.call(jq[0], node) === false) return jq;

      // Expand to make node visible
      $.fn.tree.methods.expandTo(jq, target);

      // Deselect all
      jq.find('a.tree-selected, summary.tree-selected').removeClass('tree-selected');
      // Select
      var $clickable = $li.children('a').length ? $li.children('a') : $li.find('> details > summary');
      $clickable.first().addClass('tree-selected');

      if (opts.onSelect) opts.onSelect.call(jq[0], node);
      return jq;
    },

    /** Lock a node (prevent selection) */
    lock: function(jq, target) {
      if (!target) return jq;
      var $li = nodeEl(target);
      $li.addClass('pointer-events-none opacity-50');
      return jq;
    },

    /** Unlock a node */
    unlock: function(jq, target) {
      if (!target) return jq;
      var $li = nodeEl(target);
      $li.removeClass('pointer-events-none opacity-50');
      return jq;
    },

    /** Focus a node (scroll into view) */
    setFocus: function(jq, target) {
      if (!target) return jq;
      var el = nodeEl(target)[0];
      if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
      return jq;
    },

    // --- Expand / Collapse ---

    expand: function(jq, target) {
      if (!target) return jq;
      var $li = nodeEl(target);
      var $details = $li.children('details');
      if ($details.length && !$details.prop('open')) {
        $details.prop('open', true);
        var node = buildNode($li);
        if (node) node.state = 'open';
      }
      return jq;
    },

    collapse: function(jq, target) {
      if (!target) return jq;
      var $li = nodeEl(target);
      var $details = $li.children('details');
      if ($details.length && $details.prop('open')) {
        $details.prop('open', false);
        var node = buildNode($li);
        if (node) node.state = 'closed';
      }
      return jq;
    },

    toggle: function(jq, target) {
      if (!target) return jq;
      var $li = nodeEl(target);
      var $details = $li.children('details');
      if ($details.length) {
        $details.prop('open', !$details.prop('open'));
      }
      return jq;
    },

    expandAll: function(jq) {
      jq.find('details').prop('open', true);
      return jq;
    },

    collapseAll: function(jq) {
      jq.find('details').prop('open', false);
      return jq;
    },

    expandTo: function(jq, target) {
      if (!target) return jq;
      var $li = nodeEl(target);
      // Open all parent <details> elements
      $li.parents('details').prop('open', true);
      return jq;
    },

    scrollTo: function(jq, target) {
      if (!target) return jq;
      // First expand to make visible
      $.fn.tree.methods.expandTo(jq, target);
      var el = nodeEl(target)[0];
      if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
      return jq;
    },

    // --- Checkbox ---

    check: function(jq, target) {
      if (!target) return jq;
      var $li = nodeEl(target);
      var cb = $li.find('> a input[type="checkbox"], > details > summary input[type="checkbox"]').first();
      if (cb.length && !cb.prop('checked')) {
        cb.prop('checked', true).trigger('change');
      }
      return jq;
    },

    uncheck: function(jq, target) {
      if (!target) return jq;
      var $li = nodeEl(target);
      var cb = $li.find('> a input[type="checkbox"], > details > summary input[type="checkbox"]').first();
      if (cb.length && cb.prop('checked')) {
        cb.prop('checked', false).trigger('change');
      }
      return jq;
    },

    // --- Mutation ---

    /** Load tree data from array — replaces all content */
    loadData: function(jq, data) {
      if (!data || !Array.isArray(data)) return jq;
      return jq.each(function() {
        var el = this;
        var $el = $(el);
        var state = $.data(el, 'tree');
        var opts = state ? state.options : $.fn.tree.defaults;

        // Preserve template
        var tpl = $el.find('template.tree-node-tpl').detach();

        // Clear existing nodes
        $el.empty();

        // Re-add template
        if (tpl.length) $el.append(tpl);

        // Build nodes
        data.forEach(function(nodeData) {
          el.appendChild(createNodeEl(el, nodeData, opts));
        });

        // Init icons
        initIcons(el);

        // Build node objects
        $el.find('li').each(function() {
          if (!$.data(this, 'tree-node')) buildNode($(this));
        });

        if (opts.onLoadSuccess) opts.onLoadSuccess.call(el, null, data);
      });
    },

    /** Append child nodes to a parent */
    append: function(jq, param) {
      if (!param || !param.data || !param.data.length) return jq;
      return jq.each(function() {
        var el = this;
        var state = $.data(el, 'tree');
        var opts = state ? state.options : $.fn.tree.defaults;

        var $parent;
        if (param.parent) {
          var $li = nodeEl(param.parent);
          // Ensure parent has a child container
          var $details = $li.children('details');
          if ($details.length) {
            $parent = $details.children('ul');
            if (!$parent.length) {
              var ul = document.createElement('ul');
              ul.className = 'menu';
              $details[0].appendChild(ul);
              $parent = $(ul);
            }
          } else {
            // Convert leaf to branch
            var details = document.createElement('details');
            details.open = true;
            var summary = document.createElement('summary');
            // Move existing <a> content into summary
            var $a = $li.children('a');
            if ($a.length) {
              summary.innerHTML = $a.html();
              $a.remove();
            }
            var ul = document.createElement('ul');
            ul.className = 'menu';
            details.appendChild(summary);
            details.appendChild(ul);
            $li[0].appendChild(details);
            $parent = $(ul);
          }
        } else {
          $parent = $(el);
        }

        param.data.forEach(function(nodeData) {
          $parent[0].appendChild(createNodeEl(el, nodeData, opts));
        });

        initIcons(el);
      });
    },

    /** Insert a node before or after a reference */
    insert: function(jq, param) {
      if (!param || !param.data) return jq;
      return jq.each(function() {
        var el = this;
        var state = $.data(el, 'tree');
        var opts = state ? state.options : $.fn.tree.defaults;
        var newLi = createNodeEl(el, param.data, opts);

        if (param.before) {
          var $ref = nodeEl(param.before);
          $ref.before(newLi);
        } else if (param.after) {
          var $ref = nodeEl(param.after);
          $ref.after(newLi);
        }
        initIcons(el);
      });
    },

    /** Remove a node */
    remove: function(jq, target) {
      if (!target) return jq;
      var $li = nodeEl(target);
      $.removeData($li[0], 'tree-node');
      $li.remove();
      return jq;
    },

    /** Remove and return a node */
    pop: function(jq, target) {
      if (!target) return null;
      var $li = nodeEl(target);
      var node = buildNode($li);
      $li.remove();
      return node;
    },

    /** Update a node's properties */
    update: function(jq, param) {
      if (!param || !param.target) return jq;
      var $li = nodeEl(param.target);
      var node = buildNode($li);
      if (!node) return jq;
      var state = $.data(jq[0], 'tree');
      var opts = state ? state.options : $.fn.tree.defaults;

      if (param.text !== undefined) {
        node.text = param.text;
        // Re-run formatter with updated node
        var formatted = opts.formatter(node);
        var textEl = $li.find('> a .tree-text, > details > summary .tree-text').first();
        if (textEl.length) {
          if (/</.test(formatted)) textEl.html(formatted);
          else textEl.text(formatted);
        }
      }
      if (param.id !== undefined) {
        $li.attr('id', param.id).attr('data-node-id', param.id);
        node.id = param.id;
      }
      if (param.iconCls !== undefined) {
        // Try Lucide icon first, fall back to CSS-class icon
        var iconEl = $li.find('> a [data-lucide], > details > summary [data-lucide]').first();
        var cssIconEl = $li.find('> a > .tree-icon, > details > summary > .tree-icon').first();
        if (iconEl.length) {
          iconEl.attr('data-lucide', resolveIcon(param.iconCls));
          initIcons($li[0]);
        } else if (cssIconEl.length) {
          cssIconEl[0].className = 'tree-icon ' + param.iconCls;
        }
        node.iconCls = param.iconCls;
      }
      if (param.checked !== undefined) {
        var cb = $li.find('> a input[type="checkbox"], > details > summary input[type="checkbox"]').first();
        if (cb.length) cb.prop('checked', param.checked);
        node.checked = param.checked;
      }
      // Store any extra attributes
      if (param.attributes) {
        node.attributes = $.extend(node.attributes || {}, param.attributes);
      }
      return jq;
    },

    /** Reload from remote URL */
    reload: function(jq, url) {
      return jq.each(function() {
        var el = this;
        var state = $.data(el, 'tree');
        var opts = state ? state.options : {};
        var loadUrl = url || opts.url;
        if (!loadUrl) return;

        var params = $.extend({}, opts.queryParams);

        if (opts.onBeforeLoad && opts.onBeforeLoad.call(el, null, params) === false) return;

        $.ajax({
          url: loadUrl,
          type: opts.method || 'post',
          data: params,
          dataType: 'json',
          success: function(data) {
            if (opts.loadFilter) data = opts.loadFilter.call(el, data, null);
            $.fn.tree.methods.loadData($(el), data);
          },
          error: function(xhr) {
            if (opts.onLoadError) opts.onLoadError.call(el, arguments);
          }
        });
      });
    },

    // --- move: relocate node up/down among siblings ---
    move: function(jq, param) {
      if (!param || !param.target) return jq;
      return jq.each(function() {
        var $tree = $(this);
        var $li = nodeEl(param.target);
        var sibling = param.dir === 'up' ? $li.prev('li') : $li.next('li');
        if (!sibling.length) return;
        var data = $tree.tree('pop', param.target);
        if (!data) return;
        var opts = {};
        opts.data = data;
        if (param.dir === 'up') opts.before = sibling[0];
        else opts.after = sibling[0];
        $tree.tree('insert', opts);
      });
    },

    // --- setIcon: alias for update({target, iconCls}) ---
    // EUI signature: setIcon({node, icon}) where node is a tree node object
    setIcon: function(jq, param) {
      if (!param) return jq;
      var target = param.target || (param.node && param.node.target) || param.node;
      var iconCls = param.iconCls || param.icon;
      if (!target || !iconCls) return jq;
      return $.fn.tree.methods.update(jq, { target: target, iconCls: iconCls });
    },

    // --- Phase 2 stubs ---
    enableDnd: function(jq) { return jq; },
    disableDnd: function(jq) { return jq; },
    beginEdit: function(jq) { return jq; },
    endEdit: function(jq) { return jq; },
    cancelEdit: function(jq) { return jq; },
    doFilter: function(jq) { return jq; }
  };

  // ---------------------------------------------------------------------------
  // Defaults
  // ---------------------------------------------------------------------------
  $.fn.tree.defaults = {
    url: null,
    method: 'post',
    animate: false,
    checkbox: false,
    cascadeCheck: true,
    onlyLeafCheck: false,
    lines: false,
    dnd: false,
    data: null,
    queryParams: {},
    formatter: function(node) {
      var txt = node.text;
      if (node.cls) txt = '<span class="' + node.cls + '">' + txt + '</span>';
      if (node.count || node.count === 0) txt += '<span class="count opacity-50 ml-1">(' + node.count + ')</span>';
      return txt;
    },
    filter: function(q, node) { return node.text.toLowerCase().indexOf(q.toLowerCase()) >= 0; },
    loadFilter: null,
    onBeforeLoad: null,
    onLoadSuccess: null,
    onLoadError: null,
    onBeforeSelect: null,
    onSelect: null,
    onBeforeCheck: null,
    onCheck: null,
    onBeforeExpand: null,
    onExpand: null,
    onCollapse: null,
    onDblClick: null,
    onContextMenu: null,
    onClick: null
  };

  $.fn.tree.parseOptions = function() { return {}; };
  $.fn.tree.parseData = function() { return []; };

})(jQuery);
