
$.page.ready(function () {
/*


*/

$.page.fn.trace_onChange = function(nv,ov){          
  function reject(alert){
    setTimeout(function(){
      if(alert) msgbox(alert);
      me.numberspinner('setValue',ov);
    })                
  }
  nv = parseInt(nv);
  var me = $(this);
  var dg = $('#receiptlines');

    //20181023,CLS
  // get the line.WOREF
  var woref=dg.datagrid('getSelected').WOREF;


  var tdg = $('#tracedg');
  var row = tdg.datagrid('getSelected');
  var idx = tdg.datagrid('getRowIndex',row);
  //var bob = tdg.datagrid('getEditor', {index:idx,field:'BAL_QTY'});
  
  var bob = dg.datagrid('getSelected').QTY_BAL;
  //console.log(bob)
  // first validate against the trace balance.
 // var tbal = parseInt($(bob.target).numberspinner('getValue'));             
 // var tsum = parseInt(nv);
 // if (woref=='' || !woref) {
  //  if(tsum > tbal) return reject('Quantity exceeds available '+tbal); // trace-bal check.
  //}
  var rbal = dg.datagrid('getSelected').QTY_BAL, rsum=0;
  tdg.datagrid('getRows').map(function(e){
    if(!e.TRACE_ID || e.TRACE_ID==row.TRACE_ID) rsum+=parseFloat(nv); 
    else rsum+=parseFloat(e.QTY); 
    //cl('mode:'+e._func+': eQty'+e.QTY+' nv:'+nv); //mode:undefined:3:1, mode:upd:2:1
  })
  

  //cl('r-sum: '+rsum+' r-bal: '+rbal);
  //if (woref=='' || !woref) {
    if(rsum > rbal) reject(`Quantity ${rsum} exceeds required ${rbal}`);    
  //}
  
}

// also fires on click.
$.page.fn.notrace_onChange = function(nv,ov){
  var me = $(this);
  var dg = $('#receiptlines');

  var row = dg.datagrid('getSelected');

  var max = row.QTY_BAL;
  if(nv > max) {
    setTimeout(function(){
      me.numberspinner('setValue',ov);  
    })  
  }

}

// trace-line click
$.page.fn.traceclk = function(){

  function go(){
   // console.log('goooooooooo')
    var dlg = $('div#traced');

    var _D=dg.datagrid('getSelected')._DIM_TRACKED;
    var _T=dg.datagrid('getSelected').TRACEABLE;
    
    //2021/4/7 , CLS, trace id is using textbox, that's why following codes commment out
    //begin
    //var trc_tf=false;
    //if (_T =='N') trc_tf=false;
    //else trc_tf=true;
    //tdg.datagrid('getColumnOption','TRACE_ID').editor.options.required=trc_tf;
    //tdg.datagrid('getColumnOption','TRACE_ID').editor.options.readonly=!trc_tf;
    //end

    var lwh_tf=false;

    var dims=['L','W','H'];
    switch (_D){
      case "Y":
        dims.map( d => {
          var d1 = "_"+d;
          if (dg.datagrid('getSelected')[d1] == 'Y' ) lwh_tf=false;
          else lwh_tf=true;
          tdg.datagrid('getColumnOption',d).editor.options.readonly=lwh_tf;
          tdg.datagrid('getColumnOption',d).editor.options.required=!lwh_tf;
        });
        break;
      case "N":
      default:
        lwh_tf=true;
        dims.map( d => {
           tdg.datagrid('getColumnOption',d).editor.options.readonly=lwh_tf ;
           tdg.datagrid('getColumnOption',d).editor.options.required=!lwh_tf; 
        });
    }
    //var trow=tdg.datagrid('getSelected')
    //var tindex = tdg.datagrid('getRowIndex',trow); 
    //tdg.datagrid('refreshRow',tindex)
    var _MIN = dg.datagrid('getSelected').TOTAL_RECEIVED_QTY;
    //console.log('RCV:',_MIN)
    //tdg.datagrid('getColumnOption','QTY').editor.options.min= _MIN*-1;
    tdg.datagrid('getColumnOption','QTY').editor.options.min= _MIN*-1;


    dlg.dialog('open');
  }  
  
  var dg = $('#receiptlines');
  var tdg = $('#tracedg');   
  var row = dg.datagrid('getSelected');
  cl('row TRACE:',row.TRACE);
  
  tdg.datagrid('loadData',row.TRACE || []);  
  if(row.TRACE ) return go(); // data is already loaded.


  row.RECEIPT_ID = $('#RECEIPT_ID').textbox('getValue');     
  
  //var data = tdg.datagrid('getColumnOption','TRACE_ID').editor.options.data;
  var _D=dg.datagrid('getSelected')
  var woref=dg.datagrid('getSelected').WOREF;

  var qtybal=dg.datagrid('getSelected').QTY_BAL;
  
  var qtymin=dg.datagrid('getSelected').QTY_MIN;
  
  ajaxget('/',{
    _func:'get', 
    _sqlid:'inv^pol_trace',
    _combo:'y',
    PART_ID:row.PART_ID,
    LINE_NO: row.LINE_NO,
    RCVREF:row.RECEIPT_ID+'^'+row.LINE_NO

  },function(res){
      //console.log(res);
      //console.log(_D)
      if (_D['_DIM_TRACKED']=='Y') var cbo=res.lwh;
      else var cbo=res.cbo;
      //console.log(cbo)
      //2021/4/7 , CLS, trace id is using textbox, that's why following code commment out
      //tdg.datagrid('getColumnOption','TRACE_ID').editor.options.data = cbo;
      row.TRACE = res.dg;
        
      tdg.datagrid('loadData',row.TRACE || []);       
      go()
  }); 
  //cl(row);
   
  

}

$.page.fn.enable = function(tf){
  if(tf===true){
    //butEn('asdpx');
    $('form#receipthead').removeClass('form-lock');
  	$('#receiptlines').datagrid('readonly',false);
  	$('#traced').removeClass('lock');
  	//$('div#traced').datagrid('readonly',false);
    //roclr(true);

  } else {
    //butEn('apx');
    $('form#receipthead').addClass('form-lock');  
  	$('#receiptlines').datagrid('readonly',true);
  	$('#receive_all').linkbutton('disable');
  	$('#traced').addClass('lock');
  	//$('div#traced').datagrid('readonly',true);
    //roset(true);
  }
  



  // except when +add, always set to readonly.
  //$('#MODE').combobox('readonly',true).combobox('reselect');
}

// trace ID selection.
$.page.fn.trace = function(me,rec){
  //console.log('$.page.fn.trace:',rec);
  var tdg = $('#tracedg');
  var rows = tdg.datagrid('getRows');
  
  var exi = false; rows.map(function(e){if(e.TRACE_ID==rec.value) exi=true});
  if(exi) return setTimeout(function(){
    me.combobox('clear');
    msgbox('['+rec.value+'] already selected.');
  });
  
 
  var row = tdg.datagrid('getSelected');
  var idx = tdg.datagrid('getRowIndex',row); 
  //var bal = tdg.datagrid('getEditor', {index:idx,field:'BAL_QTY'});
  //$(bal.target).numberbox('setValue',rec.BAL_QTY);
  var qty = tdg.datagrid('getEditor', {index:idx,field:'QTY'});
  //$(qty.target).numberbox('set',{min:rec.BAL_QTY*-1,value:rec.BAL_QTY*-1,max:rec.BAL_QTY*-1});  
  $(qty.target).numberbox('set',{min:rec.BAL_QTY*1,value:rec.BAL_QTY*1,max:rec.BAL_QTY*1});
  var dg = $('#receiptlines').datagrid('getSelected');
  if (dg['_DIM_TRACKED']=='Y') {
    var lwhs=[{'L':'LENGTH'},{'W':'WIDTH'},{'H':'HEIGHT'}]

    lwhs.map(lwh => {
      var keys=Object.keys(lwh);
      keys.map ( k => {
        var col = tdg.datagrid('getEditor',{index:idx,field:k});
        $(col.target).numberbox('set',{min:rec[lwh[k]],value:rec[lwh[k]],max:rec[lwh[k]]}); 
      })
    })
      /*
      var l = tdg.datagrid('getEditor',{index:idx,field:'L'});
      $(l.target).numberbox('set',{min:rec.LENGTH,value:rec.LENGTH,max:rec.LENGTH});     
      
      var w = tdg.datagrid('getEditor',{index:idx,field:'W'});
      $(w.target).numberbox('set',{min:rec.WIDTH,value:rec.WIDTH,max:rec.WIDTH});  

      var h = tdg.datagrid('getEditor',{index:idx,field:'H'});
      $(h.target).numberbox('set',{min:rec.HEIGHT,value:rec.HEIGHT,max:rec.HEIGHT});  
      */
    
  }
  //console.log(dg)
}



$.page.fn.opts = {
  
  editor: 'inline',
  tbarPrepend: $('<a id="receive_all" class="easyui-linkbutton" iconCls="icon-list" disabled="true">Receive All</a><span class="vert-sep" />'),
  striped: true,
  url: '/',
  queryParams: {
		_func:'get',
		_sqlid:'inv^receipt_lines',
		_dgrid:'y',
		RECEIPT_ID:''
  },

  onRowContextMenu: function(e){return e.preventDefault()},
  
  loadFilter: function(data){
    if(!data || (!data.rows && data.length==0)) data = {rows:[],total:0}
    //cl(data)
    data.rows.map(function(e,i){e.LINE_NO = i+1;})
    //cl(data);
    return data;
  },
  
  rownumbers: false,
  fitColumns: true,
  fit: true,
  columns: [[
    {field:'_INFO', hidden:true},
    {field:'_UNIT_MATERIAL_COST', hidden:true},
    {field:'UNIT_PRICE', hidden:true},
    {field:'CURRENCY_RATE', hidden:true},
    {field:'TRACE',hidden:true,width:300,_formatter:function(val){return jsonString(val)}},
    {field:'RECEIPT_ID',hidden:true},
    {field:'LINE_NO',title:'#',width:25,fixed:true},
    {field:'TRACEABLE',title:'TRC',width:35,fixed:true,align:'center',formatter:function(val,row,idx){
      if(val=='Y') return '<div title="Traced" class="trace-line icon icon-trace _easyui-tooltip"></div>';
      else return '<div />';
    }},
    {field:'_DIM_TRACKED',title:'DIM',width:35,fixed:true,align:'center',formatter:function(val,row,idx){
      if(val=='Y') return '<div title="Dim" class="dim-line icon icon-value _easyui-tooltip"></div>';
      else return '<div />';
    }},
    {field:'_L',title:'Length',width:35,fixed:true,align:'center'},
    {field:'_W',title:'Width',width:35,fixed:true,align:'center'},
    {field:'_H',title:'Height',width:35,fixed:true,align:'center'},
            
    {field:'PO_LINE_NO',title:'PO Line',width:50,fixed:true},
    {field:'ORDER_QTY',title:'Qty Order',width:60,fixed:true,align:'right'},
    {field:'QTY_BAL',title:'Qty Bal',width:60,fixed:true,align:'right',formatter:function(val,row,idx){
      { 
        var title=`<span title=\"${row._INFO}\" class=\"easyui-tooltip\">${val}</span>`
        return title;
      }

    }},
    {field:'RECEIVE_QTY',title:'Qty Rcv',width:60,fixed:true,align:'right',
      styler: function(val,row,idx){
				if (val < 0) return {class:'fg-red'}
      },
      editor:{type:'numberspinner',options:{
        precision:2,
        min:0,
        value:0,
        id:'rcv_qty',
        readonly: false,
        onChange: $.page.fn.notrace_onChange
      }
    }},

    {field:'DELIVERY_DATE',title:'Del. Date',width:80,fixed:true,formatter:eui.date},
    {field:'ORDER_TYPE',title:'Order Type',width:60,formatter:function(val,row,idx){
      var ttype={'P':'PART ORDER','S':'SUBCONTRACT','J':'JOB RELATED','E':'EXPENSE','F':'FREIGHT','I':'INSPECTION & CERTIFICATION','O':'OTHERS'}
      return ttype[val];

    } },
    {field:'LINE_STATUS',title:'Line Status',width:40},  
    {field:'PART_ID',title:'Our Part ID',width:100},
    {field:'PART_DESCRIPTION',title:'Our Part Description',width:150},
    {field:'PURCHASE_UOM',title:'UOM',width:50,coloff:true},
    {field:'WOREF',title:'Job Reference',formatter:function(val){if(val) return val.replace(/\^/g,'.')}},

  ]],
  
  onSelect: function(idx,row){
    if(busy($(this))) return; // this is firing twice because of click-cell / begin edit.
    
    //var sid = $('#SHIPMENT_ID').combobox('getValue');
    //use textbox if using qbe
    var sid = $('#RECEIPT_ID').textbox('getValue');
    var dg = $(this);
    //console.log(row)
    if(row.TRACEABLE=='Y' || row._DIM_TRACKED=='Y') {
      $.page.fn.traceclk();
      dg.datagrid('getColumnOption','RECEIVE_QTY').editor.options.readonly = true;       
    }
    
    else if(!sid){
      dg.datagrid('getColumnOption','RECEIVE_QTY').editor.options.readonly = false; 
    }


    var row = dg.datagrid('getSelected');
    dg.datagrid('getColumnOption','RECEIVE_QTY').editor.options.min = row.QTY_MIN; 

    //console.log('row TRACE :',row.TRACE);
    dg.datagrid('options').tbar.dgre_add.linkbutton('disable');
    dg.datagrid('options').tbar.dgre_del.linkbutton('disable');
    dg.datagrid('options').tbar.dgre_edit.linkbutton('disable');

  },
  
  onBeforeLoad:function(qp){
    var fdat = $('#receipthead').form('getData');
    if(!fdat.RECEIPT_ID) return false;
  },
  
  onEndEdit: function(idx,row,chg){        
    $.page.fn.totals();
  },
  
  onLoadSuccess: function(){
    setTimeout(function(){
      $.page.fn.totals();
    })
  }
  
}



// delete zero-qty rows & save.
$.page.fn.saverows = function(id){
  var poid=$('#PO_ID').textbox('getValue');

  var dg = $('#receiptlines');
  var idx = 1, dels=[],rows=[];
  var data = clone(dg.datagrid('getData').rows); 

  data.map(function(e,i){
    if(e.RECEIVE_QTY==0) dels.push(i);
    else {

      e.LINE_NO = idx; idx ++;
      dg.datagrid('updateRow',{index:i,row:e});

      var lwh={};//dimensions
      var trc={}; 
      if(e.TRACE) {
        

        e.TRACE.map(function(e){
            var TRC= e.TRACE_ID.split(',');
            e.TRACE_ID=TRC[0]
            trc[e.TRACE_ID] = parseFloat(e.QTY);
            lwh[e.TRACE_ID]={"L":e.L,"W":e.W,"H":e.H,"Q": parseFloat(e.QTY)};

          });
      }
      

      rows.push({
        PO_LINE_NO: e.PO_LINE_NO,
        LINE_NO: e.LINE_NO,
        QTY: e.RECEIVE_QTY,
        TRACE: trc,
        PART_ID: e.PART_ID,
        WOREF:e.WOREF,
        PO_ID:poid,
        ORDER_TYPE:e.ORDER_TYPE,
        LWH:lwh,
        _DIM_TRACKED:e._DIM_TRACKED,
        _UNIT_MATERIAL_COST:e._UNIT_MATERIAL_COST,
        _UNIT_PRICE : e.UNIT_PRICE,
        _RATE: e.CURRENCY_RATE || 1
      })
    }    
  }) 
  
  if($.dui.bhave.SAVEALL_LINES != 'y') dels.reverse().map(function(e){dg.datagrid('deleteRow',e)});  var rowdat = jsonString(rows);
  
  //cl(rowdat); // [{"SO_LINENO":2,"LINE_NO":1,"QTY":1,"TRACE":{"1":0,"12W3":1}}]



  ajaxget('/',{_sqlid:'inv^receipt_lines',_func:'add', LINE_NO:rowdat, RECEIPT_ID: id},function(res){
   //console.log(res);
    if (res.error == false) {
      var rcv=$('#RECEIPT_ID');
      rcv.textbox('setValue',id);  
    }

  });
}


$.page.fn.totals = function(){
 
  var dg = $('#receiptlines');  
  var rows = dg.datagrid('getData').rows;
  var fdat = frm2dic($('form#shiphead'));

  var rows = dg.datagrid('getData').rows;
  //included to check the ship qty, if total ship qty =0 then diabled to save button
  var qRCV=0;
  rows.map(function(e){
    qRCV+=(e.RECEIVE_QTY*1);
  });

  //butEn('asdx');
    return;

    if (qRCV!=0) butEn('asdx');
    else butEn('adx');

  //cl(data);
}

$.page.fn.isloading = function(){ return $('#receiptlines').form('options').loading}

$(document).ready(function(){
    // use the global def (see note below)
    $('#RECEIPT_ID').qbe({defid:'receipt_ids'});

        
      $('#PO_ID').qbe({   
        defid:'po_ids',
        /*
        queryParams: {
          _sqlid:'inv^po_qbe'
        },
        onDemand: true,
        valueField: 'PO_ID',
        fields:[
          {field:'value',title:'PO ID',editor:'textbox'},
          {field:'VENDOR_ID',title:'Vendor ID',editor:'textbox'},
          {field:'STATUS',title:'Status',editor:'textbox'},

        ],
        */
        onSelect: function(row){
          
          var rec = row.value;


          var dg = $('#receiptlines');
          var me = $(this);
    
          var receipt=$('#RECEIPT_ID').textbox('getValue');
          if (receipt ==''){
            ajaxget('/',{_sqlid:'inv^pohead',_func:'get',ID: rec},function(head){
              //console.log(head)
              $('#receipthead').form('preload',head);
              ajaxget('/',{
                _sqlid:'inv^polines',
                _func:'get',
                _dgrid:'y',
                PO_ID: rec,

              },function(lines){
                //console.log(lines);
                lines.rows.map(function(e){
                  e.PO_LINE_NO=e.LINE_NO;
                  e.QTY_BAL = e.ORDER_QTY - e.TOTAL_RECEIVED_QTY;
                  e.QTY_MIN = e.TOTAL_RECEIVED_QTY*-1;
                  e.RECEIVE_QTY = 0;

                })
               // console.log(lines);
                $('#receiptlines').datagrid('loadData',lines);
                $('#receive_all').linkbutton('enable'); 
              })
            })
          }
          
          
          /* ==== */        
        },  
        preload:true
      });


  $('#but_add').on('done',function(){
    $.page.fn.enable(true);
    //roclr(true);
    $('#receiptlines').datagrid('loadData',[]);
   
    var shp=$('#RECEIPT_ID');
    shp.textbox('required',false);
    shp.textbox('readonly',true);
    
    butEn('asdx');
  })

  $('#receiptlines')
    .datagrid('rowEditor',$.page.fn.opts)
    .datagrid('columns',$('#dgre_tb'));

  
  var tbar = $('#receiptlines').datagrid('options').tbar;  
  tbar.dgre_add.linkbutton('disable');
  tbar.dgre_del.linkbutton('disable');
  tbar.dgre_edit.linkbutton('disable');
  
  /*
  // Hide Buttons.
  setTimeout(function(){
    var tbar = $('#receiptlines').datagrid('options').tbar;
    tbar.dgre_add.hide();
    tbar.dgre_del.hide();
    tbar.dgre_edit.hide();
  });
  */
  // RECEIVE All Button.
  $('#receive_all').linkbutton({
    onClick: function(){
      $(this).linkbutton('disable'); 
      var dg = $('#receiptlines');
      dg.datagrid('getData').rows.map(function(e,i){
        if(e.TRACEABLE=='Y') msgbox('Line '+e.LINE_NO+' is traceable.'); 
        else {
          if(e._DIM_TRACKED=='Y') msgbox('Line '+e.LINE_NO+' is dimensions tracked.'); 
          else {
            e.RECEIVE_QTY = e.QTY_BAL;
            dg.datagrid('updateRow',{index:i,row:e});
          }
        }    
      })        
    }    
  })

  // Trace Data
  $('#tracedg').datagrid().datagrid('rowEditor',{
    fit: true,
    fitColumns: true,
    editor: 'inline',
    striped: true,

    addData:{QTY:0,L:0,W:0,H:0},    
        
    onEndEdit: function(idx,row,chg){ 
      var me = $(this);
      var data = me.datagrid('getRows');
      //removed Timeout(). it will causing Ship Qty not updated if close tracedg windows instead of click green tick
      //setTimeout(function(){
        var sl = $('#receiptlines'); 
        var rowSL = sl.datagrid('getSelected');
        var idx = sl.datagrid('getRowIndex',rowSL) ; 
        var qty=0; 
        data.map(function(e){
          //qty+=parseInt(e.QTY);
          qty+=parseFloat(e.QTY);
          
        });

          sl.datagrid('updateRow',{'index':idx, 'row':{
            TRACE:data,
            RECEIVE_QTY:qty,
    
          }});           

      //});
    },
    onCancelEdit:function(index,row){
      row.editing = false;
      $(this).datagrid('refreshRow', index);
    } , 
    columns: [[
      /*
      {field:'TRACE_ID',title:'Trace ID',width:100,
        editor: {
          type:'combobox',
          
          options:{
            required:true,
            onSelect:function(rec){
              var me = $(this);
              //console.log('tdg,TraceId:',me);
              //console.log('tdg,Rec:',rec);
              
              $.page.fn.trace(me,rec);
            }
          }
        }
      },
      */
      {field:'TRACE_ID',title:'Trace ID',width:100,
      editor: {
        type:'textbox',
        options:{required:true}
      }},
      {field:'QTY',title:'Qty Rcv',width:70, fixed:true,
        editor:{
          type:'numberspinner',
          options:{
            precision:2,
            min:0,
            value:0,
            readonly: false,
            onChange: $.page.fn.trace_onChange
          }
        }
      },
      {field:'L',title:'Length',width:70, fixed:true,
      editor:{
        type:'numberspinner',
        options:{
          precision:2,
          min:1,

          readonly: false,

        }
      }
      },
      {field:'W',title:'Width',width:70, fixed:true,
      editor:{
        type:'numberspinner',
        options:{
          precision:2,
          min:1,

          readonly: false,

        }
      }
    },
    {field:'H',title:'Height',width:70, fixed:true,
    editor:{
      type:'numberspinner',
      options:{
        precision:2,
        min:1,

        readonly: false,

      }
    }
  }
    ]]
  
    }); 

  $('div#traced').dialog({
    iconCls:'icon-trace',
    onClose:function(){
      //console.log('onClose')
      $('#tracedg').datagrid('editButs',{'ok':'click'});
      $('#receiptlines').datagrid('editButs',{'ok':'click'});
    }
  })
  


	
  $('form#receipthead').on('loadDone',function(jq,data){
    //console.log(data)
    $.page.fn.enable(false);

    // only fires when loading saved do
		$('#receiptlines').datagrid('load',{
			_func:'get',
			_sqlid:'inv^receipt_lines',
			_dgrid:'y',
			RECEIPT_ID:data.RECEIPT_ID
  	});
  	
  	
  }).on('success',function(jq,mr){
    if(mr.res._next) $.page.fn.saverows(mr.res._next);
  })



})


});  // $.page.ready