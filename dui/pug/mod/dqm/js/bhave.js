$.page.ready(function() {

  // ── Edit combo custom fields ──────────────────────────────────────────
  // Most edit combos use the default fields [{type:'textbox', label:'Text', id:'text'}]
  // handled automatically by combobox-plugin. These overrides add custom fields.

  // CBO_INS_STD_REQD — 3-field edit dialog (Requirement + linked methods)
  $('#CBO_INS_STD_REQD').combobox({
    fields: [
      {type:'textbox', label:'Requirement', id:'text'},
      {type:'textbox', label:'Visual Inspection', id:'INS_VIS_METHOD'},
      {type:'textbox', label:'Adhesion Test', id:'ADH_METHOD'}
    ]
  });

  // dispomat combos — ID + Text edit dialog
  $('select.dispomat.edit').combobox({
    fields: [
      {type:'textbox', label:'ID', id:'value', class:'upper'},
      {type:'textbox', label:'Text', id:'text'}
    ]
  });

  // ── User combo onSelect ───────────────────────────────────────────────
  $('select.user-combo').combobox({
    onSelect: function(rec) {
      var emid = $(this).data('email');
      if (emid) $(emid).val(rec.email);
    }
  });

});
