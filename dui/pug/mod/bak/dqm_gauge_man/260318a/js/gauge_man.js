// ON-DEMAND TABS
$("#gmtabs")
  .tabs({
    onSelect: function (tit, idx) {
      var fdat = frm2dic($("form#gauge"));
      switch (tit) {
        case "Attachments":
          $("#gmfiles").datagrid("docFiles", $.page.fn.fkey);
          break;

        case "Test Results":
          $("#calids").combobox(
            "reload",
            "?_sqlid=dqm^qt_ids&_func=get&GAUGE_ID=" + fdat.ID
          );
          break;

        case "User Fields":
          $("#UDF_LAYOUT_ID").combobox(
            "reload",
            "/?_func=get&_sqlid=admin^udfid&_combo=y"
          );
          break;
        case "RentalX":
          //console.log(jsonParse($.dui.bhave.CBO_OUTSIDE_DIAMETER));
          $("#GAUGE_RENT_DIAMETER").combobox({
            data: jsonParse($.dui.bhave.CBO_OUTSIDE_DIAMETER),
          });
          break;
      }
    },
  })
  .tabs("disableAll");

/*
$('#gmtabs').tabs({
  onSelect:function(tit,idx){
    tabcombos($(this));
  }
}) 
*/

// when user select different layout
$("form#gauge input#UDF_LAYOUT_ID").combobox({ onSelect: setudfs });

// build description
$.page.fn.gendesc = function () {
  var typ = $("#GAUGE_TYPE").combobox("getField", "DESCRIPTION");
  if (typ !== undefined) typ += ", ";
  else typ = "";
  var ran = $("#RANGE").textbox("getValue");
  $("#DESCRIPTION").textbox("setValue", typ + ran);
};

// MANUAL OR AUTO-NUMBERING
$.page.fn.automan = function () {
  var gid = $("#GAUGE_ID");
  if ($.dui.bhave.autonum == "AUTO") {
    butEn("nsdx");
    gid.addClass("autonum").removeAttr("required");
  } else {
    butEn("asdx");
    gid.removeClass("autonum").attr("required", "required");
  }
};

// Creat & Build The Gauge Types Menus.
$.page.fn.menus = function (data) {
  var addmenu = $("#addmenu");

  addmenu.menu({
    onClick: function (item) {
      //console.log(item);
      if (!item.name) return false;
      //else if(item.name=='GaugeType') {
      but_add();
      if ($.dui.bhave.autonum == "AUTO") {
        $("#GAUGE_TYPE").combobox("setValue", item.name);
        $('input[name="GAUGE_TYPE"]').removeAttr("disabled");
      }
      //}
    },
  });

  var item = addmenu.menu("findItem", "GaugeType");
  var vars = { _func: "get", _sqlid: "dqm^gaugeType" };
  for (var i in data) {
    addmenu.menu("appendItem", {
      parent: item.target,
      name: data[i].value,
      text: data[i].text,
      iconCls: "icon-micrometer",
    });
  }
  butEn("ndx");
};

// calculate due / overdue.
$.page.fn.due = function () {
  var dd = $("#DUE_DATE");
  var ddi = dd.next("span.textbox").find("input.textbox-text");
  var now = new Date();
  var date = new Date(dd.textbox("getValue"));
  var due = parseInt($("#DUE_DATE_ALERT_DAYS").numberspinner("getValue"));
  var days = parseInt((now - date) / 1000 / 60 / 60 / 24);
  var txt = Math.abs(days);

  //cl('due:'+due+', days:'+days+', txt:'+txt+',now:'+parseInt((now-date)/1000/60/60/24));
  ddi.removeClass("bg-ora bg-red bg-grn");
  if (days > 0) {
    if ($.dui.bhave.duealert == "y")
      alert("Gauge has expired by " + txt + " days.");
    ddi.addClass("bg-red");
  } else if (due > txt) {
    if ($.dui.bhave.duealert == "y")
      alert("Gauge calibration due in " + txt + " days.");
    ddi.addClass("bg-ora");
  } else {
    ddi.addClass("bg-grn");
  }
};

// set page defaults
$.page.fn.bhave = function () {
  $.page.fn.automan();
  $("#DUE_DATE_ALERT_DAYS").val($.dui.bhave.alertdays);
  $("#CALDAYS_1").val($.dui.bhave.caldays1);
  $("#CALDAYS_2").val($.dui.bhave.caldays2);
};

// Last Transaction.
$.page.fn.lasttx = function (data) {
  if (!data || !data.TYPE) return;
  var bits = data.TYPE.split("-");
  var io = bits[1],
    mode = bits[0],
    txt = [io];
  if (io == "OUT") txt.push(mode, data.DOC_ID.split("^").join("."));
  if (data.NOTES) txt.push(data.NOTES);
  $("#LAST_TX").textbox("setValue", txt.join(", "));
};

// Wait for Document Load
$.page.ready(function () {
  $("#GAUGE_ID").qbe({ defid: "gauge_ids" });

  $.page.fn.bhave(); // do this ## FIRST ##

  toolbut([
    {
      id: "calibrate",
      iconCls: "icon-calibrate",
      text: "Calibrate",
      noText: true,
      disabled: true,
      onClick: function () {
        var qpid = $("input#PLAN_ID").textbox("getValue");
        if (!qpid) return false;
        //var gid = $("#GAUGE_ID").combobox("getValue");
        var gid = $("#GAUGE_ID").qbe("getValue");

        // PAC-150918 - qpid^gaugeid
        loadpage("dqm^qp^qp_test&newgauge=" + qpid + "^" + gid);
      },
    },

    {
      id: "rename",
      iconCls: "icon-rename",
      text: "Rename",
      disabled: true,
      noText: true,
      onClick: function () {
        //var gid = $("#GAUGE_ID").combobox("getValue");
        var gid = $("#GAUGE_ID").qbe("getValue");

        if (!gid) return;
        else {
          confirm(function (yn) {
            if (yn) {
              var cid = $("#RENAME_GAUGE_ID");
              //var gid = $("#GAUGE_ID").combobox("getValue");
              cid.textbox("readonly", true);
              if (gid) cid.textbox("setValue", gid);
              $("#gaugerenameopt").dialog("open");
            }
          }, `This rename is permanent(${gid}), are you sure ?`);
        }
      },
    },
    {
      id: "copy_text",
      iconCls: "icon-copy",
      text: "Copy text",
      noText: true,
      onClick: function () {
        $("#GAUGE_ID").textbox("readonly", false);
        var tempG = $("#GAUGE_ID").textbox("getValue");
        var $temp = $("<input>");
        $("body").append($temp);
        $temp.val(tempG).select();
        document.execCommand("copy");
        $temp.remove();
        alert(`Text ${tempG} copied to clipboard!`);
      },
    },
    {},
  ]);

  //$('#GAUGE_ID').combobox('options').dgcol = {'value':'Value','text':'Text','DESCRIPTION':'Description'}

  // MAIN COMBO
  /*
  $("#GAUGE_ID").combobox({
    onLoadSuccess: function (data) {
      // select if autoload is set.
      var clo = $("#RENAME_GAUGE_ID");
      // var opt = $(this).combobox("options");
      // if (opt.autoload) $(this).combobox("select", opt.autoload);
      // delete opt.autoload;
      clo.combobox({ data: data });
      //$(this).combobox('panel').scrollTop(0);
    },
  });

  */

  //Gauge Rename
  $("a#gaugerenamebtn").linkbutton({
    onClick: function () {
      var src = $("#RENAME_GAUGE_ID").textbox("getValue");
      var newid = $("#NEW_GAUGE_ID").textbox("getValue");

      var tf = false;
      var arr = [
        "`",
        "~",
        "!",
        "@",
        "#",
        "$",
        "%",
        "^",
        "&",
        "*",
        "(",
        ")",
        "=",
        "[",
        "]",
        "{",
        "}",
        "|",
        ">",
        "<",
      ];
      arr.map((a) => {
        if (tf == false) {
          if (newid.indexOf(a) != -1) tf = true;
        }
      });
      if (tf == false) {
        if (src) {
          ajaxget(
            "/",
            { _sqlid: "dqm^gauges", _func: "get", ID: src },
            function (rssrc) {
              var oldid = rssrc.OLD_ID;
              ajaxget(
                "/",
                { _sqlid: "dqm^gauges", _func: "get", ID: newid },
                function (rs) {
                  if (rs.ID) msgbox("Asset ID already exists.");
                  else {
                    ajaxget(
                      "/",
                      {
                        _sqlid: "dqm^gaugeRename",
                        _func: "get",
                        SRC_ID: src,
                        NEW_ID: newid,
                        OLD_ID: oldid,
                        UID: $.dui.udata.userid,
                      },
                      function (res) {
                        if (res.error) return msgbox(res.msg);
                        $("#gaugerenameopt").dialog("close");
                        //$("#GAUGE_ID").combobox("select", newid);
                        //$("#GAUGE_ID").combobox("reload");
                        $("#GAUGE_ID").textbox("setValue", newid);
                      }
                    );
                  }
                }
              );
            }
          );
        }
      } else msgbox("Illegal characters found in New ID," + newid);
    },
  });

  $("#PLAN_ID").combobox({
    onSelect: function (rec) {
      $("a#calnow").linkbutton("enable");
    },
  });
  /*
  $('#OWNER_TYPE').combobox({
    onSelect:function(rec){
      var rtype=$('#GAUGE_ROYALTY_TYPE');
      
      if (rec.value=='owned') rtype.removeAttr('required');
      else rtype.attr('required','required');
    }
  })
*/
  // Initiate New Calibration.
  $("a#calnow").linkbutton({
    onClick: function () {
      var qpid = $("input#PLAN_ID").textbox("getValue");
      if (!qpid) return false;
      //var gid = $("#GAUGE_ID").combobox("getValue");
      var gid = $("#GAUGE_ID").qbe("getValue");

      // PAC-150918 - qpid^gaugeid
      loadpage("dqm^qp^qp_test&newgauge=" + qpid + "^" + gid);
    },
  });

  // Open Calibration Test.
  $("#DOC_REF").textbox({
    icons: [
      {
        iconCls: "icon-godoc",
        handler: function (e) {
          var val = $(e.data.target).textbox("getValue");
          if (val.length < 1) return false;
          loadpage("dqm^qp^qp_test&QPID=" + val);
        },
      },
    ],
  });

  // Description Generator
  $("#DESCRIPTION").textbox({
    icons: [
      {
        iconCls: "icon-og",
        handler: $.page.fn.gendesc,
      },
    ],
  });

  // Gauge-Type combo
  $("#GAUGE_TYPE").combobox({
    onLoadSuccess: function () {
      var data = $(this).combobox("getData");
      if ($.dui.bhave.autonum == "AUTO") $.page.fn.menus(data);
    },
    onChange: function () {
      $.page.fn.gendesc();
    },
  });

  // Select Test
  $("#calids").combobox({
    onSelect: function (rec) {
      ajaxget(
        "?_sqlid=dqm^qt_tree&_func=get&qtref=" + rec.value,
        {},
        function (test) {
          // console.log(test);
          $("input#teststatus").textbox("setValue", test[0].TEST_STATUS);
          $("input#caldate").textbox("setValue", test[0].test.CREATE_DATE);
          var tests = test[0].children;
          var obj = {};
          obj.value = "ALL";
          obj.text = "- ALL -";
          obj.selected = true;
          tests.unshift(obj);
          $("#calseq")
            .combobox("readonly", false)
            .combobox("loadData", tests)
            .combobox("reselect");
          $("#dgtests").datagrid("loadData", []);
        }
      );
    },
  });

  // Select Test Operation
  $("#calseq").combobox({
    onSelect: function (rec) {
      var dg = $("#dgtests");
      var opt = dg.datagrid("options");

      function fixed(val) {
        if (isNaN(val) || val === "") return na;
        else return parseFloat(val).toFixed(5);
      }

      if (rec.value == "ALL") var recs = $(this).combobox("getData").slice(1);
      else var recs = [rec];

      //$('#caldate').textbox('setValue',tz2date(recs[0].proc.CREATE_DATE));

      var na = "-",
        rows = [];
      recs.map(function (rec) {
        for (var t in rec.tests) {
          var idx = parseInt(t),
            row = {};
          row.TEST_ID = rec.id;
          row.PROC_SEQ = rec.tests[t].PROC_SEQ;
          row.TICK_SEQ = rec.tests[t].TICK_SEQ + 1;
          row.LTYPE = rec.proc.LTYPE;
          row.TITLE = rec.proc.TITLE;
          if (rec.proc.LTYPE == "value") {
            row.CRITERIA =
              fixed(rec.proc.VNOM) +
              " " +
              rec.proc.UOM +
              " ( -" +
              fixed(rec.proc.VLOW) +
              " / +" +
              fixed(rec.proc.VUPP) +
              " )";
            row.VALUE = fixed(rec.tests[t].VALUE);
            var vari = fixed(row.VALUE - rec.proc.VNOM);
            if (vari > 0) vari = "+" + vari;
            row.VAR = vari;
          } else if (rec.proc.LTYPE == "bool") {
            row.CRITERIA = rec.proc.BOOL_TEXT;
            row.VAR = na;
            row.VALUE = na;
          }
          row.STATUS = rec.tests[t].STATUS;
          row.NOTES = rec.tests[t].NOTES;
          rows.push(row);
        }
      });

      setTimeout(function () {
        dg.datagrid("loadData", rows);
        $("#dg2excel").linkbutton("enable");
      });
    },
  });

  $("#dgtests").datagrid({
    columns: [
      [
        { field: "TEST_ID", hidden: true },
        { field: "PROC_SEQ", title: "Seq", width: 30, fixed: true },
        { field: "TICK_SEQ", title: "#", width: 30, fixed: true },
        { field: "LTYPE", title: "VB", width: 40, hidden: true },
        { field: "TITLE", title: "Title" },
        {
          field: "CRITERIA",
          title: "Pass-Fail Criteria",
          formatter: function (val, row, idx) {
            var cls = "icon-" + row.LTYPE.toLowerCase();
            return (
              '<span style="width:20px" class="' +
              cls +
              ' icon-dg"></span><span>' +
              val +
              "</span>"
            );
          },
        },
        {
          field: "VALUE",
          title: "Result",
          align: "right",
          width: 75,
          fixed: true,
        },
        {
          field: "VAR",
          title: "Variance",
          align: "right",
          width: 75,
          fixed: true,
        },
        {
          field: "STATUS",
          title: "Status",
          width: 75,
          fixed: true,
          styler: function (val, row, idx) {
            return { class: "" + val.toLowerCase() };
          },
        },
        { field: "NOTES", title: "Notes & Observations", width: 1000 },
      ],
    ],

    onLoadSuccess: function () {},
  });

  // ## AFTER GAUGE IS LOADED ##
  $("#gauge").on("loadDone", function (evt, fdat) {
    $.page.fn.due();
    $("#gmtabs").tabs("enableAll", 1);
    //CLS: sort outer diameters before loading combobox
    const bhaveDiameters = jsonParse($.dui.bhave.CBO_OUTSIDE_DIAMETER || '[]');
    const bhaveDiameterValues = bhaveDiameters.sort((a, b) => {
      return parseFloat(a.value) - parseFloat(b.value);
    });
    $("#GAUGE_RENT_DIAMETER").combobox({
      data: bhaveDiameterValues,
      value: fdat.GAUGE_RENT_DIAMETER,
    });

    // This needs to be reworked.
    $("#PLAN_ID").combobox(
      "reload",
      "?_sqlid=dqm^gauge_planid&_func=get&GAUGE_ID=" +
        fdat.ID +
        "&GAUGE_TYPE=" +
        fdat.GAUGE_TYPE
    );

    // RESELECT ALL COMBO BOXES (<=1.41 BUG)
    // $(this).form('reselect');

    if (fdat.PLAN_ID != "") var endis = "enable";
    else var endis = "disable";
    $("a#calnow").linkbutton(endis);

    if ($.dui.bhave["allow_gauge_rename"] == "y") {
      $("a#rename").linkbutton("enable");
    }

    $("a#calibrate").linkbutton("enable");

    $.page.fn.automan();

    if (fdat.LAST_TX) $.page.fn.lasttx(fdat.LAST_TX);

    // need to clear the caltest combos & grid.
    $("#calids").combobox("clear").combobox("loadData", []);
    $("#calseq")
      .combobox("clear")
      .combobox("loadData", [])
      .combobox("readonly");
    $("#dgtests").datagrid("loadData", []);
    $("#dg2excel").linkbutton("disable");
  });
});
