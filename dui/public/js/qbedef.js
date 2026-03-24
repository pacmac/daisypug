/*
  layout.jade     - added script(type='text/javascript' src='/js/qbedef.min.js')
  eui.qbe.min.js  - added eui.qbe_def for default definitions
  qbedef.min.js   - overrides default qbe definitions.
*/

/*
  CLS, 171120, 2.2.24
  1, new qbes, sales_id and customer_ids
  
  CLS , 180110, 2.2.36
  1, new qbes, everslik_ids,gauge_ids,caas_aw,operator

    CLS , 180111, 2.2.37
  1, renamed caas_aw sqlid to caas_aw95

  CLS, 180206, 2.2.46
  1, resolved "not such field" error when using operator qbe

  CLS, 180208, 2.2.48
  1, part, add new field, PRODUCT_CODE
*/
eui.qbe_def = {
  part: {
    queryParams: {
      _sqlid: "inv^partid_qbe",
    },
    onDemand: true,
    multiCol: true,
    valueField: "ID",

    fields: [
      { field: "value", title: "Part ID", editor: "textbox" },
      {
        field: "DESCRIPTION",
        title: "Description",
        editor: "textbox",
        formatter: function (val) {
          if (!val) return "";
          else return val.substring(0, 50);
        },
      },
      { field: "ALIAS_DESC", title: "Alias", editor: "textbox" },
      {
        field: "TRACEABLE",
        title: "Traceable",
        editor: {
          type: "combobox",
          options: {
            panelHeight: "auto",
            editable: false,
            data: [
              { value: "", text: "All", selected: true },
              { value: "Y", text: "Yes" },
              { value: "N", text: "No" },
            ],
          },
        },
      },
      { field: "PRODUCT_CODE", title: "Product Code", editor: "textbox" },
      {
        field: "DIM_TRACKED",
        title: "Dimensions",
        editor: {
          type: "combobox",
          options: {
            panelHeight: "auto",
            editable: false,
            data: [
              { value: "", text: "All", selected: true },
              { value: "Y", text: "Yes" },
              { value: "N", text: "No" },
            ],
          },
        },
      },

      /*{field:'BAL_QTY',title:'QOH',editor:'numberbox'},*/
      {
        field: "PART_CLASS_ID",
        title: "Part Class",
        editor: {
          type: "combobox",
          options: {
            panelHeight: "auto",
            editable: false,
            data: [
              { value: "", text: "All", selected: true },
              { value: "FG", text: "Finished Goods" },
              { value: "COMP", text: "Component" },
              { value: "CONSUMABLE", text: "Consumable" },
              { value: "MAKE_STAGED", text: "Make Staged" },
              { value: "MAKE_NOSTAGE", text: "Make Unstaged" },
            ],
          },
        },
      },
      { field: "USER_1", title: "UDF 1", editor: "textbox" },
      { field: "USER_2", title: "UDF 2", editor: "textbox" },
      { field: "USER_3", title: "UDF 3", editor: "textbox" },
      { field: "USER_4", title: "UDF 4", editor: "textbox" },
      { field: "USER_5", title: "UDF 5", editor: "textbox" },
    ],

    onSelect: function (row) {},
  },

  job: {
    queryParams: {
      _sqlid: "vwltsa^basid_qbe",
    },
    onDemand: true,
    valueField: "BASE_ID",
    fields: [
      { field: "value", title: "Job ID", editor: "textbox" },
      { field: "WO_CLASS", title: "Job Class", editor: "textbox" },
      {
        field: "STATUS",
        title: "Status",
        editor: {
          type: "combobox",
          options: {
            panelHeight: "auto",
            editable: false,
            data: [
              { value: "R", text: "Released", selected: true },
              { value: "U", text: "Unreleased" },
              { value: "C", text: "Closed" },
              { value: "X", text: "Cancelled" },
            ],
          },
        },
      },
      { field: "CUSTOMER_ID", title: "Customer ID", editor: "textbox" },
      { field: "SALES_ORDER_ID", title: "Sales Order ID", editor: "textbox" },
      {
        field: "DESIRED_WANT_DATE",
        title: "Want Date",
        formatter: eui.date,
        editor: { type: "datebox", range: true, options: {} },
      },
      { field: "PART_ID", title: "Our Part ID", editor: "textbox" },
      //{field:'CUST_PART_ID',title:'Cust Part ID',editor:'textbox'},
      //{field:'UOM_ID',title:'UOM ID',editor:'textbox'},
    ],

    onSelect: function (row) {},
  },

  ship_ids: {
    queryParams: {
      _sqlid: "vwltsa^ship_ids_qbe",
    },
    onDemand: true,
    valueField: "SHIPMENT_ID",
    fields: [
      { field: "value", title: "Shipment ID", editor: "textbox" },
      { field: "CUST_ID", title: "Customer ID", editor: "textbox" },
      { field: "CUST_NAME", title: "Customer Name", editor: "textbox" },
      { field: "SO_ID", title: "Sales Order ID", editor: "textbox" },
      { field: "INVOICE_ID", title: "Invoice ID", editor: "textbox" },
      { field: "CUST_PO", title: "Customer PO", editor: "textbox" },
      {
        field: "SHIPMENT_DATE",
        title: "Shipment Date",
        editor: "datebox",
        formatter: eui.date,
      },
      {
        field: "INVOICE_DATE",
        title: "Invoice Date",
        editor: "datebox",
        formatter: eui.date,
      },
      {
        field: "CREATE_DATE",
        title: "Create Date",
        editor: "datebox",
        formatter: eui.date,
      },
    ],

    onSelect: function (row) {},
    preload: true,
  },
  //CLS, 171120, qbe
  sales_ids: {
    queryParams: {
      _sqlid: "sales^soids_qbe",
    },
    onDemand: true,
    valueField: "ID",
    fields: [
      { field: "value", title: "SO ID", editor: "textbox" },
      { field: "CUST_ID", title: "Customer ID", editor: "textbox" },
      { field: "CUST_NAME", title: "Customer Name", editor: "textbox" },
      { field: "CUST_PO", title: "Customer PO", editor: "textbox" },
      {
        field: "DATE",
        title: "Order Date",
        editor: "datebox",
        formatter: eui.date,
      },
      {
        field: "STATUS",
        title: "Status",
        editor: {
          type: "combobox",
          options: {
            panelHeight: "auto",
            editable: false,

            data: [
              { value: "H", text: "On Hold" },
              { value: "R", text: "Released", selected: true },
              { value: "C", text: "Closed" },
            ],
          },
        },
      },
      { field: "CURRENCY_ID", title: "Currency", editor: "textbox" },
      { field: "GST_ID", title: "GST", editor: "textbox" },
    ],
    onSelect: function (row) {},
    preload: true,
  },
  soref_ids: {
    queryParams: {
      _sqlid: "sales^sor_qbe",
    },
    onDemand: true,
    valueField: "ID",
    fields: [
      { field: "value", title: "SO Ref", editor: "textbox" },
      { field: "PART_ID", title: "Part ID", editor: "textbox" },
      { field: "CUST_ID", title: "Customer ID", editor: "textbox" },
      { field: "CUST_PART_ID", title: "Cust Part ID", editor: "textbox" },
      {
        field: "WANT_DATE",
        title: "WANT Date",
        editor: "datebox",
        formatter: eui.date,
      },
      { field: "QTY", title: "Order Qty", editor: "numberbox" },
    ],
    onSelect: function (row) {},
    preload: true,
  },
  customer_ids: {
    queryParams: {
      _sqlid: "vwltsa^custall_qbe",
    },
    onDemand: true,
    valueField: "ID",
    fields: [
      { field: "value", title: "Customer ID", editor: "textbox" },
      { field: "NAME", title: "Customer Name", editor: "textbox" },
      { field: "ADDR_1", title: "Address 1", editor: "textbox" },
      { field: "ADDR_2", title: "Address 2", editor: "textbox" },
      { field: "ADDR_3", title: "Address 3", editor: "textbox" },
      { field: "CONTACT_PERSON", title: "Contact", editor: "textbox" },
      { field: "CONTACT_PHONE", title: "Phone", editor: "textbox" },
      { field: "CONTACT_fax", title: "Fax", editor: "textbox" },
      { field: "CONTACT_EMAIL", title: "@", editor: "textbox" },
      { field: "CURRENCY_ID", title: "Currency", editor: "textbox" },
      { field: "GST_ID", title: "GST", editor: "textbox" },
    ],
    onSelect: function (row) {},
    preload: true,
  },
  everslik_ids: {
    queryParams: {
      _sqlid: "dqm^everslik_ids_qbe",
    },
    onDemand: true,
    valueField: "ID",
    fields: [
      { field: "value", title: "Everslik ID", editor: "textbox" },
      { field: "WOREF", title: "Job ID", editor: "textbox" },
      {
        field: "STATUS",
        title: "Status",
        editor: {
          type: "combobox",
          options: {
            panelHeight: "auto",
            editable: false,
            data: [
              { value: "PENDING", text: "PENDING" },
              { value: "IN-PROCESS", text: "IN-PROCESS" },
              { value: "COMPLETED", text: "COMPLETED" },
            ],
          },
        },
      },
    ],
    onSelect: function (row) {},
    preload: true,
  },
  gauge_ids: {
    queryParams: {
      _sqlid: "dqm^gauge_qbe",
    },
    onDemand: true,
    valueField: "ID",
    fields: [
      { field: "value", title: "Gauge ID", editor: "textbox" },
      { field: "GAUGE_TYPE", title: "Gauge Type", editor: "textbox" },
      { field: "DESCRIPTION", title: "Description", editor: "textbox" },
      { field: "DEPARTMENT_ID", title: "Department ID", editor: "textbox" },
      { field: "SERIAL_NO", title: "Serial No", editor: "textbox" },
      { field: "MANUFACTURER", title: "Manufacturer", editor: "textbox" },
      { field: "MODEL", title: "Model", editor: "textbox" },
    ],
    onSelect: function (row) {},
    preload: true,
  },
  caas_aw95: {
    queryParams: {
      _sqlid: "dqm^caas_aw95_qbe",
    },
    onDemand: true,
    valueField: "FORM_NO",
    fields: [
      { field: "value", title: "Form No", editor: "textbox" },
      {
        field: "STATUS",
        title: "Status",
        editor: {
          type: "combobox",
          options: {
            panelHeight: "auto",
            editable: false,
            data: [
              { value: "DRAFT", text: "DRAFT" },
              { value: "ORIGINAL", text: "ORIGINAL" },
            ],
          },
        },
      },
      { field: "WOREF", title: "Job", editor: "textbox" },
      { field: "PART_ID", title: "Part ID", editor: "textbox" },
      { field: "ELIGIBILITY", title: "Eligibility", editor: "textbox" },
      { field: "SERIAL_NO", title: "Serial No", editor: "textbox" },
      { field: "STATUS_WORK", title: "Status Work", editor: "textbox" },
      {
        field: "NEW_PARTS_OPTION",
        title: "New Parts Option",
        editor: "textbox",
      },
      {
        field: "USED_PARTS_OPTION",
        title: "Used Parts Option",
        editor: "textbox",
      },
      { field: "APPROVAL_NO", title: "Approval  No", editor: "textbox" },
    ],
    onSelect: function (row) {},
    preload: true,
  },
  operator: {
    queryParams: {
      _sqlid: "vwltsa^operators_qbe",
    },
    onDemand: true,
    valueField: "ID",
    fields: [
      { field: "value", title: "Operator ID", editor: "textbox" },
      { field: "LAST_NAME", title: "Last Name", editor: "textbox" },
      { field: "FIRST_NAME", title: "First Name", editor: "textbox" },
      { field: "COUNTRY", title: "Country", editor: "textbox" },
      { field: "DEPARTMENT_ID", title: "Department ID", editor: "textbox" },
      { field: "SHIFT_ID", title: "Shift ID", editor: "textbox" },
      {
        field: "ACTIVE",
        title: "Active",
        editor: {
          type: "combobox",
          options: {
            panelHeight: "auto",
            editable: false,
            data: [
              { value: "Y", text: "Yes" },
              { value: "N", text: "No" },
            ],
          },
        },
      },
    ],
    onSelect: function (row) {},
    preload: true,
  },
  gatepass_ids: {
    queryParams: {
      _sqlid: "inv^gatepass_qbe",
    },
    onDemand: true,
    valueField: "GP_ID",
    fields: [
      { field: "value", title: "Gatepass ID", editor: "textbox" },
      {
        field: "GP_TYPE",
        title: "GP Type",
        editor: {
          type: "combobox",
          options: {
            panelHeight: "auto",
            editable: false,
            data: [
              { value: "C", text: "CUSTOMER" },
              { value: "V", text: "VENDOR" },
            ],
          },
        },
      },
      {
        field: "TX_TYPE",
        title: "Tx Type",
        editor: {
          type: "combobox",
          options: {
            panelHeight: "auto",
            editable: false,
            data: [
              { value: "S", text: "Shipment" },
              { value: "R", text: "Return" },
            ],
          },
        },
      },
      {
        field: "DOC_TYPE",
        title: "Doc Type",
        editor: {
          type: "combobox",
          options: {
            panelHeight: "auto",
            editable: false,
            data: [
              { value: "WO", text: "Job" },
              { value: "SO", text: "Sales" },
            ],
          },
        },
      },
      { field: "DOC_ID", title: "Doc ID", editor: "textbox" },
      { field: "PART_ID", title: "Part ID", editor: "textbox" },
      { field: "GP_DATE", title: "GP Date", formatter: eui.date },
      { field: "GP_TYPE_ID", title: "Cust/Vendor" },
      { field: "NAME", title: "Name" },
    ],
    onSelect: function (row) {},
    preload: true,
  },
  po_ids: {
    queryParams: {
      _sqlid: "inv^po_qbe",
    },
    onDemand: true,
    valueField: "ID",
    fields: [
      { field: "value", title: "PO ID", editor: "textbox" },
      { field: "VENDOR_ID", title: "Vendor ID", editor: "textbox" },
      { field: "NAME", title: "Vendor Name", editor: "textbox" },
      {
        field: "ORDER_DATE",
        title: "Order Date",
        formatter: eui.date,
        editor: "datebox",
      },
      {
        field: "DELIVERY_DATE",
        title: "Dlvy Date",
        formatter: eui.date,
        editor: "datebox",
      },
      {
        field: "STATUS",
        title: "Status",
        editor: {
          type: "combobox",
          options: {
            panelHeight: "auto",
            editable: false,
            data: [
              { value: "H", text: "On Hold" },
              { value: "R", text: "Released", selected: true },
              { value: "C", text: "Closed" },
              { value: "X", text: "Cancelled" },
            ],
          },
        },
      },
    ],
    onSelect: function (row) {},
    preload: true,
  },

  receipt_ids: {
    queryParams: {
      _sqlid: "inv^receipt_ids_qbe",
    },
    onDemand: true,
    valueField: "RECEIPT_ID",
    fields: [
      { field: "value", title: "Receipt ID", editor: "textbox" },
      { field: "VENDOR_ID", title: "Vendor ID", editor: "textbox" },
      { field: "NAME", title: "Vendor Name", editor: "textbox" },
      { field: "PO_ID", title: "PO ID", editor: "textbox" },
      {
        field: "ACT_DELIVERY_DATE",
        title: "Delivery Date",
        editor: "datebox",
        formatter: eui.date,
      },
      {
        field: "CREATE_DATE",
        title: "Create Date",
        editor: "datebox",
        formatter: eui.date,
      },
    ],

    onSelect: function (row) {},
    preload: true,
  },

  opnrefs: {
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
            editable: false,
            data: [
              { value: "R", text: "Released", selected: true },
              { value: "C", text: "Closed" },
              { value: "X", text: "Cancelled" },
            ],
          },
        },
      },
    ],
    onSelect: function (row) {},
  },
};
