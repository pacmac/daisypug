/**
 * DUI PageNav Helper
 * - Adapts DUI menu markup to the minimal tree-like API used by main.js.
 * - Optional shim: maps #westMenu tree calls to this adapter when enabled.
 */
(function($) {
  'use strict';

  var api = {};
  var SHIM_FLAG = 'DUI_USE_PAGENAV_SHIM';
  var domIdCounter = 0;

  function resolveMenuRoot() {
    var $menu = $('nav#westMenu').first();
    if ($menu.length) return $menu;

    $menu = $('.drawer-side nav').first();
    if ($menu.length) return $menu;

    $menu = $('nav').first();
    if ($menu.length) return $menu;

    return $('#westMenu');
  }

  function getDomId($el) {
    var stored = $el.data('duiTreeId');
    if (!stored) {
      domIdCounter += 1;
      stored = domIdCounter;
      $el.data('duiTreeId', stored);
    }
    return '_easyui_tree_' + stored;
  }

  function urlFromId(id, href) {
    if (id && id.indexOf('^') !== -1) return id.split('^').slice(1).join('^');
    if (id) return id;
    if (!href) return '';
    var match = href.match(/(?:\?|&)_page=([^&]+)/);
    if (match && match[1]) {
      var page = decodeURIComponent(match[1]);
      if (page.indexOf('^') !== -1) return page.split('^').slice(1).join('^');
      return page;
    }
    return '';
  }

  function parseRonly($el) {
    if (!$el || !$el.length) return false;
    if ($el.hasClass('ronly')) return true;
    var raw = $el.attr('data-ronly');
    if (raw === undefined || raw === null || raw === '') return false;
    if (raw === true || raw === false) return !!raw;
    return String(raw).toLowerCase() === 'true' || String(raw) === '1';
  }

  function cleanId(id) {
    if (!id) return id;
    if (id.indexOf('?') !== -1) id = id.split('?')[0];
    return id;
  }

  function nodeFromAnchor($el) {
    if (!$el || !$el.length) return null;
    var href = $el.attr('href') || '';
    var id = $el.attr('id');
    var iconCls = $el.attr('data-iconcls') || $el.attr('data-iconCls') || '';
    var url = urlFromId(id, href);
    var ronly = parseRonly($el);
    if (iconCls && $el.find('.' + iconCls).length === 0) {
      $('<span/>', {
        'class': iconCls,
        'style': 'display:none;background-image:none;'
      }).appendTo($el);
    }
    return {
      url: url,
      ronly: ronly,
      id: id,
      text: $el.find('span').text().trim() || $el.text().trim(),
      iconCls: iconCls,
      children: [],
      state: 'open',
      domId: getDomId($el),
      target: $el[0],
      checked: false
    };
  }


  api.find = function(id) {
    var $menu = resolveMenuRoot();
    if (!$menu.length) return null;
    id = cleanId(id);
    var $el = $menu.find('a[id="' + String(id).replace(/"/g, '\\"') + '"]').first();
    return nodeFromAnchor($el);
  };

  api.getSelected = function() {
    var $menu = resolveMenuRoot();
    if (!$menu.length) return null;
    var $el = $menu.find('a.active, li.active > a, .active a').first();
    return nodeFromAnchor($el);
  };

  api.select = function(target) {
    var $menu = resolveMenuRoot();
    if (!$menu.length) return;
    var $el = $();
    if (target && typeof target !== 'string') $el = $(target);
    if (!$el.length && target) $el = $menu.find('a[id="' + String(target).replace(/"/g, '\\"') + '"]').first();
    if (!$el.length) return;
    $menu.find('a').removeClass('active');
    $menu.find('li').removeClass('active');
    $el.addClass('active');
    $el.closest('li').addClass('active');
    $el.parents('details').attr('open', '');

    // Keep main.js state in sync when tree path is bypassed.
    if (window.dwap) window.dwap.menu = window.dwap.menu || {};
    if (window.dwap) window.dwap.menu.selected = nodeFromAnchor($el);
  };

  api.expandTo = function(target) {
    var $el = $();
    if (target && typeof target !== 'string') $el = $(target);
    if (!$el.length && target) {
      var $menu = resolveMenuRoot();
      $el = $menu.find('a[id="' + String(target).replace(/"/g, '\\"') + '"]').first();
    }
    if ($el.length) $el.parents('details').attr('open', '');
  };

  api.getRoot = function(target) {
    if (!target) return null;
    var id = target;
    if (typeof target !== 'string') id = $(target).attr('id') || target;
    id = cleanId(id);
    if (!id) return null;
    return { id: String(id).split('^')[0] };
  };

  api.init = function($menu, opts) {
    if (!$menu || !$menu.length) return $menu;
    opts = opts || {};

    $menu.off('.pagenav');
    $menu.on('click.pagenav', 'a', function(e) {
      var $el = $(this);
      var node = nodeFromAnchor($el);
      if (!node) return;
      api.select($el);
      if (typeof opts.onSelect === 'function') opts.onSelect(node);
      if (typeof opts.onClick === 'function') opts.onClick(node);
    });

    if (typeof opts.onContextMenu === 'function') {
      $menu.on('contextmenu.pagenav', 'a', function(e) {
        var node = nodeFromAnchor($(this));
        opts.onContextMenu(e, node);
      });
    }

    return $menu;
  };

  api.installTreeShim = function() {
    if (!window[SHIM_FLAG]) return;
    if ($.fn.tree) return;

    $.fn.tree = function(opts) {
      if (!this || !this.length) return this;
      if (this.attr('id') !== 'westMenu') return this;

      if (typeof opts === 'string') {
        if (opts === 'find') return api.find(arguments[1]);
        if (opts === 'getSelected') return api.getSelected();
        if (opts === 'select') return api.select(arguments[1]);
        if (opts === 'expandTo') return api.expandTo(arguments[1]);
        if (opts === 'getRoot') return api.getRoot(arguments[1]);
        if (opts === 'collapseAll') { this.find('details').removeAttr('open'); return this; }
        if (opts === 'expandAll') { this.find('details').attr('open', ''); return this; }
        return this;
      }

      return api.init(this, opts);
    };
  };

  window.duiPagenav = api;

  // Install shim if enabled.
  api.installTreeShim();
})(jQuery);
