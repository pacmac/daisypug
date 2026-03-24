$.page.fn.parts_option=function(cboID,tf){
    if (tf==true)$('#'+cboID).combobox('setValue','');
    $('#'+cboID).combobox('readonly',tf);
    $('#'+cboID).combobox('required',!tf);
}

// save status.
$.page.fn.savestat = function(newstat,cb){
  ajaxget('/',{
    _sqlid    : 'dqm^caas_aw95',
    _func     : 'upd', 
    FORM_NO   : $('#FORM_NO').val(),
    STATUS    : newstat
  },function(){
    $('#caas').form('reload');
    if(cb) cb();
  });
}

// prompt user before print.
$.page.fn.onBeforePrint = function(args,cb){

  //console.log(args);
  if (args._fname=="caas_aw95") {
    if ($('#FORM_NO').val()=="") {}//return cb({STATUS:status});
    else {
   

      var status = $('#STATUS').val();


      var newstat = {
        'DRAFT'     : 'ORIGINAL',
        'ORIGINAL'  : 'DUPLICATE'
      }[status];
      
      // status not changed OR DUPLICATE.
      if(!newstat) return cb({STATUS:status});

      var dlg = $.messager.confirm({
          title: 'Confirm Status',
          msg:  'New Status :<red> <b>'+newstat+'</b></red>, <br>proceed ?</br> ',
          buttons:[
          {
              text: 'Yes',
              onClick: function(){
                  dlg.dialog('destroy');
                  $('#STATUS').textbox('setValue',newstat);
                  $('form#caas').addClass('lock');
                  return cb({STATUS:newstat});
              }
          },{
              text: 'No',
              onClick: function(){
                  dlg.dialog('destroy');
                if (status=='DRAFT') {
                  confirm(function(yn){
                      if(yn)return cb({STATUS:status});
                    // else ....
                  },'Print with <b>'+status+'</b> status ?');
                }
          }
        }
          ]
      });

      $('#caas').form('reload');
    }
  }
  else return cb({STATUS:''});
}

// after print update status if not DUPLICATE.
$.page.fn.onAfterPrint = function(pv){
  //console.log(pv);
  if (pv._fname=="caas_aw95"){
    var status = $('#STATUS').val();
    //if (status != "DUPLICATE"){
      $.page.fn.savestat(status);
    //}
    $('#caas').form('reload');
  }
}

//press cancel button and when press X but not when click print button 
$.page.fn.onCancelPrint = function(){
  $('#caas').form('reload');
};

$.page.fn.cbos = function(cbos){
  console.log($.dui.bhave);
  for(var k in $.dui.bhave){
    var bits = k.split('CBO_');
    if(bits.length==2) {
      data = jsonParse($.dui.bhave[k]);
      var reg = new RegExp(/\*$/);
      if (data){
        data.map(function(e){
            if(e.value.endsWith('*')) {
                e.selected = true;
                e.value = e.value.replace(reg,"");
                e.text = e.text.replace(reg,"");

            }
              
        })        
      }

      $('input[name='+bits[1]+']').combobox({
        data: data,
        panelHeight:'auto',
        editable: false,
    });
    }
  }
}

$.page.ready(function(){
  $.page.fn.cbos();
  $('#FORM_NO').qbe({defid:'caas_aw95'});

  $('#WOREF').qbe({
    defid:'job',
      onSelect: function(row){ 
        $('#PART_ID').textbox('setValue',row.PART_ID) ;
        $('#UOM_ID').textbox('setValue',row.UOM_ID) ;
      
      }, 
    });

  $('#NEW_PARTS_OPTION').combobox({
    data:[{text:'No option chosen',value:'0'},{text:'Approved Design',value:'1'},{text:'Non-Approved',value:'2'}],
    onChangex:function(nv,ov){
      if (nv=='0')  var tf=false;
      else var tf=true;
      $.page.fn.parts_option('USED_PARTS_OPTION',tf);
    }
  })
  
  $('#USED_PARTS_OPTION').combobox({
    editable:false,
    data:[{text:'No option chosen',value:'0'},{text:'SAR-21.1040',value:'1'},{text:'SAR-145.50',value:'3'},{text:'Other Regulation',value:'2'}],
    onChangex:function(nv,ov){
      if (nv=='0')var tf=false;
      else var tf=true;
      $.page.fn.parts_option('NEW_PARTS_OPTION',tf);
    }
  })
  /*
  $('#STATUS_WORK').combobox({
    data:[{text:'NEW',value:'NEW'},{text:'PROTOTYPE',value:'PROTOTYPE'}, {text:'MANUFACTURED',value:'MANUFACTURED'},{text:'INSPECTED/TESTED',value:'INSPECTED/TESTED'},{text:'MODIFIED',value:'MODIFIED'} ],
    onChange:function(nv,ov){
      if (nv=="MANUFACTURED") {
        $.page.fn.parts_option('NEW_PARTS_OPTION',!true);
        $.page.fn.parts_option('USED_PARTS_OPTION',true);
      }
      else {
        $.page.fn.parts_option('NEW_PARTS_OPTION',true);
        $.page.fn.parts_option('USED_PARTS_OPTION',!true);        
      }
    }
  })
  */
  $('form#caas').on('loadDone',function(jq,data){
    
    if($('#STATUS').val() != 'DRAFT') $(this).form('disable');
    else $(this).form('enable'); 

   
    
    if(!data.FORM_NO) return;
    butEn('adsx');
    $('#aw95files').datagrid('docFiles',data.FORM_NO);
    
  }).on('changed',function(jq,data){
    var opts = $(this).form('options');
    if(!opts.loading) butEn('sadx');
    
  }).on('success',function(data){
    //console.log(data);

  })

})