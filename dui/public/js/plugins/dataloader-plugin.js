// DUI Dataloader Plugin
// Scans DOM for .easyui-* classes and initializes corresponding DUI jQuery plugins.
// Provides dui.dataloader: .fkey change -> load form by _sqlid.
//
// Extracted from disloader.js.

(function($) {
  $(document).ready(function() {

    // Layout: auto-init .easyui-layout elements
    $('.easyui-layout').each(function() {
      $(this).layout();
    });

    // DUI dataloader core: .fkey change -> load form by form _sqlid
    var dui = window.dui = window.dui || {};
    dui.dataloader = dui.dataloader || {};
    var LOG = false;
    var dbg = { fkeyCalls: 0, lastTs: 0 };

    function dlog(fn, msg, extra) {
      if (!LOG) return;
      if (extra === undefined) {
        console.log('[' + fn + '] ' + msg);
        return;
      }
      console.log('[' + fn + '] ' + msg, extra);
    }

    function urlToObj(url) {
      var out = {};
      if (!url || typeof url !== 'string') return out;
      var qpos = url.indexOf('?');
      if (qpos === -1) return out;
      var qs = url.slice(qpos + 1);
      if (!qs) return out;
      qs.split('&').forEach(function(pair) {
        if (!pair) return;
        var bits = pair.split('=');
        var key = decodeURIComponent(bits[0] || '');
        if (!key) return;
        var val = decodeURIComponent(bits.slice(1).join('=') || '');
        out[key] = val;
      });
      return out;
    }

    function duiAjaxGet(url, vars, cb, avar) {
      avar = avar || { async: true };
      vars = $.extend(urlToObj(url), vars);
      var method = $.dui.ajax_method || 'GET';
      dlog('duiAjaxGet', 'request start', { url: url || '/', method: method, vars: vars });
      if (typeof $.ajax !== 'function') {
        dlog('duiAjaxGet', 'jquery.ajax missing, abort');
        return;
      }
      ajaxget('', vars, function(data) {
        dlog('duiAjaxGet.done', 'request success', { type: typeof data });
        if (cb) cb(data);
      }, {
        async: avar.async !== false,
        url: url || '/',
        method: method,
        error: function(err) {
          dlog('duiAjaxGet.fail', 'request failed', { err: err && err.status ? err.status : err });
          if (cb) cb(err);
        }
      });
      dlog('duiAjaxGet', 'ajax dispatched');
    }

    function comboSqlid($field) {
      var sqlid = $field.attr('_sqlid') || $field.attr('_sqlid_') || $field.attr('__sqlid') || null;
      dlog('comboSqlid', 'resolved combo sqlid', { sqlid: sqlid });
      return sqlid;
    }

    function loadComboOptions($field) {
      if (!$field || !$field.length) return;
      // Skip SELECT elements managed by qbe-plugin — they load their own data
      if ($.data($field[0], 'qbe')) {
        dlog('loadComboOptions', 'qbe-managed field — skip preload', { id: $field.attr('id') || null });
        return;
      }
      var sqlid = comboSqlid($field);
      if (!sqlid) {
        dlog('loadComboOptions', 'missing _sqlid for combo, skip', { id: $field.attr('id') || null });
        return;
      }
      var req = { _func: 'get', _combo: 'y', _sqlid: sqlid };
      dlog('loadComboOptions', 'request prepared', req);

      duiAjaxGet('/', req, function(resp) {
        var data = resp;
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) {
            dlog('loadComboOptions.done', 'json parse failed', { error: String(e) });
          }
        }
        var rows = $.isArray(data) ? data : (data && $.isArray(data.rows) ? data.rows : []);
        dlog('loadComboOptions.done', 'response received', { len: rows.length });
        if (typeof $field.combobox === 'function') {
          try {
            $field.combobox({ data: rows });
            $field.combobox('loadData', rows);
            dlog('loadComboOptions.done', 'applied via combobox helper', { id: $field.attr('id') || null });
            return;
          } catch (e) {
            dlog('loadComboOptions.done', 'combobox helper failed, fallback', { error: String(e) });
          }
        }
        // Fallback: if select element, populate options directly.
        if ($field.is('select')) {
          $field.empty();
          rows.forEach(function(row) {
            var text = row.text || row.TEXT || row.value || row.VALUE || '';
            var value = row.value || row.VALUE || row.text || row.TEXT || '';
            $field.append($('<option/>').val(value).text(text));
          });
          dlog('loadComboOptions.done', 'applied via select options', { id: $field.attr('id') || null, len: rows.length });
        }
      });
    }

    function getVisibleForm() {
      var $form = $('#content form:visible:first');
      dlog('getVisibleForm', 'resolved visible form', { found: $form.length, id: $form.attr('id') || null, sqlid: $form.attr('_sqlid') || null });
      return $form;
    }

    function getFormForField($field) {
      var $form = $field.closest('form');
      if ($form.length) {
        dlog('getFormForField', 'using closest form', { formId: $form.attr('id') || null, sqlid: $form.attr('_sqlid') || null });
        return $form;
      }
      dlog('getFormForField', 'closest form missing, falling back to visible form');
      return getVisibleForm();
    }

    function isPrimaryFkey($field, $form) {
      var $first = $form.find('.fkey:first');
      var isPrimary = !!($first.length && $first[0] === $field[0]);
      dlog('isPrimaryFkey', 'evaluated primary fkey', {
        isPrimary: isPrimary,
        current: $field.attr('id') || $field.attr('name') || null,
        first: $first.attr('id') || $first.attr('name') || null
      });
      return isPrimary;
    }

    function fieldName($field) {
      var key = $field.attr('comboname') || $field.attr('textboxname') || $field.attr('name') || $field.attr('id') || null;
      dlog('fieldName', 'resolved key name', {
        key: key,
        comboname: $field.attr('comboname') || null,
        textboxname: $field.attr('textboxname') || null,
        name: $field.attr('name') || null,
        id: $field.attr('id') || null
      });
      return key;
    }

    function fieldValue($field) {
      if (!$field || !$field.length) {
        dlog('fieldValue', 'field missing, returning empty');
        return '';
      }
      if ($field.hasClass('easyui-combobox') && typeof $field.combobox === 'function') {
        try {
          var cval = $field.combobox('getValue');
          dlog('fieldValue', 'resolved via combobox helper', { value: cval });
          return cval;
        } catch (e) {
          dlog('fieldValue', 'combobox getValue failed, fallback to raw value', { error: String(e) });
        }
      }
      if (typeof $field.textbox === 'function' && $field.hasClass('easyui-textbox')) {
        try {
          var tval = $field.textbox('getValue');
          dlog('fieldValue', 'resolved via textbox helper', { value: tval });
          return tval;
        } catch (e) {
          dlog('fieldValue', 'textbox getValue failed, fallback to raw value', { error: String(e) });
        }
      }
      var raw = $field.val();
      dlog('fieldValue', 'resolved via raw value', { value: raw });
      return raw;
    }

    function normalizeRecord(payload) {
      if (!payload) {
        dlog('normalizeRecord', 'payload empty');
        return null;
      }
      if ($.isArray(payload)) {
        var arrRec = payload.length ? payload[0] : null;
        dlog('normalizeRecord', 'normalized array payload', { length: payload.length, hasRecord: !!arrRec });
        return arrRec;
      }
      if (payload.rows && $.isArray(payload.rows)) {
        var rowRec = payload.rows.length ? payload.rows[0] : null;
        dlog('normalizeRecord', 'normalized rows payload', { length: payload.rows.length, hasRecord: !!rowRec });
        return rowRec;
      }
      dlog('normalizeRecord', 'normalized object payload', { keys: Object.keys(payload).length });
      return payload;
    }

    function setFieldValue($field, value) {
      if (!$field.length) {
        dlog('setFieldValue', 'target field not found');
        return;
      }
      var fieldTag = ($field.prop('tagName') || '').toLowerCase();
      var fieldKey = $field.attr('name') || $field.attr('id') || null;
      if ($field.hasClass('easyui-combobox') && typeof $field.combobox === 'function') {
        try {
          $field.combobox('setValue', value);
          dlog('setFieldValue', 'applied via combobox helper', { field: fieldKey, tag: fieldTag, value: value });
          return;
        } catch (e) {
          dlog('setFieldValue', 'combobox setValue failed, fallback', { field: fieldKey, error: String(e) });
        }
      }
      if ($field.hasClass('easyui-numberbox') && typeof $field.numberbox === 'function') {
        try {
          $field.numberbox('setValue', value);
          dlog('setFieldValue', 'applied via numberbox helper', { field: fieldKey, tag: fieldTag, value: value });
          return;
        } catch (e) {
          dlog('setFieldValue', 'numberbox setValue failed, fallback', { field: fieldKey, error: String(e) });
        }
      }
      if ($field.hasClass('easyui-textbox') && typeof $field.textbox === 'function') {
        try {
          $field.textbox('setValue', value);
          dlog('setFieldValue', 'applied via textbox helper', { field: fieldKey, tag: fieldTag, value: value });
          return;
        } catch (e) {
          dlog('setFieldValue', 'textbox setValue failed, fallback', { field: fieldKey, error: String(e) });
        }
      }
      $field.val(value);
      dlog('setFieldValue', 'applied via raw val()', { field: fieldKey, tag: fieldTag, value: value });
    }

    function applyRecord($form, record) {
      dlog('applyRecord', 'start record apply', { fields: Object.keys(record || {}).length, formId: $form.attr('id') || null });
      Object.keys(record || {}).forEach(function(key) {
        var value = record[key];
        if (value === undefined || value === null) value = '';
        var selector = '[name="' + key + '"], #' + key;
        var $field = $form.find(selector).first();
        if ($field.length) {
          if ($field.hasClass('fkey')) {
            dlog('applyRecord', 'skip fkey field', { key: key });
            return;
          }
          dlog('applyRecord', 'mapping field', { key: key, selector: selector });
          setFieldValue($field, value);
        } else {
          dlog('applyRecord', 'no matching field in form', { key: key, selector: selector });
        }
      });
      dlog('applyRecord', 'record apply complete');
    }

    function loadByFkey($fkey) {
      var now = Date.now();
      if (now - dbg.lastTs > 1000) dbg.fkeyCalls = 0;
      dbg.lastTs = now;
      dbg.fkeyCalls += 1;
      if (dbg.fkeyCalls === 5) {
        console.warn('[loadByFkey] rapid calls detected, tracing...');
        console.trace();
      }
      dlog('loadByFkey', 'triggered', {
        fieldId: $fkey.attr('id') || null,
        fieldName: $fkey.attr('name') || null,
        classes: $fkey.attr('class') || null
      });
      if ($fkey.data('dui-loading')) {
        dlog('loadByFkey', 'already loading, skip');
        return;
      }
      var $form = getFormForField($fkey);
      if (!$form.length) {
        dlog('loadByFkey', 'no form found, abort');
        return;
      }
      if (!isPrimaryFkey($fkey, $form)) {
        dlog('loadByFkey', 'not primary fkey, skip load');
        return;
      }

      var sqlid = $form.attr('_sqlid');
      var key = fieldName($fkey);
      var value = fieldValue($fkey);
      if (!sqlid || !key || value === '' || value === null || value === undefined) {
        dlog('loadByFkey', 'missing load prerequisites', { sqlid: sqlid || null, key: key || null, value: value });
        return;
      }
      var lastKey = $fkey.data('dui-last-key') || null;
      var lastVal = $fkey.data('dui-last-val');
      if (lastKey === key && lastVal === value) {
        dlog('loadByFkey', 'same key/value as last load, skip');
        return;
      }
      $fkey.data('dui-loading', true);

      var req = { _func: 'get', _sqlid: sqlid };
      req[key] = value;
      dlog('loadByFkey', 'request prepared', req);

      ajaxget('', req, function(resp) {
        var data = resp;
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) {
            dlog('loadByFkey.done', 'json parse failed', { error: String(e) });
          }
        }
        dlog('loadByFkey.done', 'response received', { type: typeof data, isArray: $.isArray(data) });
        var record = normalizeRecord(data);
        if (!record || typeof record !== 'object') {
          dlog('loadByFkey.done', 'no usable record after normalize');
          $fkey.data('dui-loading', false);
          return;
        }
        dlog('loadByFkey.done', 'normalized record ready', { keys: Object.keys(record).length });
        var skipId = $fkey.attr('id') || null;
        if (typeof $form.form === 'function') {
          dlog('loadByFkey', 'calling form.load', {
            skipId: skipId,
            formHelper: typeof $form.form,
            formHelperLoaded: !!window.duiFormHelperLoaded
          });
          try {
            $form.form('load', record, { skipIds: skipId ? [skipId] : [] });
            dlog('loadByFkey', 'form.load dispatched', { formId: $form.attr('id') || null });
          } catch (e) {
            console.warn('[loadByFkey] form.load failed, falling back', { error: String(e) });
            applyRecord($form, record);
          }
        } else {
          dlog('loadByFkey', 'form helper missing, applying record directly', {
            formHelper: typeof $form.form,
            formHelperLoaded: !!window.duiFormHelperLoaded
          });
          applyRecord($form, record);
        }
        $fkey.data('dui-last-key', key);
        $fkey.data('dui-last-val', value);
        $fkey.data('dui-loading', false);
      }, {
        method: 'get',
        dataType: 'json',
        error: function(xhr, status, err) {
          console.warn('[loadByFkey.fail] request failed', { sqlid: sqlid, key: key, value: value, status: status, err: err, code: xhr && xhr.status });
          $fkey.data('dui-loading', false);
        }
      });
    }

    dui.dataloader.loadByFkey = loadByFkey;
    dlog('init', 'dui.dataloader.loadByFkey registered');

    // Delegated listeners support both input and select backed fkeys.
    $(document).off('change.duiDataloader').on('change.duiDataloader', '#content form .fkey', function() {
      if ($(this).data('dui-loading')) {
        dlog('change.duiDataloader', 'ignored change during load');
        return;
      }
      dlog('change.duiDataloader', 'change event captured');
      loadByFkey($(this));
    });

    $(document).off('dui:loadbyfkey').on('dui:loadbyfkey', '#content form .fkey', function() {
      if ($(this).data('dui-loading')) {
        dlog('dui:loadbyfkey', 'ignored loadbyfkey during load');
        return;
      }
      dlog('dui:loadbyfkey', 'custom event captured');
      loadByFkey($(this));
    });
    dlog('init', 'dataloader delegated listeners bound');

    // Lazy combo observer — loads _sqlid combos only when they become visible.
    // Visible combos (main form) fire immediately; hidden combos (tabs) defer.
    var comboObserver = window.IntersectionObserver ? new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        comboObserver.unobserve(entry.target);
        dlog('comboObserver', 'visible, loading', { id: entry.target.id || null });
        loadComboOptions($(entry.target));
      });
    }) : null;

    function preloadCombos($root, source) {
      var $ctx = $root && $root.length ? $root : $(document);
      var base = $ctx.is('#content') ? $ctx : $ctx.find('#content');
      if (!base.length) base = $ctx;

      var $combos = base.find('select[_sqlid]');
      dlog('preloadCombos', 'found selects with _sqlid', { count: $combos.length, source: source || 'unknown' });
      var useLazy = false;
      $combos.each(function() {
        if (useLazy) {
          comboObserver.observe(this);
        } else {
          loadComboOptions($(this));
        }
      });
    }

    // On window load: attempt preload (may be before panel refresh).
    $(window).off('load.duiCombo').on('load.duiCombo', function() {
      preloadCombos($(document), 'window.load');
    });

    // After panel refresh content injection.
    $(document).off('dui:contentloaded.duiCombo').on('dui:contentloaded.duiCombo', function(_, $panel) {
      preloadCombos($panel, 'dui:contentloaded');
    });
  });
})(jQuery);
