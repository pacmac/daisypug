// MODULE_ID editor onSelect — cascade MODULE_CLASS + MODULE_DESC
$.page.fn.cboselect = function(rec) {
  var dg = $('#dgitems');
  var row = dg.datagrid('getSelected');
  var idx = dg.datagrid('getRowIndex', row);

  if (dg.datagrid('findRows', {'MODULE_ID': rec.value}).rows.length > 0) {
    $(this).combobox('clear');
    msgbox(rec.value.replace('^', ' - ') + ' row already exists.');
  }

  var opt = dg.datagrid('options');
  if (opt) {
    var form = $(opt.tbar.form);
    form.find('input[textboxname="MODULE_CLASS"]').textbox('setValue', rec.MODULE_TYPE);
    form.find('input[textboxname="MODULE_DESC"]').textbox('setValue', rec.MODULE_DESC);
  }
};

// MODULE_ID column editor definition
$.page.fn.module = {
  type: 'combobox',
  options: {
    required: true,
    panelHeight: 'auto',
    editable: true,
    url: '/',
    queryParams: { _func: 'get', _sqlid: 'dqm^moduleid', _combo: 'y' },
    onSelect: $.page.fn.cboselect
  }
};

// Datagrid callback opts (columns + static opts in JSON config)
$.page.fn.opts = {
  editor: 'form',
  twoColumns: false,

  addData: {
    DEPARTMENT_ID: '#DEPARTMENT_ID'
  },

  onBeforeLoad: function(param) {
    var fdat = $('form#main').form('getData');
    if (!fdat.DEPARTMENT_ID) return false;
  },

  loadFilter: function(data) {
    return data;
  },

  onEndEdit: function(idx, row, chg) {
    $.page.fn.saverow(row, function(res) {
      var pvar = { _func: 'get', _sqlid: 'dqm^dept_training_ref', DEPARTMENT_ID: row.DEPARTMENT_ID };
      ajaxget('/', pvar, function(data) {
        $('#dgitems').datagrid('loadData', data);
      });
    });
  }
};

$.page.fn.saverow = function(row, cb) {
  row.DEPARTMENT_DESC = $('#DEPARTMENT_DESC').textbox('getValue');
  var qp = $.extend({ _sqlid: 'dqm^dept_training_ref' }, row);
  ajaxget('/', qp, cb);
};

$.page.ready(function() {
  $('#DEPARTMENT_ID').combobox({
    'onSelect': function(rec) {
      $('#DEPARTMENT_DESC').textbox('setValue', rec.DESCRIPTION);
      $('#dgitems').datagrid('loadData', {"total": 0, "rows": []});

      var pvar = { _func: 'get', _sqlid: 'dqm^dept_training_ref', DEPARTMENT_ID: rec.value };
      ajaxget('/', pvar, function(data) {
        $('#dgitems').datagrid('loadData', data);
      });
    }
  });

  $('#dgitems').datagrid('rowEditor', $.page.fn.opts);
  $('#dgitems').datagrid('loadData', {"total": 0, "rows": []});
});
