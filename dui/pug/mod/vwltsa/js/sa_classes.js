$( document ).ready(function() {
    $('input.easyui-combobox.ftype').combobox({
      readonly:true,
      required:false,
      data:[
        {text:"Text",value:"easyui-textbox",selected:true},
        {text:"Date",value:"easyui-datebox"},
        {text:"Number",value:"easyui-numberspinner"}
      ]
    }) 
    
    $('#opn_class_id').remove();
  });