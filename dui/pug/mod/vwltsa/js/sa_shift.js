// PAC DEV CODE 201025
var cl = console.log;
$.dui.page.msrate = 150;
$.dui.page.hrform = $('form[_sqlid="vwltsa^shiftdayall"]'); 


// reload the shift timing shifts when adding / changing a shift
$('form[_sqlid="vwltsa^shiftall"]').on('loadDone',function(jq,data){
  $('#sa_shift_day form .fkey').combobox('reload'); 
})

$('#sa_shift_day form .easyui-combobox').each(function(){
  var me = $(this);
  var id = me.attr('id');
  if(!id) return;
  var name = id.split('_')[0];
  var start = $(`input[name="${name}_START"]`);
  var end = $(`input[name="${name}_END"]`);
  var dur = $(`#${name}_DUR`);
  
  // cl(name,start,end)
  me.combobox({
    onChange: function(nv,ov){
      if($.dui.page.hrform.form('options').loading) return;
      $.dui.page.busy = true;
      if(nv=='0') {
        start.timespinner('setValue','');
        end.timespinner('setValue','');
        dur.textbox('setValue','');
      }
      setTimeout(function(){
        $.dui.page.busy = false;
        $.dui.page.validate();
      });
    }
  })
    
})


// Form Events.
$.dui.page.hrform
  
  /* WHEN RECORD SELECTED */
  .on('loadDone',function(jq,data){
    
    // if(data.SHIFT_ID=='PAC') data.SHIFT_TYPE = 'O';
    
    $.dui.page.shiftType = data.SHIFT_TYPE; 
    $('#SHIFT_TYPE').textbox('setValue',{
      B: 'NOT-USED',
      R: 'RESOURCE',
      O: 'OPERATOR'  
    }[data.SHIFT_TYPE]);
    
    
  })
  
  /* VALIDATE ON-CHANGE */
  .on('changed',function(jq,tgt){
    
    //cl($(tgt.target).attr('id'))
  
    // form change is already in-progress
    if($.dui.page.busy) return;
    
    $.dui.page.last = $.dui.page.last || new Date();
    var msec = new Date() - $.dui.page.last; 
    if(msec < $.dui.page.msrate) clearTimeout($.dui.page.tout);
    $.dui.page.last = new Date();
    $.dui.page.tout = setTimeout(function(){
      delete($.dui.page.last);
      clearTimeout($.dui.page.tout);
      $.dui.page.validate();  
    },$.dui.page.msrate + 10);
  
  })

  /* VALIDATE BEFORE SUBMIT */
  .on('beforeSubmit',function(){
    var valid = $.dui.page.hrform.form('validate')
    // cl('beforeSubmit',valid);
    return valid;
  })

$.dui.page.getmin = function(ts){
  if(typeof(ts) == 'string') {
    var bits = ts.split(':'); 
    var min = (parseInt(bits[0]) * 60) + parseInt(bits[1]);
    return min;
  }      
  return ts;
}

$.dui.page.getmins = function(start,end){
  var smin = $.dui.page.getmin(start); 
  var emin = $.dui.page.getmin(end);
  
  if(smin < emin) var mins = emin - smin;
  else mins = (24*60-smin) + emin;

  return mins;
}

$.dui.page.onoff = function(name,mins){
  name = name.split('_')[0];
  var cbo = $(`#${name}_ON`);
  if(!mins) cbo.combobox('select','0');      
  else cbo.combobox('select','1');
}

// calculate hours & validate
$.dui.page.calc = function (name){
  var bits = name.split('_');
  if(bits[1]=='END'){
    var durbox = $(`#${bits[0]}_DUR`);
    var start = $.dui.page.sdata[`${bits[0]}_START`];
    var end = $.dui.page.sdata[`${bits[0]}_END`];
    var mins = $.dui.page.getmins(start,end);
    
    if($.dui.page.shiftType == 'O') {
      // mins = Math.abs(mins);
    }
    
    $.dui.page.onoff(name,mins);
    
    if(isNaN(mins)) var hm = '';
    else hm = pad(parseInt(mins/60),2) + ':' + pad(mins%60,2);
    
    durbox.textbox('setValue',hm);
    var tbox = durbox.next('span.textbox');
    
    // set validate class
    if(mins < 0) tbox.addClass('validatebox-invalid');
    else tbox.removeClass('validatebox-invalid');
  }
}

$.dui.page.validate = function(){
  if($.dui.page.off) return;
  cl('calc & validate ONCE')

  $.dui.page.busy = true;  // ONCE-ONLY (prevent multiple-triggers)
  $.dui.page.sdata = {bads:[]};

  // Loop each break timespinner
  $('#sa_shift_day form .easyui-timespinner').each(function(){
    var me = $(this);
    var name = me.attr('spinnername');
    var val = me.numberspinner('getValue'); 
    $.dui.page.sdata[name] = $.dui.page.getmin(val);
    
    $.dui.page.calc(name);
    
    // Don't validate first field.
    if(name == 'SHIFT_START') return;
    
    // set $.dui.page.sdata.cross if shift crosses midnight
    if(name == 'SHIFT_END' && $.dui.page.sdata[name] < $.dui.page.sdata.SHIFT_START) $.dui.page.sdata.cross = true;
    else $.dui.page.sdata.cross = false;
    
    // validate the start / end times.
    var valid = true;
    switch ($.dui.page.shiftType){
      case 'R':
        if(
          $.dui.page.sdata.SHIFT_END - $.dui.page.sdata.SHIFT_START < 1 || 
          $.dui.page.sdata[name] <= $.dui.page.sdata.SHIFT_START ||
          (name == 'SHIFT_END' && $.dui.page.sdata[name] > $.dui.page.sdata.SHIFT_END) ||
          (name != 'SHIFT_END' && $.dui.page.sdata[name] >= $.dui.page.sdata.SHIFT_END)
        ) valid = false;         
        break;
      
      default:
        if(
          1 == 2
          /*
          name != 'SHIFT_END' &&
          $.dui.page.sdata[name] >= $.dui.page.sdata.SHIFT_END
          */  
        ) valid = false;         
        break;
    }
    
    // 
    if(valid) me.next('span.spinner').removeClass('validatebox-invalid');
    else {  
      me.next('span.spinner').addClass('validatebox-invalid');
      $.dui.page.sdata.bads.push(name);
    }
  });
  
  $.dui.page.busy = false;

  // if($.dui.page.sdata.bads.length) alert(`${$.dui.page.sdata.bads.join(',')} values are invalid.`);
  
}