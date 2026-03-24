
$.page.ready(function () {
/*
toolbut([
  {
    id:'dg2excel',
    disabled:false
  },
  {},
  {
    iconCls: 'icon-clear',
    text: 'Clear',
    noText: false,
    onClick: function(){
      $('#partbal').datagrid('removeFilterRule');
      $('#partbal').datagrid('doFilter');
    }
  },
])


$.page.fn.columns = [
  { field: "PART_ID", title: "Part ID" },
  {
    field: "PRODUCT_CODE",
    title: "Product CodeXX",
    _sqlid: "inv^productcodeid",
    editor: {
      type: "combobox",
    },
  },
];
*/
$.page.fn.filters = [
  {
    field: "TOTAL",
    type: "numberbox",
    options: { precision: 0 },
    op: ["equal", "notequal", "less", "greater"],
  },
  {
    field: "PRODUCT_CODE",
    type: "combobox",

    options: {
      panelHeight: "auto",
      data: $.dui.pdata.pcode,
      onChange: function (value) {
        var dg = $("#partbal");
        if (value == "") {
          dg.datagrid("removeFilterRule", "PRODUCT_CODE");
        } else {
          dg.datagrid("addFilterRule", {
            field: "PRODUCT_CODE",
            op: "like",
            value: value,
          });
        }
        dg.datagrid("doFilter");
      },
    },
  },
];

$.page.fn.integer = function (val) {
  var v = eui.integer(val);
  if (v === "0.00") return "-";
  return v;
};

$.page.fn.docols = function (cb) {
  ajaxget(
    "/",
    {
      _sqlid: "admin^siteids",
      _func: "get",
    },
    function (sites) {
      // console.log('global parts:sites:',sites)
      var cols = [
        { field: "PART_ID", title: "Part ID" },
        {
          field: "PRODUCT_CODE",
          title: "Product Code",

          type: "combobox",
          op: ["equal", "notequal", "less", "greater"],
        },

        { field: "DESCRIPTION", title: "Description", width: 200, fixed: true },
        { field: "UOM_ID", title: "UOM" },
        {
          field: "TOTAL",
          align: "right",
          width: 80,
          fixed: true,
          title: "Total Bal",
          formatter: $.page.fn.integer,
        },
      ];

      sites.map(function (sid, idx) {
        sid = sid.value.toUpperCase();
        // if(sid=="MYDEV" || sid=="PURE3") var qcol = "BAL_QTY_MYDEV";
        // else
        var qcol = "BAL_QTY_" + sid;
        var vcol = "MCOST_" + sid;
        var ttl = sid;
        //  ttl = sid.replace("OMS", "OMS-");
        var def = {
          align: "right",
          width: 80,
          fixed: true,
          field: qcol,
          title: ttl,
          formatter: $.page.fn.integer,
        };
        //if(idx%2==0) def.styler = function(val){return {class:'fg-blu'}};
        cols.push(def);

        // Non-Text Filters
        //$.page.fn.filters.push({field:qcol,type:'numberbox',options:{precision:0},op:['equal','notequal','less','greater']});
        $.page.fn.filters.push({ field: qcol, type: "label" });
        $.page.fn.filters.push({ field: vcol, type: "label" });
      });

      //cols.push({field:"DESCRIPTION",title:"Description"});
      cb(cols);
    }
  );
};

$.page.fn.partgrid = function (cols, data) {
  progress(true);
  var dg = $("#partbal");

  dg.datagrid({
    remoteFilter: true,

    pagination: true,
    pagePosition: "top",
    page: 1,
    pageSize: 25,
    pageList: [10, 25, 50, 100],

    onBeforeLoad: function (param) {
      var cols = $(this).datagrid("options").columns;

      // [{"field":"PART_ID","op":"contains","value":"1"}]
      if (param.filterRules) {
        jsonParse(param.filterRules).map(function (e) {
          var op =
            {
              equal: "_EQ_",
              notequal: "_NEQ_",
              greater: "_GT_",
              less: "_LT_",
            }[e.op] || "_LIKE_";

          if (e.field == "TOTAL") param["BAL_QTY" + op] = e.value;
          else param[e.field + op] = e.value;
        });
        delete param.filterRules;
      }

      param._page = param.page;
      param._rows = param.rows || 50;
      delete param.page;
      delete param.rows;
    },

    _toolbar: "#tbar",
    fit: true,
    fitColumns: true,
    queryParams: frm2dic($("form#partFilter")),
    url: "/?_sqlid=inv^globalPartBal&_func=get",
    checkOnSelect: false,
    singleSelect: true,
    method: "get",
    striped: true,
    columns: [cols],

    onLoadSuccess: function (data) {
      progress(false);
    },
  });

  dg.datagrid("enableFilter", $.page.fn.filters);
  dg.datagrid("getPager").pagination({
    layout: [
      "sep",
      "first",
      "prev",
      "sep",
      "links",
      "sep",
      "next",
      "last",
      "sep",
    ],

    buttons: [
      {
        text: "Clear",
        iconCls: "icon-clear",
        handler: function () {
          $("#partbal").datagrid("removeFilterRule");
          $("#partbal").datagrid("doFilter");
        },
      },
      "-",
      {
        text: "Excel",
        iconCls: "icon-xls",
        handler: function () {
          dg.datagrid("toExcel", "global_parts.xls");
        },
      },
      "-",
    ],
  });
};

$(document).ready(function () {
  progress(true);
  setTimeout(function () {
    $.page.fn.docols(function (cols) {
      $.page.fn.partgrid(cols);
    });
  });
});


});  // $.page.ready