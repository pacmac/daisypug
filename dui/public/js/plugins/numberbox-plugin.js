/**
 * Pure4 Numberbox Helper - DaisyUI/jQuery API Shim
 *
 * GOLDEN RULE: This plugin ONLY manipulates existing <input type="number"> elements.
 * NO DOM construction (.wrap(), .append(), .html() are FORBIDDEN).
 *
 * Strategy: Thin wrapper around textbox-plugin.js that adds numeric-specific methods.
 * - Adds: fix()
 * - Overrides: setValue(), clear(), reset() (to handle numeric constraints)
 * - Delegates: All other methods to textbox
 *
 * Features:
 * - Precision control (decimal places)
 * - Min/max value constraints
 * - Numeric validation and formatting
 *
 * Requires: textbox-plugin.js must be loaded first
 */
;(function($) {
  "use strict";

  // Check if textbox plugin is loaded
  if (!$.fn.textbox) {
    console.error('numberbox-plugin.js requires textbox-plugin.js to be loaded first');
    return;
  }

  // Initialize numberbox on target element
  function init(target, options) {
    var $target = $(target);
    
    // Ensure type is number
    $target.attr('type', 'number');
    
    // Initialize as textbox first (inherit all textbox functionality)
    $target.textbox(options);
    
    // Get textbox state and extend it for numberbox
    var state = $.data(target, 'textbox');
    if (state) {
      // Add numeric-specific options with defaults
      var numOpts = {
        min: options && options.min !== undefined ? options.min : -Infinity,
        max: options && options.max !== undefined ? options.max : Infinity,
        step: options && options.step !== undefined ? parseFloat(options.step) : 1,
        precision: options && options.precision !== undefined ? options.precision : 0,
        decimal: options && options.decimal !== undefined ? options.decimal : '.',
        groupSeparator: options && options.groupSeparator !== undefined ? options.groupSeparator : ','
      };
      
      // Merge with textbox options
      state.options = $.extend({}, state.options, numOpts);
      
      // Store numberbox-specific reference (shares state with textbox)
      $.data(target, 'numberbox', state);
    }
    
    return state;
  }

  // Helper function to format number with precision
  function formatNumber(value, precision) {
    var num = parseFloat(value);
    if (isNaN(num)) return '';
    return num.toFixed(precision);
  }

  // Helper function to clamp value to min/max range
  function clampValue(value, min, max) {
    var num = parseFloat(value);
    if (isNaN(num)) return '';
    if (min !== undefined && min !== -Infinity && num < min) num = min;
    if (max !== undefined && max !== Infinity && num > max) num = max;
    return num;
  }

  // Main plugin function
  $.fn.numberbox = function(options, param) {
    if (typeof options === 'string') {
      // Method call
      var method = $.fn.numberbox.methods[options];
      if (!method) {
        if (window.duiDebug && window.duiDebug.log) {
          window.duiDebug.log('numberbox', options, arguments);
        }
        return this;
      }
      return method(this, param);
    }

    // Initialize each element
    return this.each(function() {
      var state = $.data(this, 'numberbox');
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
  $.fn.numberbox.methods = {
    /**
     * Get options object
     */
    options: function(jq) {
      var state = $.data(jq[0], 'numberbox');
      return state ? state.options : {};
    },

    /**
     * Format current value to specified precision (NEW METHOD)
     * Applies toFixed() with the precision option
     */
    fix: function(jq) {
      return jq.each(function() {
        var state = $.data(this, 'numberbox');
        if (state && state.options) {
          var currentValue = jq.textbox('getValue');
          var formatted = formatNumber(currentValue, state.options.precision);
          if (formatted !== '') {
            jq.textbox('setValue', formatted);
          }
        }
      });
    },

    /**
     * Get numeric value (inherited from textbox, returns string)
     */
    getValue: function(jq) {
      return jq.textbox('getValue');
    },

    /**
     * Set numeric value with validation and formatting
     * Validates min/max constraints and applies precision
     */
    setValue: function(jq, value) {
      return jq.each(function() {
        var state = $.data(this, 'numberbox');
        if (state && state.options) {
          // Parse the value
          var numValue = parseFloat(value);
          
          // Handle NaN
          if (isNaN(numValue)) {
            jq.textbox('setValue', '');
            return;
          }
          
          // Apply min/max constraints
          var clampedValue = clampValue(numValue, state.options.min, state.options.max);
          
          // Format to precision if specified
          if (state.options.precision > 0) {
            clampedValue = formatNumber(clampedValue, state.options.precision);
          }
          
          // Set the value via textbox
          jq.textbox('setValue', clampedValue);
        } else {
          jq.textbox('setValue', value);
        }
      });
    },

    /**
     * Clear numeric input
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
     * Set readonly (limited support for number inputs)
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
     * Destroy numberbox instance
     */
    destroy: function(jq) {
      return jq.each(function() {
        // Remove numberbox state
        $.removeData(this, 'numberbox');
        // Delegate to textbox destroy
        $(this).textbox('destroy');
      });
    }
  };

  // Default options
  $.fn.numberbox.defaults = {
    // Inherit textbox defaults
    // Add numeric-specific defaults
    min: -Infinity,
    max: Infinity,
    step: 1,
    precision: 0,
    decimal: '.',
    groupSeparator: ','
  };

})(jQuery);
