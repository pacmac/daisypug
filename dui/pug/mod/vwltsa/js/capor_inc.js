/*
  CLS, 171120, 2.2.176
  1. reload the datagrid when add/edit/delete the data.

  PAC 171219, 2.2.177
  1. dev code to allow shift selection for advanced planner. 
  
*/

$( document ).ready(function() {
  
  $('#capor_win').css({width:'600px', height:'400px'}).window({
    closed: true,
    title: 'Resource Capacity Overrides',
    iconCls: 'icon-date',
    onOpen: function(){
      $('#capor').datagrid('editDone');
    } 
  })

  if(!$.dui.ronly) toolbut([
    {
      id:'but_capor',
      iconCls: 'icon-date',
      text: 'Capacity Overides',
      disabled: false,
      noText: true,
      onClick: function(evt){
        var os = $(this).offset();
        cl(os);
        $('#capor_win').window('move',{left:(os.left+0)+'px',top:(os.top+30)+'px'}).window('open');
      }
    },{}
  ]);
  
  $('#capor').datagrid('rowEditor',{
    editor: 'form',
    striped: true,
    rownumbers: true,
    fit: true,
    fitColumns: true,
    
    tbarAppend: $('<div id="capor_res" /><span class="vert-sep" />'),
    
    addData: {
      RES_ID: '#capor_res' 
    },
    
    url:'/',
    __queryParams:{
      _func:'get',
      _dgrid:'y',
      _sqlid:'vwltsa^capor',
      RES_ID:'ALL'
    },
    url:'/?_func=get&_dgrid=y&_sqlid=vwltsa^capor&RES_ID=ALL',
    columns:[[
      {field:'ROWID',hidden:true},
      {field:'TYPE',hidden:true},
      {field:'RES_ID',title:'Resource',width:80},
      {field:'YYMMDD',title:'Date',width:100,editor:'datebox',formatter:function(val){
        if(val && val.length==6) return '20'+val.match(/([0-9]{2})([0-9]{2})([0-9]{2})/).splice(1).join('-');
        else return val;
      }},
      {field:'UNITS',title:'Units',width:50,editor:{type:'numberspinner',options:{min:0,precision:0}}},
      {field:'HOURS',title:'Hours',width:70,editor:{type:'numberspinner',options:{min:0,precision:2,increment:0.25}}},
      
      /*
      {field:'SHIFT_ID',title:'Shift ID',width:80,editor:{
        type:'combobox',
        options: {
          panelHeight: 'auto',
          url: '/?_sqlid=vwltsa^shiftid&_func=get&_combo=y',
        }
      }},
      */
      
      {field:'NOTE',title:'Classification',width:250,editor:{
        type:'combobox',
        options: {
          editable: true,
          data: [
            {text:'Preventative Maintenance',value:'Preventative Maintenance'},
            {text:'Corrective Maintenance',value:'Corrective Maintenance'},
            {text:'Extended Capacity',value:'Extended Capacity'},
            {text:'Public Holiday',value:'Public Holiday'},
            {text:'Cleaning',value:'Cleaning'},
            {text:'Other',value:'Other'}
          ]
        }
      }}
    ]],
    
    onEndEdit: function(idx,row,chg){
      row.YYMMDD = row.YYMMDD.replace(/-/g,'').substring(2);
      var url = "/?_sqlid=vwltsa^capor";
      
      ajaxget(url,row,function(data){
        $('#capor').datagrid('reload');   //CLS, 171120 
      })
    }    
    ,
    //checl the type, if TYPE='MACHINE' , disable the edit and delete button
    onSelect:function(idx,row){
      var dg=$(this);
            if (row.TYPE=='MAINTENANCE'){
        dg.datagrid('options').tbar.dgre_del.linkbutton('disable');
        dg.datagrid('options').tbar.dgre_edit.linkbutton('disable');
      }
  
    },
  });
 
  // this must be defined after the datagrid.
  $('#capor_res').combobox({
    url:'?_func=get&_sqlid=vwltsa^resid2&_combo=y&_cboall=y',
    onSelect: function(rec){
      var url = '/?_func=get&_dgrid=y&_sqlid=vwltsa^capor&RES_ID='+rec.value;
      $('#capor').datagrid('reload',url);   
    }
  });
});  

