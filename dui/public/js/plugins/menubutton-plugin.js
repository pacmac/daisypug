/**
 * Pure4 Menubutton Plugin — DaisyUI dropdown button API
 *
 * Provides $.fn.menubutton() jQuery API for DaisyUI dropdown buttons
 * rendered by the +menubutton Pug mixin.
 *
 * DaisyUI dropdowns are CSS-driven (:focus-within), so this plugin
 * only handles enable/disable and EasyUI-compatible method calls.
 *
 * DOM structure (from +menubutton mixin):
 *   .dropdown
 *     button.btn(tabindex="0")   ← trigger
 *     ul.dropdown-content        ← menu
 */
(function($) {
  'use strict';

  $.fn.menubutton = function(options, param) {
    if (typeof options === 'string') {
      var method = $.fn.menubutton.methods[options];
      if (method) return method(this, param);
      return this;
    }
    return this;
  };

  $.fn.menubutton.methods = {
    options: function(jq) {
      return {};
    },
    enable: function(jq) {
      return jq.each(function() {
        $(this).removeClass('opacity-40 pointer-events-none').removeAttr('disabled');
      });
    },
    disable: function(jq) {
      return jq.each(function() {
        $(this).addClass('opacity-40 pointer-events-none');
      });
    },
    destroy: function(jq) {
      return jq;
    }
  };

  $.fn.menubutton.defaults = {
    plain: true,
    hasDownArrow: true,
    menu: null,
    menuAlign: 'left',
    duration: 100
  };

})(jQuery);
