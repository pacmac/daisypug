/**
 * Tree Shim - Extracted from easyui-shim.js
 * DO NOT DELETE from easyui-shim.js
 */

  // --- 4. TREE SHIM ---
  // Enhanced to work with DaisyUI menu structure while main.js calls tree methods
  function treeShimImpl($menu, opts, args) {
    if (typeof opts === 'string') {
        // String commands: 'getSelected', 'find', 'select', 'expandTo', 'getRoot'
        
        // tree('find', itemId) - Find menu item by ID
        if (opts === 'find') {
            let itemId = args[1];
            if (!itemId) return null;
            
            // WORKAROUND: render tool sometimes adds query params to hash
            // e.g., "inv^sa_parts?ui=eui&debug=y" instead of just "inv^sa_parts"
            // Extract just the menu ID part before any query string
            if (itemId.indexOf('?') !== -1) {
                itemId = itemId.split('?')[0];
                // console.log('[TREE SHIM] Cleaned itemId from query params:', itemId);
            }
            
            // DUI: Look for menu item with matching ID in ul.menu structure
            const $item = $menu.find('a[id="' + itemId.replace(/"/g, '\\"') + '"]').first();
            if ($item.length > 0) {
                // console.log('[TREE SHIM] Found DUI menu item:', itemId);
                // Return mock tree node object that main.js expects
                return {
                    id: itemId,
                    target: itemId,
                    text: $item.find('span').text().trim() || $item.text().trim(),
                    link: $item.attr('href'),
                    children: null,  // DUI menu items are typically leaf nodes
                    $el: $item
                };
            }
            // console.log('[TREE SHIM] Menu item NOT found:', itemId);
            return null;
        }
        
        // tree('getSelected') - Get currently selected item
        if (opts === 'getSelected') {
            const $selected = $menu.find('.active a').first();
            if ($selected.length > 0) {
                return {
                    id: $selected.attr('id'),
                    target: $selected.attr('id'),
                    text: $selected.find('span').text().trim() || $selected.text().trim(),
                    link: $selected.attr('href'),
                    children: null,
                    $el: $selected
                };
            }
            return null;
        }
        
        // tree('select', nodeTarget) - Select a node by ID
        if (opts === 'select') {
            const target = args[1];
            if (!target) return;
            
            const $item = $menu.find('a[id="' + target.replace(/"/g, '\\"') + '"]').first();
            if ($item.length > 0) {
                // console.log('[TREE SHIM] Selecting DUI menu item:', target);
                $menu.find('a').removeClass('active');
                $item.addClass('active');
            }
        }
        
        // tree('expandTo', nodeTarget) - Expand tree to show node
        if (opts === 'expandTo') {
            const target = args[1];
            if (!target) return;
            
            const $item = $menu.find('a[id="' + target.replace(/"/g, '\\"') + '"]').first();
            if ($item.length > 0) {
                // console.log('[TREE SHIM] Expanding to DUI menu item:', target);
                // Expand parent details if nested
                $item.closest('li details').attr('open', 'open');
            }
        }
        
        // tree('getRoot', nodeTarget) - Get root node (for DUI, return self)
        if (opts === 'getRoot') {
            const target = args[1];
            if (!target) return null;
            
            const $item = $menu.find('a[id="' + target.replace(/"/g, '\\"') + '"]').first();
            if ($item.length > 0) {
                return {
                    id: target,
                    target: target,
                    text: $item.find('span').text().trim() || $item.text().trim(),
                    link: $item.attr('href'),
                    children: null
                };
            }
            return null;
        }
    }
    return $menu; 
  }

  if (!$.fn.tree) {
    $.fn.tree = function(opts) {
      const $menu = this;
      if (window.DUI_USE_PAGENAV_SHIM && window.duiPagenav && $menu.attr('id') === 'westMenu') {
        if (typeof opts === 'string') {
          if (opts === 'find') return window.duiPagenav.find(arguments[1]);
          if (opts === 'getSelected') return window.duiPagenav.getSelected();
          if (opts === 'select') return window.duiPagenav.select(arguments[1]);
          if (opts === 'expandTo') return window.duiPagenav.expandTo(arguments[1]);
          if (opts === 'getRoot') return window.duiPagenav.getRoot(arguments[1]);
          if (opts === 'collapseAll') { $menu.find('details').removeAttr('open'); return $menu; }
          if (opts === 'expandAll') { $menu.find('details').attr('open', ''); return $menu; }
        }
        if (typeof opts === 'object' || !opts) {
          return window.duiPagenav.init($menu, opts);
        }
        return $menu;
      }

      return treeShimImpl($menu, opts, arguments);
    };
  }


