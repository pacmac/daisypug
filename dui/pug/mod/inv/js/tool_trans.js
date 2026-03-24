window.fmtTransacted = function (val) {
  var checked = val && val !== '0' ? ' checked' : '';
  return '<input type="checkbox" class="checkbox checkbox-sm checkbox-success dg-check" data-field="TRANSACTED" data-on="1" data-off="0"' + checked + '>';
};

window.fmtInvalid = function (val) {
  var checked = val && val !== '0' ? ' checked' : '';
  return '<input type="checkbox" class="checkbox checkbox-sm checkbox-error dg-check" data-field="INVALID" data-on="-1" data-off="0"' + checked + '>';
};

$.page.ready(function () {
  var dg = $('#tool_trans');

  dg.datagrid({});

  dg.on('click', '.dg-check', function (e) {
    e.stopPropagation();
    var cb = $(this);
    var tr = cb.closest('tr');
    var row = tr[0]._rowData;
    if (!row) return;

    var field = cb.data('field');
    var onVal = String(cb.data('on'));
    var offVal = String(cb.data('off'));
    row[field] = cb.is(':checked') ? onVal : offVal;

    var data = JSON.parse(JSON.stringify(row));
    data._func = 'upd';
    data.TRANSACTION_DATE = ms2date(data.TRANSACTION_DATE);
    $.dui.ajax.ajaxget('/?_sqlid=inv^tool_tx', data, function () {
      dg.datagrid('reload');
    });
  });

  dg.datagrid('load', { _func: 'get', _sqlid: 'inv^tool_tx' });
});
