cl = console.log;


$.dui.page.status = function(){
  var data = $.dui.page.getform();  
  var frm = $('form#main');
  var dg = $('#release');
  if(data.date != '') {
    frm.form('disable');
    dg.datagrid('readonly',true);  
  } else {
    frm.form('enable');
    dg.datagrid('readonly',false); 
  }
}

$('#main').form();

  $('#sendmail').linkbutton({
    iconCls: 'icon-email',
    text: 'Send',
    onClick: function(){
      var rversion = $('#rver').combobox('getValue');
      var rstatus = $('#status').combobox('getValue');
      if (rversion){
        if (rstatus=='R'){
          var vars = {_sqlid:'admin^release_oneshotevent',_func:'add',rver:rversion};
          ajaxget('/',vars,function(res){alert(res.msg);})
        }
        else  msgbox("You cannot send non-release version.");
      }
      else msgbox("Release version cannot be blank.");
    }
  })


/* commented by claude 260220 — interferes with toolbar-plugin
// Override default handler
$('#but_add').linkbutton({
  onClick: function(){
    ajaxget('/',{_func:'add',_sqlid:'admin^release'},function(data){
      $('#rver').combobox('reload');
      setTimeout(function(){
        $('#main').form('load',data);
        $('#release').datagrid('loadData',[]);
        butEn('sx');
      },250);

      $.dui.page.istat = data.status;
    })
  }
});

// Override default handler
$("#but_save").linkbutton({
  onClick: function(){
    var data = $.dui.page.getform();
    data._sqlid = 'admin^release';
    data._func = 'put';
    if($.dui.page.istat != data.status) data._func = 'status';
    ajaxget('/',data,function(res){
      $.dui.page.istat = data.status;
      cl(res);
    })
  }

});
*/

$('#type').combobox({
  panelHeight: 'auto',
  data: [
    {text:"PERIODIC",value:'P'},
    {text:"CRITICAL",value:'C'}
  ]
})

$('#status').combobox({
  panelHeight: 'auto',
  data: [
    {text:"PENDING",value:'P'},
    {text:"RELEASED",value:'R'}
  ]
})

$('#rver').combobox({
  
  url:'/',
  
  queryParams: {
    _func:'get',
    _sqlid:'admin^release'
  },
  
  loadFilter: function(data){
    $(this).combobox('options').dgdata = data;
    var dgdata={}, arr = [];
    for(var k in data){
      arr.push({text:k,value:k}); 
    }
    return arr;
  }, 
  
  onSelect:function(rec){
    var dgdata = [];
    var data = $(this).combobox('options').dgdata[rec.value]; 
    
    // TODO - use form.load()
    $('#status').combobox('setValue',data.status);
    $('#notes').textbox('setValue',data.notes);
    $('#type').combobox('setValue',data.type);
    $('#date').datebox('setValue',data.date);
    
    data.files.map(function(file){
      //var mf = $.dui.page.modfile(file.id);  
      dgdata.push({
        fn:file.id,
        fver:file.ver,
        fnotes: file.notes
      })       
      
    })
    
    $('#release').datagrid('loadData',dgdata);
    butEn('asxp');  // enable buttons
    
    // set initial status
    $.dui.page.istat = data.status;
    $.dui.page.status();

  }
})

$.dui.page.getform = function(){
  return $('#main').form('getData');
}

$.dui.page.modfile = function(path){
  var bits = path.split('/');   
  return{
    fn: bits.splice(-1)[0], 
    mod: bits.join('/')
  }
}

$.dui.page.fnotes = {
  type:'textbox',
  
  options:{
    'multiline':true,
    height: 100,
    required: true,
  }  
  
}

$.dui.page.files = {
  
  type: 'combobox',
  options: {
    groupField: 'mod',
    required: true,
    _panelWidth:250,
    panelHeight:200,
    editable:false,
    url: '/',
    queryParams: {
      _func:'get',
      _sqlid: 'admin^versions',
      _combo: 'y'
    }, 
    
    loadFilter: function(idata){
      var rdata = [];
      for(var file in idata.files){
        var mf = $.dui.page.modfile(file);
        rdata.push({
          text: mf.fn+' ('+idata.files[file].ver+')',
          value: file,
          ver: idata.files[file].ver,
          status: idata.files[file].status,
          mod: mf.mod,
          fn: mf.fn
        })    
      }
      // cl(rdata);
      butEn('ax');

      
      return multisort(rdata,['mod','fn']); 
    },
    
    onSelect: function(rec){
      $('input[name=fver]').val(rec.ver);
    }
  }
}


$('#release').datagrid({
  rownumbers: true,
  fitColumns:true,
  striped:true,
  fit:true,
  //selectOnCheck: true,
  columns: [[
    //{field:'_edit', checkbox:true},
    {field:'fn', width:200,fixed:true,order:'asc',title:'File Path',editor:$.dui.page.files},
    {field:'fver', width:70,fixed:true,order:'asc',title:'File Ver'},
    {field:'fnotes', width:1000,fixed:false,order:'asc',title:'Change Details',editor:$.dui.page.fnotes}
  ]],
  
  onSelect: function(){
    var opt = $(this).datagrid('options');
    if(!$.dui.page.editor) $(this).datagrid('unselectAll');
  },

  onEndEdit: function(idx,row,chg){
    //{_func: "add", fver: "2.2.1839", _edit: "", fn: "app.js", fnotes: "Test"}
    var data = $.dui.page.getform();
    delete(row._edit)
    row.rver = data.rver;
    row._sqlid = 'admin^release';
    row._func = 'put';
    ajaxget('/',row,function(res){
      cl(res);  
    })
  }  
  
});

// only add controls to dev system.
if($.dui.page.editor) $('#release').datagrid('rowEditor',{
  editor: 'form',
  addData:{},
}); 
