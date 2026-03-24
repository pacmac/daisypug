// update on file or app change. 
/*
$.dui.page.idupdate = function(){
  return;
  var file = $('#ifile').textbox('getValue');
  var app = $('#appid').combobox('getValue');
  var repid = app+'^'+file; 
  $('#repid').textbox('setValue',repid);      
}
*/

$.dui.page.clear = function(nots){
  var inps = $('#repform').find('input.textbox-f').not(nots);
  inps.textbox('clear');
  $('#def_dload').linkbutton('disable');
  
}

$.dui.page.locn = function(fname){
  //setTimeout(function(){
    //fname = fname || $('#ifile').textbox('getValue');
    //cl(fname);
    ajaxget('/',{
      _sqlid:'admin^rep_locn',
      _func: 'get',
      fname: fname+'.prpt'
    },function(exi){
      //cl(exi);
      for(var key in exi){
        $('#'+key).prop('checked',exi[key]);
      }
    })    
  //},500)
}

// upload template
$.dui.page.upload = function(){
  $('#filewin').window('open');
  var desc = $('#fileup #uldesc')
  var locn = $('#class').combobox('getValue');
  desc.textbox('setValue',locn).textbox('readonly','true');
  $.dui.page.locn();
}

// after upload
$.dui.page.onUploaded = function(res,data){
  var ifile = $('#ifile');
  var cur = ifile.textbox('getValue');
  var upf = data.fname.split('.')[0].replace('C:\\fakepath\\','');
  var rid = $('#app').val();
  var nid = rid+='^'+upf;
  var frm = $('#repform');
  
  ifile.textbox('setValue',upf);  

  if(upf != cur){
    if(frm.attr('mode')=='upd') {
      confirm(function(yn){
        if(yn) msgbox('File name has changed, please save report.')
      })
    }
  }     
      
  /*
  
  if(upf != cur){
    // only trigger when updating.
    if(frm.attr('mode')=='upd') {
      confirm(function(yn){
        if(yn) {
          ifile.textbox('setValue',upf);
          $('#_newid').val(nid);
          but_save();
        } else {
          $('#_newid').val('');
        }   
      },'File name changed, update report & users ?');
    }
    else ifile.textbox('setValue',upf);
  }
  //cl(data); // fname
  */ 
}

$.dui.page.load = function(){  
  ajaxget('/?_sqlid=admin^menus&_func=get',{},function(menu){
    var modcbo = [];
    menu.map(function(e){
      var mod = {
        value: e.id,
        text: e.text,
        children:[]  
      }
      
      e.children.map(function(ch0){

        if(ch0.children) ch0.children.map(function(ch1){
          mod.children.push({
            value: ch1.id,
            text: ch1.text  
          });              
        })
        
        else mod.children.push({
          value: ch0.id,
          text: ch0.text,
          iconCls: ch0.iconCls  
        }); 
            
      })
      
      modcbo.push(mod); 
    })
    
    $('#modid').combobox({
      panelHeight: 'auto',
      data: modcbo,
      formatter: function(row){
        return row.text+' ('+row.children.length+')';  
      },
      onSelect: function(rec){
        //$('#repform').form('clear');
        $.dui.page.clear('#modid');
        $('#id').combobox('clear').combobox('loadData',[]);
        $('#appid').combobox('clear').combobox('loadData',rec.children).combobox('readonly',false);  
        
        
      }
    })
  })
}

// set ID for new reports
$.dui.page.setid = function(id){
  var etxt = $('.edit-text .textbox-text');
  if(etxt.is(':visible')) {
    etxt.addClass('lock').val(id);
    $('input[name=id]').val(id);
  } 
}

$.dui.page.load();
$.page.ready(function(){

  toolbut([ 
    {
      id: 'def_dload',
      text: 'JSON',
      noText: false,
      disabled: true,
      iconCls: 'icon-download',
      onClick: function(){
        var frm = $('#repform');
        var fdat = frm2dic(frm);
        delete (fdat.rowid);
        for(var k in fdat){if(fdat[k]=='') delete fdat[k]}
        fdat.ifile = $('#ifile').textbox('getValue'); 
        fdat._appid = 'admin^reports';
        jsonSave(fdat,fdat.id+'.json');
      }
    },
      {
      id: 'def_upload',
      text: 'JSON',
      noText: false,
      disabled: false,
      iconCls: 'icon-upload',
      onClick: function(){
        jsonLoad(function(data){
          if(data._appid != 'admin^reports') return msgbox('Incompatible file.');
          var frm=$('#repform');
          var exists = $('#id').combobox('exists',data.id);
          if(!exists) {
            but_add();

          }            
          setTimeout(function(){
          frm.form('clear');
          var mod = data.app.split('^')[0]; 
          $('#modid').combobox('select',mod);
          setTimeout(function(){
            $('#appid').combobox('select',data.app);
            frm.form('preload',data);
            $.dui.page.setid(data.id);
  
          },100);

          });
          butEn('asdx');
        })
      }
    },{} 
    
  ])

  $('#but_add').on('done',function(){

    confirm(function(yn){
      if (yn){
   
      }
    },'Add new custom report?');

    var upl = $('#pho_upload');
    upl.linkbutton('enable');
    $('.edit-text .textbox-text').removeClass('lock');   
  })

  $('#ifile').textbox({
    onChange: function(nv,ov){
      var appid = $('#appid').combobox('getValue');
      var mode = $('#repform').attr('mode');
      if(mode=='add') $.dui.page.setid(appid+'^'+nv); 
      $.dui.page.locn(nv);  
    },
    
    editable: false,
    icons: [
      {
        iconCls:'icon-upload',
        handler: function(){
          var cls = $('#class').combobox('getValue');
          var app = $('#appid').combobox('getValue');
          if(!app) return msgbox('Please select Application.');
          else if(!cls) return msgbox('Please select UPLOAD folder.');
          $.dui.page.upload();
        }
      },{
        iconCls:'icon-download',
        handler: function(e){
          var fname = $('#ifile').textbox('getValue');
          var cls = $('#class').combobox('getValue');
          var ok = $('#'+cls).is(':checked');
          if(!app) return msgbox('Please select Application.');
          else if(!cls) return msgbox('Please select DOWNLOAD folder.');
          else if(!ok) return msgbox('No '+cls+' file to download.');
          window.location = '/?_func=phdl&fname='+fname+'&class='+cls;            
        }
      },{
        iconCls:'icon-delete',
        handler: function(e){
          var fname = $('#ifile').textbox('getValue');
          var cls = $('#class').combobox('getValue');
          var ok = $('#'+cls).is(':checked');
          if(!app) return msgbox('Please select Application.');
          else if(!cls) return msgbox('Please select DELETE folder.');
          else if(!ok) return msgbox('No '+cls+' file to DELETE.');
          else if(cls=='standard') return msgbox('Cannot delete standard report');
          ajaxget('/',{
            '_func': 'phdel',
            'fname': fname,
            'class':cls    
          },function(res){
            $.dui.page.locn(fname);
            msgbox(res.msg);  
          })           
        }
      }
    ]

  })

  $('#engine').combobox({
    panelHeight: 'auto',
    validType:['inList'],
    data:[
      {text:'Pentaho BI',value:'pentaho-bi'},
      {text:'Pure Pentaho',value:'pure'},
    ]
  })
    //  {text:'Standard Report',value:'standard'},
    //{text:'Site Report',value:'site'}
  $('#class').combobox({
    panelHeight: 'auto',
    validType:['inList'],
    editable:false,
    data:[
      {text:'Site Report',value:'site'},
      {text:'Group Report',value:'group'},
     
    ]
  })
  
  $('#repform').on('done',function(jq,data){
    $('textarea.textbox-text').css('color','transparent');
    var newid = $('#_newid').val();
    if(newid) reload();
    $('#def_dload, #def_upload').linkbutton('enable'); 
    setTimeout(function(){
      if(data.fsql) $('#fsql').textbox('setValue',JSON.stringify(data.fsql,null,4));
      $('textarea.textbox-text').css('color','initial');

      if(data.fsql) $('#dgfields').datagrid('loadData',{"total":data.fsql.length,"rows":data.fsql});
      
    },200);
    
  }).on('success',function(){
      
  })

  $('#id').combobox({
    url:'/',
    
    queryParams: {
      _func:'get',
      _sqlid:'admin^templates',
     
      _combo: 'y',
      app:''
    },
    
    onBeforeLoad: function(qp){
      if(!qp.app) return false;
    },
    
    _groupField: 'app',
    groupFormatter: function(grp){
      return grp.split('^').splice(-1)[0];  
    },
    
    formatter: function(row){
      return row.text.replace(row.app+'^','');  
    }       
  })

  $('#appid').combobox({
    readonly:true,
    onSelect: function(rec){
      var frm = $('#repform');
      $.dui.page.clear('#modid, #appid');
      $('#id').combobox('readonly',false);
      $('#id').combobox('options').queryParams.app = rec.value; 
      $('#id').combobox('reload');
      $('#app').val(rec.value);
      $.dui.page.setid(rec.value+'^');
    }
  })
})