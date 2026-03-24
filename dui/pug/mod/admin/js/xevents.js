/*
  CLS, 20171102, VERSION 2.2.65
  added new column,REPLY_STAMP, in to XTRANS datagrid

*/
$.dui.page.xevts = {
	//$('#xevts').datagrid({
		editor: 'form',	
		striped: true,
		rownumbers: true,

	    singleSelect:true,

	    url: '/?_func=get&_sqlid=admin^xevents',
	    columns:[[
	      {field:"ID", title:"Id", width:150,editor:{type:'textbox',options:{readonly:true}}},
	      {field:"ENABLED", title:"Enabled", width:50,editor:{type:'combobox',options:{editable:false,"data":[{"value":"1","text":"Yes","selected":true},{"value":"0","text":"No"}]}}},
	      {field:"MODE" , title:"Mode", width:50,editor:{type:'combobox',options:{readonly:true,"data":[{"value":"realtime","text":"realtime","selected":true},{"value":"batch","text":"batch"}]}}},
	      {field:"TIME", title:"Event Time", width:60,editor:{type:'textbox',options:{readonly:true}}},
	      {field:"_SQLID", title:"SqlId", width:150,editor:{type:'textbox',options:{readonly:true}}},
	      {field:"_FUNC", title:"Func", width:30,readonly:true,editor:{type:'combobox',options:{readonly:true,"data":[{"value":"get","text":"get","selected":true},{"value":"upd","text":"upd"},{"value":"del","text":"del"}]}}},
	      {field:"URL", title:"EndPoint", width:1000,editor:{type:'textbox',options:{readonly:true,multiline:true,height:200}}},
	    ]],
	      onEndEdit: function(idx,row,chg){        
          var url = "/?_sqlid=admin^xevents";
          var data = clone(row);
          ajaxget(url,data,function(data){})       
  }

//	});
}

$('#xtrx').datagrid({
		rownumbers: true,
      toolbar:'#tbar',
      fit:true,
      fitColumns:true,
      queryParams: frm2dic($('form#gfilter')),
      checkOnSelect:false,
      singleSelect:true,
      method: 'get',
      striped:true,
    url: '/?_func=get&_sqlid=admin^xtrans',
    columns:[[
      {field:"SITE_ID", title:"Site ID", width:100},
      {field:"USER_ID", title:"User ID", width:100},
      {field:"CREATE_STAMP", title:"Create Time", width:160},
      {field:"TYPE" , title:"Type", width:100},
      {field:"SQL_ID" , title:"SqlId", width:180},
      {field:"SENT_STAMP", title:"Sent Time", width:160,formatter:datetimef},
      {field:"REPLY_STAMP", title:"Reply Time", width:160,formatter:datetimef},
      {field:"JSON_DATA", title:"JSON Data", width:500},
      {field:"ERROR_MSG", title:"Error", width:500},

    ]],
})

$('#xhstry').datagrid({
    readonly: true,
    url: '/?_func=get&_sqlid=admin^xhistory',
    columns:[[
      {field:"DATA_DEFINITION", title:"Type", width:150},
      {field:"DOCUMENT_ID" , title:"Doc Id", width:150},

    ]]
});

$.dui.page.siteids=function(){
  ajaxget('/',{'_func':"get",'_sqlid':'admin^siteids'},function(rs){
    var sites=[];
    for (var i  in rs){
      //console.log(rs[i]);
      if (rs[i].value=='MYDEV') sites.push({value:"ERPVM",text:"ERPVM"});
      else sites.push({value:rs[i].value.toUpperCase(),text:rs[i].text.toUpperCase()});
    }
    $('#tbar form#gfilter #siteid').combobox('loadData',sites);
   // return sites;
  })
}

$.page.ready(function(){
  var dg = $('#xevts'); 
  var dg1=$('#xtrx');
  dg.datagrid('rowEditor',$.dui.page.xevts);   
  $('#xevts').datagrid('reload');
  $('#xtrx').datagrid('reload');
  //$('#xhstry').datagrid('reload');

  $('form#gfilter').form({
    onChange:function(){
      $('#xtrx').datagrid('reload',frm2dic($('form#gfilter')));  
    }
  }) 
dg.datagrid('columns',$('#dgre_tb'));
  $.dui.page.siteids();
 // dg.datagrid('options').tbar.dgre_add.linkbutton('disable');
 // dg.datagrid('columns',$('#dgre_tb'));

  

})