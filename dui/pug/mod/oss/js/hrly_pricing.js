// this must be before cbo data.
$.page.fn.cboselect = function(rec){
  var dg = $('#dgitems');
  var row = dg.datagrid('getSelected');
  var idx = dg.datagrid('getRowIndex',row);
  var eds = dg.datagrid('getEditors',idx);
  var cls = $(eds[0].target).combobox('getValue');     
  if(dg.datagrid('findRows',{'WO_CLASS':cls}).rows.length > 0) {
    $(this).combobox('clear');
    msgbox(cls.replace('^',' - ')+' row already exists.');
  } 
}

// Numberbox Editor
$.page.fn.nbox = {
  type: 'numberbox',
  options: {
    required: true,
    value: 0.00,
    precision:2,
    min:0,
  }
}

// JOB Class
$.page.fn.jcls = {
  type: 'combobox',
  options: {
    required: true,
    panelHeight:'auto',
    editable:false,
    url: '/',
    queryParams: {
      _func:'get',
      _sqlid: 'vwltsa^wocid',
      _combo: 'y'
    },
    onSelect: $.page.fn.cboselect
  }
}

// Datagrid/Editor Options (static config in JSON, dynamic here)
$.page.fn.dgopts = {
  twoColumns: false,
  editor: 'inline',

  addData:{
    CUSTOMER_ID: ''
  },

  editors: {
    WO_CLASS: $.page.fn.jcls,
    RATE_HOUR: $.page.fn.nbox
  },

  onBeforeLoad: function(param){
    var fdat = $('form#main').form('getData');
    if(!fdat.CUSTOMER_ID) return;
    else param.CUSTOMER_ID = fdat.CUSTOMER_ID;
  },

  onEndEdit: function(idx,row,chg){
    $.page.fn.saverow(row,function(res){
      //cl(res);
    });
  }
}

$.page.fn.saverow = function(row,cb){
  var qp = $.extend({
    _sqlid: 'oss^hrly_price_ln',
    _stamp: 'y',
  },row);
  
  //return cl(qp);
  
  ajaxget('/',qp,cb)
}

$.page.ready(function(){
  
  // Main Form Load & Submit
  $('form#main').on('success',function(jq,res){

  }).on('loadDone',function(jq,data){
    setTimeout(function(){
      $.page.fn.dgopts.addData.CUSTOMER_ID = data.CUSTOMER_ID;
      $('#dgitems').datagrid('load');
    });  
  })
  
  
  $('#dgitems').datagrid('rowEditor',$.page.fn.dgopts);
})
