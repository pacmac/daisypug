$.dui.page.frm = $('form#upwd');


$("a#pwdsub").click(function(){
  $.dui.page.frm.submit();
})

$("form#upwd input").bind("change",function(e){
    var p0 = $.dui.page.frm.find('input[name="oldpwd"]').val();
    var p1 = $.dui.page.frm.find('input[name="passwd"]').val();
    var p2 = $.dui.page.frm.find('input[name="passwd_2"]').val();
    if(p0.length >0 & p1.length >0){
      $('#pwdsub').linkbutton('enable');
      if(p2.length >0 && p1 != p2) { 
        msgbox("Passwords do not match."); 
        return $.dui.page.frm.form('clear');
      }
    }
  else $('#pwdsub').linkbutton('disable'); 
})

$.dui.page.frm.on('success',function(jq,vars){
  msgbox(vars.res.msg);  
})

