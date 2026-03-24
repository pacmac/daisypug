
$.page.ready(function () {
/*
  CLS, 180208, 2.2.169
  added Part ID qbe and Product Code combobox
  
*/
$.page.fn.docref = function(val,row){

	if(val)var v = val.replace(/\^/g,'.');
	else return '';
  return v;
}


/*
$('#pth').treegrid({
  rownumbers: true,
  lines:true,
  idField: 'PART_ID',
  treeField: 'PART_ID',
  queryParams: frm2dic($('form#gFilter')),
  url:'/?_sqlid=inv^part_trace_history&_func=get',
  columns: [[
    {field:"PART_ID", title:"Part ID", width:80, fixed:true},
    {field:"TRANSACTION_ID", title:"Tx ID", width:80, fixed:true},
    {field:"LEVEL_NO", title:"Levl", width:50, fixed:true},
    {field:"TRANS_TYPE", title:"Tx Type", width:100, fixed:true},
    {field:"TRACE_ID", title:"Trace ID", width:100, fixed:true},
    {field:"TRANSACTION_DATE", title:"Tx Date", formatter:eui.date, width:80, fixed:true},
    {field:"WOREF", title:"WOREF", width:200, fixed:true},
  ]]
,
onLoadSuccess:function(data){


    return data;

   
 } ,
})
*/
$('#pth').datagrid({
  toolbar:'#tbar',
  fit:true,
  fitColumns:true,
  queryParams: frm2dic($('form#gFilter')),
  url:'/?_sqlid=inv^part_trace_history&_func=get',
  checkOnSelect:false,
  singleSelect:true,
  columns: [[
      {field:"PART_ID_IN", title:"In Part ID", width:80, fixed:true},
      {field:"TRANSACTION_ID_IN", title:"In Tx ", width:50, fixed:true},
      {field:"TRANS_TYPE_IN", title:"In Tx Type", width:50, fixed:true},
      {field:"TRACE_ID_IN", title:"In Trace ID", width:100, fixed:true},
      {field:"QTY_IN", title:"In Qty", width:30, fixed:true},
      {field:"TRANSACTION_DATE_IN", title:"In Tx Date", formatter:eui.date, width:80, fixed:true},
      {field:"WOREF_IN", title:"In WOREF", width:120, fixed:true,formatter:$.page.fn.docref},
      {field:"PART_ID_OUT", title:"Out Part ID", width:80, fixed:true},
      {field:"TRANSACTION_ID_OUT", title:"Out Tx ", width:50, fixed:true},
      {field:"TRANS_TYPE_OUT", title:"Out Tx Type", width:50, fixed:true},
      {field:"TRACE_ID_OUT", title:"Out Trace ID", width:100, fixed:true},
      {field:"QTY_OUT", title:"Out Qty", width:30, fixed:true},
      {field:"TRANSACTION_DATE_OUT", title:"Out Tx Date", formatter:eui.date, width:80, fixed:true},
      {field:"WOREF_OUT", title:"Out WOREF", width:120, fixed:true,formatter:$.page.fn.docref},
    ]]
  ,
  onLoadSuccess:function(data){
   // console.log(data)
  }  ,
  onBeforeLoad: function(){
    setTimeout(function(){
      var a=$('#PART_ID_').textbox('getValue');
      //console.log(a);
    })

    //return false;  
  },
}).datagrid('columns',$('#colsel'));

$(document).ready(function(){
    
  $('form#gfilter #PART_ID_').qbe({
    defid:'part',
   // onSelect:function(row){
     // console.log(row);
     // $('form#gfilter #PCODE_').combobox('setValue',row.PRODUCT_CODE)
   // }
  
  })
 
  $('form#gfilter').form({
    onChange:function(){
      $('#pth').datagrid('reload',frm2dic($('form#gfilter')));  
      //$('#pth').treegrid('reload',frm2dic($('form#gfilter')));  
    }
  })    

})

});  // $.page.ready