$.page.ready(function () {
  // ── Register ──────────────────────────────────────────────────────────────
  $.page.register({
    autonum: { field: "#ID" },
    fn: {
      notes: function (notes) {
        for (var k in notes) {
          var vals = notes[k];
          if (typeof vals == "string") vals = [vals];
          var tgt = $("input[name=" + k + "]");
          var ul = tgt.next("ul.checklist");
          vals.map(function (e) {
            var chk = "";
            ul.append(
              '<li><input type="checkbox" ' +
                chk +
                ' target="' +
                k +
                '"/><label>' +
                e +
                "</label></li>",
            );
          });
        }
        $("ul.checklist input").on("change", function () {
          var me = $(this);
          var tgt = $("input[textboxname=" + me.attr("target") + "]");
          var val = tgt.textbox("getValue");
          var txt = me.next("label").text();
          if (val.indexOf(txt) == -1) {
            if (val.length > 0) val += "\r\n";
            tgt.textbox("setValue", val + txt);
          }
        });
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
        /*
        for (var k in $.dui.bhave) {
          var bits = k.split("CBO_");
          if (bits.length == 2) {
            var data = jsonParse($.dui.bhave[k]);
            var reg = new RegExp(/\*$/);
            if (data) {
              data.map(function (e) {
                if (e.value.endsWith("*")) {
                  e.selected = true;
                  e.value = e.value.replace(reg, "");
                  e.text = e.text.replace(reg, "");
                }
              });
            }
            $("input[name=" + bits[1] + "]").combobox({
              data: data,
              panelHeight: "auto",
              editable: false,
            });
          }
        }*/
      },
      /*
      combos: function (cbos) {
        for (var k in cbos) {
          var opt = {
            data: [],
            panelHeight: "auto",
            editable: false,
          };
          cbos[k].map(function (e) {
            var def;
            if (e.indexOf("*") != -1) def = true;
            var val = e.replace("*", "").trim();
            var obj = { value: val, text: val };
            if (def) opt.value = val;
            opt.data.push(obj);
          });
          $("input[name=" + k + "]").combobox(opt);
        }
      },
      */
      onBeforePrint: function (vars, cb) {
        var id = $("#ID").searchbox("getValue");
        var inspector = $("#USER_ID").combobox("getValue");
        if (!id) return cb({ error: true, msg: "Select a TEST ID first." });
        var status = $("#STATUS").textbox("getValue");
        if (status != "COMPLETED")
          return cb({ error: true, msg: "Status must be COMPLETED." });
        if (status == "COMPLETED") {
          if (inspector == "")
            return cb({ error: true, msg: "Inspector By cannot be blank." });
        }
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
          fdat._sqlid = "dqm^phosman_clone";
          fdat._func = "get";
          fdat.SOURCE_ID = $("#ID").searchbox("getValue");
          ajaxget("/", fdat, function (data) {
            if (data.error) msgbox(data.msg);
            else
              msgbox(
                "New Phosman ID," +
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
  $.page.fn.notes({
    ENV_NOTES: [
      "Final blast cleaning and coating application shall not take place unless the surface temperature is at least 5\u00b0 F above the dew point temperature.",
      "Atmospheric conditions for coating application must be recorded to ensure part does not have moisture on it at the time of application.",
      "If applicable, after Touch\u2013Up, Holiday Test must be re-performed to verify surfaces are Holiday free prior to final acceptance.",
    ],
    PRE_NOTES: "Performed receiving inspection. Part is acceptable.",
  });

  $.page.fn.cbos();

  // ── Rules ─────────────────────────────────────────────────────────────────
  $("#INS_STD_REQD").combobox({
    onSelect: function (rec) {
      $("#INS_VIS_METHOD").textbox("setValue", rec.INS_VIS_METHOD);
      $("#ADH_METHOD").textbox("setValue", rec.ADH_METHOD);
    },
  });

  $("#jobreload").on("click", function () {
    $("#BASE_ID").searchbox("reselect");
  });

  $("#USER_ID").combobox({
    onSelect: function (rec) {
      $("#USER_NAME").val(rec.name_last + ", " + rec.name_first);
    },
  });

  $("#BASE_ID").searchbox({
    onSelect: function (rec) {
      if (eui.isloading("#main")) return;
      ajaxget(
        "/",
        {
          _func: "get",
          _sqlid: "dqm^coatman_job_details",
          BASE_ID: rec.value,
        },
        function (data) {
          $("#main").form("preload", data.job[0]);
          $("#TRACE_ID").textbox("setValue", data.job[0].BASE_ID);

          $("#ENV_START_PHOS").datetimebox("setValue", data.vweb[0].MIN_IN);
          $("#ENV_END_PHOS").datetimebox("setValue", data.vweb[0].MAX_OUT);
          $("#ENV_START_INSPECT").datetimebox(
            "setValue",
            data.inspect[0].MAX_OUT,
          );

          var jobqty = $("#QTY");
          var qty =
            data.job[0].WO_QTY -
            data.job[0].TTL_OK_QTY -
            data.job[0].TTL_REJECT_QTY;
          jobqty.numberspinner("setValue", qty);
          jobqty.numberspinner("set", { min: 0, max: qty });

          $("#QTY_ACCEPTABLE").numberspinner("set", { min: 0, max: qty });
        },
      );
    },
  });

  $("#ID").searchbox({
    onChange: function (nv, ov) {
      var tf = "enable";
      if (nv == "") tf = "disable";
      $("#clone").linkbutton(tf);
    },
  });

  $("select[grpid]").on("change", function () {
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

    $("#ENV_WET_INSPECT").combobox("setValue", "N/A");
    $("#ENV_DRY_INSPECT").combobox("setValue", "N/A");
    $("#ENV_RH_INSPECT").combobox("setValue", "N/A");
    $("#ENV_DEW_INSPECT").combobox("setValue", "N/A");

    var inspector = $("#USER_ID");
    inspector.combobox("required", false);
  });

  $("#STATUS").combobox({
    onChange: function (nv, ov) {
      var inspector = $("#USER_ID");
      if (nv == "PENDING") inspector.combobox("required", false);
      else inspector.combobox("required", true);
    },
  });

  $("#QTY").numberspinner({
    onChange: function (nv, ov) {
      var okqty = $("#QTY_ACCEPTABLE");
      okqty.numberspinner("set", { min: 0, max: nv });
      okqty.numberspinner("setValue", nv);
    },
  });

  $("#QTY_ACCEPTABLE").numberspinner({
    onChange: function (nv, ov) {
      var rejqty = $("#QTY_REJECTED");
      var qty = $("#QTY").numberspinner("getValue");
      if (nv > qty * 1) {
        $("#QTY_ACCEPTABLE").numberspinner("setValue", qty);
        var bal = 0;
      } else var bal = qty - nv;
      rejqty.numberspinner("readonly", true);
      rejqty.numberspinner("set", { min: 0, max: bal });
      rejqty.numberspinner("setValue", bal);
    },
  });

  // ── Form handlers ─────────────────────────────────────────────────────────
  $("form#main").on("loadDone", function (jq, data) {
    if (data.ID) $("#clone").button("enable");

    var inspector = $("#USER_ID");
    if (data.STATUS == "PENDING") inspector.combobox("required", false);
    else inspector.combobox("required", true);

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
