$.page.fn.dostatus = function () {
  var form = $("form#qhead");
  var status = $.page.fn.getstatus();

  if (["Q", "O", "R"].indexOf(status) > -1) {
    $.page.fn.dgbut("disable");
    form.addClass("lock");
    $.page.fn._status.textbox("textbox").addClass("bg-red");
  } else {
    form.removeClass("lock");
    $.page.fn.dgbut("enable");
    $.page.fn._status.textbox("textbox").removeClass("bg-red");
  }

  //allow to save the change of the STATUS
  //updated by CLS, 2020-8-20 9AM
  form.removeClass("lock");

  // allways unlock
  ["#STATUS", "#QUOTE_ID"].map(function (field) {
    $(`${field} + span.textbox`).addClass("unlock");
  });

  // always unlock the navkey buttons.
  $("input.fkey ++ .nav").addClass("unlock");
};

$.page.fn.statusdata = [
  { text: "Active", value: "A" },
  { text: "Cancelled", value: "X" },
  { text: "Deferred", value: "D" },
  { text: "OnHold", value: "H" },
  { text: "Ordered", value: "O" },
  { text: "Quoted", value: "Q" },
  { text: "Rejected", value: "R" },
];

$.page.fn.getstatus = function () {
  return $.page.fn._status.combobox("getValue");
};

// convert strings to numeric
$.page.fn.tonum = function (row) {
  if (row.LINE_INDEX !== "" && row.LINE_INDEX != null)
    row.LINE_INDEX = parseInt(row.LINE_INDEX);
  if (row.TOTAL_PRICE !== "" && row.TOTAL_PRICE != null)
    row.TOTAL_PRICE = parseFloat(row.TOTAL_PRICE);
  if (row.UNIT_PRICE !== "" && row.UNIT_PRICE != null)
    row.UNIT_PRICE = parseFloat(row.UNIT_PRICE);
  if (row.ORDER_QTY !== "" && row.ORDER_QTY != null)
    row.ORDER_QTY = parseFloat(row.ORDER_QTY);
  return row;
};

// return selected row & index & rows
$.page.fn.dgrow = function () {
  var data = {
    rows: $.page.fn._qlines.datagrid("getRows"),
    sel: $.page.fn._qlines.datagrid("getSelected"),
  };
  data.idx = $.page.fn._qlines.datagrid("getRowIndex", data.sel);
  return data;
};

// datagrid edit buttons enable / disable
$.page.fn.dgbut = function (en_dis, bid) {
  ["dgre_add", "dgre_edit", "dgre_del", "dgre_insert"].map(function (but) {
    if (bid && bid != but) return;
    $.page.fn._qlines.datagrid("options").tbar[but].linkbutton(en_dis);
  });
};

// return selected QUOTE_ID
$.page.fn.getqid = function () {
  return $.page.fn._quoteid.textbox("getValue");
};

$.page.fn.roundCurrency = function (value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
};

$.page.fn.lineSource = function (row) {
  row = row || {};
  return String(row.SOURCE || row.ID || "").toLowerCase();
};

$.page.fn.isTotalRow = function (row) {
  return /subtotal|runtotal/.test($.page.fn.lineSource(row));
};

$.page.fn.syncGrand = function (rows) {
  var grand = 0;

  (rows || $.page.fn._qlines.datagrid("getRows")).map(function (row) {
    row = $.page.fn.tonum(row);
    if ($.page.fn.isTotalRow(row)) return;
    if (row.TOTAL_PRICE === "" || isNaN(row.TOTAL_PRICE)) return;
    grand += row.TOTAL_PRICE;
  });

  grand = $.page.fn.roundCurrency(grand);
  if ($.page.fn._grand && $.page.fn._grand.length) {
    $.page.fn._grand.numberbox("setValue", grand);
  }
  return grand;
};

// Update all LINE_NO if Changed.
$.page.fn.lines = function () {
  var rows = [],
    lno = 1,
    dg = $.page.fn.dgrow();
  dg.rows.map(function (row) {
    row = $.page.fn.tonum(row);
    //cl(`idx:${row.LINE_INDEX},row-lno:${row.LINE_NO},lno:${lno}`);
    if (row.LINE_NO != "") {
      if (row.LINE_NO != lno) {
        row._changed = true;
        row.LINE_NO = lno;
        $.page.fn.updateLine(row);
        rows.push(row);
      }
      lno++;
    }
  });
  return rows;
};

// Update a datagrid row without index
$.page.fn.updateLine = function (row) {
  var idx = $.page.fn._qlines.datagrid("getRowIndex", row);
  $.page.fn._qlines.datagrid("updateRow", {
    index: idx,
    row: row,
  });

  return $.page.fn._qlines.datagrid("getRows")[idx];
};

// after lineloaded, any line changes before here will now be over-written.
$.page.fn.onEndEdit = function (idx, item, chg) {
  const dbug = false;
  var data = item;
  $.page.fn._qlines
    .datagrid("updateRow", {
      index: idx,
      row: data,
    })
    .datagrid("refreshRow", idx);

  if (dbug) cl("[onEndEdit]:data", data);

  // save line(s) and cleanup;
  $.page.fn.savelines();
};

// save all changed / added lines.
$.page.fn.savelines = function () {
  const dbug = 0;

  var fns = $.page.fn._qlines.datagrid("getColumnFields");
  fns.push("_func");
  fns.push("_changed");

  // do global updates.
  $.page.fn.lines();
  $.page.fn.itemfunc.totals();

  var rows = [],
    dg = $.page.fn.dgrow();
  cl("dg.rows:", dg.rows);
  dg.rows.map(function (row) {
    row = $.page.fn.tonum(row);
    // if (row.UNIT_PRICE=="" || !row.UNIT_PRICE) row.UNIT_PRICE=0;
    //if (row.ORDER_QTY=="" || !row.ORDER_QTY) row.ORDER_QTY=0;

    //row.TOTAL_PRICE = row.UNIT_PRICE * row.ORDER_QTY;
    if (row._changed) {
      row._func = row._func || "upd";

      delete row.saved;
      for (var key in row) {
        //if(fns.indexOf(key) < 0) delete(row[key]);
      }
      rows.push(row);
    }
  });

  var data = {
    _sqlid: "sales^quoteline",
    _func: "upd",
    QUOTE_ID: $.page.fn.getqid(),
    rows: rows,
  };

  cl("[saveline]:final", data);
  if (dbug) return;

  // update database & reload
  ajaxget("/", data, function (res) {
    $.page.fn._qlines.datagrid("reload");
  });
};

// ITEM-FUNCTIONS. returns array of changed items.
$.page.fn.itemfunc = {
  totals: function (crow) {
    var dbug = 0;

    var rows = $.page.fn._qlines.datagrid("getRows");
    var tc = $.page.fn.classes()["TOTALS"];
    var cols = [];
    if (tc) {
      if (Array.isArray(tc.QM_COLS)) cols = tc.QM_COLS;
      else if (tc.QM_COLS) cols = tc.QM_COLS.split(",");
    }
    var row,
      data = [],
      subt = 0,
      runt = 0;

    // loop every row.
    rows.map(function (row) {
      // convert to numerics
      row = $.page.fn.tonum(row);
      var source = $.page.fn.lineSource(row);

      // changed flag
      row._changed = row._changed || false;
      if (row._func) row._changed = true;

      // Normal Items
      if (!$.page.fn.isTotalRow(row)) {
        var hasQty = row.ORDER_QTY !== "" && !isNaN(row.ORDER_QTY);
        var hasUnit = row.UNIT_PRICE !== "" && !isNaN(row.UNIT_PRICE);
        var qty = hasQty ? row.ORDER_QTY : 0;
        var unit = hasUnit ? row.UNIT_PRICE : 0;

        // Keep the line total in sync even when qty/unit become zero.
        var tot = $.page.fn.roundCurrency(unit * qty);
        if (tot != row.TOTAL_PRICE) {
          row.TOTAL_PRICE = tot;
          row._changed = true;
        }

        subt = $.page.fn.roundCurrency(subt + row.TOTAL_PRICE);
        runt = $.page.fn.roundCurrency(runt + row.TOTAL_PRICE);
      }

      // totals-item
      else {
        // null-out QM_COLS values.
        cols.map(function (e) {
          row[e] = "";
        });

        if (source == "subtotal") {
          cl("itemfunc:TOTAL_PRICE:", row.TOTAL_PRICE, "::subt:", subt);

          if (row.TOTAL_PRICE != subt) row._changed = true;

          row.TOTAL_PRICE = subt;
          subt = 0;
        }

        // else must be runtotal
        else {
          cl("itemfunc:TOTAL_PRICE:", row.TOTAL_PRICE, "::runt:", runt);
          if (row.TOTAL_PRICE != runt) row._changed = true;

          row.TOTAL_PRICE = runt;
          runt = 0;
        }
      }

      if (row._changed) {
        cl("row:", row);
        data.push(row);
        $.page.fn.updateLine(row);
      }
    });

    $.page.fn.syncGrand(rows);

    if (crow) return data[crow.LINE_INDEX];
    return data;
  },

  subtotal: function (crow) {
    return $.page.fn.itemfunc.totals(crow, "subtotal");
  },

  runtotal: function (crow) {
    return $.page.fn.itemfunc.totals(crow, "runtotal");
  },
};

$.page.fn.save_as_template = function () {
  var qid = $.page.fn.getqid();
  if (qid == "") msgbox("Quote ID cannot be blank.");
  else {
    confirm(function (yn) {
      if (yn) {
        var Qqid = $("#TEMPLATE_QUOTE_ID");
        Qqid.textbox("setValue", qid);
        $("#savetemplatewin").dialog("open");
      }
    }, `Save ${qid} as Template ?`);
  }
};

$.page.fn.nextLetter = function (s) {
  const l = "" + s + "";
  var c = l.charCodeAt(0);
  var res = "";
  switch (c) {
    case 48:
    case 49:
    case 50:
    case 51:
    case 52:
    case 53:
    case 54:
    case 55:
    case 56:
    case 57:
      res = "A";
      break;
    case 90:
      res = "A";
      break;
    case 122:
      res = "A";
      break;
    default:
      c += 1;
      res = String.fromCharCode(c);
  }
  return res;
};

$.page.fn.copy_quote = function () {
  var qid = $.page.fn.getqid();
  if (qid == "") msgbox("Quote ID cannot be blank.");
  else {
    confirm(function (yn) {
      if (yn) {
        ajaxget(
          "/",
          {
            _sqlid: "sales^quote_copy",
            _func: "add",
            QUOTE_ID: qid,
            USER_ID: $.dui.udata.userid,
          },
          function (res) {
            if (res._NEXT != undefined) {
              //msgbox(`New Quote ID: ${res._NEXT} copied.`);
              $.page.fn._quoteid.searchbox("loadForm", res._NEXT);
              // window.open(`#sales^sa_sorder&ID=${res._NEXT}`, '_blank');
            }
          },
        );
      }
    }, `Copy Quote ${qid} to New Quote  Order ?`);
  }
};
$.page.fn.revise_quote_button = function () {
  var qid = $.page.fn.getqid();

  var endis = "disable";
  if (qid == "") endis = "disable";
  else {
    const lastLetter = qid.slice(-1);
    const nextLetter = $.page.fn.nextLetter(lastLetter);
    const quote_id = qid + nextLetter;

    ajaxget(
      "/",
      { _sqlid: "sales^quotehead", _func: "get", QUOTE_ID: quote_id },
      function (res) {
        //console.log(res);
        if (res == [] || res.length == 0) endis = "enable";
        else endis = "disable";
        //console.log('revise_quote_button:qid:1111',qid,',endis:',endis)
        $("#revise_quote").linkbutton(endis);
      },
    );
  }
  // console.log('revise_quote_button:qid:',qid,',endis:',endis)
  $("#revise_quote").linkbutton(endis);
};
$.page.fn.revise_quote = function () {
  var qid = $.page.fn.getqid();
  if (qid == "") msgbox("Quote ID cannot be blank.");
  else {
    const lastLetter = qid.slice(-1);
    //var nextId = qid.substring(0,qid.length-1) + $.page.fn.nextLetter(lastLetter)
    var nextId = qid + $.page.fn.nextLetter(lastLetter);

    confirm(function (yn) {
      if (yn) {
        ajaxget(
          "/",
          {
            _sqlid: "sales^quote_revise",
            _func: "add",
            ORIG_QUOTE_ID: qid,
            QUOTE_ID: nextId,
            USER_ID: $.dui.udata.userid,
          },
          function (res) {
            // console.log(res)
            $.page.fn._quoteid.searchbox("loadForm", res._NEXT);
          },
        );
      }
    }, `Copy Quote ${qid} to New REVISE Quote - ${nextId} ?`);
  }
};

$.page.fn.convert_quote = function () {
  var qid = $.page.fn.getqid();
  if (qid == "") msgbox("Quote ID cannot be blank.");
  else {
    confirm(function (yn) {
      if (yn) {
        ajaxget(
          "/",
          {
            _sqlid: "sales^quote_convert",
            _func: "add",
            QUOTE_ID: qid,
            USER_ID: $.dui.udata.userid,
          },
          function (res) {
            if (res._NEXT != undefined) {
              msgbox(`Sales Order ${res._NEXT} added.`);
              // window.open(`#sales^sa_sorder&ID=${res._NEXT}`, '_blank');
            }
          },
        );
      }
    }, `Convert Quote ${qid} to Sales Order ?`);
  }
};

$.page.fn.print_quote = function () {
  var qformat = $("#QUOTE_FORMAT").combobox("getValue");
  var qid = $.page.fn.getqid();

  ajaxget(
    "/",
    {
      _sqlid: "sales^quoteformat",
      _func: "get",
      ID: qformat,
    },
    function (rs) {
      if (!rs) var report_format = "standard";
      else {
        if (rs.PHOID == "") var report_format = "standard";
        else var report_format = rs.PHOID;
      }

      if (qid == "") msgbox("Quote ID cannot be blank.");
      else {
        var rpt = `sales^quote_man^quote_form_${report_format.toLowerCase()}`;
        printmen({ id: rpt });
      }
    },
  );
};

/*
$.page.fn.onBeforePrint = function(vars,cb){
  //cl('$.page.fn.onBeforePrint',vars);
  cb(); 
}
*/

$.page.fn.onAfterPrint = function (pv) {
  const dbug = false;
  if (dbug) cl("$.page.fn.onAfterPrint", pv);
  var qs = $.page.fn.getstatus();
  var qid = $.page.fn.getqid();

  if (qs != "Q") {
    confirm(function (yn) {
      if (yn)
        ajaxget(
          "/",
          {
            _sqlid: "sales^quotehead",
            _func: "upd",
            QUOTE_ID: qid,
            USER_ID: $.dui.udata.userid,
            STATUS: "Q",
          },
          function () {
            $("#qhead").form("reload");
          },
        );
    }, "Set Status to Quoted ?");
  }
};

$.page.fn.convert_quote_button = function () {
  var status = $.page.fn.getstatus();
  var cust = $("#CUSTOMER_ID").searchbox("getValue");
  var endis = "disable";
  if (status == "Q") {
    if (cust != "") endis = "enable";
  }
  $("#convert_quote").button(endis);
};

$.page.fn.allcombos = function () {
  ajaxget("/", { _sqlid: "sales^quote_combos", _func: "get" }, function (cbos) {
    for (var KEY_ID in cbos) {
      if (KEY_ID == "UOM_ID") var fid = "#qlines_editor > form";
      else var fid = "form#qhead";
      $(fid + " [textboxname=" + KEY_ID + "]").combobox(
        "loadData",
        cbos[KEY_ID],
      );
    }
  });
};

// convert pdata classes array to object
$.page.fn.classes = function () {
  var data = {};
  var pdata = $.dui.pdata;
  if (Array.isArray(pdata)) {
    pdata.map(function (e) {
      data[e.value] = e;
    });
  }
  return data;
};

$.page.fn.hides = function (cls) {
  var c = $.page.fn.classes()[cls];
  return c ? c.QM_COLS : "";
};

// load form & use func if avail
$.page.fn.formLoad = function (data) {
  const dbug = 0;
  if (dbug) cl("[formLoad]:data", data);
  var row = $.page.fn._qlines.datagrid("getSelected");
  var form = $.page.fn._qlines.datagrid("options").tbar.form;
  var fields = form.form("getData");
  var hides = $.page.fn.hides(data.CLASS);
  if (dbug) cl("hides:", hides);

  // Set item values
  for (var fn in data) {
    // some fields are hidden-inputs, some eui inputs.
    const tbox = form.find(`[textboxname="${fn}"]`);
    const inp = form.find(`input[name="${fn}"]`);
    if (fn == "ID") continue;

    if (hides.indexOf(fn) > -1) {
      if (dbug) cl("hide:", fn);
      if (tbox.length) tbox.textbox("setValue", "");
      else if (inp.length) inp.val("");
    } else {
      if (dbug) cl("show:", fn, data[fn]);
      if (tbox.length) tbox.textbox("setValue", data[fn]);
      else if (inp.length) inp.val(data[fn]);
    }
  }
};

// show / hide fields.
$.page.fn.formfields = function (row) {
  const dbug = 0;
  row = row || $.page.fn._qlines.datagrid("getSelected");
  if (dbug) cl("[formfields]:row", row);
  var form = $.page.fn._qlines.datagrid("options").tbar.form;
  var fields = form.form("getData");

  // Item is not selected yet
  var hides = [];
  if (row.CLASS) hides = $.page.fn.hides(row.CLASS);

  for (var fn in fields) {
    const inp = form.find(`[textboxname="${fn}"]`);
    if (fn == "ID") continue;
    if (hides.indexOf(fn) > -1) inp.textbox("readonly", true);
    else inp.textbox("readonly", false);
  }
};

// when edit form opens.
$.page.fn.onFormOpen = function () {
  const dbug = 0;
  if (dbug) cl("[onFormOpen]:init");
  $.page.fn.formfields();

  // format description multiline box.
  var desc = $('[textboxname="DESCRIPTION"]');
  var fitem = desc.parent(".fitem");
  fitem.addClass("multiline");
};

// problem - changes set here are over-written
$.page.fn.onItemLoaded = function (rec, item) {
  const dbug = 0;
  if (dbug) cl("[onItemLoaded]", rec, item);
  var data = Object.assign(rec, item);

  // don't know why this is missing from requested data;
  data.ORDER_QTY = data.ORDER_QTY || 1;
  if (dbug) cl("[onItemLoaded]", data);
  $.page.fn.formfields(data);
  $.page.fn.formLoad(data);
};

// use quote items instead of part IDs
$.page.fn.ITEMID_editor = function () {
  return {
    type: "combobox",
    options: {
      groupField: "CLASS",
      url: "/",

      queryParams: {
        _sqlid: "sales^quoteitemid",
        _func: "get",
        _combo: "y",
      },

      // ajaxget, then merge data, then
      onSelect: function (rec) {
        const dbug = false;
        if (dbug) cl("[onItemSelect]:rec", rec);
        ajaxget(
          "/",
          {
            _sqlid: "sales^quoteitems",
            _func: "get",
            ID: rec.value,
          },
          function (item) {
            $.page.fn.onItemLoaded(rec, item); // ajaxget
          },
        );
      }, // onSelect
    }, // options
  };
};

$.page.fn.columns = [
  { field: "QUOTE_ID", hidden: true },
  { field: "CLASS", hidden: true },
  { field: "SOURCE", hidden: true },

  {
    field: "LINE_INDEX",
    hidden: true,
    formatter: function (val, row, idx) {
      return idx;
    },
  },

  { field: "LINE_NO", title: "#", width: 25, fixed: true, align: "center" },

  { field: "ID", title: "Item ID", editor: $.page.fn.ITEMID_editor() },

  {
    field: "ORDER_QTY",
    width: 50,
    fixed: true,
    title: "Qty",
    align: "right",
    editor: {
      type: "numberspinner",
      options: {
        precision: 2,
        min: 0,
        value: 1,
      },
    },

    formatter: function (val, row, idx) {
      if (val == "") return "";
      return parseFloat(val).toFixed(2);
    },
  },

  {
    field: "UOM_ID",
    title: "UOM",
    editor: {
      type: "combobox",
      options: {
        required: false,
      },
    },
    coloff: true,
  },

  {
    field: "UNIT_PRICE",
    title: "Unit $",
    align: "right",
    width: 70,
    fixed: true,
    formatter: function (val, row, idx) {
      if (!val) return "";
      return $.dui.fmt.currency(val);
    },

    editor: {
      type: "numberbox",
      options: {
        value: 0,
        precision: 2,
      },
    },
  },

  {
    field: "TOTAL_PRICE",
    width: 80,
    fixed: true,
    align: "right",
    title: "Total $",

    formatter: function (val, row, idx) {
      return $.dui.fmt.currency(parseFloat(val));
      // return $.dui.fmt.currency(parseFloat(row.UNIT_PRICE*row.ORDER_QTY));
    },
  },

  { index: 9, field: "CUST_PART_REF", title: "Cust Part Ref", editor: "text" },

  {
    field: "DESCRIPTION",
    title: "Item Description",
    width: 1000,
    fixed: false,
    editor: {
      type: "textbox",
      options: {
        readonly: false,
        multiline: true,
        height: 150,
        style: "padding:1em;",
        icons: [
          {
            iconCls: "icon-edit",
            style: "height:20px;width:20px;",
            handler: function (e) {
              var tgt = $(e.data.target);
              if ($("body").find("#DESCRIPTION_pop").length == 0) {
                var dlog = $(
                  '<div id="DESCRIPTION_pop" class="easyui-dialog" />',
                );
                $("body").append(dlog);
                var tbox = $('<textarea class="fit verdana" />');
                var mask = $(".window-mask");
                var wmzi = null;
                dlog.append(tbox);
                dlog.dialog({
                  height: window.innerHeight - 50,
                  width: 420,
                  modal: true,
                  onOpen: function () {
                    wmzi = mask.css("z-index");
                    var pan = dlog.parent(".panel.window");
                    var panzi = parseInt(pan.css("z-index"));
                    mask.css("z-index", panzi - 1).show();
                    var txt = $(tgt).textbox("getValue");
                    tbox.val(txt);
                  },

                  onClose: function () {
                    var txt = tbox.val();
                    $(tgt).textbox("setValue", txt);
                    tbox.val("");
                    mask.css("z-index", wmzi).hide();
                  },
                });
              } else var dlog = $("#DESCRIPTION_pop");
              dlog.dialog("open");
            },
          },
        ],
      },
    },
  },
];

$.page.fn.opts = {
  twoColumns: true,
  selectOnCheck: true,
  checkOnSelect: true,
  editor: "form",

  addData: {
    LINE_INDEX: function (row) {
      const dbug = 0;
      row = $.page.fn.tonum(row);
      var dg = $.page.fn.dgrow();

      // First Record
      if (!dg.rows.length) return 10;

      // Append
      if (row._mode == "append") {
        return dg.rows.slice(-1)[0].LINE_INDEX + 10;
      }

      // insert a row
      else {
        // if first row,
        if (dg.idx == 0) var cidx = 0;
        else cidx = dg.rows[dg.idx - 1].LINE_INDEX;
        var nidx = dg.rows[dg.idx].LINE_INDEX;
        var idx = Math.round(cidx + (nidx - cidx) / 2);
        if (dbug) cl(`cidx:${cidx},nidx:${nidx},idx:${idx}`);
        return idx;
      }
    },

    LINE_NO: function (row) {
      row = $.page.fn.tonum(row);
      if ($.page.fn.itemfunc[row.SOURCE]) return "";
      var last = 0,
        rows = $.page.fn._qlines.datagrid("getRows");
      rows.map(function (e) {
        var ln = e.LINE_NO;
        if (!isNaN(ln)) last = ln;
      });
      last++;
      return last;
    },

    /*
    UOM_ID      : function(row){
                    if(! $.page.fn.itemfunc[row.SOURCE]) return ;  
                  },
    */

    QUOTE_ID: "#QUOTE_ID",
    TOTAL_PRICE: 0,
  },

  columns: [$.page.fn.columns],

  onLoadSuccess: function (data) {
    debug = 0;
    $.page.fn._qlines.datagrid("resize");
    var changed = $.page.fn.lines().length;
    changed += $.page.fn.itemfunc.totals().length;
    if (debug) cl("changedRows:", changed);
    if (changed > 0) {
      if (debug) cl("Saving changed lines.");
      $.page.fn.savelines();
    }
  },

  onBeforeLoad: function (qp) {
    qp.QUOTE_ID = $.page.fn.getqid();
    if (!qp.QUOTE_ID) return false;
  },

  loadFilter: function (data) {
    data.rows.map(function (row, idx) {
      delete data.rows[idx]._func;
      // row['TOTAL_PRICE']=(row['UNIT_PRICE']||0)* (row['ORDER_QTY']||0)
      data.rows[idx].saved = true;
    });
    return data;
  },

  onRowContextMenu: function (evt, idx, row) {
    evt.preventDefault();
    return false;
  },

  // before a line is selected. (before-double-click ??)
  onBeforeSelect: function (idx, row) {
    var status = $.page.fn.getstatus();
    var editable = ["Q", "O", "R"].indexOf(status) < 0;
    if (!editable) alert("Cannot edit quote.");
    return editable;
  },

  onEndEdit: $.page.fn.onEndEdit,
};

$.page.ready(function () {
  $.page.register({
    autonum: { field: "#QUOTE_ID", type: "QUOTE" },
  });

    ajaxget('/', {_func: 'get', _sqlid: 'vwltsa^udfid', '_combo': 'y'}, function (rs) {
    $('#UDF_LAYOUT_ID').combobox('loadData', rs);
  });

  /*$('#UDF_LAYOUT_ID').combobox({
    validType: ['inList'],
    onSelect: setudfs,
    readonly: true,
    value: $.dui.bhave ? $.dui.bhave.UDF_LAYOUT_ID : ''
  });
  */
 // $('form#qualification [textboxname=UDF_LAYOUT_ID]').combobox({onSelect: setudfs});
 console.log('UDF_LAYOUT_ID:',  $.dui.bhave.UDF_LAYOUT_ID );
$('#UDF_LAYOUT_ID').combobox('onSelect', $.dui.bhave.UDF_LAYOUT_ID);
  console.log('selected UDF_LAYOUT_ID:', $('#UDF_LAYOUT_ID').combobox('getValue'));

  // define / query it once.
  $.page.fn._qlines = $("#qlines");
  $.page.fn._quoteid = $("#QUOTE_ID");
  $.page.fn._grand = $("#GRAND");
  $.page.fn._status = $("#STATUS");

  $("#linemenu").menu({
    onClick: function (item) {
      var src = $(this).menu("options").src;
      switch (item.name) {
        case "insert":
          $.page.fn._qlines.datagrid("editAppend", {}, { insert: true });
          return;
        //$.page.fn._qlines.datagrid('beginEdit');
      }
    },
  });

  $.page.fn._quoteid.searchbox({
    queryParams: {
      _sqlid: "sales^quoteids_qbe",
    },

    onDemand: true,
    multiCol: true,
    valueField: "QUOTE_ID",

    fields: [
      { field: "value", title: "ID", editor: "textbox" },
      { field: "QUOTE_FORMAT", title: "Format", editor: "textbox" },
      {
        field: "STATUS",
        title: "Status",
        editor: {
          type: "combobox",
          options: {
            data: $.page.fn.statusdata,
          },
        },
      },

      {
        field: "QUOTE_DATE",
        title: "Date",
        editor: "datebox",
        formatter: $.dui.fmt.date,
      },
      { field: "DESCRIPTION", title: "Title", editor: "textbox" },
      { field: "CUSTOMER_ID", title: "Cust ID", editor: "textbox" },
      { field: "CUSTOMER_NAME", title: "Cust Name", editor: "textbox" },
      { field: "CURRENCY_ID", title: "Currency", editor: "textbox" },
      { field: "PAYMENT_TERM", title: "Terms", editor: "textbox" },
    ],
  });

  //$.page.fn.allcombos();



  $("a#saveastemplatebtn").linkbutton({
    onClick: function () {
      var qid = $("#TEMPLATE_QUOTE_ID").textbox("getValue");
      var tid = $("#TEMPLATE_ID").textbox("getValue");
      if (tid == "") msgbox("Template ID cannot be blank");
      else {
        $("#savetemplatewin").dialog("close");
        ajaxget(
          "/",
          {
            _sqlid: "sales^quote_template",
            _func: "add",
            QUOTE_ID: qid,
            USER_ID: $.dui.udata.userid,
            TEMPLATE_ID: tid,
          },
          function (res) {
            if (res.error == false) msgbox(`New Template, ${tid} added.`);
            else msgbox(res.msg);
          },
        );
      }
    },
  });

  $("a#loadtemplatebtn").linkbutton({
    onClick: function () {
      var qid = $(
        "#loadtemplatewin form#loadtemplate #LOAD_TEMPLATE_ID",
      ).textbox("getValue");
      if (qid == "") msgbox("Template ID cannot be blank.");
      else {
        confirm(function (yn) {
          if (yn) {
            $("#loadtemplatewin").dialog("close");
            ajaxget(
              "/",
              {
                _sqlid: "sales^quote_copy",
                _func: "add",
                QUOTE_ID: qid,
                USER_ID: $.dui.udata.userid,
                load_template: "y",
              },
              function (res) {
                $.page.fn._quoteid.searchbox("loadForm", res._NEXT);
              },
            );
          }
        }, `Copy template ${qid} to New Quote ?`);
      }
    },
  });

  $.page.fn._status.combobox({
    default: "A",
    data: $.page.fn.statusdata,
    onSelect: function (rec) {
      $.page.fn.convert_quote_button();

      if (rec.value == "A") {
        var form = $("form#qhead");
        form.removeClass("lock");
        $.page.fn.dgbut("enable");
        $.page.fn._status.textbox("textbox").removeClass("bg-red");
      }
    },
  });

  // revision number change.
  $("#REVISION").numberspinner({
    onChange: function (nv, ov) {
      if ($("form#qhead").form("options").loading) return;
      var me = $(this),
        rn = $("#REV_NOTES");
      if (parseInt(nv) < parseInt(ov))
        return setTimeout(function () {
          me.numberspinner("setValue", ov);
        });
      var orn = rn.textbox("getValue").trim();
      if (orn && orn.length > 0 && orn.slice(-1) != "\n") orn += "\n";
      var msg =
        $.dui.bhave.REV_MSG ||
        "Revn change from $OLD_REV to $NEW_REV on $DATE by $USER.";
      var nrn = tokparse(msg + "\n", {
        NEW_REV: nv,
        OLD_REV: ov,
        DATE: myDate(now()),
        USER: $.dui.udata.userid,
      });
      if (orn.indexOf(nrn) == -1) rn.textbox("setValue", orn + nrn);
    },
  });
  $("#CURRENCY_ID").combobox({
    url: "/?_func=get&_sqlid=admin^curr&_combo=y",
  });
  $("#PAYMENT_TERM").combobox({
    url: "/?_func=get&_sqlid=sales^quotepaymenttermid&_combo=y",
  });
  $("#CUSTOMER_ID").searchbox({
    onChange: function () {
      $.page.fn.convert_quote_button();
    },

    onSelect: function (row) {
      $.page.fn.convert_quote_button();
      var rec = row.value;
      var frm = $("form#qhead");

      ajaxget(
        "/",
        { _sqlid: "sales^custall", _func: "get", ID: rec },
        function (data) {
          var mods = {
            ID: "CUSTOMER_ID",
            NAME: "CUSTOMER_NAME",
            CURRENCY_ID: "CURRENCY_ID",
            ADDR_1: "SHIPTO_ADDR_1",
            ADDR_2: "SHIPTO_ADDR_2",
            ADDR_3: "SHIPTO_ADDR_3",
            CONTACT_PERSON: "CONTACT_PERSON",
            CONTACT_PHONE: "CONTACT_PHONE",
            CONTACT_fax: "CONTACT_FAX",
            CONTACT_EMAIL: "CONTACT_EMAIL",
            PAYMENT_TERM: "PAYMENT_TERM",
          };
          var data1 = {};
          for (var i in mods) {
            data1[mods[i]] = data[i];
          }
          frm.form("preload", data1); //.attr('mode',mode);
        },
      );
    },
  });

  $("#but_add").on("done", function () {
    $.page.fn._qlines.datagrid("loadData", { total: 0, rows: [] });
    $.page.fn.syncGrand([]);
    $.page.fn._status.combobox("select", "A");
    $("#QUOTE_FORMAT").combobox("select", "STANDARD");
    $("#QUOTE_DATE").datebox("setValue", today);
    butEn("dx");
  });

  $("form#qhead")
    // main form is loaded.
    .on("loadDone", function (jq, data) {
      var form = $(this);
      if (!data.QUOTE_ID) return;

      // Guard: suppress dirty tracking during programmatic field updates
      var opts = form.form('options');
      var savedOnChange = opts.onChange;
      opts.onChange = null;

      $('#UDF_LAYOUT_ID').combobox('select', $.dui.bhave.UDF_LAYOUT_ID);
      // Fix: searchbox filter creates duplicate name=CURRENCY_ID inside form#qhead,
      // causing form plugin to set _sbf_CURRENCY_ID instead of #CURRENCY_ID
      if (data.CURRENCY_ID)
        $("#CURRENCY_ID").val(data.CURRENCY_ID).trigger("change");

      // Restore change tracking
      opts.onChange = savedOnChange;

      // enable-disable buttons.
      $("#save_as_template").linkbutton("enable"); //enabled Save Template after Quote ID loaded
      $("#copy_quote").linkbutton("enable");
      $.page.fn.revise_quote_button();

      $("#print_quote").linkbutton("enable");

      // Enable Convert only when Quoted + has customer (uses data object,
      // not searchbox('getValue') which is stale after form load)
      if (data.STATUS == "Q" && data.CUSTOMER_ID != "")
        $("#convert_quote").linkbutton("enable");
      else
        $("#convert_quote").linkbutton("disable");

      //butEn("adx");

      // reload datagrid & update lines and totals.
      $.page.fn._qlines.datagrid("reload");

      // load document attachments.
      $("#qfiles").datagrid("docFiles", data.QUOTE_ID);

      // Lock the form based on Status (allow status change)
      $.page.fn.dostatus();

      var notes = "";
      ajaxget(
        "/",
        {
          _func: "get",
          _sqlid: "sales^quotelines_qi_notes",
          QUOTE_ID: data.QUOTE_ID,
        },
        function (rs) {
          if (rs) {
            rs.map(function (r) {
              notes += "==== Line " + r.LINE_NO + " " + r.ID + " ====\n";
              notes += r.ITEM_NOTES + "\n\n";
            });
            $("#QI_NOTES").textbox("setValue", notes);
          }
        },
      );

      // Clean up any dirty state (form should be clean after load)
      opts.dirty = false;
      opts.changed = [];
      form.find('.changed').removeClass('changed');
      form.removeClass('form-lock');
      // Ensure state is view with correct buttons after load
      if (opts.state === 'idle') opts.state = 'loading';
      if (opts.state !== 'view') form.form('state', 'view');
    }) //on-loadDone

    .on("changed", function (jq, data) {
      var opts = $(this).form("options");
      if (!opts.loading) {
        butEn("sadx");
      }
    }) // on-changed

    .on("success", function (data) {
      var en_dis = "disable";
      if (data.STATUS != "Q") en_dis = "enable";
      $.page.fn.dgbut(en_dis, "dgre_add");
    }); // on-success

  $.page.fn._qlines.datagrid("rowEditor", $.page.fn.opts);
  $.page.fn.dgbut("disable", "dgre_add");
  $.page.fn._qlines.datagrid("columns", $("#dgre_tb"));
  var dgopts = $.page.fn._qlines.datagrid("options");
  if (dgopts.dlg) dgopts.dlg.window({ onOpen: $.page.fn.onFormOpen });

  // Wire Item ID combobox in editor modal to populate Description + other fields
  $('#qlines_ID').combobox({
    groupField: 'CLASS',
    onSelect: function(rec) {
      ajaxget('/', {
        _sqlid: 'sales^quoteitems',
        _func: 'get',
        ID: rec.value
      }, function(item) {
        if (!item) return;
        if (item.DESCRIPTION !== undefined)
          $('#qlines_DESCRIPTION').textbox('setValue', item.DESCRIPTION);
        if (item.UNIT_PRICE !== undefined)
          $('#qlines_UNIT_PRICE').numberbox('setValue', item.UNIT_PRICE);
        if (item.UOM_ID !== undefined)
          $('#qlines_UOM_ID').combobox('setValue', item.UOM_ID);
        if (item.ORDER_QTY !== undefined)
          $('#qlines_ORDER_QTY').numberspinner('setValue', item.ORDER_QTY || 1);
      });
    }
  });

  toolbut([
    /*
    {
      id:'save_as_template',
      iconCls: 'icon-app',
      text: 'Save as Template',
      disabled: true,
      noText: false,
      onClick: $.page.fn.save_as_template
    },
    
    {
      id:'load_template',
      iconCls: 'icon-app',
      text: 'Load Template',
      disabled: false,
      noText: false,
      onClick: function(){
        $('#loadtemplatewin').dialog('open'); 
      }
    },
    */
    {
      id: "copy_quote",
      iconCls: "icon-app",
      text: "Copy",
      disabled: true,
      noText: false,
      onClick: $.page.fn.copy_quote,
    },
    {
      id: "revise_quote",
      iconCls: "icon-app",
      text: "Revise",
      disabled: true,
      noText: false,
      onClick: $.page.fn.revise_quote,
    },
    {
      id: "convert_quote",
      iconCls: "icon-customer",
      text: "Convert",
      disabled: true,
      noText: false,
      onClick: $.page.fn.convert_quote,
    },

    {
      id: "print_quote",
      iconCls: "icon-form",
      text: "Print",
      disabled: true,
      noText: false,
      onClick: $.page.fn.print_quote,
    },
    {},
  ]);

  $("#QUOTE_DATE").datebox({
    onChange: function (d, o) {
      var dates = ["FOLLOWUP_DAYS", "EXPIRY_DAYS"];

      dates.map(function (dd) {
        var dt1 = dd.split("_");
        var days = $.dui.bhave[dd];
        //console.log(dd,':',days)
        var dt = new Date(d);

        dt.setDate(dt.getDate() + days * 1);

        var dd = dt.getDate();
        var mm = dt.getMonth() + 1;
        var y = dt.getFullYear();

        var newDate = y + "/" + mm + "/" + dd;

        $("#" + dt1[0] + "_DATE").datebox("setValue", newDate);
      });
    },
  });

  $("#NOTES_ID").combobox({
    onSelect: function (row) {
      var existingNotes = $("#NOTES").textbox("getValue");
      ajaxget(
        "/",
        { _sqlid: "sales^quotenotes", _func: "get", ID: row.value },
        function (data) {
          if (existingNotes.length == 0) existingNotes = data.NOTES;
          else existingNotes += "\r\n" + data.NOTES;
          $("#NOTES").textbox("setValue", existingNotes);
        },
      );
    },
  });
});
