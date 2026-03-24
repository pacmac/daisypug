
$.page.ready(function () {
$.page.fn.dodgrid = function(){
  $('#txgrid').datagrid({
    queryParams: frm2dic($('form#txgrid_filter')),

    onBeforeLoad:function(qp){
      if(!qp.sdate) return false;
    },
    onClickRow:function(idx,dat){
      $(this).data('idx',idx);
      var frm = $('form#parttrans');
      frm.form('state','loading');
      frm.one('loadDone', function() {
        $(this).form('state','edit');
      });
      frm.attr('mode','upd').form('load',dat);
      // Fallback: some flows do not emit loadDone reliably; ensure Save/Delete can enable.
      setTimeout(function () {
        var f = $('form#parttrans');
        var fd = $.data(f[0], 'form');
        if (fd && fd.options && fd.options.state === 'loading') {
          f.form('state', 'edit');
        }
      }, 250);
    },

    onLoadSuccess:function(){
      var frm = $('form#parttrans');
      frm.form('clear');
      // Reset form to idle state (no row selected)
      var frmData = $.data(frm[0], 'form');
      if (frmData) {
        frmData.options.state = 'idle';
        butEn('a', 'page.reset');
      }
    }
  });
}

$(document).ready(function(){

  // Save: set queryParams + update datagrid row before toolbar-plugin submits
  $('#but_save').on('beforeClick', function() {
    var frm = $('form#parttrans');
    var data = frm2dic(frm);
    var dg = $('#txgrid');
    dg.datagrid('updateRow',{index:dg.data('idx'),row:data});
    // Keep TRANSACTION_ID only in form body; duplicating in queryParams turns it into an array payload.
    frm.form('options').queryParams = {_func:"upd",_sqlid:'inv^invtrans'};
  });

  // Delete: set queryParams + intercept reload so only datagrid refreshes (not whole page)
  $('#but_del').on('beforeClick', function() {
    var frm = $('form#parttrans');
    // Keep TRANSACTION_ID only in form body; duplicating in queryParams turns it into an array payload.
    frm.form('options').queryParams = {_func:"del",_sqlid:'inv^invtrans'};
    var origReload = window.reload;
    window.reload = function() {
      window.reload = origReload;
      $('#txgrid').datagrid('reload',frm2dic($('form#txgrid_filter')));
    };
  });

  // After save success: reload datagrid with current filter
  $('form#parttrans').on('done', function() {
    $('#txgrid').datagrid('reload',frm2dic($('form#txgrid_filter')));
  });

  setTimeout(function(){
    $.page.fn.dodgrid();
    $('#txgrid').datagrid('reload',frm2dic($('form#txgrid_filter')));

    $('form#txgrid_filter').form({
      onChange:function(){
        $('#txgrid').datagrid('reload',frm2dic($('form#txgrid_filter')));
      }
    })

  })

})

});  // $.page.ready
