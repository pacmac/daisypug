/**
 * Pure4 Button Plugin - DaisyUI/jQuery API
 *
 * JS API for the +button() pug mixin (actions.pug).
 * Provides enable/disable/onClick on <button> elements.
 * Legacy alias: $.fn.linkbutton → $.fn.button (backward compat for page scripts).
 */
(function($) {
  'use strict';

  function parseOptions(target) {
    var t = $(target);
    var base = {};
    if ($.parser && $.parser.parseOptions) {
      base = $.parser.parseOptions(target, [
        'id','iconCls','iconAlign','group','size','text',
        {plain:'boolean',toggle:'boolean',selected:'boolean',outline:'boolean'}
      ]);
    }
    return $.extend({}, base, {
      disabled: (t.attr('disabled') ? true : undefined),
      text: ($.trim(t.html()) || undefined),
      iconCls: (t.attr('icon') || t.attr('iconCls'))
    });
  }

  $.fn.button = function(options, param) {
    if (typeof options === 'string') {
      var method = $.fn.button.methods[options];
      if (method) return method(this, param);
      return this;
    }

    options = options || {};
    return this.each(function() {
      var state = $.data(this, 'button');
      if (state) {
        $.extend(state.options, options);
      } else {
        state = $.data(this, 'button', {
          options: $.extend({}, $.fn.button.defaults, parseOptions(this), options)
        });
        $(this).removeAttr('disabled');
      }

      var opts = state.options;
      if (opts.disabled) {
        $(this).addClass('disabled').addClass('opacity-40').prop('disabled', true);
      } else {
        $(this).removeClass('disabled').removeClass('opacity-40').prop('disabled', false);
      }

      // Bind click handler if provided, with 300ms debounce to prevent double-submit
      $(this).off('click.button');
      if (opts.onClick) {
        var _busy = false;
        $(this).on('click.button', function(e) {
          if (opts.disabled || _busy) {
            e.preventDefault();
            return false;
          }
          _busy = true;
          setTimeout(function() { _busy = false; }, 300);
          opts.onClick.call(this);
        });
      }
    });
  };

  $.fn.button.methods = {
    options: function(jq) {
      return $.data(jq[0], 'button').options;
    },
    enable: function(jq) {
      return jq.each(function() {
        var state = $.data(this, 'button');
        if (state) state.options.disabled = false;
        // Toolbar buttons (.tbut): only enable if butEn allows it (asdpx check)
        if ($(this).hasClass('tbut') && $.dui.buts) {
          var ch = $.dui.buts[$(this).attr('id')];
          var cur = $.dui.asdpx || '';
          if (ch && cur.indexOf(ch) === -1) return; // butEn says no — stay disabled
          $(this).removeClass('opacity-40 pointer-events-none');
        } else {
          $(this).removeClass('disabled opacity-40 pointer-events-none').prop('disabled', false);
        }
      });
    },
    disable: function(jq) {
      return jq.each(function() {
        var state = $.data(this, 'button');
        if (state) state.options.disabled = true;
        if ($(this).hasClass('tbut')) {
          $(this).addClass('opacity-40 pointer-events-none');
        } else {
          $(this).addClass('disabled opacity-40').prop('disabled', true);
        }
      });
    },
    select: function(jq) {
      return jq.each(function() {
        var state = $.data(this, 'button');
        if (state) state.options.selected = true;
        $(this).addClass('active');
      });
    },
    unselect: function(jq) {
      return jq.each(function() {
        var state = $.data(this, 'button');
        if (state) state.options.selected = false;
        $(this).removeClass('active');
      });
    }
  };

  $.fn.button.defaults = {
    id: null,
    disabled: false,
    toggle: false,
    selected: false,
    group: null,
    plain: false,
    text: '',
    iconCls: null,
    iconAlign: 'left',
    size: 'small',
    onClick: null
  };

  // Legacy alias — page scripts use .linkbutton(), keep it working
  $.fn.linkbutton = $.fn.button;
  $.fn.linkbutton.methods = $.fn.button.methods;
  $.fn.linkbutton.defaults = $.fn.button.defaults;

  // Global 300ms click debounce for all buttons (prevents double-submit)
  $(document).on('click', 'button, .btn, .tbut', function() {
    var btn = this;
    if (btn._dbnc) return false;
    btn._dbnc = true;
    setTimeout(function() { btn._dbnc = false; }, 300);
  });

})(jQuery);
