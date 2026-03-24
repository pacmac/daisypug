/*
  PAC 171116 - 2.2.384
  1. Modified to use dwap.xxx, dwapgrp.xxx, dbsa.xxx  
  
  
*/

//delcook('his');
var sql = "SELECT * FROM dbsa.information_schema.tables";

$.dui.page.ttype = function () {
  var sql = $("input#sql").textbox("getValue").trim();
  $("a#query, a#exec").linkbutton("enable");
  return sql;
};

// #### NEW
$.dui.page.getTables = function (me) {
  var name = me.attr("name");

  $("a#go").linkbutton("enable");
  $("a#dg2excel").linkbutton("disable");
  var sql = $("input#sql");
  sql.textbox("clear");
  sql.textbox("disable");
  sql.textbox("required", false);

  $("#go").linkbutton("options").type = name;
  $("#go").click();
};

$("#dwaptab").linkbutton({
  text: "DWAP Tables",
  onClick: function () {
    $.dui.page.getTables($(this));
  },
});

$("#dbmstab").linkbutton({
  text: "DBMS Tables",
  onClick: function () {
    $.dui.page.getTables($(this));
  },
});

// ## NEW-END

$("input#sql")
  .textbox({
    onChange: function (nv, ov) {
      $.dui.page.ttype();
    },
  })
  .textbox("dropbox", "sql");

/*
var dropbox;
dropbox = document.getElementById("dropbox");
//dropbox.addEventListener("dragenter", dragenter, false);
//dropbox.addEventListener("dragover", dragover, false);
dropbox.addEventListener("drop", drop, false);

function drop(e) {
  e.stopPropagation();
  e.preventDefault();

  var dt = e.dataTransfer;
  var files = dt.files;
  cl(files);
  //handleFiles(files);
}
*/

$.dui.page.hisnav = function (last) {
  var cook = getacook("admin^query^sql");
  if (last) $.dui.page.index = cook.length - 1;
  var dir = $(this).attr("id");
  if (!$.dui.page.index) $.dui.page.index = 0;
  if (dir == "last" && $.dui.page.index > 0) $.dui.page.index--;
  if (dir == "next" && cook.length > $.dui.page.index + 1) $.dui.page.index++;
  $("input#sql").textbox("setValue", decodeURIComponent(cook[$.dui.page.index]));
  if (sql.trim().toLowerCase().indexOf("select") !== -1)
    $("#type").combobox("select", "query");
  else $("#type").combobox("select", "exec");
};

/*
$.extend($.fn.datagrid.methods, {
  clientPaging: function(jq){
    return jq.each(function(){
      var dg = $(this);
      var state = dg.data('datagrid');
      var opts = state.options;
      opts.loadFilter = pagerFilter;
      var onBeforeLoad = opts.onBeforeLoad;
      opts.onBeforeLoad = function(param){
        state.allRows = null;
        return onBeforeLoad.call(this, param);
      }
      var pager = dg.datagrid('getPager');
      pager.pagination({
        onSelectPage:function(pageNum, pageSize){
          opts.pageNumber = pageNum;
          opts.pageSize = pageSize;
          pager.pagination('refresh',{pageNumber:pageNum,pageSize:pageSize});
          dg.datagrid('loadData',state.allRows);
        }
      });
      $(this).datagrid('loadData', state.data);
      if (opts.url) $(this).datagrid('reload');
    });
  }
})
*/
//$('a#next, a#last').linkbutton({onClick:$.dui.page.hisnav})

$.dui.page.dbgo = function () {
  var me = $(this);
  var val = type || $("#type").combobox("getValue");
  //var val = me.linkbutton('options').type;

  var xl = $("#xldump"),
    type = "query";

  $.dui.page.dgrid([]);
  me.linkbutton("disable");
  $.messager.progress({ interval: 500 });
  //$('table#data').datagrid('loading');
  switch (val) {
    case "query":
    case "exec":
      if (sql.length == 0) return me.linkbutton("disable");
      var vars = {
        _func: val,
        _sqlid: "admin^dbquery",
        _sql: $.dui.page.ttype(),
      };
      break;

    case "dbsa":
    case "sysdb":
      var vars = { _func: "get", _sqlid: "admin^tables", type: val };
      break;

    default:
      return me.linkbutton("disable");
  }

  //if(getacook('admin^query^sql').indexOf(decodeURIComponent(sql))==-1)
  putacook("admin^query^sql", encodeURIComponent(sql), {
    max: 10,
    append: true,
  });

  ajaxget("/", vars, function (data) {
    me.linkbutton("enable");
    if (!data.msg) {
      $.dui.page.dgrid(data);
    } else {
      $.messager.progress("close");
    }
  });
};

/*
$('a#go').linkbutton({
  onClick:$.dui.page.dbgo   
})
*/

$.dui.page.pager = function () {
  var dg = $("table#data");
  var opts = dg.datagrid("options");
  var pager = dg.datagrid("getPager");
  pager.pagination({
    onSelectPage: function (num, size) {
      opts.pageNumber = num;
      opts.pageSize = size;
      pager.pagination("refresh", { pageNumber: num, pageSize: size });
      var start = (num - 1) * parseInt(size);
      var end = start + parseInt(size);
      var data = {
        total: opts.allRows.length,
        rows: opts.allRows.slice(start, end),
      };
      dg.datagrid("loadData", data);
    },

    buttons: [
      {
        id: "xldump",
        disabled: true,
        text: "Excel",
        iconCls: "icon-xls",
        handler: function () {
          dg.datagrid("toExcel", "sqldump.xls");
        },
      },
    ],
  });

  pager.pagination("select");
};

$.dui.page.dgrid = function (data) {
  if (!Array.isArray(data)) data = [data];
  var cols = [];
  if (data.length) len = Object.keys(data[0]).length;
  for (var i in data[0]) {
    var col = { field: i, title: i };
    if (len > 10) col.width = 80;
    cols.push(col);
  }

  if (cols.length < 11 && data.length < 101) var ps = 100;
  else var ps = 25;

  $("table#data").datagrid({
    pagePosition: "top",
    pagination: true,
    pageList: [25, 50, 100, 250],
    pageSize: ps,
    rownumbers: true,
    singleSelect: true,
    noWrap: true,
    autoRowHeight: false,
    fitColumns: false,
    fit: true,
    striped: true,
    columns: [cols],
    allRows: data,

    onRowContextMenu: function (evt, idx, row) {
      evt.preventDefault();
      var type = $("#type").combobox("getValue");
      if (type == "dbsa" || type == "sysdb")
        $("#rowmenu").menu("show", {
          src: { type: type, idx: idx, row: row },
          left: evt.pageX,
          top: evt.pageY,
        });
    },

    onLoadSuccess: function () {
      if ($(this).datagrid("options").allRows.length > 0)
        $("#xldump").linkbutton("enable");
      $.messager.progress("close");
      //$(this).datagrid('loaded');
    },
  });

  $("tr.datagrid-header-row td[field]").tooltip({
    position: "left",
    onShow: function (e) {
      var field = $(e.target).attr("field");
      $(this).tooltip("update", field);
    },
  });

  $.dui.page.pager();
};

$.page.ready(function () {
  $("#rowmenu").menu({
    src: {},
    onClick: function (item) {
      var opt = $(this).menu("options");
      if (item.name == "getcols") {
        if (opt.src.type == "dbsa")
          var sql =
            "SELECT * FROM dbsa.INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '" +
            opt.src.row.NAMES +
            "'";
        else var sql = "PRAGMA table_info(" + opt.src.row.NAMES + ")";
      } else if (item.name == "getdata") {
        if (opt.src.type == "dbsa")
          var sql = "SELECT * FROM dbsa." + opt.src.row.NAMES;
        else var sql = "SELECT * FROM " + opt.src.row.NAMES;
      }

      $("#type").combobox("select", "query");
      $("input#sql").textbox("setValue", sql);
      $("#go").click();
    },
  });

  $("a#clear").linkbutton({
    iconCls: "icon-cancel",
    onClick: function () {
      $("#sql").textbox("clear");
      $.dui.page.dgrid([]);
    },
  });

  setTimeout(function () {
    var height = getcook("admin^query^height") || 100;
    var pan = $("#sqlpan").layout("panel", "north");
    pan.panel("resize", { height: height });
    $("#sqlpan").layout("resize");
    pan.panel("options").onResize = function (width, height) {
      putcook("admin^query^height", height);
    };
  });

  toolbut([
    {
      id: "last",
      iconCls: "icon-bak",
      noText: true,
      onClick: $.dui.page.hisnav,
    },
    {
      id: "next",
      noText: true,
      iconCls: "icon-fwd",
      onClick: $.dui.page.hisnav,
    },
    {
      iconCls: "icon-dbgo",
      id: "go",
      disabled: true,
      onClick: $.dui.page.dbgo,
    },
    /*
    ,{
      type:"combobox",
      label:"Mode",
      id:"type"
    }
    */
    /*
    {},{
      type:"combobox",
      label:"Mode",
      id:"type_",
      panelHeight:'auto',
      editable:false,
      data:[
        {value:'query',text:'Select Query'},
        {value:'exec',text:'Execute Statement'},
        {value:'dbsa',text:'Table List - Data'},
        {value:'sysdb',text:'Table List - System'}
      ],
      
      onSelect:function(rec){
        cl('select-xxxx');
        $('a#go').linkbutton('enable');
        $('a#dg2excel').linkbutton('disable');
        var sql = $('input#sql');
        if(rec.value=='dbsa' || rec.value=='sysdb'){
          sql.textbox('clear');
          sql.textbox('disable');
          sql.textbox('required',false);
          $('#go').click();    
        } else {
          sql.textbox('enable');
          sql.textbox('required',true);        
        } 
      }
    }
    */
  ]);

  $("#type").combobox({
    panelHeight: "auto",
    editable: false,
    data: [
      { value: "query", text: "Select Query" },
      //{ value: "exec", text: "Execute Statement" },
      { value: "dbsa", text: "Table List - Data" },
      { value: "sysdb", text: "Table List - System" },
    ],

    onSelect: function (rec) {
      $("a#go").linkbutton("enable");
      $("a#dg2excel").linkbutton("disable");
      var sql = $("input#sql");
      if (rec.value == "dbsa" || rec.value == "sysdb") {
        sql.textbox("clear");
        sql.textbox("disable");
        sql.textbox("required", false);
        $("#go").click();
      } else {
        sql.textbox("enable");
        sql.textbox("required", true);
      }
    },
  });

  /*
  $(document).on('keyup',function(e) {
    if($('#go').length==0) return; 
    e.preventDefault();
    if(e.keyCode==13) $('#go').click();
  });
  */

  // load blank datagrid
  $.dui.page.dgrid([]);

  // select last query.
  $.dui.page.hisnav(true);
});
