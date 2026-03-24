// EasyUI Shim for DaisyUI Migration
// Provides compatibility for main.js without loading the full EasyUI library.

var SHIM_LOG = false;
function shimLog() {
  if (!SHIM_LOG) return;
  console.log.apply(console, arguments);
}
function shimWarn() {
  if (!SHIM_LOG) return;
  console.warn.apply(console, arguments);
}
function shimError() {
  if (!SHIM_LOG) return;
  console.error.apply(console, arguments);
}

// ============================================================================
// Global eui Object (Required by qbedef.js, eui.qbe.js, etc.)
// ============================================================================
window.eui = window.eui || {};

// ============================================================================
// jQuery Parser (Required by EasyUI extensions)
// ============================================================================
if (typeof $.parser === 'undefined') {
  $.parser = {
    plugins: [],
    onComplete: null,
    parse: function(target) {
      shimLog('[SHIM] $.parser.parse called (no-op for DUI)');
    }
  };
}

// ============================================================================
// jQuery Selector Shim - Clean Query Params from IDs
// ============================================================================
// Fix: render tool appends ?ui=dui after hash, causing jQuery selector syntax errors
// When main.js does $('#inv^sa_parts?ui=dui'), we need to strip the query part first
(function() {
  const originalJQuery = window.jQuery;

  // Create a Proxy that intercepts all calls to jQuery
  const jqueryShim = new Proxy(originalJQuery, {
    apply: function(target, thisArg, argumentsList) {
      let selector = argumentsList[0];
      const context = argumentsList[1];

      // If selector is a string starting with #, check for query params
      if (typeof selector === 'string' && selector.startsWith('#')) {
        const hashPart = selector.substring(1); // Remove the #
        if (hashPart.indexOf('?') !== -1) {
          const cleanId = hashPart.split('?')[0];
          selector = '#' + cleanId;
          shimLog('[SHIM] jQuery selector: cleaned query params, using:', selector);
          argumentsList[0] = selector;
        }
      }

      // Call original jQuery with modified arguments
      return target.apply(thisArg, argumentsList);
    },

    get: function(target, prop) {
      // Return the original property/method from jQuery
      return target[prop];
    },

    set: function(target, prop, value) {
      // Allow setting properties on jQuery
      target[prop] = value;
      return true;
    }
  });

  // Replace global $ and jQuery with our proxy
  if (typeof window !== 'undefined') {
    window.$ = jqueryShim;
    window.jQuery = jqueryShim;
  }
})();

// ============================================================================
// localStorage lpage Debug Shim
// ============================================================================
// Clear lpage when ?debug parameter is present to allow clean hash-based navigation testing
(function() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('debug')) {
    localStorage.removeItem('lpage');
    shimLog('[SHIM] Debug mode: cleared localStorage.lpage for clean hash navigation');
  }
})();

// ============================================================================
// Development Mode - Disable Auto-Refresh Timers
// ============================================================================
// Disable idle ping timer and flash message timer during development
// Activate by adding ?dev or ?debug to URL
(function() {
  const urlParams = new URLSearchParams(window.location.search);
  const isDevelopment = urlParams.has('dev') || urlParams.has('debug');

  if (isDevelopment) {
    shimLog('[SHIM DEV] Development mode activated via URL parameter');

    // Override ping() function to prevent session check reloads
    window.addEventListener('DOMContentLoaded', function() {
      // Wait for main.js to load, then override ping
      setTimeout(function() {
        if (typeof window.ping === 'function') {
          const originalPing = window.ping;
          window.ping = function() {
            shimLog('[SHIM DEV] Ping blocked - session check disabled');
            // Do nothing - prevents the reload on line 655
          };
          shimLog('[SHIM DEV] Overrode ping() function to prevent session reloads');
        }
      }, 100);
    });

    // Intercept setInterval to block timers
    const originalSetInterval = window.setInterval;
    const blockedIntervals = new Set();

    window.setInterval = function(callback, delay) {
      const callbackStr = callback.toString();

      // Block 60-second timer (idle ping)
      if (delay === 60000) {
        shimLog('[SHIM DEV] Blocked 60s interval timer (likely idle ping)');
        const fakeId = Math.random();
        blockedIntervals.add(fakeId);
        return fakeId;
      }

      // Block 5-second timer (flash messages)
      if (delay === 5000 && (callbackStr.includes('flash') || callbackStr.includes('dwap.flashint'))) {
        shimLog('[SHIM DEV] Blocked 5s interval timer (flash messages)');
        const fakeId = Math.random();
        blockedIntervals.add(fakeId);
        return fakeId;
      }

      // Allow all other timers
      return originalSetInterval.apply(this, arguments);
    };

    // Intercept clearInterval to handle fake IDs
    const originalClearInterval = window.clearInterval;
    window.clearInterval = function(id) {
      if (blockedIntervals.has(id)) {
        blockedIntervals.delete(id);
        shimLog('[SHIM DEV] Ignored clearInterval on blocked timer');
        return;
      }
      return originalClearInterval.apply(this, arguments);
    };

    // Also prevent document.location.href reloads
    const originalLocationSetter = Object.getOwnPropertyDescriptor(window.Document.prototype, 'location').set;
    Object.defineProperty(document, 'location', {
      set: function(value) {
        if (value === '/' || value === window.location.origin + '/') {
          shimWarn('[SHIM DEV] Blocked page reload to "/"');
          return;
        }
        return originalLocationSetter.call(this, value);
      },
      get: function() {
        return window.location;
      }
    });

    shimLog('[SHIM DEV] Auto-refresh protection enabled');
    shimLog('[SHIM DEV] - Ping function will be disabled');
    shimLog('[SHIM DEV] - 60s idle timer blocked');
    shimLog('[SHIM DEV] - 5s flash timer blocked');
    shimLog('[SHIM DEV] - Page reload to "/" blocked');
  }
})();

// ============================================================================
// UI Framework Cookie Reader
// ============================================================================
function getUIFramework() {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'ui_framework') return value;
  }
  return 'dui'; // default
}

// ============================================================================
// AJAX Interceptor - Inject UI Parameter
// ============================================================================
// Intercept jQuery AJAX to append ui parameter when using EUI framework
(function() {
  if (typeof $ === 'undefined' || typeof $.ajax === 'undefined') return;

  const originalAjax = $.ajax;

  $.ajax = function(url, options) {
    // Handle both $.ajax(url, options) and $.ajax(options) signatures
    if (typeof url === 'object') {
      options = url;
      url = options.url;
    }
    options = options || {};

    const framework = getUIFramework();
    if (framework === 'eui' && url) {
      // Append ui=eui to URL if not already present
      if (url.indexOf('ui=') === -1) {
        const separator = url.indexOf('?') === -1 ? '?' : '&';
        url = url + separator + 'ui=eui';
        options.url = url;
      }
    }

    return originalAjax.call($, url, options);
  };
})();

(function($) {
  
 // --- 1. PANEL SHIM --- DISABLED: replaced by panel-plugin.js
 /* --- PANEL SHIM DISABLED ---
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
               .then(r => { return r.text(); })
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


  // --- 2. LINKBUTTON SHIM --- DISABLED: replaced by linkbutton-plugin.js
  // Sync stub kept for main.js init timing
  if (!$.fn.linkbutton) {
    $.fn.linkbutton = function(method) { return this; };
    $.fn.linkbutton.defaults = { onClick: null, disabled: false };
  }


  // --- 3. MENUBUTTON SHIM --- sync stub, overridden by menubutton-plugin.js (async)
  if (!$.fn.menubutton) {
    $.fn.menubutton = function(opts) { return this; };
  }


  // --- 4. TREE SHIM ---
  // Enhanced to work with DaisyUI menu structure while main.js calls tree methods
  function treeShimImpl($menu, opts, args) {
    if (typeof opts === 'string') {
        // String commands: 'getSelected', 'find', 'select', 'expandTo', 'getRoot'
        
        // tree('find', itemId) - Find menu item by ID
        if (opts === 'find') {
            let itemId = args[1];
            if (!itemId) return null;
            
            // WORKAROUND: render tool sometimes adds query params to hash
            // e.g., "inv^sa_parts?ui=eui&debug=y" instead of just "inv^sa_parts"
            // Extract just the menu ID part before any query string
            if (itemId.indexOf('?') !== -1) {
                itemId = itemId.split('?')[0];
                // console.log('[TREE SHIM] Cleaned itemId from query params:', itemId);
            }
            
            // DUI: Look for menu item with matching ID in ul.menu structure
            const $item = $menu.find('a[id="' + itemId.replace(/"/g, '\\"') + '"]').first();
            if ($item.length > 0) {
                // console.log('[TREE SHIM] Found DUI menu item:', itemId);
                // Return mock tree node object that main.js expects
                return {
                    id: itemId,
                    target: itemId,
                    text: $item.find('span').text().trim() || $item.text().trim(),
                    link: $item.attr('href'),
                    children: null,  // DUI menu items are typically leaf nodes
                    $el: $item
                };
            }
            // console.log('[TREE SHIM] Menu item NOT found:', itemId);
            return null;
        }
        
        // tree('getSelected') - Get currently selected item
        if (opts === 'getSelected') {
            const $selected = $menu.find('.active a').first();
            if ($selected.length > 0) {
                return {
                    id: $selected.attr('id'),
                    target: $selected.attr('id'),
                    text: $selected.find('span').text().trim() || $selected.text().trim(),
                    link: $selected.attr('href'),
                    children: null,
                    $el: $selected
                };
            }
            return null;
        }
        
        // tree('select', nodeTarget) - Select a node by ID
        if (opts === 'select') {
            const target = args[1];
            if (!target) return;
            
            const $item = $menu.find('a[id="' + target.replace(/"/g, '\\"') + '"]').first();
            if ($item.length > 0) {
                // console.log('[TREE SHIM] Selecting DUI menu item:', target);
                $menu.find('a').removeClass('active');
                $item.addClass('active');
            }
        }
        
        // tree('expandTo', nodeTarget) - Expand tree to show node
        if (opts === 'expandTo') {
            const target = args[1];
            if (!target) return;
            
            const $item = $menu.find('a[id="' + target.replace(/"/g, '\\"') + '"]').first();
            if ($item.length > 0) {
                // console.log('[TREE SHIM] Expanding to DUI menu item:', target);
                // Expand parent details if nested
                $item.closest('li details').attr('open', 'open');
            }
        }
        
        // tree('getRoot', nodeTarget) - Get root node (for DUI, return self)
        if (opts === 'getRoot') {
            const target = args[1];
            if (!target) return null;
            
            const $item = $menu.find('a[id="' + target.replace(/"/g, '\\"') + '"]').first();
            if ($item.length > 0) {
                return {
                    id: target,
                    target: target,
                    text: $item.find('span').text().trim() || $item.text().trim(),
                    link: $item.attr('href'),
                    children: null
                };
            }
            return null;
        }
    }
    return $menu; 
  }

  // DISABLED: tree-plugin.js now provides $.fn.tree override
  // if (!$.fn.tree) {
  //   $.fn.tree = function(opts) {
  //     const $menu = this;
  //     if (window.DUI_USE_PAGENAV_SHIM && window.duiPagenav && $menu.attr('id') === 'westMenu') {
  //       if (typeof opts === 'string') {
  //         if (opts === 'find') return window.duiPagenav.find(arguments[1]);
  //         if (opts === 'getSelected') return window.duiPagenav.getSelected();
  //         if (opts === 'select') return window.duiPagenav.select(arguments[1]);
  //         if (opts === 'expandTo') return window.duiPagenav.expandTo(arguments[1]);
  //         if (opts === 'getRoot') return window.duiPagenav.getRoot(arguments[1]);
  //         if (opts === 'collapseAll') { $menu.find('details').removeAttr('open'); return $menu; }
  //         if (opts === 'expandAll') { $menu.find('details').attr('open', ''); return $menu; }
  //       }
  //       if (typeof opts === 'object' || !opts) {
  //         return window.duiPagenav.init($menu, opts);
  //       }
  //       return $menu;
  //     }
  //
  //     return treeShimImpl($menu, opts, arguments);
  //   };
  // }


  // --- 5. WINDOW / DIALOG SHIM --- DISABLED: replaced by window-plugin.js + dialog-plugin.js
  // Sync stubs kept for main.js init timing
  if (!$.fn.window) {
    $.fn.window = function(method) { return this; };
  }
  if (!$.fn.dialog) {
    $.fn.dialog = function(method) { return this; };
  }


  // --- 6. FORM SHIM ---
  // Removed: DUI form helper now owns $.fn.form to avoid shim conflicts.


  // --- 7. TABS SHIM --- DISABLED: replaced by tabs-plugin.js
  // $.fn.tabs = function(method) { return this; };


  // --- 8. COMMON FORM WIDGET SHIMS ---
  // Keep these generic and data-driven so legacy main.js can run while DUI-native behavior is built.
  function wlog(fn, msg, extra) {
      if (extra === undefined) {
          console.log('[' + fn + '] ' + msg);
          return;
      }
      console.log('[' + fn + '] ' + msg, extra);
  }

  function getWidgetState(target, key) {
      var state = $.data(target, key);
      if (!state) {
          state = { options: {}, data: [] };
          $.data(target, key, state);
      }
      return state;
  }

  function widgetValue($el, next) {
      if (next === undefined) return $el.val();
      $el.val(next);
      return next;
  }

  function textboxLikePlugin(name) {
      $.fn[name] = function(method, param) {
          if (typeof method !== 'string') {
              var initOpts = method || {};
              return this.each(function() {
                  var state = getWidgetState(this, name);
                  state.options = $.extend({}, state.options, initOpts);
                  wlog(name + '.init', 'initialized', { id: this.id || null, name: this.name || null });
              });
          }

          var $el = this.eq(0);
          if (!$el.length) return method === 'getValue' ? '' : this;

          if (method === 'options') {
              var st = getWidgetState($el[0], name);
              if (param && typeof param === 'object') {
                  st.options = $.extend({}, st.options, param);
                  wlog(name + '.options', 'merged options', st.options);
                  return this;
              }
              return st.options;
          }
          if (method === 'getValue') return widgetValue($el);
          if (method === 'setValue') {
              widgetValue($el, param == null ? '' : param);
              wlog(name + '.setValue', 'value set', { id: $el.attr('id') || null, value: $el.val() });
              return this;
          }
          if (method === 'clear') {
              widgetValue($el, '');
              wlog(name + '.clear', 'value cleared');
              return this;
          }
          if (method === 'reset') {
              this.each(function() {
                  this.value = this.defaultValue || '';
              });
              wlog(name + '.reset', 'value reset');
              return this;
          }
          if (method === 'enable') return this.prop('disabled', false);
          if (method === 'disable') return this.prop('disabled', true);
          if (method === 'readonly') {
              if (param === undefined) return !!$el.prop('readonly');
              return this.prop('readonly', !!param);
          }
          if (method === 'textbox') return this;
          if (method === 'validate' || method === 'isValid') return true;
          if (method === 'resize') return this;
          wlog(name + '.method', 'unsupported method passthrough', { method: method });
          return this;
      };
  }

  textboxLikePlugin('textbox');
  textboxLikePlugin('numberbox');
  textboxLikePlugin('numberspinner');
  textboxLikePlugin('datebox');
  textboxLikePlugin('datetimebox');
  textboxLikePlugin('timespinner');
  textboxLikePlugin('searchbox');
  textboxLikePlugin('filebox');
  textboxLikePlugin('passwordbox');

  $.fn.combobox = function(method, param) {
      if (typeof method !== 'string') {
          var initOpts = method || {};
          return this.each(function() {
              var state = getWidgetState(this, 'combobox');
              state.options = $.extend({
                  data: [],
                  valueField: 'value',
                  textField: 'text',
                  queryParams: {},
                  onSelect: null
              }, state.options || {}, initOpts);
              state.data = state.options.data || state.data || [];
              wlog('combobox.init', 'initialized', {
                  id: this.id || null,
                  name: this.name || null,
                  dataLen: (state.data || []).length
              });
          });
      }

      var $el = this.eq(0);
      if (!$el.length) {
          if (method === 'options') return {};
          if (method === 'getValue') return '';
          if (method === 'getData') return [];
          return this;
      }

      var target = $el[0];
      var state = getWidgetState(target, 'combobox');
      state.options = $.extend({
          data: [],
          valueField: 'value',
          textField: 'text',
          queryParams: {},
          onSelect: null
      }, state.options || {});
      if (!state.data) state.data = state.options.data || [];

      if (method === 'options') {
          if (param && typeof param === 'object') {
              state.options = $.extend({}, state.options, param);
              if (param.data) state.data = param.data;
              wlog('combobox.options', 'merged options', state.options);
              return this;
          }
          return state.options;
      }

      if (method === 'getData') return state.data || [];

      if (method === 'loadData') {
          state.data = Array.isArray(param) ? param : [];
          state.options.data = state.data;
          wlog('combobox.loadData', 'data loaded', { len: state.data.length });
          // If this is a select element, populate option tags.
          if ($el.is('select')) {
              var vf = state.options.valueField || 'value';
              var tf = state.options.textField || 'text';
              var hasPlaceholder = $el.find('option[disabled][selected]').length > 0;
              var placeholder = hasPlaceholder ? $el.find('option[disabled][selected]').first().clone() : null;
              $el.empty();
              if (placeholder) $el.append(placeholder);
              state.data.forEach(function(row) {
                  var value = row[vf];
                  var text = row[tf];
                  if (value === undefined || value === null) value = row.value || row.VALUE || row.id || row.ID || '';
                  if (text === undefined || text === null) text = row.text || row.TEXT || row.name || row.NAME || value || '';
                  $el.append($('<option/>').val(value).text(text));
              });
              wlog('combobox.loadData', 'select options populated', { len: state.data.length });
          }
          return this;
      }

      if (method === 'getValue') return widgetValue($el) || '';

      if (method === 'setValue' || method === 'select') {
          var value = (param == null ? '' : param);
          widgetValue($el, value);
          var vf = state.options.valueField || 'value';
          var tf = state.options.textField || 'text';
          var rec = null;
          if (Array.isArray(state.data)) {
              for (var i = 0; i < state.data.length; i++) {
                  var row = state.data[i] || {};
                  if (row[vf] == value || row[tf] == value) {
                      rec = row;
                      break;
                  }
              }
          }
          wlog('combobox.' + method, 'value selected', {
              id: $el.attr('id') || null,
              name: $el.attr('name') || null,
              value: value,
              hasRecord: !!rec
          });
          if (typeof state.options.onSelect === 'function') {
              try {
                  state.options.onSelect.call(target, rec || { value: value, text: value });
                  wlog('combobox.' + method, 'onSelect callback invoked');
              } catch (err) {
                  wlog('combobox.' + method, 'onSelect callback failed', { error: String(err) });
              }
          }
          // Drive dataloader via generic events.
          $el.trigger('change').trigger('dui:loadbyfkey');
          return this;
      }

      if (method === 'clear') {
          widgetValue($el, '');
          $el.trigger('change');
          return this;
      }
      if (method === 'reset') {
          this.each(function() {
              this.value = this.defaultValue || '';
          });
          $el.trigger('change');
          return this;
      }
      if (method === 'reload') {
          var url = typeof param === 'string' && param ? param : (state.options.url || null);
          if (!url) {
              wlog('combobox.reload', 'no url configured, skip');
              return this;
          }
          wlog('combobox.reload', 'request start', { url: url, queryParams: state.options.queryParams || {} });
          $.ajax({
              type: 'GET',
              url: url,
              data: state.options.queryParams || {},
              dataType: 'json'
          }).done(function(resp) {
              var rows = Array.isArray(resp) ? resp : (resp && Array.isArray(resp.rows) ? resp.rows : []);
              state.data = rows;
              state.options.data = rows;
              wlog('combobox.reload.done', 'request success', { len: rows.length });
          }).fail(function(xhr, status, err) {
              wlog('combobox.reload.fail', 'request failed', { status: status, code: xhr && xhr.status, err: err });
          });
          return this;
      }
      if (method === 'enable') return this.prop('disabled', false);
      if (method === 'disable') return this.prop('disabled', true);
      if (method === 'readonly') {
          if (param === undefined) return !!$el.prop('readonly');
          return this.prop('readonly', !!param);
      }
      if (method === 'textbox') return this;
      if (method === 'hidePanel' || method === 'showPanel') return this;
      wlog('combobox.method', 'unsupported method passthrough', { method: method });
      return this;
  };

  $.fn.combotree = function(method) { return this; };
  $.fn.combogrid = function(method) { return this; };
  $.fn.calendar = function(method) { return this; };
  $.fn.slider = function(method) { return this; };
  $.fn.validatebox = function(method) { return this; };
  $.fn.checkbox = function(method) { return this; };
  $.fn.radiobutton = function(method) { return this; };
  $.fn.switchbutton = function(method) { return this; };


  // --- 9. DATAGRID / TREEGRID SHIMS --- datagrid DISABLED: replaced by datagrid-plugin.js
  // Sync stub kept for main.js init timing
  if (!$.fn.datagrid) {
    $.fn.datagrid = function(method) { return this; };
  }
  $.fn.treegrid = function(method) { return this; };
  $.fn.propertygrid = function(method) { return this; };


  // --- 10. LAYOUT COMPONENT SHIMS ---
  $.fn.layout = function(method) { return this; };
  $.fn.accordion = function(method) { return this; };
  $.fn.splitbutton = function(method) { return this; };


  // --- 11. MESSAGER SHIM ---
  $.messager = {
    show: function(opts) { shimLog('Messager.show:', opts); },
    alert: function(title, msg, icon, fn) {
      alert(msg);
      if (typeof fn === 'function') fn();
    },
    confirm: function(title, msg, fn) {
      const result = confirm(msg);
      if (typeof fn === 'function') fn(result);
    },
    prompt: function(title, msg, fn) {
      const result = prompt(msg);
      if (typeof fn === 'function') fn(result);
    },
    progress: function(opts) {
      if (opts === 'close') {
        shimLog('Messager.progress: close');
      } else {
        shimLog('Messager.progress: open');
      }
    }
  };


  // --- 13. LOCALSTORAGE SHIM FOR DEBUGGING ---
  // The app saves 'lpage' in localStorage to restore the last visited page
  // This interferes with hash-based testing (e.g., /?#inv^sa_parts)
  // Disable it when debug flag is present in URL
  $(document).ready(function() {
      const params = new URLSearchParams(window.location.search);
      if (params.has('debug')) {
          shimLog('[SHIM] Debug mode detected, clearing lpage from localStorage');
          localStorage.removeItem('lpage');
          shimLog('[SHIM] lpage cleared for hash-based testing');
      }
  });
  // main.js looks for #mainmenu and #westMenu (EUI structure)
  // DUI uses nav > ul.menu structure instead
  // Create compatible containers so jQuery selectors work
  $(document).ready(function() {
      shimLog('[SHIM] Creating legacy menu element shims...');
      
      // If #mainmenu doesn't exist, only create a dummy when not using the pagenav shim.
      // The pagenav path expects #mainmenu to be absent so main.js uses tree-based flow.
      if (!window.DUI_USE_PAGENAV_SHIM && $('#mainmenu').length === 0) {
          // DUI doesn't have a main menu bar, so create a hidden container
          $('<div id="mainmenu" style="display:none;"></div>').appendTo('body');
          shimLog('[SHIM] Created dummy #mainmenu');
      }
      
      // IMPORTANT: main.js calls $('#westMenu').tree('find', itemId)
      // The tree() stub searches for a[id="..."] within the selector
      // So #westMenu must be the container that has the menu items inside it
      
      // Find the DUI menu container (single nav element)
      let $duiNav = $('nav#westMenu').first();
      if ($duiNav.length === 0) $duiNav = $('.drawer-side nav').first();
      if ($duiNav.length === 0) $duiNav = $('nav').first();
      
      if ($duiNav.length > 0) {
          // Ensure the nav element has id="westMenu" so jQuery selectors work
          if ($duiNav.attr('id') !== 'westMenu') {
              $duiNav.attr('id', 'westMenu');
              shimLog('[SHIM] Set id="westMenu" on DUI nav element');
          }
      } else {
          // No DUI menu found, create dummy
          shimLog('[SHIM] DUI menu structure not found, creating dummy #westMenu');
          $('<div id="westMenu" style="display:none;"></div>').appendTo('body');
      }
      
      shimLog('[SHIM] Menu shims created. #westMenu exists:', $('#westMenu').length);
  });
  // Intercept clicks on DaisyUI menu items and route them to main.js logic
  $(document).ready(function() {
      shimLog('[SHIM] Navigation bridge initialized');
      shimLog('[SHIM] Menu items found:', $('.menu a').length);

      // Delegate clicks to DaisyUI menu items (.menu a)
      $(document).on('click', '.menu a', function(e) {
          shimLog('[SHIM] Menu click intercepted!', this);

          // IMMEDIATELY stop all event propagation
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();

          const href = $(this).attr('href');
          shimLog('[SHIM] href:', href);

          // Ignore external/empty/js links
          if (!href || href === '#' || href.startsWith('javascript:') || (href.startsWith('http') && !href.startsWith(window.location.origin))) {
              shimLog('[SHIM] Ignored (external/empty/js link)');
              return false;
          }

          shimLog('[SHIM] Preventing default and loading via AJAX');

          // 1. Manually trigger the panel refresh (this is what main.js expects)
          const $content = $('#content');
          shimLog('[SHIM] #content element found:', $content.length, $content);
          if ($content.length === 0) {
              shimError('[SHIM] ERROR: #content element not found! Cannot load content.');
              return false;
          }
          $content.panel('refresh', href);
          
          // 2. Update History/Title manually
          const text = $(this).find('span').text().trim() || $(this).text().trim();
          if (text) document.title = text;

          // Push state to browser history (TEMPORARILY DISABLED FOR DEBUGGING)
          // if (window.history && window.history.pushState) {
          //     window.history.pushState({ path: href }, text, href);
          // }
          shimLog('[SHIM] Navigation complete (history push disabled for debugging)');

          // 3. Close the drawer if on mobile (DaisyUI pattern)
          const drawerToggle = document.getElementById('dashboard-drawer-toggle');
          if (drawerToggle && drawerToggle.checked) {
              drawerToggle.checked = false;
          }

          // Return false to ensure navigation is completely blocked
          return false;
      });
  });

})(jQuery);
