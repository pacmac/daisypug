/*

  PAC 171004
  1. Remove loader from combo

  PAC 171110 - 2.2.1663
  1. check if 'loader' in array before removing [ if(idx>-1) data.splice(idx,1); ]  
  
  CLS 180223 - 2.2.1717
  1. added new field,DISPOSITION LIABILITY COST and enabled it based on selected Material Disposition
*/

/*
$.page.fn.cause=function(){
	//$('#CAUSE_ID').combobox('reload','/?_func=get&_combo=y&_vpath=dqm&_sqlid=cause');
}
*/
$.page.fn.disposition=function(rec){
        var bhave=$.dui.bhave.CPAR_DISPOSITION_LIABILITY_COST.split(",");
        var liaCost= $('#DISPOSITION_LIABILITY_COST');
        liaCost.removeClass('readonly');
        if (bhave.indexOf(rec)==-1) liaCost.numberbox('readonly',true);
        else liaCost.numberbox('readonly',false);
}

$.page.fn.cause_sel=function(rec){
	$('#CAUSE_DESCRIPTION').textbox('setValue',rec.description);
}

// automatically set status PAC150513
$.page.fn.switch = function(stat){
  var fdat = frm2dic($('form#ncrf'));
  stat = stat || fdat.STATUS;
  if(!stat) stat = 'PENDING';  // PAC 150513

	// update aliases (data-alias="XXX")
	$.each($('input[data-alias]'), function(idx, obj) {
    var val = $($(this).data('alias')).textbox('getText');
    $(this).textbox('setText',val);
  })
  
  //cl(stat);
  //if(!stat) return; // don't continue if no status.
	
	// new we APPLY all our settings
	$.page.fn.setup = $.page.fn.allstat[stat]; $.page.fn.setup.status = stat; // cl($.page.fn.setup);
	//if(!$.page.fn.seup) return false;
	if(!$.page.fn.edit && $.page.fn.setup.tab.length > 0) {
	  var tabs = $('#tabmain'); tabs.tabs('select',$.page.fn.setup.tab[0]);  // enable tabs
    $.page.fn.setup.tab.map(function(e,i){
      //tabs.tabs('update',{tab:tabs.tabs('getTab',e),options: {iconCls:'icon-qmark'}});   
    })
  }

	$.page.fn.endis($.page.fn.setup.en, $.page.fn.setup.req);  // set enabled & required fields.
	
	var cbo = $('#NCR_STATUS');
	if($.page.fn.edit) {
  	 $.page.fn.setup.asdpx = 'asdx';
  	 cbo.combobox('loadData',$.page.fn.statall());
  } else {
    $.page.fn.setup.asdpx = 'asx';
    if($.page.fn.setup.stat.length > 0){
      cbo.combobox('loadData',$.page.fn.setup.stat);
      cbo.combobox('select',stat);
	  }
  }
  
  if(cbo.combobox('options').readonly) var stlab = 'url(../icons/reload_ora.png) no-repeat 118px center';
  else var stlab = ''; $('#STATUS_LABEL').css('background',stlab);
	
  $.page.fn.buten();
 // console.log(fdat);
 if($.page.fn.allstat.GLOBAL.page=='cpar')$.page.fn.disposition(fdat.DISPOSITION_MATERIAL);
}

// every status
$.page.fn.statall = function(){  	
	var astat = [], alist=[];
	for(var i in $.page.fn.allstat){
    var stat = $.page.fn.allstat[i];
    if(stat.stat) stat.stat.map(function(e){
      if(alist.indexOf(e.value)==-1) {
        alist.push(e.value);
        astat.push(e);
      } 
    })
	} 
	return astat;  
}

// risk calculator
$.page.fn.risk = function(){
  var linp = $('#RISKLEVEL');
  if(linp.length==0) return;
  
  var rec = {'RARE':1,'OCCASIONAL':2,'FREQUENT':3}[$('#RECURRENCE').combobox('getValue')];
  var sev = {'LOW':1,'MEDIUM':2,'HIGH':3,'CRITICAL':5}[$('#SEVERITY').combobox('getValue')];
  var risks = {
    'L': {cls:'bg-grn', text:'LOW RISK',accept:'Acceptable','descr':'No additional control measures may be needed. However, frequent review may be needed to ensure that the problem is under control'},   
    'M': {cls:'bg-yel', text:'MEDIUM RISK',accept:'Moderatly Acceptable',descr:'Moderate risk level. Would require careful QC monitoring, corrective actions or preventative actions to ensure it is controlled'},
    'H': {cls:'bg-ora', text:'HIGH RISK',accept:'Generally Not Acceptable',descr:'High risk level with immediate impact on product quality and business. Requires immediate investigation and correction of faults as well as ongoing correction and prevention activities.'},
    'C': {cls:'bg-red', text:'CRITICAL',accept:'Not Acceptable in any way',descr:'Critical nature of risk threatens business, personnel, environment with possible catastrophic results. Requires attention from the highest level with immediate notification'} 
  }
  
  if(!rec || !sev) return;
  var val = rec*sev;
  
  var lev, risk; switch(true){
    case (val < 3): risk = risks.L; break;
    case (val < 5): risk = risks.M; break;
    case (val < 10): risk = risks.H; break;
    default: risk = risks.C; break;
  }
  
  linp.textbox('setValue',risk.text+' - '+risk.descr);
  $.page.fn.riskcls(risk.cls);
}

// set risk colours
$.page.fn.riskcls = function(cls){
  var rl = $('#RISKLEVEL');
  rl.textbox('textbox').removeClass('bg-grn bg-yel bg-ora bg-red');
  if(cls) rl.textbox('textbox').addClass(cls);
}

// enable / disable text & combo boxes
$.page.fn.endis = function(ens,req){
  //if(ens.length==0 || req.length==0) return false;
  var els = $('#content input[textboxname]:hidden:not(#NCR_ID)');
  els.each(function(){
    var me=$(this), id=me.attr('id');
    var type = me.attr("class").match(/easyui-(\w{1,})/)[1];
  	if($.page.fn.edit) {
    	var ed = false; var rq = false;
    } else {
    	if(!id || ens.indexOf(id) == -1) var ed=true; else var ed=false;
      if(!id || req.indexOf(id) == -1) var rq=false; else var rq=true;
    }
    me[type]('required',rq);
    me[type]('readonly',ed);

    $('#NCR_STATUS').combobox('required',true)
  });
}

// Operator - Set Department
$.page.fn.emp_sel = function(rec){
  $('#EMP_DEPARTMENT_ID').textbox('setValue',rec.DEPARTMENT_ID);
  $('#EMP_DEPT_HEAD').textbox('setValue',rec.HEAD_ID);
}

// set textbox with date.
$.page.fn.today = function(el){
  el.datebox('today');
  //el.textbox('setValue',isodate(new Date()));
  //el.textbox('setText',isodate(new Date(),true));
}

// enable buttons
$.page.fn.buten = function(){
  setTimeout(function(){
    butEn($.page.fn.setup.asdpx);
    //butEn('asdx');
  },100);
}

// reminder alert
$.page.fn.remind = function(){
  confirm(function(ok){
    if(!ok) return;
    var fdat = frm2dic($('#ncrf'));
    if($.page.fn.setup.reminder){
      var ems=[]; $.page.fn.setup.reminder.map(function(e){ems.push(fdat[e])});
      $('#_RECIPIENTS').val(ems.join(','));
    }
  	  
    fdat._RECIPIENTS = ems;
    fdat._sqlid = 'dqm^ncr_remind';
    fdat._func = 'upd';
    fdat._page=$.page.fn.allstat.GLOBAL.page;
    ajaxget('/',fdat,function(data){
      if(data.error) msgbox(data.msg);
      else msgbox("Reminders sent to \n"+ems.join("\n"));
    })      
  })
}


// blink the tab icons
$.page.fn.blink = function(){
  $('ul.tabs li.blink').removeClass('blink');
  $.each($('form#ncrf #maintabs .validatebox-invalid'),function(){
  eltab($(this)).tabel.addClass('blink');
  })
}


$.page.fn.unselect = function(cbo){
  cbo.combobox('unselect',cbo.combobox('getValue'))
}

$.page.fn.cleardata = function(){
  $('#WOREF_DESIRED_QTY').textbox('setValue','');
  $('#WOREF_PART_ID').textbox('setValue','');

    $('input[textboxname="WOREF_PART_UOM"]').textbox('setValue','');
    $('input[textboxname="WOREF_PART_PRODUCT_CODE"]').textbox('setValue','');
    $('input[textboxname="WOREF_PART_DESCRIPTION"]').textbox('setValue','');
    $('#WOREF_PART_REV_NO').textbox('setValue',''); 
}

// 221101- PAC - Other Source Selected
$.page.fn.src_other = function(src,emp,rec){
  //console.log(src);
  //console.log(rec);
  var sid = rec.source.toLowerCase();
  var ord = $('#ORDER_ID');
  $('#srcfs > legend').text(rec.text);  // set the legend title.
  
  // NO-JOB source hide everything except for Traceability.
  if(sid == 'none') { 
  	$.page.fn.unselect(ord)     // PAC 171003
  	$.page.fn.unselect(src.wor) // PAC 171003
  } 
  
  // Sales Order or Purchase Order
  else {          
      src.so.show();
      
      // Use a Cache & reuse S/O & P/O cache data if it has.
      var oopt = ord.combobox('options');
      var cache = sid+'_cache';
      
      if(!oopt[cache]) {  // data is NOT cached.
        ord.combobox('reload','/?_func=get&_combo=y&_sqlid=dqm^src_'+sid);  // load SO/PO data
        oopt[cache] = ord.combobox('getData');    

        var orderno=$('#ORDER_NO');
        if (sid=='ven')orderno.combobox('reload','/?_func=ncr&_combo=y&_sqlid=inv^polist&PO_TYPE=G');  // load SO/PO data
        else orderno.combobox('reload','/?_func=get&_combo=y&_sqlid=sales^sorefs&CUST_ID='+ord.combobox('getValue'));
      } 
      
      else {  // use cached data
        ord.combobox('loadData',oopt[cache]);
      }
  }
        
}


// 221101-PAC - Job Source Selected
$.page.fn.src_job = function(src,emp,rec){

  /*
    ## IMPORTANT 221101 ###
    see notes in $.page.fn.woref_sel() below.
  */

  src.wo.show();  // show wo combo.
  var woValue = src.wor.combobox('getValue');
  var woSplit = woValue.split("^");
  var woText = woSplit.join('.');
  var WoList = src.wor.combobox('getData');
  var frm = $('#ncrf');
  var filt = $("#srcwo > fieldset > div:nth-child(2) > a");
  //console.log(WoList)


  // 211101 - PAC - Only check when adding a NEW NCR.
  if (frm.attr('mode') == 'add' && $.dui.bhave.enforce_valid_job == "y") {
    src.wor.combobox('options').validType = ["inList"];
    //src.wor.combobox('options').validType.push('inList');
    src.wor.combobox('options').required = true;
    filt.css('pointerEvents','all');
  } else {
    src.wor.combobox('options').required = false;
    filt.css('pointerEvents','none');
  }

 
  // if employee combobox not loaded then load it.
  if(emp.combobox('getData').length==0){
    emp.combobox('reload','/?_func=get&_combo=y&_sqlid=dqm^empid');
  } 
  // get selected woref & manually call $.page.fn.woref_sel 
  var woref = src.wor.combobox('getValue');

  /*
    if WOREF combobox not loaded then load it & re-select woref
  */
  if(src.wor.combobox('getData').length==0) {
    src.wor.combobox('reload','/?_func=get&_combo=y&_sqlid=dqm^woref');
  } 
  
  /*
    WOREF combo is already loaded.
  */
  else {
    $.page.fn.woref_sel({text:woref,value:woref});
  }
    
  if (WoList.indexOf(woValue)==-1) WoList.push({"text":woSplit.join("."),"value":woValue,"_cols":woValue,"WORKORDER_BASE_ID":woSplit[0]});

  // Debug PAC
  // $.dui.bhave.enforce_valid_job = "y";

}

// WOREF selection (rec = SOURCE TYPE)
$.page.fn.woref_sel = function(rec){

  /*
    ## VERY IMPORTANT 221101 ###
    1. This function should ONLY execute when a new NCR is first created.
    2. The purpose is to one-time populate the fields into the NCR linked to the job.
    3. Once the record is saved, the data should be pulled from the NCR and NOT reloaded from the job.
    4. So the info saved into the NCR was the info at the time the NCR was created.
  */

  // PAC 221101 - User-Friendly WO-REF
  function setText(){
    var cbo = $('#WOREF'); 
    var value = cbo.combobox('getValue');
    cbo.combobox('setText',value.replace(/\^/g,'.'));
  }

  setText();
  if(!rec) return;
  
  var frm = $('#ncrf');
  var mode = frm.attr('mode');

  // PAC 171003 - only get job details during add.
  // console.log('ncr mode:'+mode);
  //if(mode != 'add') return; temp comment out by CLS, 9/18/2019
  
  // re-added by PAC 221101 (See IMPORTANT above)
  if(mode != 'add') return;
  
  var vars = {_func:'get', WOREF:rec.value,_sqlid:'dqm^woref1'}
  ajaxget('/',vars,function(data){
    for(var i in data){
      //console.log( i ,'---',data)
      $('input[textboxname="'+i+'"]').textbox('setValue',ireplace(data[i],/'/g,''))
    }
    $('#WOREF_INSPECT_QTY').numberspinner('set',{'min':0,'max':data.WOREF_DESIRED_QTY});
    $('#WOREF_REJECT_QTY').numberspinner('set',{'min':0,'max':data.WOREF_DESIRED_QTY});
    setText();
  })
 
 
}

// wait for the document to load
$( document ).ready(function() {

  // 171004 - Remove saved X & C Status
  var set = getcook('dqm^comp^ncr_man^WOREF'); 
  if((/X|C/).test(set)) delcook('dqm^comp^ncr_man^WOREF');

  // Toolbar buttons.
  toolbut([
    {
      id:'edit',
      text:'Edit '+$.page.fn.allstat.GLOBAL.page.toUpperCase(),
      iconCls: 'icon-edit',
      toggle:true,
      disabled: true,
      noText: true,
      onClick:function(){
        var sel = $(this).linkbutton('options').selected;
        if(sel && $.page.fn.editor) $.page.fn.edit = true;
        else $.page.fn.edit = false;
        $.page.fn.switch();
      }
    },
    {
      id:'ciadd',
      text:'CI Escalation',
      iconCls: 'icon-ci',
      disabled: true,
      noText: true,
      onClick:function(){
        var me = $(this);
        var ncrid = $('input#NCR_ID').searchbox('getValue'); 
        confirm(function(ok){
          if(!ok) return;  
          var type = 'QC_'+($.page.fn.allstat.GLOBAL.page).toUpperCase();
          var vars = {_func:'add', _sqlid:'dqm^ci', TYPE: type, NCR_ID:ncrid,SRC_TYPE:$.page.fn.allstat.GLOBAL.page.toUpperCase()}
          ajaxget('/',vars,function(data){
            if(!data.error) me.linkbutton('disable');
            msgbox(data.msg);
          })          
          
        },'Escalate '+ncrid+' to CI ?')
      }
    },
    {
      id:'reminder',
      text:'Send Reminder',
      iconCls: 'icon-email',
      disabled: true,
      noText: true,
      onClick: $.page.fn.remind
    },
    {},
    {
      id:'print_ncr',
      iconCls: 'icon-form',
      text: 'Print '+$.page.fn.allstat.GLOBAL.page.toUpperCase()+' Form',
      disabled: false,
      noText: true,
      onClick: function(){
        var formid = $.page.fn.allstat.GLOBAL.formid; 
        if(formid) printmen({id:formid})
      }
    },
    {}
  ])
  
 

  // PAC - 160117 — Load user list for responsibility combos
  ajaxget('/',{_func:'get',_sqlid:'dqm^uidall'},function(data){
    $.dui.pdata.uid = data.uid;
    $('input.user-combo').combobox({
      editable:false,
      data: data.uid,
      onSelect:function(rec){
        var emid = $(this).data('email'); if(emid) $(emid).val(rec.email);
        $('input[data-alias=#'+$(this).attr('id')+']').textbox('setValue',rec.text);
      },
    });
  });

  // Load cause codes for Cause tab
  ajaxget('/',{_func:'get',_sqlid:'dqm^cause'},function(data){
    $.dui.pdata.cause = data;
    $('#CAUSE_ID').combobox({data:data});
  });

  if($.dui.bhave.DISPOSITION_MATERIAL) $('#DISPOSITION_MATERIAL').combobox({data:JSON.parse($.dui.bhave.DISPOSITION_MATERIAL)});
  else $('#DISPOSITION_MATERIAL').combobox({data:$.page.fn.allstat.MATERIAL_REWORK.data});
  $('#RECURRENCE, #SEVERITY').combobox({onSelect:$.page.fn.risk});

  //CLS, 180222, if dispostion material match with bhave settting, enable LIABILITY COST
  if($.page.fn.allstat.GLOBAL.page=='cpar'){
    if ($.dui.bhave.CPAR_DISPOSITION_LIABILITY_COST){
      $('#DISPOSITION_MATERIAL').combobox({
        onSelect:function(rec){

          $.page.fn.disposition(rec.value);
        }
      })
    }    
  }



  $('#WOREF').combobox('filtertip',{
    singleSelect: true,
    default: ['R'],
    field: 'STATUS',
    data: [
      {name:'R',text:'Released'},
      {name:'U',text:'Un-Released',nosave:true},
      /*{name:'C',text:'Closed',nosave:true},
      {name:'X',text:'Cancelled',nosave:true},*/
    ]
  });


  $('#NCR_STATUS').combobox({
    onSelect:function(rec){
      if(rec.value=='REJECTED') $('#response input.easyui-combobox').combobox('required',false);
      if(typeof($.page.fn.setup.statsel)==='function') $.page.fn.setup.statsel(rec);
    }
  });

  /*
  // Source Selector
  $('#srcsel').combobox({
    panelHeight: 'auto',
    data: JSON.parse($.dui.bhave.srcsel), //$.page.fn.srcdoc, // < this needs to be customisable 
    editable: false, 
    
    onSelect: function(rec){
      
      var src = {wo:$('#srcwo'), so:$('#srcso'), wor:$('#WOREF')};
      src.so.hide(); src.wo.hide();
      var sid = rec.source.toLowerCase();
      //src.wor.combobox('reload','/?_func=get&_combo=y&_vpath=dqm&_sqlid=woref');
      if(sid == 'job') {
        src.wo.show();
        $('#EMPLOYEE_ID').combobox('reload','/?_func=get&_combo=y&_vpath=dqm&_sqlid=empid');
        //src.wor.combobox('reload','/?_func=get&_combo=y&_vpath=dqm&_sqlid=woref');
        ////if ($.page.fn.edit)src.wor.combobox('reload','/?_func=get&_combo=y&_vpath=dqm&_sqlid=woref');
        if(!src.wor.combobox('getValue')) src.wor.combobox('reload','/?_func=get&_combo=y&_vpath=dqm&_sqlid=woref');
      } 
      
      else {

        
        $('#srcfs > legend').text(rec.text);
        if(sid == 'none') {
        	src.wo.show();
        	src.so.show();
        	$('#ORDER_ID').combobox('loadData',[]);
        	src.wor.combobox('setValue','');
			$("#WOREF option[value='']").attr('selected', true)
    	}
        else {
        	src.so.show();
        	$('#ORDER_ID').combobox('reload','/?_func=get&_combo=y&_sqlid=dqm^src_'+sid);
        }
      }
    }
  })

  */

  // Source Selector 
  // PAC 171003 - REWRITE with comments so we know what's happening.
  $('#srcsel').combobox({
    panelHeight: 'auto',
    //data: JSON.parse($.dui.bhave.srcsel), //$.page.fn.srcdoc, // < this needs to be customisable  // comment out by CLS, 2021-1-5, should be hardcoded and not from bhave source combo
    data: $.page.fn.srcdoc, //CLS, 2021-1-5 11:15AM, this is original design.
    editable: false,
    onSelect: function(rec){
      $.page.fn.cleardata();
      //console.log('rec',rec);
      var sid = rec.source.toLowerCase();
      var src = {wo:$('#srcwo'), so:$('#srcso'), wor:$('#WOREF')};
      
      // PAC 171003 - New combo Vars
      var emp = $('#EMPLOYEE_ID'), ord = $('#ORDER_ID');  
      
      // First hide them both.
      src.so.hide(); src.wo.hide();
      
      
      if(sid == 'job') $.page.fn.src_job(src,emp,rec);
      else $.page.fn.src_other(src,emp,rec);
      
    }
  }) 
  

  // Vendor, Customer or NCR
  $('#ORDER_ID').combobox({
    editable:false,
    onSelect:function(rec){
      //console.log(rec)
      if(rec && rec.NAME) $('#ORDER_NAME').textbox('setValue',rec.NAME);
    }
  })

  $('#ORDER_NO').combobox({
    editable:true,
    onSelect:function(rec){
      //console.log(rec);
      //console.log($('#srcsel').combobox('getValue'));
      if ($('#srcsel').combobox('getValue')=='SALESORDER'){
        
        $('#WOREF_DESIRED_QTY').textbox('setValue',rec.QTY);
        $('#WOREF_PART_ID').textbox('setValue',rec.PART_ID);
        


        var vars = {_func:'get', ID:rec.PART_ID,_sqlid:'inv^partall'}
        ajaxget('/',vars,function(data){
         // console.log(data);
          $('input[textboxname="WOREF_PART_UOM"]').textbox('setValue',data.UOM_ID);
          $('input[textboxname="WOREF_PART_PRODUCT_CODE"]').textbox('setValue',data.PRODUCT_CODE);
          $('input[textboxname="WOREF_PART_DESCRIPTION"]').textbox('setValue',data.DESCRIPTION);
          $('#WOREF_PART_REV_NO').textbox('setValue',data.PART_REV_NO); 
        })
      }
      else {
        for(var i in rec){
          $('input[textboxname="'+i+'"]').textbox('setValue',ireplace(rec[i],/'/g,''))
        }        
      }

      var runqty=$('#WOREF_DESIRED_QTY').textbox('getValue');
      //console.log(runqty);
      $('#WOREF_INSPECT_QTY').numberspinner('set',{'min':0,'max':parseInt(runqty)});
      $('#WOREF_REJECT_QTY').numberspinner('set',{'min':0,'max':parseInt(runqty)});
    }
  })

  // after add button is pressed
  $('#but_add').on('done', function(me,butid){
	  
	  $.page.fn.unselect($('#srcsel')) // PAC 171003
    
    $('#edit').linkbutton('unselect');
    $('#edit').linkbutton('disable');
    $.page.fn.switch('PENDING');
	
		//$('#REPORTED_BY').combobox('selectKey',{'userid':$.dui.udata.userid});
  	$('#REPORTED_BY').combobox('selected'); // RE-Select Current User ID
  	
  	// $.page.fn.cause(); << CLS why we keep reloading the causes ?
	
    $('.lock').removeClass('lock');
    $('#allstat').combobox('select','n');

  });

  // NCR Combo
  $('input#NCR_ID').searchbox({
    


  }).on('done', function(e,rec){
    var tr = $('ul#ncrtree');

    // 171004 - Prevent Nav Buttons selecting Loader.
    if(rec.value=='loader') {
      setTimeout(function(){
        var one = tr.tree('options').complete[0];
        var tgt = tr.tree('find',one.id);
        if(tgt) {
          $(tgt.target).click();
        }
      },100);
    }

    else {
      // Load form data for the selected NCR
      if(rec.value) {
        var frm = $('form#ncrf');
        var sqlid = frm.attr('_sqlid');
        if(sqlid) frm.form('load', '/?_func=get&_sqlid='+sqlid+'&NCR_ID='+encodeURIComponent(rec.value));
      }

      if(!$.page.fn.tclick){
        var tgt = tr.tree('find',rec.value);
        if(tgt) tr.tree('select',$(tgt.target));
      }
    }
    $('.lock').removeClass('lock');

    //$.page.fn.cause();  << CLS why we keep reloading the causes ?
  });

  $('#allstat').combobox({
    panelHeight:'auto',
    
    data:[
      {text:'My Documents',value:'n',selected:true,iconCls:'folder_user'},
      {text:'All Documents',value:'y',iconCls:'folder_share'}
    ],
    
    formatter: function(rec){
      return '<span style="background: url(../icons/'+rec.iconCls+'.png) no-repeat left center;padding-left:22px;">'+rec.text+'</span>'  
    },
        
    onSelect:function(rec){
      $(this).combobox('textbox').css({'padding-left':'26px','background':'url(../icons/'+rec.iconCls+'.png) no-repeat 4px 2px'});
      if($(this).combobox('options').loaded) {
        var tr = $('ul#ncrtree');
        delete(tr.tree('options').complete);
        tr.tree('reload');
      }
    },
    
    onLoadSuccess: function(){
      if($.dui.doc && $.dui.doc.ref){
        $(this).combobox('select','y');
        $(this).combobox('readonly',true);
      }
      $(this).combobox('options').loaded = true; 
    }
    
  })

  // NCR Actions Tree
  $('ul#ncrtree').tree({
    url: '/?_func=get&_sqlid=dqm^'+$.page.fn.allstat.GLOBAL.page+'tree',
    lines: false,


    /* PAC 171004 - NEW - Limit initial Loading of Completed NCRs to 20 */
    loadFilter: function (data,par){
      var opt = $(this).tree('options');
      data.map(function(e,i){
        if(e.id=='complete'){
          if(opt.complete) return data[i].children = opt.complete;
          var arr = [];
          e.children.map(function(e,i){if(i<20) arr.push(e)})
          opt.complete = clone(e.children);
          data[i].children = arr
          arr.push({id:'loader',text:'Show all...',iconCls:'icon-clear'})    
        }
      })
      return data;  
    },

    onBeforeLoad:function(node,param){
      param.allstat = $('#allstat').length ? $('#allstat').combobox('getValue') : $('ul#ncrtree').data('allstat');
      $(this).tree('options').animate = false;
    },

    formatter: function(node){
      if(node.count || node.count==0) return node.text+'<span class="count">('+node.count+')</span>';
      else if(node.ronly) return '<span class="ronly">'+node.text+'</span>';
      else return node.text; 
    },

    onBeforeExpand: function(){
      $(this).tree('collapseAll');
    },

    onClick: function(node){
      if(node.id == 'loader') return $(this).tree('reload');
      if(node.children) return false;
      $.page.fn.tclick = true;
      $('input#NCR_ID').searchbox('select',node.id);
      $.page.fn.tclick = false;
    },

    onSelect:function(node){
      
      /*
      if(node.id=='loader'){
        node = $(this).tree('options').complete[0];
      }
      */
      //if(node.id == 'loader') return $(this).tree('reload');
      if(node.children) return false;
      $(this).tree('expandTo',node.target);
      var par = $(this).tree('getParent',node.target);
      var title = 'NCR Manager - '+par.text;
      var icon = 'icon-tick';
      $('#editpan').panel('setTitle',title);
      $('#editpan').panel('setIcon',icon);
      $.dui.ronly = node.ronly;
    },

    onLoadSuccess:function(node,data){
      $(this).tree('collapseAll');
      $(this).tree('options').animate = true;
      var cbdat = []; for(var d in data){
        var stat = data[d].children;
        for(var s in stat){
          if(stat[s].id == $.page.fn.last) var reload = true;
          cbdat.push({'text':stat[s].text,'value':stat[s].id})
        }
      }

      $('input#NCR_ID').searchbox('loadData',cbdat);
      if(reload){ // reload NCR upon save
        $('input#NCR_ID').searchbox('reselect');
        delete $.page.fn.last;
      }

      // set edit mode
	  var editor=$.page.fn.allstat.GLOBAL.page.toUpperCase()+"-EDITOR";
      if($.dui.udata.groups.indexOf(editor)!==-1) {
        $.page.fn.editor = true;
      } else {
        $.page.fn.editor = false;
      }
    }

  })

  /*
  Duplicate Function.
  // Update VERIFIED_DATE
  $('#DISPOSITION_BY').combobox({
    'onChange': function(nv,ov){
      $('#DISPOSITION_DISPOSITION_BY').textbox('setValue',nv);
	  }
  });
  */


  // Text-Area changes
  $('#REMARKS, #DISPOSITION_REMARKS, #RA_REMARKS, #CA_REMARKS, #FOLLOWUP_REMARKS, #CLOSE_OUT_REMARKS' ).textbox({
  	onChange:function(nv,ov){
  		var me = $(this);
  		var obj = eltab($(this));
  		var tidx = obj.tob.tabs('getTabIndex',obj.tab);
  		if(nv != '') var ic = 'icon-tick'; else {
  		  //if($.page.fn.setup.tab.indexOf(tidx)) var ic = 'icon-qmark';
  		  var ic = 'icon-cross';
  		}
      obj.tob.tabs('update',{tab:obj.tab,options: {iconCls:ic}});
      me.textbox('textbox').focus();
  	}
  })

  // Before FORM Save
  $('form#ncrf').attr('_sqlid','dqm^'+$.page.fn.allstat.GLOBAL.page).on('beforeSubmit', function(e,par){
    var frm = $(this);
    if(frm.form('validate')) {
			
			if($.page.fn.edit && !$.page.fn.prompted) {
			  $.page.fn.prompted = true;
			  /* commented by claude 260220 — interferes with form-plugin */
			  msgbox('Status will not Auto-Increment.',function(){
  			  // frm.form('submit');
			  }); return false;
      } $.page.fn.prompted = false;
			
			var fdat = frm2dic($('form#ncrf'));
			var next = $.page.fn.setup.next;
			$('#_LAST_STATUS').val(fdat.STATUS);  // not currently used
			if(!$.page.fn.edit && fdat.STATUS == $.page.fn.setup.status) {
			  $('#NCR_STATUS').combobox('select',next);
			}
      var date = $.page.fn.setup.date;	  
      // PAC 160126 - ## APPROVED_DATE must be null due to trigger.
      if(date && date != '#APPROVED_DATE') $.page.fn.today($(date));  
      
      if($.page.fn.setup.email){
        var ems=[]; $.page.fn.setup.email.map(function(e){ems.push(fdat[e])});
        $('#_RECIPIENTS').val(ems.join(','));
      }
      
      // disable edit mode after save
      //$('#edit').linkbutton('unselect');
      //$.page.fn.edit = false;
    } 
		//return false; // DEBUG - Prevent Submit
  })

  $('form#ncrf').on('success',function(me,vars){
    //cl('-- form submit OK --');
    var fdat = frm2dic($(this));

    // tree onload() will re-select NCR_ID Combo.
    if(fdat.NCR_ID) $.page.fn.last = fdat.NCR_ID; 
    $('ul#ncrtree').tree('reload');
  })

  $('form#ncrf').on('loadDone',function(me,data){
    //cl('-- form load-done --');
    $.page.fn.switch();

    if($.page.fn.editor) {
      $('#edit').linkbutton('enable');
      $('#reminder').linkbutton('enable');
      if(!data.CI_ADD_DATE) $('#ciadd').linkbutton('enable');  
    } 
    
    else {
      $('#ciadd').linkbutton('disable');
    }
    
    // bug with EUI V4.1 does not select combo on load
    //$('input#srcsel').combobox('reselect');
    //$('#SEVERITY').combobox('reselect');
    
    $('#allstat').combobox('readonly',false);
    
    $(this).form('reselect');
    $.page.fn.blink();
    
    // File Attachments
    $('#ncrfiles').datagrid('docFiles',$.page.fn.fkey);
    
  })

});
