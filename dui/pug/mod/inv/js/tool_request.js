$.page.ready(function () {
  $("#PART_ID").searchbox({
    sbref: "part",
    preload: true,
  
    //url: "/?_func=get&_sqlid=inv^partids",
    loadFilter: function (data) {
      var partFilter = String(($.dui.bhave && $.dui.bhave.part_filter) || "");
      return (data || []).filter(function (d) {
        var val = String(d.value || "");
        return (
          d.BAL_QTY > 0 &&
          d.TRACEABLE === "N" &&
          d.DIM_TRACKED === "N" &&
          val.indexOf(partFilter) === 0
        );
      });
    },
    onSelect: function (v) {
      var nn = $("#QTY");
      nn.numberbox("options").max = v.BAL_QTY;
      nn.numberspinner("setValue", nn.numberspinner("getValue"));
      $("#PART_DESC").val(v.DESCRIPTION);
    },
  });

  $("#OPERATOR_ID").searchbox({
    onchange: function (v) {
      console.log("change", v);
      if (!v) {
        $("#OPERATOR_NAME").val("");
        $("#tool_tx").datagrid("loadData", { rows: [], total: 0 });
      }
    },
    //sbref: "operator",
   // preload: true,
    onSelect: function (v) {
      console.log("selected", v);
      $.dui.ajax.ajaxget(
        "/",
        {
          _func: "get",
          _sqlid: "vwltsa^empall",
          ID: v.value,
          SITE_ID: "DEFAULT",
        },
        function (emp) {
          if (!emp || !emp.ID) return;
          $("#OPERATOR_NAME").val(emp.FIRST_NAME + " " + emp.LAST_NAME);
          $.page.fn.loadPending(emp.ID);
        },
      );
    },
  });
  $.page.fn.opts = {
    editor: "inline",
    queryParams: {
      _func: "get",
      _sqlid: "inv^tool_request",
      _dgrid: "y",
      OPERATOR_ID: "",
    },
    loadFilter: function (data) {
      if (!data || (!data.rows && data.length === 0)) {
        data = { rows: [], total: 0 };
      }
      return data;
    },
    onSelect: function () {
      cl('WLH');
    },

    
    onEndEdit: function (idx, row) {
      if (Number(row.QTY) > Number(row.BAL_QTY)) {
        $.messager.alert("Warning", "Qty cannot more than Bal Qty", "warning");
        return;
      }
      var url = "/?_sqlid=inv^tool_request";
      var data = JSON.parse(JSON.stringify(row));
      $.dui.ajax.ajaxget(url, data, function () {});
    },
  };

  $.page.fn.loadPending = function (operatorId) {
    $.dui.ajax.ajaxget(
      "/",
      {
        _func: "get",
        _sqlid: "inv^tool_request",
        OPERATOR_ID: operatorId,
        _dgrid: "y",
      },
      function (rows) {
        $("#tool_tx").datagrid("loadData", rows || { rows: [], total: 0 });
      },
    );
  };

  $.page.fn.bcemp = function (val) {
    if (!val) return;
    var empId = val.substring(2, val.length - 1);
    $.dui.ajax.ajaxget(
      "/",
      { _func: "get", _sqlid: "vwltsa^empall", ID: empId, SITE_ID: "DEFAULT" },
      function (emp) {
        if (!emp || !emp.ID) return;
        $("#OPERATOR_ID").val(emp.ID);
        $("#OPERATOR_NAME").val(emp.FIRST_NAME + " " + emp.LAST_NAME);
        $.page.fn.loadPending(emp.ID);
      },
    );
  };

  $.page.fn.clrScreen = function () {
    $("#OPERATOR_ID").val("");
    $("#OPERATOR_NAME").val("");
    $("#PART_ID").val("");
    $("#QTY").val(0);
    $("#tool_tx").datagrid("loadData", { rows: [], total: 0 });
    $("#PART_DESC").val("");
  };

  $.page.fn.add_pending = function () {
    var eid = $("#OPERATOR_ID").val();
    var pid = $("#PART_ID").val();
    var qty = $("#QTY").val();
    if (!eid || !pid || Number(qty) <= 0) return;

    var dt = myTime(new Date());
    $.dui.ajax.ajaxget(
      "/",
      {
        _func: "add",
        _sqlid: "inv^tool_request",
        PART_ID: pid,
        OPERATOR_ID: eid,
        QTY: qty,
        TRANSACTION_DATE: dt,
      },
      function () {
        $.page.fn.loadPending(eid);
        $("#PART_ID").val("");
        $("#QTY").val(1);
        $("#PART_DESC").val("");
      },
    );
  };



  $("#tool_tx").datagrid("rowEditor", $.page.fn.opts);

  if (typeof $.dui.fn.bcscan === "function") {
    $.dui.fn.bcscan(function (bc) {
      switch (bc.pre) {
        case "1":
          var emp = $("#OPERATOR_ID");
          if (emp.searchbox("exists", bc.data)) {
            emp.searchbox("select", bc.data);
          }
          break;
      }
    }, 4);
  }

  $("#clr").on("click", function () {
    $.page.fn.clrScreen();
  });

  $("#add").on("click", function () {
    $.page.fn.add_pending();
  });

  $.page.setTimeout(function () {
    $("#OPERATOR_ID").focus();
  }, 100);
});
