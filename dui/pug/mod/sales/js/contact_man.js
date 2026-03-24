/*
  PAC 171102 - 2.2.48
  1. When adding, updaing event, the stage will change from LEAD to SUSPECT.
  2. Changed event details box to multiline box


*/

$.page.fn.source = {
  panelHeight: "auto",
  data: [
    { text: "Google", value: "GOOGLE" },
    { text: "Website", value: "WEBSITE" },
    { text: "Internet", value: "INTERNET" },
    { text: "Customer Referral", value: "REFERRAL" },
    { text: "Direct Marketing", value: "DIRECT" },
    { text: "Alena", value: "ALENA" },
    { text: "Other", value: "OTHER" },
  ],
};

//- get dynamic combo if exists.
$.page.fn.dyncbo = function (bhid, obj) {
  if (bhid) obj.data = JSON.parse(bhid);
};

//- behaviour - status
$.page.fn.industry = {
  panelHeight: "auto",
  data: [
    { text: "Aerospace", value: "AEROSPACE" },
    { text: "Automotive", value: "AUTO" },
    { text: "Electronics", value: "ELECTRONICS" },
    { text: "Heavy Fabrication", value: "HEAVY" },
    { text: "Industrial Equipment", value: "EQUIPMENT" },
    { text: "Marine", value: "MARINE" },
    { text: "Medical Equipment", value: "MEDICAL" },
    { text: "Metal Fabrication", value: "METFAB" },
    { text: "Oil & Gas", value: "OIL_GAS" },
    { text: "Repair & Service", value: "REAPIR" },
    { text: "Tool Making", value: "TOOLS" },
    { text: "Others", value: "OTHER" },
  ],
};
$.page.fn.dyncbo($.dui.bhave.industry_id, $.page.fn.industry);

$.page.fn.status = {
  panelHeight: "auto",
  data: [
    { text: "Active", value: "ACTIVE" },
    { text: "Hot", value: "HOT" },
    { text: "Inactive", value: "INACTIVE" },
    { text: "Dead / Lost", value: "DEAD" },
  ],
};
$.page.fn.dyncbo($.dui.bhave.status_id, $.page.fn.status);

//- behaviour - stage
$.page.fn.stage = {
  panelHeight: "auto",
  data: [
    { text: "New Lead", value: "LEAD" },
    { text: "Suspect", value: "SUSPECT" },
    { text: "Qualified Prospect", value: "PROSPECT" },
  ],
};
$.page.fn.dyncbo($.dui.bhave.stage_id, $.page.fn.stage);

//- event types
$.page.fn.evttypes = {
  required: true,
  type: "combobox",
  options: {
    panelHeight: "auto",
    data: [
      { value: "CALL-IN", text: "Call In" },
      { value: "CALL-OUT", text: "Call Out" },
      { value: "EMAIL", text: "Email" },
      { value: "DEMO", text: "Demo" },
      { value: "MEETING", text: "Meeting" },
      { value: "MAILER", text: "Mail Blast" },
      { value: "QUOTE", text: "Quotation" },
      { value: "OTHER", text: "Other" },
    ],
  },
};

$.page.fn.contactEmail = function (val) {
  if (!val) return "";
  return (
    '<span style="width:16px;margin-right:6px;" class="icon-email icon-dg click" data-email="' +
    val +
    '"></span><span>' +
    val +
    "</span>"
  );
};

$.page.ready(function () {
  $("#CO_ID").qbe({
    /* fires when panel is closed */
    onClose: function () {
      if (!$.page.fn.blast) return false;
      $.page.fn.blast = false;
      var opt = $(this)[0];
      confirm(function (yn) {
        if (yn) {
          var qp = opt.dlog.dg.datagrid("options").queryParams;
          ajaxget(
            "/",
            $.extend(
              {
                _sqlid: "sales^crm_blast",
                _func: "upd",
              },
              qp,
            ),
            function (data) {
              reload();
            },
          );
        }
      }, "Include All Selected ?");
    },

    queryParams: { _sqlid: "sales^crm_coids_qbe" },
    onDemand: true,
    valueField: "CO_ID",
    fields: [
      { field: "value", title: "Company ID", editor: "textbox" },
      { field: "CO_NAME", title: "Company Name", editor: "textbox" },
      {
        field: "STATUS_ID",
        title: "Status",
        editor: { type: "combobox", options: $.page.fn.status },
      },
      {
        field: "STAGE_ID",
        title: "Stage",
        editor: { type: "combobox", options: $.page.fn.stage },
      },
      {
        field: "SOURCE_ID",
        title: "Lead Source",
        editor: { type: "combobox", options: $.page.fn.source },
      },
      {
        field: "INDUSTRY_ID",
        title: "Industry",
        editor: { type: "combobox", options: $.page.fn.industry },
      },
      {
        field: "MAIL_FLAG",
        title: "Next Mailer ?",
        editor: {
          type: "combobox",
          options: {
            panelHeight: "auto",
            data: [
              { text: "Exclude", value: "N", iconCls: "icon-tick" },
              { text: "Include", value: "Y", iconCls: "icon-cross" },
            ],
          },
        },
      },

      { field: "ADDR_1", title: "Address 1", editor: "textbox" },
      { field: "ADDR_2", title: "Address 2", editor: "textbox" },
      { field: "ADDR_3", title: "Address 3", editor: "textbox" },
      { field: "COUNTRY", title: "Country", editor: "textbox" },
      { field: "POSTCODE", title: "Postcode", editor: "textbox" },
    ],
    preload: true,
  });

  $("#mblast").on("click", function () {
    $.page.fn.blast = true;
    $("#CO_ID").parent().find(".qbe-search").click();
  });

  $("#contactdg")
    .datagrid({
      onBeforeLoad: function (qp) {
        qp.CO_ID = $("#CO_ID").qbe("getValue");
        if (!qp.CO_ID) return false;
      },

      onLoadSuccess: function () {
        $("tr td .icon-email.icon-dg")
          .off()
          .on("click", function () {
            window.location = "mailto:" + $(this).data().email;
          });
      },
    })
    .datagrid("rowEditor", {
      striped: true,
      twoColumns: false,
      editor: "form",
      addData: {
        CO_ID: "#CO_ID",
      },

      onEndEdit: function (idx, row, chg) {
        var me = $(this);
        var data = $.extend(row, {
          _sqlid: "sales^crm_contact",
        });

        ajaxget("/", data, function (res) {
          me.datagrid("reload");
        });
      },
    })
    .datagrid("columns", $("#contact_tab #dgre_tb"));

  // ## EVENTS
  $("#eventdg")
    .datagrid({
      onBeforeLoad: function (qp) {
        qp.CO_ID = $("#CO_ID").qbe("getValue");
        if (!qp.CO_ID) return false;
      },
    })
    .datagrid("rowEditor", {
      striped: true,
      twoColumns: false,
      editor: "form",
      addData: {
        CO_ID: "#CO_ID",
        CONTACT_ID: "#PRIMARY_CONTACT_ID",
      },

      onEndEdit: function (idx, row, chg) {
        var me = $(this);
        var data = $.extend(row, {
          _sqlid: "sales^crm_events",
        });

        // change Stage
        var fdat = $("form#main").form("getData");
        if (fdat.STAGE_ID == "LEAD")
          $("#STAGE_ID").combobox("select", "SUSPECT");

        ajaxget("/", data, function (res) {
          me.datagrid("reload");
          //reload();
        });
      },
    })
    .datagrid("columns", $("#event_tab #dgre_tb"));

  $("#ORDER_MODE").combobox({
    panelHeight: "auto",
    data: [
      { text: "Order Driven", value: "MTO", selected: true },
      { text: "Forecast Driven", value: "MTF" },
      { text: "Forecast & Order", value: "BOTH" },
    ],
  });

  $("#INDUSTRY_ID").combobox($.page.fn.industry);

  $("#MAIL_FLAG").combobox({
    panelHeight: "auto",
    data: [
      { text: "Exclude", value: "N", selected: true },
      { text: "Include", value: "Y" },
    ],
  });

  $("#STAGE_ID").combobox($.page.fn.stage);
  $("#STATUS_ID").combobox($.page.fn.status);
  $("#SOURCE_ID").combobox($.page.fn.source);

  $("form#main").on("loadDone", function (jq, data) {
    var coid = data.CO_ID;
    if (!coid) return;

    // load datagrids
    var ed = $("#eventdg");
    ed.datagrid("loadData", data.__EVENT);
    $("#contactdg").datagrid("loadData", data.__CONTACT);
    $("#cofiles").datagrid("docFiles", coid);

    // load the contacts from existing data.
    var cids = [];
    data.__CONTACT.map(function (row) {
      cids.push({
        value: row.CONTACT_ID,
        text: row.NAME_LAST + ", " + row.NAME_FIRST,
      });
    });

    $("#eventdg_editor")
      .find('select[name="CONTACT_ID"]')
      .combobox("loadData", cids);
  });
});
