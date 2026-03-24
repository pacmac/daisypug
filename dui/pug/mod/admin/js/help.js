
$.page.ready(function(){
  $('#UID').combobox({onChange:function(rec){$('#but_adhelp').data('menu',rec);}})
})