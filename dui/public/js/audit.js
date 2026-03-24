/**
 * audit.js — DUI Page DOM Audit Tool
 *
 * Discovers elements that were widget-initialised by EUI's JS parser
 * but lack DUI mixin markup in the pug template source.
 *
 * Usage:
 *   $.getScript('dui/js/audit.js')        // load once
 *   $.dui.audit()                          // audit current page
 *   $.dui.audit({log: true})               // audit + console.table output
 */
(function($) {
  'use strict';

  // All known EUI widget types (from jquery.parser.js + source files)
  var WIDGET_TYPES = [
    'accordion','calendar','combo','combobox','combogrid','combotree',
    'combotreegrid','datagrid','datalist','datebox','datetimebox',
    'datetimespinner','dialog','filebox',
    'linkbutton','menu','menubutton','messager','numberbox',
    'numberspinner','passwordbox','progressbar',
    'propertygrid','searchbox','slider','spinner',
    'splitbutton','switchbutton','tagbox','textbox',
    'timespinner','tree','treegrid','window'
  ];

  // Structural types — DUI mixins generate these but without data-mixin
  // They are expected in the DOM and not orphans
  var STRUCTURAL_TYPES = ['layout','panel','tabs','form'];

  // Internal/utility types — never expected to have mixin markup
  var SKIP_TYPES = [
    'draggable','droppable','resizable','tooltip','validatebox',
    'parser','pagination'
  ];

  // Content panel where page loads
  var CONTENT_SEL = '#content';

  $.dui = $.dui || {};

  $.dui.audit = function(opts) {
    opts = opts || {};
    var container = $(CONTENT_SEL);
    if (!container.length) {
      console.warn('[audit] No content container found');
      return [];
    }

    var pageId = $.page && $.page.state ? $.page.state.pageId : 'unknown';
    var orphans = [];
    var seenEls = new Set();

    WIDGET_TYPES.forEach(function(wtype) {
      // Strategy 1: find elements with easyui-<widget> class
      container.find('.easyui-' + wtype).each(function() {
        checkElement($(this), wtype, 'easyui-class', orphans, seenEls);
      });

      // Strategy 2: find elements initialised by EUI via $.data
      // Only check elements we haven't already found via class
      container.find('*').each(function() {
        if (seenEls.has(this)) return;
        try {
          var data = $.data(this, wtype);
          if (data && data.options) {
            checkElement($(this), wtype, 'js-init', orphans, seenEls);
          }
        } catch(e) {}
      });
    });

    // Build summary by widget type
    var summary = {};
    orphans.forEach(function(o) {
      summary[o.widget] = (summary[o.widget] || 0) + 1;
    });

    var result = {
      pageId: pageId,
      total: orphans.length,
      summary: summary,
      orphans: orphans
    };

    if (opts.log !== false) {
      console.log('[audit] Page: ' + pageId + ' — ' + orphans.length + ' orphaned widgets');
      if (Object.keys(summary).length > 0) {
        console.log('[audit] Summary:', Object.keys(summary).map(function(k) {
          return k + ': ' + summary[k];
        }).join(', '));
      }
      if (orphans.length > 0) {
        console.table(orphans.map(function(o) {
          return {
            id: o.id || '-',
            name: o.name || '-',
            widget: o.widget,
            tag: o.tag,
            detection: o.detection
          };
        }));
      }
    }

    return result;
  };

  function checkElement(el, wtype, detection, orphans, seenEls) {
    var dom = el[0];
    // Skip if already processed for any widget type
    if (seenEls.has(dom)) return;

    // Skip if it has a data-mixin attribute (DUI mixin generated)
    if (el.attr('data-mixin')) return;
    // Skip if it's inside a mixin-skeleton
    if (el.closest('.mixin-skeleton').length) return;
    // Skip EUI internal wrappers that are inside a mixin
    if ((el.hasClass('combo-f') || el.hasClass('textbox-f')) &&
        el.closest('[data-mixin]').length) return;

    seenEls.add(dom);

    var id = el.attr('id') || '';
    var name = el.attr('name') || '';
    var tag = (el.prop('tagName') || '').toLowerCase();

    orphans.push({
      id: id,
      name: name,
      widget: wtype,
      tag: tag,
      detection: detection,
      selector: id ? '#' + id : (name ? '[name=' + name + ']' : tag + '.' + wtype)
    });
  }

})(jQuery);
