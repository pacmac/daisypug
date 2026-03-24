    //if($('.datagrid-filter #dgc_but').length > 0) colTree($('table#data'));
    
    $('table#data').datagrid({
      fit:true,
      singleSelect:true,
      width:"auto",
      height:"auto",
      loadMsg: "",
      striped:false,
      pagination:false,
      fitColumns:true,
      frozenColumns:[[
        {field:"mm",title:"",width:25,align:"center"},
        {field:"fw",title:"F/W<br>Ver",width:40,align:"center"},
        {field:"stat",title:"Operation<br>Status",width:80},
        {field:"resource_id",title:"Resource<br>ID",width:100,align:"left"},
        {field:"mc_no",title:"Machine<br>ID",width:70},
        {field:"name",title:"Employee<br>ID",width:70},
        {field:"wo_no",title:"Work Order<br>Reference",width:100},
        {field:"op_no",title:"Opn<br>Seq",width:40,align:"right"},
        {field:"qpc",title:"Cycle<br>Qty",width:40,align:"right"},
        {field:"qty_r",title:"Required<br> Opn Qty",width:60,align:"right"},
        {field:"qty_c",title:"Complete<br>Opn Qty",width:60,align:"right"},
        {field:"qty_b",title:"Balance<br>Opn Qty",width:60,align:"right"},
        {field:"t_qty_c",title:"Complete<br> M/C Qty",width:60,align:"right"},
        {field:"rate_st",title:"Per Min<br>OPN",width:50,align:"right"},
        {field:"rate_lt",title:"Per Min<br>L/T",width:50,align:"right"},
        {field:"rate_mc",title:"Per Min<br>M/C",width:50,align:"right"},
        {field:"pct_e",title:"Eff\"cy<br>%",width:40,align:"right"},
        {field:"pct_c",title:"Comp<br>%",width:40,align:"right"}
      ]],
      columns: [[
        {field:"cbar",title:"COMPLETION %",width:150,align:"left",fit:true},
        {field:"ebar",title:"EFFICIENCY %",width:150,align:"left",hidden:true,fit:true}
      ]],
      onLoadSuccess:function(){},
      onSelect:function(data){
        $(this).datagrid("unselectAll");
      }
    });
