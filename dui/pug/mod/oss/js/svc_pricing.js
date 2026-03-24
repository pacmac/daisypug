// this must be before cbo data.
$.page.fn.cboselect = function(rec){
  var dg = $('#dgitems');
  var row = dg.datagrid('getSelected');
  var idx = dg.datagrid('getRowIndex',row);
  var eds = dg.datagrid('getEditors',idx);
  var type = $(eds[0].target).combobox('getValue');
  var cls = $(eds[1].target).combobox('getValue');
  var ref = type+'^'+cls;
  if(dg.datagrid('findRows',{'_TYPE_CLASS':ref}).rows.length > 0) {
    $(this).combobox('clear');
    msgbox(ref.replace('^',' - ') + ' row already exists.');
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

// Service Type
$.page.fn.stype = {
  type: 'combobox',
  options: {
    required: true,
    panelHeight:'auto',
    editable:false,
    url: '/',
    queryParams: {
      _func:'get',
      _sqlid: 'oss^svctype_ids',
      _combo: 'y'
    }, 
    onSelect: $.page.fn.cboselect
  }
}

// Service Class
$.page.fn.scls = {
  type: 'combobox',
  options: {
    required: true,
    panelHeight:'auto',
    editable:false,
    url: '/',
    queryParams: {
      _func:'get',
      _sqlid: 'oss^svccls_ids',
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
    SERVICE_TYPE: $.page.fn.stype,
    SERVICE_CLASS: $.page.fn.scls,
    RATE_PIECE: $.page.fn.nbox,
    RATE_HOUR: $.page.fn.nbox
  },

  onBeforeLoad: function(param){
    var fdat = $('form#main').form('getData');
    if(!fdat.CUSTOMER_ID) return;
    else param.CUSTOMER_ID = fdat.CUSTOMER_ID;
  },

  loadFilter:function(data){
    data.rows.map(function(row){row._TYPE_CLASS = row.SERVICE_TYPE +'^'+ row.SERVICE_CLASS});
    return data;
  },

  onEndEdit: function(idx,row,chg){
    $.page.fn.saverow(row,function(res){
      //cl(res);
    });
  }
}

$.page.fn.saverow = function(row,cb){
  var qp = $.extend({
    _sqlid: 'oss^svc_price_ln',
    _stamp: 'y',
  },row);
  
  ajaxget('/',qp,cb)
}

$.page.ready(function(){
  
  // Main Form Load & Submit
  $('form#main').on('success',function(jq,res){
    
  }).on('loadDone',function(jq,data){
    butEn('dxs');
    setTimeout(function(){
      $.page.fn.dgopts.addData.CUSTOMER_ID = data.CUSTOMER_ID;
      $('#dgitems').datagrid('load');
    });  
  })
  
  
  $('#dgitems').datagrid('rowEditor',$.page.fn.dgopts);
})
