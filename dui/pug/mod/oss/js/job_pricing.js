// this must be before cbo data.
$.page.fn.cboselect = function(rec){
  var dg = $('#dgitems');
  var row = dg.datagrid('getSelected');
  var idx = dg.datagrid('getRowIndex',row);
  var eds = dg.datagrid('getEditors',idx);
  var part = $(eds[0].target).combobox('getValue');
  var cls = $(eds[1].target).combobox('getValue');
  var ref = part +'^'+ cls;
  if(dg.datagrid('findRows',{'_PART_CLASS':ref}).rows.length > 0) {
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

$.page.fn.part = {
  type: 'combobox',
  options: {
    required: true,
    panelWidth: 200,
    editable:false,
    url: '/',
    queryParams: {
      _func:'get',
      _sqlid: 'vwltsa^partid',
      _combo: 'y'
    },
    onSelect: $.page.fn.cboselect
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
    PART_ID: $.page.fn.part,
    WO_CLASS: $.page.fn.jcls,
    RATE_PIECE: $.page.fn.nbox
  },

  loadFilter:function(data){
    data.rows.map(function(row){row._PART_CLASS = row.PART_ID+'^'+row.WO_CLASS});
    return data;
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
    _sqlid: 'oss^job_price_ln',
    _stamp: 'y',
  },row);
  
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