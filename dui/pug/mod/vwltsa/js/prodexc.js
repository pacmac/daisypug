$.dui.page.pmrcook = `${$.page.state.pageId}pmr`;
$.dui.page.cwid    = `${$.page.state.pageId}^pmr^.width`;
$.dui.page.mid     = `${$.page.state.pageId}^pmr^cols`;

$.dui.page.defcols = [
  "_LISTS",
  "WOREF",
  "PART_ID",
  "DESIRED_QTY",
  "COMPLETED_QTY",
  "COMPLETED_AMOUNT",
  "DESIRED_RLS_DATE",
  "DESIRED_WANT_DATE",
  "STATUS",
  "USER_9",
  "CUSTOMER_PO",
  "CUSTOMER_PO_LINE_NO",
  "SALES_ORDER_REF",
  "CUSTOMER_NAME",
  "DLVY_DATE",
  "SHIP_LATE",

  "INACTIVE_DAYS",
  
  "USER_10",

  "GAGE",
  "CNC_PROG",
  "USER_4",
  "USER_1",
  "OPN_WOREF",
  "RESOURCE_ID",
  "OP_STATUS",
  "OP_QTY",
  "OP_COMPLETED_QTY",
  "PML_STATUS",
  "SCHED_START_DATE",
  "SCHED_FINISH_DATE",
 
  "CP_ID",
  "CP_DATE",
  "NCR_ID",
  "NCR_STATUS",
  "COATING_RES",
  "USER_7",
  "COC_ID",
  "COC_DATE",  
  "WO_CLASS",
  "PRODUCT_CODE",
  "SALES_ORDER_ID",
  "SALES_ORDER_LINE_NO",
  "UNIT_PRICE",
  "SEQUENCE_NO",
  "RESOURCE_DESC",
  "COC_QUANTITY",
  "COC_STATUS",
  "CUSTOMER_ID",
  "CUSTOMER_PART_ID",

  "LAST_OPN_SEQ",
  "LAST_OPN_RESOURCE_ID",
  "NEXT_OPN_SEQ",
  "NEXT_OPN_RESOURCE_ID",
  "LAST_TX_DATE",

  
]



  
  if(getacook($.dui.page.mid).length==0) {
   // console.log('@@',$.dui.bhave.defcols);
   // if ($.dui.bhave.defcols) putacook($.dui.page.mid,$.dui.bhave.defcols);
  //  else putacook($.dui.page.mid,$.dui.page.defcols);
      putacook($.dui.page.mid,$.dui.page.defcols);
  }





// move to main.js
function putocook(name,obj){
  try {var js = JSON.stringify(obj)}
  catch(err){var js={}};
  putcook(name,js);  
}

// move to main.js
function getocook(name,obj){
  var str = getcook(name); 
  try {return JSON.parse(str)}
  catch(err){return {}};
}

// autosize & save column widths
function autosize(){
  var wido = getocook($.dui.page.cwid);
  var dg = $('#pmr');
  dg.datagrid('loading');
  setTimeout(function(){
    var cols = dg.datagrid('getColumnFields');
    cols.map(function(col,i){
      dg.datagrid('autoSizeColumn',col);
      var cop = dg.datagrid('getColumnOption',col);
      wido[cop.field] = parseInt(cop.width);
    });
    dg.datagrid('loaded');
    putocook($.dui.page.cwid,wido);
  },250)
}

function dashed(val){
  if(!val) return '-';
  return val;  
}

function notes(str){
  if(!str) return '';
  return str.substr(0,50);  
}

function lists(val,row,idx){
 // if(!val) return '';
// return(str.replace(/\^/g,'.'))  
	icons=['tools','part','ship','coc','cprop'];
	var str="";
	icons.map(function(i){
		str+='<span style="width:30px;" class="icon-'+i+' icon-dg click" data-idx='+idx+'></span>';
	})
 //return '<span style="width:30px;" class="icon-ship icon-dg click" data-idx="'+idx+'"></span><span style="width:30px;" class="icon-part icon-dg click" data-idx="'+idx+'"></span><span style="width:30px;" class="icon-pclip icon-dg click" data-idx="'+idx+'"></span>';
 return str;

}

function soref(str){
  if(!str) return '';
 return(str.replace(/\^/g,'.'))  
 //return '<span style="width:20px;" class="icon-ship icon-dg click" data-idx="'+idx+'"></span><span>' +val.replace(/\^/g,'.')+'</span>';
}

function cpref(str){
  if(!str) return '';
  var val=str.replace(/\^/g,'.');
  var docid=val.replace(/\^/g,'.').split('.');
  var url = `inv^cp_man&CP_ID=${docid[0]}`;
  if (docid[0]=='CP TBA') return '<span>'+val+'</span>';
  else return `<a href="javascript:newtab('${url}');"><span>${val}</span></a>`;
}


function woref(str){
  if(!str) return '';
  var val=str.replace(/\^/g,'.');
  var docid=val.replace(/\^/g,'.').split('.');
  var url = `vwltsa^sa_jobman&WOREF=${docid[0]}`;
  return `<a href="javascript:newtab('${url}');"><span>${val}</span></a>`;
}

function opnref(str){
  if(!str) return '';
  return(str.replace(/\^/g,'.'))  
//  return '<span style="width:20px;" class="icon-part icon-dg click" data-idx="'+idx+'"></span><span>' +val.replace(/\^/g,'.')+'</span>';
}

function dvly(val,row,idx){
  if (row.SHIP_LATE<0) return {class:'late'}
  return {class:'otd'}
}
// Shipment Info.
$.dui.page.shipinfo = function(){
  var me = $(this);
  var idx = me.data('idx');
  var row = $('#pmr').datagrid('getRows')[idx];
  if (row.SALES_ORDER_ID) {
    ajaxget('/',{
      _func:'get',
      _sqlid:'sales^shipinfo', 
      SALES_ORDER_ID: row.SALES_ORDER_ID, 
      LINE_NO: row.SALES_ORDER_LINE_NO
    },function(res){
      me.tooltip({
        content:eui.table([
          {field: 'SHIPMENT_ID', title:'Ship ID'},
          {field: 'SHIPMENT_DATE', title:'Ship Date', formatter: eui.date},
          {field: 'SHIPPED_QTY', title:'Qty', style:'text-align:right;'}
        ],res).appendTo('#content')
      }).tooltip('show');

    });
  }   
}


// OPN PART Info.
$.dui.page.mat_info_opn = function(){
  var me = $(this);
  var idx = me.data('idx');
  var row = $('#pmr').datagrid('getRows')[idx];
  if (row.OPN_WOREF) {
    ajaxget('/',{_func:'get', _sqlid:'vwltsa^opnpart' ,OPN_WOREF:row.OPN_WOREF},function(res){
      me.tooltip({
        content:eui.table([
          {field: 'PART_ID', title:'Part ID'},
          {field: 'REQUIRED_QTY', title:'Rq Qty'},
          {field: 'ISSUED_QTY', title:'Iss Qty', style:'text-align:right;'}
        ],res).appendTo('#content')
      }).tooltip('show');

    });
  }
}

//SUBCON Info.
$.dui.page.subcon_info = function(){
  var me = $(this);
  var idx = me.data('idx');
  var row = $('#pmr').datagrid('getRows')[idx];
  //wconsole.log(row);
  if (row.BASE_ID) {
    ajaxget('/',{_func:'subcon', _sqlid:'vwltsa^prodexc' ,BASE_ID:row.BASE_ID},function(res){
      me.tooltip({
        content:eui.table([
          {field: 'SEQUENCE_NO', title:'Seq No'},
          {field: 'RESOURCE_ID', title:'Resource ID'},

        ],res).appendTo('#content')
      }).tooltip('show');

    });
  }
}

//SUBCON Info.
$.dui.page.coc_info = function(){
  var me = $(this);
  var idx = me.data('idx');
  var row = $('#pmr').datagrid('getRows')[idx];
  //wconsole.log(row);
  if (row.BASE_ID) {
    ajaxget('/',{_func:'coc', _sqlid:'vwltsa^prodexc' ,BASE_ID:row.BASE_ID},function(res){
      me.tooltip({
        content:eui.table([
          {field: 'COC_ID', title:'COC'},
          {field: 'COC_STATUS', title:'Status'},
          {field: 'COC_DATE', title:'Date', formatter: eui.date},
          {field: 'COC_QUANTITY', title:'COC Qty'},

        ],res).appendTo('#content')
      }).tooltip('show');

    });
  }
}

$.dui.page.cp_info = function(){
  var me = $(this);
  var idx = me.data('idx');
  var row = $('#pmr').datagrid('getRows')[idx];
  //wconsole.log(row);
  if (row.BASE_ID) {
    ajaxget('/',{_func:'cp', _sqlid:'vwltsa^prodexc' ,BASE_ID:row.BASE_ID},function(res){
      me.tooltip({
        content:eui.table([
          {field: 'CP_REF', title:'CP ID'},
          {field: 'ACTION', title:'Action'},
          {field: 'DATE_RETURN', title:'Date', formatter: eui.date},
          {field: 'BASE_ID', title:'Job'},
          {field: 'SALES_ORDER_ID', title:'SO'},
          {field: 'COC_ID', title:'COC'},
          

        ],res).appendTo('#content')
      }).tooltip('show');

    });
  }
}


$('#I_CPSHORT').combobox({
  onSelect:function(val){
    //console.log(val);
      if (val.value!='ALL') {
        var cust=$('#CUSTOMER_ID').combobox('getValue');
        if (cust=='ALL') msgbox('Please select a CUSTOMER for selection');
      }
  }
})
$('#SCH_INACTIVE_JOBS').combobox({
  onSelect:function(val){
    var tf={"y":false,"n":true}[val.value];

    $('#SCH_DAYS').combobox('readonly',tf);
    $('#SCH_DAYS').combobox('required',!tf);
  }
})


$('#CUSTOMER_ID').combobox({
  panelWidth: '250px',
  loadFilter: function(data){
    
    data.map(function(row){
      if(row.NAME) row.text = row.NAME.toUpperCase().substr(0,30);  
    })
    
    data = multisort(data,['NAME']);
    return data;  
  },
  onSelect:function(data){
    $('#CUSTOMER_NAME').textbox('setValue',data.NAME)
  }
})

$('#setall').linkbutton({
  iconCls: 'icon-reset',
  text: "Set ALL",
  onClick: function(){
    $('form#filters input.easyui-combobox').each(function(){
      var def = $(this).combobox('options').default;
      if(def) $(this).combobox('select',def) 
    })
    //$('form#filters input.easyui-combobox').combobox('select','ALL');
  }
})

$('#setwidth').linkbutton({
  iconCls: 'icon-template',
  text: "Auto-Width",
  onClick: autosize
})

$('#gofilt').linkbutton({
  iconCls: 'icon-go',
  text: "Go",
  onClick: function(){
    var tf=true;
    var cust=$('#CUSTOMER_ID').combobox('getValue');
    var cp=$('#I_CPSHORT').combobox('getValue');
    if (cp!='ALL'){
      if (cust=='ALL'){
        tf=false;
        msgbox('Please select a CUSTOMER for selection');
      }
    }
    if (tf==true){
      nodclick($(this),3000);
      var filt = $('form#filters').form('getData');
      var list=[];for(var k in filt){list.push(k+':'+filt[k])}
      putacook($.dui.page.pmrcook,list);        
      var qp = $('#pmr').datagrid('options').queryParams;
      Object.assign(qp,filt);
      $('#pmr').datagrid('reload');         
    }
 
  }
})

// main datagrid
$('#pmr').datagrid({
  url: '/?_func=get&_sqlid=vwltsa^prodexc&_dgrid=y',
  
  onBeforeLoad:function(qp){

    // prevent page load by return false.
    if(Object.keys(qp)==0 || !qp.M_STATUS) return false; 
    
    /*
    // not working.
    var cwo = getocook($.dui.page.cwid);
    for(var k in cwo){
      $('#pmr').datagrid('resizeColumn',{field:k,width:cwo[k]});  
    }
    */
  
  },
  
  onLoadSuccess: function(){
    $('tr td .icon-ship.icon-dg').off().on('click',$.dui.page.shipinfo);
    $('tr td .icon-part.icon-dg').off().on('click',$.dui.page.mat_info_opn);
    $('tr td .icon-tools.icon-dg').off().on('click',$.dui.page.subcon_info);
    $('tr td .icon-coc.icon-dg').off().on('click',$.dui.page.coc_info);
    $('tr td .icon-cprop.icon-dg').off().on('click',$.dui.page.cp_info);
  },
  
  
  loadFilter: function(data){
    
    if(!data.rows) data = {
      total:data.length ,
      rows:data,
    }
    
    var qp = $(this).datagrid('options').queryParams;
    function stat(req,val){
      switch (req){
        case 'y': if(val) return true; break;
        case 'n': if(!val) return true; break;
        case 'ALL': return true;break;
        default:
          if (req==val) return true;
      }  
    }
    
    var fdata = data.rows.filter(function(e){

      if ( 
        stat(qp.M_CNC,e.CNC_PROG)
        && stat(qp.M_COATING,e.COATING_RES)
        && stat(qp.M_GAGE,e.GAGE)
        && stat(qp.Q_NCRS,e.NCR_ID)
        && stat(qp.M_OPN_RES,e.RESOURCE_ID)
        && stat(qp.I_RAWMAT,e.USER_4)
        && stat(qp.SCH_INACTIVE_JOBS,e.INACTIVE_DAYS)
        
      )  return e;
    })
    
    return {
      rows: fdata,
      total: fdata.length 
    }
    
    /*
    var arr=data.rows;
      //Has COC Prog
      if(qp.M_CNC=='n') arr.filter(f => f.CNC_PROG=='' );
      if(qp.M_CNC=='y') arr.filter(f => f.CNC_PROG!='' );
      if(qp.M_CNC=='ALL') arr.filter( f => f.CNC_PROG );
      
      //Has Coating
      if(qp.M_COATING=='n') arr.filter( f => f.COATING_RES=='' )
      if(qp.M_COATING=='y') arr.filter( f => f.COATING_RES!='' )
      if(qp.M_COATING=='ALL') arr.filter(f => f.COATING_RES);

      //has gage
      if(qp.M_GAGE=='n') arr.filter( f => f.GAGE=='' );
      if(qp.M_GAGE=='y') arr.filter( f => f.GAGE!='' );
      if(qp.M_GAGE=='ALL')arr.filter(f => f.GAGE);
 

    data.rows=arr;
    data.total=arr.length;
    
    return data;
    */
    
  },
  
  onBeforeSelect: function(){
    return true;
  },

  /* Pagination */
  /*
  pagePosition: 'bottom',
  pagination:true,
  pageList: [50,100,150,200],
  pageSize:50,
  */
  
  singleSelect: true,
  striped: true,
  rownumbers: true,
  fitColumns: true,
  nowrap: true,
  fit: true,
  toolbar:  '#pmrtb',
  columns: [[
    
    {field:'_LISTS',title:'Lists',align:'left',formatter:lists,width:'160',fixed:false},
    /* JOB */
    {field:'WOREF',title:'Job Ref',align:'left',formatter:woref,width:'100',fixed:false},
    {field:'WO_CLASS',title:'Job Class',align:'left',width:'80',fixed:false},
    {field:'PART_ID',title:'Part ID',align:'left',width:'100',fixed:false},
    {field:'DESIRED_QTY',title:'Qty Req',align:'right',formatter:dashed,width:'60',fixed:false},
    {field:'COMPLETED_QTY',title:'Qty Comp',align:'right',formatter:dashed,width:'60',fixed:false},
    {field:'COMPLETED_AMOUNT',title:'Amt Comp',align:'right',formatter:dashed,width:'60',fixed:false},
    {field:'DESIRED_RLS_DATE',title:'Rls Date',align:'left',formatter:eui.date,width:'75',fixed:true},
    {field:'DESIRED_WANT_DATE',title:'Want Date',align:'left',formatter:eui.date,width:'75',fixed:true},
    {field:'STATUS',title:'Job Status',align:'left',width:'65',fixed:false},
    {field:'PRODUCT_CODE',title:'Prod Code',align:'left',width:'75',fixed:false},
    {field:'USER_1',title:'TPI Date',align:'left',width:'150',fixed:false},
    {field:'USER_4',title:'Raw Matl',align:'left',width:'150',fixed:false},
    {field:'USER_7',title:'Material',align:'left',width:'150',fixed:false},
    {field:'USER_9',title:'Short Desc',align:'left',formater:notes,width:'150',fixed:false},
    {field:'USER_10',title:'Notes',align:'left',formater:notes,width:'150',fixed:false},

    /* OPN   */
    {field:'OPN_WOREF',title:'Opn Ref ',align:'left',formatter:opnref,width:'140',fixed:false},    
    {field:'RESOURCE_ID',title:'Opn Resource',align:'left',width:'85',fixed:false},
    {field:'OP_STATUS',title:'Opn Status',align:'left',width:'65',fixed:false},
    {field:'OP_QTY',title:'Opn Run',align:'right',formatter:dashed,width:'60',fixed:false},
    {field:'OP_COMPLETED_QTY',title:'Opn Comp',align:'right',formatter:dashed,width:'60',fixed:false},
    {field:'RESOURCE_DESC',title:'Res Desc',align:'left',formater:notes,width:'100',fixed:false},
    {field:'SEQUENCE_NO',title:'Opn Seq#',align:'left',width:'50',fixed:false},
    {field:'PML_STATUS',title:'Opn Prog',align:'left',width:'70',fixed:false}, 
    {field:'SCHED_START_DATE',title:'Sched Start',align:'left',formatter:eui.date,width:'75',fixed:true},
    {field:'SCHED_FINISH_DATE',title:'Sched End',align:'left',formatter:eui.date,width:'75',fixed:true},
    {field:'SHIP_LATE',title:'Ship Late',align:'left',width:'75',fixed:false},   
    /* COC */
    //{field:'COC_ID',title:'COC ID',align:'left',width:'75',fixed:false},
    //{field:'COC_QUANTITY',title:'COC Qty',align:'right',formatter:dashed,width:'60',fixed:false},
    //{field:'COC_DATE',title:'COC Date',align:'left',formatter:eui.date,width:'75',fixed:true},
   // {field:'COC_STATUS',title:'COC Status',align:'left',width:'65',fixed:false},
    
    /* SALES ORDER */
    {field:'CUSTOMER_ID',title:'Cust ID',align:'left',width:'85',fixed:false},
    {field:'CUSTOMER_NAME',title:'Cust Name',align:'left',width:'100',fixed:false},
    {field:'SALES_ORDER_REF',title:'SO Ref',align:'left',formatter:soref,width:'150',fixed:false},
    {field:'SALES_ORDER_ID',title:'SO ID',align:'left',width:'150',fixed:false},
    {field:'SALES_ORDER_LINE_NO',title:'SO Line#',align:'left',width:'50',fixed:false},
    {field:'DLVY_DATE',title:'Deliv Date',align:'left',formatter:eui.date,width:'75',fixed:true,styler:dvly},
    {field:'CUSTOMER_PART_ID',title:'Cust Part',align:'left',width:'100',fixed:false},
    {field:'SOL_USER_1',title:'Prod Order #',align:'left',width:'100',fixed:false},
    {field:'SOL_USER_6',title:'Extended Desc',align:'left',width:'100',fixed:false},
    {field:'UNIT_PRICE',title:'Unit Price',align:'left',width:'75',fixed:false},
    {field:'CUSTOMER_PO',title:'Cust PO',align:'left',width:'150',fixed:false},
    {field:'CUSTOMER_PO_LINE_NO',title:'Cust PO Line#',align:'left',width:'50',fixed:false},
    /* CP */
    {field:'CP_ID',title:'CP ID',align:'left',formatter:cpref,width:'75',fixed:false},
    {field:'CP_DATE',title:'CP Date',align:'left',formatter:eui.date,width:'75',fixed:true},

    /* NCR */
    {field:'NCR_ID',title:'NCR ID',align:'left',width:'75',fixed:false},
    {field:'NCR_STATUS',title:'NCR Status',align:'left',width:'65',fixed:false},


    {field:'COATING_RES',title:'Coat Res',align:'left',width:'50',fixed:false},
    {field:'GAGE',title:'Gage',align:'left',width:'50',fixed:false},
    {field:'CNC_PROG',title:'CNC Prog',align:'left',width:'50',fixed:false},

    /* INACTIVE JOBS */
    {field:'LAST_OPN_SEQ',title:'Last Seq#',align:'left',width:'50',fixed:false},
    {field:'LAST_OPN_RESOURCE_ID',title:'Last Res',align:'left',width:'50',fixed:false},
    {field:'LAST_TX_DATE',title:'Last Tx Date',align:'left',formatter:eui.date,width:'75',fixed:true},
    {field:'NEXT_OPN_SEQ',title:'Next Seq#',align:'left',width:'50',fixed:false},
    {field:'NEXT_OPN_RESOURCE_ID',title:'Next Res',align:'left',width:'50',fixed:false},   
    {field:'INACTIVE_DAYS',title:'Inactive Days',align:'left',width:'75',fixed:false},

    {field:'_dummy',title:'',width:'20',fixed:false},
  ]]
  
}).datagrid('columns',$('#pmrtb'));

function setfilt(){
  var filts = getacook($.dui.page.pmrcook) || [];
  filts.map(function(e){
    var bits = e.split(':');
    var el = $(`form#filters input[comboname=${bits[0]}]`);
    if(el.length>0) {
      try{el.combobox('select',bits[1])}
      catch(e){cl(e);}
    }
  })
}

$( document ).ready(function() {

  $('input.easyui-combobox').combobox({
    formatter: function(row){
      return '<div class="'+row.value+'">'+row.text+'</div>';
    },
    
    onChange: function(){
      var rec = $(this).combobox('getRec');
      if(rec) $(this).next().find('.textbox-text').removeClass('y n ALL').addClass(rec.value);
    }
  })

  //setTimeout(setfilt,500);
})