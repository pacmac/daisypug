/**
 * Pure4 Multibox Plugin — DUI multi-select checkbox widget
 *
 * DOM is rendered server-side by +input mixin (class:'multibox'):
 *   input[type=hidden]          — stores comma-separated value for form submit
 *   div.multibox.dropdown       — container (DaisyUI dropdown, untouched by JS)
 *     div.multibox-trigger      — styled as input, shows "Selected Items (N)"
 *     div.dropdown-content      — DaisyUI panel with checkbox grid
 *       div.multibox-grid       — grid of label > checkbox + span
 *     template.multibox-item-tpl — cloned for dynamic items (_sqlid AJAX)
 *
 * Methods: getValue, getValues, setValue, setValues, clear, loadData, options
 * Events: onSelect(newVals, oldVals)
 * Integrates with: parser-plugin, form-plugin, remember-plugin
 *
 * Dependencies: form-plugin.js (fieldTypes), parser-plugin.js (auto-init)
 */
(function($) {
  'use strict';

  // ── Main entry point ────────────────────────────────────────────────
  $.fn.multibox = function(options, param) {
    if (typeof options === 'string') {
      var method = $.fn.multibox.methods[options];
      if (method) return method(this, param);
      console.warn('[multibox] unknown method:', options);
      return this;
    }

    options = options || {};
    return this.each(function() {
      var $el = $(this);
      var state = $.data(this, 'multibox');
      if (state) {
        $.extend(state.options, options);
        return;
      }

      // Parse options from data attributes + data-options + passed opts
      var parsed = $.parser ? $.parser.parseOptions(this) : {};
      var opts = $.extend({}, $.fn.multibox.defaults, parsed, options);

      // Resolve _sqlid from attribute if not in options
      if (!opts._sqlid && $el.attr('data-sqlid')) opts._sqlid = $el.attr('data-sqlid');
      if (!opts._sqlid && $el.attr('_sqlid')) opts._sqlid = $el.attr('_sqlid');

      // Columns from data attribute
      if ($el.attr('data-columns')) opts.columns = parseInt($el.attr('data-columns'), 10) || 1;
      if ($el.attr('data-separator')) opts.separator = $el.attr('data-separator');

      // Store state
      state = { options: opts };
      $.data(this, 'multibox', state);

      // Find associated hidden input
      var forId = $el.attr('data-for');
      state.$input = forId ? $el.prev('input[type="hidden"][id="' + forId + '"]') : $();

      // Cache DOM refs — works with server-rendered DOM, no class manipulation
      state.$trigger = $el.find('.multibox-trigger');
      state.$panel = $el.find('.dropdown-content');
      state.$grid = $el.find('.multibox-grid');
      state.$text = $el.find('.multibox-text');
      state.$tpl = $el.find('template.multibox-item-tpl');

      // Stretch panel to fitem width on first open (multi-column only)
      var $fitem = $el.closest('.fitem');
      if ($fitem.length && opts.columns > 1) {
        state.$trigger.one('focusin', function() {
          state.$panel.css('width', $fitem.outerWidth() + 'px');
        });
      }

      // Wire checkbox change events
      $el.on('change', 'input[type="checkbox"]', function() {
        _syncValue($el, state);
      });

      // Load remote data if _sqlid specified
      if (opts._sqlid) {
        _loadRemote($el, state);
      }

      // Restore from remember plugin (key from $input which has the id)
      if ($el.hasClass('remember') && $.remember) {
        var saved = $.remember.get(state.$input);
        if (saved !== null && saved !== '') {
          setTimeout(function() {
            $.fn.multibox.methods.setValue($el, saved);
          }, 0);
        }
      }

      // Restore from hidden input value (e.g. form load)
      var initVal = state.$input.val();
      if (initVal) {
        setTimeout(function() {
          $.fn.multibox.methods.setValue($el, initVal);
        }, 0);
      }
    });
  };

  // ── Internal helpers ────────────────────────────────────────────────

  function _syncValue($el, state) {
    var oldVal = state.$input.val() || '';
    var oldVals = oldVal ? oldVal.split(state.options.separator).filter(Boolean) : [];

    // Gather checked values
    var newVals = [];
    state.$grid.find('input[type="checkbox"]:checked').each(function() {
      newVals.push(this.value);
    });

    var newVal = newVals.join(state.options.separator);

    // Update hidden input
    state.$input.val(newVal);

    // Update display text
    _updateText(state, newVals.length);

    // Fire onSelect callback
    if (state.options.onSelect) {
      state.options.onSelect.call($el[0], newVals, oldVals);
    }

    // Persist via remember plugin (key from $input which has the id)
    if ($el.hasClass('remember') && $.remember) {
      $.remember.set(state.$input, newVal);
    }
  }

  function _updateText(state, count) {
    if (count === 0) {
      state.$text.text(state.options.prompt).addClass('opacity-50');
    } else {
      state.$text.text('Selected Items (' + count + ')').removeClass('opacity-50');
    }
  }

  function _loadRemote($el, state) {
    var url = '/?_func=get&_combo=y&_sqlid=' + state.options._sqlid;
    $.ajax({
      url: url,
      type: 'post',
      success: function(data) {
        if (typeof data === 'string') {
          try { data = JSON.parse(data); } catch(e) { return; }
        }
        if (Array.isArray(data)) {
          _renderItems($el, state, data);
          // After remote load, restore value if set
          var val = state.$input.val();
          if (val) {
            $.fn.multibox.methods.setValue($el, val);
          }
        }
      }
    });
  }

  function _renderItems($el, state, data) {
    var $grid = state.$grid;
    var $tpl = state.$tpl;
    if (!$tpl.length) return;

    var tplContent = $tpl[0].content;
    for (var i = 0; i < data.length; i++) {
      var item = data[i];
      var $clone = $(tplContent.cloneNode(true));
      var $label = $clone.children().first();
      var $cb = $label.find('input[type="checkbox"]');
      var $span = $label.find('span');

      $cb.attr('value', item.value != null ? item.value : item.text);
      $cb.attr('data-text', item.text);
      $span.text(item.text);

      $grid.append($label);
    }
  }

  // ── Methods ─────────────────────────────────────────────────────────
  $.fn.multibox.methods = {

    options: function(jq) {
      return $.data(jq[0], 'multibox').options;
    },

    getValue: function(jq) {
      var state = $.data(jq[0], 'multibox');
      if (!state) return '';
      return state.$input.val() || '';
    },

    getValues: function(jq) {
      var state = $.data(jq[0], 'multibox');
      if (!state) return [];
      var val = state.$input.val() || '';
      return val ? val.split(state.options.separator).filter(Boolean) : [];
    },

    setValue: function(jq, val) {
      return jq.each(function() {
        var state = $.data(this, 'multibox');
        if (!state) return;
        var vals;
        if (Array.isArray(val)) {
          vals = val;
        } else {
          vals = (val || '').split(state.options.separator).filter(Boolean);
        }

        // Check/uncheck boxes
        state.$grid.find('input[type="checkbox"]').each(function() {
          this.checked = vals.indexOf(this.value) > -1;
        });

        // Update hidden input + display text
        state.$input.val(vals.join(state.options.separator));
        _updateText(state, vals.length);

        // Persist (key from $input which has the id)
        var $el = $(this);
        if ($el.hasClass('remember') && $.remember) {
          $.remember.set(state.$input, vals.join(state.options.separator));
        }
      });
    },

    setValues: function(jq, vals) {
      return $.fn.multibox.methods.setValue(jq, vals || []);
    },

    clear: function(jq) {
      return jq.each(function() {
        var state = $.data(this, 'multibox');
        if (!state) return;
        state.$grid.find('input[type="checkbox"]').prop('checked', false);
        state.$input.val('');
        _updateText(state, 0);

        var $el = $(this);
        if ($el.hasClass('remember') && $.remember) {
          $.remember.remove(state.$input);
        }
      });
    },

    loadData: function(jq, data) {
      return jq.each(function() {
        var state = $.data(this, 'multibox');
        if (!state) return;
        state.$grid.empty();
        _renderItems($(this), state, data || []);
      });
    }
  };

  // ── Defaults ────────────────────────────────────────────────────────
  $.fn.multibox.defaults = {
    columns:   1,
    separator: ',',
    prompt:    'Select items...',
    _sqlid:    null,
    onSelect:  function(/* newVals, oldVals */) {}
  };

  // ── Register with parser + form ─────────────────────────────────────
  if ($.parser && $.parser.plugins) {
    $.parser.plugins.push('multibox');
  }

  if ($.fn.form && $.fn.form.defaults && $.fn.form.defaults.fieldTypes) {
    $.fn.form.defaults.fieldTypes.unshift('multibox');
  }

  if ($.dui && $.dui._plugins) $.dui._plugins.loaded.push('multibox-plugin');

})(jQuery);
