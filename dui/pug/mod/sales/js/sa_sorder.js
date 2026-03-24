/*
  CLS, 171106, 2.2.533
  1, allowed to view the ship info regardless user group-sales pricing

  CLS, 171121, 2.2.549
  1, if SO was closed, disabled the datagrid Add button 

  CLS, 180206, 2.2.551
  1, changed back the admin^curr obj to admin^curr_ids_get
  2, changed back the admin^gst obj to admin^gst_ids_get
  
  CLS, 180206, 2.2.556
  1, changed back the CUST_ID to combobox
  
*/

// PAC - 161127 - load ALL combos with 1 request instead of 6.
$.page.fn.allcombos = function () {
  ajaxget("/", { _sqlid: "sales^so_combos", _func: "get" }, function (cbos) {
    //delete cbos['CUST_ID'];
    //delete cbos['CP_REF'];
    for (var KEY_ID in cbos) {
      if (/CP_REF|OTD_CODE|PART_ID/.test(KEY_ID)) var fid = "#solines_editor";
      else var fid = "form#sohead";
      // DUI combobox fields render as <select>; keep input fallback for legacy/editbox cases.
      $(
        fid +
          " select[name=" +
          KEY_ID +
          "], " +
          fid +
          " input[name=" +
          KEY_ID +
          "]",
      ).combobox("loadData", cbos[KEY_ID]);
    }
  });
};

$.page.fn.jobinfo = function () {
  var ncrs = [],
    me = $(this),
    idx = me.data("idx");
  var row = $("#solines").datagrid("getRows")[idx];
  if (row._JOB.length == 0) return;
  me.tooltip(
    "update",
    eui.table(
      [
        { field: "WOREF", title: "Operation ID", formatter: eui.ref2text },
        {
          field: "SHIPPED_QTY",
          title: "Ship Qty",
          style: "text-align:right;",
          formatter: $.dui.fmt.integer,
        },
        { field: "STATUS", title: "Status" },
      ],
      row._JOB,
    ),
  ).tooltip("reposition");
};

$.page.fn.ncrinfo = function () {
  var ncrs = [],
    me = $(this),
    idx = me.data("idx");
  var row = $("#solines").datagrid("getRows")[idx];
  if (row._NCR.length == 0) return;
  me.tooltip(
    "update",
    eui.table(
      [
        /*{field:'OP_WOREF', title:'Operation'},*/
        { field: "NCR_ID", title: "NCR ID" },
        { field: "STATUS", title: "Status" },
      ],
      row._NCR,
    ),
  ).tooltip("reposition");
};

// Shipment Info.
$.page.fn.shipinfo = function () {
  var me = $(this);
  var idx = me.data("idx");
  var row = $("#solines").datagrid("getRows")[idx];
  ajaxget(
    "/",
    {
      _func: "get",
      _sqlid: "sales^shipinfo",
      SALES_ORDER_ID: row.SALES_ORDER_ID,
      LINE_NO: row.LINE_NO,
    },
    function (res) {
      me.tooltip({
        content: eui
          .table(
            [
              { field: "SHIPMENT_ID", title: "Ship ID" },
              {
                field: "SHIPMENT_DATE",
                title: "Ship Date",
                formatter: $.dui.fmt.date,
              },
              {
                field: "SHIPPED_QTY",
                title: "Qty",
                style: "text-align:right;",
              },
            ],
            res,
          )
          .appendTo("#content"),
      }).tooltip("show");
    },
  );
};

// Gate[ass] Info.
$.page.fn.gpinfo = function () {
  var me = $(this);
  var idx = me.data("idx");
  var row = $("#solines").datagrid("getRows")[idx];
  ajaxget(
    "/",
    {
      _func: "gpinfo",
      _sqlid: "inv^gpline",
      DOC_ID: row.SALES_ORDER_ID + "^" + row.LINE_NO,
      DOC_TYPE: "SO",
    },
    function (res) {
      me.tooltip({
        content: eui
          .table(
            [
              { field: "GP_ID", title: "GP ID" },
              { field: "GP_DATE", title: "GP Date", formatter: $.dui.fmt.date },
              { field: "QTY", title: "Qty", style: "text-align:right;" },
            ],
            res,
          )
          .appendTo("#content"),
      }).tooltip("show");
    },
  );
};

$.page.fn.opts = {
  twoColumns: true,
  editor: "form",

  addData: {
    LINE_NO: "$autonum:" + $.dui.bhave.SOL_INC || "1",

    QTY: 1,
    SALES_ORDER_ID: "#ID",
  },

  striped: true,
  url: "/?_sqlid=sales^solines&_func=get&_dgrid=y",
  rownumbers: false,
  fitColumns: true,
  fit: true,

  columns: [
    [
      { field: "SALES_ORDER_ID", hidden: true },
      { field: "_OPNDATA", hidden: true },
      { field: "_CPDATA", hidden: true },

      {
        field: "_NCR",
        title: "NCRS",
        align: "center",
        width: 45,
        fixed: true,
        formatter: function (val, row, idx) {
          if (val && val.length)
            return '<span class="icon icon-ncr" data-idx="' + idx + '"></span>';
          else return "-";
        },
      },

      {
        field: "_JOB",
        title: "JOBS",
        align: "center",
        width: 45,
        fixed: true,
        formatter: function (val, row, idx) {
          if (val && val.length)
            return (
              '<span class="icon icon-tools" data-idx="' + idx + '"></span>'
            );
          else return "-";
        },
      },
      { field: "LINE_NO", title: "#", width: 30, fixed: true, align: "center" },
      {
        field: "LINE_STATUS",
        title: "Ln Status",
        width: 60,
        fixed: true,
        hidden: true,
        editor: {
          type: "combobox",
          options: {
            panelHeight: "auto",
            data: [
              { text: "Closed", value: "C" },
              { text: "Open", value: "", selected: true },
            ],
          },
        },
        coloff: true,
      },
      {
        field: "CUST_PO_LINE_NO",
        title: "PO LN",
        width: 50,
        fixed: true,
        editor: { type: "numberspinner", options: { precision: 0, min: 1 } },
      },
      {
        field: "QTY",
        title: "Qty Reqd",
        width: 60,
        fixed: true,
        align: "right",
        editor: {
          type: "numberspinner",
          options: {
            precision: 2,
            min: 0,
          },
        },
      },

      {
        field: "QTY_SHIP",
        title: "Qty Ship",
        width: 60,
        fixed: true,
        align: "right",
        formatter: function (val, row, idx) {
          if (!val || val < 1) return "-";
          else
            return (
              '<span style="width:14px;" class="icon-ship icon-dg click" data-idx="' +
              idx +
              '"></span><span>' +
              val +
              "</span>"
            );
        },
      },
      {
        field: "GATEPASS_QTY",
        title: "Qty GP",
        width: 60,
        fixed: true,
        align: "right",
        hidden: true,
        formatter: function (val, row, idx) {
          if (!val || val < 1) return "-";
          else
            return (
              '<span style="width:14px;" class="icon-gate_pass icon-dg click" data-idx="' +
              idx +
              '"></span><span>' +
              val +
              "</span>"
            );
        },
        coloff: true,
      },
      {
        field: "UNIT_ESTIMATOR_COST",
        title: "Unit Est. Cost",
        align: "right",
        width: 70,
        fixed: true,
        formatter: $.dui.fmt.currency,
        editor: {
          type: "numberbox",
          options: {
            value: 0,
            precision: 2,
            min: 0,
            prefix: "$",
            required: true,
          },
        },
      },
      {
        field: "UNIT_PRICE",
        title: "Unit Price",
        align: "right",
        width: 70,
        fixed: true,
        formatter: $.dui.fmt.currency,
        editor: {
          type: "numberbox",
          options: { value: 0, precision: 2, min: 0, prefix: "$" },
        },
      },

      {
        field: "TOTAL_PRICE",
        align: "right",
        title: "Total Price",
        width: 100,
        fixed: true,
        formatter: function (val, row, idx) {
          if (!row.UNIT_PRICE)
            return null; // not a member of price group.
          else
            return $.dui.fmt.currency(
              parseInt(row.QTY) * parseFloat(row.UNIT_PRICE),
            );
          //else return $.dui.fmt.currency(parseFloat(row.TOTAL_PRICE));
        },
      },

      {
        field: "WANT_DATE",
        title: "Want Date",
        width: 80,
        fixed: true,
        editor: { type: "datebox", options: { required: true } },
        formatter: $.dui.fmt.date,
      },
      {
        field: "PART_ID",
        title: "Our Part ID",
        width: 100,
        editor: {
          type: "searchbox",
          sbref: "part",
        },
      },

      {
        field: "PART_UOM",
        title: "Our Part UOM",
        width: 150,
        editor: { type: "textbox", options: { readonly: true } },
        coloff: true,
      },
      //-{field:'PART_DESCRIPTION',title:'Our Part Description',width:150,editor:'text'},
      {
        field: "CUST_PART_ID",
        title: "Cust Part Ref",
        width: 100,
        editor: "text",
      },
      {
        field: "CUST_PART_DESCRIPTION",
        title: "Ref Description",
        width: 150,
        editor: "text",
        coloff: true,
        hidden: true,
      },
      {
        field: "CP_REF",
        title: "CP Reference",
        width: 120,
        hidden: true,
        editor: {
          type: "combobox",
          options: {
            groupField: "CUST_ID",
          },
        },
        coloff: true,
      },

      {
        field: "OTD_CODE",
        title: "OTD Code",
        width: 120,
        coloff: true,
        hidden: true,
      },
      {
        field: "PART_DESCRIPTION",
        title: "Our Part Description",
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
                  if ($("body").find("#PART_DESCRIPTION_pop").length == 0) {
                    var dlog = $(
                      '<div id="PART_DESCRIPTION_pop" class="easyui-dialog" />',
                    );
                    $("body").append(dlog);

                    var tbox = $(
                      '<textarea class="fit verdana" style="margin=0px;width=400px;height=400px;"/>',
                    );
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
                  } else var dlog = $("#PART_DESCRIPTION_pop");
                  dlog.dialog("open");
                },
              },
            ],
          },
        },
      },
    ],
  ],

  onBeforeLoad: function () {
    var fdat = $("form#sohead").form("getData");
    if (!fdat.ID) return false;
  },

  loadFilter: function (data) {
    //console.log(data);
    if (data.length == 0) {
    } else {
      data.rows.map(function (row) {
        row._JOB = [];
        row._NCR = [];
        for (var k in row._OPNDATA) {
          row._JOB.push(row._OPNDATA[k]);
          if (row._OPNDATA[k]._NCRS) row._NCR = row._OPNDATA[k]._NCRS;
        }
      });
    }

    return data;
  },
  onSelect: function (idx, row) {
    var dg = $("#solines");

    if (row._JOB.length > 0)
      dg.datagrid("options").tbar.dgre_del.linkbutton("disable");
    if (row.QTY_SHIP > 0) {
      dg.datagrid("options").tbar.dgre_del.linkbutton("disable");
      dg.datagrid("options").tbar.dgre_edit.linkbutton("disable");
    }
  },
  onLoadSuccess: function () {
    $("tr td .icon-ship.icon-dg").off().on("click", $.page.fn.shipinfo);
    $("tr td .icon-ncr").tooltip({ onShow: $.page.fn.ncrinfo });
    $("tr td .icon-tools").tooltip({ onShow: $.page.fn.jobinfo });
    $("tr td .icon-gate_pass.icon-dg").off().on("click", $.page.fn.gpinfo);
  },

  onEndEdit: function (idx, row, chg) {
    console.log(row);
    if (!row.WANT_DATE) {
      msgbox("Want Date is required.");
      $("#solines").datagrid("reload");
    } else {
      var url = "/?_sqlid=sales^soline";
      var data = clone(row);
      var dels = ["QTY_SHIP"];
      dels.map(function (e) {
        delete data[e];
      });
      ajaxget(url, data, function (data) {});
    }
  },
};

$.page.ready(function () {
  // use the global def (see note below)
  //$("#ID").qbe({ defid: "sales_ids" });
  $.page.register({
    autonum: { field: "#ID", type: "SO" },
  });
  //$.page.fn.allcombos();
$('#UDF_LAYOUT_ID').combobox('select', $.dui.bhave.defudf);
  ajaxget('/', {_func: 'get', _sqlid: 'vwltsa^udfid', '_combo': 'y'}, function (rs) {
    $('#UDF_LAYOUT_ID').combobox('loadData', rs);
  });

  $('#UDF_LAYOUT_ID').combobox({
    validType: ['inList'],
    onSelect: setudfs,
    readonly: true,
    value: $.dui.bhave ? $.dui.bhave.defudf : ''
  });

  $('form#qualification [textboxname=UDF_LAYOUT_ID]').combobox({onSelect: setudfs});

  $("#GST_ID").combobox({
    url: "/?_func=get&_sqlid=admin^gst&_combo=y",
    onSelect: function (rec) {
      $("#GST_RATE").numberbox("setValue", rec.percentage);
    },
  });

  $("#CURRENCY_ID").combobox({
    url: "/?_func=get&_sqlid=admin^curr&_combo=y",
    onSelect: function (rec) {
      $("#CURRENCY_RATE").numberbox("setValue", rec.rate);
    },
  });

  //CLS, 171120,QBE
  /*
  $('#ID').combobox('filtertip',{
    default: ['R'],
    field: 'STATUS',
    data: [
      {name:'R',text:'Released'},
      {name:'C',text:'Closed'},
      {name:'H',text:'On-Hold'} 
    ]
  });
*/
  $("#OTD_CODEX").combobox({
    editable: false,
    formatter: function (rec) {
      return rec.value + " - " + rec.description;
    },
  });

  $("#STATUS").combobox({
    default: "R",
    data: [
      { text: "On Hold", value: "H" },
      { text: "Released", value: "R" },
      { text: "Closed", value: "C" },
    ],
  });

  // revision number change.
  $("#REV_NO").numberspinner({
    onChange: function (nv, ov) {
      if ($("form#sohead").form("options").loading) return;
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
  $("#CUST_ID").searchbox({
    onSelect: function (row) {
      var rec = row.value;
      var frm = $("form#sohead");

      $("#solines_editor input[name=CP_REF]").combobox(
        "reload",
        "/?_func=get&_sqlid=inv^cprefs_cust&CUST_ID=" + rec,
      );

      ajaxget(
        "/",
        { _sqlid: "sales^custall", _func: "get", ID: rec },
        function (data) {
          //delete data.GST_ID;
          //delete data.CURRENCY_ID;
          var mods = { ID: "CUST_ID", NAME: "CUST_NAME" };
          for (var i in mods) {
            data[mods[i]] = data[i];
            delete data[i];
          }
          frm.form("preload", data); //.attr('mode',mode);

          $("#CURRENCY_ID").combobox("reselect");
          $("#GST_ID").combobox("reselect");
        },
      );
    },
  });

  $("#but_add").on("done", function () {
    //$('#solines').datagrid('loadData',[]); << this will causing undefined rows when call LoadFilter function.
    $("#solines").datagrid("loadData", { total: 0, rows: [] });
    $("#solines").datagrid("loadData", []);
    $("#STATUS").combobox("select", "R");

    $("#CUST_ID").textbox("readonly", false);
    setTimeout(function () {
      $("#CUST_ID").textbox("clear");
      $("#CUST_ID").textbox("clear");
      $("#CURRENCY_ID").combobox("reload");
      $("#GST_ID").combobox("reload");
    }, 1000);

    //butEn("adx");
  });

  $("#print_form")
    .off("click")
    .on("click", function () {
      printmen({ id: "sales^sa_sorder^sales_form" });
    });

  $("form#sohead")
    .on("loadDone", function (jq, data) {
      if (!data.ID) return;
      //not allowed to change CUST ID once order was added
      $("#CUST_ID").textbox("readonly");
      //butEn("adx");

      $("#solines").datagrid("reload", { SALES_ORDER_ID: data.ID });
      $("#sofiles").datagrid("docFiles", data.ID);

      // Status Colour.
      if (data.STATUS == "H") var cls = "bg-red";
      else var cls = "";
      $("#STATUS").textbox("textbox").removeClass("bg-red").addClass(cls);

      //CLS, 171121, if SO was closed, disabled the datagrid Add button
      var en_dis = "disable";
      if (data.STATUS != "C") en_dis = "enable";
      $("#solines").datagrid("options").tbar.dgre_add.linkbutton(en_dis);

      $("#solines_editor input[name=CP_REF]").combobox(
        "reload",
        "/?_func=get&_sqlid=inv^cprefs_cust&CUST_ID=" + data.CUST_ID,
      );

      /*
    var sol=$('#solines').datagrid('options').columns[0];
    var k=-1;
    for (key in sol){
      k+=1;
      var sol1=sol[key]['field'];
      if (sol1=='CP_REF'){
        sol[key]['editor']['options']['queryParams']['CUST_ID']=data.CUST_ID;
      }
    }
    */

      //$('#dgre_add').linkbutton('enable');
      $("#GST_ID").combobox("reselect");
      //$.page.fn.defudf();
    })
    .on("changed", function (jq, data) {
      var opts = $(this).form("options");
      if (!opts.loading) {
        //("sadx");
      }
    })
    .on("success", function (data) {
      //console.log(data);
      var en_dis = "disable";
      //console.log('@@@@@@@');
      // console.log(data.STATUS);
      if (data.STATUS != "C") en_dis = "enable";
      $("#solines").datagrid("options").tbar.dgre_add.linkbutton(en_dis);
    });

  /*
  for(var k in $.dui.pdata.udfid){
    var val = $.dui.pdata.udfid[k];
    if(k.indexOf('UDF_')===0 && val !== '') {
      if(val.indexOf('*')===0) var req=true; else var req=false;
      $.page.fn.opts.columns[0].push({
        field: k.replace('UDF_','USER_'),
        title: val.replace('*',''),
        editor: {
          type:'textbox',
          options:{
            required: req
          }
        },
        coloff:true
      })
    }
  }
  */

  // if($.dui.udata.groups.indexOf('SALES-PRICING')==-1) $.page.fn.opts.columns[0].splice(9,2);

  var dg = $("#solines");
  dg.datagrid("rowEditor", $.page.fn.opts);
  dg.datagrid("options").tbar.dgre_add.linkbutton("disable");
  dg.datagrid("columns", $("#dgre_tb"));

  /*
  setTimeout(
    $.page.fn.defudf(),5000
  )
  */
});
