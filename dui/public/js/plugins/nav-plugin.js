// DUI Navigation Plugin
// Sets up #westMenu compatibility, intercepts DaisyUI menu clicks,
// and provides programmatic navigation functions (loadpage, reload, etc.).
//
// Extracted from easyui-shim.js (sections 12-13) + ui.js nav globals.

(function($) {
  'use strict';

  var dui = $.dui;

  // ========================================================================
  // menuExists(id) — check if menu id exists in $.dui.udata.menus
  // ========================================================================
  function menuExists(id) {
    var menus = $.dui.udata && $.dui.udata.menus;
    if (!menus) return false;
    var items = Array.isArray(menus) ? menus : Object.values(menus);
    function find(list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) return true;
        if (list[i].children && find(list[i].children)) return true;
      }
      return false;
    }
    return find(items);
  }

  // ========================================================================
  // navigateTo(menid) — core navigation: select tree, refresh panel, set state
  // ========================================================================
  function navigateTo(menid) {
    var bits = unescape(menid).split('&');
    var pageId = bits[0];

    // Parse doc param (e.g. 'inv^sa_parts&ID=A8000')
    if (bits.length === 2) {
      var doc = bits[1].split('=');
      $.dui.doc = { id: doc[0], ref: doc[1] };
    } else {
      $.dui.doc = {};
    }

    // Select and expand in the sidebar tree
    var tr = $('#westMenu');
    var def = tr.tree('find', pageId);
    if (def) {
      tr.tree('select', def.target);
      tr.tree('expandTo', def.target);
    }

    // Set $.dui.menu.selected (used by reload, newtab, getMenu, etc.)
    $.dui.menu.selected = def || { id: pageId, text: pageId, target: null };

    // Refresh content panel
    var url = '/?_page=' + pageId;
    $('#content').panel('refresh', url);

    // Update title
    var text = (def && def.text) || pageId;
    var prefix = ($.dui.codata && $.dui.codata.coalias) ? $.dui.codata.coalias.toUpperCase() + ' - ' : '';
    document.title = '\u205f\u200b\u200b\u200b ' + prefix + text;

    // Save page + rebuild report dropdown (via $.page.savePage)
    if ($.page) $.page.savePage(pageId, text);
  }

  // ========================================================================
  // loadpage(menid) — programmatic page navigation (8 page scripts call this)
  // ========================================================================
  function loadpage(menid) {
    if (!menid) return;
    if ($.page) $.page.historyAdd(menid);

    var bits = unescape(menid).split('&');
    var isAdmin = $.dui.udata && ($.dui.udata.sysadm === true || $.dui.udata.super === true ||
      (Array.isArray($.dui.udata.groups) && $.dui.udata.groups.indexOf('SYSADM') !== -1));

    // Check menu access
    if (!isAdmin && !menuExists(bits[0])) {
      if ($.remember) $.remember.remove($('#navmenu'), '_global');
      if ($.messager) $.messager.show({ title: 'Menu', msg: 'Page not available: ' + bits[0], showType: 'show', timeout: 3000 });
      return;
    }

    history.pushState('', document.title, window.location.pathname);
    navigateTo(menid);
  }

  // ========================================================================
  // reload() — reload current page (7 page scripts call this)
  // ========================================================================
  function reload() {
    if ($.dui.menu && $.dui.menu.selected) {
      loadpage($.dui.menu.selected.id);
    }
  }

  // ========================================================================
  // newtab(nid) — open page in new browser tab (6 page scripts)
  // ========================================================================
  function newtab(nid) {
    nid = nid || ($.dui.menu && $.dui.menu.selected && $.dui.menu.selected.id);
    if (!nid) return;
    var link = window.location.origin + '/#' + nid;
    if (!appmsg(nid)) window.open(link, '_blank');
  }

  // ========================================================================
  // appmsg(nid, link) — post message to parent frame (app embedding)
  // ========================================================================
  function appmsg(nid, link) {
    if (self !== top || navigator.userAgent === 'pure-app') {
      link = link || window.location.origin + '/#' + nid;
      var node = $('#westMenu').tree('find', nid);
      var icon = '';
      if (node && node.iconCls) {
        var bgImg = $(node.target).find('.' + node.iconCls).css('background-image');
        var m = bgImg ? bgImg.match(/url\("(.*)"\)/) : null;
        if (m) icon = m[1];
      }
      top.postMessage({ link: { id: nid, src: link, text: (node && node.text) || nid, icon: icon } }, '*');
      return true;
    }
    return false;
  }

  // ========================================================================
  // linkwin(link, title) — open document in new window (4 page scripts)
  // ========================================================================
  function linkwin(link, title) {
    var nid = link.split('&')[0].split('#')[1];
    var url = window.location.origin + link;
    if (appmsg(nid, url)) return;

    if ($.dui.page && $.dui.page.tab && $.dui.page.tab.top) {
      $.dui.page.tab.location.href = link;
      $.dui.page.tab.focus();
    } else {
      $.dui.page.tab = window.open(link, '_blank');
    }

    if (title) setTimeout(function() {
      if ($.dui.page.tab) $.dui.page.tab.title = '\u205f\u200b\u200b\u200b ' + title;
    }, 3000);
  }

  // ========================================================================
  // nomenu(ms) — collapse sidebar (2 page scripts)
  // ========================================================================
  function nomenu(ms) {
    ms = ms || 0;
    setTimeout(function() {
      // DUI: collapse sidebar
      var sidebar = document.getElementById('sidebar');
      var toggle = document.getElementById('sidebar-toggle');
      if (sidebar && toggle && sidebar.classList.contains('sidebar-expanded')) {
        toggle.click();
      }
      // EUI fallback
      if ($('#layout').length) $('#layout').layout('collapse', 'west');
    }, ms);
  }

  // ========================================================================
  // getMenu() — get selected menu node + root (1 page script)
  // ========================================================================
  function getMenu() {
    var node = $.dui.menu && $.dui.menu.selected;
    var root = node ? { id: node.id.split('^')[0] } : null;
    return { node: node, root: root };
  }

  // ========================================================================
  // splash() — show splash on empty content (home.pug)
  // ========================================================================
  function splash() {
    $('#content').panel('clear');
    $('#content').append('<div id="splash"><div id="slider"></div></div>');
    $('#splash').fadeIn(3000);
    $('#slider').animate({ width: 'toggle' }, 2000);
  }

  // ========================================================================
  // Register on $.dui.fn + window shims
  // ========================================================================
  dui.fn.loadpage  = loadpage;
  dui.fn.reload    = reload;
  dui.fn.newtab    = newtab;
  dui.fn.linkwin   = linkwin;
  dui.fn.nomenu    = nomenu;
  dui.fn.getMenu   = getMenu;
  dui.fn.splash    = splash;
  dui.fn.appmsg    = appmsg;
  dui.getIcon      = getIconName;

  dui.register('loadpage', loadpage);
  dui.register('reload',   reload);
  dui.register('newtab',   newtab);
  dui.register('linkwin',  linkwin);
  dui.register('nomenu',   nomenu);
  dui.register('getMenu',  getMenu);
  dui.register('splash',   splash);
  dui.register('appmsg',   appmsg);

  // ========================================================================
  // westMenu setup — create #westMenu if missing
  // ========================================================================
  $(document).ready(function() {
    if (!window.DUI_USE_PAGENAV_SHIM && $('#mainmenu').length === 0) {
      $('<div id="mainmenu" style="display:none;"></div>').appendTo('body');
    }

    var $duiNav = $('nav#westMenu').first();
    if ($duiNav.length === 0) $duiNav = $('.drawer-side nav').first();
    if ($duiNav.length === 0) $duiNav = $('nav').first();

    if ($duiNav.length > 0) {
      if ($duiNav.attr('id') !== 'westMenu') {
        $duiNav.attr('id', 'westMenu');
      }
    } else {
      $('<div id="westMenu" style="display:none;"></div>').appendTo('body');
    }
  });

  // ========================================================================
  // Menu click interceptor — DaisyUI menu items → panel refresh
  // ========================================================================
  $(document).ready(function() {
    $(document).on('click', '.menu a', function(e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      var href = $(this).attr('href');

      if (!href || href === '#' || href.indexOf('javascript:') === 0 ||
          (href.indexOf('http') === 0 && href.indexOf(window.location.origin) !== 0)) {
        return false;
      }

      // Extract page ID from href (e.g. '/?_page=inv^sa_parts&_appid=...' → 'inv^sa_parts')
      var match = href.match(/[?&]_page=([^&]+)/);
      if (match) {
        var pageId = decodeURIComponent(match[1]);
        // Set menu selected state
        $.dui.menu.selected = {
          id: pageId,
          text: $(this).find('span').text().trim() || $(this).text().trim(),
          target: this
        };
        // Save page + rebuild reports
        var text = $.dui.menu.selected.text || pageId;
        if ($.page) $.page.savePage(pageId, text);
      }

      // Load content via panel refresh
      var $content = $('#content');
      if ($content.length === 0) return false;
      $content.panel('refresh', href);

      // Update document title
      var text = $(this).find('span').text().trim() || $(this).text().trim();
      if (text) {
        var prefix = ($.dui.codata && $.dui.codata.coalias) ? $.dui.codata.coalias.toUpperCase() + ' - ' : '';
        document.title = '\u205f\u200b\u200b\u200b ' + prefix + text;
      }

      // Close drawer on mobile
      var toggle = document.getElementById('dashboard-drawer-toggle');
      if (toggle && toggle.checked) toggle.checked = false;

      // Collapse sidebar
      var sidebarToggle = document.getElementById('sidebar-toggle');
      var sidebar = document.getElementById('sidebar');
      if (sidebarToggle && sidebar && sidebar.classList.contains('sidebar-expanded')) {
        sidebarToggle.click();
      }

      return false;
    });
  });

  // ========================================================================
  // Client-side menu builder — uses <template> elements from dashboard.pug
  // Only runs when config menu_render == 'client'
  // ========================================================================

  // Icon map — loaded from JSON via server-injected $.dui.icons (see _iconmap.pug)
  function getIconName(cls) {
    if (!cls) return '';
    var map = $.dui.icons || {};
    return map[cls] || cls;  // pass through unmapped strings as raw Lucide names
  }

  function buildMenu(menus) {
    var nav = document.getElementById('navmenu');
    if (!nav) return;
    var tplGroup = document.getElementById('tpl-menu-group');
    var tplItem = document.getElementById('tpl-menu-item');
    if (!tplGroup || !tplItem) return;

    var groupIndex = 0;

    function addItems(container, items, depth) {
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (!item || !item.text) continue;

        var kids = item.children || [];
        if (!Array.isArray(kids)) kids = Object.values(kids);

        if (kids.length > 0) {
          // Group with children — clone group template
          var group = tplGroup.content.cloneNode(true);
          var details = group.querySelector('details');
          var summary = details.querySelector('summary');

          // Set icon
          var iconCls = item.icon || item.iconCls || '';
          var lucideName = getIconName(iconCls);
          var iconSpan = summary.querySelector('.menu-icon');
          if (lucideName) {
            iconSpan.setAttribute('data-lucide', lucideName);
            iconSpan.className = 'w-5 h-5 flex-shrink-0';
            if (depth === 0) iconSpan.classList.add($.dui.iconColor(groupIndex));
          } else {
            iconSpan.remove();
          }

          // Set text
          summary.querySelector('.menu-text').textContent = item.text;
          summary.setAttribute('data-tip', item.text);
          summary.setAttribute('data-tip-if', '.sidebar-collapsed');

          // Recurse into children
          var subUl = details.querySelector('ul.menu');
          addItems(subUl, kids, depth + 1);

          if (depth === 0) groupIndex++;
          container.appendChild(group);
        } else {
          // Leaf item — clone item template
          var li = tplItem.content.cloneNode(true);
          var a = li.querySelector('a');
          var appid = item.id || '';
          var iconCls = item.icon || item.iconCls || '';
          var lucideName = getIconName(iconCls);

          a.id = appid;
          a.href = appid ? '/?_page=' + appid + '&_appid=' + appid : '#';
          a.dataset.appid = appid;
          a.dataset.iconcls = iconCls;
          a.setAttribute('title', item.text);

          // Set icon
          var iconSpan = a.querySelector('.menu-icon');
          if (lucideName) {
            iconSpan.setAttribute('data-lucide', lucideName);
            iconSpan.className = 'w-5 h-5 flex-shrink-0';
            if (item.iconColor) iconSpan.style.color = item.iconColor;
          } else {
            iconSpan.remove();
          }

          // Set text
          a.querySelector('.item-text').textContent = item.text;
          a.querySelector('.item-text').className = iconCls;

          // Menu overrides: status dot (overlaid on icon), badge, css class
          if (item.status) {
            var iconEl = a.querySelector('[data-lucide]') || a.querySelector('svg');
            if (iconEl) {
              var wrap = document.createElement('span');
              wrap.className = 'menu-status-wrap';
              iconEl.parentNode.insertBefore(wrap, iconEl);
              wrap.appendChild(iconEl);
              var dot = document.createElement('span');
              dot.className = 'status-dot status-overlay status-' + item.status;
              wrap.appendChild(dot);
            }
          }
          if (item.badge) {
            var badge = document.createElement('span');
            badge.className = 'menu-badge';
            badge.textContent = item.badge;
            a.appendChild(badge);
          }
          if (item.cls) {
            item.cls.split(/\s+/).forEach(function(c) { if (c) a.classList.add(c); });
          }

          container.appendChild(li);
        }
      }
    }

    addItems(nav, menus, 0);

    // Lucide icons rendered centrally by _startup.js after buildMenu completes

    // buildMenu complete — errors would have thrown above
  }

  // Expose buildMenu
  dui.fn.buildMenu = buildMenu;

  // buildMenu is called from _startup.js after /api/init data is loaded.
  // (Was previously auto-triggered on DOM ready, but AJAX init means data isn't ready yet.)

  if (dui._plugins) dui._plugins.loaded.push('nav-plugin');

})(jQuery);
