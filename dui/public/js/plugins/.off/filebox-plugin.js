/**
 * Pure4 Filebox Helper - DaisyUI/jQuery API Shim
 *
 * GOLDEN RULE: This plugin ONLY manipulates existing <input type="file"> elements.
 * NO DOM construction (.wrap(), .append(), .html() are FORBIDDEN).
 *
 * Strategy: Thin wrapper around textbox-plugin.js that adds file-specific methods.
 * - Adds: files(), setValues()
 * - Overrides: clear(), reset(), setValue() (to handle file input constraints)
 * - Delegates: All other methods to textbox
 *
 * Security Note: File inputs cannot be programmatically set (browser security).
 * setValue/setValues are no-ops to maintain API compatibility.
 *
 * Requires: textbox-plugin.js must be loaded first
 */
;(function($) {
  "use strict";

  // Check if textbox plugin is loaded
  if (!$.fn.textbox) {
    console.error('filebox-plugin.js requires textbox-plugin.js to be loaded first');
    return;
  }

  // Initialize filebox on target element
  function init(target, options) {
    var $target = $(target);
    
    // Ensure type is file
    $target.attr('type', 'file');
    
    // Initialize as textbox first (inherit all textbox functionality)
    $target.textbox(options);
    
    // Get textbox state and extend it for filebox
    var state = $.data(target, 'textbox');
    if (state) {
      // Store filebox-specific reference (shares state with textbox)
      $.data(target, 'filebox', state);
    }
    
    return state;
  }

  // Main plugin function
  $.fn.filebox = function(options, param) {
    if (typeof options === 'string') {
      // Method call
      var method = $.fn.filebox.methods[options];
      if (!method) {
        if (window.duiDebug && window.duiDebug.log) {
          window.duiDebug.log('filebox', options, arguments);
        }
        return this;
      }
      return method(this, param);
    }

    // Initialize each element
    return this.each(function() {
      var state = $.data(this, 'filebox');
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
  $.fn.filebox.methods = {
    /**
     * Get options object
     */
    options: function(jq) {
      var state = $.data(jq[0], 'filebox');
      return state ? state.options : {};
    },

    /**
     * Get FileList object (file-specific method)
     * Returns native browser FileList
     */
    files: function(jq) {
      var target = jq[0];
      return target.files || null;
    },

    /**
     * Get file path/name (inherited from textbox, but file inputs show fake path)
     * Returns: "C:\\fakepath\\filename.txt" (browser security feature)
     */
    getValue: function(jq) {
      return jq.textbox('getValue');
    },

    /**
     * Set file path (no-op due to browser security)
     * Files cannot be programmatically set for security reasons.
     * This method maintains API compatibility but does nothing.
     */
    setValue: function(jq, value) {
      // Security constraint: Cannot set file input value
      // Option 1: Silent no-op (chosen for compatibility)
      // Option 2: Log warning (uncomment below)
      // console.warn('filebox: setValue() cannot programmatically set files (browser security)');
      return jq;
    },

    /**
     * Set multiple file paths (no-op due to browser security)
     * Files cannot be programmatically set for security reasons.
     * This method maintains API compatibility but does nothing.
     */
    setValues: function(jq, values) {
      // Security constraint: Cannot set file input values
      // Silent no-op for API compatibility
      return jq;
    },

    /**
     * Clear selected files
     * Uses direct DOM property (not .val()) for compatibility
     */
    clear: function(jq) {
      return jq.each(function() {
        // Direct DOM manipulation (required for file inputs)
        this.value = '';
        
        // Trigger onChange callback if exists
        var state = $.data(this, 'filebox');
        if (state && state.options && state.options.onChange) {
          state.options.onChange.call(this, '', this.value);
        }
      });
    },

    /**
     * Reset to initial state (empty for file inputs)
     * Same as clear() since file inputs can't have default values
     */
    reset: function(jq) {
      return $.fn.filebox.methods.clear(jq);
    },

    /**
     * Disable file input
     */
    disable: function(jq) {
      return jq.textbox('disable');
    },

    /**
     * Enable file input
     */
    enable: function(jq) {
      return jq.textbox('enable');
    },

    /**
     * Set readonly (limited support for file inputs)
     * Note: File inputs don't fully support readonly attribute
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
     * Destroy filebox instance
     */
    destroy: function(jq) {
      return jq.each(function() {
        // Remove filebox state
        $.removeData(this, 'filebox');
        // Delegate to textbox destroy
        $(this).textbox('destroy');
      });
    }
  };

  // Default options
  $.fn.filebox.defaults = {
    // Inherit textbox defaults
    // Add file-specific defaults if needed
  };

})(jQuery);
