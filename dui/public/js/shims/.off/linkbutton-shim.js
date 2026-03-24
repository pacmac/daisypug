/**
 * Linkbutton Shim - Extracted from easyui-shim.js
 * DO NOT DELETE from easyui-shim.js
 */

  // --- 2. LINKBUTTON SHIM ---
  // Just binds click handler if onClick is provided. Does NOT change DOM.
  const linkMethods = {
    init: function(options) {
      return this.each(function() {
        const $this = $(this);
        const state = $.data(this, 'linkbutton') || {};
        const opts = $.extend({}, $.fn.linkbutton.defaults, state.options, options);
        $.data(this, 'linkbutton', {options: opts});
        
        // Unbind previous to prevent dupes if re-inited
        $this.off('click.shim');
        if (opts.onClick) {
            $this.on('click.shim', function(e) {
                if ($(this).hasClass('disabled') || $(this).attr('disabled')) return;
                opts.onClick.call(this, e);
            });
        }
        if (opts.disabled) $this.addClass('disabled').attr('disabled', true);
        else $this.removeClass('disabled').removeAttr('disabled');
      });
    },
    options: function() { return $.data(this[0], 'linkbutton').options; },
    enable: function() { 
        return this.each(function() { $(this).removeClass('disabled').removeAttr('disabled'); }); 
    },
    disable: function() { 
        return this.each(function() { $(this).addClass('disabled').attr('disabled', true); }); 
    }
  };
  if (!$.fn.linkbutton) {
    $.fn.linkbutton = function(method) {
      if (linkMethods[method]) return linkMethods[method].apply(this, Array.prototype.slice.call(arguments, 1));
      else if (typeof method === 'object' || !method) return linkMethods.init.apply(this, arguments);
      else return this; // Ignore unknown methods
    };
    $.fn.linkbutton.defaults = { onClick: null, disabled: false };
  }


