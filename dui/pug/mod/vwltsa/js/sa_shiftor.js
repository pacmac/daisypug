
$.page.ready(function () {
/*
  PAC 171220 2.2.1
  1. New Page  
  
  
*/

$.page.fn.time = {
  type:'timespinner',
  options:{
    value:'0',
    _required:true
  }
}

$.page.fn.timefmt = function(val){
  if(!val) return '-';
}

$.page.fn.datefmt = function(dstr){
  var b = dstr.match(/([0-9]{4})([0-9]{2})([0-9]{2})/);
  if (!b) return '';
  return (b[1]+'-'+b[2]+'-'+b[3]);
}

$('#dgoride').datagrid({
  fitColumns:true,
  url:'/',
  
  queryParams:{
    _sqlid:'vwltsa^shiftor',
    _func:'get',
    _dgrid: 'y'
  },
  
  columns:[
  [
    {field:'SHIFT_ID',title:'Date',width:100,fixed:true,editor:{type:'datebox',options:{onChange:function(){}}},rowspan:2,formatter:$.page.fn.datefmt},
    {field:'DESCRIPTION',title:'Description',width:150,fixed:true,editor:'textbox',rowspan:2},
    {field:'TYPE',title:'Type',width:150,fixed:true,rowspan:2},
    {field:'RESOURCE_ID',title:'Resource ID',width:100,fixed:true,
      editor:{
      type:'combobox',
      options:{
        _readonly:true,
        url:'/?_func=get&_sqlid=vwltsa^resid&_combo=y&_cboall=y'
    }},rowspan:2},      
    {title:'Shift',colspan:2},
    {title:'Meal',colspan:2},
    {title:'Break #1',colspan:2},
    {title:'Break #2',colspan:2},
    {title:'Break #3',colspan:2},
    {title:'Break #4',colspan:2},
    {title:'Break #5',colspan:2},
    {title:'Break #6',colspan:2},
    {title:'Break #7',colspan:3},
    
  ],
  
  [
    
    {field:'SHIFT_START',title:'Start',width:70,fixed:true,editor:$.page.fn.time,align:'center',formatter:$.page.fn.timefmt},
    {field:'SHIFT_END',title:'End',width:70,fixed:true,editor:$.page.fn.time,align:'center',formatter:$.page.fn.timefmt},
    
    {field:'MEAL_START',title:'Start',width:70,fixed:true,editor:$.page.fn.time,align:'center',formatter:$.page.fn.timefmt},
    {field:'MEAL_END',title:'End',width:70,fixed:true,editor:$.page.fn.time,align:'center',formatter:$.page.fn.timefmt},

    {field:'BREAK1_START',title:'Start',width:70,fixed:true,editor:$.page.fn.time,align:'center',formatter:$.page.fn.timefmt},
    {field:'BREAK1_END',title:'End',width:70,fixed:true,editor:$.page.fn.time,align:'center',formatter:$.page.fn.timefmt},     
    
    {field:'BREAK2_START',title:'Start',width:70,fixed:true,editor:$.page.fn.time,align:'center',formatter:$.page.fn.timefmt},
    {field:'BREAK2_END',title:'End',width:70,fixed:true,editor:$.page.fn.time,align:'center',formatter:$.page.fn.timefmt}, 

    {field:'BREAK3_START',title:'Start',width:70,fixed:true,editor:$.page.fn.time,align:'center',formatter:$.page.fn.timefmt},
    {field:'BREAK3_END',title:'End',width:70,fixed:true,editor:$.page.fn.time,align:'center',formatter:$.page.fn.timefmt},

    {field:'BREAK4_START',title:'Start',width:70,fixed:true,editor:$.page.fn.time,align:'center',formatter:$.page.fn.timefmt},
    {field:'BREAK4_END',title:'End',width:70,fixed:true,editor:$.page.fn.time,align:'center',formatter:$.page.fn.timefmt},

    {field:'BREAK5_START',title:'Start',width:70,fixed:true,editor:$.page.fn.time,align:'center',formatter:$.page.fn.timefmt},
    {field:'BREAK5_END',title:'End',width:70,fixed:true,editor:$.page.fn.time,align:'center',formatter:$.page.fn.timefmt},

    {field:'BREAK6_START',title:'Start',width:70,fixed:true,editor:$.page.fn.time,align:'center',formatter:$.page.fn.timefmt},
    {field:'BREAK6_END',title:'End',width:70,fixed:true,editor:$.page.fn.time,align:'center',formatter:$.page.fn.timefmt},
    
    {field:'BREAK7_START',title:'Start',width:70,fixed:true,editor:$.page.fn.time,align:'center',formatter:$.page.fn.timefmt},
    {field:'BREAK7_END',title:'End',width:70,fixed:true,editor:$.page.fn.time,align:'center',formatter:$.page.fn.timefmt},
    {field:'_func',hidden:true,width:0},
    {field:'ROWID',hidden:true,width:0},
 
  ]],

  onEndEdit: function(idx,row,chg){
    if (row.TYPE!='MAINTENANCE'){
      var opt = $(this).datagrid('options');
      row.SHIFT_ID=row.SHIFT_ID.replace(/-/g,'');
      ajaxget('/?_sqlid=vwltsa^shiftor',row,function(data){
        $('#dgoride').datagrid('reload');
        cl(data);
      })
    }
  } ,
      //checl the type, if TYPE='MACHINE' , disable the edit and delete button
      onSelect:function(idx,row){
        var dg=$(this);
        if (row.TYPE=='MAINTENANCE'){
          dg.datagrid('options').tbar.dgre_del.linkbutton('disable');
          dg.datagrid('options').tbar.dgre_edit.linkbutton('disable');
        }
    
      },
}).datagrid('rowEditor',{
  editor: 'inline'
});

});  // $.page.ready
