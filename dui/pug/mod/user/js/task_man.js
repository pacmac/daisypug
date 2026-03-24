$.dui.page.cb = function(idx){
  if(idx=='new') setTimeout(function(){but_add();},250)
}

$.dui.page.tabswtich = function(idx){
  $('#tabs').tabs('select',idx);
}

$.dui.page.bhave = function(){
  return;
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
  //var url = window.location.origin+'/#'+ $('#westMenu').tree('getSelected').id;
  var url = window.location.origin+'/#'+ getMenu().node.id;
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
  butEn('asdx');
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

  /*     
  ajaxget('/',{_func:'get',_sqlid:'admin^versions'},function(data){
    var files=data.files;
    var cdata=Object.keys(files);
    //console.log(cdata);
    var cbdata=[];
    for(var f in cdata){
    		var kname=cdata[f];
         cbdata.push({'text':kname,'value':kname,'ver':files[kname].ver})      		
    }
    
    //console.log(cbdata);
    $('#FILE_NAME').combobox({ 
      data:cbdata
    })     

  })
  
  $('#FILE_NAME').combobox({ 
      onSelect: function(rec){
       $('#FILE_VER').textbox('setValue',rec.ver);
      }
  })
  */
  
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
    method: 'get',
    url: '/?_func=get&_sqlid=user^todos&_dgrid=y',
    singleSelect: true,
    striped:true,
    fit:true,
    columns: [[
      {field:'OPEN',checkbox:true},
      {field:'id',title:'ID',width:25,fixed:true},
      {field:'status',title:'Status',width:80,fixed:true},
      {field:'class',title:'Classification',width:100,fixed:true},
      {field:'severity',title:'Severity',width:50,fixed:true},
      {field:'requestor',title:'Requestor',width:70,fixed:true},
      {field:'assignee',title:'Assigned To',width:70,fixed:true},
      {field:'title',title:'Title / Subject',width:1000},
      {field:'request_details',title:'Request Details',hidden:true},
      {field:'action_details',title:'Request Details',hidden:true}
    ]],
    
    onCheck: function(idx,row){
      $('form#task').form('load',row);
      setTimeout(function(){$('#tabs').tabs('select',0);},300);
      
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
  })

  // after add button is pressed
  $('#but_add').on('done', function(me,butid){ 
    $('#requestor').combobox('select',$.dui.udata.userid);
    $('.lock').removeClass('lock');
    $.dui.page.tabswtich(0);
  });

})