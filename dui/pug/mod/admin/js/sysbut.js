toolbut([

  {
    id:'but_user_msg',
    text: 'Message',
    noText: true,
    iconCls: 'icon-alert',
    disabled: true,
    onClick: function(){
     
      var dlg = dynDialog(
        {
          id:'user_msg',
          title:'Send User Message',
          fields:[
            {
              'id':'user_msg_text',
              'type':'textbox',
              'label':{text:'Message',style:'vertical-align:top;'},
              'data-options':{multiline:true,value:'Dear $userid;\n\nCan you please log out briefly so we can apply some updates.\n\nThank You.'},
              'style':'Height:100px;'
            }
          ]
        },
        [
          {
            iconCls:'icon-go',
            text: 'Send',
            onClick: function(){
              var dg = $('#logins'); 
              var rows = []; dg.datagrid('getSelections').map(function(e){rows.push(e.uid)});
              ajaxget('/',{_func:'usermsg',userid:rows.join('^'),msg:$('input[textboxname=user_msg_text]').textbox('getValue')},function(res){
                if(!res) msgbox('Error sending message.');
                $('#user_msg').dialog('close');
                dg.datagrid('unselectAll');
                $('#but_user_logout, #but_user_msg').linkbutton('disable');
              })
            }
          }
          
        ]
      )
      dlg.dialog('open');
    }
  },

  {
    id:'but_user_logout',
    text: 'Logout',
    noText: true,
    iconCls: 'icon-logout',
    disabled: true,
    onClick: function(){
      var rows = []; $('#logins').datagrid('getSelections').map(function(e){rows.push(e.uid)});
      ajaxget('/',{_func:'logout',userids:rows.join(',')},function(res){
        alert(res.msg);
        $('#logins').datagrid('reload');
      })

    }
  },
  
  {},
  
  {
    id:'but_debug',
    text: 'Debug',
    noText: true,
    iconCls: 'icon-bug',
    disabled: false,
    onClick: function(evt){
      ajaxget('/',{_func:'debug'},function(res){
        msgbox(res.msg);
      })
    }
  }, 
 
  {
    id:'but_nologins',
    text: 'No Logins',
    noText: true,
    iconCls: 'icon-lock',
    toggle: true,
    disabled: false,
    onClick: function(evt){
      var me = $(this);
      ajaxget('/',{_func:'nologins','status':me.linkbutton('options').selected},function(res){
        if(res.msg) var msg = 'Logins disabled.'; else var msg = 'Logins enabled.';
        alert(msg);
      })
    }
  },

  {
    id:'but_restart',
    text: 'Restart',
    noText: true,
    iconCls: 'icon-engine',
    disabled: false,
    onClick: function(){
      function go(all){
        // this won't work as msqlid must have __sqlid and index.js checks isadmin.
        if(all) var vars = {_func:'multisqlid', __func:'restart'};
        else var vars = {_func:'restart'};    
        ajaxget('/',vars,function(res){
          alert(res.msg);
        })
      }
      
      $.messager.confirm({
      	title: 'Pure Engine Restart',
      	msg: 'Restart all Engines ?',
      	ok: 'Yes',
      	cancel: 'No',
      	fn: go
      });

    }
  },
  
  {
    id:'but_clrcache',
    text: 'Clear Cache',
    noText: true,
    iconCls: 'icon-dbdel',
    disabled: false,
    onClick: function(evt){
      var me = $(this);
      ajaxget('/',{_func:'clrcache'},function(res){
        alert(res.msg);
      })
    }
  },  

  {},
  
  {
    type: 'menubutton',
    id:'but_modreload',
    text: 'Reload Module',
    noText: true,
    iconCls: 'icon-module-go',
    disabled: false,
    onClick: function(evt){
      var me = $(this);
      ajaxget('/',{_func:'clrcache'},function(res){
        alert(res.msg);
      })
    }
  }, 
  
  ]);