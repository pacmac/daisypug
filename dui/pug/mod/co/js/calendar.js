/*
  
  PAC 180131, 2.2.4
  1. When in global show SITE - CLASS, and when not in global show TYPE - CLASS
  
  
*/

var cl = console.log;
//$.dui.udata.groups += ',CAL-EDITOR';
$.dui.page.isedit = false || $.dui.udata.groups.indexOf('CAL-EDITOR')!=-1;
$.dui.page.date = new Date;
$.dui.page.today = date2ymd($.dui.page.date,true);
$.dui.page.month = $.dui.page.date.getMonth();
$.dui.page.year = $.dui.page.date.getFullYear();
//cl($.dui.page.year,$.dui.page.month);
$.dui.page.moys = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
$.dui.page.months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
$.dui.page.ymds = [];
$.dui.page.calids = {};
$.dui.page.multis = {};

$.dui.page.day = function(val,row,idx){
  var opt = $('#calendar').datagrid('options');
  $.dui.page.ymds.push(val.ymd);
  var dow = val.date.getDay();
  var moy = val.date.getMonth(); 
  var date = getGetOrdinal(val.date.getDate())+' '+$.dui.page.moys[moy];
  var addic='', html=[], ucls = ['day-body'], dcls = ['day-head']; 
  var off = false; if(moy != $.dui.page.month) off = true;
  if(off) ucls.push('prvnxt');
  else if(dow==0 || dow==6) ucls.push('wkend');   
  if(!off && $.dui.page.isedit && opt.queryParams.global=='n') {
    addic = '<span class="add-icon" data-ymd="'+val.ymd+'"></span>';
  }
  
  if(val.ymd == $.dui.page.today) dcls.push('today');
  html.push('<div class="'+dcls.join(' ')+'">'+date+addic+'</div>');
  //ucls.push('easyui-droppable');
  html.push('<ul data-ymd = "'+val.ymd+'" class="'+ucls.join(' ')+'">');
  
  if(!off){
    var tasks = val.tasks || [];
    
    // PROCESS MULTI-DAYS
    for(var tid in $.dui.page.multis) {
      var t = $.dui.page.multis[tid]; 
      if(t.END_DATE >= val.ymd) tasks.push(t);
      else delete($.dui.page.multis[tid]);
    }
  
    tasks.map(function(task){

      if(opt.queryParams.global == 'y') var text = task.SITE_ID+' - '+task.CAL_CLASS_ID;
      else var text = task.CAL_TYPE_ID+' - '+task.CAL_CLASS_ID;
      
      var cls = ['easyui-tooltip',task.COLOUR_CODE];
      if(task.START_DATE < val.ymd) cls.push('cont');
      //else cls.push('easyui-draggable');
      var li = '<li data-row="'+idx+'" data-id="'+task.CAL_ID+'" class="'+cls.join(' ')+'" title="'+task.REMARKS.replace(/\n/g,'<br>')+'">'+text+'</li>'; 
      
      html.push(li);
      $.dui.page.calids[task.CAL_ID] = task;
      
      // ADD MULTI-DAYS
      if(task.END_DATE != task.START_DATE){
        if(!(task.CAL_ID in $.dui.page.multis)) {
          task.continue = true;
          $.dui.page.multis[task.CAL_ID] = task;
        }
      }
    })
  }

  html.push('</ul>');
  
  return html.join('\n');    
}

function pad(val,max) { var str=val.toString(); return str.length < max ? pad("0" + str, max) : str;}

function getGetOrdinal(n) {
    var s=["th","st","nd","rd"],
    v=n%100;
    return n+(s[(v-20)%10]||s[v]||s[0]);
 }

function date2ymd(date,long){
  var bits = date.toLocaleDateString("en-US").split('/');
  if(long) var yr = bits[2]; else var yr = bits[2].slice(2); 
  return [yr,pad(bits[0],2),pad(bits[1],2)].join('');
}

function midnight(){
  var d = new Date();
  return (new Date(d.getUTCFullYear()+'-'+pad((d.getMonth()+1),2)+'-'+pad(d.getDate(),2)))
}

function addDays(date, days, long) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return {
    date: result,
    ymd: date2ymd(result,long),
    dow: result.getDay()
  }
}

$.dui.page.nav = function(){
  if($.dui.page.month > 11) {
    $.dui.page.month = 0;
    $.dui.page.year ++;
  } else if($.dui.page.month < 0){
    $.dui.page.month = 11;
    $.dui.page.year --;  
  }
  var ops = $('#calendar').datagrid('options');
  ops.queryParams.month = $.dui.page.month+1;
  ops.queryParams.year = $.dui.page.year;
  $('#calendar').datagrid('load');
}

$.dui.page.resize = function(){
  var total = $('#calendar').datagrid('getData').total;
  setTimeout(function(){
    var ht = $('.datagrid-body').innerHeight();
    var os = ((ht-25)/total)-25;
    $('ul.day-body').height(os+'px');
  });
}

$.dui.page.clear = function(){
  ['CAL_TYPE_ID','CAL_CLASS_ID','START_DATE','END_DATE','REMARKS','CAL_ID'].map(function(el){
    $('input[textboxname='+el+']').textbox('clear');
  })
}

$.page.ready(function(){
  
  $.parser.parse('#edit');
  $('#edit').dialog({
    title: 'Edit Calendar Tasks',
    closed:true,
    buttons:[
    {
  		id: 'tclone',
  		text:'Clone',
  		iconCls: 'icon-clone',
  		handler:function(){
        var fdat = $('#edit form').form('getData');
        if(fdat.CAL_TYPE_ID.substr(0,5)=='LEAVE') return msgbox('Disallow to clone Leave Application');
    		$(this).linkbutton('disable');
    		$('#CAL_ID').textbox('clear');
    		$('#edit #_func').val('add');
      }
    },
    {
      id:'tdelete',
  		text:'Delete',
  		iconCls: 'icon-delete',
  		handler:function(){
  		  var fdat = $('#edit form').form('getData');
        if(!fdat.CAL_ID) return false;
        if(fdat.CAL_TYPE_ID.substr(0,5)=='LEAVE') return msgbox('Disallow to delete Leave Application');
  		  confirm(function(yn){
    		  if(yn){
      		  ajaxget('/',{_func:'del',_sqlid:'co^cal_schedule',CAL_ID:fdat.CAL_ID},function(){
        		  $('#calendar').datagrid('load');
        		  $('#edit').dialog('close');  
      		  })      		  
    		  }  
  		  })
  		}
  	},
    {
      id:'tsave',
  		text:'Save',
  		iconCls: 'icon-save',
  		handler:function(){
        var frm = $('#edit form');
        if(!frm.form('validate')) return;
        var fdat = frm.form('getData');
        if(fdat.CAL_TYPE_ID.substr(0,5)=='LEAVE') return msgbox('Disallow to save Leave Application');
  		  if(fdat.END_DATE < fdat.START_DATE) return msgbox('END cannot be before START')
  		  ajaxget('/',fdat,function(){
    		  $('#calendar').datagrid('load');
    		  $('#edit').dialog('close');  
  		  });
  		}
  	},{
  		text:'Close',
  		iconCls: 'icon-cancel',
  		handler:function(){$('#edit').dialog('close')}
    }]
  })

  $('#rel').linkbutton({
    onClick:function(){
      $('#calendar').datagrid('load');
    }  
  })
  
  $('#fwd').linkbutton({
    onClick:function(){
      $.dui.page.month ++;
      $.dui.page.nav();
    }  
  })
  
  $('#bak').linkbutton({
    onClick:function(){
      $.dui.page.month --;
      $.dui.page.nav();
    }    
  })
  
  if($.dui.page.isedit) $('#glob').linkbutton({
    text: 'Global',
    iconCls:"icon-global",
    size:"small",
    toggle:true,
    onClick:function(){
      var qp = $('#calendar').datagrid('options');
      var ops = $(this).linkbutton('options');
      if(ops.selected) qp.queryParams.global = 'y';
      else qp.queryParams.global = 'n';
      $('#calendar').datagrid('load');
    }    
  })
  
  $('#calendar').datagrid({
    url:'/',
    queryParams:{
      _func:    'data',
      _sqlid:   'co^cal_schedule',
      month:    $.dui.page.month+1,
      year:     $.dui.page.year,
      global:   'n'
    },
    fit:true,
    fitColumns:true,
    columns:[[
      {field:'1',title:'Monday',width:28.5,align:'center',formatter:$.dui.page.day},
      {field:'2',title:'Tuesday',width:28.5,align:'center',formatter:$.dui.page.day},
      {field:'3',title:'Wednesday',width:28.5,align:'center',formatter:$.dui.page.day},
      {field:'4',title:'Thursday',width:28.5,align:'center',formatter:$.dui.page.day},
      {field:'5',title:'Friday',width:28.5,align:'center',formatter:$.dui.page.day},
      {field:'6',title:'Saturday',width:28.5,align:'center',formatter:$.dui.page.day},
      {field:'0',title:'Sunday',width:28.5,align:'center',formatter:$.dui.page.day},
    ]],

    onLoadSuccess:function(data){
      $.dui.page.resize();
      var opt = $(this).datagrid('options'); 
      
      setTimeout(function(){
        // remarks tooltip
        $('li.easyui-tooltip').tooltip();
        
        // Drag & Drop
        var clicks = 0;
        $('li.easyui-draggable').draggable({
          onBeforeDrag: function(e){
            setTimeout(function(){
              clicks = 0;
            },500)
            //cl(e.which);
            //if(e.which == 3) return false;
          }
        });
        
        $('ul.easyui-droppable').droppable({
          accept: 'li.easyui-draggable',
          onDrop: function(e,src){
            $(this).append(src);
            $(this).removeClass('over');
            $(src).removeAttr('style');
            var data = $.dui.page.calids[$(src).data('id')];
            data.START_DATE = $(this).data('ymd');
           // cl(data);

          }
        });

        // higlight multiple days
        $('ul.day-body > li').hover(
          function(){
            $('li[data-id='+$(this).data('id')+']').addClass('hover');
          },
           function(){
            $('li[data-id='+$(this).data('id')+']').removeClass('hover');
          }         
        )
        
        // Add Task
        if($.dui.page.isedit && opt.queryParams.global=='n') $('.add-icon').on('click',function(e){
          var ymd = $(this).data('ymd');
          $.dui.page.clear();
          $('#edit form').form('load',{START_DATE:ymd,END_DATE:ymd});
          $('#edit #_func').val('add');
          $('#tclone').linkbutton('enable');
          $('#edit').dialog('open');
          
        })      
        
        // Edit Task
        if($.dui.page.isedit && opt.queryParams.global=='n') $('.day-body > li').off('dblclick').on('dblclick',function(){
          var me  = $(this);
          var data = $.dui.page.calids[me.data('id')];
          //cl(data);
          $('#edit form').form('load',data);
          $('#edit').dialog('open');
          $('#edit #_func').val('upd');
          
          if (data.CAL_TYPE_ID.substr(0,5)=='LEAVE'){
            $('#dit #tclone').linkbutton('disable');
            $('#dit #tsave').linkbutton('disable');
            $('#dit #tdelete').linkbutton('disable');
            
          }
        });
        
      })
    },
    
    onBeforeSelect:function(){return false},
    onResize:function(){$.dui.page.resize()},
    onRowContextMenu: function(e,idx,row){e.preventDefault();return false},
    
    loadFilter: function(data){
    
      $.dui.page.multis = {};
      $.dui.page.month = parseInt(data.month)-1;
      $.dui.page.year = parseInt(data.year);
      var sdate = new Date(Date.UTC(data.year,$.dui.page.month,1));
      var edate = new Date(Date.UTC(data.year,$.dui.page.month+1,0));
      var sdow = sdate.getDay();
      if(sdow==0) sdow = -6;
      else if(sdow>0) sdow = 1-sdow;
      var w1d1 = addDays(sdate,sdow,true);
      //cl('sdow:',sdow,'sdate:',sdate,'edate:',edate,'w1d1:',w1d1);
  
      $('span.month').text($.dui.page.months[$.dui.page.month]+' '+$.dui.page.year);
      
      var dob=w1d1, days=0, weeks=[];
      
      while(dob.date < edate) {
        var week = {};
        for (i = 1; i < 8; i++) {
          var dow=i; if(dow>6) dow=0;
          var dob = addDays(w1d1.date,days,true);
          var tasks=[]; 
          if(dob.ymd in data.days && dob.date.getMonth()==$.dui.page.month) tasks=data.days[dob.ymd].tasks;
          week[dow]={
            date:dob.date,
            ymd:dob.ymd,
            tasks: tasks
          }
          days ++;
        }
        weeks.push(week);
      }
      
      return {
        rows:weeks,
        total:weeks.length
      }     
    }
  })
  
})