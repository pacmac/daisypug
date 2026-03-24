/**
 * Pure4 Print Plugin — DUI
 *
 * Report/print system for DUI. Replaces the legacy EasyUI-based print.js.
 *
 * Responsibilities:
 *   - repmenus(node) — rebuild report dropdown menu items on page navigation
 *   - printmen(me)   — handle report item click, open filter modal
 *   - execPrint(me)  — execute report (Pentaho PDF or Excel)
 *
 * DOM is rendered by Pug mixins:
 *   - +menubutton#but_print  (toolbar.pug)  — dropdown button + empty <ul#dui-printmen>
 *   - +print-modals           (print.pug)    — filter dialog <dialog#dui-printopt>
 *
 * This plugin ONLY populates <li> items and wires event handlers.
 *
 * Data sources:
 *   $.page.reps    — report definitions keyed by appId (from server)
 *   $.page.pmens   — active report menu items (rebuilt per navigation)
 *   $.page.state.pageId — current page appId
 *
 * Hooks (registered via $.page.register):
 *   beforePrint(vars, done) — async gate before filter dialog opens
 *   afterPrint(vars)        — sync fire after report closes
 *   cancelPrint(vars)       — sync fire on filter dialog cancel
 */
(function($) {
  'use strict';

  // Track cancel state for filter dialog
  var printCancelled = true;

  // ========================================================================
  // repmenus(node) — rebuild dropdown menu items for current page
  // ========================================================================
  function repmenus(node) {
    var $menu = $('#dui-printmen');
    if (!$menu.length) return;

    // Clear existing items
    $menu.empty();
    $.page.pmens = {};

    var reps = $.page.reps[node.id];
    var $btn = $('#but_print');

    // Print button lifecycle owned here — enable when reports exist, disable otherwise
    if (!reps || reps.length === 0) {
      $btn.addClass('opacity-40 pointer-events-none');
      return;
    }
    $btn.removeClass('opacity-40 pointer-events-none');

    // Sort by name
    try { reps = keysort(reps, 'name'); } catch (err) { /* ignore */ }

    // Build menu items
    $.each(reps, function(i, me) {
      $.page.pmens[me.id] = {
        id: me.id,
        name: me.name,
        fsql: me.fsql,
        reptype: me.reptype,
        fname: me.fname,
        'class': me['class'],
        docref: me.docref
      };

      var $li = $('<li><a></a></li>');
      $li.find('a').text(me.name).attr('data-report-id', me.id);
      $li.find('a').on('click', function() {
        // Close dropdown
        document.activeElement.blur();
        printmen({ id: $(this).attr('data-report-id') });
      });
      $menu.append($li);
    });
  }

  // ========================================================================
  // printmen(me) — handle report item click, open filter dialog
  // ========================================================================
  function printmen(me) {
    var item = $.page.pmens[me.id];
    if (!item) return;

    // Init print vars
    $.page._printVars = $.page._printVars || {};
    $.page._printVars._xldata = me.id;
    $.page._printVars._fname = item.fname;
    $.page._printVars._class = item['class'];

    // Set dialog title
    $('#dui-printopt h3').first().text(item.name);

    // beforePrint hook (async gate)
    $.page.hook('beforePrint', $.page._printVars, function(nvars) {
      if (nvars && nvars.error) {
        if (nvars.msg) msgbox(nvars.msg);
        return false;
      }
      if (nvars) $.extend($.page._printVars, nvars);
      openFilterDialog(item);
    });
  }

  function openFilterDialog(item) {
    var $dialog = $('#dui-printopt');
    var $filters = $('#filters');

    // Populate dynamic filter fields
    $filters.empty();
    if (item.fsql) {
      dynadd($filters, item.fsql);
    }

    // Show/hide Excel button based on _xls in fsql
    var hasXls = item.fsql && objidx(item.fsql, 'id', '_xls') > -1;
    if (hasXls) $('#dui-xls').show(); else $('#dui-xls').hide();

    // Reset cancel tracking
    printCancelled = true;

    // Open modal
    $dialog[0].showModal();
  }

  // ========================================================================
  // execPrint(me) — execute report (Pentaho or Excel)
  // ========================================================================
  function execPrint(me) {
    var pvar = $.page._printVars;
    pvar._func = 'excel';
    if (me.id === 'pdf') pvar._pdf = 'y'; else pvar._pdf = 'n';

    var pmen = $.page.pmens[pvar._xldata];

    // Validator support
    if (pmen.fsql) try {
      var pvali;
      pmen.fsql.map(function(f) { if (f.type === 'validator') pvali = f; });
      if (pvali) {
        var funcStr = pvali.func;
        for (var k in pvar) {
          var reg = new RegExp('\\$' + k, 'g');
          funcStr = funcStr.replace(reg, 'pvar.' + k);
        }
        pvali.ok = eval(funcStr);
        if ($.dui.isdev) console.log(pvali);
        if (!pvali.ok && pvali.action === 'warn') msgbox(pvali.msg || 'This is a very large report.');
        else if (!pvali.ok && pvali.action === 'deny') return msgbox(pvali.msg || 'This report is too large.');
      }
    } catch (err) { ce(err); }

    // Pentaho Report
    if (pmen.reptype === 'pho') {
      var type = (pvar._pdf === 'y') ? 'pdf' : 'xlsx';
      var phvar = [
        '/?_func=penta',
        '_xldata=' + pvar._xldata,
        '_type=' + type,
        '_fname=' + pvar._fname,
        '_class=' + pvar._class,
        '_docref=' + pmen.docref
      ];
      for (var key in pvar) {
        if (key.indexOf('_') !== 0) phvar.push(key + '=' + pvar[key]);
      }
      var src = phvar.join('&');
      openPrintViewer(src);
    }
    // DiS Excel Templating
    else {
      ajaxget('/', pvar, function(res) {
        if (res.error) iserr(res);
        else if (res.mode === 'pdf') openPrintViewer(res.url);
        else window.location = res.url;
      });
    }
  }

  // ========================================================================
  // openPrintViewer — open full-screen modal with iframe for PDF/report
  // ========================================================================
  // DOM is rendered by +print-modals in Pug (dialog#dui-print-viewer).
  // This function only sets the iframe src, updates the title, and opens it.
  function openPrintViewer(src) {
    var $dialog = $('#dui-print-viewer');
    if (!$dialog.length) return;

    // Set title from current report name
    var pmen = $.page.pmens[($.page._printVars || {})._xldata];
    $dialog.find('h3').text(pmen ? pmen.name : 'Document Print');

    // Load the report in the iframe
    $dialog.find('iframe').attr('src', src);

    // Open the modal
    $dialog[0].showModal();
  }

  // ========================================================================
  // onAfterPrint — cleanup after report viewer closes
  // ========================================================================
  function onAfterPrint() {
    $.page.hook('afterPrint', $.page._printVars);
    $.page._printVars = {};
  }

  // ========================================================================
  // viewdoc — open document in viewer (used by some pages directly)
  // ========================================================================
  function viewdoc(url) {
    openPrintViewer(url);
  }

  // ========================================================================
  // Init — wire modal buttons, expose globals
  // ========================================================================
  function init() {
    // Wire filter dialog buttons (DOM rendered by +print-modals in Pug)
    $('#dui-pdf').on('click', function() {
      if (!$('#pops').form('validate')) return false;
      printCancelled = false;
      $('#dui-printopt')[0].close();
      var pv = $.page._printVars;
      var fv = $('#dui-printopt form#pops').serializeArray();
      for (var i in fv) { pv[fv[i].name] = fv[i].value; }
      execPrint({ id: 'pdf' });
    });

    $('#dui-xls').on('click', function() {
      if (!$('#pops').form('validate')) return false;
      printCancelled = false;
      $('#dui-printopt')[0].close();
      var pv = $.page._printVars;
      var fv = $('#dui-printopt form#pops').serializeArray();
      for (var i in fv) { pv[fv[i].name] = fv[i].value; }
      execPrint({ id: 'xls' });
    });

    // Handle filter modal close (backdrop click or Cancel button)
    $('#dui-printopt')[0].addEventListener('close', function() {
      if (printCancelled) {
        $.page.hook('cancelPrint', $.page._printVars);
      }
    });

    // Handle viewer modal close — cleanup iframe and fire afterPrint
    $('#dui-print-viewer')[0].addEventListener('close', function() {
      $('#dui-print-viewer-iframe').attr('src', 'about:blank');
      onAfterPrint();
    });

    // Expose as globals for legacy page JS compatibility
    window.repmenus = repmenus;
    window.printmen = printmen;
    window.viewdoc = viewdoc;
    window.onAfterPrint = onAfterPrint;
  }

  $(function() {
    setTimeout(init, 0);
  });

})(jQuery);
