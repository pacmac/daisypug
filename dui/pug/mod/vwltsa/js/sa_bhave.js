/*
  PAC 171125 - 2.2.17
  1. Fixed the colours comboboxes which have not been working for a long time.  
  
  
*/

// tab loader functions
$.dui.page.loader = function(){

  // ALL edit boxes
  $('form .edit').combobox({
    width: '206px',
    panelHeight:'auto',
    delete:false,
    fields: [
      {'type':'textbox','label':'ID', 'id':'value','class':'upper','required':true},
      {'type':'textbox','label':'Text', 'id':'text','required':true}
    ]
  }) 

  butEn('sx');
  
}

$.page.ready(function() {
  $.dui.pdata.wocid = obj2arr($.dui.pdata.wocid);
  $.dui.pdata.wocid.unshift({value:'_NONE_',text:'NONE'})
  
  // on-demand tab loading
  $('#bhtabs').tabs().tabs('onDemand',{
    default: function(tit,idx){
      $.dui.page.loader();
    }
  });

  // colour selector
  $('.colours').combobox({
    formatter: function(row){
      return '<div class="'+row.value+'">'+row.text+'</div>';
    },
    
    onChange: function(nv,ov){
      var rec = $(this).combobox('getRec');
      $(this).next().find('.textbox-text').removeClass(ov);
      $(this).next().find('.textbox-text').addClass(rec.value);
    },
    
    _onSelect: function(rec){
      $(this).next().find('.textbox-text').addClass(rec.value);  
    },      
    
    data:[
      {value:'bg-brn',text:'Brown'},
      {value:'bg-red',text:'Red'},
      {value:'bg-ora',text:'Orange'},
      {value:'bg-yel',text:'Yellow'},
      {value:'bg-grn',text:'Green'},
      {value:'bg-cyn',text:'Cyan'},
      {value:'bg-blu',text:'Blue'},
      {value:'bg-pur',text:'Purple'},
      {value:'bg-gry',text:'Grey'},
      {value:'bg-sil',text:'Silver'},
      {value:'bg-clr',text:'Clear'}
    ]
    
  });  

})