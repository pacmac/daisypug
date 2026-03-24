$.page.ready(function() {

  $.page.register({
    hooks: {
      afterSave: function(result) {
        if (result && result.error) msgbox(result.msg);
        else {
          msgbox('Please logout and login again.');
          butEn('sx');
        }
      }
    },
    fn: {
      icons: function(me, node, chk) {
        if (!node.children) me.tree('update', {
          target: node.target,
          iconCls: chk ? 'icon-tick' : 'icon-cross'
        });
      },
      apps: function(tree) {
        if (!tree) return;
        var apps = [], idx = {};
        tree.map(function(e) {
          var id = e.appid || e.id.split('^')[0];
          var name = _pref_appids[id];
          if (!name) return;
          if (!idx[id]) idx[id] = {
            id: id,
            text: _pref_appids[id].text,
            iconCls: _pref_appids[id].iconCls,
            children: []
          };
          idx[id].children.push({
            id: e.id,
            text: e.name,
            iconCls: e.iconCls,
            checked: true,
            enabled: e.enabled
          });
        });
        for (var key in idx) apps.push(idx[key]);
        apps.sort();
        return apps;
      },
      evselect: function(req) {
        $('ul#events').tree('getChecked').map(function(n) {
          if (n.id == $.dui.doc.ref) {
            $('ul#events').tree('uncheck', n.target);
          }
        });
        delete $.dui.doc;
      }
    }
  });

  // user-EVENTS tree
  $('ul#events').tree({
    data: _pref_uevents,
    cascadeCheck: false,
    onlyLeafCheck: true,
    checkbox: true,
    onBeforeExpand: function(node) {
      if ($(this).tree('getLevel', node.target) == 2) $(this).tree('collapseAll');
    },
    loadFilter: function(data) {
      return $.page.fn.apps(data);
    },
    onBeforeCheck: function(node, chk) {
      if (!node.enabled) return false;
    },
    onCheck: function(node, chk) {
      var me = $(this);
      $.page.fn.icons(me, node, chk);
      ajaxget('/', {
        _sqlid: 'user^events',
        _func: 'upd',
        eventid: node.id,
        checked: node.checked
      }, function(ok) {
        alert(ok.msg);
      });
    }
  });

});
