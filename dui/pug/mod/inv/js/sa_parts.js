
$.page.ready(function () {

  // ========================================================================
  // Register — page functions
  // ========================================================================
  $.page.register({
    fn: {
      traceable: function () {
        var trace = $.dui.bhave.partTraceManual || 'y';
        $('#TRACEABLE').combobox('setValue', trace.toUpperCase());
      },

      material_unit_cost: function () {
        var traceable = $('#TRACEABLE').combobox('getValue');
        var mat_unit_cost_behave = $.dui.bhave.MANDATORY_UNITCOST;
        var tf = false;
        if (traceable == 'N') {
          if (mat_unit_cost_behave.toUpperCase() == 'Y') tf = true;
        }
        $('#UNIT_MATERIAL_COST').numberbox('required', tf);
        $('#UNIT_MATERIAL_COST').numberbox('enable');
      },

      costitems: function () {
        var fdat = $.page.fn.fdat();
        var ucc = $('#UNIT_CONSUMABLE_COST'), umc = $('#UNIT_MATERIAL_COST');
        var tf = false;
        if (fdat.BAL_QTY > 0) tf = true;
        umc.numberspinner('readonly', tf);
        ucc.numberspinner('readonly', tf);
        var pcId = $('#PART_CLASS_ID').combobox('getValue');
        if (pcId == 'CONSUMABLE') {
          umc.parent().hide(); ucc.parent().show();
          umc.numberspinner('setValue', 0);
        } else {
          umc.parent().show(); ucc.parent().hide();
          ucc.numberspinner('setValue', 0);
        }
      },

      fdat: function (key) {
        var data = frm2dic($('#partf'));
        if (key) return data[key];
        return data;
      },

      dims: function (lwh) {
        var d = $('#DIM_TRACKED');
        var l = $('#LENGTH').combobox('getValue');
        var w = $('#WIDTH').combobox('getValue');
        var h = $('#HEIGHT').combobox('getValue');
        if (l == 'Y' || w == 'Y' || h == 'Y') d.combobox('setValue', 'Y');
        if (l == 'N' && w == 'N' && h == 'N') d.combobox('setValue', 'N');
      },

      ecn: function (init) {
        var ecn = $('#ECN_ID');
        ecn.textbox('required', init);
        ecn.textbox('readonly', !init);
        if (init == true) ecn.textbox('clear');
      },

      mandatory: function () {
        var rev = $.dui.bhave.MANDATORY_REVISION || 'n';
        $('#PART_REV_NO').textbox('required', rev != 'n');
      },

      part_detail_upd: function () {
        var pdu = $.dui.udata.groups.indexOf('PART-DETAIL-UPD');
        var tf = (pdu == -1);
        $('#header :input').attr('disabled', tf);
        if (pdu == -1) $('#but_save').linkbutton('disable');
        else $('#but_save').linkbutton('enable');
      },

      traceable_endis: function () {
        var pdu = $.dui.udata.groups.indexOf('PART-DETAIL-UPD');
        if (pdu == -1) {
          $('#TRACEABLE').combobox('disable');
        } else {
          ajaxget('/', {
            _sqlid: 'inv^part_sites', _func: 'get',
            ID: $('#ID').searchbox('getValue')
          }, function(res) {
            var tf = (res.CNT != 0);
            $('#TRACEABLE').combobox('readonly', tf);
            $('#PRODUCT_CODE').combobox('readonly', tf);
            $('#UOM_ID').combobox('readonly', tf);
          });
        }
      },

      part_ud: function () {
        var partud = $.dui.udata.groups.indexOf('PART-UD');
        $('#but_add').on('done', function(evt) {
          $.page.fn.costitems();
          $('#phycount').datagrid('loadData', []);
          $('#boms').datagrid('loadData', []);
          if (partud == -1 && $.dui.bhave.partgen == 'y') {
            $('#pngenwin').window('move', { left: 362, top: 78 });
            $('#pngenwin').window('open');
          }
        });
        setTimeout(function() {
          if (partud == -1 && $.dui.bhave.partgen == 'n') {
            $('#but_add').linkbutton('disable');
          }
        });
      },

      prices: function () {
        ajaxget('/', { _sqlid: 'admin^curr', _func: 'get' }, function(res) {
          $.page.fn.currs = res;
        });
        var dg = $('#prices');
        dg.datagrid().datagrid('rowEditor', {
          editor: 'inline', striped: true, rownumbers: false,
          _fitColumns: true, fit: true,
          columns: [[
            { field: 'PART_ID', hidden: true, title: '' },
            { field: 'CURRENCY_ID', title: 'Cur ID', width: 60 },
            { field: 'DESCRIPTION', title: 'Description', width: 120 },
            { field: 'UNIT_PRICE', title: 'Price', width: 60, align: 'right',
              editor: { type: 'numberbox', options: { precision: 2, min: 0 } },
              formatter: $.dui.fmt.currency }
          ]],
          onEndEdit: function(idx, row, chg) {
            ajaxget('/', $.extend(row, { _sqlid: 'inv^part_price', _func: 'upd' }),
              function(res) { cl(res); });
          }
        });
        var opt = dg.datagrid('options');
        opt.tbar.dgre_del.hide();
        opt.tbar.dgre_edit.hide();
        opt.tbar.dgre_add.hide();
      },

      opengen: function () {
        $('#pngenwin').window({
          title: 'Part Number Generator', closed: true,
          minimizable: false, draggable: true, modal: true,
          onBeforeClose: function() {
            if (!$('#ID').textbox('getValue')) {
              alert('Please generate the part.');
              return false;
            }
          }
        });
      },

      nocarat: function (val) {
        return val ? val.replace(/\^/g, '-') : '';
      }
    }
  });

  // ========================================================================
  // Init — partgen + prices
  // ========================================================================
  $.page.fn.partgen = function () {
    if ($.dui.bhave.partgen == 'y') {
      $('#addmenu').menu({
        onClick: function(item) {
          if (item.name == 'gen') $.page.fn.dogen = true;
          else $.page.fn.dogen = false;
          but_add();
        }
      });
      $.page.fn.opengen();
    } else {
      $('#but_add').on('done', function(evt) {
        $.page.fn.costitems();
        $('#phycount').datagrid('loadData', []);
        $('#boms').datagrid('loadData', []);
      });
    }
  };

  $.page.fn.partgen();
  $.page.fn.prices();

  // ========================================================================
  // Query form — strip asdpx
  // ========================================================================
  $('form#partquery').removeAttr('asdpx');

  // ========================================================================
  // Fkey — searchbox init
  // ========================================================================
  $('#ID').searchbox({ sbref: 'part', preload: true });

  // ========================================================================
  // Field rules
  // ========================================================================
  $('#UDF_LAYOUT_ID').combobox({
    onSelect: function (rec) {
      setudfs(rec);
    }
  });

  $('#PART_CLASS_ID').combobox({
    onSelect: function (rec) {
      $.page.fn.costitems();
    }
  });

  $('#LENGTH').combobox({
    onSelect: function (rec) {
      $.page.fn.dims('l');
    }
  });

  $('#WIDTH').combobox({
    onSelect: function (rec) {
      $.page.fn.dims('w');
    }
  });

  $('#HEIGHT').combobox({
    onSelect: function (rec) {
      $.page.fn.dims('h');
    }
  });

  $('#TRACEABLE').combobox({
    onSelect: function (rec) {
      $.page.fn.material_unit_cost();
    },
    onChange: function (nv, ov) {
      $.page.fn.material_unit_cost();
    }
  });

  // ========================================================================
  // Form loadDone — onLoad actions
  // ========================================================================
  $('#partf')
    .on('changed', function (jq, tgt) {})
    .on('loadDone', function (jq, fdat) {
      $.page.fn.ecn(false);
      $.page.fn.costitems();

      // docFiles
      $.page.fn.fkey = fdat.ID;
      $('#partfiles').datagrid('docFiles', $.page.fn.fkey);

      // UDF layout
      var rec = $('#UDF_LAYOUT_ID').combobox('getRec');
      setudfs(rec, $(this));

      // Hidden rev field for change detection
      $('#_PART_REV_NO').val(fdat.PART_REV_NO);

      setTimeout(function () {
        // butEn — conditional on bhave.partgen + PART-UD group
        if ($.dui.bhave.partgen == 'y') {
          if ($.dui.udata.groups.indexOf('PART-UD') == -1) butEn('asdx');
          else butEn('nsdx');
        } else butEn('asdx');

        // Lock query searchbox
        $('form#partquery input#QRY_PART_ID')
          .searchbox('select', fdat.ID)
          .searchbox('editable', false);

        // Pricing grid data
        var data = [];
        $.page.fn.currs.map(function (e) {
          data.push({
            PART_ID: fdat.ID,
            CURRENCY_ID: e.id,
            DESCRIPTION: e.description,
            UNIT_PRICE: fdat.PRICE[e.id] || 0
          });
        });
        $('#prices').datagrid('loadData', data);

        // Load child grids
        $('#dgdim').datagrid('load');

        // Clear used-in
        $('#usedin_src').combobox('clear');
        $('#usedin').datagrid('loadData', []);

        // Physical count
        $('#phycount').datagrid('load', {
          _func: 'get', _dgrid: 'y',
          _sqlid: 'inv^physical_count_lines_by_part',
          PART_ID: fdat.ID
        });

        // Call setup functions
        $.page.fn.part_ud();

        // Wire revision change → ECN toggle
        $('#PART_REV_NO').textbox({
          onChange: function (nv, ov) {
            ov = $('#_PART_REV_NO').val();
            if (nv != ov) $.page.fn.ecn(true);
            else $.page.fn.ecn(false);
          }
        });

        $.page.fn.part_detail_upd();
        $.page.fn.material_unit_cost();
        $.page.fn.mandatory();
        $.page.fn.traceable_endis();

        // BOM
        $('#boms').datagrid('load', {
          _func: 'get', _dgrid: 'y',
          _sqlid: 'inv^partbom',
          PART_ID: fdat.ID
        });
      });
    });

  // ========================================================================
  // Used-in — dynamic column selector
  // ========================================================================
  $('#usedin_src').combobox({
    panelHeight: 'auto',
    groupField: 'appid',
    data: [
      {
        value: 'JOBS', text: 'Job Header', appid: 'Manufacturing',
        columns: [[
          { field: 'WO_CLASS', title: 'Job Class' },
          { field: 'BASE_ID', title: 'Job Number' },
          { field: 'STATUS', title: 'Status' },
          { field: 'DESIRED_QTY', title: 'Run Qty' },
          { field: 'DESIRED_WANT_DATE', title: 'Want Date', formatter: $.dui.fmt.date },
          { field: 'WO_TYPE', title: 'Job Class' }
        ]]
      },
      {
        value: 'OPN', text: 'Job Operations', appid: 'Manufacturing',
        columns: [[
          { field: 'WO_JOB_ID', title: 'Job Number' },
          { field: 'SEQ_NO', title: 'Seq No' },
          { field: 'STATUS', title: 'Status' },
          { field: 'REQUIRED_QTY', title: 'Reqd Qty' },
          { field: 'WANT_DATE', title: 'Want Date', formatter: $.dui.fmt.date }
        ]]
      },
      {
        value: 'SO', text: 'Sales Order Lines', appid: 'Sales',
        columns: [[
          { field: 'SALES_ORDER_ID', title: 'SO ID' },
          { field: 'LINE_NO', title: 'Line #' },
          { field: 'DATE', title: 'Order Date', formatter: $.dui.fmt.date },
          { field: 'STATUS', title: 'Status' },
          { field: 'CUST_ID', title: 'Customer ID' },
          { field: 'CUST_NAME', title: 'Customer Name' },
          { field: 'QTY', title: 'Order Qty' },
          { field: 'QTY_SHIP', title: 'Ship Qty' }
        ]]
      },
      {
        value: 'SHP', text: 'Shipment Lines', appid: 'Sales',
        columns: [[
          { field: 'SHIPMENT_ID', title: 'Shipment ID' },
          { field: 'SHIPMENT_DATE', title: 'Shipped Date', formatter: $.dui.fmt.date },
          { field: 'LINE_NO', title: 'Line #' },
          { field: 'INVOICE_ID', title: 'Invoice ID' },
          { field: 'SO_ID', title: 'Sales Order ID' },
          { field: 'SO_LINENO', title: 'SO Line No' },
          { field: 'QTY', title: 'Shipped Qty' }
        ]]
      },
      {
        value: 'COC', text: 'COC Source', appid: 'Quality',
        columns: [[
          { field: 'COC_ID', title: 'COC ID' },
          { field: 'COC_REV', title: 'Revn No' },
          { field: 'STATUS', title: 'Status' },
          { field: 'CREATE_DATE', title: 'COC Date', formatter: $.dui.fmt.date },
          { field: 'PRINTED_DATE', title: 'Print Date', formatter: $.dui.fmt.date },
          { field: 'WOREF', title: 'Job Number', formatter: $.page.fn.nocarat },
          { field: 'CUSTOMER_ID', title: 'Cust ID' },
          { field: 'QTY', title: 'Qty' },
          { field: 'ISSUED_BY', title: 'Creator' }
        ]]
      },
      {
        value: 'CPAR', text: 'CPAR Source', appid: 'Quality',
        columns: [[
          { field: 'NCR_ID', title: 'NCR ID' },
          { field: 'CREATE_DATE', title: 'Date', formatter: $.dui.fmt.date },
          { field: 'STATUS', title: 'Status' },
          { field: 'WOREF', title: 'Linked Job', formatter: $.page.fn.nocarat },
          { field: 'SUBJECT', title: 'Subject' },
          { field: 'SEVERITY', title: 'Severity' }
        ]]
      },
      {
        value: 'NCR', text: 'NCR Source', appid: 'Quality',
        columns: [[
          { field: 'NCR_ID', title: 'NCR ID' },
          { field: 'CREATE_DATE', title: 'Date', formatter: $.dui.fmt.date },
          { field: 'STATUS', title: 'Status' },
          { field: 'WOREF', title: 'Linked Job', formatter: $.page.fn.nocarat },
          { field: 'SUBJECT', title: 'Subject' },
          { field: 'SEVERITY', title: 'Severity' }
        ]]
      }
    ],
    onSelect: function (rec) {
      $('#usedin')
        .datagrid({ type: rec.value, columns: rec.columns })
        .datagrid('reload');
    }
  });

  $('#usedin').datagrid({
    url: '/',
    type: null,
    queryParams: {
      _func: 'get', _dgrid: true,
      _sqlid: 'inv^part_used',
      PART_ID: null, type: null
    },
    fit: true, fitColumns: true, striped: true, singleSelect: true,
    columns: [[]],
    onBeforeLoad: function (qp) {
      var opt = $(this).datagrid('options');
      qp.PART_ID = $('#ID').searchbox('getValue');
      qp.type = opt.type;
      if (!qp.PART_ID) return false;
    }
  });

  // ========================================================================
  // Physical count grid
  // ========================================================================
  $('#phycount').datagrid({
    url: '/',
    type: null,
    queryParams: {
      _func: 'get', _dgrid: true,
      _sqlid: 'inv^physical_count_lines_by_part',
      PART_ID: null
    },
    fit: true, striped: true, singleSelect: true,
    columns: [[
      { field: 'PHYSICAL_COUNT_ID', title: 'Physical Count ID', width: 150 },
      { field: 'STATUS', title: 'Status', width: 120 },
      { field: 'START_DATE', title: 'Start Date', formatter: $.dui.fmt.date, width: 120 },
      { field: 'END_DATE', title: 'End Date', formatter: $.dui.fmt.date, width: 120 },
      { field: 'NOTES', title: 'Notes', width: 120 }
    ]],
    onBeforeLoad: function (qp) {
      qp.PART_ID = $('#ID').searchbox('getValue');
      if (!qp.PART_ID) return false;
    }
  });

  // ========================================================================
  // BOM grid
  // ========================================================================
  $('#boms').datagrid({
    url: '/',
    type: null,
    queryParams: {
      _func: 'get', _dgrid: true,
      _sqlid: 'inv^partbom',
      PART_ID: null
    },
    fit: true, striped: true, singleSelect: true, fitColumns: true,
    columns: [[
      { field: 'PART_ID', hidden: true, title: '' },
      { field: 'LINE_NO', title: 'Line #' },
      {
        field: '_EXIST', title: 'Exists',
        styler: function (val, row, idx) {
          var cls = (row.EXIST == 'Y') ? 'icon-tick' : 'icon-cross';
          return {
            class: cls,
            style: 'background-position:center center;background-repeat:no-repeat;'
          };
        }
      },
      { field: 'ITEM_ID', title: 'Item ID' },
      { field: 'QTY', title: 'Qty' },
      { field: 'REV', title: 'Rev' },
      { field: 'UOM_ID', title: 'UOM' },
      { field: 'QOH', title: 'QOH' },
      { field: 'DESCRIPTION', title: 'Description' }
    ]],
    onBeforeLoad: function (qp) {
      qp.PART_ID = $('#ID').searchbox('getValue');
      if (!qp.PART_ID) return false;
    }
  });

  // ========================================================================
  // Init — permissions + mandatory fields
  // ========================================================================
  $.page.fn.part_ud();
  setTimeout(function () {
    $.page.fn.mandatory();
    $.page.fn.part_detail_upd();
  });

}); // $.page.ready
