$.page.fn.data = {
  rates: [],
};

$.page.fn.init = function () {
  $.page.fn.data.approve = /OSS-TICKET-EDIT/.test($.dui.udata.groups);
};

$.page.fn.calchrs = function () {
  if (busy($("#TX_STARTTIME"))) return false;
  setTimeout(function () {
    var clk = {};
    clk.cit = $("#TX_STARTTIME").timespinner("getValue").split(":");
    clk.cid = new Date($("#TX_STARTDATE").datebox("getValue"));
    clk.ci = clk.cid.setSeconds(
      clk.cid.getSeconds() + clk.cit[0] * 3600 + clk.cit[1] * 60,
    );
    clk.cod = new Date($("#TX_ENDDATE").datebox("getValue"));
    clk.cot = $("#TX_ENDTIME").timespinner("getValue").split(":");
    clk.co = clk.cod.setSeconds(
      clk.cod.getSeconds() + clk.cot[0] * 3600 + clk.cot[1] * 60,
    );
    clk.sec = (clk.co - clk.ci) / 1000;
    clk.hrs = clk.sec / 3600;
    $("#HOURS_WORKED").numberbox("setValue", clk.hrs);

    // Qty Calcs
    clk.qty = parseInt($("#TX_QTY").numberspinner("getValue")) || 0;
    clk.pce = parseFloat($("#RATE_PIECE").numberbox("getValue")) || 0;
    clk.tot = clk.qty * clk.pce;

    // Hours charged
    clk.phr = parseFloat($("#RATE_HOUR").numberbox("getValue")) || 0;
    clk.mul = parseFloat($("#MULTIPLIER").numberspinner("getValue")) || 0;
    clk.chg = clk.hrs * parseFloat(clk.mul);
    $("#HOURS_CHARGE").numberbox("setValue", clk.chg);
    clk.tot += clk.chg * clk.phr;

    // Totals
    clk.mis = $("#MISC_CHARGE").numberbox("getValue") || 0;
    clk.tot += parseFloat(clk.mis);
    $("#TOTAL_CHARGE").numberbox("setValue", clk.tot);

    clk = null;
  });
};

$.page.fn.doStatus = function (data) {
  var form = $("form#main");
  $("#STATUS").combobox("readonly", !$.page.fn.data.approve);
  if (!data.STATUS || data.STATUS == "PENDING") form.form("enable");
  else if (!$.page.fn.data.approve) form.form("disable");
};

$.page.fn.opts = {
  onSelect: function (idx, row) {
    var form = $("form#main");
    form.data("idx", idx).form("load", row);
  },

  onBeforeLoad: function (param) {
    param.START_DATE = $("#tb_start").datebox("getValue");
    param.END_DATE = $("#tb_end").datebox("getValue");
  },

  onLoadSuccess: function () {
    var idx = $("form#main").data("idx");
    if (idx == -1) idx = $(this).datagrid("getRows").length - 1;
    if (idx > -1) $(this).datagrid("selectRow", idx);
  },
};

$.page.ready(function () {
  $("#tb_start, #tb_end").datebox({
    onChange: function () {
      busy($(this));
      $("#dgtickets").datagrid("reload");
    },
  });

  $("#CUSTOMER_ID").combobox({
    onSelect: function (rec) {
      $.page.fn.data.rates = rec.RATES;
      $(".rates").textbox("clear");
    },
  });

  $("#SERVICE_TYPE, #SERVICE_CLASS").combobox({
    onSelect: function () {
      var typ = $("#SERVICE_TYPE").combobox("getValue");
      var cls = $("#SERVICE_CLASS").combobox("getValue");
      var ref = typ + "^" + cls;
      var rate = $.page.fn.data.rates[ref] || { hour: 0, piece: 0 };
      $("#RATE_PIECE").numberbox("setValue", rate.piece);
      $("#RATE_HOUR").numberbox("setValue", rate.hour);
    },
  });

  // Hours Calculations
  $("#TX_STARTDATE, #TX_ENDDATE").datebox({ onChange: $.page.fn.calchrs });
  $("#TX_STARTTIME, #TX_ENDTIME").timespinner({ onChange: $.page.fn.calchrs });
  $("#MULTIPLIER, #TX_QTY").numberspinner({ onChange: $.page.fn.calchrs });
  $("#MISC_CHARGE").numberbox({ onChange: $.page.fn.calchrs });

  $("#dgtickets").datagrid($.page.fn.opts);

  $("form#main")
    .on("success", function (jq, res) {
      if (res.mode == "add") $(this).data("idx", -1);
      var data = $(this).form("getData");
      $("#dgtickets").datagrid("reload");
      $.page.fn.doStatus(data);
    })
    .on("loadDone", function (jq, data) {
      $.page.fn.doStatus(data);
    })
    .form("disable");

  setTimeout($.page.fn.init);
});
