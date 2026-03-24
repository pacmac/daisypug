
$.page.ready(function () {
/*
  CLS, 180208, 2.2.169
  added Part ID qbe and Product Code combobox
*/

$.page.fn.docref = function(val,row){
	if(val)var v = val.replace(/\^/g,'.');
	else return '';
  var docid=v.split('.');
  if(row.PLAN_TYPE=='Supply'){
    if (val==row.DD_REF) {
      var cls = 'demand';
      var url ="vwltsa^sa_sorder&ID="+docid[0];
    }

    if (val==row.SS_REF) {
      var cls = 'supply';
      if (row.DOC_TYPE=='Job') var url="vwltsa^sa_jobman&WOREF="+docid[0];
      if (row.DOC_TYPE=='PO') var url="inv^purchase_order_list";
    }

  }

  if(row.PLAN_TYPE=='Demand') {
    var cls = 'demand';
    if (row.DOC_TYPE=='SO') var url ="sales^sa_sorder&ID="+docid[0];
    if (row.DOC_TYPE=='Opn'||row.DOC_TYPE=='Job') var url ="vwltsa^sa_jobman&WOREF="+docid[0];
  }

  // ### use linkwin to open in a NEW tab ###
  return "<a href='javascript:newtab(\""+url+"\");'><span class='"+cls+"'>"+v+"</span></a>";
}

$.page.fn.integer = function(val){
  var v = parseInt(val);
  if(isNaN(v)) return '';
  v = v.toLocaleString();
  if(val<0) return '<span class="negative">'+v+'</span>';
  return v;
}

$.page.fn.ssdd = function(val,row){
  var v = parseInt(val);
  if(isNaN(v) || v===0) return '';
  v = v.toLocaleString();
  if(row.PLAN_TYPE=='Supply') return '<span class="supply">'+v+'</span>';
  if(row.PLAN_TYPE=='Demand') return '<span class="demand">'+v+'</span>';
}

$.page.fn.dd = function(val,row){
  var v = parseInt(val);
  if(isNaN(v) || v===0) return '';
  v = v.toLocaleString();
  return '<span class="demand">'+v+'</span>';
}

$.page.fn.ss = function(val,row){
  var v = parseInt(val);
  if(isNaN(v) || v===0) return '';
  v = v.toLocaleString();
  return '<span class="supply">'+v+'</span>';
}

$.page.fn.date = function(val){
  if (!val) return '';
  var d = new Date(val);
  if (isNaN(d.getTime())) return val;
  var mm = ('0' + (d.getMonth() + 1)).slice(-2);
  var dd = ('0' + d.getDate()).slice(-2);
  return d.getFullYear() + '-' + mm + '-' + dd;
}

$.page.fn.upperCase = function(val){
  return val ? val.toUpperCase() : '';
}

$.page.fn.opts = {
  rowStyler:function(index,row){
    if (row.PART_ID){
      return {class:'partrow'};
    }
  },
  queryParams: frm2dic($('form#partplan_filter')),
  onLoadSuccess:function(data){
   // console.log(data)
  }
};
$('#partplan').datagrid($.page.fn.opts);

$(document).ready(function(){

  $('form#partplan_filter #PART_ID_').qbe({
    defid:'part',
  })

  $('form#partplan_filter').form({
    onChange:function(){
      $('#partplan').datagrid('reload',frm2dic($('form#partplan_filter')));
    }
  })

})

});  // $.page.ready
