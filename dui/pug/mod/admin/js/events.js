toolbut([
  {
    id: 'evt_xport',
    text: '',
    noText: true,
    disabled: true,
    iconCls: 'icon-download',
    onClick: function(){
      var frm = $('#treefrm');
      var fdat = frm2dic(frm);
      for(var k in fdat){if(fdat[k]=='') delete fdat[k]}
      fdat._appid = 'admin^events';
      jsonSave(fdat,fdat.id+'.json');
    }
  },
    {
    id: 'evt_import',
    text: '',
    noText: true,
    disabled: false,
    iconCls: 'icon-upload',
    onClick: function(){
      $.dui.page.noload = true;
      jsonLoad(function(data){
        if(data._appid != 'admin^events') return msgbox('Incompatible file.');
        var mode='load', tr=$('#mentree'), frm=$('#treefrm');
        var ex = tr.tree('find',data.id);
        if(ex) tr.tree('select',ex.target).tree('expandTo',ex.target)
        else {
          mode = 'preload';
          $.dui.page.addnew(data.app);
        }
        
        setTimeout(function(){
	        frm.form(mode,data);
	        frm.form('reselect');  
	      });
        butEn('asdx');
      })
    }
  },{} 
  
])

$.dui.page.vars = {
  type:'Event',
  moy: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec',]
}

$.dui.page.addnew = function(app){
  var tr = $('#mentree'), frm = $('#treefrm'), name='New '+$.dui.page.vars.type;
  if(app) tr.tree('select',tr.tree('find',app).target);
  var repf = $.dui.page.selfold();
  tr.tree('append',{'parent':repf.target,'data':[{'app':repf.app,'id':'_new_','text':name,'type':'item'}]});
  var sel = tr.tree('find','_new_');
  tr.tree('select',sel.target); tr.tree('expandTo',sel.target);
  but_add();
  $('#name').textbox('setValue',name);
  $('#app').val(repf.app); $.dui.page.awhen();
  $.dui.page.switches();
  //$('#tpl').combobox('select','A4P.xlsx');
}

// (Create and) select closest Reports Folder
$.dui.page.selfold = function(){
  var tr = $('#mentree');
  var sel = tr.tree('getSelected');
  if(!sel.type) var fold = $.dui.page.folder(sel.id);
  else if(sel.type=='item') var fold = tr.tree('getParent',sel.target);
  else var fold = sel;
  tr.tree('select',fold.target);
  return fold;  
}

// add-update switches
$.dui.page.switches = function(){
  var frm = $('#treefrm');
  var mode = frm.attr('mode');
  
  if(mode=='add'){
    var add = true;
    butEn('nsx'); 
  } else {
    var add = false;
    butEn('nsdx');  
  }

  //$('#tpl').textbox('readonly',!add);
  $('#ifile').textbox('readonly',!add);
  //$('#act').textbox('readonly',add);
  $('.lock').removeClass('lock');
}

// Add New Items Folder
$.dui.page.folder = function(appid){
  var tr = $('#mentree');
  var node = tr.tree('find',appid);
  if(node){
    var repid = node.id+'^reports';
    var repf = tr.tree('find',repid);
    if(!repf) tr.tree('append',{parent:node.target,data:[{'iconCls':'aicon-folder_comment','id':repid,text:$.dui.page.vars.type+'s','app':node.id, 'type':'fol'}]})
    return tr.tree('find',repid);
  }
}

$.dui.page.load = function(){
  ajaxget('/?_sqlid=admin^menus&_func=get',{},function(menu){
    ajaxget('/',{_func:'get',_sqlid:'admin^events'},function(reps){
      var tr = $('#mentree');
      tr.tree('loadData',menu);
      reps.map(function(e){
        var repf = $.dui.page.folder(e.app);
        if(repf) tr.tree('append',{'parent':repf.target,'data':[{'app':e.app, 'iconCls':'aicon-bell', 'id':e.id,'text':e.name,'type':'item'}]});
      })
      tr.tree('collapseAll');
      var last = tr.tree('find',getcook('admin^reports^last'));
      if(last) {
        tr.tree('select',last.target);
        tr.tree('expandTo',last.target);
        tr.tree('expand',last.target);
        //tr.tree('options').animate = true; 
      }
    })
  })
  
  ajaxget('/',{_func:'get',_sqlid:'admin^sqlids'},function(data){
    $.dui.page.sqlids = data;
  });
}

// has parent changed ?
$.dui.page.parent = function(tr,node){
  var lpid = tr.tree('options').lastpid;
  var cp = tr.tree('getParent',node.target); 
  if(lpid==cp.id) var ok=false; else var ok = true;
  lpid=cp.id; return ok;
}

// load filtered sqlids into combo.
$.dui.page.awhen = function() {
 var mod = $('#app').val().split('^')[0];
 var mods = $.dui.page.sqlids[mod].sort();
 var cbd=[]; mods.map(function(e){cbd.push({'value':e,'text':e})});
 $('#awhen').combobox('loadData',cbd);
}

// on-change set next.
$.dui.page.dotime = function(){
  if(!$.dui.page._loaded) return;  
  var ntt = new Date($('input#NTT').val());
  var month = $('#month').combobox('getValue'); 
  var day = $('#day').numberspinner('getValue');
  var time = $('#time').timespinner('getValue').split(':');
  ntt.setYear(new Date().getFullYear());
  ntt.setMonth(month); ntt.setDate(day); ntt.setHours(parseInt(time[0])); 
  ntt.setMinutes(parseInt(time[1])); ntt.setSeconds(0);
  $('input#NTT').val(ntt);
} 

// on LOAD set day & month
$.dui.page.dodate = function(){
  var ntt = new Date($('input#NTT').val()); 
  if(!ntt.isValid()) {
    var ntt = new Date(); ntt.setSeconds(0);
    $('input#NTT').val(ntt);
  }
  ntt.setSeconds(0);
  var time = ntt.getHrMin();
  var month = ntt.getMonth();
  var day = ntt.getDate();
  $('#month').combobox('select',month); 
  $('#day').numberspinner('setValue',day);
  $('#time').timespinner('setValue',time);
}


$.page.ready(function(){

  $('#subusers').datagrid({
    method: 'get',
    fit: true,
    fitColumns: true,
    rownumbers: true,
    striped: true,
    columns: [[
      {'field':'userid',title:'User ID',width:75, fixed:true},
      {'field':'uname',title:'User Name',fixed:false,width:200,formatter:function(val,row,idx){
        return row.name_last+', '+row.name_first;
      }},
    ]]
  })
  
  // Navigation
  setTimeout(function(){
    $('.cbnav').linkbutton({
      onClick:function(x){
        var fwd = $(this).hasClass('fwd');
        var tr = $('ul#mentree');
        var sel = tr.tree('getSelected');
        var reps=[], idx=-1, ridx;
        tr.tree('getLeafs').map(function(e,i){
          if(e.type=='item') {
            var cur=reps.push(e);
            if(sel && e.id==sel.id) idx=cur-1;
          }
        })
        if(fwd){
          if(idx==-1) ridx=0; 
          else if(idx >= reps.length-1) return;
          else ridx=idx+1;
        } else {
          if(idx==-1) ridx = reps.length-1
          else if(idx==0) return;
          else ridx = idx-1;
        }
        tr.tree('select',reps[ridx].target);
        tr.tree('expandTo',reps[ridx].target);
      }
    });
  },100);

  $('#month').combobox({
    data:[
      {value:0,text:'Jan'},{value:1,text:'Feb'},{value:2,text:'Mar'},{value:3,text:'Apr'},
      {value:4,text:'May'},{value:5,text:'Jun'},{value:6,text:'Jul'},{value:7,text:'Aug'},
      {value:8,text:'Sep'},{value:9,text:'Oct'},{value:10,text:'Nov'},{value:11,text:'Dec'}
    ],
    onChange: $.dui.page.dotime  
  })

  $('#day').numberspinner({
    max:31,
    min:1,
    increment:1,
    precision:0,
    onChange: $.dui.page.dotime
  })

  $('#time').timespinner({
    highlight:0,
    onChange: $.dui.page.dotime
  })

  //$('input#NT').timespinner({onChange:$.dui.page.dotime})

  $('#awhen').combobox({})
  
  // event trigger type
  $('#trigon').combobox({
    data:[
      {value:'None',text:'None'},
      {value:'user_event',text:'User Event'},
      {value:'timer',text:'Timer'},
      {value:'oneshot',text:'One Shot Event'},
      {value:'labor_tick',text:'Labour Ticket'}
    ],
    
    onSelect: function(rec){
      if(rec.value=='timer') $('#trigon_opt').show();
      else $('#trigon_opt').hide(); 
    }
  })

	// User Events
	$('#tsql').combobox({
		onSelect: function(rec){
			if(rec.value=='y'){
				var aty = $('#atype').combobox('getValue');
				if(aty=='system') $(this).combobox('select','n'); 	
			}
		}	
	})

  // action types
  $('#atype').combobox({
    data:[
      {value:'system',text:'System Call'},
      {value:'email',text:'Simple Email'},
      {value:'email-jade',text:'Template Email'},
      {value:'email-report',text:'Report Email'}
      //,{value:'popup',text:'Pop-Up Message'}
      //,{value:'rpt-xls',text:'XLS Report'}
      //,{value:'rpt-pdf',text:'PDF Report'}
    ],
    
    onSelect: function(rec){
      
      var em=$('#et_email'), rp=$('#et_rpt'), fn=$('#report_id'), tpl=$('#tpl');
      
      if(rec.value.split('-')[0] =='email') {
        em.show();
        tpl.textbox('enable');
      } else {
        em.hide();
        tpl.textbox('disable');
      }
      
      if(rec.value == 'email-report' || rec.value == 'email-jade') {
        rp.show();
        fn.textbox('required',true); 
      } else {
        rp.hide();
        fn.textbox('required',false);
      }
    }
  })
  
  // on change of event
  $('#name').textbox({
    onChange:function(nv,ov){
      var tr = $('#mentree');
      var sel = tr.tree('getSelected');
      if(sel && nv) tr.tree('update',{'target':sel.target,'text':nv})
    }
  })

  // enable nav buttons.
  eui.navi($('#name'));

  // main tree
  $('#mentree').tree({
    lastpid:null,
    animate:false,
    formatter:function(node){
      if(!node.count) return node.text; 
      return node.text + '<span class="count">('+node.count+')</span>';
    },

    onBeforeExpand:function(node){
  	  if($(this).tree('getLevel', node.target)==1) $(this).tree('collapseAll');
    },
  
    onClick:function(node){
      if(!node.id) return;
      var par = $(this).tree('getParent',node.target);
      putcook('admin^reports^last',par.id);
    },

    onBeforeSelect: function(node){
      var mode = $('#treefrm').attr('mode'); 
      if(mode=='add') return false;
      //if($.dui.page.parent($(this),node)) $(this).tree('collapseAll');   
    },

    onContextMenu: function(evt,node){
      evt.preventDefault();
    },

    onSelect:function(node){
      if(node.type != 'item' || node.id=='_new_') return;
      if($.dui.page.noload) {$.dui.page.noload = false; return;}
      
      var frm = $('#treefrm');
      frm.form('load','/?_func=get&_sqlid=admin^event&id='+node.id);
      frm.attr('mode','upd');
      $.dui.page.switches();
      $(this).tree('options').lastpid = $(this).tree('getParent',node.target).id;
      
      // subscribed users.
      $('#subusers').datagrid('reload','/?_func=get&_sqlid=admin^eventusers&evtid='+node.id);  
    }

    
  })

  $('#addmenu').menu({
    onClick:function(item){
      $.dui.page[item.name]();
    }
  })

  $('#ifile').textbox({
    invalidMessage: 'Invalid File Name',
    validType: 'file',
    onChange: function(nv,ov){
      var tr = $('#mentree');
      var sel = tr.tree('getSelected');
      var id = sel.app+'^'+nv; //cl(id)
      $('#id').val(id);
      $('#app').val(sel.app);  
    }
  })
  
  // afer form loads
  $('#treefrm').on('loadDone',function(jq,res){
    //$('#trigon').combobox('reselect');
    //$('#atype').combobox('reselect');
    $.dui.page.awhen();
    $.dui.page.dodate();
    $(this).form('reselect');
    $.dui.page._loaded = true;
    $('#evt_xport').linkbutton('enable');
  })
  
  // Main Form Submit-Success
  $('#treefrm').on('success',function(jq,res){
    var func = $(this).form('options').queryParams._func;
    if(func=='del') $.dui.page.load();
  })

  $.dui.page.load();
  /* CLS, 2020-6-18 
  report id should not pull from excel sqlite table,
  shold pull from reports.json file.

  $('#report_id').combobox({
    url:'/',
    queryParams:{
      _sqlid: 'admin^rep_ids_all',
      _func : 'get'
    },
    groupField: 'app',
    groupFormatter: function(grp){
      return grp.replace(/\^/g,'.');
    }
  })
  */
})

