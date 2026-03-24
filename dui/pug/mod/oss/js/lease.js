// this must be before cbo data.
$.page.fn.cboselect = function(rec){
  if($.dui.bhave.UNIQUE_LINES=='n') return;
  var dg = $('#dgitems');
  var row = dg.datagrid('getSelected');
  var idx = dg.datagrid('getRowIndex',row);
  var eds = dg.datagrid('getEditors',idx);
  var type = $(eds[0].target).combobox('getValue');
  if(dg.datagrid('findRows',{'TYPE':type}).rows.length > 0) {
    $(this).combobox('clear');
    msgbox(type.replace('^',' - ')+' row already exists.');
  }  
}

$.page.fn.rtype = {
  type: 'combobox',
  options: {
    required: true,
    panelHeight:'auto',
    editable:false,
    url: '/',
    queryParams: {
      _func:'get',
      _sqlid: 'oss^renttype_ids',
      _combo: 'y'
    },
    onSelect: $.page.fn.cboselect
  }
}

$.page.fn.nbox = {
  type: 'numberbox',
  options: {
    required: true,
    value: 0.00,
    precision:2,
    min:0,
  }
}    

$.page.fn.recalc = function(){
  var dg = $('#dgitems'); 
  var rows = dg.datagrid('getRows');
  var tot=0; rows.map(function(row){tot+=parseFloat(row.TOTAL_COST)});
  $('#TOTAL_COST').numberbox('setValue',tot);
}

// Datagrid/Editor Options (static config in JSON, dynamic here)
$.page.fn.dgopts = {
  twoColumns: false,
  editor: 'inline',
  addData:{
    LINE_NO:'$autonum:1',
  },

  editors: {
    TYPE: $.page.fn.rtype,
    QTY: $.page.fn.nbox,
    UNIT_COST: $.page.fn.nbox,
    TOTAL_COST: 'label',
    DESCRIPTION: 'text'
  },

  onBeforeLoad: function(param){
    var fdat = $('form#main').form('getData');
    if(!fdat.RENTAL_ID) return false;
    else param.RENTAL_ID = fdat.RENTAL_ID;
  },

  onEndEdit: function(idx,row,chg){
    row.TOTAL_COST = parseFloat(row.UNIT_COST) * parseFloat(row.QTY);
    $(this).datagrid('updateRow',{index: idx,data:row});
    $.page.fn.saverow(row,function(res){
      $.page.fn.recalc();
    });
  },

  onLoadSuccess: $.page.fn.recalc
}

$.page.fn.saverow = function(row,cb){
  var fdat = $('form#main').form('getData');
  row.RENTAL_ID = fdat.RENTAL_ID;
  var qp = $.extend({
    _sqlid: 'oss^rentline',
    _stamp: 'y'
  },row);
  ajaxget('/',qp,cb)
}

$.page.ready(function(){

  //$('#but_add').on('done',function(){})

  // Main Form Load & Submit
  $('form#main').on('success',function(jq,res){

  }).on('loadDone',function(jq,data){
    setTimeout(function(){
      $('#dgitems').datagrid('load');
    });  
  })
  
  $('#CUSTOMER_ID').combobox({
    onSelect: function(rec){
      $('#CUSTOMER_NAME').textbox('setValue',rec.CUSTOMER_NAME);
      $('#CURRENCY_ID').textbox('setValue',rec.CURRENCY_ID);
    }
  })

  $('#dgitems').datagrid('rowEditor',$.page.fn.dgopts);
  
})