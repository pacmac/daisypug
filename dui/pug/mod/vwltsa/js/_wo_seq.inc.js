var cl = console.log;
$.dui.page.seq = {};

/* ##### START FUNCTIONS ##### */
/* test 1 */
// check for basf form (true if not found)
$.dui.page.seq.nobase = function(){
  if($('form#basf').length > 0) return false;
  return true;    
}

//get the Job Header status
$.dui.page.seq.basestatus = function (){
	if($.dui.page.seq.nobase()) return;
	var basdat = frm2dic($('form#basf'));
	return basdat.STATUS;
}
// Prevent recursion on combo.select()
$.dui.page.seq.change = function(){
  var sdat = frm2dic($('form#seqf'));
  if($.dui.page.lock || sdat.WORKORDER_BASE_ID=='') return false;
  $.dui.page.lock=true;
  $.dui.page.seq.ocqper();
  $.dui.page.seq.calcrunhrs();
  setTimeout(function(){$.dui.page.lock=false},100);
}

// ##PAC 151219 - on-change qty per
$.dui.page.seq.ocqper = function(){
  var basdat = frm2dic($('form#basf'));
  var subdat = frm2dic($('form#subf'));
  var seqdat = frm2dic($('form#seqf'));
  if(seqdat.QTY_TYPE == 'FIXED') var endq = seqdat.QTY_PER; 
  else {
	  if (seqdat.WORKORDER_SUB_ID=='0')	var endq = (seqdat.QTY_PER * basdat.DESIRED_QTY);  
	  else var endq = (seqdat.QTY_PER * subdat.QTY_PER * basdat.DESIRED_QTY);
  }		 
  $('#CALC_END_QTY').numberbox('setValue',endq);
}

// ##PAC 151219B
$.dui.page.seq.calcrunhrs = function(){
  var basdat = frm2dic($('form#basf'));
  var subdat = frm2dic($('form#subf'));
  var seqdat = frm2dic($('form#seqf'));
  var maxrun = $.dui.bhave.maxrun_hrs || 100;
  
  var run_hrs = 0;
  var run=seqdat.RUN, run_factor=0, run_type=seqdat.RUN_TYPE, run_hrs=0;
  if(run==0) run_factor = run;
  else run_factor = {"HRS/PC": run,"PCS/HR": 1/run,"MIN/PC": run/60,"PCS/MIN": 1/(run*60)}[run_type] || 0;
  if(run_type=='HRS/JOB') run_hrs = run;
  else if(seqdat.QTY_TYPE=='FIXED') run_hrs = seqdat.QTY_PER * run_factor; 
  else {
    if (seqdat.WORKORDER_SUB_ID=='0') run_hrs = (basdat.DESIRED_QTY * seqdat.QTY_PER ) * run_factor;
    else run_hrs = (basdat.DESIRED_QTY * seqdat.QTY_PER * subdat.QTY_PER) * run_factor;
  }
  //console.log('$.dui.page.seq.calcrunhrs,run_hrs:',run_hrs);
  $('#RUN_HRS').numberbox('setValue', run_hrs);
  if(run_hrs > maxrun) msgbox('Run time '+parseFloat(run_hrs).toFixed(2)+' exceeds '+maxrun+' hrs.');

  //cl('fac:'+run_factor+' hrs:'+run_hrs);
}

// on resource select
$.dui.page.seq.osresid = function(rec){
  $('input#COST_PER_HR').numberbox('setValue',rec.COST_PER_HR);
  $('input#RESOURCE_CLASS_ID').textbox('setValue',rec.RESOURCE_CLASS_ID);
  
  switch($.dui.bhave.resource_select_update_spec){
    case "P":
        confirm(function(yn){
          if(!yn) return false;
          $('input#SPEC').textbox('setValue',rec.SPEC);
        },'Update Resource Specifications ?') 
      break;
    case "N":
      break;
    default:
      $('input#SPEC').textbox('setValue',rec.SPEC);

  }

  
  // set default run-type
  var mode = $("form#seqf").attr('mode'); 
  if( mode == 'add'){
    var run_type = $.dui.bhave.run_type || 'MIN/PC';
    $('form#seqf input#RUN_TYPE').combobox('select',run_type);
  }
}

// Cost Estimates
$.dui.page.seq.costcalc = function(){
  var ctot = $('input#COST_TOTAL');
  if(ctot.length==0) return;
  var cs = parseFloat($('input#COST_SUBCON').numberbox('getValue')) || 0;
  var cm = parseFloat($('input#COST_MATL').numberbox('getValue')) || 0;
  var ct = parseFloat($('input#COST_TOOLING').numberbox('getValue')) || 0;
  var co = parseFloat($('input#COST_OTHERS').numberbox('getValue')) || 0;
  ctot.numberbox('setValue',cs+cm+ct+co);
}



/* ##### END SEQ FUNCTIONS ##### */

//CLS, 220804, instead of form-lock, exclude STATUS field to lock 
$.dui.page.seq.lockpage = function(){
  var cq = $('#SEQ_COMPLETED_QTY').numberbox('getValue');
  var qty = $('#CALC_END_QTY').numberbox('getValue');
  var status = $('#STATUS').combobox('getValue');
  //console.log(`status=${status}`);
  //console.log(`cq=${cq}`);
  //console.log(`qty=${qty}`);
  //console.log(parseFloat(cq)>=parseFloat(qty));
  //console.log($.dui.bhave.allowOpnUpdateIfOpnCompletedQtyMoreThanZero);
  if (status=='C'){
    if (cq>=qty) $('form#seqf').addClass('form-lock');
    else {
      $(':input:not(:hidden)', $('form#seqf')).each(function() {
        if (this.readonly) {}
        else {
          var disabled=false;
          if (this.name=='STATUS') disabled=false;
          else disabled=true;
          $(this).prop('disabled',disabled);        
        }
     });

    }
  }
  else {
    if ($.dui.bhave.allowOpnUpdateIfOpnCompletedQtyMoreThanZero=='N'){
      if(parseFloat(cq) > 0) {
        $(':input:not(:hidden)', $('form#seqf')).each(function() {
          if (this.readonly) {}
          else $(this).prop('disabled',true);        
       });
      }
      else {
        $(':input:not(:hidden)', $('form#seqf')).each(function() {
          if (this.readonly) {}
          else $(this).prop('disabled',false);        
       });
      }
    }
    else {
      $(':input:not(:hidden)', $('form#seqf')).each(function() {
        if (this.readonly) {}
        else { 
          $(this).prop('disabled',false);        
        }
     });
    }
  }

}

// PAC 160919 - get selected operation woref.
$.dui.page.seq.getworef = function(){
  var sel = $.dui.page.wotree.tree('getSelected');
  if(sel) return sel.id;
  else return null;
}


// CLS 170517, operation part's trace info
$.dui.page.traceinfo = function(){
  var ncrs=[], me=$(this), idx=me.data('idx');
  var row = $('#MATERIAL_DG').datagrid('getRows')[idx];
  if(row._TRACE_IDS.length==0) return;
  me.tooltip('update',eui.table([
      {field:'TRACE_ID', title:'Trace ID',formatter:eui.ref2text},
      {field:'TRANSACTION_DATE', title:'Tx Date',formatter:eui.date},
      {field:'TX_TYPE', title:'Tx Type',formatter:eui.ref2text},
      {field:'QTY', title:' Qty',style:'text-align:right;',formatter:eui.integer},
      {field:'UNIT_MATERIAL_COST', title:' Unit Mat Cost',style:'text-align:right;',formatter:eui.integer}
    ],row._TRACE_IDS)
  ).tooltip('reposition');
}

//CLS 190304, Resource list 
$.dui.page.resoureceids = function(cb){
  // return cb($.dui.pdata.wocid);
  ajaxget('/',{_sqlid:'vwltsa^resourceid',_func:'get',ACTIVE:'Y'},function(data){
    $.dui.pdata.resid=data;
    cb(data) ;
  })
}

//CLS 190430, behave setting, allow consumable Part add into operation part
$.dui.page.parts = function(){
  var allowConsumableParts=$.dui.bhave.allowConsumableParts||'N';

    ajaxget('/',{_sqlid:'inv^partids',_func:'get','ALLOW_CONSUMABLE_PARTS':allowConsumableParts},function(data){
      $.dui.pdata.partid=data;
      $(`#_dgform > form input[textboxname=PART_ID]`).combobox('loadData',data);

    })    
  
}

/* 
  ## PAC151219 - EUI ELEMENT INITIALZE FUNC
  Can be called AFTER element added i.e. $.dui.page.seq.init('CLASS_ID');  
*/
$.dui.page.seq.init = function(elid){

  var els = {

    // Status bar in text box.
    DIVISORS: $('form#seqf input[data-divisor]').numberbox({onChange:nboxbar}),
    
    // load operation class
    CLASS_ID: $('form#seqf #CLASS_ID').combobox({
      editable:false,
      data:$.dui.pdata.seqclsid,
      onShowPanel: function(){
        if($.dui.page.seq.nobase()) return $(this).combobox('hidePanel');
      },
      onSelect: function(rec){
        
        var seqf = $('form#seqf');
        var mode = seqf.attr('mode'); 
    	  ajaxget('/',{'_sqlid':'vwltsa^seq','_func':'get','WOREF':rec.value+'^0^0'},function(data){
          delete data.CLASS_ID;
          delete data.WOREF;
          delete data.WORKORDER_BASE_ID;
          delete data.WORKORDER_SUB_ID;
          delete data.SEQUENCE_NO;
          seqf.form('load',data);
          seqf.attr('mode',mode);
        });
      }
    }),

    // PAC 150926
    UDF_LAYOUT_ID: $('form#seqf input#SEQ_UDF_LAYOUT_ID').combobox({
      data:$.dui.pdata.udfid,
      validType:['inList'],
      onSelect:setudfs
    }),
    
    RUN_TYPE: $('#RUN_TYPE').combobox({
      editable:false,
      panelHeight:'auto',
      required:true,
      onChange:$.dui.page.seq.change, 
      data:[
        {value:'MIN/PC',text:'Minutes Per Piece'},
        {value:'HRS/PC',text:'Hours Per Piece'},
        {value:'PCS/MIN',text:'Pieces Per Minute'},
        {value:'PCS/HR',text:'Pieces Per Hour'},
        {value:'HRS/JOB',text:'Fixed Hours'}
      ]
    }),
    
    QTY_TYPE: $('#QTY_TYPE').combobox({
      editable:false,
      panelHeight:'auto',
      required:true,
      value:$.dui.bhave.qty_type,
      data:[{value:'QTYPER',text:'QTY PER',selected:true},{value:'FIXED',text:'FIXED QTY'}],
      onSelect: $.dui.page.seq.change
    }),
    
    RESOURCE_ID: $.dui.page.resoureceids(function(data){
       // console.log(data);
       // console.log($.dui.pdata.resid);
        $('#RESOURCE_ID').combobox({
          required:true,
          editable:false,
          groupFieldX: 'RESOURCE_CLASS_ID',
          data:$.dui.pdata.resid,
      
          onSelect:function(rec){ $.dui.page.seq.osresid(rec);}
        })        
      }),

    MATERIAL_DG: $('#MATERIAL_DG').datagrid('rowEditor',{
      
      editor: 'form',
      fitColumns:true,
      singleSelect:true,
      striped:true,
      fit:true,      

      addData: {
        //SEQ_NO: '$autonum:1',
        BAL_QTY:0
      },

      columns:[[

        {field:'WOREF',hidden:true},
        {field:'ROWID',hidden:true},
        {field:'PART_ID',title:'Part ID',id:'PART_ID',width:130,fixed:true,editor:{
          type:'combobox',
          options: {
            XXdata: $.dui.pdata.partid,
            required: true,
            panelWidth:200,
            init: false,
            editable:true,
            groupField: 'PART_CLASS_ID',
            _validType: ['inList'],
            onBeforeLoad: function(){
              /*
              var opt = $(this).combobox('options');
              if(opt.init) return false;
              opt.init = true;
              */
              cl('called once for dgrid and again for rowEditor ?');   
            },
            
            loadFilter: function(data){
              cl('filtering.. <<< WHY IS THIS BEING CALLED TWICE ?????');
              data = obj2arr(data);
              var rows = []; data.map(function(e){if(e.PART_CLASS_ID=='COMP'||e.PART_CLASS_ID=='FG'||e.PART_CLASS_ID=='CONSUMABLE') rows.push(e)});
              // $(this).datagrid('options').init = true;
              return rows;
            },
            
            onSelect: function(rec){
              var cbo = $(this);
              var dg = $('#MATERIAL_DG');
              var rows = dg.datagrid('getRows');
              if(objidx(rows,'PART_ID',rec.value) !=-1) {
                msgbox(rec.value+' already exists.');
                return cbo.combobox('clear');
              }
              var opt = dg.datagrid('options');
              if(opt) {
                var form = $(opt.tbar.form);
                form.find('input[textboxname="DESCRIPTION"]').textbox('setValue',rec.DESCRIPTION);
                form.find('input[textboxname="UOM_ID"]').textbox('setValue',rec.UOM_ID);
                form.find('input[textboxname="PRODUCT_CODE"]').textbox('setValue',rec.PRODUCT_CODE);
              }
            }
          }
        }},
        
        {
          field:'DESCRIPTION',
          title:'Description',
          width:200,
          fixed:true,
          editor:{
            type:'textbox',
            options: {
              readonly: true  
            }
          } 
        },

        {
          field:'UOM_ID',
          title:'UOM',
          width:200,
          fixed:true,
          editor:{
            type:'textbox',
            options: {
              readonly: true  
            }
          } 
        },

                {
          field:'PRODUCT_CODE',
          title:'Product Code',
          width:200,
          fixed:true,
          editor:{
            type:'textbox',
            options: {
              readonly: true  
            }
          } 
        },
        {field:'REQUIRED_QTY',title:'Required',align:'right',width:70,fixed:true,XXformatter: eui.number, editor:{
          type: 'numberspinner',
          options: {
            required: true,
            min:0,
            value: 0,
            precision: 4
          }
        }},
        {field:'ISSUED_QTY',title:'Issued', align:'right',width:70,fixed:true,XXformatter: eui.number},
        
        {
          field:'WANT_DATE',
          title:'Want Date',
          width:80,
          fixed:true,
          formatter: function(val,row,idx){
            return $.dui.page.seq.SCHED_START_DATE;  
          }
        },
        {field:'_TRACE_IDS', title:'Details', align:'center', width:45, fixed:true, formatter:function(val,row,idx){
          if(val.length) return '<span class="icon icon-edit" data-idx="'+idx+'"></span>'; 
          else return '-';
        }},

      ]],
      
      onEndEdit: function(idx,row,chg){
        row._sqlid = 'vwltsa^seqpart';
        row.WOREF = $.dui.page.seq.getworef();
        var dels = ['BAL_QTY','TRACE_ID','DESCRIPTION','WANT_DATE'];
        dels.map(function(e){delete row[e]});
        ajaxget('/',row,function(res){
          if(res.error) msgbox(res.msg);
          else cl(res);  
        })  
      },
    onLoadSuccess: function(){
    $('tr td .icon-edit').tooltip({onShow: $.dui.page.traceinfo});
  },
      
    }),
    
    COSTS: $('input#COST_MATL, input#COST_SUBCON, input#COST_TOOLING, input#COST_OTHERS').numberbox({
      prefix:'$',
      precision:2,
      value:0,
      onChange:function(nv,ov){$.dui.page.seq.costcalc();}
    }),
    
    // status combo change
    STATUS: $('input#STATUS').combobox({
      value: $.dui.page.seq.basestatus(),
      readonly:true, 
      editable:false,
      panelHeight: 'auto',
      data:[
        {text:"Un-Released",value:"U"},
        {text:"Released",value:"R"},
        {text:"Closed",value:"C"},
        {text:"Cancelled",value:"X"}
      ],
      
      onShowPanel: function(){
        //if(!grpMember('JOB-STATUS')) $(this).combobox('hidePanel');     
      },
      
      onChange:function(nv,ov){
        if($.dui.page.seq.nobase()) return;
        var me = $(this);
        var node = $.dui.page.wotree.tree('getSelected');
        if(!node) return;
        var cls = 'seq';
        if(nv != 'R') cls += '-'+nv;
        $.dui.page.wotree.tree('update', {
    		  target: node.target,
          iconCls: cls
    	  });
        
        if(nv=='C') $('#CLOSE_DATE').textbox('setValue',isodate(new Date()));
        $.dui.page.seq.lockpage();
      }
    }),
    
    // Open an NCR
    NCROPEN: $('#ncr_open').linkbutton({
      onClick:function(){  
        var ncr = $('input#ncrid').textbox('getValue');
        if(ncr.length < 1) return false;
        loadpage('dqm^comp^ncr_man&NCR_ID='+ncr);
      }
    }),
    
    // When form is finished loading
    SEQF: $('form#seqf').on('loadDone',function(me,data){ 
      $(this).data('fdat',data);
      
      var mode = $(me.target).attr('mode');
      
      // 190304 - Free Mode hide UDFs
      var uld = $('form#seqf input#SEQ_UDF_LAYOUT_ID');
      if(uld.length>0) uld.combobox('reselect');
      
      $.dui.page.seq.SCHED_START_DATE = ms2date(data.SCHED_START_DATE,'d');
      
      $.dui.page.seq.costcalc();
      // disable form if qty complete > 0
      var cq = $('form#seqf input#SEQ_COMPLETED_QTY').numberbox('getValue');
      /*if ($.dui.bhave.lock_op=='Y'){
    	  if(cq > 0) $('form#seqf').addClass('form-lock');
        else $('form#seqf').removeClass('form-lock');
      }
      */
      // enable-disable NCR toolbutton.
      if(data.NCR_ID) var endis = 'enable'; else var endis = 'disable';
      $('#ncr_open').linkbutton(endis);
      
      // load the part-trans materials
      if(data.PART_TRANS) $('#MATERIAL_DG').datagrid('loadData',data.PART_TRANS)
      
      if($.dui.page.dobhave) $.dui.page.dobhave();
      $.dui.page._loaded = true;

      //CLS, 180213
      //disable form if opn status=C
      //console.log(data);
      
      //CLS, 20220804 11:08AM,
      // comment out the codes below.
      // when manually close the operation, will unable to change back to release
      /*start
      if (data.STATUS=='C')$('form#seqf').addClass('form-lock');
      else {
        if ($.dui.bhave.allowOpnUpdateIfOpnCompletedQtyMoreThanZero=='N'){
    	    if(cq > 0) $('form#seqf').addClass('form-lock');
          else $('form#seqf').removeClass('form-lock');
        }
        else $('form#seqf').removeClass('form-lock');
      }
      end */
      $.dui.page.seq.lockpage();
     
    })
    
  }
  
  // initialize one or all.
  if(elid) return els[elid.toUpperCase()];
  else for(var elid in els){els[elid]}
  if($.dui.page.seq.nobase()) $('#opn_class_id').hide();
}

/* ##### DOM IS READY ##### */
$.page.ready(function(){

  $.dui.page.seq.init();
  $.dui.page.parts();
    var dg = $('#MATERIAL_DG'); 
  dg.datagrid('columns',$('#dgre_tb'));

  if($.dui.page.done) $.dui.page.done('wo_seq.inc');
  // setTimeout(function(){$.dui.page.seq.init('CLASS_ID');},10000)
})


/* ##### OLD CODE START ##### */

/*
MATERIAL_DG: $('#MATERIAL_DG__').datagrid({
  fitColumns:true,
  rownumbers: true,
  singleSelect:true,
  striped:true,
  fit:true,
  toolbar: [      
    {
      id:'mat_add',
      iconCls: 'icon-add',
      text: 'Add',
      disabled: false,
      handler: function(e){
        var dg = $('#MATERIAL_DG');
        var len = dg.datagrid('getRows').length;
        if(!dg.datagrid('validateRow',len-1)) return false;
        dg.datagrid('appendRow',{
          
        }).datagrid('endEdit',len-1).datagrid('beginEdit',len).datagrid('selectRow',len);
      }
    },
    
    {
      id:'mat_del',
      text: 'Delete',
      iconCls: 'icon-delete',
      disabled: true,
      handler: function(e){
        var dg = $('#MATERIAL_DG');
        var me = $(this);
        confirm(function(yn){
          var vars = {_func:'del',_sqlid:'vwltsa^partX'}
          if(!yn) return false;
          ajaxget('/',vars,function(res){
            if(res.error) return;
            dg.datagrid('reload').datagrid('uncheckAll');
          })            
        })
      }
    },
    
    {
      id:'mat_end',
      iconCls: 'icon-edit-end',
      text: 'End Edit',
      disabled: false,
      handler: function(e){
        var dg = $('#MATERIAL_DG');
        var len = dg.datagrid('getRows').length;
        dg.datagrid('endEdit',len-1);
      }
    }        
    
  ],
  
  columns:[[
    {field:'PART_ID',title:'Part ID',width:130,fixed:true,editor:{
      type:'combobox',
      options: {
        required: true,
        url: '/?_func=get&_sqlid=vwltsa^partid&_combo=y',
        panelWidth:200
      }
    }},
    {field:'REQUIRED_QTY',title:'Required',align:'right',width:70,fixed:true,formatter: function(val){return val || 0}, editor:{
      type: 'numberspinner',
      options: {
        required: true,
        min:0,
        value: 0,
        precision: 0
      }
    }},
    {field:'BAL_QTY',title:'Issued', align:'right',width:70,fixed:true,formatter: function(val){return val || 0}},
    {field:'DESCRIPTION',title:'Description',width:200,fixed:true},
    {field:'TRACE_ID',title:'Trace ID',width:150,fixed:false}
  ]],
  
  onEndEdit: function(idx,row,chg){
    cl(chg);  
  },
  
  onSelect: function(idx,row){
    $('#mat_del').linkbutton('enable');

  }
}).datagrid('rowedit'),

*/


/*
// on-change qty per
$.dui.page.seq.ocqper = function(){
	 var base=$('#WORKORDER_BASE_ID').val();
	 var sub=$('#WORKORDER_SUB_ID').val();
	 ajaxget('/',{'_sqlid':'vwltsa^sub','_func':'get','WOREF':base+'^'+sub},function(rs){
		 var woqty=rs.DESIRED_QTY;
		 var qty_type=$('#QTY_TYPE').combobox('getValue');
		 var qty_per=$('#QTY_PER').numberbox('getValue');
		 if(qty_type=='FIXED') var endq = qty_per; 
		 else var endq = (qty_per * woqty);		 
		 $('#CALC_END_QTY').numberbox('setValue',endq);
	 });
}
*/

/*
// when click tree, disable then fire once.
$.dui.page.seq.calcrunhrs = function(){
  //cl('--$.dui.page.seq.calcrunhrs()--');
	 var base=$('#WORKORDER_BASE_ID').val();
	 var sub=$('#WORKORDER_SUB_ID').val();
	 
	 ajaxget('/',{'_sqlid':'vwltsa^sub','_func':'get','WOREF':base+'^'+sub},function(rs){
		 var woqty=rs.DESIRED_QTY;	 
			  var qtyper = $('#QTY_PER').numberbox('getValue');
			  var qtype = $('#QTY_TYPE').combobox('getValue');
			  var run_type = $('#RUN_TYPE').combobox('getValue');
			  var run = $('#RUN').numberbox('getValue');
			  
			  var run_factor = 0;
			  if (run==0) run_factor=run; 
			  else {
  				switch (run_type){
  				  case "HRS/PC": run_factor=run; break;
  				  case "PCS/HR": run_factor=1/run; break;
  				  case "MIN/PC": run_factor=run/60; break;
  				  case "PCS/MIN": run_factor=1/(run*60); break;  
  				}
			  }

			  var run_hrs = 0;
			  if(run_type=='HRS/JOB') var run_hrs = run;
			  else {
				if(qtype=='FIXED') run_hrs = qtyper * run_factor; 
				else run_hrs = (woqty * qtyper) * run_factor;
			  }  
			  $('#RUN_HRS').numberbox('setValue', run_hrs.toFixed(2));
	 });
}
*/

/*
// when click tree, disable then fire once.
$.dui.page.seq.calcrunhrsBKP = function(){
  //cl('--$.dui.page.seq.calcrunhrs()--');
  var bdat = frm2dic($('form#basf'));
  var sdat = frm2dic($('form#seqf')); 
 var subdat = frm2dic($('form#subf'));
 
  //console.log(subdat);
  
  //if($.dui.page.seq.nobase()) var wo_qty = 1;  
  //else var wo_qty = bdat.DESIRED_QTY;    
   if($.dui.page.seq.nobase()) var wo_qty = 1;
 else {
	 if (!subdat.SUB_ID) var wo_qty = bdat.DESIRED_QTY;
	 else var wo_qty = subdat.QTY_PER;
 }
 

  if(!$.dui.page.seq.qper.length) return;
  
  var qtyper = sdat.QTY_PER;
  var qtype = sdat.QTY_TYPE;
  var run_type = sdat.RUN_TYPE;
  var run = sdat.RUN;
  var run_factor = 0;

  if (run==0) run_factor=run; 
  else {
    switch (run_type){
      case "HRS/PC": run_factor=run; break;
      case "PCS/HR": run_factor=1/run; break;
      case "MIN/PC": run_factor=run/60; break;
      case "PCS/MIN": run_factor=1/(run*60); break;  
    }
  }

  var run_hrs = 0;
  if(run_type=='HRS/JOB') var run_hrs = run;
  else {
    if(qtype=='FIXED') run_hrs = qtyper * run_factor; 
    else run_hrs = (wo_qty * qtyper) * run_factor;
  }  
  $('#RUN_HRS').numberbox('setValue', run_hrs.toFixed(2));
}
*/

/*
// when user select different layout

// when select different layout
$('form#seqf input#UDF_LAYOUT_ID').combobox({      
  onSelect:function(rec){
    $.dui.page.seq.sequdf(rec);
  }
});

$.dui.page.seq.baslid.combobox({      
  onSelect:function(rec){
    //basudf(rec);
  },
  onLoadSuccess:function(data){
    $.dui.page.seq.seqlid.combobox({data:data});
  }
});

// replace labels & show / hide div.fitem
$.dui.page.seq.sequdf = function(rec){
	
  var udfDefault={value:'',text:'',UDF_1:'UDF 1',UDF_2:'UDF 2',UDF_3:'UDF 3',UDF_4:'UDF 4',UDF_5:'UDF 5',UDF_6:'UDF 6',UDF_7:'UDF 7',UDF_8:'UDF 8',UDF_9:'UDF 9',UDF_10:'UDF 10'};
   
  if (!rec || rec.value=='')rec=udfDefault;
  else {
    $.each($.dui.pdata.udfid,function(key,value){
      if (value.value==rec.value){rec=value;}
    })
  }

  $("form#seqf #udf label").each(function() {
    var lab = $(this);
    var lid = lab.attr('id');
    var div = lab.closest('div.fitem');
    if(rec){
      var txt = rec[lid];
      lab.text(txt);
      if(txt !== '') div.show(); else div.hide();
    } else div.hide();
  })      
}
*/

/* ##### OLD CODE ENDS ##### */
