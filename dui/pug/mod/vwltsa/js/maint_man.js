$.dui.page.cbos = function(cbos){
  for(var k in $.dui.bhave){
   // console.log(k)
    var bits = k.split('CBO_');
    //console.log(bits);
    if(bits.length==2) {
      data = jsonParse($.dui.bhave[k]);
      //console.log(data)
      var reg = new RegExp(/\*$/);
      if (data){
        data.map(function(e){
            if(e.value.endsWith('*')) {
                e.selected = true;
                e.value = e.value.replace(reg,"");
                e.text = e.text.replace(reg,"");

            }
              
        })        
      
        if (bits[1]=="MAINT_TYPE") var doctype='#_dgform > form';
        else var doctype='form#maints';
        $(doctype+' select[textboxname='+bits[1]+']').combobox('loadData',data);

      }
    }
  }
}

$.dui.page.maint_doc=function(){
  var maint_plan=$('#MAINT_PLAN');
  
  ajaxget('/',{_func:'files',_sqlid:'vwltsa^maint', '_combo':'y'},function(rs){ //retrieve data
    maint_plan.combobox('loadData',rs);
  });
}

$.dui.page.evtopts = {
  twoColumns: false,
  editor:'form',
  rownumbers: false,
  fitColumns: true,
  fit: true,
  url: '/',
  onRowContextMenu: function(e){return e.preventDefault()},
  onBeforeLoad:function(qp){
    if(!qp.MAINT_ID) return false; 
  },
  queryParams:{
      _sqlid:'vwltsa^maint_events',
      _func:'get',
      _dgrid:'y'
  },
  addData:{ MAINT_ID: '#MAINT_ID',LINE_NO:'$autonum:1',},
  onEndEdit: function(idx,row,chg){
      var url = "/?_sqlid=vwltsa^maint_events";
      var data = clone(row);
      data.MAINT_PLAN=$('#MAINT_PLAN').combobox('getValue');
      ajaxget(url,data,function(data){ //save data
         //$('#DG_EVENTS').datagrid('reload');
        //does not using reload method due to ROWID cannot be blank for upd/del
        ajaxget('/',{_func:'get',_sqlid:'vwltsa^maint_events', '_dgrid':'y',MAINT_ID:row.MAINT_ID},function(rs){ //retrieve data
          $('#DG_EVENTS').datagrid('loadData',rs);
        });
      }) 
  },
  onSelect:function(idx,row){
    
  },
  columns:
  [[
    {field:'ROWID',hidden:true},
    {field:'MAINT_ID',hidden:true},
    {field:'MAINT_FILE_ATTACHMENT',hidden:true},
    {field:'LINE_NO',title:'#',width:30,fixed:true,align:'center'},
    {field:'MAINT_TYPE',id:'MAINT_TYPE',title:'Maint Type',width:100,editor:{type:'combobox',options:{ required: true,editable:false}}},
    {field:'TRANS_DATE',title:'Date',width:20, formatter: eui.date,editor:{type:'datebox',options:{required:true}}},
    {field:'MAINT_FILE_NAME',title:'File',width:250,fixed:true,editor:{type:'textbox',options:{readonly:true}}},
    {field:'MAINT_FILE_DESC',title:'File Desc',width:250,fixed:true,editor:{type:'textbox',options:{readonly:true}}},
    {field:'MAINT_SPECS',title:'Notes',width:250,fixed:true,editor:{type:'textbox',options:{readonly:false,multiline:true,height:150,}}},

  ]]
}


$.dui.page.schedopts={
  twoColumns: false,
  editor:'form',
  rownumbers: false,
  fitColumns: true,
  fit: true,
  url: '/',
  onRowContextMenu: function(e){return e.preventDefault()},
  onBeforeLoad:function(qp){
    if(!qp.MAINT_ID) return false; 
  },
  
  queryParams:{
    _sqlid:'vwltsa^maint_sched',
    _func:'get',
    _dgrid:'y'
  },
  
  addData:{ MAINT_ID: '#MAINT_ID',RES_ID:'#RESOURCE_ID'},
  onEndEdit: function(idx,row,chg){
    row.YYMMDD = row.YYMMDD.replace(/-/g,'').substring(2);
      var url = "/?_sqlid=vwltsa^maint_sched";
      var data = clone(row);
      ajaxget(url,data,function(data){ //save data
        //$('#DG_SCHED').datagrid('reload');
        //does not using reload method due to ROWID cannot be blank for upd/del
        ajaxget('/',{_func:'get',_sqlid:'vwltsa^maint_sched', '_dgrid':'y',MAINT_ID:row.MAINT_ID},function(rs){ //retrieve data
          $('#DG_SCHED').datagrid('loadData',rs);
        });
      }) 
  },
  onSelect:function(idx,row){
  },
  columns:
  [[
    {field:'ROWID',hidden:true},
    {field:'MAINT_ID',hidden:true},
    {field:'RES_ID',hidden:true},
    {field:'MAINT_TYPE',title:'Maint Type',width:100,editor:{type:'combobox',options:{ required: true,editable:false}}},
    {field:'YYMMDD',title:'Date',width:50,editor:'datebox',formatter:function(val){
      if(val && val.length==6) return '20'+val.match(/([0-9]{2})([0-9]{2})([0-9]{2})/).splice(1).join('-');
      else return val;
    }},
    {field:'UNITS',title:'Units',width:50,editor:{type:'numberspinner',options:{min:0,precision:0}}},
    {field:'HOURS',title:'Hours',width:70,editor:{type:'numberspinner',options:{min:0,precision:2,increment:0.25}}},
    
  ]]
}

//filter by CAPACITY UNIT =1
$.dui.page.resourceXXX=function(){
  ajaxget('/',{_func:'get',_sqlid:'vwltsa^resid', '_combo':'y'},function(rs){
    ajaxget('/',{_func:'get',_sqlid:'vwltsa^maint_ids', '_combo':'y'},function(mc){
      var arr=[];
      var found=false;
      if (rs){
        rs.map(function(r){
          found=false;
          if (r.UNIT==1) {
            if (mc){
              mc.map(function(m){
                if (m.RESOURCE_ID==r.value) found=true;
              })
            }
            if (found==false) arr.push(r);

          }
        })
      }
      $('#RESOURCE_ID').searchbox('loadData',arr);
    })
  });
}

$.dui.page.resource=function(){
  ajaxget('/',{_func:'get',_sqlid:'vwltsa^resid', '_combo':'y'},function(rs){
      $('#RESOURCE_ID').searchbox('loadData',rs);

  });
}

$.dui.page.due_date=function(){
  var cycleType=$('#MAINT_CYCLE_TYPE').combobox('getValue');
  var cycleTime=$('#MAINT_CYCLE_TIME').numberspinner('getValue') || 0;
  var val=$('#LAST_MAINT_DATE').datebox('getDate');

  if (cycleType=='DAYS') var new_due=val.setDate(val.getDate() + (cycleTime*1));
  if (cycleType=='WEEKS') var new_due=val.setDate(val.getDate() + (cycleTime*1*7));
  if (cycleType=='MONTHS') var new_due=val.setMonth(val.getMonth() + (cycleTime*1));

  var newdue=new Date(new_due);
  var due=(newdue.getFullYear()+'-'+(newdue.getMonth()+1)+'-'+newdue.getDate());
  var puts={};
  puts.MAINT_DUE_DATE=due;
  eui.textPut(puts);
  $.dui.page.due();
}

// calculate due / overdue.
$.dui.page.due = function(){
  var dd = $('#MAINT_DUE_DATE');
  var ddi = dd.next('span.textbox').find('input.textbox-text'); 
  var now = new Date();
  var date = new Date(dd.textbox('getValue'));
  var due = parseInt($('#MAINT_DUE_ALERT_DAYS').numberspinner('getValue'));
  var days = parseInt((now-date)/1000/60/60/24);
  var txt = Math.abs(days)
  
  //cl('due:'+due+', days:'+days+', txt:'+txt+',now:'+parseInt((now-date)/1000/60/60/24));
  ddi.removeClass('bg-ora bg-red bg-grn');
  if(days > 0) {
    if($.dui.bhave.duealert=='y') alert('Maintenance has expired by '+txt+' days.');
    ddi.addClass('bg-red');
  } else if(due > txt) {
    if($.dui.bhave.duealert=='y') alert('Maintenance due in '+txt+' days.');
    ddi.addClass('bg-ora');
  } else {
    ddi.addClass('bg-grn');  
  }
  
}

$.dui.page.delete_btn=function(){
  var maint_del= $.dui.udata.groups.indexOf('MAINT-DELETE');
  if (maint_del==-1) butEn('asx');
  else butEn('adsx');

}
$.dui.page.dgrids_addbtn=function(endis){
  $('#DG_EVENTS').datagrid('options').tbar.dgre_add.linkbutton(endis);
  $('#DG_SCHED').datagrid('options').tbar.dgre_add.linkbutton(endis);
}
// PAC Item Upload & Download
$.dui.page.miuload = function(){
  
  // don't repeat any code.
  function ival(name){return $(`#_dgform input[name="${name}"`).val()}
  
  // get the file data
  var sel = {
    appid         : $.page.state.pageId,
    tsid          : ival('MAINT_FILE_ATTACHMENT'),
    fname         : ival('MAINT_FILE_NAME'),
    description   : ival('MAINT_FILE_DESC'),
    revn          : ''
  }

  // set the data params & load the upload form.
  $('form#fileup').form('load',{
    description: sel.description,
    rver: sel.revn
  }).data().vars = {
      _func   : 'upd',
      _sqlid  : 'admin^file',
      tsid    : sel.tsid,
      appid   : sel.appid,
      fname   : sel.fname
  }

  // get fields to set readonly
  var rons = $('form#fileup input[textboxname=description], form#fileup input[textboxname=rver]');
  
  // open the file upload window
  $('#filewin').window({
    onBeforeClose:function(){
      rons.textbox('readonly',false); // set fields back again 
    }
  }).window('open');
  
  // set fields readonly (do after open)
  rons.textbox('readonly',true);

  $('form#fileup').form('load',{
    description: sel.description,
    rver: sel.revn
  }).data('vars',{
    _func:'upd',
    _sqlid:'admin^file',
    tsid:sel.tsid,
    appid:sel.appid,
    fname:sel.fname
  });

}

$.dui.page.midload = function(){
  var appid = $.page.state.pageId;
  var tsid = $('#_dgform input[name="MAINT_FILE_ATTACHMENT"').val() // "1541728008050.xlsx"
  window.location = '/?_func=tsdl&tsid='+tsid+'&appid='+appid;  
}

// PAC ENDS

$.page.ready(function(){
  $.dui.page.cbos();
  $.dui.page.maint_doc();



  toolbut([
    {
      id: 'cleardispose',
      iconCls: 'icon-date',
      text: 'Clear Disposal Date',
      disabled: true,
      noText: false,
      onClick:function(){
        $('#DISPOSAL_DATE').datebox('setValue','');
        $('#DISPOSAL_DATE').datebox('required',false);
        $('#STATUS').combobox('readonly',false);
        $('#STATUS').combobox('reselect');
      }
    },

  ])

  $('#but_add').on('done',function(d){
    $('#MAINT_ID').combobox('required',true);
    //$.dui.page.resource(); //refresh the resource list
    $.dui.page.cbos();
    $.dui.page.maint_doc();
    $.dui.page.dgrids_addbtn('disable');
    $('#DG_EVENTS').datagrid('loadData',{"total":0,"rows":[]});
    $('#DG_SCHED').datagrid('loadData',{"total":0,"rows":[]});
    
  })

  $('#RESOURCE_ID').searchbox({
    onSelect:function(rec){
      console.log(rec);
      $('#TOLERANCE_CLASS').textbox('setValue',rec.TOLERANCE_CLASS);
    }
  })
  $('#DG_EVENTS').datagrid('rowEditor',$.dui.page.evtopts);
  $('#DG_SCHED').datagrid('rowEditor',$.dui.page.schedopts);
  
    //DISPOSAL DATE editable if STATUS=DISPOSED
    $('#STATUS').combobox({
        onSelect:function(data){
          if (data.value=='DISPOSED') var ro=false;
          else var ro=true;
          $('#DISPOSAL_DATE').datebox('readonly',ro);
          $('#DISPOSAL_DATE').datebox('required',!ro);
        }
    })
  
    $('#LAST_MAINT_DATE').datebox({
      onSelect:function(val){
        $.dui.page.due_date();
      }
    })
   
    $('#MAINT_CYCLE_TYPE').combobox({
      onSelect:function(val){
        $.dui.page.due_date();
      }
    })
    
    $('#MAINT_CYCLE_TIME').numberspinner({
      onChange:function(){
        $.dui.page.due_date();
      }
    })
    
    $('form#maints').on('loadDone',function(jq,data){
      //console.log(data);
      $.dui.page.due();
      //$.dui.page.resource();
      //$.dui.page.cbos();
        if (data.STATUS=='DISPOSED') $('#cleardispose').linkbutton('enable');
        else $('#cleardispose').linkbutton('disable');

        //EVENT datagrid
        ajaxget('/',{_func:'get',_sqlid:'vwltsa^maint_events', '_dgrid':'y',MAINT_ID:data.MAINT_ID},function(rs){
          $('#DG_EVENTS').datagrid('loadData',rs);
        });

        //SCHEDULE datagrid
        ajaxget('/',{_func:'get',_sqlid:'vwltsa^maint_sched', '_dgrid':'y',MAINT_ID:data.MAINT_ID},function(rs){
          $('#DG_SCHED').datagrid('loadData',rs);
        });

        //$('#STATUS').combobox('reload');

        if (data.DISPOSAL_DATE !="") $("#STATUS").combobox('readonly',true);
        else $("#STATUS").combobox('readonly',false);

       // $.dui.page.defudf();
       // $('#UDF_LAYOUT_ID').combobox('reload');

       // $.dui.page.cbos();
       var en_dis='disable';
       if (data.MAINT_ID !='') en_dis='enable'; 
       //if (data.MAINT_PLAN !='') en_dis='enable'; 
       
       $.dui.page.dgrids_addbtn(en_dis);

       $.dui.page.delete_btn();
    })

    // PAC - Append The Upload & Download Buttons
    if($('.dialog-button #midload').length==0){
    	$('#_dgform + .dialog-button').prepend('<a href="javascript:void(0);" id="midload"/>').prepend('<a href="javascript:void(0);" id="miuload"/>')
    	$('#midload').linkbutton({iconCls:'icon-download',onClick:$.dui.page.midload});
    	$('#miuload').linkbutton({iconCls:'icon-upload',onClick:$.dui.page.miuload});
    }

    $.dui.page.dgrids_addbtn('disable');
})
