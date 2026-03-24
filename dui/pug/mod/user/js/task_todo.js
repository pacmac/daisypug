$.dui.page.cb = function(idx){
  if(idx=='new') setTimeout(function(){but_add();},250)
}

$.dui.page.tabswtich = function(idx){
  $('#tabs').tabs('select',idx);
}

$.dui.page.bhave = function(){
  function docombo(list,id){
    if(!list) return $('#'+id).textbox();
    var arr = nocrlf(list).split(',');
    var cbo=[]; for(var i in arr){
      var val = arr[i].trim().toUpperCase(); 
      cbo.push({'value':val,'text':val})  
    }
    cbo[0].selected=true;
    return $('#'+id).combobox({data:cbo,panelHeight:'auto',editable:false});  
  }
  
  $('#label_class').text($.dui.bhave.label_class);
  $('#label_class_1').text($.dui.bhave.label_class_1);
  $('#label_class_2').text($.dui.bhave.label_class_2);
  
  docombo($.dui.bhave.field_class,'field_class');
  docombo($.dui.bhave.field_class_1,'field_class_1');
  docombo($.dui.bhave.field_class_2,'field_class_2');
  
  if($.dui.bhave.label_class.length>0) $('#row_class').show();
  if($.dui.bhave.label_class_1.length>0) $('#row_class_1').show();
  if($.dui.bhave.label_class_2.length>0) $('#row_class_2').show();
}

$.dui.page.link = function(){
  var url = window.location.origin+'/#'+ $('#westMenu').tree('getSelected').id;
  url += '&id=' + $('#id').combobox('getValue');
  //$('#doclink').attr('href',url);
  window.prompt("Copy to clipboard: Ctrl+C, Enter", url);
}

$.dui.page.stats = [
  {value:'new',text:'NEW'},
  {value:'assigned',text:'ASSIGNED'},
  {value:'closed',text:'CLOSED'}
];


$.dui.page.status = function(){
  var frm = $('#task');
  var fdat = frm2dic(frm);
  if(fdat.completed_date != '') {
    var act = true;
    var status = 'closed';
  }
  else {
    var act = false;
    if(fdat.assignee != '') var status = 'assigned';
    else var status = 'new';
  }
  $('#status_').combobox('select',status);
  $('#action_details').textbox('required',act);
}

$.dui.page.req_email = function(rec){
  if(rec) $('#remail').val(rec.email);
}

$.dui.page.assign_email = function(rec){
  if(rec) $('#aemail').val(rec.email);
}

$.page.ready(function(){

  /* MY TODO */
  $('#dgtome, #dgbyme').datagrid({
    data:[],
    striped: true,
    fit:true,
    fitColumns:true,
    singleSelect:true,
    columns: [[
      {field:'OPEN',checkbox:true,styler:function(val,row,idx){ 
        return {class:{'high':'bg-red','med':'bg-ora','low':'bg-grn'}[row.SEVERITY]};
      }},
      {field:'TOBY_ME',hidden:true},
      {field:'MODIC', title:'',width:24,fixed:true, styler:function(val,row,idx){
        if(!row.MOD_ID) return;
        var icon = {'user^task_man':'postit.png','dqm^comp^ncr_man':'flag_red.png','dqm^comp^cf_man':'user_comment_blu.png','dqm^comp^cpar_man':'cross_check.png'}
        return 'background:url(../icons/'+icon[row.MOD_ID]+') no-repeat center center';
      }},
      {field:'SEVERITY',title:'Severity',width:50,fixed:true, align:'center',styler:function(val,row,idx){
        return {class:{'high':'bg-red','med':'bg-ora','low':'bg-grn'}[val],style:'text-transform:uppercase'};
      },hidden:true},
      {field:'FORM_ID',title:'Form ID',hidden:true},
      {field:'MOD_ID',title:'Module',hidden:true},
      {field:'MOD_NAME',title:'Module',width:80,fixed:true},
      {field:'DATE',title:'Date',width:80,fixed:true},
      {field:'DOC_ID',title:'Doc Ref',width:100,fixed:true},
      {field:'ACTION',title:'Type / Class',width:120,fixed:true,formatter:function(val){if(val) return val.toUpperCase();}},
      {field:'TITLE',title:'Title / Subject',width:600},
    ]],
    
    onLoadSuccess:function(data){
      var len = data.length;
      //var tabt = {'dgtome':'To Me','dgbyme':'By Me'}[$(this).attr('id')]
      //$('#maintabs').tabs('update',{'tab':0,'options':{'title':'xxx'}})
      if(data.length==0) alert('You have no pending tasks.');
    },
  
    onLoadError:function(){
      alert('No Pending Tasks');  
    },
    
    onCheck:function(idx,row){
      if(row.MOD_ID) {
        if(row.MOD_ID=='user^task_man'){
          $('#maintab').tabs('select',2);
          $('#id').combobox('select',row.DOC_ID);
        } 
        
        else {
          var link = row.MOD_ID;
          if(row.DOC_ID) link += '&'+row.FORM_ID+'='+row.DOC_ID; 
          loadpage(link);     
        }
      } 
    }
  })
  
  
  ajaxget('/',{_func:'get',_sqlid:'user^mytodo'},function(data){
    var byme=[], tome=[];
    data.map(function(e,i){
      if(e.TOBY_ME=='TOME') tome.push(e);
      else byme.push(e);
    })
    $('#dgtome').datagrid('loadData',tome);
    $('#dgbyme').datagrid('loadData',byme);
  })

  /* MANAGER */
  $.dui.page.bhave();

  ajaxget('/',{_func:'get',_sqlid:'admin^usercbo'},function(data){
    $('#assignee').combobox({ 
      data:data,
      onSelect: function(rec){
        if(rec) $.dui.page.assign_email(rec);
      }
    },{async:true})
  
    $('#requestor').combobox({
      data:data,
      onSelect: function(rec){
        if(rec) $.dui.page.req_email(rec);
      }
    });
    
    if(!$.dui.doc.ref) $.dui.page.tabswtich(2);
  })
  
  
  $('#doclink').linkbutton({
    size:'small',
    disabled: true,
    onClick: function(){
      $.dui.page.link();  
    }
  })
  
  $('#tbar input.easyui-combobox').combobox({
    onSelect: function(){
      //var fdat = frm2dic($('#filts')); cl(fdat);
    }
  })
  
  $('#status_').combobox({
    data: $.dui.page.stats
  });

  $('#emcc').textbox({
    onChange: function(nv,ov){
      if(!nv) return;
      var ok = (/^([\w+-.%]+@[\w-.]+\.[A-Za-z]{2,4},*[\W]*)+$/).test(nv);
      if(!ok) return alert('Invalid Email List');
      var ecc = nv.split(',');
      if(!Array.isArray(ecc)) ecc=[ecc];
      var emv=$('#remail').val();
      var ema = emv.split(',');
      if(!Array.isArray(ema)) ema=[ema];
      var em = ema.concat(nv);
      $('#remail').val(em);
    }
  });
  
  $('#completed_date').datebox({
    onSelect:function(){
      $.dui.page.status();
      $.dui.page.tabswtich(1);
    }
  })
  
  $('#todobrowse').datagrid({
    xtoolbar:[
      {id:'CLOSED', text:'Show Closed',iconCls:'icon-cross',toggle:true, handler: '$.dui.page.filter'}
    ],
    url: '/',
    queryParams:{
      _func   :'get',
      _sqlid  :'user^todos',
      _dgrid  :'y'   
    },
    singleSelect: true,
    striped:true,
    fit:true,
    fitColumns: true,
    columns: [[
      {field:'OPEN',checkbox:true},
      {field:'id',title:'ID',width:25,fixed:true},
      {field:'status',title:'Status',width:80,fixed:true},
      {field:'class',title:'Classification',width:100,fixed:true},
      {field:'severity',title:'Severity',width:60,fixed:true},
      {field:'requestor',title:'Requestor',width:70,fixed:true},
      {field:'assignee',title:'Assigned To',width:80,fixed:true},
      {field:'request_details',title:'Request Details',hidden:true,fixed:true},
      {field:'action_details',title:'Request Details',hidden:true,fixed:true},
      {field:'title',title:'Title / Subject',width:500,fixed:false},
    ]],
    
    onCheck: function(idx,row){
      $('form#task').form('load',row);
      setTimeout(function(){$('#tabs').tabs('select',0);},300);
      butEn('asdx');
    },
    
  	onloadSuccess: function(data){
      
  	}
    
  })
  
  $('#task').on('loadDone',function(me,data){
    var mode = $(this)[0].getAttribute('mode');
    $.dui.page.status();
    $.dui.page.req_email();
    $.dui.page.assign_email();
    $('.lock').removeClass('lock');
    $.dui.page.tabswtich(0);
    
  }).on('done',function(me,data){
      //var func = $(this)[0].queryParams._func;
      $('#todobrowse').datagrid('reload');
      $('#doclink').linkbutton('enable');
      butEn('asdx');
  })

  // after add button is pressed
  $('#but_add').on('done', function(me,butid){ 
    $('#requestor').combobox('select',$.dui.udata.userid);
    $('.lock').removeClass('lock');
    $.dui.page.tabswtich(0);
  });

})


/*
// add/update element
$.dui.page.counts = function(me,val){
  var txt = me.find('span .l-btn-text');
  var cnt = txt.find('.count');
  if(cnt.length) cnt.text(' ('+val+')');
  else $('<span class="count" />').text(' ('+val+')').appendTo(txt);
}

$.dui.page.docounts = function(){
  var dg = $('#todobrowse');
  var rows = dg.datagrid('getRows');
  var byme=0; rows.map(function(e){if(e.TOBY_ME=='BYME') byme++;});
  var tome=rows.length - byme;
  $.dui.page.counts($('#BYME'),byme);
  $.dui.page.counts($('#TOME'),tome);
  return {tome:tome,byme:byme};
}

$.dui.page.filter = function(e){
  var me = $(this), id = me.attr('id');
  if(id=='NEW') return loadpage('user^task_man&cb=new');
  var dg = $('#todobrowse');
  var lens = dg.datagrid('showRows',{'TOBY_ME':id});
}

*/


/*

//$('#dgtome, #dgbyme').datagrid({
$('#todobrowse').datagrid({
  striped: true,
  fit:true,
  fitColumns:true,
  url: '/?_func=get&_sqlid=user^mytodo',
  
  toolbar:[
    {plain:true, id:'TOME', text:'To Me',iconCls:'icon-user_down',toggle:true, group:'action', handler: '$.dui.page.filter'},
    '-',
    {plain:true, id:'BYME', text:'By Me',iconCls:'icon-user_up',toggle:true, group:'action', handler: '$.dui.page.filter'},
    '-',
    {plain:true, id:'NEW', text:'New Task',iconCls:'icon-add',handler: '$.dui.page.filter'},
  ],

  columns: [[
    {field:'OPEN',checkbox:true,styler:function(val,row,idx){ 
      return {class:{'high':'bg-red','med':'bg-ora','low':'bg-grn'}[row.SEVERITY]};
    }},
    {field:'TOBY_ME',hidden:true},
    {field:'MODIC', title:'',width:24,fixed:true, styler:function(val,row,idx){
      if(!row.MOD_ID) return;
      var icon = {'user^task_man':'postit.png','dqm^qp_ncr^qp_ncr_create':'flag_red.png'}
      return 'background:url(../icons/'+icon[row.MOD_ID]+') no-repeat center center';
    }},
    {field:'SEVERITY',title:'Severity',width:50,fixed:true, align:'center',styler:function(val,row,idx){
      return {class:{'high':'bg-red','med':'bg-ora','low':'bg-grn'}[val],style:'text-transform:uppercase'};
    },hidden:true},
    {field:'FORM_ID',title:'Form ID',hidden:true},
    {field:'MOD_ID',title:'Module',hidden:true},
    {field:'MOD_NAME',title:'Module',width:80,fixed:true},
    {field:'DATE',title:'Date',width:80,fixed:true},
    {field:'DOC_ID',title:'Doc Ref',width:100,fixed:true},
    {field:'ACTION',title:'Type / Class',width:120,fixed:true,formatter:function(val){return val.toUpperCase();}},
    {field:'TITLE',title:'Title / Subject',width:600},
  ]],
  
  onLoadSuccess:function(data){
    var toby = $.dui.page.docounts();
    if(toby.tome==0 && toby.byme > 0) $('#BYME').trigger('click');
    else $('#TOME').trigger('click');
    if(data.length==0) alert('You have no pending tasks.');
  },

  onLoadError:function(){
    alert('No Pending Tasks');  
  },
  
  onCheck:function(idx,row){
    if(row.MOD_ID) {
      var link = row.MOD_ID;
      if(row.DOC_ID) link += '&'+row.FORM_ID+'='+row.DOC_ID;
      //if(row.MOD_ID=='user^task_man') link+='&tabswitch=0';
      //cl(link);
      loadpage(link);
    } 
  }
  
})

*/