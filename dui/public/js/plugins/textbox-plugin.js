/**
 * Pure4 Textbox Helper - DaisyUI/jQuery API Shim
 *
 * GOLDEN RULE: This plugin ONLY manipulates existing <input> elements.
 * NO DOM construction (.wrap(), .append(), .html() are FORBIDDEN).
 *
 * The HTML structure comes from Pug mixins (daisy_mixins.pug).
 * This plugin provides the EasyUI-compatible API methods.
 */
;(function($) {
  "use strict";

  // Initialize textbox on target element
  function init(target, options) {
    var $target = $(target);
    var state = $.data(target, 'textbox');

    // Merge options with defaults
    var opts = $.extend({}, $.fn.textbox.defaults, options);

    if (!state) {
      // First-time initialization
      state = {
        options: opts,
        originalValue: $target.val() || ''
      };
      $.data(target, 'textbox', state);

      // Store initial value if provided
      if (opts.value !== undefined) {
        $target.val(opts.value);
        state.originalValue = opts.value;
      }

      // Apply disabled/readonly states if specified
      if (opts.disabled) {
        $target.prop('disabled', true);
      }
      if (opts.readonly) {
        $target.prop('readonly', true);
      }

      // Attach event handlers
      attachEvents(target);
    } else {
      // Update options
      state.options = $.extend(state.options, opts);
    }

    return state;
  }

  // Attach event handlers to the input element
  function attachEvents(target) {
    var $target = $(target);
    var state = $.data(target, 'textbox');

    // onChange event
    $target.on('change.textbox', function(e) {
      var newVal = $target.val();
      var opts = state.options;

      if (opts.onChange) {
        opts.onChange.call(target, newVal, state.previousValue || '');
      }

      state.previousValue = newVal;
    });

    // onBlur event
    $target.on('blur.textbox', function(e) {
      var opts = state.options;
      if (opts.onBlur) {
        opts.onBlur.call(target);
      }
    });

    // onFocus event
    $target.on('focus.textbox', function(e) {
      var opts = state.options;
      if (opts.onFocus) {
        opts.onFocus.call(target);
      }
    });

    // onKeyDown event
    $target.on('keydown.textbox', function(e) {
      var opts = state.options;
      if (opts.onKeyDown) {
        opts.onKeyDown.call(target, e);
      }
    });

    // onKeyUp event
    $target.on('keyup.textbox', function(e) {
      var opts = state.options;
      if (opts.onKeyUp) {
        opts.onKeyUp.call(target, e);
      }
    });
  }

  // Main plugin function
  $.fn.textbox = function(options, param) {
    if (typeof options === 'string') {
      // Method call
      var method = $.fn.textbox.methods[options];
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
  $.fn.textbox.methods = {
    /**
     * Get or set options
     */
    options: function(jq) {
      var state = $.data(jq[0], 'textbox');
      return state ? state.options : {};
    },

    /**
     * Get the textbox element (returns the input itself)
     */
    textbox: function(jq) {
      return jq;
    },

    /**
     * Get current value
     */
    getValue: function(jq) {
      return jq.val();
    },

    /**
     * Set value
     */
    setValue: function(jq, value) {
      return jq.each(function() {
        var state = $.data(this, 'textbox');
        var oldVal = $(this).val();

        $(this).val(value);

        // Trigger onChange if value changed
        if (state && state.options.onChange && oldVal !== value) {
          state.options.onChange.call(this, value, oldVal);
        }
      });
    },

    /**
     * Get text (same as getValue for input)
     */
    getText: function(jq) {
      return jq.val();
    },

    /**
     * Set text (same as setValue for input)
     */
    setText: function(jq, value) {
      return $.fn.textbox.methods.setValue(jq, value);
    },

    /**
     * Clear the value
     */
    clear: function(jq) {
      return jq.each(function() {
        $(this).val('');
        var state = $.data(this, 'textbox');
        if (state && state.options.onChange) {
          state.options.onChange.call(this, '', $(this).val());
        }
      });
    },

    /**
     * Reset to original value
     */
    reset: function(jq) {
      return jq.each(function() {
        var state = $.data(this, 'textbox');
        if (state) {
          $(this).val(state.originalValue);
        }
      });
    },

    /**
     * Disable the textbox
     */
    disable: function(jq) {
      return jq.each(function() {
        $(this).prop('disabled', true);
      });
    },

    /**
     * Enable the textbox
     */
    enable: function(jq) {
      return jq.each(function() {
        $(this).prop('disabled', false);
      });
    },

    /**
     * Make readonly
     */
    readonly: function(jq, mode) {
      return jq.each(function() {
        if (mode === undefined) mode = true;
        $(this).prop('readonly', mode);
      });
    },

    /**
     * Initialize value (set initial value without triggering onChange)
     */
    initValue: function(jq, value) {
      return jq.each(function() {
        var state = $.data(this, 'textbox');
        $(this).val(value);
        if (state) {
          state.originalValue = value;
        }
      });
    },

    /**
     * Destroy the textbox (remove events and data)
     */
    destroy: function(jq) {
      return jq.each(function() {
        $(this).off('.textbox');
        $.removeData(this, 'textbox');
      });
    },

    /**
     * Validate the textbox (basic implementation)
     */
    isValid: function(jq) {
      var $input = jq.eq(0);
      var state = $.data($input[0], 'textbox');

      // Check HTML5 validity
      if ($input[0].checkValidity) {
        return $input[0].checkValidity();
      }

      // Check required
      if (state && state.options.required) {
        return $input.val().trim() !== '';
      }

      return true;
    },

    /**
     * Resize the textbox
     */
    resize: function(jq, width) {
      return jq.each(function() {
        if (width) {
          $(this).css('width', width);
        }
      });
    },

    /**
     * Get selection start position
     */
    getSelectionStart: function(jq) {
      var input = jq[0];
      if (input && typeof input.selectionStart === 'number') {
        return input.selectionStart;
      }
      return 0;
    },

    /**
     * Get selection range
     */
    getSelectionRange: function(jq) {
      var input = jq[0];
      if (input && typeof input.selectionStart === 'number') {
        return {
          start: input.selectionStart,
          end: input.selectionEnd
        };
      }
      return { start: 0, end: 0 };
    },

    /**
     * Set selection range
     */
    setSelectionRange: function(jq, start, end) {
      return jq.each(function() {
        if (this.setSelectionRange) {
          this.setSelectionRange(start, end);
        }
      });
    }

    // TODO: Advanced methods to implement later:
    // - cloneFrom(target)
    // - button() - Get button element (requires button support in Pug)
    // - label() - Get label element (requires label support)
    // - getIcon(index) - Get icon element (requires icon support)
    // - getTipX(), getTipY() - Get tooltip position (requires tooltip support)
    // - validate() - Full validation with rules
    // - enableValidation(), disableValidation(), resetValidation()
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
  $.fn.textbox.defaults = {
    value: '',
    disabled: false,
    readonly: false,
    required: false,

    // Event callbacks
    onChange: eventStub('textbox.onChange'),
    onBlur: eventStub('textbox.onBlur'),
    onFocus: eventStub('textbox.onFocus'),
    onKeyDown: eventStub('textbox.onKeyDown'),
    onKeyUp: eventStub('textbox.onKeyUp')
  };

  // Parse options from data-options attribute (for parser support later)
  $.fn.textbox.parseOptions = function(target) {
    var $target = $(target);
    return $.extend({}, {
      value: $target.val(),
      disabled: $target.attr('disabled') ? true : false,
      readonly: $target.attr('readonly') ? true : false,
      required: $target.attr('required') ? true : false
    });
  };

})(jQuery);
