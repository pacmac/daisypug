$.page.fn.clear = function(){
  setTimeout(function(){
    $('form#ginfo').form('clear').hide();
    $('#GAUGE_DESC').textbox('clear');
    $('#TXSAVE').linkbutton('disable');
    $('#GAUGE_ID').searchbox('unselect').combobox('clear');
    $('#GTYPE').textbox('clear');

  },250);
}

// gauge selected
$.page.fn.select = function(rec,click){
  
  // load the form
  var url = '/?_func=get&_sqlid=dqm^gauges_status&ID='+rec.value;
  $('#ginfo').show().form('load',url);
  var bits = rec.INV_STAT.split('-'); // JOB-OUT
  
  // PAC 160708 - Prevent repeat TX on inelligible gauges.
  if($.page.fn.repeat) {
    $('#TXSAVE').linkbutton('enable');
    
    var mbits = $.page.fn.txtype.split('-');
    //cl(bits); cl(mbits); cl(click);
    if(click && ( (bits[1] == mbits[1]) || (bits[1]=='OUT' && mbits[0] != bits[0]) ) ) {
      $.page.fn.clear();
      msgbox('Cannot '+$.page.fn.txtype+' this gauge.');
    }
    return false;
  }
  
  // enable buttons based on status
  $('#bigbut a').removeClass('l-btn-selected').linkbutton('disable')
  
  // Show button group if hidden.
  var grp = bits[0].toLowerCase();
  $('#'+grp+'_en_buts').show();

  // If X-Out TX, then only enable X-IN.
  if(bits[1]=='OUT') {
    var sel = $('#bigbut a[name="'+bits[0]+'-IN"]');
    sel.linkbutton('enable').trigger('click');
  }
  else $("#bigbut a[name$=OUT]").linkbutton('enable');



}

// main button enable / disable toggles.
$.page.fn.enbuts = function(def){
	var cook = getacook('dqm^gauge_inv^enbut');
	if(cook.length==0) cook=['job_en'];
	var ens = [];
	$.each($('#inv_en, #job_en, #cal_en, #rep_en'),function(){
		var me = $(this);
		var id = me.attr('id');
		if(def) {
  		if(cook.indexOf(id)!==-1) me.linkbutton('select');
  		else me.linkbutton('unselect');
    }
		var en = me.linkbutton('options').selected; 
		var div = $('#'+id+'_buts');
		if(en) {
  		ens.push(id);
  		div.show();
    } else div.hide();
	});
	if(ens.length==0) msgbox('No buttons enabled.');
	if(!def) putcook('dqm^gauge_inv^enbut',ens);
}


// 211118 - set next focus field
$.page.fn.focus = function(){
  var done;
  ['#GAUGE_ID','#VENDOR_ID','#EMPLOYEE_ID','#DOC_ID','#PO_REF'].map(function(id){ // removed '#GTYPE' from the list
    var tbox = $(id).textbox('textbox'); 
    var val = $(id).textbox('getValue');
    var vis = tbox.is(":visible");
    if(vis && !val && !done) done = id; 
  });
  if(done) setTimeout(function(){$(done).textbox('textbox').focus()},100);
}

$.page.ready(function() {

  // [DUI] toolbut() replaced with native +button in pug block toolbut
  // Bind click handler for toolbar toggle buttons
  $('#toolbut button.toggle').linkbutton({ onClick: $.page.fn.enbuts })

  toolbut([
   
    +button('Job TX',{id:'job_en', iconCls:'icon-gauge_job_inout', class:'toggle', 'data-options':"toggle:true, noText:true"})
    +button('Calibrate TX',{id:'cal_en', iconCls:'icon-gauge_cal_inout', class:'toggle', 'data-options':"toggle:true, noText:true"})
    +button('Repair TX',{id:'rep_en', iconCls:'icon-gauge_rep_inout', class:'toggle', 'data-options':"toggle:true, noText:true"})
    +button('Gauge TX',{id:'inv_en', iconCls:'icon-gauge_inv_inout', class:'toggle', 'data-options':"toggle:true, noText:true"})
  ])
  $.page.fn.enbuts(true);

  if($.dui.bhave.fscreen=='y') nomenu();
  $('#USER_ID').val($.dui.udata.userid);

  // background bc scanner
  bcscan(function(bc){
  
    //console.log(bc);
    switch (bc.pre){
      case "0": 
        var gid = $('#GAUGE_ID');
        if(!gid.data('all')){
          var url='/?_func=get&_sqlid=dqm^gauge';
          gid.data('all',true).searchbox('reload',url);     
        }
        
        if(!gid.combobox('exists',bc.data)) return msgbox(bc.data+' is invalid.');
        gid.combobox('select',bc.data);       
        break;
        
      case "1":
        var emp = $('#EMPLOYEE_ID');
        var exists = emp.combobox('exists',bc.data);
        emp.combobox('select',bc.data);
        break;

      case "2":
        var job = $('#DOC_ID');
        var exists = job.searchbox('exists',bc.data);
        //console.log(bc);
        if(!exists) return msgbox(`Job ${bc.data.replace(/\^/g,'-')} is invalid.`);
        job.combobox('select',bc.data);
        break;
    }   

  },4);
  
  // clear on successful submit
  $('form#gauge').form({
    success:function(){
      if(!$.page.fn.repeat) but_clr();
      else {
        /*
        $('#GTYPE').combobox('unselect').combobox('clear');
        $('#GAUGE_ID').combobox('unselect').combobox('clear');
        $('form#ginfo').form('clear');
        $('#TXSAVE').linkbutton('disable');
        */
        $('#GAUGE_ID').searchbox('reload');
        $.page.fn.clear();
        alert('Transaction success.') 
      }
    }  
  })
/*
 $('#DOC_SEARCH').combobox({

  onSelect: function(rec){

    var url="/?_func=get&_sqlid=dqm^woref";
    switch(rec.value){
      case "RLS_OPNS":
        url+="&STATUS=R";
        break;

      case "CLS_OPNS":
        url+="&STATUS=C";
        break;
      default:
        url+="&STATUS=R,C";
    }
    $('#DOC_ID').combobox('reload',url);
  }
 })
 */
// Job Reference combo-BOX
  /*
  $('#DOC_ID').combobox({url:'/?_func=get&_sqlid=dqm^woref'}).combobox('filtertip',{
    
    default: ['R'],
    field: 'STATUS',
    data: [
      {name:'R',text:'Released'},
      {name:'C',text:'Closed',nosave:true}
    ]
  });
  */
  $('form#ginfo #GSTATUS').combobox({
    onChange:function(nv,ov){
      //console.log('nv:',nv);
     //if (nv=='HOLD') $('#TXSAVE').linkbutton('disable');
     //else $('#TXSAVE').linkbutton('enable');
    }
  })

  // 211118 - PAC
  $('form#gauge').form({
    onChange:function(){
     $.page.fn.focus();
    }
  })


  // Gauge ID Selector.
  $('#GAUGE_ID').searchbox({
   // url: '/?_func=get&_sqlid=dqm^gauge',
    
    onSelect:function(rec){
      console.log(rec);
      var click = $(this).searchbox('options').clicked;
      $.page.fn.select(rec,click);
      //if($.page.fn.repeat) $('#TXSAVE').linkbutton('enable');
      $('#GTYPE').textbox('setValue',rec.GAUGE_TYPE);
      $('#GAUGE_DESC').textbox('clear');
      $('#GAUGE_DESC').textbox('setValue',rec.DESCRIPTION);


// 160610 - don't know what this is for, seems to AJAX load the data twice !
// # TODO   
// dissappearing Job reference during REPEAT.
var bType=$('#TYPE').textbox('getValue');
var bType1=bType.split('-');

if (bType1[1]=='IN') var url1='/?_func=get&_sqlid=dqm^gaugetrans_woref&GAUGE_ID='+rec.value;
else var url1='/?_func=get&_sqlid=dqm^woref'

//$('#DOC_ID').searchbox('reload',url1);




    }
  })
  /*
  // Filter Gauge ID Combo by gauge Type
  $('#GTYPE').combobox({
    queryParams:{},
    onSelect:function(rec){
      var gid = $('#GAUGE_ID');
      gid.searchbox('clear');
      var url = '/?_func=get&_sqlid=dqm^gauge&GAUGE_TYPE='+rec.value;
      
      // filter gauge by status.
      if($.page.fn.repeat) {
        var bits = $.page.fn.txtype.split('-');
        url+='&INV_STAT='+bits[0]+'-'+{IN:'OUT',OUT:'IN'}[bits[1]];
      }
      $('#GAUGE_ID').data('all',false).searchbox('reload',url);
    },
    
    onLoadSuccess: function(){
      setTimeout(function(){$.page.fn.focus()},250)
    }
  })
  */
  // Save Button
  
  $('#TXSAVE').linkbutton({
    iconCls:'icon-save-big',
    disabled: true,
    size:'large',
    iconAlign:'top',
    onClick:function(){
      //nodclick($(this));
      but_save();
      $('input.repeat').textbox('readonly',true);
      /*
      var gstatus=$('#GSTATUS').combobox('getValue');
      if (gstatus=='HOLD') {
        msgbox('Gauge is on hold. Transaction NOT Allowed!');
      }
      else {
        but_save();
        $('input.repeat').textbox('readonly',true);
      }
      */
    }
  })
  
  // Cancel Button
  $('#TXCLR').linkbutton({
    iconCls:'icon-cancel-big',
    size:'large',
    iconAlign:'top',
    onClick:function(){
      but_clr();
    }
  })
 
  $('#REPEAT').linkbutton({
    disabled: true,
    size:'large',
    iconAlign:'top',
    onClick:function(){
      var icon = $(this).find('span.l-btn-icon');
      
      $.page.fn.repeat = $(this).linkbutton('options').selected;
      if($.page.fn.repeat) {
        $('#bigbut a.l-btn-selected').linkbutton('disable');
        icon.addClass('blink');
      }
      else {
        // when unselected, should we clear the page ??
        $('#bigbut a.l-btn-selected').linkbutton('enable');
        $('input.repeat').textbox('readonly',false);
        icon.removeClass('blink');
      }
    }
  }) 
  
  // Top Buttons
  $('#bigbut a').linkbutton({
    disabled: true,
    size:'large',
    iconAlign:'top',
    onClick:function(){
	    $('#REPEAT').linkbutton('enable');
	    
      var me = $(this);
      var typeValue = me.attr('value');
      var mode = me.attr('name');
      $.page.fn.txtype = mode; //cl(mode);
      
      $('#bigbut a').not("[name='"+mode+"']").linkbutton('disable');
      me.linkbutton('enable'); me.linkbutton('select');
      $('#TYPE').textbox('setValue',mode);
      $('#TYPE_VALUE').val(typeValue);
      $('#OPTIONS .'+ mode.split('-')[0]).show();
  	  
  	  //the following IF condition added by CLS, 04/AUG/2015, to resolved the following issue
  	  // select a gauge, click on check out, select another gauge and click on Repair out. 
  	  if (mode.split('-')[0]=='JOB') $('#OPTIONS .CAL.REP').hide();
  	  else $('#OPTIONS .JOB').hide();
      $('#TXSAVE').linkbutton('enable');

      // required swtiches
      // cl(mode);
      var bits = mode.split('-');
      
      // JOB Transaction
      if(bits[0]=='JOB'){
        var emp=false; if($.dui.bhave.reqop=='y') emp=true; 
        var job=false; if($.dui.bhave.reqjob=='y') job=true;
        $('#EMPLOYEE_ID').combobox('required',emp);
        $('#DOC_ID').searchbox('required',job);
        setTimeout(function(){$('#EMPLOYEE_ID').textbox('textbox').focus()},100);
      } 
      
      // NON-JOB & NOT INV Transaction.
      else if(bits[0] != 'INV') {
        var ven=false; if($.dui.bhave.reqven=='y') ven=true; 
        var doc=false; if($.dui.bhave.reqdoc=='y') doc=true;
        $('#VENDOR_ID').searchbox('required',ven);
        $('#PO_REF').combobox('required',doc);
      }

      var gid=$('#GAUGE_ID').searchbox('getValue');

// # TODO   
// Job reference dissappears durin repeat.
if (bits[1]=='IN') var url1='/?_func=get&_sqlid=dqm^gaugetrans_woref&GAUGE_ID='+gid;
else var url1='/?_func=get&_sqlid=dqm^woref'
//$('#DOC_ID').searchbox('reload',url1);

    }
  })  

});


/*
	// removed by PAC 160618
	//added by CLS, 6/14/2016 10:24AM
	// handle gauge barcode, 
	//not sure why line 104 to lkne 121 not working
	var keyHandler = function( event ){
	    var keyCode = event.which;
	    var keyChar = String.fromCharCode( keyCode );
	    if (keyCode==13)   	$.page.fn.bcscan(chars.join(""));
	    else chars.push(keyChar);
	};
	$( window).off('keypress').on( "keypress", keyHandler );
*/

/*
// load the gauge info
$.page.fn.fload = function(id){
  var url = '/?_func=get&_sqlid=dqm^gauges&ID='+id;
  $('#ginfo').show().form('load',url);
  $('#bigbut a').linkbutton('enable'); 
}
*/

/*
$("#GAUGE_ID").keypress(function(e){
  if ( e.which === 13 ) {
    cl("Prevent form submit.");
    e.preventDefault();
  }
});
*/

/*
// combo-TREE
$('#GAUGE_ID').attr('all',true).combotree({
  method:'get',
  url:'/?_func=get&_combo=y&_sqlid=dqm^gaugetree',
  onBeforeSelect: function(node){
    if(node.children) return false; 
  },
  onSelect:function(node){
    $.page.fn.fload(node.id);
    $(this).tree('expandTo',node.target);   
  },
  onLoadSuccess: function(){$(this).tree('collapseAll')},
  onBeforeExpand:function(node){if($(this).tree('getLevel', node.target)==1) $(this).tree('collapseAll');}
})
*/