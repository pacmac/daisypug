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
      },

      onBeforePrint: function (vars, cb) {
        var id = $("#ID").searchbox("getValue");
        if (!id) return cb({ error: true, msg: "Select a TEST ID first." });
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
          fdat._sqlid = "dqm^coatman_clone";
          fdat._func = "get";
          fdat.SOURCE_ID = $("#ID").searchbox("getValue");
          ajaxget("/", fdat, function (data) {
            if (data.error) msgbox(data.msg);
            else
              msgbox(
                "New Test ID," +
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

  $("#INS_DFT_QNID").combobox({
    onLoadSuccess: function (data) {
      [
        "INS_WIPE_QNID",
        "VIS_PHOS_QNID",
        "VIS_PRIMER_QNID",
        "VIS_COAT_QNID",
        "ADH_QNID",
      ].map(function (e) {
        $("input[textboxname=" + e + "]").combobox("loadData", data);
      });
    },
  });

  // ── Rules ─────────────────────────────────────────────────────────────────
  $("#INS_STD_REQD").combobox({
    onSelect: function (rec) {
      $("#INS_VIS_METHOD").textbox("setValue", rec.INS_VIS_METHOD);
      $("#ADH_METHOD").textbox("setValue", rec.ADH_METHOD);
    },
  });

  $("#USER_ID").combobox({
    onSelect: function (rec) {
      $("#USER_NAME").val(rec.name_last + ", " + rec.name_first);
    },
  });

  $("#ADH_METHOD").combobox({
    onSelect: function (rec) {
      $("#ADH_DESC").textbox("setValue", rec.desc);
    },
  });

  $("#BASE_ID").searchbox({
    onSelect: function (rec) {
      if (eui.isloading("#main")) return;
      ajaxget(
        "/",
        {
          _func: "get",
          _sqlid: "dqm^coatman_job",
          BASE_ID: rec.value,
        },
        function (data) {
          $("#main").form("preload", data);
        },
      );
    },
  }); /*.combobox('filtertip',{
    default: ['R'],
    field: 'STATUS',
    data: [
      {name:'R',text:'Released'},
      {name:'U',text:'Un-Released'},
      {name:'C',text:'Closed'},
      {name:'X',text:'Cancelled'},
    ]
  });*/

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
  });

  // ── Form handlers ─────────────────────────────────────────────────────────
  $("form#main").on("loadDone", function (jq, data) {
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
  /*.on("changed", function (jq, data) {
      var opts = $(this).form("options");
      if (!opts.loading) {
        butEn("sadx");
      }
    });*/

  // ── Deferred init ─────────────────────────────────────────────────────────
  setTimeout($.page.fn.init);
});
