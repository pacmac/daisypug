//$('#sa_nng form.multi').on('loadDone',function(){ setTimeout(function(){butEn('sx')}); })
$.page.ready(function () {
  var _udfLayout = (
    ($.dui._bhave.sales && $.dui._bhave.sales["config^masters"]) ||
    {}
  ).UDF_LAYOUT_ID;
  $("#UDF_LAYOUT_ID").combobox({
    onSelect: setudfs,
    onLoadSuccess: function () {
      if (_udfLayout) $(this).combobox("select", _udfLayout);
    },
  });
  $("form").on("loadDone", function () {
    var asdpx = $(this).attr("asdpx");
    //butEn(asdpx + "s");
  });

  $("#TABLE_NAME").combobox({
    onSelect: function (rec) {
      var cbo = $("#COLUMN_NAME");
      var url =
        "/?_func=get&_combo=y&_sqlid=dqm^columnname&TABLE_NAME=" + rec.value;
      cbo.combobox("clear");
      cbo.combobox("reload", url);
    },
  });
  // $('#sa_nng form.multi').on('loadDone',function(){ setTimeout(function(){butEn('sx')}); });
  //CLS 221216, 5:40PM
  // codes below causing UDF Layout not displayed correctly/

  $("#lists").tabs({
    onSelect: function (tit, idx) {
      tabcombos($(this));
      var frm = $(this).tabs("getSelected").find("form").first();
      frm.form("reset");
      setTimeout(function () {
      //  butEn(frm.attr("asdpx"));
      }, 100);
    },
  });

  /*$("#QM_COLS").multibox({
    data: [
      { text: "ORDER_QTY", value: "ORDER_QTY" },
      { text: "LINE_NO", value: "LINE_NO" },
      { text: "UOM_ID", value: "UOM_ID" },
      { text: "UNIT_PRICE", value: "UNIT_PRICE" },
      { text: "TOTAL_PRICE", value: "TOTAL_PRICE" },
      { text: "CUST_PART_REF", value: "CUST_PART_REF" },
      { text: "DESCRIPTION", value: "DESCRIPTION" },
      { text: "WANT_DATE", value: "WANT_DATE" },
    ],
  });
 
  $("#QI_COLS").multibox({
    data: [
      { text: "UNIT_PRICE", value: "UNIT_PRICE" },
      { text: "SOURCE", value: "SOURCE" },
      { text: "UOM_ID", value: "UOM_ID" },
      { text: "DESCRIPTION", value: "DESCRIPTION" },
    ],
  }); */
});
