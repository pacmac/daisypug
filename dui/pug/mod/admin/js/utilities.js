

$.dui.page.copyplan = function(){

      var TSITE = $('#TARGET_SITE_ID').combobox('getValue');
      var QID = $('#SOURCE_PLAN_ID').combobox('getValue');
    
      if (TSITE =='' || QID=='') {}
      else {
        var vars = {_func:'add',_sqlid:'dqm^qpplancopy',TARGET_DB:TSITE,PLAN_ID:QID}
        ajaxget('/',vars,function(data){
          console.log(data);
          //if (data){
            if(data.error) msgbox(data);
            else msgbox(`Plan ${QID} copied successful. Please verify in ${TSITE} .`);
          //}
        })        
      }

}

$.dui.page.useraccesscopy = function(){

  var tuid = $('#target_user_id').combobox('getValue');
  var suid = $('#source_user_id').combobox('getValue');

  if (tuid =='' || suid=='') {}
  else {
    if (tuid == suid ) msgbox(`Source and Target User ID cannot be same.`);
    else
    {
      var vars = {_func:'get',_sqlid:'admin^useraccesscopy',target_user_id:tuid,source_user_id:suid}
      ajaxget('/',vars,function(data){
        //if (data){
          if(data.error) msgbox(data);
          else msgbox(`User ID ,${suid} Access copied successful. Please verify .`);
        //}
      })  
    }      
  }

}

$('#TARGET_SITE_ID').combobox({
  url:'/?_func=get&_sqlid=admin^siteids&_combo=y&siblings=true'  ,
})

// Wait for Document Load
$.page.ready(function() {
  $('#TARGET_SITE_ID').combobox('reload')

})
