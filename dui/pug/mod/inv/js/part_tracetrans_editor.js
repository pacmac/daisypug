
$.page.ready(function () {
$('#txgrid').datagrid({
  queryParams: frm2dic($('form#txgrid_filter')),
  onBeforeLoad: function(qp) {
    if (!qp.sdate) return false;
  },
  onClickRow: function(idx, dat) {
    $(this).data('idx', idx);
    var frm = $('form#parttrans');
    frm.form('state', 'loading');
    frm.one('loadDone', function() {
      $(this).form('state', 'edit');
    });
    frm.attr('mode', 'upd').form('load', dat);

    for (var key in dat) {
      var m = key.match(/^TRACE_USER_(\d+)_LBL$/);
      if (m) {
        var num = m[1];
        var fitem = $('div#traceprop div.fitem#TRACE_USER_' + num + '_LBL');
        var label = fitem.find('label');
        if (dat[key] != '') {
          label.text(dat[key].replace('*', ''));
          fitem.show();
        } else {
          fitem.hide();
        }
      }
    }
  },
  onLoadSuccess: function() {
    var frm = $('form#parttrans');
    frm.form('clear');
    var frmData = $.data(frm[0], 'form');
    if (frmData) {
      frmData.options.state = 'idle';
      butEn('a', 'page.reset');
    }
    // hide all trace fields on new load
    $('div#traceprop div.fitem').hide();
  }
});

$(document).ready(function() {

  // Save: set queryParams + update datagrid row before toolbar-plugin submits
  $('#but_save').on('beforeClick', function() {
    var frm = $('form#parttrans');
    var data = frm2dic(frm);
    var dg = $('#txgrid');
    dg.datagrid('updateRow',{index:dg.data('idx'),row:data});
    // Keep TRACE_ID in form body; duplicating in queryParams can turn it into an array payload.
    frm.form('options').queryParams = {_func:"upd",_sqlid:'inv^part_trace'};
  });

  // Delete: set queryParams and let toolbar plugin submit the form
  $('#but_del').on('beforeClick', function() {
    var frm = $('form#parttrans');
    // Keep TRACE_ID in form body; duplicating in queryParams can turn it into an array payload.
    frm.form('options').queryParams = {_func:"del",_sqlid:'inv^part_trace'};
  });

  // After save/delete success: reload datagrid with current filter
  $('form#parttrans').on('done', function() {
    $('#txgrid').datagrid('reload', frm2dic($('form#txgrid_filter')));
  });

  $('form#txgrid_filter').form({
    onChange: function() {
      $('#txgrid').datagrid('reload', frm2dic($('form#txgrid_filter')));
    }
  });

});

});  // $.page.ready
