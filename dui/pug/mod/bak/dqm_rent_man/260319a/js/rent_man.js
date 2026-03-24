// Job Columns
$.page.fn.jobcols = [
  {field:'_cbox',checkbox:true,title:'Sel'},
  {field:'OPERATION_REF',title:'Operation Ref', width:120, formatter:eui.ref2text},
  {field:'WO_CLASS',title:'Job Class',width:100,coloff:true},
  {field:'RESOURCE_ID',title:'Resource ID',width:100},
  {field:'WO_RELEASE',title:'Released', width:80,formatter:eui.date,coloff:true},
  {field:'WO_WANT',title:'Wanted', width:80,formatter:eui.date,coloff:true},
  {field:'WO_QTY',title:'Reqd Qty',width:60,formatter:$.page.fn.qtyfmt, align:'right',coloff:true},
  {field:'WO_COMPLETED_QTY',title:'Comp Qty',width:60,formatter:$.page.fn.qtyfmt, align:'right',coloff:true},
  {field:'COC_QTY',title:'COC Qty',width:60,formatter:$.page.fn.qtyfmt, align:'right',coloff:true},
  {field:'SALES_ORDER_REF', title:'Order ID / Line', width:120, formatter:eui.ref2text},
  {field:'CUSTOMER_ID', title:'Cust ID', width:80, fixed:true,coloff:true},
]


// Unlinked Jobs
$.page.fn.unlinked = function(rec){
  rec.ROYALTY_TYPE = rec.ROYALTY_TYPE || 'ONE-TIME';
  var jqp = {_sqlid:'dqm^rent_jobs', _func:'get', _dgrid:'y'}
  var els = ['LICENSOR_ID','GAUGE_RENT_DIAMETER','GAUGE_RENT_WEIGHT','GAUGE_RENT_THREAD','GAUGE_RENT_PINBOX','RENTAL_DAILY','RENTAL_ROYALTY','RENTAL_CURRENCY','ROYALTY_CURRENCY','ROYALTY_TYPE'];
  els.map(function(e){    
    var el = $('input[textboxname='+e+']');
    if(el.hasClass('numberbox-f')) var type = 'numberbox'; else var type = 'textbox'; 
    el[type]('setValue',rec[e]);
    jqp[e] = rec[e];   
  });
  
  $('#joblist').datagrid('load',jqp);



}

// define columns & set titles.
$.page.fn.linkcols = function(){
  // datagrid columns
  $.page.fn.columns = [
      {field:'RENTAL_ID',hidden:true},
      {field:'LINE_NO',title:'#', width:30,fixed:true,align:'center'},
      {
        field:'LICENSOR_JOB',
        title:'Licensor Job', 
        width:120, 
        fixed:true, 
        editor:'text', 
        styler:function(val,row,idx){if(val=='TBA') return {class:'fg-red bold',style:''}}
      },
      
    
      {field:'OPERATION_REF',title:'Operation Ref', width:120, fixed:true, formatter:eui.ref2text},
      {field:'RESOURCE_ID',title:'Resource ID',width:100},
      {field:'CUSTOMER_ID', title:'Cust ID', width:80, fixed:true},
      {field:'SALES_ORDER_REF', title:'Order ID / Line', width:120, formatter:eui.ref2text, fixed:true},
      {field:'COC_QTY',title:'COC Qty',width:60, fixed:true,formatter:$.page.fn.qtyfmt, align:'right'},
      
      {field:'WO_QTY',title:'Reqd Qty',width:60, fixed:true,formatter:$.page.fn.qtyfmt, align:'right'},
      
      {
        field:'WO_COMPLETED_QTY',
        title:'Comp Qty',
        width:60,
        formatter:$.page.fn.qtyfmt, 
        align:'right',
        styler:function(val,row,idx){if(row.FIXED_QTY > 0) return {class:'fg-ckl',style:'text-decoration: line-through;'}}
      
      },
      
      {
        field:'FIXED_QTY',
        title:'Fixed Qty',
        width:60,
        formatter:function(val,row,idx){
          if(val>0) return $.page.fn.qtyfmt(val);
          else return '-';
        }, 
        align:'right',
        editor:{type:'numberspinner',options:{precision:0,min:0}},
        styler:function(val,row,idx){
          if(val>0) return {class:'fg-red bold',style:''}
        }
      
      },
      
      {field:'ZERO_QTY',title:'Zero Qty',width:60, fixed:true,editor:{
        type:'combobox',
        options:{
          panelHeight:'auto',
          data:[
          {text:'YES',value:'YES'},
          {text:'NO',value:'NO',selected:true},
        ]
        }
      },formatter:function(val){
        if(!val) return 'NO';
        return val;  
      }},
      {field:'CALC_QTY',width:60,title:'Calc Qty'},
      {field:'OPERATION_COST',title:'$ Cost',width:60, fixed:true,formatter:eui.currency, align:'right'},
      {field:'WO_RELEASE',title:'Released', width:80,formatter:eui.date, fixed:true},
      {field:'WO_WANT',title:'Wanted', width:80,formatter:eui.date, fixed:true},
      {field:'LICENSOR_USER_5',title:'User 5', width:100,editor:'text',hidden:false,coloff:true},
      {field:'LICENSOR_USER_1',title:'User 1', width:100,editor:'text',hidden:false,coloff:true},
      {field:'LICENSOR_USER_2',title:'User 2', width:100,editor:'text',hidden:false,coloff:true},
      {field:'LICENSOR_USER_3',title:'User 3', width:100,editor:'text',hidden:false,coloff:true},
      {field:'LICENSOR_USER_4',title:'User 4', width:100,editor:'text',hidden:false,coloff:true},
  ];

  $.page.fn.udflabels = {}
  if($.dui.bhave.LBL_UDF) jsonParse($.dui.bhave.LBL_UDF).map(function(e){$.page.fn.udflabels[e.value] = e.text;});
  $.page.fn.columns.map(function(e){
    e.title = $.page.fn.udflabels[e.field] || e.title;
  });
}

// load the lines.
$.page.fn.lines = function(opt){  
  opt = opt || {};
  var rid = $('#RENTAL_ID').combobox('getValue');  
  var qp = $.extend({
    _func: 'get',
    _sqlid: 'dqm^rent_lines',
    _dgrid: 'y',
    RENTAL_ID: rid
  },opt);

  $('#jobusage').datagrid('load',qp);
}

// calculate Rental Days & Costs.
$.page.fn.rentdays = function(){
	//console.log('start calc rentdays');
  // get & calculate number of days.
  var lsd = $('input[name=LICENSOR_START_DATE]').val();
  var led = $('input[name=LICENSOR_END_DATE]').val(); 
  $.page.fn.sdate = null, $.page.fn.edate = null;   
  
  if(['SHIP_DATE','RECEIPT_DATE'].indexOf(lsd)==-1) return msgbox('Invalid Licensor Start-Date Formula');
  else if(['RETURN_DATE','RETURN_ARRIVAL_DATE'].indexOf(led)==-1) return msgbox('Invalid Licensor End-Date Formula');
  


  if(lsd && led){
    
    var sdel = $('input[textboxname='+lsd+']');
    if(sdel.length==0) return msgbox('Bad Start Date Mode');
    sdel.datebox('textbox').removeClass('bg-grn');
    
    var edel = $('input[textboxname='+led+']');
    if(sdel.length==0) return msgbox('Bad End Date Mode');
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
            //console.log(tdays);
            if(tdays==0) tdays = data.MIN_DAYS;
        }
        else tdays = daysBetween(sdate,edate)+1;

        $('input[textboxname=RENTAL_DAYS]').numberbox('setValue',tdays);
      //cl('total days:'+tdays);
      
        var daily = $('input[textboxname=RENTAL_DAILY]').numberbox('getValue');
        $('input[textboxname=RENTAL_COST]').numberbox('setValue',daily*tdays);


      })

      /*
      if (['VAM-FE','TENARIS','VAM-FRANCE','VAM-USA','VAM-GERMANY','VAM-ABERDEEN','AB'].indexOf(lic)==-1) var tdays = daysBetween(sdate,edate)+1;
      else {
      	var tdays = daysBetween(sdate,edate);
      	if(tdays==0) tdays = 1;
      }
      

      //if(tdays==0) tdays = 1;
      $('input[textboxname=RENTAL_DAYS]').numberbox('setValue',tdays);
      //cl('total days:'+tdays);
      
      var daily = $('input[textboxname=RENTAL_DAILY]').numberbox('getValue');
      $('input[textboxname=RENTAL_COST]').numberbox('setValue',daily*tdays);
      */
    } 
    
  }
}

// enable-disable based on status.
$.page.fn.status = function(){
  
  var cbo = $('#STATUS');
  var jopt = $('#joblist').datagrid('options');
  var stat = cbo.combobox('getValue');
  var link = $('#jobusage');
  var frm = $('form#main');
  $('#GAUGE_ID').combobox('readonly',true);
  $('#recalc').linkbutton('enable'); 
  $('#lic_close').linkbutton('enable'); 
  
  // Only CLOSED Status.
  setTimeout(function(){
    if(stat=='CLOSED'){
     // cl('yes invoice');
      jopt.disabled = true;
      frm.addClass('form-lock');
      link.datagrid('readonly',true);
      $('#recalc').linkbutton('disable');
      if($.dui.udata.groups.indexOf("GR-LIC-CLOSE")!==-1)$('#lic_close').linkbutton('enable');
      else $('#lic_close').linkbutton('disable'); 
    } else {
      frm.removeClass('form-lock');
      jopt.disabled = false;
      link.datagrid('readonly',false);  
      $('#lic_close').linkbutton('disable');    
    }
  })
}

// freight costs
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

  // Outbound Freight Consolidation.
  var op = $('#INCLUDE_OUTBOUND_FREIGHT').combobox('getValue') || 'N';
  var ic = $('#INCOMING_CURRENCY'), oc=$('#OUTGOING_CURRENCY');
  if(op=='Y') oc.combobox('readonly',true).combobox('select',ic.combobox('getValue'));
  else oc.combobox('readonly',false) 
  
  io = io || ['out','in'];
  io.map(function(e){
    $.each($(sums[e].els),function(){
      var val = parseFloat($(this).numberbox('getValue')); 
      sums[e].sum += val;
    });
    sums[e].tot.numberbox('setValue',sums[e].sum);      
  })

  // Update PO Values
  var val = sums.in.sum;
  if(op=='Y') val += sums.out.sum;
  $('#PO_TRANSPORT_AMT').numberbox('setValue',val);
  $('#PO_FREIGHT_CURRENCY').textbox('setValue',oc.combobox('getValue'));   
  
}

// save a line.
$.page.fn.saverow = function(row,mode,cb){
  
  // Fixes & Deletes
  if(isNaN(row.OPERATION_COST)) row.OPERATION_COST = 0;
  delete (row.ROYALTY_QTY);
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
}

$.page.fn.getqty = function(val){
  if(!val || isNaN(val)) return 0;
  else return parseInt(val);
}

// after load, or xrate change.
$.page.fn.xrates = function(){
  var syscur = $('#SYS_CURRENCY').val();
  
  // Rental System Currency RENTAL_SYSCUR
  var rentcur = $('#RENTAL_CURRENCY').textbox('getValue');
  var rentxri = $('#RENTAL_XRATE');
  var rentxr = parseFloat(rentxri.numberbox('getValue'));
  if(syscur == rentcur) {
    rentxri.numberbox('readonly',true).numberbox('setValue',1);
    rentxr = 1;
  } else rentxri.numberbox('readonly',false);
  
  var rentcost = parseFloat($('#RENTAL_COST').numberbox('getValue'));
  $('#RENTAL_SYSCUR').numberbox('setValue',rentcost/rentxr); 
  
  // Royalty System Currency ENDS_RATE_SYSCUR
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
}

$.page.fn.qtyfmt = function(val){if(val) return parseInt(val);return 0;}



$.page.ready(function(){


  toolbut([
    {
      id:'recalc',
      iconCls: 'icon-reload',
      text: 'Reload',
      disabled: true,
      noText: false,
      onClick: function(){
        confirm(function(yn){
          if(yn) $('#GAUGE_ID').combobox('reselect');
        },'Reload Gauge Params ?')
        
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
              msgbox('Licensor Close reset. Please save the changes.')
            }  
            else msgbox('You are NOT allowed to reset the licensor close.')
          }
        },'Reset Licensor Close ?')
        
      }
    }

  ]);

  // Jobmove combo - gets data from main combo
  $('#jobmove #_RENTAL_ID').combobox({
    groupField:'STATUS',
    loadFilter: function(data){
      var cur = $('#RENTAL_ID').combobox('getValue');
      var del=-1; data.map(function(e,i){if(cur==e.value) del=i;});
      if(del>-1) data.splice(del,1);
      return data;
    }
  })
  
  // Jobmove popup box.
  $('#jobmove').dialog({
    onOpen: function(){
      var rid = $('#RENTAL_ID'); 
      var data = rid.combobox('getData');
      $('#jobmove #_RENTAL_ID').combobox('loadData',data);  
    },
    
    buttons:[
      {
        iconCls:'icon-save',
        text:'Save',
        handler:function(){
          var dg = $('#jobusage');
          var row = dg.datagrid('getSelected'); 
          var newid = $('#jobmove #_RENTAL_ID').combobox('getValue');
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
          })
        }
      },{
        iconCls:'icon-cancel',
        text:'Close',
        handler:function(){$('#jobmove').dialog('close')}
    }]    
  })

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
  })

  $.page.fn.loading = function(){return $('form#main').form('options').loading}
  
  $.page.fn.dostat = function(){
    var inv = $('#LICENSOR_CLOSE').textbox('getValue');
    var stat = 'OPEN';
    if(inv != '') stat = 'CLOSED';
    else if($.page.fn.edate) stat = 'RETURNED';  
    else if($.page.fn.sdate) stat = 'RECEIVED'; 
    $('#STATUS').combobox('select',stat); 
  }

  $('#INCOMING_CURRENCY, #INCLUDE_OUTBOUND_FREIGHT').combobox({
    onChange: function(nv,ov){
      $.page.fn.freight();
    }
  })
  
  $('#LICENSOR_CLOSE').textbox({
    onChange:function(nv,ov){
      if(!$.page.fn.loading()) $.page.fn.dostat();  
    }
  })

  $('#STATUS').combobox({
    panelHeight: 'auto',
    data:[
      {value:'OPEN',text:'OPEN'},
      {value:'RECEIVED',text:'RECEIVED'},
      {value:'RETURNED',text:'RETURNED'},
      {value:'CLOSED',text:'CLOSED'}
    ],
    
    onSelect: function(nv,ov){
     // cl('status = '+nv);
      $.page.fn.status();  
    }    
  });



  $('#RENTAL_XRATE, #ROYALTY_XRATE').numberbox({
    onChange: function(){
      if($('form#main').form('options').loading) return;
      $.page.fn.xrates();
    }
  })


  	//added by CLS, required by Doug to zero rental rate and rental cost
	//2016-10-17 07:28PM
    $('a#ZERORENTAL').linkbutton({
      onClick:function(){
		confirm(function(yn){
          if(yn){
			$('input[textboxname=RENTAL_DAILY]').numberbox('setValue',0);
			$('input[textboxname=RENTAL_COST]').numberbox('setValue',0);
			 $.page.fn.xrates();
			  msgbox('Rental rate/cost has changed, please save the changes.')
		  } 
        },'Reset Rental Rate and Rental cost to 0.00 ?');
      }
    })
	
  // unlinked jobs.
  $('#joblist').datagrid({

    fit: true,
    disabled: false,
    rownumbers: true,
    editor: 'inline',
    striped: true,
    singleSelect: true,
    url: '/',
    queryParams: {
      _sqlid:'dqm^rent_jobs',
      _func:'get',
      _dgrid: 'y'
    },
   
    columns: [$.page.fn.jobcols],

    onBeforeLoad: function(){
      if($(this).datagrid('options').disabled) return false;
    },
    
    onCheck: function(idx,row){
      var me = $(this);
      var opt = me.datagrid('options');
      if(opt.disabled) return false;
      opt.disabled = true;
      row.RENTAL_ID = $('#RENTAL_ID').combobox('getValue');
      if(!row.RENTAL_ID) {
        me.datagrid('unselectAll');
        return msgbox('Please save agreement first.');
      }
      row.LICENSOR_JOB = 'TBA'; 
      var dels = ['WO_CLASS','COMPLETED_QTY','SHIPPED_QTY'];
      dels.map(function(e){delete(row[e])});
      
      $.page.fn.saverow(row,'add',function(res){
        if(res.error) {
          opt.disabled = false;
          return;
        }
        //$('#jobusage').datagrid('appendRow',clone(row));
        $('#jobusage').datagrid('reload');
        setTimeout(function(){
          me.datagrid('deleteRow',idx);
          opt.disabled = false;
        },250);
      })
    }
  })

  // Main Datagrid
  $.page.fn.linkcols();
  $('#jobusage').datagrid().datagrid('rowEditor',{
    
    tbarPrepend: $('<a id="job_move" class="easyui-linkbutton" iconCls="icon-move" disabled="true">Move</a><span class="vert-sep" />'),
    
    fit: true,
    editor: 'inline',
    striped: true,
    url: '/',
    queryParams: {
      _sqlid:'dqm^rent_lines',
      _func:'get',
      _dgrid: 'y'
    },          
    columns: [$.page.fn.columns],
    onBeforeLoad: function(){
      if($(this).datagrid('options').disabled) return false;
    },
    onLoadSuccess: function(data){
      $.page.fn.nojob=0;

      $('#job_move').linkbutton({
        onClick: function(){
          $('#jobmove').dialog('open');
        }
      })

      // Update After Loading.
      var ROYALTY_QTY = 0; if(data.total > 0) var ROYALTY_QTY = data.rows[0].ROYALTY_QTY;
      $('#ROYALTY_QTY').numberbox('setValue',ROYALTY_QTY);      
      var ROYALTY_COST = 0; if(data.total > 0) var ROYALTY_COST = data.rows[0].ROYALTY_COST;
      $('#ROYALTY_COST').numberbox('setValue',ROYALTY_COST);
      var ENDS_RATE_SYSCUR = $('#ENDS_RATE_SYSCUR').numberbox('getValue');
      $('#ROYALTY_SYSCUR').numberbox('setValue',ROYALTY_QTY*ENDS_RATE_SYSCUR);  

      data.rows.map(function(e){
        if(e.LICENSOR_JOB=='TBA') $.page.fn.nojob++;
      });
      
      if($.dui.bhave.TBA_WARNING!='n' && $.page.fn.nojob>0) msgbox($.page.fn.nojob+' jobs require Licensor JOB ID.');
      
    },

    onSelect: function(){
      $('#job_move').linkbutton('enable');   
    },

    onEndEdit: function(idx,row,chg){ 
      var me = $(this);
      $.page.fn.saverow(row,'upd',function(res){
        // do nothing.
      }) 
    },
  
  })
  .datagrid('editButs',{add:'hide',edit:'hide'})
  .datagrid('columns',$('#dgre_tb'));
  
  // Rental Filters
  $('#RENTAL_ID').combobox('filtertip',{
    default: ['OPEN'],
    field: 'STATUS',
    data: [
      {name:'OPEN',text:'Open'},
      {name:'RECEIVED',text:'Received'},
      {name:'RETURNED',text:'Returned'},
      /*{name:'CLOSED',text:'Closed'},*/
      {name:'CLOSED',text:'Closed'},
    ]
  });

  // Gauge Select
  // ## TODO - Change this to get all data rather than load into combo.
  $('#GAUGE_ID').combobox({
    url: '/?_func=get&_sqlid=dqm^rent_gauges&_combo=y',
    groupField: 'GAUGE_TYPE',
    
    onSelect:function(rec){
      $.page.fn.unlinked(rec);

     /* var types=["RENTAL","ROYALTY"]
      types.map( t => {
        var obj={_sqlid:'admin^currall',_func:'get',id:$('#'+t+'_CURRENCY').textbox('getValue')}
        ajaxget('/',obj,function(curr){
          $('#'+t+'_XRATE').numberbox('setValue',curr.rate) 
        })        
      })
      */


      // Date Field Names.
      $('input[name=LICENSOR_START_DATE]').val(rec.LICENSOR_START_DATE);
      $('input[name=LICENSOR_END_DATE]').val(rec.LICENSOR_END_DATE);
      
    }
  })

  // After Add Button is pressed.
  $('#but_add').on('done',function(jq){
		$('#STATUS').combobox('select','OPEN');
		$.page.fn.status();
		$('#GAUGE_ID').combobox('readonly',false);
		$('#joblist').datagrid('loadData',[]);
		$('#jobusage').datagrid('loadData',[]);
	})
  
  // Main Form Events
  $('form#main').on('loadDone',function(jq,data){
      
      $('#dates input').removeClass('bg-grn');
      
      var prid = $('#PR_NO');
      if($.dui.bhave.PRID_CLONE !='n') prid.textbox('readonly',true).textbox('setValue',data.RENTAL_ID); 
      else prid.textbox('readonly',true);
      
      // Load the lines & unlinked.
      var qp = {}; 
      if(data.STATUS != 'CLOSED') {
        qp.recalc='y';
        $.page.fn.unlinked(data);
      }
      $.page.fn.lines(qp);
      
      // Wait for all the fields to populate.
      setTimeout(function(){
        $.page.fn.rentdays();
        $.page.fn.xrates();
        $.page.fn.freight();
        $.page.fn.status(); 

      })
      
      //else lic_close.textbox('enable',false);

    })

  $('tr.datagrid-header-row > td[field=FIXED_QTY]').tooltip({
    content:'Fixed Qty overrides qty complete.'  
  });
  
  $('tr.datagrid-header-row > td[field=ZERO_QTY]').tooltip({
    content:'Usage qty will be zero.'   
  });
  

  $('#jobusage').datagrid('resize'); 
  bcscan(function(bc){
  
    //console.log(bc);
    switch (bc.pre){
      case "0":
        var emp = $('#GAUGE_ID');
        var exists = emp.combobox('exists',bc.data);
        emp.combobox('select',bc.data);
        break;
    }   

  },4);

})


/*
.on('changed',function(jq,tgt){
  //var opts = $(this).form('options');
  var el = $(tgt); 

  // receipt & return are updated automatically via trigger.
  var name = el.attr('textboxname');
  
  switch(name){
    case "RECEIPT_DATE":
      var val = el.datebox('getValue');
      var stat = 'RECEIVED'; if(val=='') stat = 'OPEN';
      $('#STATUS').combobox('select',stat);
      break;     
    
    case "RETURN_DATE":
      var val = el.datebox('getValue');
      var stat = 'RETURNED'; if(val=='') stat = 'RECEIVED';
      $('#STATUS').combobox('select',stat);
      break;   

    case "LICENSOR_CLOSE":
      if($.dui.bhave.TBA_INVOICING == 'n' && $.page.fn.nojob > 0) return setTimeout(function(){
        el.textbox('clear');
        msgbox('Cannot invoice with "TBA" jobs.');
      })
        
      var val = el.textbox('getValue');
      var stat = 'INVOICED'; if(val=='') stat = 'RETURNED';
      $('#STATUS').combobox('select',stat);
      break;
  }

})
*/

/*
// Update Operation Costs.
$.page.fn.opcosts = function(cpq){
  
  return;
  
  var dg = $('#jobusage');
  var rows = dg.datagrid('getRows');
  var ups={}, msg; rows.map(function(e,i){
    opcost = e.CALC_QTY * cpq;
    cl(opcost);
    if(opcost != e.OPERATION_COST) {
      dg.datagrid('updateRow',{index:i,row:{OPERATION_COST:opcost}});
      msg = 'Operation costs updated. Please Save.';
      ups[e.LINE_NO] = {
        OPERATION_COST: opcost,
        CALC_QTY: e.CALC_QTY  
      }
    }
    
  });  
  
  if(msg) {
    alert(msg);
    ajaxget('/',{
      _func:'upd',
      _sqlid:'dqm^rent_line_costs',
      RENTAL_ID: rows[0].RENTAL_ID,
      rows: jsonString(ups),
    },function(res){
      msgbox(res);
    });
  }
}
*/


/*
// Calculate total end qtys.
$.page.fn.endqty = function(){
  
  var data = {
    qty: 0,
    coc: 0,
    wqty: $('input[textboxname=WO_QTY_TOTAL]'),
    cqty: $('input[textboxname=WO_COC_TOTAL]'),
    rqty: $('input[textboxname=ROYALTY_QTY]'),
    change: false,
    type: $('#ROYALTY_TYPE').textbox('getValue')
  }

  if(data.type != 'ENDS-RATE') data.qty = 1;
  else $('#jobusage').datagrid('getRows').map(function(e){
    var fixed = $.page.fn.getqty(e.FIXED_QTY);
    if(e.ZERO_QTY=='YES') e.CALC_QTY = 0; 
    else if(fixed > 0) e.CALC_QTY = fixed; 
    else e.CALC_QTY = $.page.fn.getqty(e.WO_COMPLETED_QTY);
    data.qty += e.CALC_QTY;
    data.coc += $.page.fn.getqty(e.COC_QTY); 
  });  

  if(data.wqty.numberbox('getValue') != data.qty) {
    data.rqty.numberbox('setValue',data.qty);
    data.wqty.numberbox('setValue',data.qty);
    data.change = true; 
  } 
  
  if(data.cqty.numberbox('getValue') != data.qty) {
    data.cqty.numberbox('setValue',data.coc); 
  } 
  
  return data;
}
*/

/*
$.page.fn.totals = function(){
   
  return;
  
  // calculate rental days.
  $.page.fn.rentdays();
  
  // loop rows & calculate end qtys.
  var data = $.page.fn.endqty();
  
  // Calculate System Costs

  // Royalty Costs
  data.roycost = data.royrate * data.qty; 
  if(data.roycost==0) data.roysys = 0;
  else data.roysys = data.roycost / data.royx; 
  $('#ROYALTY_COST').numberbox('setValue',data.roycost); 
  $('#ROYALTY_SYSCUR').numberbox('setValue',data.roysys);
  
  // Rental Costs
  data.tcost = data.rentsys + data.roysys;
  $('#COST_TOTAL').numberbox('setValue',data.tcost);
  
  // CPQ
  if(data.qty==0) data.cpq = 0;
  else data.cpq = (data.tcost/data.qty).toFixed(2); 
  $('#COST_PER_PIECE').numberbox('setValue',data.cpq);

  cl(data);

  $.page.fn.opcosts(data.cpq);
  
  // prevent double-trigger
  //setTimeout(function(){$.page.fn.totals_run = false},100);
}
*/