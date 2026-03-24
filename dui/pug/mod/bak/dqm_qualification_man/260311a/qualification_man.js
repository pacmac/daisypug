// ON-DEMAND TABS
/*
$('#gmtabs').tabs({
  onSelect: function(tit,idx){
    var fdat = frm2dic($('form#gauge'));
    switch(tit){
      case "Attachments":
        $('#gmfiles').datagrid('docFiles',dwap.page.fkey); 
        break;
      
      case "Results":
        $('#calids').combobox('reload','?_sqlid=dqm^qt_ids&_func=get&GAUGE_ID='+fdat.ID);
        break;
      
      case "User Fields":
        $('#UDF_LAYOUT_ID').combobox('reload','/?_func=get&_sqlid=udfid&_vpath=dqm&_combo=y')
        break;
    }
  }
}).tabs('disableAll');
*/
// when user select different layout
$('form#qualification input#UDF_LAYOUT_ID').combobox({onSelect:setudfs});

dwap.page.defudf=function(){
  var udf = $('#UDF_LAYOUT_ID');
  udf.combobox('setValue',dwap.bhave.defudf);
  udf.combobox('reselect');
}

dwap.page.cbos = function(cbos){
  for(var k in dwap.bhave){
    var bits = k.split('CBO_');
    if(bits.length==2) {
      data = jsonParse(dwap.bhave[k]);
      var reg = new RegExp(/\*$/);
      if (data){
        data.map(function(e){
            if(e.value.endsWith('*')) {
                e.selected = true;
                e.value = e.value.replace(reg,"");
                e.text = e.text.replace(reg,"");

            }
              
        })        
      }

      if (bits[1]=="LICENSOR_OWNER" || bits[1]=="RESULT") var doctype='#_dgform > form';
      else var doctype='form#qualification';
      $(doctype+' input[textboxname='+bits[1]+']').combobox('loadData',data);

    }
  }
}

dwap.page.spec={
  editor: 'form',
    addData:{
      LINE_NO:'$autonum:10',
      QUALIFICATION_ID: '#ID'
    },
    
    striped: true,
    url: '/?_sqlid=dqm^qualification_specs&_func=get&_dgrid=y',
    rownumbers: false,
    fitColumns: true,
    fit: true,

  columns: [[
    {field:"QUALIFICATION_ID",hidden:true},
    {field:"LINE_NO",hidden:true},
    {field:'LICENSOR_OWNER',id:'LICENSOR_OWNER',title:'Licensor Owner',width:80,editor:{type:'combobox',options:{ required: true,editable:false}}},
    {field:"FEATURES", title:'Spec/Feature',width:80,editor:'textbox' },
    {field:"RANGES", title:'Range',width:00,editor:'textbox' },
    {field:"LIMITATIONS", title:'Limitations',width:00,editor:'textbox' },
    {field:"NOTES", title:"Notes/Spec", width:80,editor:{type:'textbox',options:{readonly:false,multiline:true,height:150,}}},
  ]],
  onBeforeLoad: function(){
    var fdat = $('form#qualification').form('getData');
    if(!fdat.ID) return false;  
  },
  onLoadSuccess: function(){
      
  },
  onEndEdit: function(idx,row,chg){        

      var url = "/?_sqlid=dqm^qualification_specs";
      var data = clone(row);
      ajaxget(url,data,function(data){})       

  }
}


dwap.page.result={
  editor: 'form',
    addData:{
      LINE_NO:'$autonum:10',
      QUALIFICATION_ID: '#ID'
    },
    
    striped: true,
    url: '/?_sqlid=dqm^qualification_results&_func=get&_dgrid=y',
    rownumbers: false,
    fitColumns: true,
    fit: true,

  columns: [[
    {field:"QUALIFICATION_ID",hidden:true},
    {field:"LINE_NO",hidden:true},
    
    {field:'RESULT_DATE',title:'Date',width:100, fixed:true,formatter:eui.date,editor:'datebox'},
    {field:'RESULT_ID',title:'Result ID',width:100, fixed:true,editor:'text'},
    {field:'RESULT',title:'Result',id:'RESULT',width:120,editor:{type:'combobox',options:{ required: true,editable:false}}},
    {field:'SCORE',title:'Score',width:100, fixed:true,editor:'numberspinner'},
    {field:'MAJOR_NCRS',title:'# of Major NCRs',width:130, fixed:true,editor:'numberspinner'},
    {field:'MINOR_NCRS',title:'# of Minor NCRs',width:130, fixed:true,editor:'numberspinner'},
    {field:'OFI',title:'# of OFI',width:60, fixed:true,editor:'numberspinner'},
    {field:"NOTES", title:"Notes", width:1000,editor:{type:'textbox',options:{readonly:false,multiline:true,height:150,}}},
  ]],
  onBeforeLoad: function(){
    var fdat = $('form#qualification').form('getData');
    if(!fdat.ID) return false;  
  },
  onLoadSuccess: function(){
      
  },
  onEndEdit: function(idx,row,chg){        

      var url = "/?_sqlid=dqm^qualification_results";
      var data = clone(row);
      ajaxget(url,data,function(data){})       

  }
}

// calculate due / overdue.
dwap.page.due = function(){
  var dd = $('#DUE_DATE');
  var ddi = dd.next('span.textbox').find('input.textbox-text'); 
  var now = new Date();
  var date = new Date(dd.textbox('getValue'));
  var due = parseInt($('#DUE_DATE_ALERT_DAYS').numberspinner('getValue'));
  var days = parseInt((now-date)/1000/60/60/24);
  var txt = Math.abs(days)
  
  //cl('due:'+due+', days:'+days+', txt:'+txt+',now:'+parseInt((now-date)/1000/60/60/24));
  ddi.removeClass('bg-ora bg-red bg-grn');
  if(days > 0) {
    if(dwap.bhave.duealert=='y') alert('Gauge has expired by '+txt+' days.');
    ddi.addClass('bg-red');
  } else if(due > txt) {
    if(dwap.bhave.duealert=='y') alert('Gauge calibration due in '+txt+' days.');
    ddi.addClass('bg-ora');
  } else {
    ddi.addClass('bg-grn');  
  }
  
}

// set page defaults
dwap.page.bhave = function(){
	$('#DUE_DATE_ALERT_DAYS').val(dwap.bhave.alertdays);
}


// Wait for Document Load
$(document).ready(function() {
  

  $('#dg_spec').datagrid('rowEditor',dwap.page.spec);  
  $('#dg_result').datagrid('rowEditor',dwap.page.result);  
  dwap.page.cbos();
  dwap.page.defudf();
  $('#dg_spec').datagrid('loadData',[]); 
  $('#dg_result').datagrid('loadData',[]); 
  $('#but_add').on('done',function(d){
    $('#dg_spec').datagrid('loadData',[]); 
    $('#dg_result').datagrid('loadData',[]); 

    dwap.page.cbos();
    
  })

  ajaxget('/',{_func:'get',_sqlid:'vwltsa^udfid', '_combo':'y'},function(rs){ //retrieve data
    $('#UDF_LAYOUT_ID').combobox('loadData',rs);
  });

  $('#UDF_LAYOUT_ID').combobox({
    validType:['inList'],
    onSelect:setudfs,
    readonly:true,
    value:dwap.bhave.defudf
  })

  // ## AFTER QUALIFICATION IS LOADED ##
  $('#qualification').on('loadDone',function(evt,fdat){
    dwap.page.cbos();
    dwap.page.due();
    dwap.page.defudf();
    
    $('#dg_spec').datagrid('load',{_func:'get', _sqlid:'dqm^qualification_specs',_dgrid:'y',QUALIFICATION_ID:fdat.ID});
    $('#dg_result').datagrid('load',{_func:'get', _sqlid:'dqm^qualification_results',_dgrid:'y',QUALIFICATION_ID:fdat.ID});
    $('#qmfiles').datagrid('docFiles',fdat.ID);

    })

})


  


