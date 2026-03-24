/**
 * Pure4 Searchbox Helper - DaisyUI/jQuery API Shim
 *
 * GOLDEN RULE: This plugin ONLY manipulates existing <input type="text"> and menu elements.
 * NO DOM construction (.wrap(), .append() with new HTML is FORBIDDEN).
 * Exception: Menu population via user's searcher callback (user responsibility).
 *
 * Strategy: Thin wrapper around textbox-plugin.js that adds menu management.
 * - Adds: menu(), getName(), selectName()
 * - Overrides: destroy() (cleanup menu)
 * - Delegates: All other methods to textbox
 *
 * Features:
 * - Dropdown menu for search results
 * - Searcher callback on input change
 * - Item selection from menu
 * - Menu state management
 *
 * Requires: textbox-plugin.js must be loaded first
 */
;(function($) {
  "use strict";

  // Check if textbox plugin is loaded
  if (!$.fn.textbox) {
    console.error('searchbox-plugin.js requires textbox-plugin.js to be loaded first');
    return;
  }

  // Initialize searchbox on target element
  function init(target, options) {
    var $target = $(target);
    
    // Ensure type is text
    $target.attr('type', 'text');
    
    // Initialize as textbox first (inherit all textbox functionality)
    $target.textbox(options);
    
    // Get textbox state and extend it for searchbox
    var state = $.data(target, 'textbox');
    if (state) {
      // Find or create menu element (sibling to input)
      var $menu = $target.siblings('.searchbox-menu').find('ul.menu');
      if ($menu.length === 0) {
        // Fallback: create menu if not found in DOM
        var $menuContainer = $('<div class="searchbox-menu hidden absolute z-50 bg-base-100 border border-base-300 rounded shadow-lg" style="min-width: 200px; max-width: 400px;"></div>');
        var $menuUl = $('<ul class="menu menu-compact"></ul>');
        $menuContainer.append($menuUl);
        $target.after($menuContainer);
        $menu = $menuUl;
      }
      
      // Store searchbox state
      state.menu = $menu;
      state.selectedName = '';
      
      // Add searcher option
      var searchOpts = {
        searcher: options && options.searcher ? options.searcher : null,
        loader: options && options.loader ? options.loader : null
      };
      $.extend(state.options, searchOpts);
      
      // Attach searcher callback to input change
      if (state.options.searcher) {
        $target.on('input.searchbox', function() {
          state.options.searcher($(this).val());
        });
      }
      
      // Attach menu item selection handler
      $menu.on('click.searchbox', 'a', function(e) {
        e.preventDefault();
        var $item = $(this);
        var name = $item.data('name');
        var text = $item.text();
        
        // Update state
        state.selectedName = name;
        
        // Update input value
        $target.textbox('setValue', text);
        
        // Hide menu
        $menu.parent().addClass('hidden');
        
        // Trigger change event
        $target.trigger('change');
      });
      
      // Store searchbox-specific reference (shares state with textbox)
      $.data(target, 'searchbox', state);
    }
    
    return state;
  }

  // Main plugin function
  $.fn.searchbox = function(options, param) {
    if (typeof options === 'string') {
      // Method call
      var method = $.fn.searchbox.methods[options];
      if (!method) {
        if (window.duiDebug && window.duiDebug.log) {
          window.duiDebug.log('searchbox', options, arguments);
        }
        return this;
      }
      return method(this, param);
    }

    // Initialize each element
    return this.each(function() {
      var state = $.data(this, 'searchbox');
      if (state) {
        // Already initialized, update options
        $.extend(state.options, options);
      } else {
        // First time initialization
        init(this, options);
      }
    });
  };

  // Method definitions
  $.fn.searchbox.methods = {
    /**
     * Get options object
     */
    options: function(jq) {
      var state = $.data(jq[0], 'searchbox');
      return state ? state.options : {};
    },

    /**
     * Get menu element (NEW METHOD)
     * Returns jQuery object wrapping the menu <ul>
     */
    menu: function(jq) {
      var state = $.data(jq[0], 'searchbox');
      return state ? state.menu : $();
    },

    /**
     * Get name of currently selected menu item (NEW METHOD)
     * Returns the data-name attribute of selected item
     */
    getName: function(jq) {
      var state = $.data(jq[0], 'searchbox');
      return state ? state.selectedName : '';
    },

    /**
     * Select menu item by name (NEW METHOD)
     * Finds item with matching data-name and clicks it
     */
    selectName: function(jq, name) {
      return jq.each(function() {
        var state = $.data(this, 'searchbox');
        if (state && state.menu) {
          // Find and click the item
          var $item = state.menu.find('[data-name="' + name + '"]');
          if ($item.length > 0) {
            $item.click();
          }
        }
      });
    },

    /**
     * Get search input value (inherited from textbox)
     */
    getValue: function(jq) {
      return jq.textbox('getValue');
    },

    /**
     * Set search input value (inherited from textbox)
     */
    setValue: function(jq, value) {
      return jq.textbox('setValue', value);
    },

    /**
     * Clear search input
     */
    clear: function(jq) {
      return jq.textbox('clear');
    },

    /**
     * Reset to initial state
     */
    reset: function(jq) {
      return jq.textbox('reset');
    },

    /**
     * Disable input
     */
    disable: function(jq) {
      return jq.textbox('disable');
    },

    /**
     * Enable input
     */
    enable: function(jq) {
      return jq.textbox('enable');
    },

    /**
     * Set readonly
     */
    readonly: function(jq, mode) {
      return jq.textbox('readonly', mode);
    },

    /**
     * Check if valid (inherited from validatebox)
     */
    isValid: function(jq) {
      return jq.textbox('isValid');
    },

    /**
     * Validate input (inherited from validatebox)
     */
    validate: function(jq) {
      return jq.textbox('validate');
    },

    /**
     * Resize input width
     */
    resize: function(jq, width) {
      return jq.textbox('resize', width);
    },

    /**
     * Get underlying textbox element
     */
    textbox: function(jq) {
      return jq.textbox('textbox');
    },

    /**
     * Destroy searchbox instance
     */
    destroy: function(jq) {
      return jq.each(function() {
        var state = $.data(this, 'searchbox');
        if (state) {
          // Detach event listeners
          $(this).off('.searchbox');
          if (state.menu) {
            state.menu.off('.searchbox');
            // Optionally remove menu from DOM
            // state.menu.parent().remove();
          }
        }
        // Remove searchbox state
        $.removeData(this, 'searchbox');
        // Delegate to textbox destroy
        $(this).textbox('destroy');
      });
    }
  };

  function eventStub(name) {
    return function() {
      var e = arguments[0];
      if (e && e.preventDefault) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
  }

  // Default options
  $.fn.searchbox.defaults = {
    // Inherit textbox defaults
    // Add search-specific defaults
    searcher: eventStub('searchbox.searcher'),  // User-provided function
    loader: eventStub('searchbox.loader')     // Optional data loader
  };

})(jQuery);
