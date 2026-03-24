$.page.ready(function () {

  // ── Combobox data from bhave config ──────────────────────────────
  $.page.fn.cbos = function () {
    if (!$.dui.bhave) return;
    for (var k in $.dui.bhave) {
      var bits = k.split('CBO_');
      if (bits.length == 2) {
        var data = jsonParse($.dui.bhave[k]);
        var reg = new RegExp(/\*$/);
        if (data) {
          data.map(function (e) {
            if (e.value.endsWith('*')) {
              e.selected = true;
              e.value = e.value.replace(reg, '');
              e.text = e.text.replace(reg, '');
            }
          });
        }

        if (bits[1] == 'LICENSOR_OWNER' || bits[1] == 'RESULT')
          var $cbo = $('#dg_spec_editor [textboxname=' + bits[1] + '], #dg_result_editor [textboxname=' + bits[1] + ']');
        else
          var $cbo = $('form#qualification [textboxname=' + bits[1] + ']');
        var prev = $cbo.val();
        $cbo.combobox('loadData', data);
        if (prev) $cbo.combobox('select', prev);
      }
    }
  };

  // ── UDF defaults ─────────────────────────────────────────────────
  $.page.fn.defudf = function () {
    if (!$.dui.bhave) return;
    $('#UDF_LAYOUT_ID').combobox('select', $.dui.bhave.defudf);
  };

  // ── Due date calculation ─────────────────────────────────────────
  $.page.fn.due = function () {
    var dd = $('#DUE_DATE');
    var ddi = dd.next('span.textbox').find('input.textbox-text');
    var now = new Date();
    var date = new Date(dd.textbox('getValue'));
    var due = parseInt($('#DUE_DATE_ALERT_DAYS').numberspinner('getValue'));
    var days = parseInt((now - date) / 1000 / 60 / 60 / 24);
    var txt = Math.abs(days);

    ddi.removeClass('bg-ora bg-red bg-grn');
    if (days > 0) {
      if ($.dui.bhave.duealert == 'y') alert('Gauge has expired by ' + txt + ' days.');
      ddi.addClass('bg-red');
    } else if (due > txt) {
      if ($.dui.bhave.duealert == 'y') alert('Gauge calibration due in ' + txt + ' days.');
      ddi.addClass('bg-ora');
    } else {
      ddi.addClass('bg-grn');
    }
  };

  // ── Page defaults from bhave ─────────────────────────────────────
  $.page.fn.bhave = function () {
    $('#DUE_DATE_ALERT_DAYS').val($.dui.bhave.alertdays);
  };

  // ── Datagrid: Specification ──────────────────────────────────────
  $.page.fn.spec = {
    editor: 'form',
    addData: {
      LINE_NO: '$autonum:10',
      QUALIFICATION_ID: '#ID'
    },
    url: '/?_sqlid=dqm^qualification_specs&_func=get&_dgrid=y',
    onBeforeLoad: function () {
      var fdat = $('form#qualification').form('getData');
      if (!fdat.ID) return false;
    },
    onEndEdit: function (idx, row, chg) {
      var url = '/?_sqlid=dqm^qualification_specs';
      var data = clone(row);
      ajaxget(url, data, function (data) {});
    }
  };

  // ── Datagrid: Results ────────────────────────────────────────────
  $.page.fn.result = {
    editor: 'form',
    addData: {
      LINE_NO: '$autonum:10',
      QUALIFICATION_ID: '#ID'
    },
    url: '/?_sqlid=dqm^qualification_results&_func=get&_dgrid=y',
    onBeforeLoad: function () {
      var fdat = $('form#qualification').form('getData');
      if (!fdat.ID) return false;
    },
    onEndEdit: function (idx, row, chg) {
      var url = '/?_sqlid=dqm^qualification_results';
      var data = clone(row);
      ajaxget(url, data, function (data) {});
    }
  };

  // ── Init ─────────────────────────────────────────────────────────
  $('#dg_spec').datagrid('rowEditor', $.page.fn.spec);
  $('#dg_result').datagrid('rowEditor', $.page.fn.result);
  $.page.fn.cbos();
  $.page.fn.defudf();
  $('#dg_spec').datagrid('loadData', []);
  $('#dg_result').datagrid('loadData', []);

  $('#but_add').on('done', function () {
    $('#dg_spec').datagrid('loadData', []);
    $('#dg_result').datagrid('loadData', []);
    $.page.fn.cbos();
  });

  ajaxget('/', {_func: 'get', _sqlid: 'vwltsa^udfid', '_combo': 'y'}, function (rs) {
    $('#UDF_LAYOUT_ID').combobox('loadData', rs);
  });

  $('#UDF_LAYOUT_ID').combobox({
    validType: ['inList'],
    onSelect: setudfs,
    readonly: true,
    value: $.dui.bhave ? $.dui.bhave.defudf : ''
  });

  $('form#qualification [textboxname=UDF_LAYOUT_ID]').combobox({onSelect: setudfs});

  // ── After qualification record loaded ────────────────────────────
  $('#qualification').on('loadDone', function (evt, fdat) {
    $.page.fn.cbos();
    $.page.fn.due();
    $.page.fn.defudf();

    $('#dg_spec').datagrid('load', {_func: 'get', _sqlid: 'dqm^qualification_specs', _dgrid: 'y', QUALIFICATION_ID: fdat.ID});
    $('#dg_result').datagrid('load', {_func: 'get', _sqlid: 'dqm^qualification_results', _dgrid: 'y', QUALIFICATION_ID: fdat.ID});
    $('#qmfiles').datagrid('docFiles', fdat.ID);
  });

});
