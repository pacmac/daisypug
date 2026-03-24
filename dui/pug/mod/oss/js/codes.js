$.page.ready(function(){
  
  $('#CUSTOMER_ID').combobox({
    _data: {
      allcid:[], 
      osscid:[]
    },
    loadFilter: function(data){
      //if(Array.isArray(data)) data = data[0];
      if(!data.allcid) return data;
      $(this).combobox('options')._data = data;
      return data.osscid;    
    }
  }).on('select',function(jq,rec){
    if($.page.fn.cusfrm) {
      var me = $(this);
      if(busy(me)) return;
      $.page.fn.cusfrm.form('preload',rec);
      setTimeout(function(){
        $.page.fn.cusfrm.attr('mode','add');
      },250);
    } 
  })
  
  /* commented by claude 260220 — interferes with toolbar-plugin
  $('#but_add').linkbutton({
    onClick:function(){
      $.page.fn.cusfrm = null;
      var frm = $('#lists').find('form:visible').first();
      var fid = frm.attr('id');
      if(fid != 'custs') return but_add();
      $.page.fn.cusfrm = frm;
      var cbo = $('#CUSTOMER_ID');
      var opts = cbo.combobox('options');
      cbo.combobox('loadData',opts._data.allcid);
      cbo.combobox('showPanel');
      alert('Select customer to add to OSS.');
      frm.form('clear');
    }
  })
  */


})