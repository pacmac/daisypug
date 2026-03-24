/**
 * jQuery Combo Plugin - Base dropdown selection component
 * 
 * Extends textbox with dropdown data selection.
 * Core methods: options, getValue, setValue, clear, reset, showPanel, hidePanel, destroy
 * 
 * HTML Structure (from Pug):
 *   .combo-container
 *     .join
 *       input.input.easyui-combo
 *       button[data-action="toggle-panel"] ▼
 *     .combo-panel.hidden
 *       ul.menu
 */

(function($) {
  'use strict';

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
  var defaults = {
    data: [],                    // Array of {text, value} objects
    valueField: 'value',         // Field name for value
    textField: 'text',           // Field name for display text
    panelHeight: 'auto',         // 'auto' or pixel value
    panelWidth: null,            // null = match input width
    editable: true,              // Allow typing in input
    multiple: false,             // Single or multi-select
    onSelect: eventStub('combo.onSelect'),              // Callback: function(record)
    onUnselect: eventStub('combo.onUnselect'),             // Callback: function(record)
  };

  /**
   * Main combo plugin
   */
  $.fn.combo = function(options) {
    if (typeof options === 'string') {
      var method = options;
      var args = Array.prototype.slice.call(arguments, 1);
      var target = this.eq(0);
      if (!target[0]) return this;
      var state = $.data(target[0], 'easyui-combo');
      if (!state) return this;
      if (typeof $.fn.combo.methods[method] === 'function') {
        return $.fn.combo.methods[method].apply(target, [state].concat(args));
      }
      return this;
    }

    return this.each(function() {
      var $this = $(this);
      var state = $.data(this, 'easyui-combo');

      if (!state) {
        state = {
          options: $.extend({}, defaults, options || {}),
          target: this,
          $input: $this,
          $container: $this.closest('.combo-container'),
          $panel: null,
          $button: null,
          $menu: null,
          selectedRecord: null,
          panelVisible: false,
        };

        // Cache panel and button references
        state.$panel = state.$container.find('.combo-panel');
        state.$button = state.$container.find('button[data-action="toggle-panel"]');
        state.$menu = state.$panel.find('.menu');

        // Render initial data
        if (state.options.data && state.options.data.length > 0) {
          _renderMenuItems.call(state);
        }

        // Attach event handlers
        _attachEvents.call(state);

        $.data(this, 'easyui-combo', state);
      }
    });
  };

  /**
   * Combo methods
   */
  $.fn.combo.methods = {
    options: function(state, opts) {
      if (opts) {
        state.options = $.extend(state.options, opts);
        if (opts.data) {
          _renderMenuItems.call(state);
        }
        return this;
      }
      return state.options;
    },

    getValue: function(state) {
      return state.$input.val() || '';
    },

    setValue: function(state, value) {
      state.$input.val(value || '');
      // Find matching record
      if (state.options.data && value) {
        var record = state.options.data.find(r => r[state.options.valueField] === value);
        if (record) {
          state.selectedRecord = record;
        }
      }
      return this;
    },

    clear: function(state) {
      state.$input.val('');
      state.selectedRecord = null;
      return this;
    },

    reset: function(state) {
      // Reset to original value (if any)
      state.$input.val('');
      state.selectedRecord = null;
      return this;
    },

    showPanel: function(state) {
      state.$panel.removeClass('hidden');
      state.panelVisible = true;
      // Position panel below input
      _positionPanel.call(state);
      return this;
    },

    hidePanel: function(state) {
      state.$panel.addClass('hidden');
      state.panelVisible = false;
      return this;
    },

    destroy: function(state) {
      // Detach events
      state.$input.off('.combo');
      state.$button.off('.combo');
      state.$menu.off('.combo');
      // Clear data
      $.removeData(this, 'easyui-combo');
      return this;
    },
  };

  // Parse options from element (stub for compatibility with combobox-helper)
  $.fn.combo.parseOptions = function(target) {
    return {};
  };

  /**
   * Internal helpers
   */

  function _attachEvents() {
    var self = this;

    // Toggle panel on button click
    this.$button.on('click.combo', function(e) {
      e.preventDefault();
      if (self.panelVisible) {
        $.fn.combo.methods.hidePanel.call(self.$input, self);
      } else {
        $.fn.combo.methods.showPanel.call(self.$input, self);
      }
    });

    // Show panel on input focus
    this.$input.on('focus.combo', function() {
      if (self.options.data && self.options.data.length > 0) {
        $.fn.combo.methods.showPanel.call(self.$input, self);
      }
    });

    function isHover($el) {
      if (!$el || !$el.length) return false;
      var el = $el[0];
      if (!el || typeof el.matches !== 'function') return false;
      try {
        return el.matches(':hover');
      } catch (e) {
        return false;
      }
    }

    // Hide panel on input blur (with delay to allow menu click)
    this.$input.on('blur.combo', function() {
      setTimeout(function() {
        if (!isHover(self.$menu) && !isHover(self.$button)) {
          $.fn.combo.methods.hidePanel.call(self.$input, self);
        }
      }, 100);
    });

    // Prevent blur when hovering menu
    this.$menu.on('mouseenter.combo', function() {
      self.$input.off('blur.combo');
    }).on('mouseleave.combo', function() {
      self.$input.on('blur.combo', function() {
        $.fn.combo.methods.hidePanel.call(self.$input, self);
      });
    });

    // Menu item click
    this.$menu.on('click.combo', 'li a', function(e) {
      e.preventDefault();
      var $item = $(this).closest('li');
      var index = $item.index();
      var record = self.options.data[index];
      
      if (record) {
        // Set input value to display text
        self.$input.val(record[self.options.textField]);
        self.selectedRecord = record;
        
        // Trigger callback
        if (self.options.onSelect && typeof self.options.onSelect === 'function') {
          self.options.onSelect.call(self.$input[0], record);
        }
      }
      
      // Hide panel
      $.fn.combo.methods.hidePanel.call(self.$input, self);
    });
  }

  function _renderMenuItems() {
    var self = this;
    this.$menu.empty();
    
    if (!this.options.data || this.options.data.length === 0) {
      return;
    }

    this.options.data.forEach(function(record, index) {
      var text = record[self.options.textField] || '';
      var $li = $('<li>').append(
        $('<a href="#">').text(text)
      );
      self.$menu.append($li);
    });
  }

  function _positionPanel() {
    var self = this;
    var $input = this.$input;
    
    // Set panel width to match input width
    if (this.options.panelWidth === null) {
      this.$panel.css('width', $input.outerWidth() + 'px');
    } else {
      this.$panel.css('width', this.options.panelWidth);
    }
    
    // Set panel height
    if (this.options.panelHeight !== 'auto') {
      this.$panel.css('max-height', this.options.panelHeight);
    }
  }

})(jQuery);
