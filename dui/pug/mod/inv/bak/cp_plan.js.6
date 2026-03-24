
$.page.ready(function () {
/*
return `<a href="javascript:newtab('${url}');"><span>${val}</span></a>`;
  
*/
$.page.fn.cpref = function(val,row){
  var cls = 'cp';
    if(val)var v = val.replace(/\^/g,'.');
    else return '';
    var docid=v.split('.');
    var url="inv^cp_man&CP_ID="+docid[0]; 
    if (docid[0]=='CP TBA')return "<span class='"+cls+"'>"+v+"</span></a>";
    else return `<a href="javascript:newtab('${url}');"><span class='"+cls+"'>${v}</span></a>`;
  }

$.page.fn.ddref = function(val,row){

	if(val)var v = val.replace(/\^/g,'.');
	else return '';
  var docid=v.split('.');
  var cls = 'demand';
 
  return "<span class='"+cls+"'>"+v+"</span></a>";
}
$.page.fn.ssref = function(val,row){
    if(val)var v = val.replace(/\^/g,'.');
    else return '';
    var docid=v.split('.');
    var cls = 'supply';
    var url="vwltsa^sa_jobman&WOREF="+docid[0]; 
    //return "<span class='"+cls+"'>"+v+"</span></a>";
    return `<a href="javascript:newtab('${url}');"><span class='"+cls+"'>${v}</span></a>`;
  }
$.page.fn.integer = function(val,row){
  var v = eui.integer(val);
  if(v<0) return '<span class="negative">'+v+'</span>'; 
  if (row.CP_REF=='CP TBA' && row.SUPPLY_ORDER=="")return '<span class="negative">'+v+'</span>'; 
  return v;    
}

$.page.fn.dd = function(val,row){
  var v = eui.integer(val);
  if(v==='0.00') return '';
  return '<span class="demand">'+v+'</span>';   
}
$.page.fn.exception = function(val,row){
  if(val)var v = val.replace(/\^/g,'.');
  else return '';
  var docid=v.split('.');
  var cls = 'exception';
  return "<span class='"+cls+"'>"+v+"</span></a>";
}
$.page.fn.ss = function(val,row){
  var v = eui.integer(val);
  if(v==='0.00') return '';
  return '<span class="supply">'+v+'</span>';   
}

$('#cpplan').datagrid({
  toolbar:'#tbar',
  fit:true,
  fitColumns:false,
  queryParams: frm2dic($('form#gFilter')),
  url:'/?_sqlid=inv^cpplan&_func=get',
  
  checkOnSelect:false,
  singleSelect:true,
  columns: [[
      {field:"PART_ID", title:"Part ID"},
      {field:"CUST_PART_ID", title:"Cust Part"},
      {field:"CP_DATE", title:"CP Date", formatter:eui.date, width:80, fixed:true},
      {field:"CP_REF", title:"CP ID", formatter:$.page.fn.cpref, width:100, fixed:true},
      {field:"CUST_PO", title:"Cust PO"},
      {field:"DEMAND_ORDER", title:"Demand Order", formatter:$.page.fn.ddref, width:125, fixed:true},
      {field:"DEMAND_QTY", title:"Demand Qty", formatter:$.page.fn.dd, width:80, fixed:true, align:'right'},
      {field:"PROJ_QTY", title:"Projected Bal", formatter:$.page.fn.integer, width:80, fixed:true, align:'right'},
      {field:"SUPPLY_ORDER", title:"Supply Order",formatter:$.page.fn.ssref, width:125, fixed:true},
      {field:"SUPPLY_QTY", title:"Supply Qty", formatter:$.page.fn.ss, width:80, fixed:true, align:'right'},
      {field:"ACTION", title:"Action"},
      {field:"DESCRIPTION",title:"Description", width:200, fixed:false},
      {field:"EXCEPTION",title:"Exception",formatter:$.page.fn.exception, width:125, fixed:true},
    ]]
  ,
  onLoadSuccess:function(data){
   // console.log(data)
   $('#dg2excel').linkbutton('enable');

  }  
}).datagrid('columns',$('#colsel'));

$(document).ready(function(){
  $('form#gfilter').form({
    onChange:function(data){
      
      $('#cpplan').datagrid('reload',frm2dic($('form#gfilter')));  
    }
  })    
 $('#CUSTOMER_ID_').combobox({
   onSelect:function(data){
    $('#CUSTOMER_NAME_').textbox('setValue',data.NAME);
   }
 })
})

});  // $.page.ready