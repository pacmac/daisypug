/**
 * EasyUI Shim Loader
 * Loads individual shim files in order to bridge EasyUI API to DUI implementations
 * Each shim is independent and can be replaced with a widget version later
 */
(function() {
  'use strict';

  var shims = [
    '/dui/js/shims/panel-shim.js',
    '/dui/js/shims/linkbutton-shim.js',
    '/dui/js/shims/menubutton-shim.js',
    '/dui/js/shims/window-shim.js'
  ];

  function loadNext(i) {
    if (i >= shims.length) {
      window.shimsLoaded = true;
      console.log('[shim-loader] All shims loaded');
      return;
    }

    var s = document.createElement('script');
    s.src = shims[i];
    s.onload = function() {
      console.log('[shim-loader] Loaded:', shims[i]);
      loadNext(i + 1);
    };
    s.onerror = function() {
      console.warn('[shim-loader] Failed to load:', shims[i]);
      loadNext(i + 1);
    };
    document.head.appendChild(s);
  }

  loadNext(0);
})();
