$('#coatman input.edit, #phosman input.edit, #everslik input.edit,#quaman input.edit,#gaugeman input.edit,#caas_aw95 input.edit').not('#CBO_INS_STD_REQD').combobox({
    width: '200px',
    panelHeight:'auto',
    delete:false,
    fields: [
      {'type':'textbox','label':'Text', 'id':'text'}
    ]
  }) 

  $('#CBO_INS_STD_REQD').combobox({
    width: '200px',
    panelHeight:'auto',
    delete:false,
    fields: [
      {'type':'textbox','label':'Requirement', 'id':'text'},
      {'type':'textbox','label':'Visual Inspection', 'id':'INS_VIS_METHOD'},
      {'type':'textbox','label':'Adhesion Test', 'id':'ADH_METHOD'}
    ]
  }) 

  $('input.dispomat.edit').combobox({
    width: '200px',
    panelHeight:'auto',
    delete:false,
    fields: [
      {'type':'textbox','label':'ID', 'id':'value','class':'upper'},
      {'type':'textbox','label':'Text', 'id':'text'}
    ]
  }) 
  
  $('input.srcsel.edit').combobox({
    width: '200px',
    panelHeight:'auto',
    delete:false,
    fields: [
      {'type':'textbox','label':'Source ID', 'id':'value','class':'upper'},
      {'type':'combobox','label':'Source Type', 'id':'source',data:[
        {value:'NONE',text:'NONE'},
        {value:'JOB',text:'JOB'},
        {value:'CUST',text:'CUSTOMERS'},
        {value:'VEN',text:'VENDORS'},
        {value:'CPAR',text:'CPAR'},
        {value:'CF',text:'CF'},
        {value:'NCR',text:'NCR'}
      ],onSelect:function(rec){
          
      }},
      {'type':'textbox','label':'Source Text', 'id':'text','class':'upper'}
    ]
  })

  $('input.user-combo').combobox({
    editable:false,
    onSelect:function(rec){
            var emid = $(this).data('email'); if(emid) $(emid).val(rec.email);
           $('input[data-alias=#'+$(this).attr('id')+']').textbox('setValue',rec.text);
    },
  });