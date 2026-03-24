
/*
  CLS, 171108, 2.2.357
  1, add CUST_NAME into screen and when CUST_ID was selected, populate the CUST_NAME into it;


*/
$.dui.page.dgedit = function(endis){
  $('#but_dg_edit, #but_dg_del').linkbutton(endis);  
}

$.dui.page.clicks = function(evt){
  var txt = $(evt.target).closest('a').linkbutton('options').text;
  var dg = $('#cpdg');
  var dlg = $('#dgedit'); 
  var row = dg.datagrid('getSelected');
  var idx = dg.datagrid('getRowIndex',row);
  var frm = $('form#dgform');
  var head = frm2dic($('form#head'));
 
  switch(txt){
    case 'Add':
      var rows = dg.datagrid('getRows');
      if(!rows.length) var next = 1;
      else var next = parseInt(rows.slice(-1)[0].LINE_NO)+1;
      $('form#dgform input#LINE_NO').numberbox('setValue',next);
      frm.attr('mode','add');
      dlg.dialog('open');
      break;
    
    case 'Delete':
      nodclick($(this));
      if(idx==-1) return;
      confirm(function(yn){
        if(yn) {
          ajaxget('/',{
            '_sqlid':'inv^cprop_item',
            '_func':'del',
            'CP_ID':row.CP_ID,
            'LINE_NO':row.LINE_NO
          },function(res){
            if(res.error) return false;
            dg.datagrid('deleteRow',idx);
            $.dui.page.dgedit('disable');
            grnflash('#but_save');      
          })
        }
      },'Delete selected row ?')       
      break;      
    
    case 'Edit':
      dlg.dialog('open');
      frm.form('load',row).attr('mode','upd');
      break;
      
    case "Save":
      nodclick($(this));
      var data = frm2dic(frm);
      if(!frm.form('validate')) return false;
      data._sqlid = 'inv^cprop_item';
      data._func = frm.attr('mode');
      data.CP_ID = head.CP_ID;  
      ajaxget('/',data,function(res){
        if(res.error) return false;
        if(data._func=='upd') dg.datagrid('updateRow',{index:idx,row:data});
        else dg.datagrid('appendRow',data);
        dlg.dialog('close');
        grnflash('#but_save');
      })
      break;
    
    case "Close":
      $.dui.page.dgedit('disable');
      dlg.dialog('close');
      frm.form('reset');
      break;
  }
}

// global onChange (not .fkey) for form#head
$.dui.page.headChange = function(el,nv,ov){
  butEn('axsd');
  var name  = el.attr('textboxname');
  var fdat = frm2dic($('form#head'));
  switch(name){
    case 'CI_DATE':
      //cl('date');
      break; 
    
  }
  //cl(name+' = '+nv); // debug
}

// Load the datagrid
$.dui.page.dgload = function(fdat){
  $('#cpdg').datagrid('load',{
    'CP_ID':fdat.CP_ID,
    '_func':'get',
    '_sqlid':'inv^cprop_item',
    '_dgrid':'y'
  });
}


$.dui.page.jobmode = function(rec){
  var add=$('#jobadd'), cln=$('#jobclone'), bas=$('#BASE_ID');
  add.hide(); cln.hide(); bas.combobox('readonly',true); 
  
  switch(rec.value){    
    case "SELECT": bas.combobox('readonly',false);break;
    case "CLONE": cln.show();
    case "BLANK": add.show();
  }
}

$( document ).ready(function() {

  $('#CP_ID').combobox('filtertip',{
    default: ['IN-HOUSE'],
    field: 'STATUS',
    data: [
      {name:'IN-HOUSE',text:'IN-HOUSE'},
      {name:'RETURNED',text:'RETURNED'}
    ]
  });
  
  $.dui.page.udfs = {};
  if ($.dui.pdata.udfid)  $.dui.pdata.udfid.map(function(e){if(e.value == $.dui.bhave.UDF_LAYOUT_ID) $.dui.page.udfs=e;})
  $.dui.page.cols = [
    {field:'CP_ID',hidden:true},
    {field:'LINE_NO',title:'#',width:25,fixed:true},
    {field:'SALES_ORDER_ID',title:'Sales Order Ref',width:100,fixed:true},
    {field:'CUST_PO',title:'Cust PO',width:100,fixed:true},
    {field:'CUST_PART_ID',title:'Cust Part #',width:100,fixed:true},
    {field:'PART_ID',title:'Our Part #',width:100,fixed:true},
    {field:'LOCN',title:'Location',width:100,fixed:true},
    {field:'NCR_ID',title:'NCR Ref',width:80,fixed:true},
    {field:'QTY_RECV',title:'Qty',width:35,fixed:true},
    {field:'ACTION',title:'Action',width:100,fixed:true},
    {field:'BASE_ID',title:'Job ID',width:80,fixed:true},
    {field:'COC_ID',title:'COC IDs',width:80,fixed:true,hidden:true},
    {field:'DATE_RETURN',title:'Return Date',formatter:tz2date,width:80,fixed:true,hidden:true}
  ];
  
  for(var k in $.dui.page.udfs){
    var val = $.dui.page.udfs[k];
    if(k.indexOf('UDF_')===0 && val !== '') $.dui.page.cols.push({field:k.replace('UDF_','USER_'),title:val,width:80,hidden:true})
  }
  $.dui.page.cols.push({field:'DESCRIPTION',title:'Description',width:200})
  
  setTimeout(function(){
      
    $('#dgedit').dialog({
      iconCls: 'icon-edit',
      title: 'Edit Item',
      modal:true,
      closed:true,
      width:'780px',
      buttons:[
        {
          iconCls: 'icon-save',
          text:'Save',
          handler: $.dui.page.clicks
        },{
          iconCls: 'icon-cancel',
          text:'Close',
          handler: $.dui.page.clicks
        }
      ],
      
      onOpen: function(){
        var frm = $("form#dgform"); 
        if($.dui.page.udfok) return;
        setudfs($.dui.page.udfs,frm);
        $(this).dialog('resize');
        $.dui.page.udfok = true;
      },
      
      onClose: function(){
        setTimeout(function(){$('#cpdg').datagrid('unselectAll')},250);
        $.dui.page.dgedit('disable');
      } 
    })
    
    // Global Change Handler
    $.each($('form#head input.textbox-f').not('.fkey'),function(){
      var me = $(this);
      var box = me.attr('class').split(' ')[0].split('-')[1];
      me[box]({onChange: function(nv,ov){$.dui.page.headChange(me,nv,ov)}}); 
    })
    
  })

  // Edit Line Events
  $('form#dgform').on('success',function(me,vars){
    var fdat = frm2dic($(this));

  }).on('loadDone',function(me,fdat){ 
    $(this).form('reselect');    
    
  })

  // Header Form Events.
  $('form#head').on('success',function(me,vars){
    var fdat = frm2dic($(this));
    butEn('axd');
    $('#but_dg_add').linkbutton('enable');
    $.dui.page.dgload(fdat);
    
  }).on('loadDone',function(me,fdat){ 
    butEn('axd');
    $('#SALES_ORDER_ID').combobox('reload','/?_func=get&_sqlid=sales^sorefs&_combo=y&CUST_ID='+fdat.CUST_ID);
    $('#cpfiles').datagrid('docFiles',fdat.CP_ID);

    $('#but_dg_add').linkbutton('enable');
    $.dui.page.dgload(fdat);
    $(this).form('reselect');    
  })
 
   $('#DOJOB').combobox({
    panelHeight: 'auto',
    editable:false,
    data:[
      {value:'SELECT',text:'Select Job'},
      {value:'CLONE',text:'New Clone Job'},
      {value:'BLANK',text:'New Blank Job'}
    ],
    
    onSelect:$.dui.page.jobmode
  })
  



  $('#PART_ID').qbe({defid:'part'});

  $("#CUST_ID").combobox({
    url:'/?_func=get&_sqlid=sales^custall&_combo=y'  ,
    onSelect:function(rec){
      $('#CUST_NAME').textbox('setValue',rec.NAME);
      $('#SALES_ORDER_ID').combobox({
        groupField: 'CUST_ID',
        url:'/?_func=get&_sqlid=sales^sorefs&_combo=y&CUST_ID='+rec.value  ,
        onSelect:function(rec){
          $('#CUST_PART_ID').textbox('setValue',rec.CUST_PART_ID);
        }
        
      })   
    },    
  })
  //CLS, 20171108
/*
  $('#CUST_ID').qbe({
    queryParams: {
      _sqlid:'vwltsa^custall_qbe'
    },
    onDemand: true,
    valueField: 'ID',
    fields:[
      {field:'value',title:'Customer ID',editor:'textbox'},
      {field:'NAME',title:'Customer Name',editor:'textbox'},
      {field:'ADDR_1',title:'Address 1',editor:'textbox'},
      {field:'ADDR_2',title:'Address 2',editor:'textbox'},
      {field:'ADDR_3',title:'Address 3',editor:'textbox'},
      {field:'CONTACT_PERSON',title:'Contact',editor:'textbox'},
      {field:'CONTACT_PHONE',title:'Phone',editor:'textbox'},
      {field:'CONTACT_fax',title:'Fax',editor:'textbox'},
      {field:'CONTACT_EMAIL',title:'@',editor:'textbox'},
      {field:'CURRENCY_ID',title:'Currency',editor:'textbox'},
      {field:'GST_ID',title:'GST',editor:'textbox'},
    ],
    onSelect:function(rec){

      $('#CUST_NAME').textbox('setValue',rec.NAME);
    },
    preload:true,
    
  })
*/
  $('#BASE_ID').qbe({
    defid:'job',
    onSelect: function(rec){
      if(!rec) return;
      var cocs = [];
      if($.dui.pdata.bascoc.COC_ID) $.dui.pdata.bascoc = [$.dui.pdata.bascoc];
      $.dui.pdata.bascoc.map(function(e){if(e.WOREF==rec.value) cocs.push(e.COC_ID)});
      $('#COC_ID').textbox('setValue',cocs.join(','));
    }  
  })
  
  $('#ACTION').combobox({
    panelHeight: 'auto',
    editable:false,
    data: JSON.parse($.dui.bhave.ACTION),
    onSelect: function(rec){
      if(rec.source=='_NONE_') $('#jobdiv').hide(); 
      else {
        $('#jobdiv').show();
        $('#BASE_ID').combobox('reload','/?_func=get&_sqlid=vwltsa^basid_filt&_combo=y&WO_CLASS='+rec.source);
      }
    }
  })
  
  $('#cpdg').datagrid({
    striped:true,
    singleSelect: true,
    method: 'get',
    //url:'/?_sqlid=vwltsa^cprop_item&_func=get&_dgrid=y',
    url:'/',
    fit:true,
    fitColumns:true,
    columns:[$.dui.page.cols],
    
    toolbar: [{
      id:'but_dg_add',
      text: 'Add',
      iconCls: 'icon-add',
      disabled: true,
      handler: $.dui.page.clicks
    },{
      id: 'but_dg_edit',
      text: 'Edit',
      iconCls: 'icon-edit',
      disabled: true,
      handler: $.dui.page.clicks
    },{
      id: 'but_dg_del',
      text: 'Delete',
      iconCls: 'icon-delete',
      disabled: true,
      handler: $.dui.page.clicks
    }],
    
    onLoadSuccess:function(){
      $(this).datagrid('fitColumns');
    },
    
    onSelect: function(){
      $.dui.page.dgedit('enable');
    },
    
    onDblClickRow: function(idx,row){
      $('a#but_dg_edit').click();    
    }

    
  })
  
})