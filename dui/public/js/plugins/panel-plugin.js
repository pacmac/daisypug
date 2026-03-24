/**
 * Pure4 Panel Helper - EasyUI-compatible panel API
 *
 * Implements a minimal subset of EasyUI panel behavior for DUI.
 * No DOM construction; operates on existing markup only.
 */
(function($) {
  'use strict';

  var dui = $.dui || {};
  if (dui._plugins) dui._plugins.loaded.push('panel-plugin');

  function noop() {}

  function parseOptions(target) {
    var t = $(target);
    var base = {};
    if ($.parser && $.parser.parseOptions) {
      base = $.parser.parseOptions(target, [
        'id','width','height','left','top','title','iconCls','cls','headerCls','bodyCls','tools','href','method',
        'header','footer','halign','titleDirection',
        {cache:'boolean',fit:'boolean',border:'boolean',noheader:'boolean'},
        {collapsible:'boolean',minimizable:'boolean',maximizable:'boolean'},
        {closable:'boolean',collapsed:'boolean',minimized:'boolean',maximized:'boolean',closed:'boolean'},
        'openAnimation','closeAnimation',
        {openDuration:'number',closeDuration:'number'}
      ]);
    }
    return $.extend({}, base, {
      loadingMessage: (t.attr('loadingMessage') !== undefined ? t.attr('loadingMessage') : undefined),
      header: t.children('.panel-header,.region-header,header').first(),
      footer: t.children('.panel-footer,footer').first()
    });
  }

  function init(target, options) {
    var opts = $.extend({}, $.fn.panel.defaults, parseOptions(target), options || {});
    $.data(target, 'panel', { options: opts, panel: $(target), isLoaded: false });
    return opts;
  }

  function runInlineScripts($target) {
    // Remove previous page's scripts from head
    $('head script[data-page-script]').remove();

    $target.find('script').each(function() {
      var $script = $(this);
      var src = $script.attr('src');
      var name = $script.attr('id') || '';

      if (src) {
        var tag = document.createElement('script');
        tag.src = src;
        tag.async = false;
        if (name) tag.id = name;
        tag.setAttribute('data-page-script', '');
        document.head.appendChild(tag);
        $script.remove();
        return;
      }
      var code = $script.text() || $script[0].textContent || $script[0].innerHTML || '';
      if (code.trim()) {
        var tag = document.createElement('script');
        if (name) tag.id = name;
        tag.setAttribute('data-page-script', '');
        tag.text = code;
        document.head.appendChild(tag);
      }
      $script.remove();
    });
  }

  // Returns .panel-body child if present, otherwise the element itself
  function getBody(target) {
    var $body = $(target).children('.panel-body').first();
    return $body.length ? $body : $(target);
  }

  function loadContent(target, param) {
    var state = $.data(target, 'panel');
    var opts = state.options;
    if (!opts.href) return;

    var qp = $.extend({}, opts.queryParams, param || {});
    if (opts.onBeforeLoad.call(target, qp) === false) return;

    state.isLoaded = false;
    var $body = getBody(target);
    if (opts.loadingMessage) {
      $body.empty();
      $body.html($('<div class="panel-loading"></div>').html(opts.loadingMessage));
    }

    var loader = opts.loader || $.fn.panel.defaults.loader;
    loader.call(target, qp, function(resp) {
      var extractor = opts.extractor || $.fn.panel.defaults.extractor;
      var html = extractor.call(target, resp);
      $body.empty();
      try {
        $body[0].innerHTML = html;
        runInlineScripts($body);
        if ($.parser && $.parser.parse) {
          $.parser.parse($body);
        }
        opts.onLoad.apply(target, arguments);
      } catch (e) {
        console.warn('[panel-plugin] error during content load', e.message || e);
      }
      state.isLoaded = true;

      // Stamp data-page on the panel element for page identity
      var pageMatch = opts.href && opts.href.match(/[?&]_page=([^&]+)/);
      if (pageMatch) $(target).attr('data-page', pageMatch[1]);

      $(document).trigger('dui:contentloaded', [$body]);
    }, function() {
      opts.onLoadError.apply(target, arguments);
    });
  }

  /* --- OLD loadContent (pre panel-body) ---
  function loadContent(target, param) {
    var state = $.data(target, 'panel');
    var opts = state.options;
    if (!opts.href) return;
    var qp = $.extend({}, opts.queryParams, param || {});
    if (opts.onBeforeLoad.call(target, qp) === false) return;
    state.isLoaded = false;
    if (opts.loadingMessage) {
      $(target).panel('clear');
      $(target).html($('<div class="panel-loading"></div>').html(opts.loadingMessage));
    }
    var loader = opts.loader || $.fn.panel.defaults.loader;
    loader.call(target, qp, function(resp) {
      var extractor = opts.extractor || $.fn.panel.defaults.extractor;
      var html = extractor.call(target, resp);
      $(target).panel('clear');
      $(target).html(html);
      var _pm = opts.href && opts.href.match(/[?&]_page=([^&]+)/);
      runInlineScripts($(target), _pm ? decodeURIComponent(_pm[1]) : '');
      if ($.parser && $.parser.parse) { $.parser.parse($(target)); }
      opts.onLoad.apply(target, arguments);
      state.isLoaded = true;
      $(document).trigger('dui:contentloaded', [$(target)]);
    }, function() {
      opts.onLoadError.apply(target, arguments);
    });
  }
  --- END OLD --- */

  $.fn.panel = function(options, param) {
    if (typeof options === 'string') {
      var method = $.fn.panel.methods[options];
      if (method) return method(this, param);
      return this;
    }

    options = options || {};
    return this.each(function() {
      var state = $.data(this, 'panel');
      if (state) {
        $.extend(state.options, options);
        state.isLoaded = false;
      } else {
        init(this, options);
      }
      if ($.data(this, 'panel').options.closed) {
        $(this).hide();
      } else {
        $(this).show();
      }
    });
  };

  $.fn.panel.methods = {
    options: function(jq) {
      if (!jq[0]) return $.fn.panel.defaults;
      var state = $.data(jq[0], 'panel');
      return state ? state.options : $.fn.panel.defaults;
    },
    panel: function(jq) {
      return jq;
    },
    header: function(jq) {
      return jq.children('.panel-header,.region-header,header').first();
    },
    footer: function(jq) {
      return jq.children('.panel-footer,footer').first();
    },
    body: function(jq) {
      var $body = jq.children('.panel-body').first();
      return $body.length ? $body : jq;
      // OLD: return jq;
    },
    setTitle: function(jq, title) {
      return jq.each(function() {
        var state = $.data(this, 'panel');
        if (state) state.options.title = title;
        $(this).attr('title', title);
      });
    },
    open: function(jq) {
      return jq.each(function() {
        var state = $.data(this, 'panel');
        if (state) state.options.closed = false;
        $(this).show();
      });
    },
    close: function(jq) {
      return jq.each(function() {
        var state = $.data(this, 'panel');
        if (state) state.options.closed = true;
        $(this).hide();
      });
    },
    destroy: function(jq) {
      return jq.each(function() {
        $.removeData(this, 'panel');
        $(this).remove();
      });
    },
    clear: function(jq, which) {
      return jq.each(function() {
        if (which === 'footer') {
          $(this).panel('footer').empty();
        } else {
          getBody(this).empty();
          // OLD: $(this).empty();
        }
      });
    },
    refresh: function(jq, param) {
      return jq.each(function() {
        var state = $.data(this, 'panel');
        if (!state) init(this);
        state = $.data(this, 'panel');
        state.isLoaded = false;
        if (param) {
          if (typeof param === 'string') {
            state.options.href = param;
          } else {
            state.options.queryParams = param;
          }
        }
        loadContent(this);
      });
    },
    resize: function(jq, size) {
      return jq.each(function() {
        if (!size) return;
        if (size.width != null) $(this).css('width', size.width);
        if (size.height != null) $(this).css('height', size.height);
      });
    },
    move: function(jq, pos) {
      return jq.each(function() {
        if (!pos) return;
        if (pos.left != null) $(this).css('left', pos.left);
        if (pos.top != null) $(this).css('top', pos.top);
      });
    },
    doLayout: function(jq) {
      return jq.each(function() {
        $(this).triggerHandler('_resize', [true]);
      });
    }
  };

  $.fn.panel.parseOptions = parseOptions;

  $.fn.panel.defaults = {
    id: null,
    title: null,
    iconCls: null,
    width: 'auto',
    height: 'auto',
    left: null,
    top: null,
    cls: null,
    headerCls: null,
    bodyCls: null,
    style: {},
    href: null,
    cache: true,
    fit: false,
    border: true,
    doSize: true,
    noheader: false,
    content: null,
    halign: 'top',
    titleDirection: 'down',
    collapsible: false,
    minimizable: false,
    maximizable: false,
    closable: false,
    collapsed: false,
    minimized: false,
    maximized: false,
    closed: false,
    openAnimation: false,
    openDuration: 400,
    closeAnimation: false,
    closeDuration: 400,
    tools: null,
    footer: null,
    header: null,
    queryParams: {},
    method: 'get',
    loadingMessage: 'Loading...',
    loader: function(param, success, error) {
      var opts = $(this).panel('options');
      if (!opts.href) return false;
      ajaxget('', param, function(data) { success(data); }, {
        url: opts.href,
        method: opts.method || 'get',
        cache: false,
        dataType: 'html',
        error: function() { error.apply(this, arguments); }
      });
    },
    extractor: function(data) {
      var match = /<body[^>]*>((.|[\n\r])*)<\/body>/im.exec(data);
      return match ? match[1] : data;
    },
    onBeforeLoad: noop,
    onLoad: noop,
    onLoadError: noop,
    onBeforeOpen: noop,
    onOpen: noop,
    onBeforeClose: noop,
    onClose: noop,
    onBeforeDestroy: noop,
    onDestroy: noop,
    onResize: noop,
    onMove: noop,
    onMaximize: noop,
    onRestore: noop,
    onMinimize: noop,
    onBeforeCollapse: noop,
    onBeforeExpand: noop,
    onCollapse: noop,
    onExpand: noop
  };
  // Surface elevation debug — log panel depth assignments after content loads
  function logSurfaceDepth() {
    var panels = document.querySelectorAll('[data-surface]');
    if (!panels.length) return;
    var rows = [];
    var idx = 1;

    // Include sidebar as depth-0 starting point (if present)
    var sidebar = document.getElementById('sidebar');
    if (sidebar) {
      var sbClasses = ([].slice.call(sidebar.classList)).filter(function(c) { return c.startsWith('surface-') || c.startsWith('sidebar-') || c.startsWith('bg-'); });
      rows.push({
        '#': idx++,
        region: 'sidebar',
        title: 'Sidebar (nav)',
        raw: '0',
        depth: '0',
        panel: '0',
        class: sbClasses.join(' ') || 'sidebar-bg',
        id: 'sidebar'
      });
    }

    // Include #content container (if present)
    var content = document.getElementById('content');
    if (content) {
      var cClasses = ([].slice.call(content.classList)).filter(function(c) { return c.startsWith('surface-') || c.startsWith('bg-'); });
      rows.push({
        '#': idx++,
        region: 'content',
        title: 'Content area',
        raw: '1',
        depth: '1',
        panel: '1',
        class: cClasses.join(' ') || 'bg-base-100',
        id: 'content'
      });
    }

    panels.forEach(function(el) {
      var ds = el.getAttribute('data-surface') || '';
      var region = el.getAttribute('data-region') || '';
      var header = el.querySelector('[class*="surface-header"]');
      var title = header ? header.textContent.trim() : '';
      var surfaceClass = ([].slice.call(el.classList)).filter(function(c) { return /^surface-\d$/.test(c); })[0] || '';
      // Parse data-surface string e.g. "progressive:raw=3,depth=3,panel=4"
      var parts = {};
      var kv = ds.replace(/^[^:]+:/, '').split(',');
      kv.forEach(function(pair) { var s = pair.split('='); if (s.length === 2) parts[s[0]] = s[1]; });
      rows.push({
        '#': idx++,
        region: region,
        title: title || '(untitled)',
        raw: parts.raw || '',
        depth: parts.depth || '',
        panel: parts.panel || '',
        class: surfaceClass,
        id: el.id || ''
      });
    });
    console.debug('%c[surface-elevation] Panel depth map:', 'font-weight:bold', rows);
  }

  $(document).on('dui:contentloaded', function() {
    setTimeout(logSurfaceDepth, 100);
  });

})(jQuery);
