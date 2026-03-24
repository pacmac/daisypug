/*
  CLS, 180112,2.2.330
  switch OPERATOR, JOB REF to QBE
*/
$.dui.page.getdata = function (reload) {
  var pvar = { _func: "get", _sqlid: "vwltsa^lticks" };

  var df = $("#datef").datebox("getValue");
  var dt = $("#datet").datebox("getValue");

  if (df > dt) {
    return msgbox("Date from cannot more than Date to");
  }
  //var diffTime = Math.abs(new Date(dt) - new Date(df));
  //var  diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  //console.log(diffTime);
  //console.log(diffDays);
  //if (diffDays>32){
  //  return msgbox("Date Range cannot more than 31 days");
  //}
  $("#pagi-filter input").each(function () {
    var name = $(this).attr("name");
    if (name) pvar[name] = $(this).val();
  });

  //$('#ltdg').datagrid('options').queryParams=pvar;
  return $("#ltdg").datagrid("load", pvar);
};

$.dui.page.calchrs = function () {
  var clk = {};
  clk.cit = $("#CIT").timespinner("getValue").split(":");
  clk.cid = new Date($("#CID").datebox("getValue"));
  clk.ci = clk.cid.setSeconds(
    clk.cid.getSeconds() + clk.cit[0] * 3600 + clk.cit[1] * 60
  );

  clk.cod = new Date($("#COD").datebox("getValue"));
  clk.cot = $("#COT").timespinner("getValue").split(":");

  clk.co = clk.cod.setSeconds(
    clk.cod.getSeconds() + clk.cot[0] * 3600 + clk.cot[1] * 60
  );

  var validateCID = new Date($("#CID").datebox("getValue")).getFullYear();
  var validateCOD = new Date($("#COD").datebox("getValue")).getFullYear();
  var currYear = new Date().getFullYear();


  if (
    Math.abs(validateCID - currYear) >= 2 ||
    Math.abs(validateCOD - currYear) >= 2
  ) {
    return msgbox("Invalid Clock In/Clock Out Year!");
  }

  clk.sec = (clk.co - clk.ci) / 1000;
  clk.hrs = clk.sec / 3600;
  //console.log('sa_ticket.js:',clk.hrs);
  var emp = $("#ticket #EMP_NAME").textbox("getValue");
  //console.log('sa_ticekt.js:',emp)
  //$('#CHR').val(clk.hrs.toFixed(2));
  //console.log(clk.hrs)
  if (clk.hrs < 0) {
    $("#COD").datebox("setValue", $("#CID").datebox("getValue"));
    $("#COT").timespinner("setValue", $("#CIT").timespinner("getValue"));

    //if ($('#ticket #EMP_ID').textbox('getValue') !="")return msgbox('Not allowed negative Hours Worked.');
    //if (emp!="") return msgbox('Not allowed negative Hours Worked.');
  } else $("#CHR").numberbox("setValue", clk.hrs.toFixed(2));

  clk = null;
};

$.page.ready(function () {
  toolbut([
    {
      id: "jobview",
      text: "View Job",
      iconCls: "icon-view",
      disabled: true,
      noText: true,
      onClick: function () {
        var basid = $(this).data("basid");
        newtab("vwltsa^sa_jobman&WOREF=" + basid);
      },
    },
    {},
  ]);

  bcscan(function (bc) {
    switch (bc.pre) {
      case "1":
        var emp = $("#EMP_ID");
        emp.textbox("setValue", bc.data);
        var pvar = { _func: "get", _sqlid: "vwltsa^empall", ID: bc.data };
        if (bc.data != "")
          ajaxget("/", pvar, function (data) {
            $("#EMP_NAME").textbox(
              "setValue",
              data.LAST_NAME + " " + data.FIRST_NAME
            );
          });
        setTimeout(function () {
          $("#WOREF1").textbox("textbox").focus();
        }, 100);
        break;

      case "2":
        var job = $("#WOREF1");
        var bcjob = bc.data.split("^").join(".");
        job.textbox("setValue", bcjob);
        break;
    }
  }, 4);

  $("#pagi-filter #JOB_ID_").qbe({
    defid: "job",
    onSelect: function () {
      $.dui.page.getdata(true);
    },
  });
  /*
    $("#pagi-filter #JOB_ID_").combobox({
      _mode: 'remote',
      url: '/',
      queryParams: {_func:'get',_sqlid:'vwltsa^baseid'},
      _loader: function(par,ok,err){
        cl(par);
        
      }
    });
    */
  // $('#pagi-filter .easyui-qbe').textbox({onSelect:function(){ $.dui.page.getdata(true)}})
  $("#pagi-filter .easyui-datebox").datebox({
    onSelect: function () {
      $.dui.page.getdata(true);
    },
  });

  // after add button is pressed.
  $("#but_add").on("done", function (me, data) {
    $(".lock").removeClass("lock");
    var frm = $("#ticket form");
    $("#ticket #TYPE").combobox("select", "R");
    $("#EMP_ID").textbox("textbox").focus();
  });

  $("#COT").timespinner({
    onChange: function () {
      $.dui.page.calchrs();
    },
  });
  $("#ticket form").form({
    onLoadSuccess: function () {
      $.dui.page.calchrs();
    },
  });
  $(".now").timespinner({
    onChange: function () {
      $.dui.page.calchrs();
    },
  });
  $(".today").datebox({
    onChange: function () {
      $.dui.page.calchrs();
    },
  });

  $("#ticket #TYPE").combobox({
    onSelect: function (rec) {
      $("fieldset.opt").hide();
      $("#" + rec.text).show();
      $("#woref").hide();

      var cbo = $("#WOREF1");
      cbo.textbox("required", false);
      if (rec.text !== "INDIRECT") {
        $("#woref").show();
        cbo.textbox("required", true);
      }
    },
  });

  $("#ticket #WOREF1").qbe({
    queryParams: {
      _sqlid: "vwltsa^opnrefs_qbe",
      STATUS: "R",
    },
    onDemand: true,
    valueField: "WOREF",
    fields: [
      { field: "WORKORDER_BASE_ID", title: "Job ID", editor: "textbox" },
      { field: "WORKORDER_LOT_ID", title: "Lot ID", editor: "textbox" },
      { field: "WORKORDER_SUB_ID", title: "Sub ID", editor: "textbox" },
      { field: "SEQUENCE_NO", title: "Seq No", editor: "textbox" },
      { field: "RESOURCE_ID", title: "Resource ID", editor: "textbox" },
      {
        field: "STATUS",
        title: "Status",
        editor: {
          type: "combobox",
          options: {
            panelHeight: "auto",
            data: [
              { value: "R", text: "Released", selected: true },
              { value: "C", text: "Closed" },
              { value: "X", text: "Cancelled" },
            ],
          },
        },
      },
    ],
    onSelect: function (row) {
      var empid = $("#ticket #EMP_ID").textbox("getValue");
      var woref = row.value.split(".");
      var woref1 = woref[0] + "$1$0$" + woref[1] + "$" + woref[2];
      ajaxget(
        "/",
        { _func: "get", _sqlid: "admin^bhave", appid: "vwltsa^sa_jobman" },
        function (bh) {
          if (bh.auto_fg_receipt_enable == "Y") {
            ajaxget(
              "/",
              {
                _func: "get",
                _sqlid: "vwltsa^ltick_autofg",
                woref: woref1,
                empid: empid,
              },
              function (rs) {
                if (rs.error == true) {
                  $("#WOREF1").textbox("setValue", "");
                  return msgbox(rs.msg);
                } else {
                  var nbox = $("#REQUIRED_QTY");
                  nbox.numberbox("setValue", row.CALC_END_QTY);
                  var nbox = $("#BAL_QTY");
                  nbox.numberbox("setValue", row.BAL_QTY);
                  var basid = row.value.split("^")[0];
                  $("a#jobview").data("basid", basid).linkbutton("enable");
                }
              }
            );
          } else {
            var nbox = $("#REQUIRED_QTY");
            nbox.numberbox("setValue", row.CALC_END_QTY);
            var nbox = $("#BAL_QTY");
            nbox.numberbox("setValue", row.BAL_QTY);
            var basid = row.value.split("^")[0];
            $("a#jobview").data("basid", basid).linkbutton("enable");
          }
        }
      );
    },
    preload: true,
  });

  $("#pagi-filter #EMP_ID_").qbe({
    defid: "operator",
    onSelect: function () {
      $.dui.page.getdata(true);
    },
  });
  $("#ticket #EMP_ID").qbe({
    defid: "operator",
    onSelect: function (row) {
      $("#EMP_NAME").textbox("setValue", row.LAST_NAME + " " + row.FIRST_NAME);
    },
  });

  $("#ltdg").datagrid({
    url: "/",
    queryParams: {
      _sqlid: "vwltsa^lticks",
      _func: "get",
      datef: null,
      datet: null,
    },

    onBeforeLoad: function (qp) {
      if (!qp.datef) return false;
    },

    rownumbers: true,
    fit: true,
    checkOnSelect: true,
    singleSelect: true,
    method: "get",
    striped: true,
    toolbar: "#pagi-filter",

    pagePosition: "bottom",
    pagination: true,
    pageList: [25, 50, 100, 250],
    pageSize: 25,

    fitColumns: false,
    columns: [
      [
        {
          field: "EDIT",
          title: "Edit",
          checkbox: true,
          fixed: true,
          width: 100,
        },
        {
          field: "FLAGS",
          title: "Flags",
          fixed: true,
          width: 75,
          align: "center",
          formatter: function (val, row, idx) {
            var divs = "";
            if (row.MODE == "AUTO") var cls = "touch";
            else var cls = "keyb";
            divs += '<div class="' + cls + '" title="Keyboard or Touch"/>';
            var cls = { R: "RUN", S: "SETUP", I: "INDIR" }[
              row.TYPE
            ].toLowerCase();
            divs += '<div class="' + cls + '" title="Type"/>';
            if (row.FIXED_FLAG == "1")
              divs += '<div class="sfix" title="Prev Shift Fixed"/>';
            return divs;
          },
        },

        {
          field: "TRANSACTION_ID",
          title: "ID",
          hidden: true,
          fixed: true,
          width: 100,
        },
        {
          field: "TRANSACTION_DATE",
          title: "Date",
          hidden: true,
          fixed: true,
          width: 100,
        },
        {
          field: "TYPE",
          title: "Type",
          fixed: true,
          width: 50,
          formatter: function (val) {
            return { R: "RUN", S: "SETUP", I: "INDIR" }[val];
          },
        },
        { field: "EMPLOYEE_ID", title: "Operator ID", fixed: true, width: 100 },
        { field: "RESOURCE_ID", title: "Resource ID", fixed: true, width: 100 },
        {
          field: "CLOCK_IN_DATE",
          title: "In Date",
          fixed: true,
          width: 80,
          formatter: iso2str,
        },
        { field: "CLOCK_IN_TIME", title: "In Time", fixed: true, width: 60 },
        {
          field: "CLOCK_OUT_DATE",
          title: "Out Date",
          fixed: true,
          width: 80,
          formatter: iso2str,
        },
        { field: "CLOCK_OUT_TIME", title: "Out Time", fixed: true, width: 60 },
        {
          field: "HOURS_WORKED",
          title: "Hrs",
          fixed: true,
          width: 60,
          align: "right",
          formatter: function (val) {
            if (!val || isNaN(val)) return val;
            return val.toFixed(2);
          },
        },
        {
          field: "HOURS_BREAK",
          title: "Break Hrs",
          fixed: true,
          width: 60,
          align: "right",
          formatter: function (val) {
            if (!val || isNaN(val)) return val;
            return val.toFixed(2);
          },
        },
        {
          field: "GOOD_QTY",
          title: "Qty Pass",
          fixed: true,
          width: 60,
          align: "right",
        },
        {
          field: "BAD_QTY",
          title: "Qty Fail",
          fixed: true,
          width: 60,
          align: "right",
        },
        {
          field: "SETUP_COMPLETED",
          title: "Setup OK",
          hidden: true,
          fixed: true,
          width: 0,
        },
        {
          field: "INDIRECT_ID",
          title: "Indirect",
          fixed: true,
          width: 0,
          hidden: true,
        },
        {
          field: "WOREF1",
          title: "Job Reference",
          hidden: true,
          fixed: true,
          width: 0,
        },
        {
          field: "WOREF",
          title: "Job Reference",
          fixed: true,
          width: 0,
          hidden: true,
        },
        { field: "SITE_ID", title: "Device ID", hidden: true },
        {
          field: "_REF",
          title: "Job or Indirect ID",
          fixed: false,
          width: 160,
          formatter: function (val, row) {
            if (row.TYPE == "I") return "IND: " + row.INDIRECT_ID;
            else return "JOB: " + row.WOREF;
          },
        },
        {
          field: "LAST_MODIFIED_USER_ID",
          title: "Modified By",
          fixed: true,
          width: 80,
        },
        {
          field: "LAST_MODIFIED_DATE",
          title: "Modified Date",
          fixed: true,
          width: 180,
          formatter: iso2str,
        },
      ],
    ],

    onRowContextMenu: function (e, i, row) {
      e.preventDefault();
      return false;
    },

    onCheck: function (idx, dat) {
      $("#ticket form").attr("mode", "upd").form("load", dat);
      $(".lock").removeClass("lock");
      butEn("asxd");

      // eui bug < 4.2 - re-select combos after form load
      $("#TYPE").combobox("reselect");
      ////$('#EMP_ID').combobox('reselect');

      // Get CURRENT Job Qtys
      var pvar = { _func: "get", _sqlid: "vwltsa^opnqty", WOREF: dat.WOREF1 };
      if (dat.WOREF1 != "")
        ajaxget("/", pvar, function (data) {
          $("#REQUIRED_QTY").numberbox("setValue", data.calc_end_qty);
          $("#BAL_QTY").numberbox("setValue", data.balqty);
        });

      var pvar = { _func: "get", _sqlid: "vwltsa^empall", ID: dat.EMPLOYEE_ID };
      if (dat.EMPLOYEE_ID != "")
        ajaxget("/", pvar, function (data) {
          $("#EMP_NAME").textbox(
            "setValue",
            data.LAST_NAME + " " + data.FIRST_NAME
          );
        });

      // Can't change these fields.
      $("#WOREF1").textbox("readonly", true);
      $("#WOREF1").textbox("required", false);
      $("#TYPE").combobox("readonly", true);
      var basid = dat.WOREF1.split("^")[0];
    },
  });

  // on Submit-Success
  $("#tickfrm").on("done", function (me, data) {
    but_clr();
  });
  $.dui.page.getdata();

  /*
    $('#COD').datebox({
      onSelect:function(date){
        $.dui.page.calc_hrs()
      }
    })


    $('#CIT').timespinner({
      onChange:function(){
        $.dui.page.calc_hrs()
      }
    })
    */
});
