
$.page.ready(function () {
/*
  171025 2.2.127
  1. Added Group Files
  2. Modified Public (Site) to work same as Group.

  171108 PAC 2.2.130
  1. Changed onBeforeSelect() to disallow upload of files to folder with subfolders.
  2. Clicking a folder with sub-folders will now expand it.

  171110 PAC 2.2.140
  1. Fixed bug with 171108 item 1 where unable to add folders. now enable/disable upload button instead.
  
*/


$.page.fn.fgOnCheck = function(idx,row){
  return;
  row._func = 'upd';
  $('form#file').form('load',row);
  $.page.fn.frmen('file');
  $('#filesave').linkbutton('enable');  
}

$.page.fn.fgOnRowContextMenu = function(evt,idx,row){
  $('#dgmenu').menu('show', {
    left: evt.pageX,
    top: evt.pageY
  });
}

$('#dgmenu').menu({
  onClick: function(item){
    var opt = $(this).menu('options');
    var row = $('#files').datagrid('getSelected');
    if(item.name=='fedit'){
      row._func = 'upd';
      if(row.appid.indexOf('sys')==0) $('input#fname').textbox('readonly',true);
      else $('input#fname').textbox('readonly',false);
      $('form#file').form('load',row);
      $.page.fn.frmen('file',{x:opt.left,y:opt.top});
      $('#filesave').linkbutton('enable');    
    }
  }
})

$('#trmenu').menu({
  onClick: function(item){
    var opt = $(this).menu('options');
    var files = $('#files').datagrid('getRows');
    var msg=''; if(files.length) msg=' as files exist.';
    var node = $('#folds').tree('getSelected');
    
    
    if(item.name=='fdel'){
      if(node.id=='pub') msgbox('Cannot delete folder')
      else if(files.length > 0 || (node.children && node.children.length >0)) msgbox('Delete files or folders first.')
      else {
        confirm(function(yn){
          if(yn){
            ajaxget('/',{'_func':'del','_sqlid':'admin^dir','id':node.appid},function(res){
              alert(res.msg);
              $.page.fn.frmen();
              $('#folds').tree('remove',node.target);
            })
          }
        })
      }
      return;
    }
    
    else if(item.name=='fedit'){
      $('#folds').tree('update',{'target':node.target,'_func':'upd'});
      var newn = node;
      var data = {
        'id':node.appid,
        'name':node.text,
        'icon':node.iconCls,
        '_func':node._func,
        'prefix': node.prefix,
        'next_number': node.next_number
      };
    } 
    
    else if(item.name=='fadd'){
      if(msg) return msgbox('Cannot add folder'+msg);
      var bit = new Date().getTime().toString();
      var appid= node.appid+'^' + bit;
      $('#folds').tree('append', {
        'parent': node.target,
        'data': [{'bit':bit,'appid':appid,'id':appid,'text':'New Folder','children':[],'_func':'add'}]
      });
      
      // get the newly added node.
      var newn = $('#folds').tree('find',appid);
      $('#folds').tree('select',newn.target);
      var data = {'id':newn.id,'name':newn.text,'icon':'icon-folder','_func':newn._func};
    }
    
    //cl(data);
    
    //common
    $.page.fn.frmen('fold',{x:opt.left,y:opt.top});
    $('form#fold').form('load',data);
    $('#foldsave').linkbutton('enable');      
  } 
})

// SHOW / HIDE EDIT FORM
$.page.fn.frmen = function(type,xy){
  var ff = $('#filefold'); 
  if(!type) {
    $('#fold').fadeOut();
    $('#file').fadeOut();
    ff.window('close');  
    return;
  }
  var ed = {
    'fold':{ena:'#fold',dis:'#file'},
    'file':{ena:'#file',dis:'#fold'}
  }
  if(xy) ff.window('move',{'left':xy.x,'top':xy.y});
  $(ed[type].ena).show();
  $(ed[type].dis).hide();
  ff.window('open');   
}

$(document).ready(function(){
  
  setTimeout(function(){
    $('#files').datagrid('showColumn','appdoc').datagrid('showColumn','revn');
    $('#but_upload').linkbutton('disable');
    $('#but_select').linkbutton('disable');
  },100)

})

$('#filesave').linkbutton({
  iconCls:'icon-save',
  disabled:true,
  onClick: function(){
     var but = $(this);
     but.linkbutton('disable');
     $('form#file').form('submit');
     $('form#file').form({
        success:function(res){
          alert(JSON.parse(res).msg);
          $('#files').datagrid('uncheckAll');
          $('#files').datagrid('reload');
          $.page.fn.frmen(); 
        }   
     })   
  }
})

$('#foldsave').linkbutton({
  iconCls:'icon-save',
  disabled:true,
  onClick: function(){
    // add or update ?
    
    // /?id=101&_func=upd&_sqlid=admin%5Edir&name=ISO-XX&icon=icon-xls
    
    var but = $(this);
    var fdat = frm2dic($('form#fold'));
    but.linkbutton('disable');
    
    ajaxget('/',fdat,function(res){
      var node = $('#folds').tree('getSelected');
      var ndat = {
        'target':node.target,
        'text':fdat.name,
        'iconCls': fdat.icon,
        '_func':null
      }
      
      // TODO
      return reload();
      
      $('#folds').tree('update',ndat); //.tree('reload',node.target);
      
      but.linkbutton('enable');
      $.page.fn.frmen(); 
    })
  }   
});

/* ## TREE */
$('#folds').tree({
  
  init: false,
  url: '/?_sqlid=admin^dir_tree&_func=get',
  title:'Folders',

  loadFilter:function(data){
    return data;  
  },

  onLoadSuccess: function(node,data){
    var opt = $(this).tree('options');
    if(!opt.init) $(this).tree('collapseAll');
    opt.init = true;  
  },
  
  onContextMenu:function(e,node){
    e.preventDefault();
    var sel = $(this).tree('getSelected');
    if(sel && sel.id != node.id) $(this).tree('select', node.target).tree('expand', node.target);
    if(node.appid.indexOf('mod')==0 || node.appid.indexOf('sys')==0 ) return false;
    $('#trmenu').menu('show', {
      left: e.pageX,
      top: e.pageY
    });
  },
  
  onBeforeSelect:function(node){
    var sel = $('#folds').tree('getSelected');
    if(sel && (sel._func || node.id==sel.id)) return false;
  },
  
  onSelect: function(node){
    var endis='enable'; if(node.children && node.children.length) endis = 'disable';
    $('#but_upload').linkbutton(endis);
    var appid = node.appid.replace('mod^','');
    if(node.appid && ! node.children.length){
      $.page.fn.frmen();
      $('#upform').data('appid',appid);
      $('#files').datagrid('appFiles',appid);
    }
  }
})

$('#icon').combobox({
  editable:false,
  panelHeight:'auto',
  formatter:function(row){
    var img = '../icons/'+row.icon;
    var cls = 'item-text'; if(row.d) cls += ' disxls';
    return '<img class="item-img" src="'+img+'"/><span class="'+cls+'" style="padding-left:6px;">'+row.text+'</span>';
  },
  
  data:[
    {icon:'folder.png', text:'Folder',value:'icon-folder'},
    {icon:'xls.png', text:'Spreadsheets',value:'icon-xls'},
    {icon:'img.png', text:'Image Files',value:'icon-img'},
    {icon:'pdf.png', text:'PDF Documents',value:'icon-pdf'},
    {icon:'ppt.png', text:'Powerpoints',value:'icon-ppt'},
    {icon:'doc.png', text:'Text Documents',value:'icon-doc'},
    {icon:'zip.png', text:'Compressed Files',value:'icon-zip'}
  ],
  
  onSelect: function(rec){
    //$('label.icon-r').removeClass('icon-*').addClass('icon-r '+rec.value);
  }

})


});  // $.page.ready
