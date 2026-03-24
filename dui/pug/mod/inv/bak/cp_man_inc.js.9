
$.page.ready(function () {
$.page.fn.status = function(){
  var opt = $('#otddg').datagrid('options');
  //opt.tbar.dgre_add.hide();
  //opt.tbar.dgre_del.hide();
  //opt.tbar.dgre_edit.hide();

  $('#otdopen').linkbutton('enable'); 
}



$('#otdwin').window({
  minimizable: false,
  draggable: true,
  modal:false,
  onOpen: function(){
    //var data = $('#cpdg').datagrid('getData');
        var row = $('#cpdg').datagrid('getSelected');

          var data1 ={
            _sqlid:'inv^cprop_items_return',
            _func: 'get',
            CP_ID: row.CP_ID,
            CP_LINE_NO:row.LINE_NO,
            _dgrid:'y'
          }
    
    ajaxget('/',data1,function(rs){
        $('#otddg').datagrid('loadData',rs); 
    }) 

  },
  
  onBeforeClose: function(){
    var opt = $('#otddg').datagrid('options');
    if(!opt.tbar.dgre_ok.hasClass('l-btn-disabled')){
      beep('error'); 
      alert('Please finish editing.')
      return false;  
    }
  }
  
})

$('#otddg').datagrid('rowEditor',{
    editor: 'form',
    fitColumns:true,
    singleSelect:true,
    striped:true,
    fit:true,  
  addData:{
    LINE_NO:'$autonum:1',
    CP_ID: '#CP_ID',
  },   
  columns: [[
    {field:'CP_ID',title:'CP ID ', width:100,hidden:true},
    {field:'CP_LINE_NO',title:'CP Line#', width:50,hidden:true},
    {field:'LINE_NO',title:'#', width:30,fixed:true,align:'center'},
    {field:'QTY_RETURN',title:'Qty Return ', width:20, fixed:false, editor:{type:'numberspinner',options:{required:true,min:1,value: 0,precision: 2}}},
    {field:'DATE_RETURN',title:'Date Return ',width:30,fixed:false,formatter:eui.date,editor:{type:'datebox',options:{required:true}}},
    
  ]]
}).datagrid({

  onEndEdit: function(idx,row,chg){



    var mainrow = $('#cpdg').datagrid('getSelected');
    row._sqlid='inv^cprop_items_return';
    row.CP_LINE_NO=mainrow.LINE_NO;
    row.CP_ID=row.CP_ID;
    row.LINE_NO=row.LINE_NO;
    row.QTY_RETURN=row.QTY_RETURN;
    row.DATE_RETURN=row.DATE_RETURN ;   

    var qtyRecv=mainrow.QTY_RECV;

    var ttlQtyReturn=0;
    $(this).datagrid('getRows').map(function(e){
      var qtyReturn=(e.QTY_RETURN)*1;
      ttlQtyReturn=ttlQtyReturn+qtyReturn;
    });

   if(ttlQtyReturn > qtyRecv) {
     msgbox('Quantity returned,'+ttlQtyReturn+' exceeds received,'+qtyRecv);
      $('#otddg').datagrid('destroy');
   }
   else {
     ajaxget('/',row,function(rs){
    	if (rs.error) msgbox(rs.msg);
      $('#otddg').datagrid('reload');
    })       
   }

      
  },

  
}); 

$(document).ready(function(){
  
  toolbut([
    {
      id: 'otdopen',
      iconCls: 'icon-gantt',
      text: 'Return',
      disabled: true,
      noText: false,
      onClick:function(){$('#otdwin').window('open')}
    },

  ])
  
  $.page.fn.status();

})

});  // $.page.ready
