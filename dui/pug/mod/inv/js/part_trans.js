
$.page.ready(function () {
$.page.fn.arrFilter = function(arr,key,val){
  var odata = [];
  arr.map(function(e){if(e[key]==val) odata.push(e)})
  return odata;
}

// mode helper: supports "ALL|*|Y" or CSV list e.g. "ADJ-IN,ADJ-OUT"
$.page.fn.modeAllowed = function(mode, raw, fallback){
  var txt = (raw == null || raw === '') ? (fallback || '') : raw;
  txt = String(txt || '').trim().toUpperCase();
  if(!txt) return false;
  if(['ALL','*','Y','YES','1','TRUE'].indexOf(txt) > -1) return true;
  if(['NONE','N','NO','0','FALSE'].indexOf(txt) > -1) return false;
  var bits = txt.split(/[,\s|;^]+/).filter(function(x){return !!x;});
  return bits.indexOf(String(mode || '').toUpperCase()) > -1;
}

// Manual Qty override:
// - boolean override: bhave.ALLOW_MANUAL_QTY='y'
// - mode list override: bhave.ALLOWED_MANUAL_QTY_MODES / bhave.MANUAL_QTY_MODES
// - default selected modes: ADJ-IN,ADJ-OUT
$.page.fn.allowManualQty = function(){
  var bh = $.dui.bhave || {};
  if(String(bh.ALLOW_MANUAL_QTY || '').toLowerCase() == 'y') return true;
  var modeList = bh.ALLOWED_MANUAL_QTY_MODES || bh.MANUAL_QTY_MODES || '';
  return $.page.fn.modeAllowed($.page.fn.stat, modeList, 'ADJ-IN,ADJ-OUT');
}

// Manual Unit Material Cost override:
// - boolean override: bhave.ALLOW_MANUAL_UNIT_COST='y'
// - mode list override: bhave.ALLOWED_MANUAL_UNIT_COST_MODES / bhave.MANUAL_UNIT_COST_MODES / bhave.MANUAL_UMC_MODES
// - default selected modes: ADJ-IN,ADJ-OUT
$.page.fn.allowManualUnitCost = function(){
  var bh = $.dui.bhave || {};
  if(String(bh.ALLOW_MANUAL_UNIT_COST || '').toLowerCase() == 'y') return true;
  var modeList = bh.ALLOWED_MANUAL_UNIT_COST_MODES || bh.MANUAL_UNIT_COST_MODES || bh.MANUAL_UMC_MODES || '';
  return $.page.fn.modeAllowed($.page.fn.stat, modeList, 'ADJ-IN,ADJ-OUT');
}

// LWH field dimensional visibility
$.page.fn.dimvis = function(part){
  $.each($('.dimin'),function(){
    var me = $(this);
    var id = me.attr('id').replace('DIM_','');
    var req=true, sh='show';
    if(part[id]!='Y') {req=false; sh='hide';}
    me.numberbox('required',req);
    $('#_'+id)[sh]();
  });
}

// Dimension Calculations.
$.page.fn.dimcalc = function(){
  if($.page.fn.allowManualQty()) return;
  var total = 1, qb = $('#QTY');
  $.each($('.dimin'),function(){
    var me = $(this);
    total *= me.numberbox('getValue')||1; 
  });
  total *= $('#DIM_PC_QTY').numberspinner('getValue');
  qb.numberbox('setValue',total);
  
  // 171115 - Returned cannot exceed issued
  if($.page.fn.stat=='JOB-IN'){
    var rec = $('#DIM_LWH').combobox('getRec');
    var iss = (rec.HEIGHT||1) * (rec.LENGTH||1) * (rec.WIDTH||1) * rec.PC_QTY;
    var rtn = qb.numberbox('getValue');
    if(rtn > iss) {
      msgbox('Returned exceeds issued qty.');
      qb.numberbox('setValue',0);
    }
    //console.log('issued:'+iss,'return:'+rtn);
  }

}

// Dimension Combo Select
$.page.fn.lwhselect = function(){

  var callid = $(this).attr('id'); // Not required ?? Element that called (changed).
  var total = 1;
  var pq = $('#DIM_PC_QTY');
  var rec = $('#DIM_LWH').combobox('getRec');
  
  // set valueboxes with combo values
  $.each($('.dimin'),function(){
    var id = $(this).attr('id').replace('DIM_','');
    $(this).numberbox('setValue',rec[id]);
  });
  
  $('#DIM_PC_AVAIL').numberbox('setValue',rec.PC_QTY);
  pq.numberspinner('set',{'min':1,'max':rec.PC_QTY});
  
  // prevent recursion & only set on select of LWH
  if(callid=='DIM_LWH') pq.numberspinner('setValue',rec.PC_QTY);
  
  // set value on select of combo dimensions.
  if($.page.fn.allowManualQty()) return;
  var qty = pq.numberspinner('getValue');
  total *= (rec.HEIGHT||1) * (rec.LENGTH||1) * (rec.WIDTH||1) * qty;
  $('#QTY').numberbox('setValue',total);
}

// Show / Hide Dimension Sections.
$.page.fn.dimdiv = function(data){
  
  var part = data.part;
  var qty=$('#QTY'), dimsdiv=$('#dimsdiv'), dimout=$('#dimout'), dimin=$('#dimin');
  var pcqty=$('#DIM_PC_QTY'), lwh=$('#DIM_LWH'); 
  var allowManualQty = $.page.fn.allowManualQty();
  
  if(part.DIM_TRACKED=='Y') {
    qty.numberspinner('readonly',!allowManualQty);
    dimsdiv.show();
    $.page.fn.dimvis(part);

    // ### ALLWAYS DO ###
    $('.dimin')
      .numberbox({'onChange':$.page.fn.dimcalc})
      .next('span.textbox').addClass('textbox-readonly');
    pcqty.numberspinner({'onChange':$.page.fn.dimcalc});
    
    // ### ADJUST-IN ###
    if($.page.fn.stat=='ADJ-IN'){   
      dimout.hide();dimin.show();
      $('.dimin')
        .numberbox({editable:true})
        .next('span.textbox').removeClass('textbox-readonly');
      lwh.combobox({required: false});
    }
    
    // ### ADJUST-OUT, JOB-OUT, JOB-IN ###
    else {
      dimout.show();
      //pcqty.numberspinner({'onChange':$.page.fn.lwhselect});
      
      /* 
        I WANT TO MOVE THIS ! 
        Requires:
        1. data.dims
        2. part
      */
      
      lwh.combobox({
        required: true,
        _init: null,
        _traceid: null,
        _woref: null,
        onSelect:$.page.fn.lwhselect,
        data:data.dims,
        loadFilter:function(data){
          var lwha = ['LENGTH','WIDTH','HEIGHT'];
          var opt = $(this).combobox('options');

          // 171123 - multiple filter
          if(opt._traceid || opt._woref) {
            if(opt._traceid) fdata = $.page.fn.arrFilter(data,'TRACE_ID',opt._traceid);
            if(opt._woref) fdata = $.page.fn.arrFilter(fdata,'WOREF',opt._woref);
            opt._woref = null; opt._traceid = null;
            return multisort(fdata,lwha);
          }
          
          else {  // Initial Loading before filters.
            data.map(function(e){
              var bits=[]; lwha.map(function(x){
                if(part[x]=='Y') bits.push(x[0]+':'+e[x]);
              });
              e.text = bits.join(' x ');
            })
          }
          return multisort(data,lwha);
           
        }
      }).combobox('readonly',false).removeAttr('readonly');
    }
    
  } 
  
  else {  // NOT piece-tracked
    qty.numberspinner('readonly',false);
    dimsdiv.hide();
  }

}

$.page.fn.jobcost= function(){
  if ($.page.fn.stat=='FG-IN'){
    var tmc=$('#TRACE_MATERIAL_COST');
    var qty=$('#QTY').numberspinner('getValue');
    var jc=$('#JOB_COST').textbox('getValue');
    if (qty>0 ) tmc.numberspinner('setValue',jc/qty);
  }
}

$.page.fn.tracediv = function(part){
  var tracediv = $('#tracediv'),trace = $('#TRACE_ID');
  if(part.TRACEABLE=='Y') {tracediv.show();trace.combobox('required');}   
  else {tracediv.hide(); trace.combobox('required',false)}    
}

$.page.fn.traceadd = function(on){
  var trace = $('#TRACE_ID'), expire=$('#EXPIRY_DATE');
  var div = $('#tracebal');
  if(on) {trace.combobox('toText'); expire.datebox('readonly',false).removeAttr('readonly');div.hide();}
  else {trace.combobox('toCombo'); div.show();expire.datebox('readonly',true)} 
}

$.page.fn.switch = function(){
  
  var part = $('#PART_ID'), partopt = part.combobox('options');
  var job = $('#WOREF'), jobopt = job.combobox('options');
  var trace = $('#TRACE_ID'), traceopt = trace.combobox('options');
  var tracemcost= $('#TRACE_MATERIAL_COST');

  function cbodata(){
  	part.combobox('loadData',$.page.fn.part.data);
  	job.combobox('loadData',$.page.fn.jobopt.data);    
  }

  function jobdiv(on){
    var jobdiv = $('#jobdiv'); 
    if(on) {jobdiv.show();job.textbox('required',true)}
    else {jobdiv.hide();job.textbox('required',false);} 
  }

  function unique(arr,key){
    key=key||'value'; var rows=[], idx=[];
    arr.map(function(e){
      if(idx.indexOf(e[key])==-1){
        idx.push(e[key]);
        rows.push(e);
      }
    });
    return rows;  
  }
  
  function dotrace(data,cbodat){
    if(data.part.TRACEABLE=='Y') {
      var max=data.part.LOT_SIZE;
      $.page.fn.props(data);
      trace.combobox('loadData',cbodat); 
      tracemcost.numberbox('setValue',cbodat.TRACE_MATERIAL_COST);
      tracemcost.numberbox('readonly',true); 

    }
    else {
      var max = data.part.BAL_QTY;
    }
    $.page.fn.minmax(1,max);     
  }
  
  // Common defaults
  $.page.fn.part = {data:[],bals:[]}; 
  $.page.fn.jobopt = {data:[]}; 
  $.page.fn.traceopt = {data:[]};
  
  switch ($.page.fn.stat){
  	
  	case 'ADJ-IN':
      $.page.fn.part.onLoad = function(data){
        $.page.fn.dimdiv(data); // PAC 171106
        if(data.part.TRACEABLE=='Y') {
          $.page.fn.traceadd(true);
          $.page.fn.tracediv(data.part);
          trace.combobox('loadData',data.trace);       
          $.page.fn.props(data);
          if(data.part.TRACEABLE=='Y') var max = data.part.LOT_SIZE;
        } else {
          var max;
          $.page.fn.tracediv(data.part);
          $.page.fn.traceadd(false);
        }
        
        $.page.fn.minmax(1,max);
      }

      $.page.fn.traceopt.onSelect = function(rec){
        var avail = rec.LOT_SIZE - rec.BAL_QTY;
        $('#BAL_QTY').numberbox('setValue',avail);
        $.page.fn.minmax(1,avail); 
        $('#TRACE_MATERIAL_COST').numberbox('readonly',false);     
      }

      $.page.fn.partsload(['COMP','FG','CONSUMABLE'],'part',false);
      break;

  	case 'ADJ-OUT':
      $.page.fn.part.onLoad = function(data){
        $.page.fn.tracediv(data.part);
        $.page.fn.dimdiv(data); // PAC 171106
        dotrace(data,data.trace);
      }

      $.page.fn.partsload(['COMP','FG','CONSUMABLE'],'part',true);
      break;
 
  	case 'JOB-OUT':
      if($.page.fn.shift) $('.textbox-icon.icon-search').click();
      
      $.page.fn.part.onLoad = function(data){
        $.page.fn.dimdiv(data); // PAC 171106
        dotrace(data,data.trace);
        jobdiv(true);
        $.page.fn.tracediv(data.part);
        job.combobox('loadData',data.jobs);  

      } 

      $.page.fn.partsload(['COMP','FG','CONSUMABLE'],'part',true);
      break; 

  	case 'JOB-IN':
      if($.page.fn.shift) $('.textbox-icon.icon-search').click();
      var data;
      $.page.fn.part.onLoad = function(idata){
        data = idata;
        $.page.fn.dimdiv(data); // PAC 171106
        var rows = []; data.jobs.map(function(job){rows.push({'text':woref2text(job.WOREF),'value':job.WOREF})})
        job.combobox('loadData',unique(rows));
        jobdiv(true);
      }
     
      $.page.fn.partsload(['COMP','FG','CONSUMABLE'],'part',false);
      
      // 171110 WLH Bug - load traces based on selected WOREF
      $.page.fn.jobopt.onSelect = function(rec){
        $.page.fn.tracediv(data.part); // show Trace Div.
        var trc = $.page.fn.arrFilter(data.jobs,'WOREF',rec.value); 
        dotrace(data,trc);
        $.page.fn.minmax(1,trc[0].BAL_QTY);
      }
      break; 

  	case 'FG-IN':
      
      $.page.fn.part.onLoad = function(data){
        
        var rec = job.combobox('getRec');    
        var maxpct = $.dui.bhave.FG_MAXRECV || 100;
        var rcvqty = rec.RECEIVED_QTY || 0; 
        var maxrcv = ((parseInt(maxpct)/100) * rec.qreq) - rcvqty;
        
        if(data.part.TRACEABLE=='Y') {
          $.page.fn.props(data);
          $.page.fn.traceadd(true);
          $.page.fn.tracediv(data.part);
          trace.combobox('loadData',data.trace);
          if(data.part.LOT_SIZE > maxrcv) var max=maxrcv
          else var max = data.part.LOT_SIZE;
          if ($.dui.bhave.FG_IN_DEF_JOB_AS_TRACE=='y') trace.combobox('setValue',$('#BASE_ID').textbox('getValue'));

          if ($.dui.bhave.FG_IN_UNIT_TRACE_COST=='P') {
            //use PART TRACE UNIT MATERIAL COST
            tracemcost.numberspinner('setValue',$('#UNIT_MATERIAL_COST').numberspinner('getValue'));
          }

        }
        else {
          var max=maxrcv;
        }
        $.page.fn.tracediv(data.part);
        
        $.page.fn.minmax(1,max);
      }
      
      $.page.fn.jobopt.onSelect = function(rec){
        part.combobox('select',rec.PART_ID);
      }
      //210310, CLS , added bhave FG job type
      var fg_jobtype=$.dui.bhave.FG_JOB_TYPE || 'FG';
      var arr_fg_jobtype = fg_jobtype.split(",");
      //var rows = []; jobopt.basRows.map(function(e){if(e.WO_TYPE=='FG') rows.push(e)})
      var rows =[] ; jobopt.basRows.map( function(e){ if(arr_fg_jobtype.indexOf(e.WO_TYPE)!=-1 && e.PART_ID!="") rows.push(e) })
      job.combobox('loadData',rows);
      jobdiv(true);

      $.page.fn.partsload(arr_fg_jobtype,'part',false);
     // $.page.fn.partsload(['FG'],'part',false);
      part.combobox('readonly',true);
      break;

  	case 'FG-OUT':

        //210310, CLS , added bhave FG job type
      var fg_jobtype=$.dui.bhave.FG_JOB_TYPE || 'FG';
      var arr_fg_jobtype = fg_jobtype.split(",");     
      
      $.page.fn.part.onLoad = function(data){
        jobdiv(true);
        
        //var rows = []; jobopt.basRows.map(function(e){if(e.WO_TYPE=='FG' && e.PART_ID == data.part.ID) rows.push(e)})
        var rows = []; jobopt.basRows.map(function(e){if((arr_fg_jobtype.indexOf(e.WO_TYPE)!=-1) && (e.PART_ID == data.part.ID)) rows.push(e)})
        
        //CLS, 2020-12-22 2:18PM ,code below is working but retrieve release job only
        //job.combobox('loadData',rows);
        //CLS, 2020-12-22 2:20PM , when performing FG Return, the Work Order dropdown list should show the list of Work Order that the part was previously received from.
        var rows1 = []; 
       // console.log(data.fg)
        if (data.fg) {
          data.fg.map(function(f){
            if (f.PART_ID == data.part.ID) rows1.push(f)
          })          
        }

        job.combobox('loadData',rows1);  
        $.page.fn.tracediv(data.part);
        dotrace(data,data.trace);
      }

      $.page.fn.partsload(arr_fg_jobtype,'part',true);
      //$.page.fn.partsload(['FG'],'part',true);
      break;

  	case 'SHP-OUT':
      $.page.fn.part.onLoad = function(data){
        $.page.fn.tracediv(data.part);
        dotrace(data,data.trace);
      }

      $.page.fn.traceadd(false);
      job.combobox('loadData',[]);      

      // #PAC 
      $.page.fn.partsload(['COMP','FG'],'part',true);
      break;

  	case 'SHP-IN':
      $.page.fn.part.onLoad = function(data){
        $.page.fn.tracediv(data.part);
        dotrace(data,data.ship);
      }
      
      /*
      // old method
      var idx=[], rows=[];
      partopt.shipRows.map(function(e){
        if(idx.indexOf(e.value)==-1) {
          idx.push(e.value); 
          rows.push(e);
        }
      })
      part.combobox('loadData',rows);
      */
      
      $.page.fn.partsload([],'ship',false);
      break; 
  }
  
}

// return form data
$.page.fn.fdat = function(key){
  var data = frm2dic($('form#trans'));
  if(key) {return data[key] || null;}
  else return data;
}

$.page.fn.minmax = function(min,max){
  max = max || 1000000;
  min = min || 1;
  if(max==1000000) var avail = ''; else var avail = max; 
  $('#AVAIL_BAL').numberbox('setValue',parseFloat(max).toFixed(2))
  $('#QTY').numberspinner('set',{'val':0, 'min':0,'max':max*1});
}

// load the Traceable Properties
$.page.fn.props = function(data){
  for(var key in data.part){
    if(key.indexOf('TRACE_USER_')==0){
      var fitem = $('div#traceprop div.fitem#'+key); 
      var label = fitem.find('label.trace');
      var inp = fitem.find('input.textbox-f'); 
      if(data.part[key] != '') {
        label.text(data.part[key].replace('*',''));
        fitem.show();
        if($.page.fn.stat == 'ADJ-IN' && data.part[key].indexOf('*')===0) inp.textbox('required');
      } 
      else {
        fitem.hide();
      } 
    }  
  }
}

// prevent changes to div & contents
$.page.fn.lock = function(rem){  
  if(rem) $('form#trans').removeClass('lock');
  else $('form#trans').addClass('lock');
  var tdate=$('#TRANSACTION_DATE');
  var editTdate=$.dui.bhave.ALLOWED_EDIT_TXDATE || 'n';
  if (editTdate=='y') tdate.datebox('readonly',false).removeAttr('readonly');
  else tdate.datebox('readonly',true).removeAttr('readonly');
}

$.page.fn.part_locked = function(){
  var locked = $('#LOCKED').textbox('getValue');   
  var pid = $('#PART_ID').combobox('getValue');
  if (locked=='Y') {
    msgbox('Part '+pid+' LOCKED. '+'<br><b>Part Trans NOT allowed!</b>');
    $('#SAVE').linkbutton('disable');
  }
  else $('#SAVE').linkbutton('enable');
}

// 200725 - PAC New Method of Loading Parts
$.page.fn.partsload = function(cls,mode,bals){
  var pid = $('#PART_ID');
  var qp = pid.combobox('options').queryParams;
  pid.combobox('options').queryParams = Object.assign(qp,{
    PART_CLASS_ID : cls.join('^'),
    _bals         : bals, 
    _mode         : mode,
  })
  pid.combobox('reload');
}

$(document)
  .keydown(function (e) {if(e.keyCode == 81) $.page.fn.shift = true})
  .keyup(function (e) {if(e.keyCode == 81) $.page.fn.shift = false});

$(document).ready(function(){



  // 171116 - Editable Dimensions Boxes.
  $('#DIM_LENGTH, #DIM_WIDTH, #DIM_HEIGHT').numberbox({
    editable:false,
    icons: [{
		  enabled: true,
		  iconCls:'icon-edit',
      handler: function(e){
			  e.preventDefault();
			  if(!(/JOB-IN|ADJ-IN/).test($.page.fn.stat)) return;
			  $('#DIM_LWH').combobox('readonly',true);
			  $('#DIM_PC_QTY').numberspinner('set',{'max':null});
			  var me = $(e.data.target);
			  setTimeout(function(){
  			  me.textbox({editable:true});
  			  me.next('span.textbox').removeClass('textbox-readonly');
  			  euifocus(me);
        })
      }
		}]
  })

  $('#JOB_QBE').qbe({      
    
    queryParams : {
      _sqlid    : 'vwltsa^seqpart_qbe'
    },
    
    onDemand: true,
    valueField  : 'PART_ID',
    fit         :true,
    fitColumns  : true,
  
    fields      :[
      {field:'WOREF',title:'Job ID',editor:'textbox',formatter:function(val){return val.split('^')[0]}},
      {field:'SEQ_NO',title:'Seq No',formatter:function(val,row,idx){return row.WOREF.split('^').slice(-1)[0]},editor:'textbox'},
      {field:'PART_ID',title:'Part ID',editor:'textbox'},

      {field:'WANT_DATE_FROM_',title:'Min Due Date',editor:'datebox',hidden:true},
      {field:'WANT_DATE',title:'Due Date',formatter:eui.date},
      
      {field:'REQUIRED_QTY_FROM_',title:'Min Qty Reqd',editor:{type:'numberbox',options:{value:1}},hidden:true},
      {field:'REQUIRED_QTY',title:'Qty Reqd'},
      
      {field:'QTY_DUE_FROM_',title:'Min Qty Due',editor:{type:'numberbox',options:{value:1}},hidden:true},
      {field:'QTY_DUE',title:'Qty Due'},
      
      {field:'DESCRIPTION',title:'Description',editor:'textbox'},
    ],
    
    onSelect: function(row){
      $('#WOREF').combobox('options')._qbeworef = row.WOREF;
      $('#PART_ID').combobox('select',row.PART_ID);
    }
  });

  $('#LOT_SIZE').numberbox();

  $('#PART_ID').combobox({    
    
    url         : '/',
    qbeworef    : null,
    rec         : {},
    panelWidth  : '250px',
    groupField  : 'PART_CLASS_ID',
    
    // Initial setting updated by $.page.fn.partsload();
    queryParams     : {
      _sqlid        : 'inv^traceparts',
      _func         : 'get',
      _combo        : 'y',
      
      /*  Set by $.page.fn.partsload */
      PART_CLASS_ID : null,
      _bals         : null, 
      _mode         : null,      
    },
    
    // prevent extra request when page is first loaded
    onBeforeLoad: function(qp){
   
      return (qp._mode != null); 
      

    },
    
    loadFilter: function(data){
      return multisort(data,['PART_CLASS_ID','value']);
    },
    
    onSelect: function(rec){
      var opts = $(this).combobox('options')
      if(!rec) msgbox('This is not a stockable part');
      else {
      ajaxget('/',{
        
        '_sqlid'      : 'inv^tracepart',
        '_func'       : 'get',
        'ID'          : rec.value,
        'TRANS_TYPE'  : $.page.fn.stat,
        'MISC_TRANS'  : $.dui.bhave.ALLOWED_MISC_TX || 'n'
        
      },function(data){    
        
        if(data.error) return reload();
              
        // Always do these
        opts.rec = data;
        
        $('#PART_DESC').textbox('setValue',opts.rec.part.DESCRIPTION);
        $('#PART_UOM').textbox('setValue',opts.rec.part.UOM_ID);
        $('#TRACEABLE').textbox('setValue',{'Y':'Traceable','N':'Not Traceable',}[opts.rec.part.TRACEABLE]||'Not Traceable');
        $('#LOCKED').textbox('setValue',opts.rec.part.LOCKED);
        $('#DIM_TRACKED')
          .textbox('setValue',opts.rec.part.DIM_TRACKED)
          .textbox('setText',{'Y':'Yes','N':'No',}[opts.rec.part.DIM_TRACKED]||'No');        
        
        $('#DIM_UOM').textbox('setValue',opts.rec.part.DIM_UOM);
        $('#LOT_SIZE').numberbox('setValue',opts.rec.part.LOT_SIZE);
        var mCost=$('#UNIT_MATERIAL_COST');
        mCost.numberbox('setValue',opts.rec.part.UNIT_MATERIAL_COST);
        mCost.numberbox('readonly',!$.page.fn.allowManualUnitCost());
        $('#SAVE').linkbutton('enable');
        
        // udf labels
        setudfs(data.udf,$('form#trans'));
        for(var u in opts.rec.part){
          if(u.indexOf('USER_')==0) $('input[name="'+u+'"]').textbox('setValue',opts.rec.part[u]);
        }
        $('#udfs').show();

        $.page.fn.part.onLoad(data);
        $.page.fn.part_locked();
      }) 
    }
    }
  })
  
  $('#WOREF').combobox({
    
    _qbeworef   : null,
    
    groupField  :'BASE_ID',
    
    /* job.combobox('loadData',jobopt.seqRows);  */
    loadFilter: function(data){
      var opts = $(this).combobox('options');
      if(!opts.basRows){
        data.bas.map(function(e){e.value+='^0'});
        opts.basRows = data.bas;
        opts.seqRows = data.seq;
        return {bas:[],seq:[]};
      }
      return data;
    },

    onLoadSuccess: function(data){
      var me = $(this);
      var opts = me.combobox('options');
      if(opts._qbeworef) setTimeout(function(){
        if(objidx(data,'value',opts._qbeworef) < 0) msgbox(opts._qbeworef+' job is not selectable.');
        else me.combobox('select',opts._qbeworef);
        opts._qbeworef = null;
      },200) 
    },

    onSelect:function(rec){

      if ($.dui.bhave.WIP_COUNT_ALLOW_JOB_OUT=='n'){
    
        ajaxget('/',{
          '_sqlid':'inv^wip_count_job',
          '_func':'get',
          'WOREF':rec.value,

          },function(data){    
            if (data.length>0) {
              msgbox('**<b>Job, '+rec.value+' in ACTIVE WIP COUNT ,'+data[0].WIP_COUNT_ID+' **</b>\n Material issue not allowed!')
              $('#SAVE').linkbutton('disable');
            }
            else $('#SAVE').linkbutton('enable');
          })
      }
      
      var bits = rec.value.split('^');
      $('#BASE_ID').textbox('setValue',bits[0]);
      
      // Disabled as these values are not in rec !
      var txt_req=rec.qreq+' / ' + rec.RECEIVED_QTY;
      $('#QTY_REQ').textbox('setValue',txt_req);
      $('#JOB_COST').textbox('setValue',rec.ACT_TOTAL_COST );
      $('input#QTY_RCVD').val(rec.RECEIVED_QTY);

      //$('#QTY_REQ').textbox('setValue',(rec.qreq || 0 + ' / ' +(rec.RECEIVED_QTY || 0)));
      if(bits.length > 1){
        $('#SUB_ID').textbox('setValue',bits[1]);
        $('#SEQ_ID').textbox('setValue',bits[2]);
      }
      if($.page.fn.jobopt.onSelect) return $.page.fn.jobopt.onSelect(rec);
      
      // if no override.
      var part = $('#PART_ID').combobox('options').rec.part;
      $.page.fn.tracediv(part);  
    }
  })
  

  $('#TRACE_ID').combobox({
    editable: false,  
    loadFilter:function(data){
      var opts = $(this).combobox('options');
      if(!opts.allRows) opts.allRows=data;
      return data;
    },
    
    formatter: function(row){
      return row.value +' ( '+row.BAL_QTY+' )';  
    },
    
    onSelect:function(rec){
      
      if( ['ADJ-IN','FG-IN'].indexOf($.page.fn.stat) > -1 && $.page.fn.fdat('DIM_TRACKED')=='Y') return false;

      if($.page.fn.traceopt.onSelect) return $.page.fn.traceopt.onSelect(rec);
      
      $('#BAL_QTY').numberbox('setValue',rec.BAL_QTY);
      $('#EXPIRY_DATE').datebox('setValue',rec.EXPIRY_DATE);    // PAC 171108
      $.page.fn.minmax(1,rec.BAL_QTY);

      // PAC New Code
      if($.page.fn.fdat('DIM_TRACKED') == 'Y'){
        var lwh = $('#DIM_LWH');
        $('#dimin .textbox-f, #dimout .textbox-f').textbox('clear');
        lwh.combobox('options')._traceid = rec.TRACE_ID;

        lwh.combobox('options')._woref = rec.WOREF;        
        lwh.combobox('reload');
      }
      
      function go(){
        var tracemcost= $('#TRACE_MATERIAL_COST');
        tracemcost.numberbox('setValue',rec.TRACE_MATERIAL_COST);
        tracemcost.numberbox('readonly',true);
        var data={}; for(var k in rec){if(k.indexOf('TRACE_USER_')==0) data[k]=rec[k]}
        $('form#trans').form('load',data);
      }
      
      if(rec.EXPIRY_DATE && new Date(rec.EXPIRY_DATE) < new Date()){
        if($.page.fn.stat=='JOB-OUT' && $.dui.bhave.EXPIRED_ALLOW_JOB_OUT != 'y') {
          msgbox('Cannot issue expired material to Job');
          return $('#tracediv .textbox-f').textbox('reset');
        }
        
        confirm(function(yn){
          if(!yn) $('#tracediv .textbox-f').textbox('reset');
          else go();
        },'Trace has expired. Continue ?')
      } else go();
      
    },
    
    delay: 500,
    
    onChange: function(nv,ov){
      // ### ONLY check for IN Transactions & ignore if piece tracked.
      if(['ADJ-IN','FG-IN'].indexOf($.page.fn.stat)==-1 || $.page.fn.fdat('DIM_TRACKED')=='Y') return;
      if(nv && $(this).combobox('find',{value:nv})){
        msgbox('Warning, Trace ID '+nv+' exists for this part.');
      } 
      $('#traceprop input.textbox-f').textbox('readonly',false);
    }
  })

  // this is 2 buttons.
  $('#typediv > button').linkbutton({
    disabled: false,
    iconAlign:'left',
    onClick:function(rec){
      var me = $(this);
      var name = me.attr('name');
      $.page.fn.typediv = name; // PAC 171106
      putcook('vwltsa^matl^part_trans',name);
      var comp = $('#compdiv'), fg = $('#fgdiv');
      if(name=='FG'){comp.hide();fg.show();}
      else {comp.show();fg.hide();}    
    }
  })

  var cook = getcook('vwltsa^matl^part_trans');
  if(cook) $('#typediv button[name='+cook+']').click();

  
  $('#modediv button').linkbutton({
    disabled: true,
    size:'large',
    iconAlign:'top',
    onClick:function(rec){
      $('#typediv').addClass('lock');
      var me = $(this);
      $.page.fn.stat = me.attr('name');
      $('#TRANS_TYPE').val($.page.fn.stat);
      $('#modediv button').not($(this)).linkbutton('disable').linkbutton('unselect');
      $.page.fn.lock(true);
      $.page.fn.switch();
    }
  })

  $('#SAVE').linkbutton({
    disabled: true,
    size:'large',
    iconAlign:'top',
    onClick: function(){
      var me = $(this);
      nodclick(me,2000);
      //me.linkbutton('disable');
      if($.page.fn.fdat('QTY') < 0) return msgbox('Quantity must be greater than 0.');


      var frm = $('form#trans');
      frm.form('options').queryParams._mode = $.page.fn.mode;
      frm.form('submit');
    }
  });
  
  $('#CANCEL').linkbutton({
    disabled: false,
    size:'large',
    iconAlign:'top',
    onClick: function(){
      reload();  
    }
  });

  $('form#trans').form({
    url:'/',
    queryParams:{
      _sqlid:'inv^invtrans',
      _func:'add'
    },
    
    success: function(res){
      res = JSON.parse(res);
      if(res.error) return msgbox(res.msg);
      grnflash('#but_save');
      setTimeout(function(){
        reload(); // this causes js error.
      },500);
    }
  
  });

  $('#QTY').numberspinner({
    'onChange':function(nv,ov){
      if ($.page.fn.stat=='FG-IN'){
        if ($.dui.bhave.FG_IN_UNIT_TRACE_COST=='J'){
          var tmc=$('#TRACE_MATERIAL_COST');
          tmc.numberspinner('setValue',0);
          var jc=$('#JOB_COST').textbox('getValue');
          var qty_rcvd=$('input#QTY_RCVD').val();
          var nqty=(nv*1)+parseFloat(qty_rcvd);
          if (nqty>0 ) tmc.numberspinner('setValue',jc/nqty);
        }
      }
    }
  })
  
  // this was in PART_ID.loadFilter
  $('#modediv button').linkbutton('enable');

  //enable/disable trans buttons based on Group access("PT-ADJ","PT-JOB","PT-FG","PT-SHP")
  var docs =["ADJ","JOB","FG","SHP"];
  var isSysadm = $.dui.udata.groups.indexOf('SYSADM') > -1;
  var flag="disable";
  docs.map( d => {
    if (isSysadm) flag = "enable";
    else if ($.dui.udata.groups.indexOf('PT-'+d)==-1) flag="disable";
    else flag = "enable";
    $('#bigbut button[name="'+d+"-IN"+'"]').linkbutton(flag);
    $('#bigbut button[name="'+d+"-OUT"+'"]').linkbutton(flag);
  })

})

});  // $.page.ready
