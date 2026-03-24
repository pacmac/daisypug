$.page.fn.data = {
  svctot: 0
};

$.page.fn.linehrs = {
  type: "numberspinner",
  options: { precision: 2, increment: 0.25 }
};

$.page.fn.float = function (val) {
  return parseFloat(val) || 0;
};

$.page.fn.qtyfmt = function (val) {
  if (val) return parseInt(val, 10);
  return 0;
};

$.page.fn.num2 = function (val) {
  return eui.number(val, 2);
};

$.page.fn.hourlyCost = function (val, row) {
  return eui.currency(
    $.page.fn.float(row.STD_COST) +
      $.page.fn.float(row.WKE_COST) +
      $.page.fn.float(row.HOL_COST)
  );
};

$.page.fn.linecalc = function (me, idx, row) {
  var opt = me.datagrid("options");
  var frm = opt.tbar.form;
  var stdHrs = $.page.fn.float(
    frm.find("input[name=STD_HRS]").numberbox("getValue")
  );
  var wkeHrs = $.page.fn.float(
    frm.find("input[name=WKE_HRS]").numberbox("getValue")
  );
  var holHrs = $.page.fn.float(
    frm.find("input[name=HOL_HRS]").numberbox("getValue")
  );
  var totHrs = Math.round($.page.fn.float(row.TOT_HRS) * 100) / 100;
  var tot = Math.round((stdHrs + wkeHrs + holHrs) * 100) / 100;

  cl(tot + ":" + totHrs);
  return true;
};

$.page.fn.status = function () {
  setTimeout(function () {
    var data = $("form#main").form("getData");
    var gets = $("#jobget, #svcget, #rentget");
    var locks = $("._lock");

    if (
      !data.CONSOL_ID ||
      !data.START_DATE ||
      !data.END_DATE ||
      data.STATUS != "PENDING"
    ) {
      gets.linkbutton("disable");
    } else {
      gets.linkbutton("enable");
    }

    if (data.TOTAL_COST > 0) {
      locks.textbox("readonly", true);
    } else {
      locks.textbox("readonly", false);
    }

    if ($.page.fn.data.approve) {
      $("#STATUS").combobox("readonly", false);
    }
  });
};

$.page.fn.init = function () {
  $.page.fn.data.approve = (/OSS-CONSOL-EDIT/).test($.dui.udata.groups);
  if ($.dui.bhave.DATE_OLAP == "n") {
    $("#_datechk").val("n");
  }
  $("#maintab").addClass("lock");
};

$.page.fn.obl = function () {
  var data = $("form#main").form("getData");
  if (!data.ID) return false;
  return data;
};

$.page.fn.saverow = function (row, cb) {
  var data = $("form#main").form("getData");
  var qp = $.extend(
    {
      _sqlid: "oss^linkjob",
      _JOB_MULTI_STD: data.JOB_MULTI_STD,
      _JOB_MULTI_WKE: data.JOB_MULTI_WKE,
      _JOB_MULTI_HOL: data.JOB_MULTI_HOL,
      _CUSTOMER_ID: data.CUSTOMER_ID,
      START_DATE: data.START_DATE,
      END_DATE: data.END_DATE
    },
    row
  );
  ajaxget("/", qp, cb);
};

$.page.fn.enable = function (tf) {
  var frm = $("form#main");
  if (tf) {
    frm.form("disable");
  } else {
    frm.form("enable");
  }
};

$.page.fn.multis = function () {
  if (!$.dui.bhave.JOB_MULTI_STD) return alert("O/T rates not set.");
  $("#JOB_MULTI_STD, #JOB_MULTI_HOL, #JOB_MULTI_WKE").each(function () {
    var id = $(this).attr("id");
    var val = $.page.fn.float($.dui.bhave[id]);
    $(this).numberbox("setValue", val);
  });
};

$.page.fn.svclistOpts = {
  disabled: false,
  queryParams: {
    _sqlid: "oss^linkticks",
    _func: "get",
    _dgrid: "y"
  },
  onBeforeLoad: function (param) {
    var data = $("form#main").form("getData");
    if (!data.CONSOL_ID) return false;
    param.CONSOL_ID = data.CONSOL_ID;
  },
  onLoadSuccess: function (data) {
    var tot = 0;
    data.rows.map(function (row) {
      tot += $.page.fn.float(row.TOTAL_CHARGE);
    });
    $("#SERVICE_COST, #_SERVICE_COST").numberbox("setValue", tot);
  }
};

$.page.fn.rentlistOpts = {
  disabled: false,
  queryParams: {
    _sqlid: "oss^linkrents",
    _func: "get",
    _dgrid: "y"
  },
  onBeforeLoad: function (param) {
    var data = $("form#main").form("getData");
    if (!data.CONSOL_ID) return false;
    param.CONSOL_ID = data.CONSOL_ID;
  },
  onLoadSuccess: function (data) {
    var tot = 0;
    data.rows.map(function (row) {
      tot += $.page.fn.float(row.TOTAL_COST);
    });
    $("#RENT_COST, #_RENT_COST").numberbox("setValue", tot);
  }
};

$.page.fn.joblinkOpts = {
  disabled: false,
  editor: "form",
  queryParams: {
    _sqlid: "oss^linkjobs",
    _func: "get",
    _dgrid: "y",
    CONSOL_ID: ""
  },
  onLoadSuccess: function (data) {
    delete $(this).datagrid("options").queryParams.recalc;
    var tot = { JOB_QTY_TOTAL: 0, JOB_HRS_TOTAL: 0, JOB_COST: 0 };
    data.rows.map(function (row) {
      tot.JOB_QTY_TOTAL += row.STD_QTY;
      tot.JOB_HRS_TOTAL += row.TOT_HRS;
      tot.JOB_COST += row.TOT_COST;
    });

    Object.keys(tot).forEach(function (key) {
      $("#" + key).numberbox("setValue", tot[key]);
    });
    $("#_JOB_COST").numberbox("setValue", tot.JOB_COST);
  },
  onBeforeEndEdit: function (idx, row) {
    var me = $(this);
    if (row._func == "upd" && !$.page.fn.linecalc(me, idx, row)) return false;
    return true;
  },
  onEndEdit: function (idx, row) {
    var me = $(this);
    $.page.fn.saverow(row, function () {
      if (row._func == "del") {
        $("#joblist").datagrid("reload");
      }
      me.datagrid("reload");
    });
  },
  onBeforeLoad: function (param) {
    if ($(this).datagrid("options").disabled) return false;
    var data = $("form#main").form("getData");
    if (!data.CONSOL_ID) return false;
    param.CONSOL_ID = data.CONSOL_ID;
  }
};

$.page.fn.joblistOpts = {
  disabled: false,
  queryParams: {
    _sqlid: "oss^ulinkjobs",
    _func: "get",
    _dgrid: "y",
    START_DATE: "",
    END_DATE: "",
    CUSTOMER_ID: "",
    CONSOL_ID: ""
  },
  onBeforeLoad: function (param) {
    if ($(this).datagrid("options").disabled) return false;
    var data = $("form#main").form("getData");
    if (!data.CONSOL_ID) return false;
    param.START_DATE = data.START_DATE;
    param.END_DATE = data.END_DATE;
    param.CUSTOMER_ID = data.CUSTOMER_ID;
    param.CONSOL_ID = data.CONSOL_ID;
  },
  onCheck: function (idx, row) {
    var me = $(this);
    var data = $("form#main").form("getData");
    row.CONSOL_ID = data.CONSOL_ID;
    row._func = "add";
    row._stamp = "y";
    $.page.fn.saverow(row, function () {
      $("#joblink").datagrid("reload");
      me.datagrid("reload");
      msgbox("Press [ Recalc ] to cost new job.");
    });
  }
};

$.page.ready(function () {
  delcook("oss^consol^joblink^cols");

  $("#CONSOL_ID").combobox("filtertip", {
    default: ["PENDING"],
    field: "STATUS",
    data: [
      { name: "PENDING", text: "Pending" },
      { name: "APPROVED", text: "Approved" },
      { name: "INVOICED", text: "Invoiced", nosave: true }
    ]
  });

  $("#STATUS").combobox({
    onSelect: function () {
      var clk = $(this).combobox("options").clicked;
      if (!clk) return false;
      $.page.fn.status();
    }
  });

  $("#INVOICE_ID").textbox({
    onChange: function (nv) {
      if (
        eui.isloading("form#main") ||
        $("form#main").form("getData").STATUS == "APPROVED" ||
        nv == ""
      ) {
        return false;
      }
      $("#STATUS").combobox("select", "INVOICED");
    }
  });

  $(".tcost").numberbox({
    onChange: function () {
      var tot = 0;
      if (busy($(this))) return;
      tot += $.page.fn.float($("#_RENT_COST").numberbox("getValue"));
      tot += $.page.fn.float($("#_SERVICE_COST").numberbox("getValue"));
      tot += $.page.fn.float($("#_JOB_COST").numberbox("getValue"));
      $("#TOTAL_COST").numberbox("setValue", tot);
      $.page.fn.status();
    }
  });

  $("#jobget").linkbutton({
    disabled: true,
    onClick: function () {
      var me = $(this);
      var dg = $("#joblink");
      var qp = dg.datagrid("options").queryParams;
      me.linkbutton("disable");
      qp.recalc = "y";
      dg.datagrid("load", qp);
      delete qp.recalc;
      setTimeout(function () {
        me.linkbutton("enable");
      }, 1000);
    }
  });

  $("#svcget").linkbutton({
    disabled: true,
    onClick: function () {
      var me = $(this);
      var data = $("form#main").form("getData");
      me.linkbutton("disable");
      ajaxget(
        "/",
        {
          _sqlid: "oss^linkticks",
          _func: "add",
          CUSTOMER_ID: data.CUSTOMER_ID,
          CONSOL_ID: data.CONSOL_ID,
          START_DATE: data.START_DATE,
          END_DATE: data.END_DATE
        },
        function () {
          $("#svclist").datagrid("reload");
          setTimeout(function () {
            me.linkbutton("enable");
          }, 1000);
        }
      );
    }
  });

  $("#rentget").linkbutton({
    disabled: true,
    onClick: function () {
      var me = $(this);
      var data = $("form#main").form("getData");
      me.linkbutton("disable");
      ajaxget(
        "/",
        {
          _sqlid: "oss^linkrents",
          _func: "add",
          CUSTOMER_ID: data.CUSTOMER_ID,
          CONSOL_ID: data.CONSOL_ID,
          START_DATE: data.START_DATE,
          END_DATE: data.END_DATE
        },
        function () {
          $("#rentlist").datagrid("reload");
          setTimeout(function () {
            me.linkbutton("enable");
          }, 1000);
        }
      );
    }
  });

  $("form#main")
    .on("success", function () {})
    .on("loadDone", function () {
      setTimeout(function () {
        var data = $("form#main").form("getData");
        $("#maintab").removeClass("lock");
        if (!data.CONSOL_ID) return;
        $("#joblink").datagrid("load");
        $("#joblist").datagrid("load");
        $("#svclist").datagrid("load");
        $("#rentlist").datagrid("load");
      }, 250);
    });

  $("#but_add").on("done", function () {
    $.page.fn.multis();
  });

  $("#CUSTOMER_ID").combobox({
    onSelect: function (rec) {
      $("#CUSTOMER_NAME").textbox("setValue", rec.CUSTOMER_NAME);
      $("#CURRENCY_ID").textbox("setValue", rec.CURRENCY_ID);
    }
  });

  $("#svclist").datagrid($.page.fn.svclistOpts);
  $("#rentlist").datagrid($.page.fn.rentlistOpts);
  $("#joblink").datagrid().datagrid("rowEditor", $.page.fn.joblinkOpts);
  $("#joblist").datagrid($.page.fn.joblistOpts);
  $("#joblink").datagrid("resize");

  setTimeout($.page.fn.init);
});
