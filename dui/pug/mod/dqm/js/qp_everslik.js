$.page.ready(function () {
  // ── Register ──────────────────────────────────────────────────────────────
  $.page.register({
    autonum: { field: "#ID" },
    fn: {
      sales: function (row) {
        var flds = {
          SALES_ORDER_ID: "~",
          SALES_ORDER_LINE_NO: "LINE_NO",
          PART_ID: "~",
          CUSTOMER_ID: "CUST_ID",
          CUST_PART_ID: "~",
          CUST_PART_DESCRIPTION: "~",
          USER_1: "USER_1",
          USER_2: "USER_2",
        };
        for (var f in flds) {
          if (flds[f] == "~") $("#" + f).textbox("setValue", row[f]);
          else $("#" + f).textbox("setValue", row[flds[f]]);
        }
      },

      cbos: function () {
        for (var k in $.dui.bhave) {
          var bits = k.split("CBO_");
          if (bits.length == 2) {
            $("[name=" + bits[1] + "]").combobox({
              data: jsonParse($.dui.bhave[k]),
              panelHeight: "auto",
              editable: false,
            });
          }
        }

      },

      onBeforePrint: function (vars, cb) {
        var id = $("#ID").searchbox("getValue");
        if (!id)
          return cb({ error: true, msg: "Select an Everslik ID first." });
        var status = $("#STATUS").textbox("getValue");
        if (status != "COMPLETED")
          return cb({ error: true, msg: "Status must be COMPLETED." });
        return cb();
      },

      grpid: function (me, val) {
        var grp = me.attr("grpid");
        if (grp) {
          var tf = val != "N/A";
          var vals = $(grp).find("select, input, textarea").not(me);
          $.each(vals, function () {
            var el = $(this);
            var req = el.attr("ini-req");
            if (el.is("select")) {
              if (req && tf) { el.prop("required", true).addClass("required-field validator"); }
              else { el.prop("required", false).removeClass("required-field validator"); }
              el.prop("disabled", !tf);
              if (!tf) el.val("");
            } else {
              if (req && tf) { el.prop("required", true).addClass("required-field validator"); }
              else { el.prop("required", false).removeClass("required-field validator"); }
              el.prop("readonly", !tf);
              if (!tf) el.val("");
            }
          });
        }
      },

      init: function () {
        $.each($("form#main").find("select, input, textarea").not("[type=hidden]"), function () {
          var me = $(this);
          if (me.prop("readonly")) me.attr("ini-ron", true);
          if (me.prop("required") || me.hasClass("required-field")) me.attr("ini-req", true);
        });
      },

      clone: function () {
        confirm(function (ok) {
          if (!ok) return;
          var fdat = {};
          fdat._sqlid = "dqm^everslik_clone";
          fdat._func = "get";
          fdat.SOURCE_ID = $("#ID").searchbox("getValue");
          ajaxget("/", fdat, function (data) {
            if (data.error) msgbox(data.msg);
            else
              msgbox(
                "New Everslik ID," +
                  data._next +
                  " cloned from " +
                  fdat.SOURCE_ID +
                  " . Please check",
              );
            $("#ID").searchbox("setValue", data._next);
            $("#ID").searchbox("reload");
          });
        });
      },
    },
  });

  // ── Toolbar ───────────────────────────────────────────────────────────────
  toolbut([
    {
      id: "clone",
      text: "Clone Test",
      iconCls: "icon-clone",
      disabled: true,
      noText: true,
      onClick: $.page.fn.clone,
    },
    {},
  ]);

  // ── Init ──────────────────────────────────────────────────────────────────
  $.page.fn.cbos();

  if ($.dui.bhave.PRE_INSPECT_NOTES) {
    $("#PRE_INSPECT_NOTES").val($.dui.bhave.PRE_INSPECT_NOTES);
  }

  $("input.equip").qbe({ defid: "gauge_ids" });

  // ── Rules ─────────────────────────────────────────────────────────────────
  $("#USER_ID").combobox({
    onSelect: function (rec) {
      var fullName = rec.name_last + ", " + rec.name_first;
      $("#USER_NAME").val(fullName);
      $("#PRE_INSPECTOR").textbox("setValue", fullName);
    },
  });

  $("#WOREF").searchbox({
    onSelect: function (rec) {
      $.page.fn.sales(rec);
    },
  });

  $("#ID").searchbox({
    onChange: function (nv, ov) {
      var tf = "enable";
      if (nv == "") tf = "disable";
      $("#clone").linkbutton(tf);
    },
  });

  $("[grpid]").on("change", function () {
    var me = $(this);
    $.page.fn.grpid(me, me.val());
  });

  // This WILL override previous grpid.
  $(".comply").on("change", function () {
    var me = $(this);
    var val = me.val().toLowerCase();
    if (val == "reject" || val == "fail") var cls = "bg-red";
    else var cls = "bg-grn";
    me.removeClass("bg-red").removeClass("bg-grn").addClass(cls);
    $.page.fn.grpid(me, me.val());
  });

  // ── Add handler ───────────────────────────────────────────────────────────
  $("#but_add").on("done", function (jq) {
    roclr(true);
  });

  // ── Form handlers ─────────────────────────────────────────────────────────
  $("form#main").on("loadDone", function (jq, data) {
    $.page.fn.sales(data);
    if (data.ID) $("#clone").button("enable");

    // Status colour
    if (data.STATUS == "COMPLETED") var cls = "bg-grn";
    else var cls = "";
    $("#STATUS").textbox("textbox").removeClass("bg-grn").addClass(cls);

    // Re-evaluate grpid fields on load
    $("select[grpid]").each(function () {
      var me = $(this);
      $.page.fn.grpid(me, me.val());
    });

    // Complete lock (bhave)
    var lock = $.dui.bhave.COMPLETE_LOCK || "y";
    if (lock != "y") return;
    if (cls) roset(true);
    else roclr(true);
  });

  // ── Deferred init ─────────────────────────────────────────────────────────
  setTimeout($.page.fn.init);
});
