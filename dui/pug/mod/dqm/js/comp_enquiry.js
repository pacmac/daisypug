
$('#gofilt').linkbutton({
    iconCls: 'icon-go',
    text: "Go",
    onClick: function(){
      var tf=true;

      if (tf==true){
        nodclick($(this),3000);
        var filt = $('form#filters').form('getData');
        //var list=[];for(var k in filt){list.push(k+':'+filt[k])}
        //putacook($.page.fn.enquirycook,list);        
        var qp = $('#enquiry').datagrid('options').queryParams;
        Object.assign(qp,filt);
        $('#enquiry').datagrid('reload');         
      }
   
    }
})

$('#DOCUMENT_TYPE').combobox({
    onSelect:function(data){
        $.page.fn.cause();
        $.page.fn.disposition_material();
    }

})
  
  // main datagrid
  $('#enquiry').datagrid({
    url: '/?_func=get&_sqlid=dqm^compliance_enquiry&_dgrid=y',
    onBeforeLoad:function(qp){
      // prevent page load by return false.
      if(Object.keys(qp)==0 || !qp.DOCUMENT_TYPE || !qp.CREATE_YR) return false; 
    
    },
    
    onLoadSuccess: function(){

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
          case 'ALL': return true;          default:
            if (req==val) return true;
        }  
      }
      
      var fdata = data.rows.filter(function(e){
        return e;
        /*
        if ( 
          stat(qp.M_CNC,e.CNC_PROG)
          && stat(qp.M_COATING,e.COATING_RES)
         && stat(qp.M_GAGE,e.GAGE)
         && stat(qp.Q_NCRS,e.NCR_ID)
          && stat(qp.M_OPN_RES,e.RESOURCE_ID)
          && stat(qp.I_RAWMAT,e.USER_4)
          && stat(qp.SCH_INACTIVE_JOBS,e.INACTIVE_DAYS)
          
        )  return e;
        */
      })
      
      return {
        rows: fdata,
        total:fdata.length 
      }
      
       
    },
    
    onBeforeSelect: function(){
      return true;
    },
  
   
    singleSelect: true,
    striped: true,
    rownumbers: true,
    fitColumns: true,
    nowrap: true,
    fit: true,
    toolbar:  '#enquirytb',
    columns: [[
      {field:"_DOC_TYPE",title:"Doc Type",hidden:true,fixed:true,width:100},
      {field:'NCR_ID',title:'Doc ID',align:'left',formatter:function(val,row,index){
        return docref(row._DOC_TYPE.toLowerCase(),val);
      },width:'100',fixed:true},
      {field:'NEXT_PERSON',title:'Next Action By',align:'left',width:'100',fixed:true},
      {field:'STATUS',title:'Status',align:'left',width:'100',fixed:true},
      {field:'STATUS_LABEL',title:'Status Detail',align:'left',width:'100',fixed:true},
      {field:'RECURRENCE',title:'Recur Probability',align:'left',width:'100',fixed:true},
      {field:'SEVERITY',title:'Severity',align:'left',width:'60',fixed:true},
      {field:'WOREF',title:'WOREF Ref',align:'left',formatter:woref,width:'120',fixed:true},
      {field:'CUSTOMER_NAME',title:'Customer Name',align:'left',width:'100',fixed:true},
      {field:'EMPLOYEE_ID',title:'Operator ID',align:'left',width:'100',fixed:true},
      {field:'DISPOSITION_MATERIAL',title:'Disposition Matl',align:'left',width:'100',fixed:true},
      {field:'DISPOSITION_DATE',title:'Disposition Date',formatter:eui.date,align:'left',width:'100',fixed:true},
      {field:'CREATE_DATE',title:'Create Date',formatter:eui.date,align:'left',width:'100',fixed:true},
      {field:'CAUSE_ID',title:'Cause ID',align:'left',width:'100',fixed:true},
      {field:'CP_NUMBER',title:'CP ID',align:'left',width:'100',fixed:true},
      {field:'ORDER_NO',title:'ORDER_NO',align:'left',width:'100',fixed:true},
      {field:'SO_ID',title:'SO ID',align:'left',width:'100',fixed:true},
      {field:'CI_TYPE',title:'CI Type',align:'left',width:'100',fixed:true},
      {field:'CI_TYPE_DESC',title:'CI Type Desc',align:'left',width:'100',fixed:true},
      {field:'ACTION_USER',title:'CI Action User',align:'left',width:'100',fixed:true},
      {field:'ACTION_DATE',title:'CI Action Date',formatter:eui.date,align:'left',width:'100',fixed:true},

    ]]
    
  }).datagrid('columns',$('#enquirytb'));

$.page.fn.disposition_material=function(){
  doctype=$('#DOCUMENT_TYPE').combobox('getValue').toLowerCase();
 // console.log('disposition_material:'+doctype);
  if(doctype=="all")$('#DISPOSITION_MATERIAL').combobox({data:[]});
  else {
    ajaxget('/',{_sqlid:'admin^bhave',_func:'get',appid:`dqm^comp^${doctype}_man`},function(data){
     // console.log('disposition_material:'+JSON.parse(data.DISPOSITION_MATERIAL));
      if (data.DISPOSITION_MATERIAL){
        $('#DISPOSITION_MATERIAL').combobox({data:JSON.parse(data.DISPOSITION_MATERIAL)});
      }
      else $('#DISPOSITION_MATERIAL').combobox({data:[]});

    })    
  }
}

function woref(str){
  if(!str) return '';
  var val=str.replace(/\^/g,'.');
  var docid=val.replace(/\^/g,'.').split('.');
  var url = `vwltsa^sa_jobman&WOREF=${docid[0]}`;
  return `<a href="javascript:newtab('${url}');"><span>${val}</span></a>`;
}
function soref(str){
  if(!str) return '';
  var val=str.replace(/\^/g,'.');
  var docid=val.replace(/\^/g,'.').split('.');
  var url = `sales^sa_sorder&ID=${docid[0]}`;
  return `<a href="javascript:newtab('${url}');"><span>${val}</span></a>`;
}

function docref(doctype,str){
  if(!str) return '';
  var val=str.replace(/\^/g,'.');
  var docid=val.replace(/\^/g,'.').split('.');
  if (doctype.toLowerCase()=="ci")var url = `dqm^comp^${doctype}_man&ID=${docid[0]}`;
  else var url = `dqm^comp^${doctype}_man&NCR_ID=${docid[0]}`;
  return `<a href="javascript:newtab('${url}');"><span>${val}</span></a>`;
}


$.page.fn.cause=function(){
  doctype=$('#DOCUMENT_TYPE').combobox('getValue').toLowerCase();
  if (doctype=='ncr') doctype='';
  if (doctype!="all") $('#CAUSE').combobox('reload',`/?_func=get&_sqlid=dqm^${doctype}cause`);
  else $('#CAUSE').combobox('clear');
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
    $.page.fn.disposition_material();

    //setTimeout(setfilt,500);
})