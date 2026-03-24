var cl = console.log;
/*
  CLS, 180206 ver:2.2.615
  $.dui.page.coc(), included QP EVERSLIK tests


*/

$.dui.page.bas = {};

// 151104 - Template Enable / Disables.
$.dui.page.istemp = function(){
  var fdat = frm2dic($('form#basf'));
  
  var tf=false; if(fdat.WO_CLASS=='TEMPLATE') var tf=true;
  $('#SO_INFO input.textbox-f').combobox('readonly',tf);
  $('#WO_STATUS').combobox('readonly',tf);
  $('#STATUS').combobox('readonly',tf);  
  $('input[comboname=DESIRED_WANT_DATE]').combobox('readonly',tf);
  $('input[comboname=DESIRED_RLS_DATE]').combobox('readonly',tf);
  $('#PRIORITY').numberspinner('readonly',tf);
}
 
/* BASE FUNCTIONS START */

$.dui.page.partplan = function(){
  var fdat = frm2dic($('form#basf'));
  
  if (fdat.PART_ID){  //ONLY WORK ORDER with PART will assigned a QP PLAN_ID
	  if(fdat.QC_PLAN_ID == '' && fdat._PLAN_ID) {
		$('input#QC_PLAN_ID').textbox('setValue',fdat._PLAN_ID);
		alert('Quality Plan ID updated. Please save.');
	  }	  
  }
}

$.dui.page.qtsel = function(rec){
  $('#QC_PLAN_ID').textbox('setValue',rec.PLAN_ID);
}

$.dui.page.coc = function(BASE_ID){
  $('#cocdata').datagrid({
	  readonly: false,
    lidx: -1,
    columns:[[
      {field:"TYPE", title:"Type",width:150,formatter:function(val){
        var rec = {
          COC: ['Conformance Cert','icon-coc'],
          RES: ['Resin Coating','icon-coat-resin'],
          PHO: ['Phos Coating','icon-coat-phos'],
          EVS: ['Everslik Coating','icon-coat-ever'],
        }[val];
        
        return '<span style="width:20px" class="'+rec[1]+' dgicon"></span><span>'+rec[0]+'</span>';
      }},
      {field:"ID", title:"ID", width:100},
      {field:"DATE", title:"Date", width:100, formatter:tz2date},
      {field:"QTY" , title:"Qty", width:50, align:'right'},
      {field:"USER_NAME", title:"Issued By", width:200},
      
    ]],
    
    url: '/?_func=get&_sqlid=dqm^complys&_dgrid=y&JOBID='+BASE_ID,
    fit:true,
    rownumbers:true,
    singleSelect:true,
    onDblClickRow: function(index,row){
  	  var val=row.COC_ID;
  	  if(val.length < 1) return false;
      loadpage('dqm^coc_man&COC_ID='+val);
  	}
  })	
}

// on-demand tabs (working but not used.)
$.dui.page.tabfrag = function(tab){
  var frag = tab.find('template').first();
  if(frag.length) {
    var frm = frag.closest("form"); 
    showfrag(frag,frag.parent());
    frm.form('load',frm.data('fdat'));
  }  
}

$.dui.page.bompop = function(){
  
  $('#bomimp').remove();
  
  function seqget(qp,ok,err){
    var first, seqs = [];
    $.dui.page.wotree.tree('getChildren').map(function(e){
      if(!e.children) {
        var bits = e.id.split('^');
        var obj = {
          value   : e.id,
          text    : `SUB: ${bits[1]} SEQ: ${bits[2]}` 
        } 
        if(!first) {
          obj.selected = true;
          first = true;
        }
        seqs.push(obj)
      }
    })
    return seqs;    
  }
  
  seqs = seqget();
  
  return dynDialog(
    
    {
      id:'bomimp',
      title:'Import BOM from Part',
      fields:[
        {
          'id':'BOM_SEQ',
          'type':'combobox',
          'label':{text:'Operation No'},
          'data-options':{data: seqs},
          'style':''
        }
      ]
    },
    [
      {
        iconCls:'icon-go',
        text: 'Import',
        onClick: function(){
          var me = $(this)
          var bid = $('#BASE_ID').textbox('getValue');
          var sid = $('input[comboname="BOM_SEQ"]').textbox('getValue');
          var pid = $('#PART_ID').combobox('getValue');
          var jqty = $('#DESIRED_QTY').numberspinner('getValue');
          if(!sid || !pid) return msgbox('Please select Part & Sequence.')
          me.linkbutton('disable');
          
          ajaxget('/',{
            _sqlid    : 'vwltsa^opnpart',
            _func     : 'put',
            _BASE_ID  : bid,
            SEQ_NO    : sid,
            PART_ID   : pid ,
            JOB_QTY   : jqty
          },function(res){
            if(!res.error) {
              msgbox(`BOM ${pid} > ${sid} import success.`);
              $('#wosel').combobox('reselect');
            }
            me.linkbutton('enable');
            $('#bomimp').dialog('close');
          })
        }
      }
      
    ]
  )
}

//CLS, 220804, instead of form-lock, exclude STATUS field to lock 
$.dui.page.lockpage = function(){
  console.log('lockpage');
  var status = $('#WO_STATUS').combobox('getValue');
  var cq = $('#COMPLETED_QTY').numberbox('getValue');
  var qty = $('#DESIRED_QTY').numberbox('getValue');
  console.log(`cq:${cq},q:${qty}`);
  $(':input:not(:hidden)', $('form#basf')).each(function() {
    if (this.readonly) {}
    else {
      var disabled=false;
      if (this.name=='STATUS') disabled=false;
      else {
        if (status.indexOf("C")!=-1)disabled=true;
        else {
          if (status.indexOf("X")!=-1)disabled=true;
          else {
            if (cq==qty)disabled=true;
            else {
              if (cq==0)disabled=false;
            } 
          }
        }
      }   
      $(this).prop('disabled',disabled);       
    }
 });
}

/* EUI ELEMENT LOADER */
$.dui.page.bas.init = function(elid){
  
  var els = {

    BASTABS: $('#bastabs').tabs({
      onSelect:function(tit,idx){
        
        if(tit=='Quality'){
          var frm = $('form#basf'); 
          var fdat = frm2dic(frm);
          $.dui.page.coc(fdat.BASE_ID);
        }
        
        // else $.dui.page.tabfrag($(this).tabs('getTab',idx)); 
      }
    }).tabs('disableAll'),

    // HEADER PART ID
    PART_ID: $('#PART_ID').combobox({
      validType:['inList'],
      editable:true,
      data:$.dui.pdata.partid,
      onSelect:function(rec){
        if($('#basf').form('options').loading) return;
        var wot = $('#WO_TYPE');
        $('#PART_ALIAS').textbox('setValue',rec.PART_ALIAS);
        $('#PRODUCT_CODE').textbox('setValue',rec.PRODUCT_CODE);
        wot.combobox('select',rec.PART_CLASS_ID);
        wot.combobox('readonly',true);
        var bid = $.dui.page.wotree.getbas().id;
        $('.combobox-item > span:contains("'+bid+'") + span').text(rec.value);
        $.dui.page.partplan();
      }
    }),
    
    
    // DELETE PART BUTTON
    BOM_IMPORT: $('#BOM_IMPORT').linkbutton({
      onClick:function(){
        dlg = $.dui.page.bompop();
        dlg.dialog('open');    
      }
    }),    
    
    // DELETE PART BUTTON
    PART_DEL: $('#PART_DEL').linkbutton({
      onClick:function(){
        $('#PART_ID').combobox('clear');
        $('#PART_ALIAS').textbox('clear');
        $('#WO_TYPE').combobox('readonly',false);   
      }
    }),

    SOREF_DEL: $('#SOREF_DEL').linkbutton({
      onClick:function(){
        $('#SO_INFO  input.textbox-f').textbox('clear');
      }
    }),
    
    // when form is finished loading
    BASF: $('form#basf').on('loadDone',function(me,fdat){ 
      $(this).data('fdat',fdat);
      
      // Only re-select the UDF combo.
      var udl = $('form#basf input#UDF_LAYOUT_ID');
      if(udl.length > 0) udl.combobox('reselect');
      
      $.dui.page.partplan();
      if(fdat.QC_PLAN_ID != '' && (fdat.QC_TEST_ID == '')||!fdat.QC_TEST_ID) $('a#testadd').linkbutton('enable');
      else $('a#testadd').linkbutton('disable');
      
      // Load Test Combo
      if(fdat.TEST_IDS) $('#QC_TEST_ID').combobox('loadData',fdat.TEST_IDS);
      
      // Load Part UOM, 2017-01-10 10:11AM by CLS
      //cl(fdat.UOM_ID);
      if (fdat.UOM_ID) $('#UOM_ID').textbox('setValue', fdat.UOM_ID);
      /*
      PAC - 160702
      var act = 'enableTab'; if(fdat.COC_QTY==0) act='disableTab';
      $('#bastabs').tabs(act,'COC');
      */
      $('#bastabs').tabs('enableTab','Quality');
      
      
      // 151105 - disallow changing of status for templates.
      $.dui.page.istemp();
      
      //190626, SALES_ORDER_ID and SALES_ORDER_LINE_NO MUST BE READONLY
      $('#SALES_ORDER_ID').textbox('readonly');
      $('#SALES_ORDER_LINE_NO').numberbox('readonly');

      // PAC 160712 - Disallow changes if STATUS = X,R
      if(!$.dui.ronly){
        var stat = $('#WO_STATUS');
        if((/X|C/).test(fdat.STATUS)) {
          readonly($(this),true);
          stat.addClass('ronly-on');
        } else {
          stat.removeClass('ronly-on');
          readonly($(this),false);
        }
      } 
      
      $('#job_export').linkbutton('enable');
      
      // PAC 160407 - Check Behavior On Load.
      // Also need to add lead time.
      $.dui.page.dobhave();

      //CLS, 20180517,
      // set the PART ID field to readonly if linked to SALES ORDER
      var soref=$('#SALES_ORDER_REF').combobox('getValue');
      var tf=false;
      if (soref.length>0 )tf=true;
      $('#PART_ID').combobox('readonly',tf);
      $.dui.page.lockpage();
      //$('#SALES_ORDER_REF').combobox('reload','/?_func=get&_sqlid=vwltsa^sorefs&CUST_ID='+fdat.CUSTOMER_ID);
    }),

    // 160509 - Sales Order Reference.
    SALES_ORDER_REF: $('#SALES_ORDER_REF').combobox({
      required:false,
      validType:['inList'],
      editable:true,
      onSelect: function(rec){   
          if($('#basf').form('options').loading) return;
          var bits = rec.value.split('^');
          var estimatorCost=$('#ESTIMATOR_COST');
          //2022-5-13, SO SPECS will append to existing WO Specs
          var long_spec=$('#LONG_SPEC');

          cl('SOREF onSelect',rec);



          var long_spec_existing=long_spec.textbox('getValue');

          long_spec.textbox('setValue',long_spec_existing +'\r\n\r\n'+rec.PART_DESCRIPTION)
          long_spec_existing=long_spec.textbox('getValue');
          cl('sol2wospec_cols',$.dui.bhave.sol2wospec_cols);
          if($.dui.bhave.sol2wospec_cols){
            ajaxget('/',{_func:'get',_sqlid:'admin^bhave',appid:'sales^sa_sorder'},function(bh){
              cl('sales^sa_sorder',bh);
                if (bh.UDF_LAYOUT_ID){
                    ajaxget('/',{_func:'get',_sqlid:'admin^udfall',ID:bh.UDF_LAYOUT_ID},function(data){
                        var cols=$.dui.bhave.sol2wospec_cols.split(",");
                        cols.map((el)=>{
                          if (el.substring(0,4)=="USER")var fld=data['UDF_'+el.substring(5,7)];
                          else fld=el;
                          cl('col,',fld);
                          cl('rec,',rec[el])
                          if(rec[el])long_spec_existing+='\r\n\r\n'+fld.replaceAll('_',' ')+' : '+rec[el]
                        })
                        long_spec.textbox('setValue',long_spec_existing);
                    })                        
                }

            })
          }
          
          var gets = {
            PART_ID: $('#PART_ID').combobox('getValue'),
            DESIRED_QTY: $('#DESIRED_QTY').numberspinner('getValue'),
            DESIRED_WANT_DATE: $('#DESIRED_WANT_DATE').datebox('getValue')
          };
          //var puts = {SALES_ORDER_ID:bits[0],SALES_ORDER_LINE_NO:bits[1],CUSTOMER_ID:rec.CUST_ID};
          var puts = {SALES_ORDER_ID:bits[0],SALES_ORDER_LINE_NO:bits[1]};
          if ($.dui.bhave.sol_fields=='n'){
            estimatorCost.numberbox('setValue',rec.UNIT_ESTIMATOR_COST*gets.DESIRED_QTY);
            $.each(puts, function(k,v){ var el=$('[name="'+k+'"]'); if(el.length) { try{el.textbox('setValue',v)}catch(e){el.val(v)} } });
          }
          else {
            if(rec.QTY != gets.DESIRED_QTY || rec.WANT_DATE != DESIRED_WANT_DATE || rec.PART_UD !=gets.PART_ID) confirm(function(yn){
              puts.PART_ID=rec.PART_ID;
              if(yn){
                if ((/b|q/).test($.dui.bhave.sol_fields) && (rec.QTY)) puts.DESIRED_QTY=rec.QTY; 
                if ((/b|w/).test($.dui.bhave.sol_fields) && (rec.WANT_DATE)){
                    var w=new Date(rec.WANT_DATE);
                            var want_adj=$.dui.bhave.want_adj;
                            if (want_adj<0) w.setDate(w.getDate() - Math.abs(want_adj));
                            if (want_adj>0) w.setDate(w.getDate() + Math.abs(want_adj));                
                            puts.DESIRED_WANT_DATE=w.getUTCFullYear()+'-'+(w.getUTCMonth()+1)+'-'+w.getUTCDate();
                } 
                estimatorCost.numberbox('setValue',rec.UNIT_ESTIMATOR_COST*rec.QTY);


              }
              else {
                estimatorCost.numberbox('setValue',rec.UNIT_ESTIMATOR_COST*gets.DESIRED_QTY);
              }
              $.each(puts, function(k,v){ var el=$('[name="'+k+'"]'); if(el.length) { try{el.textbox('setValue',v)}catch(e){el.val(v)} } });
              $('#PART_ID').combobox('reselect',rec.PART_ID);
              $('#PART_ID').combobox('readonly',true);
            },'Update Part ID,Part Description, Qty and Want Date ?');   
        }
      }
    }),
    
    // Unreleased -> ? = Set Date, ? -> Unreleased = Clear Date
    WO_STATUS: $('#WO_STATUS').combobox({
      required:true,
      valueX:'U',
      editable:false,
      readonly:true,
      data:[
        {text:"Un-Released",value:"U","selected":true},
        {text:"Released",value:"R"},
        {text:"Closed",value:"C"},
        {text:"Cancelled",value:"X"}
      ],

      onChange: function(nv,ov){
        var drd = $('#DESIRED_RLS_DATE'); 
        if($.dui.udata.groups.indexOf('JOB-STATUS')==-1) return(nv=ov);

        // PAC 161126 - check is form is loading.
        if(!ov || $.dui.loading) return;

        else if(nv=='R') {if (ov != nv) drd.datebox('today');} 
        else if(nv=='U') drd.datebox('clear');
        $.dui.page.lockpage();
        try {var mode = $.dui.page.wotree.tree('getRoot').attributes.mode;}
        catch(e){var mode = $('form#basf').attr('mode');}
      }
    }),
    
    // alert user if post-dating release date.
    DESIRED_RLS_DATE: $('#DESIRED_RLS_DATE').datebox({
      predate: false,
      onSelect: function(date){	
        if(date > now()) msgbox('Job will be scheduled after '+myDate(date));
      }
    }),
    
    // When user select different layout
    UDF_LAYOUT_ID: $('form#basf input#UDF_LAYOUT_ID').combobox({
      data:$.dui.pdata.udfid,
      validType:['inList'],
      onSelect:setudfs
    }),
    
    // after add button is pressed
    BUT_ADD: $('#but_add').on('done', function(me,butid){ butEn('sdx');}),
    
    DIVISORS: $('form#basf input[data-divisor]').numberbox({onChange:nboxbar}),
    
    // Open Calibration Plan.
    QC_PLAN_ID: $('#QC_PLAN_ID').textbox({
      editable:true,
      icons:[{
        iconCls:'icon-godoc',
        handler: function(e){
          var val = $(e.data.target).textbox('getValue');
          if(val.length < 1) return false;
          loadpage('dqm^qp^qp_qpman&QPID='+val);        
        }
      }]
    }), 
    
    // Open Test.
    QC_TEST_ID: $('#QC_TEST_ID').combobox({
      editable:false
    }),
    
    TESTADD: $('a#TESTADD').linkbutton({
      onClick:function(){
        var qpid = $('#QC_PLAN_ID').textbox('getValue');
        if(qpid.length < 1) return false;
        var bid = $.dui.page.wosel.val();
        loadpage('dqm^qp^qp_test&newjob='+bid);
      }
    }),

    CUSTOMER_ID:$('#CUSTOMER_ID').combobox({
      onSelect:function(rec){
        $('#SALES_ORDER_REF').combobox('setValue','');
        $('#SALES_ORDER_ID').textbox('setValue','');
        $('#SALES_ORDER_LINE_NO').numberbox('setValue','');
        
        $('#SALES_ORDER_REF').combobox('reload','/?_func=get&_sqlid=sales^sorefs&CUST_ID='+rec.value);
      }
    })
  }

  // initialize one or all.
  if(elid) return els[elid.toUpperCase()];
  else for(var elid in els){els[elid]}  
  
}

/* ##### DOM IS READY ##### */
$.page.ready(function(){
  
  $.dui.page.bas.init();
  // setTimeout(function(){$.dui.page.seq.init('testadd');},10000)
  
})
