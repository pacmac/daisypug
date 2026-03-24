$.page.fn.class = function(rec){
  const form = $('form#main');
  var fields = form.form('getData');
  var offs = rec.QI_COLS;

  for (var fn in fields) {
    const inp = form.find(`input[name="${fn}"]`);
    if (offs.indexOf(fn) > -1) inp.textbox('disable');
    else inp.textbox('enable');
  }
};

$.page.fn.add = function(){
  const cdata = $('#ITEM_ID').combobox('getData');
  $('.dyn').each(function(){
    const me = $(this);
    cl(me);
  });
};

$.page.ready(function () {
  $('#SOURCE').combobox({
    groupField: 'PART_CLASS_ID',
    url: '/',
    queryParams: {
      _sqlid: 'inv^partids',
      _func: 'get',
      ALLOW_CONSUMABLE_PARTS: 'N'
    }
  });

  $('#but_add').on('done', $.page.fn.add);

  $('#CLASS').combobox({
    data: $.page.fn.pdata,
    editable: false,
    onSelect: function(item){
      $.page.fn.class(item);
    }
  });

  $('#ITEM_ID').combobox('filtertip',{
    default: $.page.fn.pdata,
    field: 'CLASS',
    data: $.page.fn.pdata
  });

  $('form#main').on('loadDone', function(){
    $('#CLASS').combobox('reselect');
  });
});
