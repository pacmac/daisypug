// Callbacks from other applications.
$.page.fn.newgauge = function(qpg){   
  // #PAC-150918# qpg = PLAN_ID^GAUGE_ID
  var bits = qpg.split('^');
  if(bits.length !=2) return alert('Need gauge and plan ID.') 
  $('#QPTREE').tree('options').queryParams.GAUGE_ID = bits[1];
  $.page.fn.new('GAUGE',bits[0]);
}

$.page.fn.newpart = function(qpid){ 
  $.page.fn.new('PART',qpid); 
}

// Load all uid with a single call
$.page.fn.uid = function(){
  var vars = {_func:'get', _combo:'y',_sqlid:'dqm^uidall',_displayorder:'FL'}
  //setTimeout(function(){
    ajaxget('/',vars,function(data){
  		$('#CALIBRATED_BY,#REVIEWED_BY').combobox({
  	    required:true,
  	    editable:false,
  	    data: data.uid,
  	    onSelect:function(rec){ 
    	    var emid = '#'+$(this).attr('id')+'_EMAIL';
    	    cl(emid);
    	    $(emid).val(rec.email);
    	  }
  		});

    })
  //})
}

$.page.fn.newjob = function(basid){
  $('#WOREF').searchbox('options').autoload = basid;
  $.page.fn.new('PART');
}

// add NEW test
$.page.fn.new = function(name,qpid,docid,cb){
  
  // Initialize (if not alredy)
  if(!$.page.fn.isadd){

    // set some global flags
    $.page.fn.isadd = true;
    $.page.fn.issel = false;  // < this is true when selecting the PLAN_ID

    // initialize
    $.page.fn.clear();
    $.page.fn.taben([3,0]);

    // select test-type
    if(!qpid) $.page.fn.types(name);    

    // load the combo data
   // if(name=='PART') $('#WOREF').combobox('reload','/?_sqlid=dqm^basid&_func=get');    

    $('span.textbox.bg-red').removeClass('bg-red');
    $('#CREATE_DATE').datebox('today');
    $('#QPID').searchbox('readonly',true);
    $('form#qtplan').attr('mode','add');
    butEn('sx');
    
    // Note to CLS - why are we doing this ?
    //$('#CALIBRATED_BY').combobox('unselect'); // UN-Select Current User ID 
    //$('#CALIBRATED_BY').combobox('selected'); // RE-Select Current User ID
  }
  
  // NEW tree needs BOTH qpref & qtref
  //cl(qpid);
  var qpt = $('#QPTREE'); 
  qpt.tree('options').queryParams.qpref = qpid;
	
	if(qpid) $.page.fn.load("NEW TEST",qpid);
	if(typeof(cb)=='function') cb(qpid);
}

// clear page data
$.page.fn.clear = function(){
  $('#QPID').searchbox('clear');
  $('form#qpplan').hide().form('clear');
  $('form#qtplan').form('clear');
  $('form#qpproc').form('clear');
  $('#QPTREE').tree('loadData',{total:0,rows:[]});   
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
  if (idx==0)butEn('sxad');//enable DELETE button if TEST header was selected. changed by CLS, OCT/09/2015 10:45AM
}

// load new test
$.page.fn.load = function(qtref,qpref){
  var tr = $('#QPTREE');
  tr.data('qtid',qtref);
  tr.tree('options').queryParams.qtref=qtref;
  if(qpref) tr.tree('options').queryParams.qpref=qpref;
  //return cl(tr.tree('options').queryParams);
  tr.tree('reload');
  $.page.fn.taben([0]);
}

// Test-Type Switches
$.page.fn.types = function(type){    
  var gdiv=$('#GAUGEdiv'), jdiv=$('#JOBdiv');
  var gcbos = $('#GAUGE_TYPE, #GAUGE_PLAN_ID, #GAUGE_ID'); 
  
  if(type=='GAUGE'){
    gdiv.show(); jdiv.hide(); 
    gcbos.combobox('required',true);
    if($.page.fn.isadd) $('#GAUGE_TYPE').combobox('readonly',false);
    else gcbos.combobox('readonly',true); /* PAC 151229 */
  } 
  
  else {
    gdiv.hide(); jdiv.show(); 
    var wor = $('#WOREF');
    gcbos.combobox('required',false);
    //if(!$.page.fn.isadd) wor.combobox('readonly',true);
    //else wor.combobox('readonly',false);
  }
  $('#PLAN_TYPE').val(type);  
}

// Calculate Variances
$.page.fn.vari = function(val,upp,low){
  if(val=='') return '';
  if(val > upp) var vari = '+' + fixed(val-upp);
  else if(val < low) var vari = fixed(val-low);
  else var vari = fixed(0);  
  return vari;
}

// update tree node.tests & add rows to datagrid
$.page.fn.tests = function(tr,node){
  
  var tdat = frm2dic($('form#qtplan'));
  var sqty = tdat.TEST_SAMPLE_QTY;
  var qti = tdat.TEST_ID;
  var rows = []; 
  
  for (i=0; i < sqty; i++) {      
    var res={}; node.tests.map(function(e){if(e.TICK_SEQ==i) res=e;})
    var mode='add'; if(res.TEST_ID) mode='upd';
    var vari = $.page.fn.vari(res.VALUE, node.proc.VUPP,node.proc.VLOW)
    
    // do Some Basic Validation
    if(['value','bool'].indexOf(node.proc.LTYPE)==-1) return alert('Invalid Test Type: '+node.proc.LTYPE);
    if(typeof res.VALUE === 'undefined') res.VALUE = '';
    
    var row = {
      "_node": node,
      "_func": mode,
      "TEST_ID": qti,
      "PROC_SEQ": node.proc.SEQ_NO,
      "TICK_SEQ": i,
      "BOOL_TEXT": node.proc.BOOL_TEXT,
      "LTYPE": node.proc.LTYPE,
      "VNOM": node.proc.VNOM,
      "VLOW": node.proc.VLOW,
      "VUPP": node.proc.VUPP,
      "VALUE": res.VALUE,
      "VAR": vari,
      "STATUS": res.STATUS || "None",
      "GAUGE_ID":res.GAUGE_ID,
      "NOTES": res.NOTES
    }  
    rows.push(row);
    tr.tree('update',{'target':$(node.target),'rows':rows})
  }

  var dg = $('#qpdata');
  dg.datagrid('loadData',{total:rows.length, rows:rows});
}

// Calculate sample size
$.page.fn.samp = function(){
  var plan = frm2dic($('form#qpplan'));
  var test = frm2dic($('form#qtplan'));
  var tqty = parseInt(test.TEST_SAMPLE_QTY);
  if(tqty != '' && tqty > 0) return;
  
  var pqty = plan.SAMPLE_QTY;
  if(plan.SAMPLE_TYPE == 'percent'){
    var wqty = test.TEST_QTY;           
    var sqty = Math.ceil((pqty/100)*wqty)  
  } else var sqty = pqty;
  
  $('#TEST_SAMPLE_QTY').numberbox('setValue',sqty);
  return sqty;  
}

// Set Tree Pass/Fails
$.page.fn.ticks = function(){
  var tr = $('#QPTREE');
  var sqty = parseInt($('#TEST_SAMPLE_QTY').numberbox('getValue'));  
  var os={'ttl_tests':0, 'tests_per_proc':0, 'ttl_fail':0, 'fail_per_proc':0, 'ttl_pass':0, 'pass_per_proc':0, 'ttl_none':0, 'none_per_proc':0};
  var leafs = tr.tree('getLeafs');
  //cl(leafs);
  for(var l in leafs){    
    var tests = leafs[l].tests;
    os.ttl_tests += sqty; os.tests_per_proc = tests.length; 
  	
  	for(var t in tests){
  		switch (tests[t].STATUS){
  			case "None":
  				os.none_per_proc = os.none_per_proc+1;
  				os.ttl_none =os.ttl_none+1;
  				break;
  			case "Fail":
  				os.fail_per_proc =os.fail_per_proc+1;
  				os.ttl_fail =os.ttl_fail+1;
  				break;
  			case "Pass":
  				os.pass_per_proc =os.pass_per_proc+1; 
  				os.ttl_pass =os.ttl_pass+1;
  				break;
  			default:
  			  break;
  		}
    }

    if(tests.length==0) return; // PAC 150917
    
    if(tests.length < sqty) tests[t].STATUS = 'None';
    var cls = {'None':'icon-qmark','Pass':'icon-tick','Fail':'icon-cross'}[tests[t].STATUS];  
    var tgt = $(leafs[l].target);
    tr.tree('update',{'target':tgt,'iconCls':cls}); 
  }

  $.page.fn.status(os);
}

// set OVERALL Status
$.page.fn.status = function(os){ 
  var res='',tdat = frm2dic($('form#qtplan'));
  var dgop = $('#qpdata').datagrid('options');  
  var stat='OPEN'; 
  
  if(os.ttl_tests == os.ttl_pass+os.ttl_fail) {
    var stat = 'COMPLETED';
    var lbe = 'enable';
    if(os.ttl_fail > 0) var res='FAILED'
    else var res = 'PASSED';
  } else {
	  if (os.ttl_pass>0 || os.ttl_fail>0 ) var stat = 'STARTED';
  }
  
  if(tdat.STATUS != 'CLOSED') {
    $('#STATUS').textbox('setValue',stat);
    dgop.readonly = false;
    
 	  ajaxget('/?_sqlid=dqm^qt_test',{_func:"upd",TEST_ID:tdat.TEST_ID,STATUS:stat},function(data) {
			$('#close').linkbutton(lbe); 
		  $('#RESULT').next('span.textbox').removeClass('bg-red bg-grn').addClass({'FAILED':'bg-red','PASSED':'bg-grn'}[res])
		  $('#RESULT').textbox('setValue',res);
		  
		  var tr = $('#QPTREE');
		  var tgt = $(tr.tree('getRoot').target);
		  //cl({'FAILED':'icon-folder_fail','PASSED':'icon-folder_pass'}[res]);
		  tr.tree('update',{'target':tgt,'iconCls':{'FAILED':'icon-folder_fail','PASSED':'icon-folder_pass','':'icon-folder-open'}[res]}); 
		  //tr.tree('reload');
		  saveok('ok');
	  })
  
 } else {
    
    dgop.readonly = true;
    var lbe = 'disable';
  }
  
}

// Save a test row
$.page.fn.dgsave = function(rdat,cb){

  var tick = {  // database ticket
    "_func": rdat._func,
    "TEST_ID": rdat.TEST_ID,
    "PROC_SEQ": rdat.PROC_SEQ,
    "TICK_SEQ": rdat.TICK_SEQ,
    "VALUE": rdat.VALUE,
    "STATUS": rdat.STATUS,
    "GAUGE_ID": rdat.GAUGE_ID,
    "NOTES": rdat.NOTES
  }

  tick._func="upd";
  ajaxget('/?_sqlid=dqm^qt_ticket',tick,function(data) {
    rdat._func = 'upd';
    var tr = $('#QPTREE');
    var sel = tr.tree('getSelected');
    var tests = sel.tests; 
    var idx = objidx(tests,'TICK_SEQ',rdat.TICK_SEQ);
    if(idx==-1) tests.push(rdat);
    else tests[idx] = rdat;
    tr.tree('update',{'target':$(sel.target),'tests':tests});
    saveok('ok');
  })
}

$.page.fn.apply=function(){
	// PAC 161007 - Prevent Multiple Firing of reload.
	if($.page.fn.lock) return;
	$.page.fn.lock = true;	
	setTimeout(function(){
  	var cbox=$.page.fn.cbox();
  	var tid=$('#QPID');
  	var url = '/?_status='+cbox._status+'&_filt='+cbox._filt;  	
  	tid.searchbox('reload',url);
  	$.page.fn.lock = false;
	},250)
}

// set status button from cookie.
$.page.fn.cook_stat = function(){
  
  // set the CLASS
  var wocls = getacook('dqm^qp_test^wocls');
  if(!wocls.length) wocls=['PART'];
  $('#tyfilt input').each(function(){
    var tf=false; if(wocls.indexOf($(this).attr('name')) !=-1) tf=true; 
    $(this).prop('checked',tf);
  })

  // STATUS
  var stats = getacook('dqm^qp_test^stats');
  if(!stats.length) stats=['OPEN'];
  $('#selfilt a.toggle').each(function(){
    var na = $(this).attr('name');
    if(!(/COMPLETED|CLOSED/).test(na) && stats.indexOf(na) !=-1) $(this).trigger('click');
  })
}

// get check-box filters
$.page.fn.cbox = function(){
  var clsfilt = $('#tyfilt input'), stafilt= $('#selfilt input');
  //if(clsfilt.length == 0) return false; // not ready. 
  var stats = [], wocls = [];    
  $.each($('#selfilt a'), function(key,val) {if($(this).hasClass('l-btn-selected')) stats.push($(this).attr('name'));});
  $.each(clsfilt, function(key,val) {if($(this).prop('checked')) wocls.push($(this).attr('name'));});
  putacook('dqm^qp_test^stats',stats.join(','));
  putacook('dqm^qp_test^wocls',wocls.join(','));

  return {'_status':stats,'_filt':wocls};
}

$.page.ready(function() {

  // Open Calibration Plan.
  $('#PLAN_ID').textbox({
    icons:[{
      iconCls:'icon-godoc',
      handler: function(e){
        var val = $(e.data.target).textbox('getValue');
        if(val.length < 1) return false;
        loadpage('dqm^qp^qp_qpman&QPID='+val);        
      }
    }]
  }) 

  // AddNew Menu
  $('#addmenu').menu({
    onClick:function(item){
      $.page.fn.new(item.name);
	  
    }
  });

  // TEST form
  $('form#qtplan').form({

    onLoadSuccess:function(){
      var data = frm2dic($(this));

      if (data.TYPE==""){
        if (data.GAUGE_ID) data.TYPE="GAUGE";
      }
      $.page.fn.types(data.TYPE);
      $('#qpplan').show();
     // butEn('sxad');

     /*
      // Ensure WOREF option exists for loaded value
      var wv = data.WOREF;
      if(wv && wv.length > 0) {
        var wo = $('#WOREF');
        if(wo.find('option[value="'+wv+'"]').length === 0) {
          wo.append('<option value="'+wv+'">'+wv+'</option>');
        }
        wo.combobox('select', wv);
      }
      */
      if($.page.fn.isadd) $(this).attr('mode','add');
      else $(this).attr('mode','upd');

      console.log(data.TEST_ID);
      $.page.fn.fkey = data.TEST_ID;
      $('#qtfiles').datagrid('docFiles',data.TEST_ID);
	  },

    success: function(data){
      
      var fel = $(this);
      var func = fel[0].queryParams._func;
      setTimeout(function(){fel.attr('mode','upd');});
      
      $.page.fn.isadd = false;
      var tr=$('#QPTREE'), qpid=$('#QPID'), root=tr.tree('getRoot');
      var data=JSON.parse(data);
      
      //cl(root.value);
      //$('#qtfiles').datagrid('docFiles',root.value);

      if (data.error){
        alert(data.msg);
  			saveok('ko');      
      } else {
  			
  			// Delete OK
  			if (func=='del') but_clr(); 
  			
  			// Add OK
  			else {  
  				if(root && func=='add'){
						qpid.searchbox('reload');
						qpid.searchbox('setValue',data._next);
            qpid.searchbox('readonly',false);
						
						tr.tree('options').queryParams['qtref']=data._next;
						tr.tree('reload');					
  				} 
  			}
  			saveok('ok'); // flash the save button
      }
		
    }	  
	  
  })



  // TEST selector
  $('#QPID').searchbox({


    onSelect:function(rec){
      $.page.fn.load(rec.value);
      //console.log(rec.value);
    },

    onBeforeLoad: function(param){
      $.extend(param,$(this).combobox('options').queryParams)
    }

  })

  // PLAN Tree
  $('#QPTREE').data('qtid','').tree({
    queryParams: {},
    url: '/?_tree=y&_func=get&_sqlid=dqm^qt_tree',
    
    onBeforeSelect:function(curr){
      $.page.fn.editend();
      var sel = $(this).tree('getSelected');
      if(sel && $.page.fn.isadd) {
        alert('Save before continuing.')
        return false;
      }
    },
        
    onSelect:function(node){      
      var me = $(this);
      
      // enable the correct tabs.
      if(node.children) return $.page.fn.taben([3,0]);
      $.page.fn.taben([1,2]);
      
      // get/calc IDs
      var qpref = node.id;
      var seq = qpref.split('^')[1];
      var qtref = me.data('qtid')+'^'+seq;     
            

      // load procedure FORM
      $('form#qpproc').form('load',node.proc);  

      // load test DGRID without freeze
      setTimeout(function(){$.page.fn.tests(me,node)});
      butEn('xa');
      
    },

    onBeforeLoad: function(node,param){
      if(!param.qtref) return false; 
    },

    onLoadSuccess: function(node,data){
      delete $(this).tree('options').queryParams.qpref;
      var root = $(this).tree('getRoot');
      if(root) {
        // Fix YYYYMMDD → YYYY-MM-DD for HTML5 date inputs
        if(root.test) {
          ['CREATE_DATE','CLOSED_DATE'].forEach(function(f) {
            var v = root.test[f];
            if(v && v.length === 8 && v.indexOf('-') === -1) {
              root.test[f] = v.substring(0,4)+'-'+v.substring(4,6)+'-'+v.substring(6,8);
            }
          });
        }
        $(this).tree('select',root.target);
        $('#qtplan').form('load',root.test);
        $('#qpplan').form('load',root.test);
        $.page.fn.samp();   // set sample size
        $.page.fn.ticks();  // set tree ticks
        
        // Load Documents.
       // console.log(root);
        //$('#qtfiles').datagrid('docFiles',data[0].value);
       // $('#qtfiles').datagrid('docFiles',root.value);
      }
    }

  })

  // Selection #1 - W/O Selector (New Part Test)
  $('#WOREF').searchbox({
   // editable:false,
   // formatter: cbocols,
   // widths:['50%','50%','0%'],
    
    onSelect:function(rec){
      if($.page.fn.issel || !rec.PLAN_ID) return;
		  $.page.fn.newpart(rec.PLAN_ID);
		  $.page.fn.issel = true;		       
      $('#WO_QTY').textbox('setValue',rec.qreq);
      $(this).combobox('readonly',true);
    } 
  })

  // Selection  #1 - Gauge Type (New Gauge Test)
  $('#GAUGE_TYPE').combobox({
    editable:false,
	  url:'/?_sqlid=dqm^qt_gaugeType&_func=get',
	  onSelect:function(rec){
      $(this).combobox('readonly',true);
      setTimeout(function(){ 
        var gid = $('#GAUGE_ID');
        var url = '/?_func=get&_sqlid=dqm^qt_gaugeId&GAUGE_TYPE='+rec.value;
        gid.combobox('reload',url); gid.combobox('readonly',false); gid.combobox('required',true);
      })
	  }
  })

  // Selection #2 - Gauge Selector (New Gauge Test)
  $('#GAUGE_ID').combobox({
    editable:false,
    onSelect:function(rec){
      setTimeout(function(){    // PAC 151228 - added timeout
        var gt = $('#GAUGE_TYPE').combobox('getValue');
        var gpi = $('#GAUGE_PLAN_ID');
        var url = '/?_func=get&_sqlid=dqm^qt_qpid_test&GAUGE_ID='+rec.value+'&GAUGE_TYPE='+gt;
        gpi.combobox('reload',url); gpi.combobox('readonly',false); gpi.combobox('required',true);
      });
    }
  })

  // Selection  #3 - Gauge Plan Selector (New Gauge Test)
  $('#GAUGE_PLAN_ID').combobox({
    editable:false,
    onSelect:function(rec){
      if($.page.fn.issel || !rec.value ) return;
      $.page.fn.issel = true;
      var gid = $('#GAUGE_ID').combobox('getValue');
      $.page.fn.newgauge(rec.value+'^'+gid);
    }
  })

  // close & save test
  $('#close').linkbutton({
    iconCls: 'icon-tick',
    disabled: true,
    text: 'Close Test',
    onClick: function(){      
		//confirm(function(yesno){
		//	if (yesno){
					$('#STATUS').textbox('setValue','CLOSED'); 
					var cdate=$('#CLOSED_DATE');
					if (cdate.datebox('getValue')=="")$('#CLOSED_DATE').datebox('today');
					
					  var lb = $(this), fdat = frm2dic($('form#qtplan'));
					  fdat._func='end'; fdat._sqlid='dqm^qt_test';
					  ajaxget('/',fdat,function(data){
						lb.linkbutton('disable');
						var qid=$('#QPID');
						qid.searchbox('reload');
						//cl(data);  
					  }) 
		//	}
	
		//},'This will close the test, are you sure ?');
	}
  })
  
  
  
  //$('#clsfilt input').click(function(e){
  //  $.page.fn.apply();
 // });
  
  $('#selfilt a').linkbutton({onClick:$.page.fn.apply})
  $('#tyfilt').on('click',function(){$.page.fn.apply()})
  
  $.page.fn.cook_stat();
  $.page.fn.uid();

})
