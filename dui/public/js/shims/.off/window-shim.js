/**
 * Window Shim - Extracted from easyui-shim.js
 * DO NOT DELETE from easyui-shim.js
 */

  // --- 5. WINDOW / DIALOG SHIM ---
  // main.js uses .window('open'), .dialog('open').
  // We can try to use standard <dialog> or just log it.
  const winMethods = {
      init: function(opts) { return this; }, // TODO: Implement if needed
      open: function() { return this; },
      close: function() { return this; },
      setTitle: function(t) { return this; }
  };
  $.fn.window = function(method) {
      if (winMethods[method]) return winMethods[method].apply(this, Array.prototype.slice.call(arguments, 1));
      return this;
  };
  $.fn.dialog = $.fn.window; // Dialog is subclass of window in EUI


