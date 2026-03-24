// DUI Filegrid Plugin
// Thin initializer that composes a datagrid with pre-configured file columns,
// toolbar buttons, and event handlers. Extends existing datagrid plugin.
//
// Usage: +filegrid#partfiles(data-options="fit:true") in pug
// JS:    $('#partfiles').datagrid('docFiles', partId)

(function($) {
  'use strict';

  // ========================================================================
  // File extension → Lucide icon name mapping
  // ========================================================================
  var EXTN_MAP = {
    pdf:  'file-text',
    doc:  'file-text',   docx: 'file-text',  txt: 'file-text',
    rtf:  'file-text',   csv:  'file-spreadsheet',  dot: 'file-text',
    xls:  'file-spreadsheet', xlsx: 'file-spreadsheet', xlst: 'file-spreadsheet', xlsm: 'file-spreadsheet',
    ppt:  'file-image',  pptx: 'file-image',
    zip:  'file-archive', tar: 'file-archive', gz: 'file-archive', rar: 'file-archive',
    png:  'image',       jpg:  'image',        jpeg: 'image',       gif: 'image',
    bmp:  'image',       svg:  'image',        webp: 'image'
  };

  function extncls(extn) {
    if (!extn) return 'file';
    return EXTN_MAP[extn.toLowerCase()] || 'file';
  }

  // ========================================================================
  // Filename formatter — Lucide icon + filename
  // ========================================================================
  function fnameFormatter(val, row) {
    var icon = extncls(row.extn);
    return '<span class="inline-flex items-center gap-1">' +
      '<span data-lucide="' + icon + '" class="w-4 h-4 flex-shrink-0 opacity-70"></span>' +
      '<span>' + (val || '') + '</span></span>';
  }

  // ========================================================================
  // Column definitions (matches EUI exactly)
  // ========================================================================
  var FILE_COLUMNS = [[
    { field: 'fclass',      title: 'Type',        hidden: true },
    { field: 'fname',       title: 'Filename',    width: 200,  formatter: fnameFormatter },
    { field: 'appdoc',      title: 'Doc ID',      hidden: true },
    { field: 'revn',        title: 'Rev',         hidden: true,  width: 50, align: 'right' },
    { field: 'tsid',        hidden: true },
    { field: 'uid',         title: 'UID',         hidden: true },
    { field: 'type',        hidden: true },
    { field: 'extn',        hidden: true },
    { field: 'appid',       hidden: true },
    { field: 'description', title: 'Description', width: 300 }
  ]];

  // ========================================================================
  // Toolbar button enable/disable
  // ========================================================================
  var DIS_CLS = 'opacity-40 pointer-events-none';

  function fgEnable(id) {
    var btn = document.getElementById(id);
    if (btn) { $(btn).removeClass(DIS_CLS); btn.disabled = false; }
  }
  function fgDisable(id) {
    var btn = document.getElementById(id);
    if (btn) { $(btn).addClass(DIS_CLS); btn.disabled = true; }
  }

  function setSelectionButtons(dgId, enabled) {
    var ids = [dgId + '_fl_view', dgId + '_fl_viewdoc', dgId + '_fl_del'];
    ids.forEach(enabled ? fgEnable : fgDisable);
  }

  // ========================================================================
  // $.fn.filegrid — initializer
  // ========================================================================
  $.fn.filegrid = function() {
    return this.each(function() {
      var el = this;
      var $el = $(el);
      var dgId = el.id;

      // Already initialized?
      if ($el.data('filegrid-init')) return;
      $el.data('filegrid-init', true);

      // Initialize as a datagrid with file-specific config
      $el.datagrid({
        cls: 'filegrid',
        idField: 'tsid',
        remoteSort: false,
        striped: true,
        rownumbers: true,
        singleSelect: true,
        fitColumns: true,
        columns: FILE_COLUMNS,

        onLoadSuccess: function(data) {
          setSelectionButtons(dgId, false);

          // Store rows for page access
          if ($.page) $.page.state.docfiles = data.rows || [];

          // Build _docfiles hidden field (comma-separated filenames)
          var names = [];
          (data.rows || []).forEach(function(r) {
            if (r.fname && r.extn) names.push(r.fname + '.' + r.extn);
          });

          var $form = $el.closest('.tab-content').find('form').first();
          if (!$form.length) $form = $el.closest('form');
          if ($form.length) {
            var $docfiles = $form.find('input[name="_docfiles"]');
            if (!$docfiles.length) {
              $docfiles = $('<input type="hidden" name="_docfiles" />').appendTo($form);
            }
            $docfiles.val(names.join(', '));
          }

          // Render Lucide icons
          if (typeof lucide !== 'undefined') {
            var icons = el.querySelectorAll('[data-lucide]');
            if (icons.length) lucide.createIcons({ nodes: icons });
          }
        },

        onSelect: function(idx, row) {
          setSelectionButtons(dgId, true);
          // Store selected file data for download/preview/delete
          if ($.page) $.page.state.fileSelected = row;
          // Page hook
          if ($.page && typeof $.page.fn.fgOnCheck === 'function') {
            $.page.fn.fgOnCheck(idx, row);
          }
        },

        onUnselect: function(idx, row) {
          setSelectionButtons(dgId, false);
          if ($.page) $.page.state.fileSelected = null;
          if ($.page && typeof $.page.fn.fgOnUncheck === 'function') {
            $.page.fn.fgOnUncheck(idx, row);
          }
        },

        onRowContextMenu: function(e, idx, row) {
          e.preventDefault();
          if ($.page && typeof $.page.fn.fgOnRowContextMenu === 'function') {
            $.page.fn.fgOnRowContextMenu(e, idx, row);
          }
        },

        onDblClickRow: function(idx, row) {
          if (!row) return;
          var modal = document.getElementById('fg-preview-modal');
          if (modal) {
            var iframe = modal.querySelector('iframe');
            if (iframe) {
              iframe.src = '/?_func=tsdl&inline=y&libcon=y&cache=y&tsid=' + row.tsid + '&appid=' + row.appid;
            }
            modal.showModal();
          }
        },

        onBeforeSelect: function(idx, row) {
          // Toggle: clicking same row unselects
          var state = $.data(el, 'datagrid');
          if (state && state.selectedRow && row && state.selectedRow.tsid === row.tsid) {
            setTimeout(function() { $el.datagrid('unselectAll'); });
            return false;
          }
        }
      });

      // Render column headers from FILE_COLUMNS
      $el.datagrid('renderColumns');

      // Wire toolbar buttons
      $('#' + dgId + '_browse').off('click.fg').on('click.fg', function() {
        // Open file tree browser modal
        var modal = document.getElementById('fg-tree-modal');
        if (modal) {
          $(modal).data('filegrid', dgId);
          modal.showModal();
        }
      });

      $('#' + dgId + '_upload').off('click.fg').on('click.fg', function() {
        // Open upload modal
        var modal = document.getElementById('fg-upload-modal');
        if (modal) {
          $(modal).data('filegrid', dgId);
          // Reset form
          var form = modal.querySelector('form');
          if (form) form.reset();
          modal.showModal();
        }
      });

      // Upload submit handler — wired to the shared upload modal's Upload button
      $(document).off('click.fg-upload', '#fg-upload-btn').on('click.fg-upload', '#fg-upload-btn', function() {
        var modal = document.getElementById('fg-upload-modal');
        if (!modal) return;
        var targetDgId = $(modal).data('filegrid') || dgId;
        var $target = $('#' + targetDgId);

        // Collect form inputs from the modal
        var fileInput = modal.querySelector('input[type="file"]');
        var descInput = modal.querySelector('input[name="description"]');
        var verInput = modal.querySelector('input[name="rver"]');

        if (!fileInput || !fileInput.files.length) {
          $.messager.show({ msg: 'Please select a file.', cls: 'warning' });
          return;
        }
        if (descInput && descInput.required && !descInput.value.trim()) {
          $.messager.show({ msg: 'Please enter a description.', cls: 'warning' });
          return;
        }

        // Build FormData — include all fields the remote server expects
        // (EUI sends _func, _sqlid, appdoc inside the multipart body)
        var state = $.data($target[0], 'datagrid');
        var appdoc = (state && state.options.queryParams && state.options.queryParams.appdoc) || '';
        var pageId = ($.page && $.page.state && $.page.state.pageId) || '';

        // Build FormData — fields FIRST, file LAST (Pure3d's busboy parser
        // needs appid before the file event fires)
        var fd = new FormData();
        if (descInput) fd.append('description', descInput.value);
        if (verInput) fd.append('rver', verInput.value);
        fd.append('appdoc', appdoc);
        fd.append('appid', pageId);
        fd.append('file', fileInput.files[0]);

        // _func=upload in URL query for Pure3d's fileman router.
        // _sqlid in query for Pure4 proxy routing (Express can't parse multipart body).
        var qs = new URLSearchParams({
          _sqlid: 'admin^file', _func: 'upload', _appid: pageId
        }).toString();

        // Progress bar
        var prog = document.getElementById('fg-upload-progress');
        if (prog) { prog.classList.remove('hidden'); prog.value = 0; }

        // XHR for progress tracking
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/?' + qs);
        if (xhr.upload && prog) {
          xhr.upload.addEventListener('progress', function(e) {
            if (e.lengthComputable) prog.value = Math.ceil(e.loaded * 100 / e.total);
          });
        }
        xhr.onload = function() {
          if (prog) prog.classList.add('hidden');
          var res;
          try { res = JSON.parse(xhr.responseText); } catch(e) { res = {}; }
          if (res.error) {
            $.messager.show({ msg: res.msg || 'Upload failed.', cls: 'error' });
          } else {
            $.messager.show({ msg: 'File uploaded.', cls: 'success' });
            modal.close();
            $target.datagrid('reload');
          }
        };
        xhr.onerror = function() {
          if (prog) prog.classList.add('hidden');
          $.messager.show({ msg: 'Upload failed — network error.', cls: 'error' });
        };
        xhr.send(fd);
      });

      $('#' + dgId + '_fl_view').off('click.fg').on('click.fg', function() {
        var sel = ($.page && $.page.state.fileSelected) || $el.datagrid('getSelected');
        if (!sel) return;
        window.location = '/?_func=tsdl&tsid=' + sel.tsid + '&appid=' + sel.appid;
      });

      $('#' + dgId + '_fl_viewdoc').off('click.fg').on('click.fg', function() {
        var sel = ($.page && $.page.state.fileSelected) || $el.datagrid('getSelected');
        if (!sel) return;
        var modal = document.getElementById('fg-preview-modal');
        if (modal) {
          var iframe = modal.querySelector('iframe');
          if (iframe) {
            iframe.src = '/?_func=tsdl&inline=y&libcon=y&cache=y&tsid=' + sel.tsid + '&appid=' + sel.appid;
          }
          modal.showModal();
        }
      });

      $('#' + dgId + '_fl_del').off('click.fg').on('click.fg', function() {
        var sel = ($.page && $.page.state.fileSelected) || $el.datagrid('getSelected');
        if (!sel) return;
        $.messager.confirm('Delete', 'Delete this file?', function(ok) {
          if (!ok) return;
          ajaxget('/', {
            _func: 'del',
            _sqlid: 'admin^file',
            tsid: sel.tsid,
            appid: sel.appid
          }, function(res) {
            if (res && res.error) {
              $.messager.show({ msg: res.msg || 'Delete failed', cls: 'error' });
              return;
            }
            $el.datagrid('reload');
          });
        });
      });

      $('#' + dgId + '_refresh').off('click.fg').on('click.fg', function() {
        $el.datagrid('reload');
      });

      // Initial state: disable selection-dependent buttons
      setSelectionButtons(dgId, false);
    });
  };

  // ========================================================================
  // Auto-init: find all .easyui-filegrid elements on content load
  // ========================================================================
  $(document).on('dui:contentloaded', function(e, $panel) {
    var root = ($panel && $panel[0]) || document;
    $(root).find('.easyui-filegrid').filegrid();
  });

  // Expose helpers
  $.dui.fn.extncls = extncls;

  if ($.dui._plugins) $.dui._plugins.loaded.push('filegrid-plugin');

})(jQuery);
