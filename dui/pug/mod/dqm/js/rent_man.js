

// ─── Functions ───────────────────────────────────────────────────

// Qty formatter
$.page.fn.qtyfmt = function(val){ if(val) return parseInt(val); return 0; };

// Get qty helper
$.page.fn.getqty = function(val){
  if(!val || isNaN(val)) return 0;
  else return parseInt(val);
};

// Unlinked Jobs — populate fields from gauge record
$.page.fn.unlinked = function(rec){
  rec.ROYALTY_TYPE = rec.ROYALTY_TYPE || 'ONE-TIME';
  var jqp = {_sqlid:'dqm^rent_jobs', _func:'get', _dgrid:'y'};
  var els = ['LICENSOR_ID','GAUGE_RENT_DIAMETER','GAUGE_RENT_WEIGHT','GAUGE_RENT_THREAD','GAUGE_RENT_PINBOX','RENTAL_DAILY','RENTAL_ROYALTY','RENTAL_CURRENCY','ROYALTY_CURRENCY','ROYALTY_TYPE'];
  els.map(function(e){
    var el = $('input[textboxname='+e+']');
    if(el.hasClass('numberbox-f')) var type = 'numberbox'; else var type = 'textbox';
    el[type]('setValue',rec[e]);
    jqp[e] = rec[e];
  });
  $('#joblist').datagrid('load',jqp);
};

// Load linked lines
$.page.fn.lines = function(opt){
  opt = opt || {};
  var rid = $('#RENTAL_ID').searchbox('getValue');
  var qp = $.extend({
    _func: 'get',
    _sqlid: 'dqm^rent_lines',
    _dgrid: 'y',
    RENTAL_ID: rid
  },opt);
  $('#jobusage').datagrid('load',qp);
};

// Calculate rental days & costs
$.page.fn.rentdays = function(){
  var lsd = $('input[name=LICENSOR_START_DATE]').val();
  var led = $('input[name=LICENSOR_END_DATE]').val();
  $.page.fn.sdate = null; $.page.fn.edate = null;

  if(['SHIP_DATE','RECEIPT_DATE'].indexOf(lsd)==-1) return msgbox('Invalid Licensor Start-Date Formula');
  else if(['RETURN_DATE','RETURN_ARRIVAL_DATE'].indexOf(led)==-1) return msgbox('Invalid Licensor End-Date Formula');

  if(lsd && led){
    var sdel = $('input[textboxname='+lsd+']');
    if(sdel.length==0) return msgbox('Bad Start Date Mode');
    sdel.datebox('textbox').removeClass('bg-grn');

    var edel = $('input[textboxname='+led+']');
    if(edel.length==0) return msgbox('Bad End Date Mode');
    edel.datebox('textbox').removeClass('bg-grn');
    var sdate = sdel.datebox('getDate');
    var edate = edel.datebox('getDate');

    $.page.fn.sdate = isdate(sdate);
    $.page.fn.edate = isdate(edate);

    if($.page.fn.sdate && $.page.fn.edate){
      sdel.datebox('textbox').addClass('bg-grn');
      edel.datebox('textbox').addClass('bg-grn');

      var lic = $('input[textboxname=LICENSOR_ID]').textbox('getValue');
      var tdays=0;
      ajaxget('/',{_sqlid:'dqm^licensor',_func:'get',LICENSOR_ID:lic},function(data){
        if (data.MIN_DAYS>0){
          tdays = daysBetween(sdate,edate);
          if(tdays==0) tdays = data.MIN_DAYS;
        }
        else tdays = daysBetween(sdate,edate)+1;

        $('input[textboxname=RENTAL_DAYS]').numberbox('setValue',tdays);

        var daily = $('input[textboxname=RENTAL_DAILY]').numberbox('getValue');
        $('input[textboxname=RENTAL_COST]').numberbox('setValue',daily*tdays);
      });
    }
  }
};

// Enable/disable based on status

// Freight costs calculator
$.page.fn.freight = function(io){
  var sums = {
    'out':{
      tot: $('input[textboxname=OUTGOING_TOTAL]'),
      sum: 0,
      els: '.easyui-numberbox.cost-out:not(.total)'
    },
    'in': {
      tot: $('input[textboxname=INCOMING_TOTAL]'),
      sum:0,
      els: '.easyui-numberbox.cost-in:not(.total)'
    }
  };

  var op = $('#INCLUDE_OUTBOUND_FREIGHT').combobox('getValue') || 'N';
  var ic = $('#INCOMING_CURRENCY'), oc=$('#OUTGOING_CURRENCY');
  if(op=='Y') oc.combobox('readonly',true).combobox('select',ic.combobox('getValue'));
  else oc.combobox('readonly',false);

  io = io || ['out','in'];
  io.map(function(e){
    $.each($(sums[e].els),function(){
      var val = parseFloat($(this).numberbox('getValue'));
      sums[e].sum += val;
    });
    sums[e].tot.numberbox('setValue',sums[e].sum);
  });

  var val = sums.in.sum;
  if(op=='Y') val += sums.out.sum;
  $('#PO_TRANSPORT_AMT').numberbox('setValue',val);
  $('#PO_FREIGHT_CURRENCY').textbox('setValue',oc.combobox('getValue'));
};

// Save a linked line
$.page.fn.saverow = function(row,mode,cb){
  if(isNaN(row.OPERATION_COST)) row.OPERATION_COST = 0;
  delete(row.ROYALTY_QTY);
  delete(row.ROYALTY_COST);
  row.WO_WANT=ms2date(row.WO_WANT);
  row.WO_RELEASE=ms2date(row.WO_RELEASE);

  var qp = $.extend({
    _func:mode,
    _sqlid: 'dqm^rent_line'
  },row);

  ajaxget('/',qp,function(res){
    if(!res.error && qp._func=='del') $('#joblist').datagrid('reload');
    $('#jobusage').datagrid('reload');
    cb(res);
  });
};

// Exchange rates
$.page.fn.xrates = function(){
  var syscur = $('#SYS_CURRENCY').val();

  var rentcur = $('#RENTAL_CURRENCY').textbox('getValue');
  var rentxri = $('#RENTAL_XRATE');
  var rentxr = parseFloat(rentxri.numberbox('getValue'));
  if(syscur == rentcur) {
    rentxri.numberbox('readonly',true).numberbox('setValue',1);
    rentxr = 1;
  } else rentxri.numberbox('readonly',false);

  var rentcost = parseFloat($('#RENTAL_COST').numberbox('getValue'));
  $('#RENTAL_SYSCUR').numberbox('setValue',rentcost/rentxr);

  var roycur = $('#ROYALTY_CURRENCY').textbox('getValue');
  var royxri = $('#ROYALTY_XRATE');
  var royxr = parseFloat(royxri.numberbox('getValue'));
  if(syscur == roycur) {
    royxri.numberbox('readonly',true).numberbox('setValue',1);
    royxr = 1;
  } else royxri.numberbox('readonly',false);

  var royrate = parseFloat($('input[textboxname=RENTAL_ROYALTY]').numberbox('getValue'));
  var ersys=0; if(royxr > 0) ersys = royrate/royxr;
  $('#ENDS_RATE_SYSCUR').numberbox('setValue',ersys);
};

// Derive status from dates/close
$.page.fn.dostat = function(){
  var inv = $('#LICENSOR_CLOSE').textbox('getValue');
  var stat = 'OPEN';
  if(inv != '') stat = 'CLOSED';
  else if($.page.fn.edate) stat = 'RETURNED';
  else if($.page.fn.sdate) stat = 'RECEIVED';
  $('#STATUS').combobox('select',stat);
};

// Check if form is loading
$.page.fn.loading = function(){ return $('form#main').form('options').loading; };

// ─── Init ────────────────────────────────────────────────────────

$.page.ready(function(){

// ─── Register ────────────────────────────────────────────────────
$.page.register({
  fn:{

  
status : function(){
  console.log('$.page.fn.status')
  var cbo = $('#STATUS');
  var jopt = $('#joblist').datagrid('options');
  var stat = cbo.combobox('getValue');
  var link = $('#jobusage');
  var frm = $('form#main');
  $('#GAUGE_ID').searchbox('readonly',true);
  $('#recalc').linkbutton('enable');
  $('#lic_close').linkbutton('enable');

  console.log(stat)
  //setTimeout(function(){
    if(stat=='CLOSED'){
      jopt.disabled = true;
      frm.addClass('form-lock');
      link.datagrid('readonly',true);
      $('#recalc').linkbutton('disable');
      if($.dui.udata.groups.indexOf("GR-LIC-CLOSE")!==-1) $('#lic_close').linkbutton('enable');
      else $('#lic_close').linkbutton('disable');
    } else {
      frm.removeClass('form-lock');
      jopt.disabled = false;
      link.datagrid('readonly',false);
      $('#lic_close').linkbutton('disable');
    }
  //});
}
}
});
  
  toolbut([
    {
      id:'recalc',
      iconCls: 'icon-reload',
      text: 'Reload',
      disabled: true,
      noText: false,
      onClick: function(){
        confirm(function(yn){
          if(yn) $('#GAUGE_ID').searchbox('reselect');
        },'Reload Gauge Params ?');
      }
    },
    {
      id:'lic_close',
      iconCls: 'icon-app',
      text: 'Reset Licensor Close',
      disabled: true,
      noText: false,
      onClick: function(){
        confirm(function(yn){
          if(yn){
            var lic_close=$('#LICENSOR_CLOSE');
            if($.dui.udata.groups.indexOf("GR-LIC-CLOSE")!==-1) {
              lic_close.textbox('setValue',"");
              msgbox('Licensor Close reset. Please save the changes.');
            }
            else msgbox('You are NOT allowed to reset the licensor close.');
          }
        },'Reset Licensor Close ?');
      }
    }
  ]);
  

  // DUI replacement — buttons defined in pug, clicks bound here
  $('#recalc').on('click', function(){
    confirm(function(yn){
      if(yn) $('#GAUGE_ID').searchbox('reselect');
    },'Reload Gauge Params ?');
  });

  $('#lic_close').on('click', function(){
    confirm(function(yn){
      if(yn){
        var lic_close=$('#LICENSOR_CLOSE');
        if($.dui.udata.groups.indexOf("GR-LIC-CLOSE")!==-1) {
          lic_close.textbox('setValue',"");
          msgbox('Licensor Close reset. Please save the changes.');
        }
        else msgbox('You are NOT allowed to reset the licensor close.');
      }
    },'Reset Licensor Close ?');
  });

  // Jobmove combo — gets data from main combo
  $('#jobmove #_RENTAL_ID').searchbox({
   
    loadFilter: function(data){
      var cur = $('#RENTAL_ID').searchbox('getValue');
      var del=-1; data.map(function(e,i){if(cur==e.value) del=i;});
      if(del>-1) data.splice(del,1);
      return data;
    }
  });

  // Jobmove popup dialog
  $('#jobmove').dialog({
    onOpen: function(){
      var rid = $('#RENTAL_ID');
      var data = rid.searchbox('getData');
      $('#jobmove #_RENTAL_ID').searchbox('loadData',data);
    },
    buttons:[
      {
        iconCls:'icon-save',
        text:'Save',
        handler:function(){
          var dg = $('#jobusage');
          var row = dg.datagrid('getSelected');
          var newid = $('#jobmove #_RENTAL_ID').searchbox('getValue');
          if(!newid) return alert('Select a target rental id.');
          ajaxget('/',{
            _sqlid:'dqm^linkmove',
            _func:'upd',
            OLD_RENTAL_ID: row.RENTAL_ID,
            OPN_REF: row.OPERATION_REF,
            NEW_RENTAL_ID: newid
          },function(res){
            if(!res.error){
              dg.datagrid('reload');
              $('#jobmove').dialog('close');
              msgbox(row.OPERATION_REF.replace(/\^/g,'.') +' moved to '+ newid);
            }
          });
        }
      },{
        iconCls:'icon-cancel',
        text:'Close',
        handler:function(){$('#jobmove').dialog('close');}
      }
    ]
  });

  // ─── Field rules ───────────────────────────────────────────────
  var freightCompany=["INCOMING_CO","OUTGOING_CO"];
  freightCompany.map(i=>{
      $(`[name=${i}`).combobox({
    data:jsonParse($.dui.bhave["CBO_FREIGHT_CO"]),
    panelHeight:"auto",
    editable:false
  })
  })



      

  // Freight numberbox init
  $('.easyui-numberbox.cost-in, .easyui-numberbox.cost-out').numberbox({
    min:0,
    precision:2,
    prefix:'$',
    value:0,
    align:'right',
    onChange: function(nv,ov){
      var io='in', me = $(this);
      if(me.hasClass('total')) {
        if(me.attr('textboxname') == 'INCOMING_TOTAL') $('#PO_TRANSPORT_AMT').numberbox('setValue',nv);
        return;
      }
      if(me.hasClass('cost-out')) io='out';
      $.page.fn.freight([io]);
    }
  });

  $('#INCOMING_CURRENCY, #INCLUDE_OUTBOUND_FREIGHT').combobox({
    onChange: function(nv,ov){
      $.page.fn.freight();
    }
  });

  $('#LICENSOR_CLOSE').textbox({
    onChange:function(nv,ov){
      if(!$.page.fn.loading()) $.page.fn.dostat();
    }
  });

  $('#STATUS').combobox({
    panelHeight: 'auto',
    data:[
      {value:'OPEN',text:'OPEN'},
      {value:'RECEIVED',text:'RECEIVED'},
      {value:'RETURNED',text:'RETURNED'},
      {value:'CLOSED',text:'CLOSED'}
    ],
    onSelect: function(nv,ov){
      $.page.fn.status();
    },
    onChange:function(){
            $.page.fn.status();
    }
  });

  $('#RENTAL_XRATE, #ROYALTY_XRATE').numberbox({
    onChange: function(){
      if($('form#main').form('options').loading) return;
      $.page.fn.xrates();
    }
  });

  // Zero Rental button
  $('a#ZERORENTAL').linkbutton({
    onClick:function(){
      confirm(function(yn){
        if(yn){
          $('input[textboxname=RENTAL_DAILY]').numberbox('setValue',0);
          $('input[textboxname=RENTAL_COST]').numberbox('setValue',0);
          $.page.fn.xrates();
          msgbox('Rental rate/cost has changed, please save the changes.');
        }
      },'Reset Rental Rate and Rental cost to 0.00 ?');
    }
  });

  // ─── Grids ─────────────────────────────────────────────────────

  // Un-linked Jobs datagrid
  $('#joblist').datagrid({
    queryParams: {
      _sqlid:'dqm^rent_jobs',
      _func:'get',
      _dgrid: 'y'
    },
    onBeforeLoad: function(){
      if($(this).datagrid('options').disabled) return false;
    }
  });

  // Add button — link selected unlinked job to the rental
  $('#joblist_add').off('click.link').on('click.link', function(){
    var dg = $('#joblist');
    var row = dg.datagrid('getSelected');
    if(!row) return;
    var idx = dg.datagrid('getRowIndex', row);
    var opt = dg.datagrid('options');
    if(opt.disabled) return;
    opt.disabled = true;
    row.RENTAL_ID = $('#RENTAL_ID').searchbox('getValue');
    if(!row.RENTAL_ID) {
      dg.datagrid('unselectAll');
      opt.disabled = false;
      return msgbox('Please save agreement first.');
    }
    row.LICENSOR_JOB = 'TBA';
    var dels = ['WO_CLASS','COMPLETED_QTY','SHIPPED_QTY'];
    dels.map(function(e){delete(row[e]);});

    $.page.fn.saverow(row,'add',function(res){
      if(res.error) {
        opt.disabled = false;
        return;
      }
      $('#jobusage').datagrid('reload');
      setTimeout(function(){
        dg.datagrid('deleteRow',idx);
        opt.disabled = false;
      },250);
    });
  });

  // Linked Jobs datagrid — UDF label overrides
  $.page.fn.udflabels = {};
  if($.dui.bhave.LBL_UDF) jsonParse($.dui.bhave.LBL_UDF).map(function(e){ $.page.fn.udflabels[e.value] = e.text; });

  // Apply UDF labels to jobusage columns
  var juOpts = $('#jobusage').datagrid('options');
  if(juOpts && juOpts.columns && juOpts.columns[0]) {
    juOpts.columns[0].map(function(e){
      e.title = $.page.fn.udflabels[e.field] || e.title;
    });
  }

  // Linked Jobs — rowEditor with callbacks
  $.page.fn.opts = {
    queryParams: {
      _sqlid:'dqm^rent_lines',
      _func:'get',
      _dgrid: 'y'
    },
    onBeforeLoad: function(){
      if($(this).datagrid('options').disabled) return false;
    },
    onLoadSuccess: function(data){
      $.page.fn.nojob=0;

      $('#job_move').off('click.move').on('click.move', function(){
        $('#jobmove').dialog('open');
      });

      var ROYALTY_QTY = 0; if(data.total > 0) ROYALTY_QTY = data.rows[0].ROYALTY_QTY;
      $('#ROYALTY_QTY').numberbox('setValue',ROYALTY_QTY);
      var ROYALTY_COST = 0; if(data.total > 0) ROYALTY_COST = data.rows[0].ROYALTY_COST;
      $('#ROYALTY_COST').numberbox('setValue',ROYALTY_COST);
      var ENDS_RATE_SYSCUR = $('#ENDS_RATE_SYSCUR').numberbox('getValue');
      $('#ROYALTY_SYSCUR').numberbox('setValue',ROYALTY_QTY*ENDS_RATE_SYSCUR);

      data.rows.map(function(e){
        if(e.LICENSOR_JOB=='TBA') $.page.fn.nojob++;
      });

      if($.dui.bhave.TBA_WARNING!='n' && $.page.fn.nojob>0) msgbox($.page.fn.nojob+' jobs require Licensor JOB ID.');
    },
    onSelect: function(){
      $('#job_move').removeClass('opacity-40 pointer-events-none');
    },
    onEndEdit: function(idx,row,chg){
      $.page.fn.saverow(row,'upd',function(res){
        // do nothing
      });
    },
    onDeleteRow: function(idx,row){
      $.messager.confirm('Delete','Delete this linked job?',function(ok){
        if(!ok) return;
        $.page.fn.saverow(row,'del',function(res){});
      });
    }
  };

  $('#jobusage').datagrid('rowEditor', $.page.fn.opts)  ;

  

  // LICENSOR_JOB styler — set on state._stylers so they apply at render time
  var juState = $.data($('#jobusage')[0], 'datagrid');
  if(juState) {
    if(!juState._stylers) juState._stylers = {};
    if(!juState._formatters) juState._formatters = {};
    juState._stylers.LICENSOR_JOB = function(val){ if(val=='TBA') return {class:'text-error font-bold'}; };
    juState._stylers.WO_COMPLETED_QTY = function(val,row){ if(row.FIXED_QTY > 0) return {class:'text-success',style:'text-decoration: line-through;'}; };
    juState._stylers.FIXED_QTY = function(val){ if(val>0) return {class:'text-error font-bold'}; };
    juState._formatters.FIXED_QTY = function(val,row,idx){ if(val>0) return $.page.fn.qtyfmt(val); else return '-'; };
    juState._formatters.ZERO_QTY = function(val){ if(!val) return 'NO'; return val; };
  }

  // ─── Form loadDone ─────────────────────────────────────────────
  /*
  // Rental ID filter
  $('#RENTAL_ID').combobox('filtertip',{
    default: ['OPEN'],
    field: 'STATUS',
    data: [
      {name:'OPEN',text:'Open'},
      {name:'RECEIVED',text:'Received'},
      {name:'RETURNED',text:'Returned'},
      {name:'CLOSED',text:'Closed'},
    ]
  });
  */
  // Gauge Select
  $('#GAUGE_ID').searchbox({
    //url: '/?_func=get&_sqlid=dqm^rent_gauges&_combo=y',
   // groupField: 'GAUGE_TYPE',
    onSelect:function(rec){
      $.page.fn.unlinked(rec);
      $('input[name=LICENSOR_START_DATE]').val(rec.LICENSOR_START_DATE);
      $('input[name=LICENSOR_END_DATE]').val(rec.LICENSOR_END_DATE);
    }
  });

  // After Add
  $('#but_add').on('done',function(jq){
    $('#STATUS').combobox('select','OPEN');
    $.page.fn.status();
    $('#GAUGE_ID').searchbox('readonly',false);
    $('#joblist').datagrid('loadData',[]);
    $('#jobusage').datagrid('loadData',[]);
  });

  // Main Form loadDone
  $('form#main').on('loadDone',function(jq,data){
    $('#dates input').removeClass('bg-grn');

    var prid = $('#PR_NO');
    if($.dui.bhave.PRID_CLONE !='n') prid.textbox('readonly',true).textbox('setValue',data.RENTAL_ID);
    else prid.textbox('readonly',true);

    var qp = {};
    if(data.STATUS != 'CLOSED') {
      qp.recalc='y';
      $.page.fn.unlinked(data);
    }
    $.page.fn.lines(qp);

    setTimeout(function(){
      try {
        $.page.fn.rentdays();
        $.page.fn.xrates();
        $.page.fn.freight();
      } catch(e) {
        console.warn('[rent_man] loadDone calc error:', e.message);
      }
      $.page.fn.status();
    });
    
  });

  // Tooltips
  $('tr.datagrid-header-row > td[field=FIXED_QTY]').tooltip({
    content:'Fixed Qty overrides qty complete.'
  });

  $('tr.datagrid-header-row > td[field=ZERO_QTY]').tooltip({
    content:'Usage qty will be zero.'
  });

  $('#jobusage').datagrid('resize');

  // Barcode scanner
  bcscan(function(bc){
    switch (bc.pre){
      case "0":
        var emp = $('#GAUGE_ID');
        var exists = emp.searchbox('exists',bc.data);
        emp.combobox('select',bc.data);
        break;
    }
  },4);

});
