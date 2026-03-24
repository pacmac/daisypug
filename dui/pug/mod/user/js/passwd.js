$("#but_clr").click(function() {
  $('form#upwd').form('clear');
})

$('#pwdsub').linkbutton({
  disabled: true,
  text: 'Submit',
  onClick:but_save
});

$("input").textbox({
  onChange: function(){

    var frm = $('form#upwd');
    var p0 = frm.find('input[name="oldpwd"]').val();
    var p1 = frm.find('input[name="passwd"]').val();
    var p2 = frm.find('input[name="passwd_2"]').val();
    if(p0.length >0 & p1.length >0){
      $('#pwdsub').linkbutton('enable');
      if(p2.length >0 && p1 != p2) { 
        msgbox("Passwords do not match."); 
        return frm.form('clear');
      }
    }
  else $('#pwdsub').linkbutton('disable');    
  }
});

$('form#upwd').form({
  success: function(data){
    var res = JSON.parse(data);
    msgbox(res.msg);
    if(res.error) $(this).form('clear');
    else $('#but_logout').click();
    $('#pwdsub').linkbutton('disable');
  }
});