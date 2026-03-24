$.page.ready(function() {

$('#ci .easyui-textbox').each(function(){
  if (!$.data(this, 'textbox')) $(this).textbox();
});

$('#ci').on('input change', 'input.easyui-textbox:not([readonly]):not(:disabled), textarea.easyui-textbox:not([readonly]):not(:disabled)', function(){
  var opts = $('#ci').form('options');
  if (opts && typeof opts.onChange === 'function') opts.onChange.call($('#ci')[0], this);
});

// NEW Button
$('#but_add').on('done',function(){
  $('#STATUS').combobox('select','PENDING');
  $('#SRC_TYPE').textbox('setValue','CI');
  $('#cidg').datagrid('uncheckAll');
  $('form#ci').form('focusFirst');
})


// ON SUCCESSFUL SAVE
$('form#ci').form({
  success:function(res){
    res = JSON.parse(res);
    if(!res.error){
      $(this).attr('mode','upd'); 
      $('#cidg').datagrid('options').autoload = res._next;
      $('#cidg').datagrid('reload');
    }
  }  
})

// IS EDITOR
$.page.fn.editor = function(){
  if($.dui.udata.groups.indexOf('NCR-EDITOR')!==-1) {
    $('#edit').linkbutton('unselect').linkbutton('enable');
  } else $('#edit').linkbutton('disable');
}

// AFTER RECORD SELECTED
$('form#ci').on('loadDone',function(){
  var fdat = frm2dic($(this));

  // DISABLE SRC FIELDS
  // if(fdat.SRC_TYPE != 'ci'){}

  // STATUS RULES
  if(fdat.STATUS == 'COMPLETED') {
    roset(false);
    $.page.fn.editor();
  }
  else roclr(false);

  // SELECT ALL COMBOS ON LOAD (fixed in EUI 1.4.3)
  $(this).form('reselect');
  butEn('asdx');
  
  // File attachments
  $.page.fn.fkey = fdat.ID;
  $('#cifiles').datagrid('docFiles',$.page.fn.fkey);
  
})

$('#edit').linkbutton({
  onClick:function(){roclr()}
})

// CAUSE ID COMBO
$('input#CAUSE_ID').combobox({
  types: [],
  editable:false,
  groupField: 'class',
  onSelect:function(rec){
    $('input#CAUSE_DESC').textbox('setValue',rec.description)
  }
})

// ALL CAUSES
$.page.fn.causes = function(type){
  var cbo = $('input#CAUSE_ID');
  var opt = cbo.combobox('options');  
  if(!type) type = 'CI';
  function go(type){
    var cbdat = [];    
    opt.types.map(function(e){if(e.type==type) cbdat.push(e);})  
    cbo.combobox('loadData',cbdat);
  }

  if(opt.types.length==0){
    ajaxget('/',{_sqlid:'dqm^cause_all',_func:'get'},function(data){
      opt.types = data;
      go(type);
    })
  } else go(type);
}

// STATUS COMBO
$('input#STATUS').combobox({
  data:[
    {value:'PENDING',text:'PENDING'},
    {value:'ACTIONED',text:'ACTIONED'},
    {value:'COMPLETED',text:'COMPLETED'}
  ]
})

// DYNAMICALLY LOAD COMBOS _sqlid_
$('#wtab').tabs({
  onSelect:function(tit,idx){
    tabcombos($(this));
    if(tit=='Cause') $.page.fn.causes();
  }
})

// status Filters
$.page.fn.statfilt = function(e){
  setTimeout(function(){
    var stats = [];
    var open = $('#but_dg_open').linkbutton('options').selected;
    var closed = $('#but_dg_closed').linkbutton('options').selected;
    if(open) stats.push('PENDING','ACTIONED');
    if(closed) stats.push('COMPLETED')  
    $('#cidg').datagrid('load','/?_func=get&_sqlid=dqm^ci_list&_dgrid=y&STATUS='+stats.join(',')); 
  })
}

// filters
$.page.fn.dgfilt = function(e){
  var me = $(this);
  var ops = me.linkbutton('options');
  var dg = $('#cidg');
  var type = ops.id.split('but_dg_')[1].toUpperCase();
  if(!$.page.fn.filts) $.page.fn.filts = ['cf','cpar','ncr'];
  if(ops.selected && $.page.fn.filts.indexOf(type)==-1) $.page.fn.filts.push(type);
  else if(!ops.selected && $.page.fn.filts.indexOf(type) !=-1) $.page.fn.filts.splice($.page.fn.filts.indexOf(type),1);
  dg.datagrid('showRows',{'SRC_TYPE':$.page.fn.filts});  
}

$.page.fn.dgedit = function (mode){
  var dg = $('#cidg');
  var row = dg.datagrid('getSelected');
  var idx = dg.datagrid('getRowIndex',row);
  var me = $(this);
  var type = row.SRC_TYPE.toUpperCase(); 
  var mod = {NCR:'dqm^qp_ncr^qp_ncr_create',CF:'dqm^cf^cf_man',CPAR:'dqm^cpar^cpar_man'}[type];

  function wintitle(title) {
    if($.page.fn.tab.document) {
      $.page.fn.tab.document.title = title;
    } else {
      setTimeout(wintitle, 100);
    }
  }
  
  switch(mode){
    case "view":
      if(type=='CI') return false;
      var link = '/#' + mod;
      if(row.SRC_ID) link += '&NCR_ID='+row.SRC_ID;
      linkwin(link);
      break;
      
    case "delete":
      var vars = {_func:'upd', _sqlid:'dqm^ci_del', TYPE: 'QC_'+(row.TYPE).toUpperCase(), NCR_ID:row.NCR_ID}
      confirm(function(yn){
        if(yn){
         ajaxget('/',vars,function(data){
            if(!data.error) {
              dg.datagrid('reload').datagrid('unselectAll').datagrid('clearChecked');
            }
            else(alert(data));
          })             
        }  
      },'Close this CI ?')
         
      break;
    }
      
}
// reminder alert
$.page.fn.remind = function(){
  confirm(function(ok){
    if(!ok) return;
    var fdat = frm2dic($('#ci'));
   // if($.page.fn.setup.reminder){
   //   var ems=[]; $.page.fn.setup.reminder.map(function(e){ems.push(fdat[e])});
   //   $('#_RECIPIENTS').val(ems.join(','));
   // }
  	  
   // fdat._RECIPIENTS = ems;
   var ems=[];
   $.dui.pdata.uid.map(function(p){
     if (p.value==fdat.ACTION_USER){
        ems.push(p.email);
     }
   })
   fdat._coname=$.dui.codata.coname;
   fdat._RECIPIENTS = ems[0];
    fdat._sqlid = 'dqm^ci_remind';
    fdat._func = 'upd';
    fdat._page='ci_man';
    fdat.ID=fdat.ID;
    ajaxget('/',fdat,function(data){
      if(data.error) msgbox(data.msg);
      else msgbox("Reminder will send to "+ems[0]+" shortly.");
    })      
  })
}

// Datagrid init

  // Toolbar buttons.
  toolbut([
    {
      id:'reminder',
      text:'Send Reminder',
      iconCls: 'icon-email',
      disabled: true,
      noText: true,
      onClick: $.page.fn.remind
    },
    {}
  ])

  $('#cidg').datagrid({
    fit: true,
    autoload: null,
    fitColumns: true,
    striped: true,
    singleSelect: true,
    checkOnSelect: true,
    remoteSort:false,
    idField:'ID',
    method:'get',
    url:'/?_func=get&_sqlid=dqm^ci_list&_dgrid=y&STATUS=PENDING,ACTIONED',
  
    columns: [[
      {field:'_CK',title:'S', width:50,checkbox:true,fixed:true},
      {field:'ID',title:'CI ID',width:80,fixed:true, sortable:true, order:'asc'},
      {field:'CREATE_DATE',title:'CI Date',width:90,fixed:true, sortable:true, order:'asc'},
      {field:'STATUS',title:'CI Status',width:90,fixed:true, sortable:true, order:'asc'},
      {field:'SRC_ID',title:'Source ID',width:120,fixed:true, sortable:true, order:'asc', formatter:function(val,row,idx){
        var cls = 'icon-'+row.SRC_TYPE.toLowerCase();
        if(!val) val = row.ID;
        return '<span style="width:20px" class="'+cls+' icon-dg"></span><span>'+val+'</span>';
      }},
      {field:'SRC_CREATE_DATE',title:'Source Date', width:90, fixed:true, sortable:true, order:'asc',formatter:function(val,row,idx){if(!val) return row.CREATE_DATE; return val;}},  
      {field:'SRC_SEVERITY',title:'Severity',width:75,fixed:true, sortable:true, order:'asc', styler: function(val,row,idx){
        return {class:{'LOW':'fg-grn','MEDIUM':'fg-yel','HIGH':'fg-ora','CRITICAL':'fg-red'}[val]}
        }
      },
      
      {field:'SRC_REPORTED_BY',title:'Action By',width:120,fixed:true,formatter:function(val,row,idx){if(!val) return row.ACTION_USER; return val;}},
      {field:'USER_ID',title:'Created By',width:120,fixed:true},
      {field:'SRC_SUBJECT',title:'Subject',width:800,fixed:false},
    ]],
    
    onBeforeLoad: function(){
      
      
    },
    
    onLoadSuccess: function(data){
      var opt = $(this).datagrid('options');
      if(opt.autoload){      
        $(this).datagrid('selectRecord',opt.autoload);
        opt.autoload = null; 
      }
      
      var filt = $('#content:not(.ronly) #but_dg_cf,  #content:not(.ronly) #but_dg_cpar,  #content:not(.ronly) #but_dg_ncr,  #content:not(.ronly) #but_dg_ci');
      var acts = $('#content:not(.ronly) #dg2excel'); 
      if(data.total > 0) {
        acts.linkbutton('enable');
        //filt.linkbutton('enable');
      }
    },
    
    onCheck:function(idx,row){
      $('#content:not(.ronly) #but_dg_view, #content:not(.ronly) #but_dg_del').linkbutton('enable'); 
      //2020-09-08, CLS, cause id based on existing cause id instead of source's cause id
      //$.page.fn.causes(row.SRC_TYPE);

      var frm = $('#ci'); 
      frm.form('load',row);
      $('#reminder').linkbutton('enable');
    },
    
    toolbar: [{
      id:'but_dg_view',
      text: 'View',
      iconCls: 'icon-godoc',
      disabled: true,
      handler: function(){$.page.fn.dgedit('view')}
    },{
      id: 'but_dg_cf',
      iconCls: 'icon-cf',
      disabled: true,
      toggle: true,
      selected: true,
      handler: $.page.fn.dgfilt
    },{
      id: 'but_dg_cpar',
      iconCls: 'icon-cpar',
      disabled: true,
      toggle: true,
      selected: true,
      handler: $.page.fn.dgfilt
    },{
      id: 'but_dg_ncr',
      iconCls: 'icon-ncr',
      toggle: true,
      disabled: true,
      selected: true,
      handler: $.page.fn.dgfilt
    },{
      id: 'but_dg_ci',
      iconCls: 'icon-ci',
      toggle: true,
      disabled: true,
      selected: true,
      handler: $.page.fn.dgfilt
    },{
      id: 'but_dg_open',
      iconCls: 'icon-unlocked',
      text: 'Open',
      disabled: false,
      selected: true,
      toggle: true,
      handler: $.page.fn.statfilt
    },{
      id: 'but_dg_closed',
      iconCls: 'icon-locked',
      text: 'Closed',
      disabled: false,
      toggle: true,
      handler: $.page.fn.statfilt
    },{
      id: 'dg2excel',
      disabled: true
    }
    
    ],
  
  })

})

/*
function fnames(fid){
  var fdat = frm2dic($(fid));
  setTimeout(function(){
    var x=[]; for(var k in fdat){x.push(k)}
    cl(x.join(','));    
  },1000)
}

fnames('form#ci');
*/
