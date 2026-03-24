$.page.ready(function () {
  $.page.fn.copacook = `${$.page.state.pageId}copa`;
  $.page.fn.cwid = `${$.page.state.pageId}^copa^.width`;
  $.page.fn.mid = `${$.page.state.pageId}^copa^cols`;

  $.page.fn.defcols = [
    'WOREF', 'WO_CLASS', 'WO_TYPE', 'PART_ID', 'STATUS', 'PRODUCT_CODE',
    'CUSTOMER_ID', 'CUSTOMER_NAME', 'SALES_ORDER_ID', 'SALES_ORDER_LINE_NO', 'SO_REVENUE',
    'COST_MATL', 'COST_SUBCON', 'COST_TOOLING', 'COST_OTHERS',
    'ACT_MATERIAL_COST', 'ACT_LABOR_COST', 'ACT_BURDEN_COST', 'ACT_SUBCON_COST',
    'ACT_RENTAL_COST', 'GRAND_TOTAL_COST', 'GROSS_PROFIT'
  ];

  if (getacook($.page.fn.mid).length === 0) {
    putacook($.page.fn.mid, $.page.fn.defcols);
  }

  $.dui.bhave._global.COST_LABEL_1 = $.dui.bhave._global.COST_LABEL_1 || 'Fix/Tool';
  $.dui.bhave._global.COST_LABEL_2 = $.dui.bhave._global.COST_LABEL_2 || 'SubCon';
  $.dui.bhave._global.COST_LABEL_3 = $.dui.bhave._global.COST_LABEL_3 || 'Tooling';

  $.page.fn.autosize = function () {
    var wido = getocook($.page.fn.cwid);
    var dg = $('#copa');
    dg.datagrid('loading');
    setTimeout(function () {
      var cols = dg.datagrid('getColumnFields');
      cols.map(function (col) {
        dg.datagrid('autoSizeColumn', col);
        var cop = dg.datagrid('getColumnOption', col);
        wido[cop.field] = parseInt(cop.width, 10);
      });
      dg.datagrid('loaded');
      putocook($.page.fn.cwid, wido);
    }, 250);
  };

  $('#setwidth').linkbutton({
    iconCls: 'icon-template',
    text: 'Auto-Width',
    onClick: $.page.fn.autosize
  });

  $.page.fn.runGo = function (btnEl) {
    if (btnEl && btnEl.length) nodclick(btnEl, 3000);
    var filt = $('form#filters').form('getData');
    var list = [];
    for (var k in filt) list.push(k + ':' + filt[k]);
    putacook($.page.fn.copacook, list);
    var qp = $('#copa').datagrid('options').queryParams || {};
    Object.assign(qp, filt);
    $('#copa').datagrid('reload');
  };

  $('#gofilt').linkbutton({
    iconCls: 'icon-go',
    text: 'Go',
    onClick: function () {
      $.page.fn.runGo($(this));
    }
  });

  $.page.fn.opts = {
    onRowContextMenu: function (e) { return e.preventDefault(); },
    onBeforeLoad: function (qp) {
      if (qp.JOBSTATUS === 'C') {
        if (qp.START_CLOSE === '' || qp.END_CLOSE === '') {
          msgbox('Start/End Close Date cannot be blank if CLOSED Status.');
          return false;
        }
      }
    },
    onLoadSuccess: function () {},
    loadFilter: function (data) {
      if (!data.rows) {
        data = {
          total: data.length,
          rows: data
        };
      }
      return data;
    },
    onBeforeSelect: function () { return true; }
  };

  $('#copa').datagrid($.page.fn.opts);

  $.page.fn.setfilt = function () {
    var filts = getacook($.page.fn.copacook) || [];
    filts.map(function (e) {
      var bits = e.split(':');
      var el = $('form#filters input[comboname=' + bits[0] + ']');
      if (el.length > 0) {
        try { el.combobox('select', bits[1]); }
        catch (err) { cl(err); }
      }
    });
  };

  // Auto-run with default/restored filters as soon as controls are ready.
  setTimeout(function () {
    $.page.fn.runGo($('#gofilt'));
  }, 150);
});
