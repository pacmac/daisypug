$.page.fn.dgcols = [
  //{field:'EDIT', width:30, checkbox:true},
  {field:"TEST_ID", hidden:true},
  {field:"PROC_SEQ", hidden:true},
  {field:"TICK_SEQ", hidden:true},
  {field:"BOOL_TEXT", title:"Pass-Fail Criteria",width:200,fixed:true},
  {field:"VLOW", title:"Lower Limit",align:"right",width:75,formatter:fixed,fixed:true},
  {field:"VNOM", title:"Nominal",align:"right",width:75,formatter:fixed,fixed:true},
  {field:"VUPP" ,title:"Upper Limit",align:"right",width:75,formatter:fixed,fixed:true},
  {field:"VAR", title:"Variance", align:"right", width:75, editor:{type:'label'}, formatter:fixed, fixed:true},
  {field:"STATUS", title:"Status", width:75, editor:{type:'label'}, styler:passfail,fixed:true},
  {
    field:"VALUE", 
    title:"Result",
    align:"right",
    formatter:fixed, 
    styler:function(){return 'background-color:#ECF4FF'}, 
    width:75, 
    editor:{type:'numberbox', options:{precision:5, align:'right'}}, 
    fixed:true
  },
  {field:'GAUGE_ID',title:'Gauge ID',width:200,editor:{
      type:'combobox',
      options:{
      url: '?_func=get&_sqlid=dqm^gauge&_combo=y',
      groupField: 'GAUGE_TYPE',
      panelWidth:200,
      editable: false,
        }}
  },
  {field:"NOTES", title:"Notes & Observations", editor:{type:'text'}, styler:function(){return 'background-color:#FAFAFA'}, width:1000}
];

function dynurl(){if($.page.fn.mode=='test') return gurl('/?_func=get&_sqlid=dqm^qpdata'); return null}

function fixed(val){
	if(val==='') return val;
  else return parseFloat(val).toFixed(5);
}

function passfail(val,row,idx){if(!val) return; else return {class: val.toLowerCase()};}

// validate test value
$.page.fn.qpvali = function(rowi,rdat){
  //console.log(rdat);

  rdat.VAR = 0;
  //if(proc.LTYPE=='bool') {

	if(rdat.LTYPE=='bool') {
  	rdat.VALUE = parseInt(rdat.VALUE);
    rdat.VNOM = rdat.VUPP = rdat.VLOW = 0;  
  }
	else {
  	rdat.VNOM = parseFloat(rdat.VNOM);
  	rdat.VALUE = parseFloat(rdat.VALUE);
  	rdat.VUPP = parseFloat(rdat.VUPP);
  	rdat.VLOW = parseFloat(rdat.VLOW);
     
  }

  rdat.GAUGE_ID=rdat.GAUGE_ID;

  if(rdat.VALUE==='') rdat.STATUS = 'None';
    
  else {
    rdat.STATUS = "Pass";
    
    if(rdat.VALUE === rdat.VNOM){
      rdat.VAR = 0;  
    }

    if(rdat.VALUE > rdat.VNOM){
      rdat.VAR = rdat.VALUE - rdat.VNOM;
      if(rdat.VALUE > rdat.VUPP) rdat.STATUS = "Fail";  
    }

    if(rdat.VALUE < rdat.VNOM){
      rdat.VAR = rdat.VNOM - rdat.VALUE;
      if(rdat.VALUE < rdat.VLOW) rdat.STATUS = "Fail";       
    }    
    
  }
  
  var dg = $('#qpdata');  
  var vari = $(dg.datagrid('getEditor',{index:rowi,field:'VAR'}).target);
  vari.html(rdat.VAR);
  $.page.fn.dostat(rowi,rdat.STATUS);
  return rdat;
}

//var qtref='QT-00001-14^40';
//$('#qpdata').datagrid('load',{'qtref':qpref});

$.page.fn.dostat = function(rowi,status){
  var stat = $($('#qpdata').datagrid('getEditor',{index:rowi,field:'STATUS'}).target);
  stat.html(status);
  stat.closest('td[field="STATUS"]').attr('class',status.toLowerCase()); 
}

$('#qpdata').datagrid({
  readonly: false,
  lidx: -1,
  columns:[$.page.fn.dgcols],
  method:'get',
  fit:true,
  fitColumns:true,
  rownumbers:true,
  singleSelect:true,

  toolbar: [{
    disabled: true,
    id: 'lend',
    iconCls: 'icon-edit',
    text: 'End Line Edit',
    handler: function(){
      $.page.fn.editend();
    }
  }],
  
  onBeforeSelect: function(){
    var opt = $(this).datagrid('options');
    if(opt.readonly) return false;    
  },
  
  onClickCell:function(rowi,fld,val){
    var dg = $(this);
    var opt = dg.datagrid('options');
    if(opt.readonly) return false;
    var rdat = dg.datagrid('getRows')[rowi];

    if(fld == 'STATUS'){
      $.page.fn.editend();
      
      if(rdat.LTYPE != 'value'){
        var stats = ['Pass','Fail'];
        var idx = stats.indexOf(val);
        idx ++; if(idx>1) idx=0;
        $.page.fn.editstart(rowi);
        $.page.fn.dostat(rowi,stats[idx]);
      } $.page.fn.editend();
    } 
     
    else {
           
      if(rowi != opt.lidx) $.page.fn.editend(); 
      $.page.fn.editstart(rowi);
      opt.lidx = rowi;

      var edi = dg.datagrid('getEditor', {index:rowi,field:fld});
      if(!edi) $.page.fn.editend();
      
      if(fld=='NOTES' || fld=='GAUGE_ID') edi.target.focus();
      else if(fld=='VALUE'){         
        edi.target.numberbox({
          onChange:function(nv,ov){
            if(nv != rdat.VALUE) rdat.VALUE = parseFloat(nv);
            rdat = $.page.fn.qpvali(rowi,rdat);
          }
        }).numberbox('textbox').focus();
      }
      
      else $.page.fn.editend();
    }
  },
  
  onEndEdit:function(idx,rdat,chg){
    
    // Update Tree Node with current values
    rdat._node.tests.map(function(e,i){
      if(e.TICK_SEQ==i) {
        e.STATUS = rdat.STATUS;
        e.NOTES = rdat.NOTES;
        if(e.ltype=='value') e.VALUE = rdat.VALUE;
      }
    })
    
    //return;
    if($.page.fn.dgsave) $.page.fn.dgsave(rdat);
    if($.page.fn.ticks) $.page.fn.ticks(rdat);
  },
    
  onLoadSuccess: function(data){
    var opt = $(this).datagrid('options');
    if(data.rows.length==0 || !data.rows[0].LTYPE) var lt = 'value';
    else var lt = data.rows[0].LTYPE;
    var cols = {bool:["VALUE","VLOW","VNOM","VUPP","VAR"],value:["BOOL_TEXT"]};
    var all = cols.bool.concat(cols.value);
    for(var c in all){
      if(cols[lt].indexOf(all[c])==-1) var mode = 'showColumn'; else var mode = 'hideColumn'; 
      $(this).datagrid(mode,all[c]);  
    }
    
    //reset on new operation
    opt.lidx = -1; 
    $.page.fn.editend
  }
}).datagrid('renderColumns');

$.page.fn.editstart = function(rowi){
  $('#qpdata').datagrid('beginEdit',rowi);
  $('#lend').linkbutton('enable');
  $('#qpdata').datagrid('options').lidx = rowi;  
}

$.page.fn.editend = function(){
  var but = $('#lend');
  var lidx = $('#qpdata').datagrid('options').lidx;
  cl('$.page.fn.editend,lidx:'+lidx);
  if(lidx == -1) return; 
  setTimeout(function(){
    $('#qpdata').datagrid('endEdit',lidx);
    but.linkbutton('disable');
  });
}

/*
// end edit on loose focus
var curr = null; 
$(document).on('mousedown',function(e){
	if($('#qpdata').length==0) return;
	var v = $(e.target).closest('div.datagrid-view');
	if (v.length){
		var dg = v.children('table');
		if (!curr) curr = dg; 
		else if (dg[0] != curr[0]){
			$.page.fn.endedit();
			curr = dg;
		}
	} else {
    $.page.fn.endedit();
		curr = null;
	}
});
*/

