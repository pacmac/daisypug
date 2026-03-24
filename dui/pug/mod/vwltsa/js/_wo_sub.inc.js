$.dui.page.sub = {};


/* EUI ELEMENT LOADER */
$.dui.page.sub.init = function(elid){
  
  var els = {
    // When user select different layout
    UDF_LAYOUT_ID: $('form#subf input#SUB_UDF_LAYOUT_ID').combobox({
      data:$.dui.pdata.udfid,
      validType:['inList'],
      onSelect:setudfs
    }),
  }

  // initialize one or all.
  if(elid) return els[elid.toUpperCase()];
  else for(var elid in els){els[elid]}  
  
}

/* ##### DOM IS READY ##### */
$.page.ready(function(){
  
  $.dui.page.sub.init();
  // setTimeout(function(){$.dui.page.seq.init('testadd');},10000)
  $('#subf').on('changed',function(jq,tgt){
    
  }).on('loadDone',function(jq,fdat){
    var rec = $('#SUB_UDF_LAYOUT_ID').combobox('getRec');
    setudfs(rec,$(this));

  });
})
