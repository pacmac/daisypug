$.dui.page.errors = {};

$.dui.page.check = function (val, row, idx) {
  var me = $(this);
  var chk = me.datagrid("getChecked");
  if (chk.length > 0) $("#dgbutup").linkbutton("enable");
  else $("#dgbutup").linkbutton("disable");
};

$.dui.page.skip = function (box) {
  var dg = $("#dgfiles");
  var cbox = $(box);
  var idx = parseInt(cbox.val());
  var row = dg.datagrid("getRows")[idx];
  row.skip = cbox.is(":checked");
};

$.page.ready(function () {
  /*
  $('#dgsql').datagrid({
    
    _toolbar: '#dgtbar', 
    
    queryParams:{
      '_func':'upchange',
    },
    
    url             : '/',
    selectOnCheck   : false,
    checkOnSelect   : false,
    singleSelect    : true,
    rownumbers      : true,
    fitColumns      : true,
    striped         : true,
    fit             : true,
  
    columns: [[
      {field:'edit', checkbox:true, title:'apply'},
      
      {field:'skip', title:'skip',formatter: function (val,row,idx){
        if(row.name.endsWith('.sql')) return '<input type="checkbox" onclick="$.dui.page.skip(this);" value="'+idx+'"/>';
	    }},

      {field:'lock', align:'left',title:'Lock',styler:function(val,row,idx){
        if(val===true) return 'background:url(../icons/lock.png) no-repeat center center';
        else return '';
      },formatter:function(){return ''}},
      
    
      {field:'mod', title:'File Path', hidden:true},        
      
      {field:'name', order:'asc',title:'File Name', width:200, fixed:false, formatter:function(val){
        return val.split('/').slice(-1)[0];  
      }},

      {field:'ver', order:'asc',title:'Ver',formatter(val,row,idx){if(!val) return '-'; return val.join('.')},width:40},

      {field:'note', order:'asc',title:'Notes',formatter(val,row,idx){
        if($.dui.page.errors[row.name]) return $.dui.page.errors[row.name]; 
        var ver = '-'; if(row.ver) ver = row.ver.join('.');
        if(!row.rels || !ver || !(ver in row.rels) ) return '';
        return row.rels[ver].notes.join(' | ');
      },width:500}

    ]],    
  
  });
  */

  $("#dgbutre").linkbutton({
    size: "small",
    iconCls: "icon-reload",
    text: "Refresh",
    onClick: function () {
      $("#dgfiles").datagrid("reload");
    },
  });

  $("#dgbutup").linkbutton({
    size: "small",
    iconCls: "icon-download",
    text: "Update",
    onClick: function () {
      var con = $("#content");
      var skips = [],
        files = [],
        chk = $("#dgfiles").datagrid("getChecked") || [];
      chk.map(function (file) {
        if (file.skip) skips.push(file.name);
        files.push(file.name);
      });
      if (files.length + skips.length == 0) return msgbox("No files selected");
      // when sending array via ajax: "files[]":"mod/admin/funcman.js",
      //var x = 1

      // Lock the content when getting data as it takes a while
      con.addClass("lock");
      setTimeout(function () {
        con.removeClass("lock");
      }, 30000);

      var args = {
        _func: "update",
        files: files.join(","),
        skips: skips.join(","),
      };

      ajaxget("/", args, function (res) {
        res.err = res.err || [];
        res.err.map(function (item) {
          $.dui.page.errors[item[0]] = item[1];
        });
        con.removeClass("lock");
        $("#dgfiles").datagrid("reload");
      });
    },
  });

  $("#dghist").datagrid({
    singleSelect: false,
    rownumbers: true,
    fitColumns: true,
    striped: true,
    fit: true,

    columns: [
      [
        { field: "ver", order: "asc", title: "Ver", width: 30 },
        { field: "notes", order: "asc", title: "Notes", width: 500 },
      ],
    ],

    loadFilter: function (rels) {
      var data = { rows: [], total: 0 };
      for (var rel in rels) {
        data.rows.push({
          ver: rel,
          notes: rels[rel].notes.join(" | "),
        });
      }
      data.total = data.rows.length;
      return data;
    },
  });

  $("#dgfiles").datagrid({
    toolbar: "#dgtbar",

    queryParams: {
      _func: "upchange",
    },

    url: "/",
    selectOnCheck: false,
    checkOnSelect: false,
    singleSelect: true,
    rownumbers: true,
    fitColumns: true,
    striped: true,
    fit: true,

    /* identify error files */
    rowStyler: function (idx, row) {
      if ($.dui.page.errors[row.name]) {
        return { class: "fg-red" };
      }
    },

    loadFilter: function (data) {
      var filt = $("#upfilt").combobox("getValue");
      var rdat = [];
      var hlock = $("#hlock").combobox("getValue");
      data.map(function (row) {
        row.skip = false;
        row.types = [];
        if (/\.pug|\.htm|\.html|\.jade/.test(row.name)) row.types.push("html");
        if (/\.prpt/.test(row.name)) row.types.push("prpt");
        if (row.name.startsWith("sql/")) row.types.push("sql");
        if (/dwap\..*\.sql|dbsl\..*\.sql/.test(row.name))
          row.types.push("dwap");
        if (/dbsa\..*\.sql/.test(row.name)) row.types.push("dbsa");
        if (row.types.length == 0) row.types.push("apps");
        if (filt != "all" && row.types.indexOf(filt) == -1) return;
        if (!row.name) return;
        if (hlock == "y") {
          if (!row.lock) rdat.push(row);
        } else rdat.push(row);
      });

      return {
        rows: rdat,
        total: rdat.length,
      };
    },

    columns: [
      [
        { field: "edit", checkbox: true, title: "apply" },

        {
          field: "skip",
          title: "skip",
          formatter: function (val, row, idx) {
            if (row.name.endsWith(".sql"))
              return (
                '<input type="checkbox" onclick="$.dui.page.skip(this);" value="' +
                idx +
                '"/>'
              );
          },
        },

        {
          field: "lock",
          align: "left",
          title: "Lock",
          styler: function (val, row, idx) {
            if (val === true)
              return "background:url(../icons/lock.png) no-repeat center center";
            else return "";
          },
          formatter: function () {
            return "";
          },
        },

        {
          field: "mod",
          title: "File Path",
          width: 100,
          fixed: false,
          formatter: function (val, row, idx) {
            var path = row.name.split("/").slice(0, -1).join(" - ");
            if (path) return path;
            else if (row.name.endsWith(".sql")) return "sql";
            else return "-";
          },
        },

        {
          field: "name",
          order: "asc",
          title: "File Name",
          width: 200,
          fixed: false,
          formatter: function (val) {
            return val.split("/").slice(-1)[0];
          },
        },

        {
          field: "ver",
          order: "asc",
          title: "Ver",
          formatter(val, row, idx) {
            if (!val) return "-";
            return val.join(".");
          },
          width: 40,
        },

        {
          field: "note",
          order: "asc",
          title: "Notes",
          formatter(val, row, idx) {
            if ($.dui.page.errors[row.name]) return $.dui.page.errors[row.name];
            var ver = "-";
            if (row.ver) ver = row.ver.join(".");
            if (!row.rels || !ver || !(ver in row.rels)) return "";
            return row.rels[ver].notes.join(" | ");
          },
          width: 500,
        },
      ],
    ],

    onSelect: function (idx, row) {
      var opt = $(this).datagrid("options");
      var his = $("#dghist");
      var hop = his.datagrid("options");
      row.rels = row.rels || {};
      his.datagrid("loadData", row.rels);
    },

    onUncheck: $.dui.page.check,
    onCheck: $.dui.page.check,

    onBeforeCheck: function (val, row, idx) {
      if (row.lock) {
        msgbox("File is locked and cannot be updated.");
        return false;
      }
    },
  });

  $("#hlock").combobox({
    onChange: function (nv, ov) {
      if (!ov) return;
      $("#dgfiles").datagrid("reload");
    },
  });

  $("#upfilt").combobox({
    width: 100,
    editable: false,
    panelHeight: "auto",
    data: [
      { text: "All Files", value: "all", selected: true },
      { text: "Reports", value: "prpt" },
      { text: "HTML", value: "html" },
      { text: "Applications", value: "apps" },
      { text: "SQL All", value: "sql" },
      { text: "SQL Data", value: "dbsa" },
      { text: "SQL System", value: "dwap" },
    ],

    onChange: function (nv, ov) {
      if (!ov) return;
      $("#dgfiles").datagrid("reload");
    },
  });
});
