// checkbox filters (tyfilt panel is commented out in Pug)
// $.page.fn.tfilt / $.page.fn.typfilt removed — no #tyfilt in DOM

//clone a PLAN ID
$.page.fn.cloneplan = function(){
  var planid = $('#CLONEPLAN #plan_id').combobox('getValue');
  var partid = $('#CLONEPLAN #CLONE_PART_ID').combobox('getValue');
  var gaugetype = $('#CLONEPLAN #CLONE_GAUGE_TYPE').combobox('getValue');
  
  var vars = {_func:'get',_sqlid:'dqm^cloneplan',SRC_ID:planid,PART_ID:partid,GAUGE_TYPE:gaugetype}

  ajaxget('/',vars,function(cldata){
		if(iserr(cldata)) return;
		$('#CLONEPLAN').dialog('close');
		$('#QPID').searchbox('reload');
		$('#QPID').searchbox('setValue',cldata.NEXT);
		
		var tr = $('#QPTREE');
		tr.tree('options').queryParams['_sqlid']='dqm^qptree';
		tr.tree('options').queryParams['qpref']=cldata.NEXT;
		tr.tree('reload');
	  
	   // cl(cldata);
  })
}
	
 // Procedure Tree
$.page.fn.tree = function(sqlid){  
  
  $('#QPTREE').tree({
    loadID: null,
    queryParams: {_tree:'y', _sqlid:'dqm^'+sqlid},
    url: '/?_func=get',
    onBeforeSelect:function(curr){
      var sel = $(this).tree('getSelected');
      return;
    },
    
    onContextMenu: function(e,node){
      e.preventDefault();
      $(this).tree('select',node.target);
      $('#trmenu').menu('show',{'left': e.pageX,'top': e.pageY});    
    },
    
    onSelect:function(node){
      var opt = $(this).tree('options');
      //if(!opt.loadID) opt.loadID = node.id; // ##PAC 151009 - reselect on save.
      $.page.fn.nodesel(node);
    },

    onBeforeLoad: function(node,param){
      //cl(node);
      var sel = $(this).tree('getSelected');
     // cl('onBeforeLoad selected:'+sel);
      //if(sel && !opt.loadID) opt.loadID = sel.id;   
    },
    
    onLoadSuccess: function(node,data){
      var root = $(this).tree('getRoot');
      var opt = $(this).tree('options');
      if(opt.loadID) { // auto-select new node.
        var node = $(this).tree('find',opt.loadID);
        $(this).tree('select',node.target);
        opt.loadID = null;
      }
      else if(root) $(this).tree('select',root.target);
      $.page.fn.saved = true;
    }
  })
}

//selector COMBO
$.page.fn.qpid = function(cbo,ref){
  var opts = $(cbo).searchbox('options');
  opts.onSelect = function(rec){
    var tr = $('#QPTREE');
    tr.tree('options').queryParams[ref]=rec.value;
    tr.tree('reload');
    $.page.fn.fkey = rec.value;
  };
}
// tab enabler
$.page.fn.taben = function(idx){
  var tab = $('#MAINTAB');
  tab.tabs('disableAll');
  if(typeof(idx)=='number') idx=[idx];
  for(var i in idx){
    tab.tabs('enableTab',idx[i]);
    tab.tabs('select',idx[i]);
  }
}

// Add New Plan or Procedure
$.page.fn.add = function(item){
  $('#content .fkey:visible').focus();
  var frm = $('#content form:visible');
  frm.attr('mode','add').form('options').ignore = false;
  if(item.name=='PROC') $.page.fn.procadd();
  else {  // New Plan
    if (item.name.substr(0,5)=='CLONE'){
		var cboMain=$('#QPID');
		var cboClone=$('#CLONEPLAN #plan_id');
		cboClone.combobox('setValue',cboMain.searchbox('getValue'));
		$('div#CLONEPART').hide();
		$('div#CLONEGAUGE').hide();
		$('div#'+item.name).show()
		if (item.name=="CLONEPART")var url = '/?_func=get&_combo=y&_sqlid=dqm^qphids&_filt=PART';
		else var url = '/?_func=get&_combo=y&_sqlid=dqm^qphids&_filt=GAUGE';
	  cboClone.combobox('reload',url);
	  var dialog=$('#CLONEPLAN');
	  dialog.dialog({title:'Clone Option : '+item.name.substr(5)});
	  $('#CLONEPLAN').dialog('open');

	}
	else {
		delete $.page.fn.lproc;
		frm.form('reset');
		$('form#qpplan').form('reset');
		$('#QPID').searchbox('clear');
		$('#QPTREE').tree('loadData',[]);
		$.page.fn.taben(0);
		$('#plantype').combobox('select',item.name); 
	}

  }
  
}

// tree node select
$.page.fn.nodesel = function(node){  
  var qpref = node.id;

  var isproc = $('#QPTREE').tree('isLeaf',node.target);
  if(isproc){
    var frm = $('form#qpproc');
    $.page.fn.taben(1);
  } 
  
  else {
    var frm = $('form#qpplan');
    $.page.fn.taben(0);
  }

  if(node.edit){
    var bits = node.id.split('^');
	$('#PLAN_ID').val(bits[0]);
	$('#SEQ_NO').textbox('setValue',bits[1]);
  } 
  else {
    var url = '/?_func=get&_sqlid=dqm^qpref&qpref='+qpref; 
    frm.form('load',url);
    frm.attr('mode','upd');
  }
}

// Plan-Type Selection
$.page.fn.ptsel = function(rec){
  var typ=$('#samtype'), qty=$('#samqty');
  var stat = ['PART','GAUGE'], ron=false; 
  for(var i in stat){
    var hs='hide'; if(rec.value==stat[i]) hs='show';
    $('#'+stat[i]+'div')[hs]();
  }
  var ron=false;
  if(rec.value=='GAUGE'){
    typ.combobox('select','fixed');
    qty.numberbox('setValue',1);
    ron = true;
    
    euifocus('#GAUGE_TYPE');   // << This must be Last
    
  } else {
    typ.combobox('select','percent');
    var cbo = $('#PART_ID');
    var url = '/?_func=get&_combo=y&_sqlid=dqm^partPlan'+($.dui.bhave.partType||'');
    cbo.combobox('reload',url);

    euifocus('#PART_ID'); // << This must be Last
  }
  
  $('#GAUGE_TYPE').combobox('required',ron);
  $('#PART_ID').combobox('required',!ron);
  
  typ.combobox('readonly',ron);
  qty.numberbox('readonly',ron);    
}


// Tree Context menu
$('#trmenu').menu({
  onClick: function(item){
    if(item.name=='seqin') {
      var node = $('ul#QPTREE').tree('getSelected');
      $.page.fn.procadd(node);
    }
  }  
})

// Insert/Apend new procedure (seq)
$.page.fn.procadd = function(node){
  if(!$.page.fn.saved) return false;
  var frm = $('#qpproc'); 
  var fdat = frm2dic(frm);
  var tr = $('#QPTREE');
  var opt = tr.tree('options');
  var top = tr.tree('getRoot');

  if(node){ // insert-above
    var prev = tr.tree('getNode',$(node.target).parent('li').prev('li').find('div.tree-node')) || {'seq':0};
    if(!node.seq || node.seq - prev.seq < 2) return alert('Cannot insert here.');
    var next = prev.seq + Math.ceil((node.seq - prev.seq)/2); 
    var qpref = top.id+'^'+next;    
    tr.tree('insert', {
      before: node.target,
      data:[{
        'id':qpref, 
        'text':next, 
        'edit':true,
        'seq':next
      }]
    }); 
  } 
  
  else {
    var last = tr.tree('getLeafs').slice(-1)[0]; 
    var next = last.seq+10; 
    var qpref = top.id+'^'+next;    
    tr.tree('append',{
      parent:top.target,
      data:[{
        'id':qpref, 
        'text':next, 
        'edit':true,
        'seq':next
      }]
    });
  }
  
  tr.tree('select',tr.tree('find',qpref).target);
  frm.form('clear');
  $('form#qpproc #SEQ_PLAN_ID').val(top.id);
  $('form#qpproc #SEQ_NO').textbox('setValue',next);
  frm.attr('mode','add');
  for(var m in $.dui.bhave){
  	var bits = m.split('MEM_');
  	if($.dui.bhave[m]=='y' && bits[1]) $('#'+bits[1]).textbox('setValue',fdat[bits[1]]);
  }
  
  // opt.loadID = qpref; // auto-select the new node.
  $.page.fn.saved = true;
}

/*
$.page.fn.target_siteids = function(){
  var TSITE = $('#TARGET_SITE_ID');
  var vars = {_func:'get',_sqlid:'admin^site_ids'}
  var arr=[];

  ajaxget('/',vars,function(data){
    if (data){
      TSITE.combobox('loadData',data)

    }
  })
}
*/
$.page.fn.copyplan =  function(){
  var TSITE = $('#TARGET_SITE_ID').combobox('getValue');
  var QID = $('#QPID').searchbox('getValue');

  var vars = {_func:'add',_sqlid:'dqm^qpplancopy',TARGET_DB:TSITE,PLAN_ID:QID}
  ajaxget('/',vars,function(data){
    //if (data){
      $('#cplanopt').dialog('close');
    //}
  })
}
// wait for page to load
$.page.ready(function() {
  /*
  toolbut([ 
		{
			id:'copyplan',
			iconCls: 'icon-rename',
			text: 'Copy Plan',
			disabled:false,
			noText: true,
			onClick: function(){
        //$.page.fn.target_siteids();
        var pid = $('#QPID').combobox('getValue');

				if (!pid) return;
				else {
          confirm(function(yn){
            if(yn){
              $.page.fn.target_siteids();
              var cid = $('#SOURCE_PLAN_ID');
              cid.textbox('readonly',true);
              cid.textbox('setValue',pid);
              $('#cplanopt').dialog('open');
            } 
          },'This is permanemt,are you sure ?');
      }

			}
		}
  ]); 

  if ($.dui.bhave.copyplan =="y") {
    $('#copyplan').linkbutton().show();
    $('#copyplan').linkbutton('enable');
  }
  else {
    $('#copyplan').linkbutton().hide();
    $('#copyplan').linkbutton('disable');
  }
  */
  // Before Save.
  $('#but_save').on('beforeClick',function(){
    var tr = $('#QPTREE');
    var sel = tr.tree('getSelected');
    var opt = tr.tree('options');
    if(sel) opt.loadID = sel.id;
    return true;
  })  
   
  // Filter Gauge IDs (Header and Procedure)
  $('#GAUGE_TYPE, #P_GAUGE_TYPE').combobox({
    onSelect:function(rec){
      var opt = $(this).combobox('options');
      var gid = $($(this).data('gid'));
      gid.combobox('clear');
     // cl(gid.attr('id'));
	  if (gid.attr('id')=="GAUGE_ID") var sqlname="dqm^gaugePlanHeader";
	  else var sqlname="dqm^gauge1";
	  
      var url = '/?_func=get&_sqlid='+sqlname+'&GAUGE_TYPE='+rec.value;
      gid.combobox('reload',url);
      gid.combobox('readonly',false);  
    }
  })
  
  $('#CLONEPLAN #plan_id').combobox({
  	onSelect :function(rec)  {
  		$('div#CLONEPART').hide();
  		$('div#CLONEGAUGE').hide();
  		$('div#CLONE'+rec.TYPE).show();
  		if (rec.TYPE=='PART'){
  			var cbo = $('#CLONE_PART_ID');
  			var url = '/?_func=get&_combo=y&_sqlid=dqm^partPlan'+($.dui.bhave.partType||'');
  			cbo.combobox('reload',url);
  			cbo.combobox('required',true);
  			
  			var cbo1=$('#CLONE_GAUGE_TYPE');
  			cbo1.combobox('required',false);
  		}
  		else{
  			var cbo = $('#CLONE_PART_ID');
  			cbo.combobox('required',false);
  			var cbo1=$('#CLONE_GAUGE_TYPE');
  			cbo1.combobox('required',true);
  		}
  		$('#QPID').searchbox('setValue',rec.value);
  		var tr = $('#QPTREE');
  		tr.tree('options').queryParams['_sqlid']='dqm^qptree';
  		tr.tree('options').queryParams['qpref']=rec.value;
  		tr.tree('reload');
  	}
  })
  $('#plantype').combobox({onSelect:$.page.fn.ptsel});
  
  // Add=New Menu
  $('#addmenu').menu({
    onShow:function(){
      var mode='disableItem';
      if($('#QPID').searchbox('getValue')) mode='enableItem';
      $(this).menu(mode,$(this).menu('findItem','Procedure').target);
    },
    onClick: $.page.fn.add
  });

  // wait for widgets to initialize (runs after dui:contentloaded)
  setTimeout(function(){

    // Main Combo, Tree
    $.page.fn.qpid('#QPID','qpref');
    $.page.fn.tree('qptree');

    $('form#qpplan').form({
      ignore: true,

      success:function(data){
        var me = $(this);
        var func = me[0].queryParams._func;
        var sel = $('#QPTREE').tree('getSelected');
        if(sel) delete sel.edit;

        $.fn.form.defaults.success.call(this, data);

        // After default handles state + iserr, do custom logic
        var res = (typeof data === 'string') ? JSON.parse(data) : data;
        if (!res.error){
    			if (func=='del') but_clr();
    			else if(!$('#QPTREE').tree('getRoot') && func=='add'){
    				$('#QPID').searchbox('setValue',res._next);
    				$('#QPID').searchbox('reload');
    				var tr = $('#QPTREE');
    				tr.tree('options').queryParams['_sqlid']='dqm^qptree';
    				tr.tree('options').queryParams['qpref']=res._next;
    				tr.tree('reload');
    			}
    		}
      },

      onBeforeLoad:function(){
        $.fn.form.defaults.onBeforeLoad.call(this);
        $(this).form('options').ignore = true;
      },

      onLoadSuccess:function(data){
        $.fn.form.defaults.onLoadSuccess.call(this, data);

        //check if the PLAN linked to JOB, disable the PART ID for selection
        var cboP=$('form#qpplan #PART_ID');
        if (data._BASE_ID) cboP.combobox('readonly',true);
        else cboP.combobox('readonly',false);

        $.page.fn.ptsel({value:$('#plantype').combobox('getValue')});
        $(this).form('options').ignore = false;
        $('#qpfiles').datagrid('docFiles',$.page.fn.fkey);
      }
    });
    
  })




})