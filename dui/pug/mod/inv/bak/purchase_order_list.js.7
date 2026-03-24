
$.page.ready(function () {
/*
  
  PAC 180129 2.2.55
  1. Added 'Hide Closed' Filter
  
  
*/

/* ##### DOM IS READY ##### */

 

$.page.fn.opnref=function(){
  ajaxget('/',{_sqlid:'vwltsa^opnrefs',_func:'get',_combo:'y',_subcon:'y',one_pol_one_opn:'y'},function(rs){
    $('#_dgform > form input[textboxname="WOREF"]').combobox('loadData',rs);
  });
}

$.page.fn.part=function(){
  ajaxget('/',{_sqlid:'inv^partid',_func:'get',_combo:'y'},function(rs){
    $('#_dgform > form input[textboxname="PART_ID"]').combobox('loadData',rs);
  });
}

$(document).ready(function(){
    $.page.fn.opnref();
    $.page.fn.part();
    $('#sv_closed').click();
    $('#po_closed').click();    
      $('#PO_LIST_DG').datagrid({
   
        pagination: true,
        pagePosition: 'top',
        pageList: [25,50,100,250],
        pageSize:25,
        url:'/',
        queryParams: {
          _sqlid  : 'inv^polist',
          _func   : 'get',
          PO_TYPE :'G'

        },
        method:'get',
        rownumbers: true,      
        
        //editor: 'form',
        fitColumns:true,
        singleSelect:true,
        striped:true,
        fit:true,      
        //addData: {
        //  AMOUNT:0,
        //  QTY:0
        //},
        columns:[[
          {field:'ROWID',hidden:true},
          {field:'PO_ID',title:'PO ID',width:100,fixed:true,editor:{type:'textbox',options:{required: true}} },
          {field:'LINE_NO',title:'Line #',width:35,fixed:true, editor:{type: 'numberspinner',options: {required: true,min:1,value: 0,precision: 0}}},
          {field:'LINE_STATUS',title:'Status',width:80,fixed:true, editor:{type: 'combobox',options: {data:[{value:'R',text:'Released'},{value:'C',text:'Closed'},{value:'H',text:'On-Hold'}], required: true}}},
          {field:'EST_RECEIPT_DATE',title:'Want Date',width:80,fixed:true,editor:{type:'datebox',options:{required:true}},formatter:eui.date},
          {field:'QTY',title:'Reqd', align:'right',width:60,fixed:true,formatter: function(val){return val || 0}, editor:{
            type: 'numberspinner',options: {required: true,min:0,value: 0,precision: 2}
          }},
          {field:'QTY_RECV',title:'Recv',width:60,fixed:true,_editor:{type:'numberbox',options: {readonly: true,precision:0,value:2 }} },
          {field:'PART_ID',title:'Part ID',width:150,fixed:true,editor:{
            type:'combobox',
            options: {
              _url: '?_func=get&_sqlid=inv^partid&_combo=y',
              required: true,
              panelWidth:200,
              init: false,
              validType:['inList'],
              onSelect: function(rec){
                var cbo = $(this);
                var dg = $('#PO_LIST_DG');
                var rows = dg.datagrid('getRows');
                var opt = dg.datagrid('options');
                if(opt) {
                  var form = $(opt.tbar.form);
                  form.find('input[textboxname="DESCRIPTION"]').textbox('setValue',rec.DESCRIPTION);
                  form.find('input[textboxname="UOM_ID"]').textbox('setValue',rec.UOM_ID);
                  form.find('input[textboxname="PRODUCT_CODE"]').textbox('setValue',rec.PRODUCT_CODE);
                }
              }
            }
          }},
          {field:'UOM_ID',title:'UOM',width:60,fixed:true,editor:{type:'textbox',options: {readonly: true }} },
          {field:'PRODUCT_CODE',title:'Prod Code',width:80,fixed:true,editor:{type:'textbox',options: {readonly: true }} },
          {field:'DESCRIPTION',title:'Description',width:200,fixed:false,editor:{type:'textbox',options: {readonly: true  }}}   

          
        ]],
  
        onEndEdit: function(idx,row,chg){
            var url = "/?_sqlid=inv^polist";
            var data = clone(row);
            data.PO_TYPE='G';
            var dels = ['DESCRIPTION','UOM_ID','PRODUCT_CODE']; dels.map(function(e){delete data[e];})
            ajaxget(url,data,function(data){
              $.page.fn.opnref();
              $('#PO_LIST_DG').datagrid('reload');  
            }) 
        },

    
        
      })
      
      // 2.2.55 - New Closed Filter   
      var dgtb = $('#PO_LIST_DG').datagrid('options').toolbar;
      //dgtb.append('<a href="#" id="po_closed"></a>');
      
      $('#po_closed').linkbutton({
        text:'Show Closed',
        toggle:true,
        onClick:function(){
          var sel = $(this).linkbutton('options').selected;
          var dg = $('#PO_LIST_DG');
          
          if(sel){
            var rows = dg.datagrid('findRows',{'LINE_STATUS':['Released']});
            rows.idxs.map(function(e){dg.datagrid('hideRow',e)});
          }
          else {
            
            var rows = dg.datagrid('findRows',{'LINE_STATUS':['Closed']});
            rows.idxs.map(function(e){dg.datagrid('hideRow',e)});
          }
          //dg.datagrid('load');   
        }  
      })
      
      
      $('#PO_LIST_SV').datagrid('rowEditor',{


        pagination: true,
        pagePosition: 'top',
        pageList: [25,50,100,250],
        pageSize:25,
        url:'/',
        queryParams: {
          _sqlid  : 'inv^polist',
          _func   : 'get',
          PO_TYPE :'S'

        },
        method:'get',
        rownumbers: true,      
        //editor: 'form',
        fitColumns:true,
        singleSelect:true,
        striped:true,
        fit:true,      
        //addData: {
        //  AMOUNT:0,
        //  QTY:0
        //},
        columns:[[
          {field:'ROWID',hidden:true},
          {field:'PO_ID',title:'PO ID',width:100,fixed:true,editor:{type:'textbox',options:{required: true}} },
          {field:'LINE_NO',title:'Line #',width:35,fixed:true, editor:{type: 'numberspinner',options: {required: true,min:1,value: 0,precision: 0}}},
          {field:'LINE_STATUS',title:'Status',width:80,fixed:true, editor:{type: 'combobox',options: {data:[{value:'R',text:'Released'},{value:'C',text:'Closed'},{value:'H',text:'On-Hold'}], required: true}}},
          {field:'EST_RECEIPT_DATE',title:'Want Date',width:80,fixed:true,editor:{type:'datebox',options:{required:true}},formatter:eui.date},
          {field:'WOREF',title:'Opn Ref',width:150,fixed:true,editor:{
            type:'combobox',
            options: {
              __url: '?_func=get&_sqlid=vwltsa^opnrefs&_combo=y&_subcon=y&one_pol_one_opn=y',
              required: true,
              panelWidth:200,
              init: true,
              validType:['inList'],
            }
          }},
          {field:'AMOUNT',title:'Amount',width:40,fixed:false,editor:{type: 'numberspinner',options: {required: true,min:0,value: 0,precision: 2}}},

        ]],
  
        onEndEdit: function(idx,row,chg){
            var url = "/?_sqlid=inv^polist";
            var data = clone(row);
            data.PO_TYPE='S';
            var dels = ['DESCRIPTION','UOM_ID','PRODUCT_CODE']; dels.map(function(e){delete data[e];})
            ajaxget(url,data,function(data){
              $.page.fn.opnref();
              $('#PO_LIST_SV').datagrid('reload');  
            }) 
        },  
      })



      // 2.2.55 - New Closed Filter   
      var dgtb = $('#PO_LIST_SV').datagrid('options').toolbar;
      //dgtb.append('<a href="#" id="sv_closed"></a>');
      
      $('#sv_closed').linkbutton({
        text:'Hide Closed',
        toggle:true,
        onClick:function(){
          var sel = $(this).linkbutton('options').selected;
          var dg = $('#PO_LIST_SV');
          if(sel){
            var rows = dg.datagrid('findRows',{'LINE_STATUS':['Closed']});
            rows.idxs.map(function(e){dg.datagrid('hideRow',e)});
          }
          else dg.datagrid('load');   
        }  
      })
      
})

});  // $.page.ready