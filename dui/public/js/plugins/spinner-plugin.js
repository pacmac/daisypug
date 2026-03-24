/**
 * Pure4 Spinner Helper - DaisyUI/jQuery API Shim
 *
 * GOLDEN RULE: This plugin ONLY manipulates existing <input> and button elements.
 * NO DOM construction (.wrap(), .append() with new HTML is FORBIDDEN).
 *
 * Strategy: Thin wrapper around textbox-plugin.js that adds button click handlers.
 * - Adds: spinUp(), spinDown()
 * - Overrides: None (just delegate)
 * - Delegates: All methods to textbox
 *
 * Features:
 * - Increment/decrement via buttons
 * - Step-based value adjustment
 * - Min/max constraints
 * - onSpinUp/onSpinDown callbacks
 *
 * Requires: textbox-plugin.js must be loaded first
 */
;(function($) {
  "use strict";

  // Check if textbox plugin is loaded
  if (!$.fn.textbox) {
    console.error('spinner-plugin.js requires textbox-plugin.js to be loaded first');
    return;
  }

  // Initialize spinner on target element
  function init(target, options) {
    var $target = $(target);
    
    // Ensure type is text
    $target.attr('type', 'text');
    
    // Initialize as textbox first (inherit all textbox functionality)
    $target.textbox(options);
    
    // Get textbox state and extend it for spinner
    var state = $.data(target, 'textbox');
    if (state) {
      // Add spinner-specific options with defaults
      var spinOpts = {
        step: options && options.step !== undefined ? parseFloat(options.step) : 1,
        min: options && options.min !== undefined ? options.min : -Infinity,
        max: options && options.max !== undefined ? options.max : Infinity,
        precision: options && options.precision !== undefined ? options.precision : 0,
        onSpinUp: options && options.onSpinUp ? options.onSpinUp : null,
        onSpinDown: options && options.onSpinDown ? options.onSpinDown : null
      };
      
      // Merge with textbox options
      state.options = $.extend({}, state.options, spinOpts);
      
      // Store spinner-specific reference (shares state with textbox)
      $.data(target, 'spinner', state);
      
      // Find spinner buttons (siblings of input)
      var $container = $target.parent();
      var $upBtn = $container.find('[data-action="up"]');
      var $downBtn = $container.find('[data-action="down"]');
      
      // Attach button click handlers
      if ($upBtn.length > 0) {
        $upBtn.on('click.spinner', function(e) {
          e.preventDefault();
          $.fn.spinner.methods.spinUp($target);
        });
      }
      
      if ($downBtn.length > 0) {
        $downBtn.on('click.spinner', function(e) {
          e.preventDefault();
          $.fn.spinner.methods.spinDown($target);
        });
      }
    }
    
    return state;
  }

  // Helper function to apply numeric constraints
  function constrainValue(value, min, max) {
    var num = parseFloat(value);
    if (isNaN(num)) return 0;
    if (min !== undefined && min !== -Infinity && num < min) num = min;
    if (max !== undefined && max !== Infinity && num > max) num = max;
    return num;
  }

  // Main plugin function
  $.fn.spinner = function(options, param) {
    if (typeof options === 'string') {
      // Method call
      var method = $.fn.spinner.methods[options];
      if (!method) {
        if (window.duiDebug && window.duiDebug.log) {
          window.duiDebug.log('spinner', options, arguments);
        }
        return this;
      }
      return method(this, param);
    }

    // Initialize each element
    return this.each(function() {
      var state = $.data(this, 'spinner');
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
  $.fn.spinner.methods = {
    /**
     * Get options object
     */
    options: function(jq) {
      var state = $.data(jq[0], 'spinner');
      return state ? state.options : {};
    },

    /**
     * Spin up (increment) - NEW METHOD
     * Increases value by step amount
     */
    spinUp: function(jq) {
      return jq.each(function() {
        var state = $.data(this, 'spinner');
        if (state && state.options) {
          // Get current value
          var currentValue = parseFloat(jq.textbox('getValue'));
          if (isNaN(currentValue)) currentValue = 0;
          
          // Apply step
          var newValue = currentValue + state.options.step;
          
          // Apply constraints
          newValue = constrainValue(newValue, state.options.min, state.options.max);
          
          // Set value
          jq.textbox('setValue', newValue);
          
          // Call callback
          if (state.options.onSpinUp) {
            state.options.onSpinUp.call(this);
          }
        }
      });
    },

    /**
     * Spin down (decrement) - NEW METHOD
     * Decreases value by step amount
     */
    spinDown: function(jq) {
      return jq.each(function() {
        var state = $.data(this, 'spinner');
        if (state && state.options) {
          // Get current value
          var currentValue = parseFloat(jq.textbox('getValue'));
          if (isNaN(currentValue)) currentValue = 0;
          
          // Apply step
          var newValue = currentValue - state.options.step;
          
          // Apply constraints
          newValue = constrainValue(newValue, state.options.min, state.options.max);
          
          // Set value
          jq.textbox('setValue', newValue);
          
          // Call callback
          if (state.options.onSpinDown) {
            state.options.onSpinDown.call(this);
          }
        }
      });
    },

    /**
     * Get numeric value (inherited from textbox)
     */
    getValue: function(jq) {
      return jq.textbox('getValue');
    },

    /**
     * Set numeric value with constraint checking
     */
    setValue: function(jq, value) {
      return jq.each(function() {
        var state = $.data(this, 'spinner');
        if (state && state.options) {
          // Constrain value
          var constrainedValue = constrainValue(value, state.options.min, state.options.max);
          jq.textbox('setValue', constrainedValue);
        } else {
          jq.textbox('setValue', value);
        }
      });
    },

    /**
     * Clear input
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
     * Disable spinner (input + buttons)
     */
    disable: function(jq) {
      return jq.each(function() {
        jq.textbox('disable');
        // Also disable buttons
        var $container = jq.parent();
        $container.find('[data-action]').prop('disabled', true);
      });
    },

    /**
     * Enable spinner (input + buttons)
     */
    enable: function(jq) {
      return jq.each(function() {
        jq.textbox('enable');
        // Also enable buttons
        var $container = jq.parent();
        $container.find('[data-action]').prop('disabled', false);
      });
    },

    /**
     * Set readonly (input only)
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
     * Destroy spinner instance
     */
    destroy: function(jq) {
      return jq.each(function() {
        var state = $.data(this, 'spinner');
        if (state) {
          // Detach button listeners
          var $container = jq.parent();
          $container.find('[data-action]').off('.spinner');
        }
        // Remove spinner state
        $.removeData(this, 'spinner');
        // Delegate to textbox destroy
        jq.textbox('destroy');
      });
    },

    // ---- setValidType: dynamically change validation rules ----
    setValidType: function(jq, rules) {
      return jq.each(function() {
        $(this).validatebox({ validType: rules });
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
  $.fn.spinner.defaults = {
    // Inherit textbox defaults
    // Add spinner-specific defaults
    step: 1,
    min: -Infinity,
    max: Infinity,
    precision: 0,
    onSpinUp: eventStub('spinner.onSpinUp'),
    onSpinDown: eventStub('spinner.onSpinDown')
  };

  // EUI exposes both spinner and numberspinner; alias for compatibility
  $.fn.numberspinner = $.fn.spinner;

})(jQuery);
