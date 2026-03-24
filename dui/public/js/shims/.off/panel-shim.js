/**
 * Panel Shim - DISABLED: replaced by panel-plugin.js
 * DO NOT DELETE from easyui-shim.js
 */

 /* --- PANEL SHIM DISABLED — panel-plugin.js is now the primary implementation ---
 const panelMethods = {
   init: function(options) {
     return this.each(function() {
       const state = $.data(this, 'panel') || {};
       state.options = $.extend({}, $.fn.panel.defaults, state.options, options);
       $.data(this, 'panel', state);
     });
   },
   options: function() {
     if (!this || !this.length) return $.fn.panel.defaults;
     const state = $.data(this[0], 'panel');
     return state ? state.options : $.fn.panel.defaults;
   },
   refresh: function(url) {
     return this.each(function() {
       const $this = $(this);
       const state = $.data(this, 'panel');
       const opts = state ? state.options : $.fn.panel.defaults;
       if (opts.onBeforeLoad) opts.onBeforeLoad.call(this);
       if (url) opts.href = url;

       if (opts.href) {
           let fetchUrl = opts.href;
           if (fetchUrl.startsWith('http') && !fetchUrl.startsWith(window.location.origin)) {
               shimWarn('Shim: Panel refresh blocked external URL:', fetchUrl);
               return;
           }

           fetch(fetchUrl)
               .then(r => {
                   return r.text();
               })
               .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    let content = html;

                    const block = doc.querySelector('[block="page-content"]');
                    const main = doc.querySelector('.page-wrapper');
                    const euiMain = doc.querySelector('#content');

                    if (block) content = block.innerHTML;
                    else if (main) content = main.innerHTML;
                    else if (euiMain) content = euiMain.innerHTML;
                    else if (doc.body) content = doc.body.innerHTML;

                    $this.html(content);
                    if (typeof feather !== 'undefined') feather.replace();
                    $(document).trigger('dui:contentloaded', [$this]);
                    if (opts.onLoad) opts.onLoad.call(this);
               })
               .catch(err => {
                   shimError('Shim: Panel load failed:', err);
                   $this.html('<div class="alert alert-error"><span>Failed to load: ' + err.message + '</span></div>');
                   if (opts.onLoadError) opts.onLoadError.call(this);
               });
       } else {
            $this.empty();
            if (opts.onLoad) opts.onLoad.call(this);
       }
     });
   },
   clear: function() { return this.each(function() { $(this).empty(); }); },
   destroy: function() { return this.each(function() { $(this).remove(); }); }
 };

 if (!$.fn.panel) {
   $.fn.panel = function(method) {
     if (panelMethods[method]) return panelMethods[method].apply(this, Array.prototype.slice.call(arguments, 1));
     else if (typeof method === 'object' || !method) return panelMethods.init.apply(this, arguments);
     else $.error('Method ' + method + ' does not exist on jQuery.panel');
   };
 }
 $.fn.panel.defaults = { href: null, onBeforeLoad: function(){}, onLoad: function(){}, onLoadError: function(){} };
 --- END DISABLED --- */


