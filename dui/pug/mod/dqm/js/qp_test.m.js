/*
  CLS, 171121, 2.2.418
  1, added default filter(PART,GAUGE) for qtref combobox


*/
// Called after menu click & page loaded.
$.page.fn.ready = function(){
  // cl('@@ READY @@'); 
  
  // piece Loader
  $("#testidx").on("change", function(evt,ui){
    var me = $(this);
    var tests = me.data('tests');
    var idx = me.val()-1;
    if(idx > tests.length-1) return;
    tests[idx].SEQ_PIECE = (tests[idx].TICK_SEQ +1) + ' / ' + tests.length;
    if(me.data('ltype')=='bool') tests[idx].B_VALUE = tests[idx].VALUE;
    else if(!isNull(tests[idx].VALUE)) tests[idx].N_VALUE = tests[idx].VALUE.toFixed(4);
    $('form#testdata').form('load',tests[idx]);      
    
    // Select Locked GID if NOT Null.
    var lok = $('#GAUGE_LOCK'), gid = $('#GAUGE_ID');  
    if(lok.val()=='lock' && !gid.val()) gid.combo('select',lok.data('last'));
     
  });

  /*
  
  //$('body').on('touchend', alert('xxx'));
  
  var pop = $('<div data-role="popup" id="poptest" class="ui-content" data-theme="a" style="max-width:350px;"><p>Hello World</p></div>');
  pop.popup().popup('close');
  pop.appendTo('body');
  setTimeout(function(){
    pop.popup('close');
  },1000);
  //pop.popup('open',{x:'100px',y:'100px'});
  //pop.popup("open", {positionTo: '#N_VALUE'});

  $('body').off('taphold').on('taphold', function (e) {
    //$('#poptest').popup("open", e.target);
  });
  */
  
}

// after upload, push file to array.
$.page.fn.onUploaded = function(res){
  $('#files').table('append',res.data);
}

// on test-select
$.page.fn.testSelect = function(data){

  // Main Tab
  data.test.PLAN_IDVER = data.test.PLAN_ID +'/'+ data.test.PLAN_VER; 
  data.test.DRG_IDREV = data.test.DRG_ID +'/'+ data.test.DRG_VER;
  $('#plan').form('load',data.test);
  
  // set the icon.
  data.children.map(function(e){
    if(e.proc.LTYPE=='bool') e.iconCls = 'power'
    else e.iconCls = 'edit'; 
  });
  $('#procs').listview('load',data.children);
  
  $('a[href="#main"]').click();
  
  jqm.disable('.test-l');
  jqm.enable('.test-h');

  // Test Sequence Click
  $('ul#procs li a').on('click',function(evt){
    jqm.enable('.test-l, ul#procs li a');

    $('#GAUGE_LOCK').val('free').change();
    
    $('ul#procs li a.selected').removeClass('selected');
    $(this).addClass('selected');
    $('a[href="#tests"]').click();
    
    var opt = $(this).data('options');
    $.page.fn.loadProc(opt.proc);
    
    // show the gauges for selected gauge type.
    $('#GAUGE_ID').combo('showGroups',opt.proc.GAUGE_TYPE);

    var sli = $("#testidx"); 
    if(sli.hasClass('mobile-slider-disabled')) var idx=sli.val(); else var idx=1;
    
    /*
    sli.data({
      'ltype': opt.proc.LTYPE,
      'TEST_ID':data.test.TEST_ID,
      'PROC_SEQ':opt.proc.SEQ_NO
    }).attr({max:opt.tests.length}).val(idx).slider('refresh').trigger("change");
    */
    
    ajaxget('/',{
      PROC_SEQ: opt.proc.SEQ_NO,
      TEST_ID: data.test.TEST_ID,
      
      _sqlid: 'dqm^qt_tickets',
      _func: 'get'  
    },function(tests){
      sli.data({
        'ltype': opt.proc.LTYPE,
        'TEST_ID':data.test.TEST_ID,
        'PROC_SEQ':opt.proc.SEQ_NO,
        'tests':tests
      }).attr({max:opt.tests.length}).val(idx).slider('refresh').trigger("change");      
    })    
    

  })

}

// get upload file description.
$.page.fn.filedesc = function(){
  var test = $('#testdata').form('getData');
  var proc = $('form#procform').form('getData');
  return 'Sequence:'+proc.SEQ_NO+', Test Piece:'+test.SEQ_PIECE;  
}

$.page.fn.savebut = function(tf){
  if(tf) $('#save').removeClass('ui-disabled'); 
  else $('#save').addClass('ui-disabled'); 
}

// Load Procedures.
$.page.fn.loadProc = function(proc){
  
  $('.n-value, .b-value').addClass('hide');
  if(proc.LTYPE=='bool') {
    proc.CRITERIA = proc.BOOL_TEXT;
    $('.b-value').removeClass('hide');
  } 
  
  else {
    proc.CRITERIA = 'Nom: '+proc.VNOM.toFixed(4)+' '+proc.UOM +' ( '+ proc.VLOW.toFixed(4)+' To '+proc.VUPP.toFixed(4)+' )';
    $('.n-value').removeClass('hide');
  }
  
  // Load The Forms
  $('#procform').form('load',proc);
  $('#testinfo').form('load',proc);
  $('#instruc').form('load',proc);
  return proc;
}

// validate test value.
$.page.fn.validate = function(){

  var test = $('#testdata').form('getData');
  var proc = $('form#procform').form('getData');
  
	test.PROC_SEQ = proc.SEQ_NO;
	if(proc.LTYPE=='bool') {
  	test.VALUE = parseInt(test.B_VALUE);
    proc.VNOM = proc.VUPP = proc.VLOW = 0;  
  }
	else {
  	test.VALUE = parseFloat(test.N_VALUE);
  	proc.VNOM = parseFloat(proc.VNOM);
  	proc.VUPP = parseFloat(proc.VUPP);
  	proc.VLOW = parseFloat(proc.VLOW);
  }

  if(isNaN(test.VALUE)){
    test.STATUS = 'None';
    test.VALUE = ''  
  }
  
  else {
    test.STATUS = "Pass";
    
    if(test.VALUE === proc.VNOM) test.VAR = 'NIL';  
    if(test.VALUE > proc.VNOM){
      test.VAR = '+' + (test.VALUE - proc.VNOM).toFixed(4);
      if(test.VALUE > proc.VUPP) test.STATUS = "Fail";  
    }

    if(test.VALUE < proc.VNOM){
      test.VAR = '-' + (proc.VNOM - test.VALUE).toFixed(4);
      if(test.VALUE < proc.VLOW) test.STATUS = "Fail";       
    }
  }

  $('#testdata #STATUS').val(test.STATUS).removeClass('none pass fail').addClass(test.STATUS.toLowerCase());
  $('#testdata #VAR').val(test.VAR);
  
  // cj(test);
  return test;
}

/*
$('textarea[name=SPEC]').on("tap",function(){
  var me = $(this);
  me.data('css',me.attr('style'));
  me.css({
    'z-index': '10000',
    'height': '400px',
    'position': 'absolute',
    'width': '100%',      
  })
  setTimeout(function(){
    
  },2000);
  
}).on("mouseout",function(){
  var me = $(this);
  me.attr('style',me.data('css')).blur();
})
*/


// Nav Buttons
$('#idx_bak, #idx_fwd').on('click',function(){
  var me = this;
  jqm.disable(me);
  var id = $(this).attr('id');
  var sli = $("#testidx");
  if(sli.hasClass('mobile-slider-disabled')) return;
  var idx = sli.val();
  var max = parseInt(sli.attr('max'));
  if(idx > 1 && id=='idx_bak') idx--;
  else if(idx < max) idx++;
  sli.val(idx).slider('refresh').trigger("change");
  setTimeout(function(){jqm.enable(me)},250);
})

$('#GAUGE_ID').combo({
  queryParams: {
    _combo:'y' 
  },
  
  _nativeMenu: false,
  groupField: 'GAUGE_TYPE',
  
  _sqlid:'dqm^gauge_ids'  

});


$('#qtref').combo({
  queryParams: {
    _status: 'OPEN,STARTED',
    _filt:'PART,GAUGE', //CLS, 171121,added default _filter
  },
  
  _sqlid:'dqm^qthids',
  
  onSelect: function(rec){
    $.page.fn.fkey = rec.value;
    ajaxget('/',{_func:'get',_sqlid:'dqm^qt_tree',qtref:rec.value},$.page.fn.testSelect);
  },
  
  onFiles: function(files){
    $('#files')
    .table()
    .table('load',files);
  }

})

$('input[name=B_VALUE]').on('click',function(){$.page.fn.savebut(true)})
$('#N_VALUE').on('focus',function(){$(this).val('')})

// Slider Lock.
$('#GAUGE_LOCK').on('change',function(){ 
  var gid = $('#GAUGE_ID'); 
  if($(this).val()=='lock') {
    gid.combo('readonly',true);
    $(this).data('last',gid.val());
  }
  else gid.combo('readonly',false);
})


// Slider Lock.
$('#PIECE_LOCK').on('change',function(){
  if($(this).val()=='lock') jqm.disable("#testidx, #idx_bak, #idx_fwd");
  else jqm.enable("#testidx, #idx_bak, #idx_fwd");
})

// Save Button
$('#save').on('click',function(){
  $(this).addClass('ui-disabled');
  var test = $.page.fn.validate();
  var param = {
    STATUS:test.STATUS,
    NOTES: test.NOTES,
    TEST_ID: test.TEST_ID,
    PROC_SEQ: test.PROC_SEQ,
    TICK_SEQ: test.TICK_SEQ,
    VALUE: test.VALUE,
    GAUGE_ID:test.GAUGE_ID,
    _func: 'upd',
    _sqlid: 'dqm^qt_ticket'
  } 
  
  ajaxget('/',param,function(res){
   if(res.error) return msgbox(res.msg)
   var sli = $("#testidx");
   var idx = sli.val()-1;
   sli.data('tests')[idx] = test;
   //load next piece
  });
    
})

$('form#testdata')
  .on('focusin',function(){
    $.page.fn.savebut(true);  
  })

  .on('change',function() {
    $.page.fn.validate(); 
  })
  
  .on('loadSuccess',function(){
    $.page.fn.validate();
    $.page.fn.savebut(false);
  })
