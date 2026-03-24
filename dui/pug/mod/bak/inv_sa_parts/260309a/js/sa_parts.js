
$.page.ready(function () {
/*
  
  PAC 171106 - 2.2.95
  1. Added support for dimensions tab.
  2. Added data-alias code after form load.
  
  PAC 171116 - 2.2.101
  1. Added new code for used-in tab.
  2. Clear used-in combo & datagrid on loading of new part.

  CLS< 180206, 2.2.105
  1, using curr_ids_get instead of curr sqlob


  PAC 180306, 2.2.121
  1. Added new UNIT_CONSUMABLE_COST & switch code to show / hide.
  2. created new dwap.page.costimems() called by form.onload() & add new().
  
*/

$.page.fn.traceable = function () {
  var trace = $.dui.bhave.partTraceManual || "y";
  //console.log(trace.toUpperCase());
  var traceable = $("#TRACEABLE");
  traceable.combobox("setValue", trace.toUpperCase());
};

$.page.fn.material_unit_cost = function () {
  var traceable = $("#TRACEABLE").combobox("getValue");
  var mat_unit_cost_behave = $.dui.bhave.MANDATORY_UNITCOST;
  var tf = false;
  if (traceable == "N") {
    if (mat_unit_cost_behave.toUpperCase() == "Y") tf = true;
  }
  var unitcost = $("#UNIT_MATERIAL_COST");
  unitcost.numberbox("required", tf);
  unitcost.numberbox("enable");
};
$.page.fn.costitems = function () {
  var fdat = $.page.fn.fdat();
  var ucc = $("#UNIT_CONSUMABLE_COST"),
    umc = $("#UNIT_MATERIAL_COST");
  var tf = false;
  var bal = $("#BAL_QTY").numberbox("getValue");
  if (fdat.BAL_QTY > 0) tf = true;
  umc.numberspinner("readonly", tf);
  ucc.numberspinner("readonly", tf);

  var pcId = $("#PART_CLASS_ID").combobox("getValue");
  // PAC 180306 - CONSUMABLE
  if (pcId == "CONSUMABLE") {
    umc.parent().hide();
    ucc.parent().show();
    umc.numberspinner("setValue", 0);
  } else {
    umc.parent().show();
    ucc.parent().hide();
    ucc.numberspinner("setValue", 0);
  }
};

$.page.fn.nocarat = function (val) {
  return val.replace(/\^/g, "-");
};

$.page.fn.fdat = function (key) {
  var data = frm2dic($("#partf"));
  if (key) return data[key];
  return data;
};

$.page.fn.dims = function (lwh) {
  var d = $("#DIM_TRACKED");
  var l = $("#LENGTH").combobox("getValue");
  var w = $("#WIDTH").combobox("getValue");
  var h = $("#HEIGHT").combobox("getValue");
  if (l == "Y" || w == "Y" || h == "Y") d.combobox("setValue", "Y");
  if (l == "N" && w == "N" && h == "N") d.combobox("setValue", "N");
};

$.page.fn.prices = function () {
  ajaxget("/", { _sqlid: "admin^curr", _func: "get" }, function (res) {
    $.page.fn.currs = res;
  });
  var dg = $("#prices");
  dg.datagrid().datagrid("rowEditor", {
    editor: "inline",
    striped: true,
    rownumbers: false,
    _fitColumns: true,
    fit: true,

    columns: [
      [
        { field: "PART_ID", hidden: true, title: "" },
        { field: "CURRENCY_ID", title: "Cur ID", width: 60 },
        { field: "DESCRIPTION", title: "Description", width: 120 },
        {
          field: "UNIT_PRICE",
          title: "Price",
          width: 60,
          align: "right",
          editor: {
            type: "numberbox",
            options: {
              precision: 2,
              min: 0,
            },
          },
          formatter: eui.currency,
        },
      ],
    ],

    onEndEdit: function (idx, row, chg) {
      var data = $.extend(row, {
        _sqlid: "inv^part_price",
        _func: "upd",
      });

      ajaxget("/", data, function (res) {
        cl(res);
      });
    },
  });

  // remove buttons.
  var opt = dg.datagrid("options");
  opt.tbar.dgre_del.hide();
  opt.tbar.dgre_edit.hide();
  opt.tbar.dgre_add.hide();
};

$.page.fn.opengen = function () {
  $("#pngenwin").window({
    title: "Part Number Generator",
    closed: true,
    minimizable: false,
    draggable: true,
    modal: true,
    onBeforeClose: function () {
      if (!$("#ID").textbox("getValue")) {
        alert("Please generate the part.");
        return false;
      }
    },
  });

  $("#but_add").on("done", function (evt) {
    $.page.fn.costitems();
    $("#phycount").datagrid("loadData", []);
    if (!$.page.fn.dogen) {
      $.page.fn.traceable();
      $.page.fn.material_unit_cost();
      return false;
    }
    //var os = $(evt.target).offset();
    $("#pngenwin").window("move", { left: 362, top: 78 });
    $("#pngenwin").window("open");
    $.page.fn.traceable();
    $.page.fn.material_unit_cost();
    $("#ORDER_TYPE").combobox("setValue", "NONE");
  });
};

//### PART GENERATOR-START ###
$.page.fn.partgen = function () {
  if ($.dui.bhave.partgen == "y") {
    $("#addmenu").menu({
      onClick: function (item) {
        if (item.name == "gen") $.page.fn.dogen = true;
        else $.page.fn.dogen = false;
        but_add();
      },

      onShow: function () {
        var me = $(this);
        var os = { me: $(this), mode: "disableItem" };
      },
    });

    $.page.fn.opengen();
  } else {
    $("#but_add").on("done", function (evt) {
      $.page.fn.costitems();
      $("#phycount").datagrid("loadData", []);
      $("#boms").datagrid("loadData", []);
    });
  }
};
//### PART GENERATOR-END ###

$.page.fn.part_ud = () => {
  var partud = $.dui.udata.groups.indexOf("PART-UD");
  //console.log(partud, dwap.bhave.partgen);
  //if (partud==-1) $('#addmenu').menu('disableItem',$('#ud'));
  //else $('#addmenu').menu('enableItem',$('#ud'));

  $("#but_add").on("done", function (evt) {
    $.page.fn.costitems();
    $("#phycount").datagrid("loadData", []);
    $("#boms").datagrid("loadData", []);
    if (partud == -1 && $.dui.bhave.partgen == "y") {
      $("#pngenwin").window("move", { left: 362, top: 78 });
      $("#pngenwin").window("open");
    }
  });

  setTimeout(() => {
    if (partud == -1 && $.dui.bhave.partgen == "n") {
      $("#but_add").linkbutton("disable");
    }
  });
};

//CLS, 190430, added Mandatory fields behave setting
$.page.fn.mandatory = () => {
  var rev = $.dui.bhave.MANDATORY_REVISION || "n";
  var tf = true;
  if (rev == "n") tf = false;
  $("#PART_REV_NO").textbox("required", tf);
};

//CLS , 190430, add PART-DETAIL-UPD group
//if user not belong to this group , part header not allowed to edit
$.page.fn.part_detail_upd = () => {
  var pdu = $.dui.udata.groups.indexOf("PART-DETAIL-UPD");
  var tf = false;

  if (pdu == -1) tf = true;
  $("#header :input").attr("disabled", tf);
  if (pdu == -1) $("#but_save").linkbutton("disable");
  else $("#but_save").linkbutton("enable");
};

//CLS, 190509, if REVISION changed,force user to enter ECN_ID
$.page.fn.ecn = (init) => {
  var ecn = $("#ECN_ID");
  ecn.textbox("required", init);
  ecn.textbox("readonly", !init);
  if (init == true) ecn.textbox("clear");
};
//CLS,201223, if BAL_QTY=0, TRACEABLE field enabled
$.page.fn.traceable_endis = () => {
  var pdu = $.dui.udata.groups.indexOf("PART-DETAIL-UPD");
  var tf = true;
  if (pdu == -1) {
    tf = true;
    var endis = { true: "disable", false: "enable" }[tf];
    // $("#TRACEABLE").combobox("readonly",tf);
    $("#TRACEABLE").combobox(endis);
  } else {
    ajaxget(
      "/",
      { _sqlid: "inv^part_sites", _func: "get", ID: $("#ID").searchbox("getValue") },
      function (res) {
        if (res.CNT == 0) tf = false;
        else tf = true;
        var endis = { true: "disable", false: "enable" }[tf];
        // console.log('CNT:',res.CNT,",tf=",tf,',endis=',endis)
        // $("#TRACEABLE").combobox("readonly",tf);
        // $("#TRACEABLE").combobox(endis);
        // $("#PRODUCT_CODE").combobox(endis);
        // $("#UOM_ID").combobox(endis);

        $("#TRACEABLE").combobox("readonly", tf);
        $("#PRODUCT_CODE").combobox("readonly", tf);
        $("#UOM_ID").combobox("readonly", tf);
      }
    );
  }
};

$(document).ready(function () {
  $.page.fn.partgen();
  $.page.fn.prices();

  $("form#partquery").removeAttr("asdpx");
  $("#UDF_LAYOUT_ID").combobox({ onSelect: setudfs });
  $("#PART_CLASS_ID").combobox({
    onSelect: function (rec) {
      $.page.fn.costitems();
    },
  });

  $("#LENGTH").combobox({
    onSelect: function (rec) {
      $.page.fn.dims("l");
    },
  });

  $("#WIDTH").combobox({
    onSelect: function (rec) {
      $.page.fn.dims("w");
    },
  });
  $("#HEIGHT").combobox({
    onSelect: function (rec) {
      $.page.fn.dims("h");
    },
  });

  $("#TRACEABLE").combobox({
    onSelect: function (rec) {
      $.page.fn.material_unit_cost();
    },
    onChange: function (nv, ov) {
      $.page.fn.material_unit_cost();
    },
  });

  var unitcost = $("#UNIT_MATERIAL_COST");
  unitcost.numberbox({
    onChange: function (nv, ov) {
      // console.log(nv,'-',ov);
      // if (nv == 0) unitcost.numberbox('setValue','')
    },
  });
  $("#partf")
    .on("changed", function (jq, tgt) {})
    .on("loadDone", function (jq, fdat) {
      //$(this).form('reselect');
      //console.log(fdat);
      $("#_PART_REV_NO").val(fdat.PART_REV_NO);

      $.page.fn.ecn(false);

      $.page.fn.costitems();

      // 160622 - File Attachments
      $.page.fn.fkey = fdat.ID;
      $("#partfiles").datagrid("docFiles", $.page.fn.fkey);
      var rec = $("#UDF_LAYOUT_ID").combobox("getRec");
      setudfs(rec, $(this));
      setTimeout(function () {
        //if(dwap.bhave.partgen=='y') butEn('nsdx'); else butEn('asdx');
        if ($.dui.bhave.partgen == "y") {
          if ($.dui.udata.groups.indexOf("PART-UD") == -1) butEn("asdx");
          else butEn("nsdx");
        } else butEn("asdx");
        
        //<PAC>
        //$("form#partquery input#QRY_PART_ID")
        //  .combobox("select", fdat.ID)
        //  .combobox("readonly", true);

        $("form#partquery input#QRY_PART_ID")
          .searchbox("select", fdat.ID)
          .searchbox("editable", false);
        //</PAC>

        // pricing datagrid.
        var data = [];
        $.page.fn.currs.map(function (e) {
          data.push({
            PART_ID: fdat.ID,
            CURRENCY_ID: e.id,
            DESCRIPTION: e.description,
            UNIT_PRICE: fdat.PRICE[e.id] || 0,
          });
        });

        $("#prices").datagrid("loadData", data);

        // PAC 171106 - Dimensions
        $("#dgdim").datagrid("load");

        // PAC 171116 - Used-in Reset.
        $("#usedin_src").combobox("clear");
        $("#usedin").datagrid("loadData", []);

        $("#phycount").datagrid("load", {
          _func: "get",
          _dgrid: "y",
          _sqlid: "inv^physical_count_lines_by_part",
          PART_ID: fdat.ID,
        });

        $.page.fn.part_ud();

        $("#PART_REV_NO").textbox({
          onChange: (nv, ov) => {
            var tf = false;
            ov = $("#_PART_REV_NO").val();
            if (nv != ov) $.page.fn.ecn(!tf);
            else $.page.fn.ecn(tf);
          },
        });
        $.page.fn.part_detail_upd();
        $.page.fn.material_unit_cost();
        $.page.fn.mandatory();
        //CLS.201223,
        $.page.fn.traceable_endis();
        $("#boms").datagrid("load", {
          _func: "get",
          _dgrid: "y",
          _sqlid: "inv^partbom",
          PART_ID: fdat.ID,
        });
      });
    });

  //-<PAC>
  //- $("#ID").qbe({ defid: "part", preload: true });
  $("#ID").searchbox({ sbref: "part", preload: true });
  //-</PAC>

  // ## 171116 - USED-IN CODE START ##
  $("#usedin_src").combobox({
    panelHeight: "auto",
    groupField: "appid",
    data: [
      {
        /* JOB DATAGRID */ value: "JOBS",
        text: "Job Header",
        appid: "Manufacturing",
        columns: [
          [
            { field: "WO_CLASS", title: "Job Class" },
            { field: "BASE_ID", title: "Job Number" },
            { field: "STATUS", title: "Status" },
            { field: "DESIRED_QTY", title: "Run Qty" },
            {
              field: "DESIRED_WANT_DATE",
              title: "Want Date",
              formatter: eui.date,
            },
            { field: "WO_TYPE", title: "Job Class" },
          ],
        ],
      },
      {
        /* OPERATION DATAGRID */ value: "OPN",
        text: "Job Operations",
        appid: "Manufacturing",
        columns: [
          [
            { field: "WO_JOB_ID", title: "Job Number" },
            { field: "SEQ_NO", title: "Seq No" },
            { field: "STATUS", title: "Status" },
            { field: "REQUIRED_QTY", title: "Reqd Qty" },
            { field: "WANT_DATE", title: "Want Date", formatter: eui.date },
          ],
        ],
      },

      {
        /* SALES ORDER DATAGRID */ value: "SO",
        text: "Sales Order Lines",
        appid: "Sales",
        columns: [
          [
            { field: "SALES_ORDER_ID", title: "SO ID" },
            { field: "LINE_NO", title: "Line #" },
            { field: "DATE", title: "Order Date", formatter: eui.date },
            { field: "STATUS", title: "Status" },
            { field: "CUST_ID", title: "Customer ID" },
            { field: "CUST_NAME", title: "Customer Name" },
            /*{field:'CP_REF',title:'CP ID'},*/
            { field: "QTY", title: "Order Qty" },
            { field: "QTY_SHIP", title: "Ship Qty" },
          ],
        ],
      },
      {
        /* SHIPMENT DATAGRID */ value: "SHP",
        text: "Shipment Lines",
        appid: "Sales",
        columns: [
          [
            { field: "SHIPMENT_ID", title: "Shipment ID" },
            {
              field: "SHIPMENT_DATE",
              title: "Shipped Date",
              formatter: eui.date,
            },
            { field: "LINE_NO", title: "Line #" },
            { field: "INVOICE_ID", title: "Invoice ID" },
            { field: "SO_ID", title: "Sales Order ID" },
            { field: "SO_LINENO", title: "SO Line No" },
            { field: "QTY", title: "Shipped Qty" },
          ],
        ],
      },

      {
        /* COC DATAGRID */ value: "COC",
        text: "COC Source",
        appid: "Quality",
        columns: [
          [
            { field: "COC_ID", title: "COC ID" },
            { field: "COC_REV", title: "Revn No" },
            { field: "STATUS", title: "Status" },
            { field: "CREATE_DATE", title: "COC Date", formatter: eui.date },
            { field: "PRINTED_DATE", title: "Print Date", formatter: eui.date },
            {
              field: "WOREF",
              title: "Job Number",
              formatter: $.page.fn.nocarat,
            },
            { field: "CUSTOMER_ID", title: "Cust ID" },
            { field: "QTY", title: "Qty" },
            { field: "ISSUED_BY", title: "Creator" },
          ],
        ],
      },

      {
        /* CPAR DATAGRID */ value: "CPAR",
        text: "CPAR Source",
        appid: "Quality",
        columns: [
          [
            { field: "NCR_ID", title: "NCR ID" },
            { field: "CREATE_DATE", title: "Date", formatter: eui.date },
            { field: "STATUS", title: "Status" },
            {
              field: "WOREF",
              title: "Linked Job",
              formatter: $.page.fn.nocarat,
            },
            { field: "SUBJECT", title: "Subject" },
            { field: "SEVERITY", title: "Severity" },
          ],
        ],
      },

      {
        /* NCR DATAGRID */ value: "NCR",
        text: "NCR Source",
        appid: "Quality",
        columns: [
          [
            { field: "NCR_ID", title: "NCR ID" },
            { field: "CREATE_DATE", title: "Date", formatter: eui.date },
            { field: "STATUS", title: "Status" },
            {
              field: "WOREF",
              title: "Linked Job",
              formatter: $.page.fn.nocarat,
            },
            { field: "SUBJECT", title: "Subject" },
            { field: "SEVERITY", title: "Severity" },
          ],
        ],
      },
    ],

    onSelect: function (rec) {
      $("#usedin")
        .datagrid({
          type: rec.value,
          columns: rec.columns,
        })
        .datagrid("reload");
    },
  });

  $("#usedin").datagrid({
    url: "/",
    type: null,
    queryParams: {
      _func: "get",
      _dgrid: true,
      _sqlid: "inv^part_used",
      PART_ID: null,
      type: null,
    },

    fit: true,
    fitColumns: true,
    striped: true,
    singleSelect: true,
    columns: [[]],
    onBeforeLoad: function (qp) {
      var opt = $(this).datagrid("options");
      qp.PART_ID = $("#ID").searchbox("getValue");
      qp.type = opt.type;
      if (!qp.PART_ID) return false;
    },
  });
  // ## 171116 - USED-IN CODE END ##
  $("#phycount").datagrid({
    url: "/",
    type: null,
    queryParams: {
      _func: "get",
      _dgrid: true,
      _sqlid: "inv^physical_count_lines_by_part",
      PART_ID: null,
    },

    fit: true,
    striped: true,
    singleSelect: true,
    columns: [
      [
        { field: "PHYSICAL_COUNT_ID", title: "Physical Count ID", width: 150 },
        { field: "STATUS", title: "Status", width: 120 },
        {
          field: "START_DATE",
          title: "Start Date",
          formatter: eui.date,
          width: 120,
        },
        {
          field: "END_DATE",
          title: "End Date",
          formatter: eui.date,
          width: 120,
        },
        { field: "NOTES", title: "Notes", width: 120 },
      ],
    ],
    onBeforeLoad: function (qp) {
      qp.PART_ID = $("#ID").searchbox("getValue");
      if (!qp.PART_ID) return false;
    },
  });

  $("#boms").datagrid({
    url: "/",
    type: null,

    /*
    rowStyler: function(idx,row){
		  if (row.EXIST !='Y'){
			  return {class:'fg-red'};	
		  }
	  },
    */

    queryParams: {
      _func: "get",
      _dgrid: true,
      _sqlid: "inv^partbom",
      PART_ID: null,
    },

    fit: true,
    striped: true,
    singleSelect: true,
    fitColumns: true,

    columns: [
      [
        { field: "PART_ID", hidden: true, title: "" },
        { field: "LINE_NO", title: "Line #" },
        {
          field: "_EXIST",
          title: "Exists",
          styler: function (val, row, idx) {
            if (row.EXIST == "Y") var cls = "icon-tick";
            else var cls = "icon-cross";
            return {
              class: cls,
              style:
                "background-position:center center;background-repeat:no-repeat;",
            };
          },
        },
        { field: "ITEM_ID", title: "Item ID" },
        { field: "QTY", title: "Qty" },
        { field: "REV", title: "Rev" },
        { field: "UOM_ID", title: "UOM" },
        { field: "QOH", title: "QOH" },
        { field: "DESCRIPTION", title: "Description" },
      ],
    ],

    onBeforeLoad: function (qp) {
      qp.PART_ID = $("#ID").searchbox("getValue");
      if (!qp.PART_ID) return false;
    },
    /*
    onBeforeSelect: function(index, row) {
      return false;
    }
    */
  });

  $.page.fn.part_ud();
  setTimeout(() => {
    $.page.fn.mandatory();
    $.page.fn.part_detail_upd();
  });
});


});  // $.page.ready
