// ========================================================================
// Functions
// ========================================================================

// Print validation + status update
$.page.fn.onBeforePrint = function (vars, cb) {
  if (vars._xldata !== "dqm^coc_man^coc") return cb();

  var coc = $("#COC_ID").searchbox("getValue");
  if (!coc) return cb({ error: true, msg: "Select a COC first." });

  var pv = $("#PRINTED"),
    st = $("#STATUS");
  if (!pv.datebox("getValue")) {
    st.combobox("setValue", "PRINTED");
    pv.datebox("today");
    var vars = {
      _func: "upd",
      _sqlid: "dqm^coc",
      COC_ID: coc,
      STATUS: st.combobox("getValue"),
      PRINTED: pv.datebox("getValue"),
    };

    ajaxget("/", vars, function (res) {
      if (res.error) {
        $("#STATUS").combobox("setValue", "PENDING");
        pv.datebox("clear");
        $.page.fn.pstat();
        msgbox("Cannot save, please try again.");
        return cb({ error: true });
      } else {
        $.page.fn.pstat();
        cb();
      }
    });
  } else return cb();
};

// Status colour coding
$.page.fn.pstat = function () {
  var stat = $("#STATUS").combobox("getValue");
  var pin = $("input[name=STATUS]").prev("input.textbox-text");
  var cls = { PRINTED: "bg-grn", PENDING: "bg-ora", VOID: "bg-red" }[stat];
  pin.removeClass("bg-grn bg-red bg-ora").addClass(cls);
};

// Calculate COC qty balance
$.page.fn.cocqty = function (data) {
  var fd = frm2dic($("form#coc"));
  var bal = parseFloat(fd.WO_QTY - data.COC_QTY);
  if (bal < 0) bal = 0;
  $("#COC_QTY").numberbox("setValue", data.COC_QTY);
  $("#WO_QTY_BAL").numberbox("setValue", bal);
  var qty = $("#QTY");
  qty.numberspinner("set", { min: 0, max: bal });
  qty.numberspinner("setValue", bal);
  qty.numberspinner("readonly", false);
};

// Load ISSUED_BY combo data via ajax
$.page.fn.uid = function () {
  var vars = { _func: "get", _sqlid: "dqm^uidall" };
  ajaxget("/", vars, function (data) {
    $("#ISSUED_BY").combobox({
      editable: false,
      data: data.uid,
    });
  });
};

// Datagrid check/uncheck handler — enforce one-per-type selection
$.page.fn.dgoncheck = function (idx, row) {
  var dg = $(this);
  if ($(this).data("loading")) return;
  var sels = $(this).datagrid("getChecked");
  var ids = [];
  sels.map(function (e) {
    if (e.TYPE == row.TYPE) {
      var ei = dg.datagrid("getRowIndex", e);
      if (parseInt(idx) != ei) dg.datagrid("uncheckRow", ei);
    }
    ids.push(e.ID);
  });
  $("#BOILER_IDS").val(ids.join(","));
};

// Load datagrid with pre-checked rows
$.page.fn.dgonload = function (dg, ids) {
  dg.datagrid("uncheckAll");
  if (!ids) return;
  ids.replace(/\s/g, "").split(",");
  dg.data("loading", true);
  var rows = dg.datagrid("getRows");
  rows.map(function (e, i) {
    var act = "uncheckRow";
    if (ids.indexOf(e.ID) != -1) act = "checkRow";
    dg.datagrid(act, i).datagrid("unselectRow", i);
  });
  dg.data("loading", false);
};

// Get open material balance qty
$.page.fn.opn_material = function (rec) {
  var fd = frm2dic($("form#coc"));
  var vars = {
    _func: "get",
    _sqlid: "dqm^coc_woref_opn_material",
    BASE_ID: rec.value,
    COC_RESOURCE: $.dui.bhave["COC_RESOURCE"],
  };
  ajaxget("/", vars, function (data) {
    return data;
  });
};

// WO selection — load job data and COC quantities
$.page.fn.woselect = function (rec) {
  var fd = frm2dic($("form#coc"));
  var vars = {
    _func: "get",
    _sqlid: "dqm^coc_wocheck",
    BASE_ID: rec.value,
    COC_RESOURCE: $.dui.bhave["COC_RESOURCE"],
    RESOURCE_ID: $.dui.bhave["COC_RESOURCE"],
    IGNORED_RESOUCES: $.dui.bhave["COC_IGNORED_RESOURCES"],
    WOREF: fd.WOREF,
    COC_ID: fd.COC_ID || "_NONE_",
  };

  ajaxget("/", vars, function (data) {
    // Don't overwrite COC details with default JOB details
    if (fd.COC_ID || $.page.fn.mode == "dupe") {
      [
        "NAME",
        "ADDR1",
        "ADDR2",
        "ADDR3",
        "CONTACT_PERSON",
        "CONTACT_PHONE",
        "CONTACT_FAX",
        "CONTACT_EMAIL",
        "REMARKS",
        "DESCRIPTION",
      ].map(function (e) {
        delete data.coc_woref[e];
      });
    }

    if ($.dui.bhave["ALLOW_NCR"] == "n") {
      if (data.coc_woref.NCRS > 0) {
        msgbox("This JOB has open NCRs");
        return but_add();
      }
    }

    // OK — load form data
    $.page.fn.fload = true;
    var frm = $("form#coc");
    frm.form("preload", data.coc_woref);
    $.page.fn.fload = false;
    $.page.fn.cocqty(data.coc_totalqty);

    if ($.dui.bhave["ALLOW_OPEN_OPN"] == "n") {
      msgbox(
        "**<b>Allows minimum completed qty in Prior Opn set to NO.</b>**\n COC Qty cannot more than minimum completed quantity," +
          rec.MIN_OPN_COMPLETED_QTY +
          ", of all the preceding operations",
      );
    }
  });
};

// Clone field deletion
$.page.fn.clonedel = function (clone) {
  [
    "ROWID",
    "COC_ID",
    "WOREF",
    "CREATE_DATE",
    "ISSUED_BY",
    "ISSUED_BY_POSITION",
    "ISSUED_BY_EMAIL",
    "STATUS",
    "VOIDED_DATE",
    "ISSUED_USER",
    "QTY",
    "PRINTED",
  ].map(function (e) {
    delete clone[e];
  });
  return clone;
};

// Reload WOREF combo with bhave params
$.page.fn.worload = function () {
  $("#WOREF").combobox(
    "reload",
    "/?_func=get&_combo=y&_sqlid=dqm^basids_coc&ALLOW_NCR=" +
      $.dui.bhave["ALLOW_NCR"] +
      "&ALLOW_OPEN_OPN=" +
      $.dui.bhave["ALLOW_OPEN_OPN"] +
      "&COC_RESOURCE=" +
      $.dui.bhave["COC_RESOURCE"] +
      "&IGNORED_RESOURCES=" +
      $.dui.bhave["COC_IGNORED_RESOURCES"],
  );
};

// Void status toggle — show/hide void reason field
$.page.fn.dovoid = function () {
  var stat = $("#STATUS").combobox("getValue");
  var vr = $("#VOID_REASON"),
    div = $("#voiditem");
  if (stat == "VOID") {
    div.show();
    if (vr.textbox("getValue") == "") {
      vr.textbox("required", true);
      vr.textbox("readonly", false);
    } else {
      vr.textbox("required", false);
      vr.textbox("readonly", true);
    }
  } else {
    div.hide();
    vr.textbox("required", false);
  }
};

// ========================================================================
// Datagrid formatters
// ========================================================================

$.page.fn.fmtType = function (val) {
  if (!val) val = "SPEC";
  return { CONFORM: "Conformance", WARRANTY: "Warranty", PATENT: "Patents" }[
    val
  ];
};

$.page.fn.fmtDefault = function (val) {
  if (val == "Y") return "<strong>Yes</strong>";
  return "No";
};

// ========================================================================
// Init
// ========================================================================

$.page.ready(function () {
  // ========================================================================
  // Init
  // ========================================================================

  // Update user field labels from bhave
  for (var key in $.dui.bhave) {
    $("label#" + key).text($.dui.bhave[key]);
  }

  // PRINTED_DEL linkbutton
  $("#PRINTED_DEL").linkbutton({
    onClick: function () {
      $("#PRINTED").datebox("clear");
    },
  });

  // Load ISSUED_BY combo data
  $.page.fn.uid();

  // ========================================================================
  // Fkey
  // ========================================================================

  // STATUS combo — static data with onSelect
  $("#STATUS").combobox({
    readonly: "true",
    panelHeight: "auto",
    data: [
      { value: "PENDING", text: "PENDING", selected: true },
      { value: "PRINTED", text: "PRINTED" },
      { value: "VOID", text: "VOID" },
    ],
    onSelect: $.page.fn.dovoid,
  });

  // COC_ID filtertip
  /*
  $('#COC_ID').combobox('filtertip', {
    default: ['PENDING'],
    field: 'STATUS',
    data: [
      { name: 'PENDING', text: 'PENDING' },
      { name: 'PRINTED', text: 'PRINTED', nosave: true },
      { name: 'VOID', text: 'VOID', nosave: true }
    ]
  });
 */
  // COC_ID combo — onLoadSuccess + groupFormatter
  $("#COC_ID").searchbox({
    onLoadSuccess: function (data) {
      var opt = $(this).combobox("options");
      if (opt.autoload) $(this).combobox("select", opt.autoload);
      delete opt.autoload;
    },
    groupFormatter: function (val) {
      return "STATUS: " + val;
    },
  });

  // WOREF combo — job selection with complex onSelect
  $("#WOREF").combobox({
    groupField: "WO_CLASS",
    editable: true,
    validType: ["inList"],
    required: true,
    method: "get",
    onSelect: function (rec) {
      if ($.page.fn.mode == "clone") return $.page.fn.woselect(rec);

      $.page.fn.mode = "add";

      if ($.dui.bhave["ALLOW_OPN_PART"] == "n") {
        var vars = {
          _func: "get",
          _sqlid: "dqm^coc_woref_opn_material",
          BASE_ID: rec.value,
          COC_RESOURCE: $.dui.bhave["COC_RESOURCE"],
        };
        ajaxget("/", vars, function (data) {
          if (data.MAT_BAL > 0) {
            msgbox(
              '<font color="red">**<b>Unissued Materials Ops Prior set to NO.</b>**</font><br>Materials not fully issued prior to ' +
                $.dui.bhave["COC_RESOURCE"] +
                ".<br>Please check.(" +
                rec.value +
                ")",
            );
            return but_add();
          } else {
            if (rec.COC_QTY > 0) {
              $.messager.confirm(
                "Please Confirm",
                "Copy previous COC details ?",
                function (ok) {
                  if (ok) {
                    $.page.fn.mode = "dupe";
                    ajaxget(
                      "/",
                      {
                        _sqlid: "dqm^coc_last",
                        _func: "get",
                        WOREF: rec.value,
                      },
                      function (clone) {
                        if (clone.STATUS == "VOID")
                          msgbox(clone.COC_ID + " status was VOID.");
                        clone = $.page.fn.clonedel(clone);
                        $("form#coc").form("preload", clone);
                        $.page.fn.woselect(rec);
                      },
                    );
                  } else $.page.fn.woselect(rec);
                },
              );
            } else $.page.fn.woselect(rec);
          }
        });
      } else {
        if (rec.COC_QTY > 0) {
          $.messager.confirm(
            "Please Confirm",
            "Copy previous COC details ?",
            function (ok) {
              if (ok) {
                $.page.fn.mode = "dupe";
                ajaxget(
                  "/",
                  { _sqlid: "dqm^coc_last", _func: "get", WOREF: rec.value },
                  function (clone) {
                    if (clone.STATUS == "VOID")
                      msgbox(clone.COC_ID + " status was VOID.");
                    clone = $.page.fn.clonedel(clone);
                    $("form#coc").form("preload", clone);
                    $.page.fn.woselect(rec);
                  },
                );
              } else $.page.fn.woselect(rec);
            },
          );
        } else $.page.fn.woselect(rec);
      }
    },
  });

  // ========================================================================
  // Field rules
  // ========================================================================

  // ISSUED_BY — populate position/email/uid on select
  $("#ISSUED_BY").combobox({
    onSelect: function (data) {
      $("#ISSUED_BY_POSITION").textbox("setValue", data.position);
      $("#ISSUED_BY_EMAIL").textbox("setValue", data.email);
      $("#ISSUED_BY_USER").textbox("setValue", data.userid);
    },
  });

  // ========================================================================
  // Form events
  // ========================================================================

  // After Add button
  $("#but_add").on("done", function (me, data) {
    $.page.fn.setqty = true;
    $("#ISSUED_BY").combobox("unselect");
    $("#ISSUED_BY").combobox("selected");
    $.page.fn.worload();
  });

  $("#but_add").on("done", function (me, data) {
    $("#STATUS").combobox("setValue", "PENDING");
    $.page.fn.dovoid();
    $("#WOREF").combobox("readonly", false);
    $(".cocbals").show();

    // Check the default boiler plates
    var dg = $("#cocspec");
    dg.datagrid("getRows").map(function (e, i) {
      if (e.DEFAULT_VAL == "Y") dg.datagrid("checkRow", i);
    });
  });

  // beforeSubmit validation
  $("form#coc").on("beforeSubmit", function (me, data) {
    var fdata = frm2dic($(this));
    if (fdata.QTY == 0) {
      msgbox("COC Qty must be greater than zero.");
      return false;
    }
    if (fdata.PRINTED && !$.page.fn.printed && fdata.STATUS != "VOID") {
      msgbox("Cannot change a printed COC.");
      return false;
    }
  });

  // ========================================================================
  // Form loadDone
  // ========================================================================

  $("form#coc").on("loadDone", function (me, data) {
    var fdata = frm2dic($(this));
    if ($.page.fn.fload) return;
    $.page.fn.dgonload($("#cocspec"), data.BOILER_IDS);
    $.page.fn.setqty = false;

    if ($.page.fn.mode != "dupe") {
      $(this).form("reselect");
    }

    // Readonly control based on status
    switch (fdata.STATUS) {
      case "PENDING":
        roclr(true);
        $("#STATUS").combobox("readonly", true);
        $("#QTY").numberspinner("readonly", true);
        $("#WOREF").combobox("readonly", true);
        break;

      case "PRINTED":
        roset(true);
        ajaxget(
          "/",
          { _sqlid: "admin^bhave", _func: "get", appid: "sales^sa_ship" },
          function (bhv) {
            if (bhv.COC_LINK == "y") {
              if (fdata.SHIPPED == "Y")
                var st = [{ value: "PRINTED", text: "PRINTED" }];
              else
                var st = [
                  { value: "PRINTED", text: "PRINTED" },
                  { value: "VOID", text: "VOID" },
                ];
            } else
              var st = [
                { value: "PRINTED", text: "PRINTED" },
                { value: "VOID", text: "VOID" },
              ];
            $("#STATUS").combobox("loadData", st).combobox("readonly", false);
          },
        );
        break;

      case "VOID":
        roset(true);
        break;
    }

    $("#cifiles").datagrid("docFiles", $.page.fn.fkey);
    $.page.fn.pstat();
    if (fdata.STATUS == "VOID") butEn("ax");
    else butEn("axs");
  });

  // ========================================================================
  // Grids
  // ========================================================================

  // cocspec datagrid — JS opts for callbacks
  $.page.fn.cocspecOpts = {
    onBeforeSelect: function () {
      return false;
    },
    onCheck: $.page.fn.dgoncheck,
    onUncheck: $.page.fn.dgoncheck,
  };
  $("#cocspec").datagrid($.page.fn.cocspecOpts);
  $("#cocspec").datagrid("load");

  // ========================================================================
  // Toolbar buttons
  // ========================================================================

  toolbut([
    {
      id: "print_coc",
      iconCls: "icon-form",
      text: "Print COC",
      disabled: false,
      noText: true,
      onClick: function () {
        printmen({ id: "dqm^coc_man^coc" });
      },
    },
    {},
  ]);
});
