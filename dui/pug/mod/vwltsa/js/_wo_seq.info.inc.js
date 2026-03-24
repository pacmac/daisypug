    var bas=$('#BAS').val(),sub=$('#SUB').val(),seq=$('#SEQ').val();  
    var url = '/vwltsa/?_func=wolt&BASE_ID='+bas+'&SUB_ID='+sub+'&SEQ_NO='+seq;
    
    $('#ltgrid').datagrid({
      url: url,
      rownumbers:false,
      pagination:false,
      fitColumns:true,
      columns:[[
        {field:"start_time",title:"Start Time",width:3},
        {field:"end_time",title:"End Time",width:3},
        {field:"employee_id",title:"Operator",width:3},
        {field:"type",title:"Tx Type",width:3},
        {field:"total_hrs",title:"Total Hrs",width:2,align:'right'},
        {field:"wo_info",title:"WO Ref",width:10}
      ]]
    })