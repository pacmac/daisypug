/**
 * dynadd-plugin.js — Dynamic form field builder
 *
 * Renders form fields from JSON definitions (fsql) at runtime.
 * Used by print-plugin.js (report filters), pn_gen.js (part number generator),
 * dynDialog(), and other pages that build forms dynamically.
 *
 * Field types: hidden, label, validator (skip), combobox, datebox,
 *   textbox, numberbox, numberspinner, qbe (fallback to textbox)
 *
 * Dependencies: jQuery, combobox-plugin.js (for $.fn.combobox)
 * Globals used: dotval(), clone() (from utils.js/bundle)
 */
(function($) {
  'use strict';

  window.dynadd = function(tgt, els) {
    tgt.empty();
    els = els || [];
    els.map(function(eli) {

      eli.valtype = eli.type;

      // 180329 - big report validator.
      if (eli.type == 'validator') return;

      if (eli.type == 'hidden') {
        var inp = $('<input/>');
        if (eli.value) {
          if (eli.value.indexOf('$') == 0) inp.val(dotval(eli.value.replace('$', '')));
          else inp.val(eli.value);
        }
        return inp.attr({ 'name': eli.id, type: 'hidden' }).appendTo(tgt);
      }

      else if (eli.type == 'label') {
        var inp = $('<label/>');
        inp.attr('class', 'notes text-sm opacity-70');
        if (eli.value) inp.text(eli.value);
        return inp.appendTo(tgt);
      }

      // Build row — use <template id="dui-fitem-tpl"> if available (matches +fitem structure)
      // Check inside form first, then parent .modal-box (template lives outside form to survive empty())
      var tpl = tgt.closest('form').find('template#dui-fitem-tpl')[0]
             || tgt.closest('.modal-box').find('template#dui-fitem-tpl')[0]
             || null;
      var row, lab, inp;
      if (tpl) {
        row = $(tpl.content.cloneNode(true).firstElementChild);
        lab = row.find('label');
        inp = row.find('input');
      } else {
        row = $('<div class="frow"/>');
        lab = $('<label/>');
        lab.appendTo(row);
        inp = $('<input/>');
      }

      // label
      var lat = clone(eli.label); delete lat.label;
      if (typeof(eli.label) == 'string') eli.label = { 'text': eli.label };
      lab.text(eli.label.text);
      lab.attr(lat);

      // --- Resolve data source ---
      var comboData = null;
      var presetValue = null;

      if (eli.target) {
        // DUI: find source field by id or name (EUI used input[textboxname])
        var src = $('#content').find('#' + eli.target).first();
        if (!src.length) src = $('#content').find('[name="' + eli.target + '"]').first();

        if (eli.type == 'qbe') {
          // QBE not yet supported in DUI — render as textbox fallback
          eli.type = 'textbox';
        }
        else if (eli.type == 'combobox' && src.length && $.fn.combobox && $.data(src[0], 'combobox')) {
          comboData = src.combobox('getData');
          presetValue = src.combobox('getValue');
        }
        else if (src.length) {
          presetValue = src.val();
        }
      } else {
        if (eli.data) comboData = eli.data;
      }

      // --- Build element by type ---
      var isCombo = (eli.type == 'combobox');
      var isDate = (eli.type == 'datebox');
      var isNumber = (eli.type == 'numberbox' || eli.type == 'numberspinner');
      var skip = ['sqlid', 'data', 'data-options', 'type', 'id', 'label', 'target', 'value', 'valtype', 'class'];

      if (isCombo) {
        // Replace template <input> with <select>
        var sel = $('<select class="select select-xs select-bordered w-full"/>');
        sel.attr('name', eli.id);
        if (eli.required) sel.attr('required', 'required');

        // Populate static options
        if (comboData && comboData.length) {
          var hasSelected = comboData.some(function(o) { return o.selected; });
          if (!hasSelected) sel.append($('<option/>').val('').text('Select...').prop('disabled', true).prop('selected', true));
          comboData.forEach(function(opt) {
            var val = opt.value !== undefined ? opt.value : (opt.VALUE || opt.text || '');
            var txt = opt.text !== undefined ? opt.text : (opt.TEXT || opt.name || val);
            var $o = $('<option/>').val(val).text(txt);
            if (opt.selected) $o.prop('selected', true);
            sel.append($o);
          });
        }

        // Copy custom attributes (skip known keys)
        for (var k in eli) { if (skip.indexOf(k) == -1 && k !== 'required') sel.attr(k, eli[k]); }

        // Replace input in the row
        inp.replaceWith(sel);
        inp = sel;
        if (!tpl) inp.appendTo(row);

        // Init combobox plugin — handles _sqlid remote loading, bool-dot, & API compat
        var cboOpts = {};
        if (eli.sqlid) cboOpts.url = '/?_func=get&_sqlid=' + eli.sqlid;
        if (comboData) cboOpts.data = comboData;
        inp.combobox(cboOpts);

        if (presetValue) inp.combobox('setValue', presetValue);

      } else {
        // Regular input — set type on template input (already has input-xs etc.)
        if (isDate) inp.attr('type', 'date');
        else if (isNumber) inp.attr('type', 'number');
        else inp.attr('type', 'text');

        inp.attr('name', eli.id);
        if (eli.required) inp.attr('required', 'required');

        // Set value
        if (eli.value) {
          if (eli.value.indexOf('$') == 0) inp.val(dotval(eli.value.replace('$', '')));
          else inp.val(eli.value);
        }
        if (presetValue) inp.val(presetValue);

        // Datebox with .today class — default to today's date
        if (isDate && !inp.val() && eli['class'] && /\btoday\b/.test(eli['class'])) {
          var d = new Date();
          inp.val(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'));
        }

        // Copy custom attributes (skip known keys)
        for (var k in eli) { if (skip.indexOf(k) == -1 && k !== 'required') inp.attr(k, eli[k]); }

        // Non-template: add DUI classes and append
        if (!tpl) {
          inp.addClass('input input-xs input-bordered w-full');
          inp.appendTo(row);
        }
      }

      row.appendTo(tgt);
    });
  };

})(jQuery);
