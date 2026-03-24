/**
 * Pure4 Passwordbox Helper - DaisyUI/jQuery API Shim
 *
 * GOLDEN RULE: This plugin ONLY manipulates existing <input type="password"> elements.
 * NO DOM construction (.wrap(), .append(), .html() are FORBIDDEN).
 *
 * Strategy: Thin wrapper around textbox-plugin.js that adds password-specific methods.
 * - Adds: showPassword(), hidePassword()
 * - Overrides: clear(), reset() (to ensure type="password" after operation)
 * - Delegates: All other methods to textbox
 *
 * Requires: textbox-plugin.js must be loaded first
 */
;(function($) {
  "use strict";

  // Check if textbox plugin is loaded
  if (!$.fn.textbox) {
    console.error('passwordbox-plugin.js requires textbox-plugin.js to be loaded first');
    return;
  }

  // Initialize passwordbox on target element
  function init(target, options) {
    var $target = $(target);
    
    // Ensure type is password
    $target.attr('type', 'password');
    
    // Initialize as textbox first (inherit all textbox functionality)
    $target.textbox(options);
    
    // Get textbox state and extend it for passwordbox
    var state = $.data(target, 'textbox');
    if (state) {
      // Track password visibility state
      state.passwordRevealed = false;
      
      // Store passwordbox-specific reference
      $.data(target, 'passwordbox', state);
    }
    
    return state;
  }

  // Main plugin function
  $.fn.passwordbox = function(options, param) {
    if (typeof options === 'string') {
      // Method call
      var method = $.fn.passwordbox.methods[options];
      if (method) {
        return method(this, param);
      }
    }

    // Initialization
    return this.each(function() {
      init(this, options);
    });
  };

  // Plugin methods
  $.fn.passwordbox.methods = {
    /**
     * Show password (reveal text)
     * Changes input type from "password" to "text"
     */
    showPassword: function(jq) {
      return jq.each(function() {
        var state = $.data(this, 'passwordbox');
        $(this).attr('type', 'text');
        if (state) {
          state.passwordRevealed = true;
        }
      });
    },

    /**
     * Hide password (mask text)
     * Changes input type from "text" to "password"
     */
    hidePassword: function(jq) {
      return jq.each(function() {
        var state = $.data(this, 'passwordbox');
        $(this).attr('type', 'password');
        if (state) {
          state.passwordRevealed = false;
        }
      });
    },

    /**
     * Clear the password value
     * Override textbox.clear() to ensure password is hidden after clearing
     */
    clear: function(jq) {
      // Call textbox clear
      jq.textbox('clear');
      
      // Ensure password is hidden
      return jq.each(function() {
        var state = $.data(this, 'passwordbox');
        $(this).attr('type', 'password');
        if (state) {
          state.passwordRevealed = false;
        }
      });
    },

    /**
     * Reset to original value
     * Override textbox.reset() to ensure password is hidden after reset
     */
    reset: function(jq) {
      // Call textbox reset
      jq.textbox('reset');
      
      // Ensure password is hidden
      return jq.each(function() {
        var state = $.data(this, 'passwordbox');
        $(this).attr('type', 'password');
        if (state) {
          state.passwordRevealed = false;
        }
      });
    },

    /**
     * Set value
     * Override to ensure we update both textbox and passwordbox state
     */
    setValue: function(jq, value) {
      return jq.textbox('setValue', value);
    },

    /**
     * Get or set options
     * Delegate to textbox
     */
    options: function(jq) {
      return jq.textbox('options');
    },

    /**
     * Get the textbox element (returns the input itself)
     * Delegate to textbox
     */
    textbox: function(jq) {
      return jq.textbox('textbox');
    },

    /**
     * Get current value
     * Delegate to textbox
     */
    getValue: function(jq) {
      return jq.textbox('getValue');
    },

    /**
     * Get text (same as getValue)
     * Delegate to textbox
     */
    getText: function(jq) {
      return jq.textbox('getText');
    },

    /**
     * Set text (same as setValue)
     * Delegate to textbox
     */
    setText: function(jq, value) {
      return jq.textbox('setText', value);
    },

    /**
     * Disable the passwordbox
     * Delegate to textbox
     */
    disable: function(jq) {
      return jq.textbox('disable');
    },

    /**
     * Enable the passwordbox
     * Delegate to textbox
     */
    enable: function(jq) {
      return jq.textbox('enable');
    },

    /**
     * Make readonly
     * Delegate to textbox
     */
    readonly: function(jq, mode) {
      return jq.textbox('readonly', mode);
    },

    /**
     * Initialize value (set without triggering onChange)
     * Delegate to textbox
     */
    initValue: function(jq, value) {
      return jq.textbox('initValue', value);
    },

    /**
     * Destroy the passwordbox
     * Delegate to textbox and clean up passwordbox state
     */
    destroy: function(jq) {
      return jq.each(function() {
        $(this).textbox('destroy');
        $.removeData(this, 'passwordbox');
      });
    },

    /**
     * Validate the passwordbox
     * Delegate to textbox
     */
    isValid: function(jq) {
      return jq.textbox('isValid');
    },

    /**
     * Resize the passwordbox
     * Delegate to textbox
     */
    resize: function(jq, width) {
      return jq.textbox('resize', width);
    },

    /**
     * Get selection start position
     * Delegate to textbox
     */
    getSelectionStart: function(jq) {
      return jq.textbox('getSelectionStart');
    },

    /**
     * Get selection range
     * Delegate to textbox
     */
    getSelectionRange: function(jq) {
      return jq.textbox('getSelectionRange');
    },

    /**
     * Set selection range
     * Delegate to textbox
     */
    setSelectionRange: function(jq, start, end) {
      return jq.textbox('setSelectionRange', start, end);
    },

    /**
     * Check if password is currently revealed
     * Passwordbox-specific helper
     */
    isRevealed: function(jq) {
      var state = $.data(jq[0], 'passwordbox');
      return state ? state.passwordRevealed : false;
    }
  };

  // Default options (inherit from textbox)
  $.fn.passwordbox.defaults = $.extend({}, $.fn.textbox.defaults, {
    // Passwordbox-specific defaults can go here
  });

  // Parse options from data-options attribute
  $.fn.passwordbox.parseOptions = function(target) {
    return $.fn.textbox.parseOptions(target);
  };

})(jQuery);
