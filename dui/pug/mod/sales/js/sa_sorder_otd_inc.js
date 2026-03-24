(function (factory) {
  function boot() {
    if (window.$ && window.$.page) factory(window.$);
  }
  if (window.$ && window.$.page) return factory(window.$);
  window.addEventListener('load', boot, { once: true });
})(function ($) {
$.page.fn.status = function () {
  var opt = $('#otddg').datagrid('options');
  opt.tbar.dgre_add.hide();
  opt.tbar.dgre_del.hide();
  opt.tbar.dgre_edit.hide();
  $('input[comboname=OTD_CODE]').addClass('ronly-on');
};

$.page.fn.otdcombo = {
  type: 'combobox',
  cls: 'unlock',
  options: {
    panelWidth: 300,
    url: '/?_func=get&_sqlid=dqm^otdcause&_combo=y',
    editable: false,
    loadFilter: function (data) {
      data.map(function (e) { e.text = e.value + ' - ' + e.description; });
      return data;
    }
  }
};

$.page.fn.otdOpts = {
  editor: 'inline',
  addData: {},
  columns: [[
    { field: 'SALES_ORDER_ID', hidden: true },
    { field: 'LINE_NO', title: '#', width: 30, fixed: true, align: 'center' },
    { field: 'OTD_CODE', title: 'OTD Code', width: 100, fixed: false, editor: $.page.fn.otdcombo },
    { field: 'PART_ID', title: 'Part ID', width: 150, fixed: false },
    { field: 'WANT_DATE', title: 'Want Date', width: 80, fixed: false, formatter: $.dui.fmt.date }
  ]],
  onEndEdit: function (idx, row) {
    ajaxget('/', {
      _sqlid: 'sales^soline',
      _func: 'upd',
      SALES_ORDER_ID: row.SALES_ORDER_ID,
      LINE_NO: row.LINE_NO,
      OTD_CODE: row.OTD_CODE,
      WANT_DATE: row.WANT_DATE
    }, function () {
      $('#solines').datagrid('reload');
    });
  }
};

$.page.ready(function () {
  $('#otdopen').off('click').on('click', function () {
    $('#otdwin').window('open');
  });

  $('#otdwin').window({
    minimizable: false,
    draggable: true,
    modal: false,
    onOpen: function () {
      $('#otddg').datagrid('loadData', $('#solines').datagrid('getData'));
    },
    onBeforeClose: function () {
      var opt = $('#otddg').datagrid('options');
      if (!opt.tbar.dgre_ok.hasClass('l-btn-disabled')) {
        beep('error');
        alert('Please finish editing.');
        return false;
      }
    }
  });

  $('#otddg').datagrid($.page.fn.otdOpts).datagrid('rowEditor', $.page.fn.otdOpts);

  $.page.fn.status();
});

});
