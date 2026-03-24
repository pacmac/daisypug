
$.dui.page.udfid=function(){
  $('#UDF_LAYOUT_ID').combobox({url:'/?_func=get&_combo=y&_sqlid=sales^udfid',})
}

$.dui.page.defudf=function(){
    console.log($.dui.bhave)
    $('#UDF_LAYOUT_ID').combobox('setValue',$.dui.bhave.UDF_LAYOUT_ID);    
    $.dui.page.udfReselect();        
 
}

$.dui.page.udfReselect=function(){
  $('#UDF_LAYOUT_ID').combobox('reselect');
 // console.log('ccc')
}

$.dui.page.udfid();
$.dui.page.defudf()
$('#UDF_LAYOUT_ID').combobox({ onSelect:setudfs, }); 