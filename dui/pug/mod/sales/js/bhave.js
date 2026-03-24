$.page.fn.udfid = function () {
  ajaxget("/", { _sqlid: "admin^udfid", _func: "get" }, function (udfs) {
    $('form#conman select[name="UDF_LAYOUT_ID"]').combobox("loadData", udfs);
    $('form#quoteman select[name="UDF_LAYOUT_ID"]').combobox("loadData", udfs);
    $('form#custman select[name="UDF_LAYOUT_ID"]').combobox("loadData", udfs);
    $('form#salesman select[name="UDF_LAYOUT_ID"]').combobox("loadData", udfs);
    $('form#salesman select[name="HEADER_UDF_LAYOUT_ID"]').combobox("loadData", udfs);
  });
};

$.page.fn.disableDeleteButton = function () {
  $("#but_del")
    .removeClass("hidden")
    .addClass("opacity-40 pointer-events-none")
    .attr("aria-disabled", "true")
    .prop("disabled", true);
};

$.page.ready(function () {
  $.page.fn.udfid();
  /*
  // Disable Delete permanently for this page.
  $("#but_del")
    .off("beforeClick.bhaveNoDelete")
    .on("beforeClick.bhaveNoDelete", function () {
      return false;
    });
  $.page.fn.disableDeleteButton();
  */
  $("#content")
    .off("modeChange.bhaveNoDelete loadDone.bhaveNoDelete changed.bhaveNoDelete")
    .on(
      "modeChange.bhaveNoDelete loadDone.bhaveNoDelete changed.bhaveNoDelete",
      "form.single.load",
      function () {
        setTimeout($.page.fn.disableDeleteButton, 0);
      },
    );

  // Auto-enter edit mode on first user input in view state.
  $("#content").on(
    "input.bhaveAutoEdit change.bhaveAutoEdit",
    'form.single.load input:not([type="hidden"]):not(.tab), form.single.load textarea',
    function () {
      var frm = $(this).closest("form");
      if (!frm.length || !$.fn.form || !$.data(frm[0], "form")) return;

      var opts = frm.form("options");
      if (!opts || opts.state !== "view") return;
      if ($(this).hasClass("fkey")) return;

      frm.form("state", "edit");
    },
  );

  // ALL edit boxes
  $("form .edit").combobox({
    width: "206px",
    panelHeight: "auto",
    delete: false,
    fields: [
      { type: "textbox", label: "ID", id: "value", class: "upper" },
      { type: "textbox", label: "Text", id: "text" },
    ],
  });

  // colour selector
  $(".colours").combobox({
    formatter: function (row) {
      return '<div class="' + row.value + '">' + row.text + "</div>";
    },

    onChange: function () {
      var rec = $(this).combobox("getRec");
      $(this).next().find(".textbox-text").addClass(rec.value);
    },

    _onSelect: function (rec) {
      $(this).next().find(".textbox-text").addClass(rec.value);
    },

    data: [
      { value: "bg-brn", text: "Brown" },
      { value: "bg-red", text: "Red" },
      { value: "bg-ora", text: "Orange" },
      { value: "bg-yel", text: "Yellow" },
      { value: "bg-grn", text: "Green" },
      { value: "bg-cyn", text: "Cyan" },
      { value: "bg-blu", text: "Blue" },
      { value: "bg-pur", text: "Purple" },
      { value: "bg-gry", text: "Grey" },
      { value: "bg-sil", text: "Silver" },
      { value: "bg-clr", text: "Clear" },
    ],
  });
});
