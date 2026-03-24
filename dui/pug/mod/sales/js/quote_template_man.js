
$.dui.page.allcombos = function(){
    ajaxget('/',{_sqlid:'sales^quote_combos',_func:'get'},function(cbos){
      for(var KEY_ID in cbos){
        if (KEY_ID=='PURCHASE_UOM') var fid='#_dgform > form'; else var fid = 'form#qhead';
        $(fid+' input[textboxname='+KEY_ID+']').combobox('loadData',cbos[KEY_ID]);
      }
    });
}
  $.dui.page.defudf=function(){
    var udf = $('#UDF_LAYOUT_ID');
    var quoteType=$('#QUOTE_TYPE');
    var q=quoteType.combobox('getValue')
    udf.combobox('setValue',q);
    udf.combobox('reselect');
  }
  $.dui.page.udfid=function(){
    $('#UDF_LAYOUT_ID').combobox({url:'/?_func=get&_combo=y&_sqlid=sales^udfid'})
  }
  

  $.dui.page.opts = {
     
    twoColumns: true,
    editor: 'form',
  
    addData:{
  
      LINE_NO:'$autonum:1',
  
      ORDER_QTY: 1,
      QUOTE_ID: '#QUOTE_ID'
    },
    
    striped: true,
    url: '/?_sqlid=sales^quotelines&_func=get&_dgrid=y',
    rownumbers: false,
    fitColumns: true,
    fit: true,
    
    columns: [[
  
      {field:'QUOTE_ID',hidden:true},

      {field:'LINE_NO',title:'#',width:30,fixed:true,align:'center'},  
      {field:'PART_ID',title:'Our Part ID',width:100,editor:{type:'qbe',options:{
            queryParams: {
              _sqlid:'inv^partid_qbe'  
            },
            onDemand: true,
            multiCol: true,
            valueField: 'ID',
            
            fields:[
              {field:'value',title:'Part ID',editor:'textbox'},
              {field:'DESCRIPTION',title:'Description',editor:'textbox',formatter:function(val){
                if(!val) return '';
                else return val.substring(0,50);
              }},
              {field:'ALIAS_DESC',title:'Alias',editor:'textbox'},
              {field:'PART_UOM',title:'UOM',editor:'textbox'},
              {field:'TRACEABLE',title:'Traceable', editor:{type:'combobox',options:{panelHeight:'auto',data:[
                {value:'',text:'All', selected:true},
                {value:'Y',text:'Yes'},
                {value:'N',text:'No'},
              ]}}},
              
              {field:'DIM_TRACKED',title:'Dimensions', editor:{type:'combobox',options:{panelHeight:'auto',data:[
                {value:'',text:'All', selected:true},
                {value:'Y',text:'Yes'},
                {value:'N',text:'No'},
              ]}}},
              
      
              {field:'PART_CLASS_ID',title:'Part Class', editor:{type:'combobox',options:{panelHeight:'auto',data:[
                {value:'',text:'All', selected:true},
                {value:'FG',text:'Finished Goods'},
                {value:'COMP',text:'Component'},
                {value:'CONSUMABLE',text:'Consumable'},
                {value:'MAKE_STAGED',text:'Make Staged'},
                {value:'MAKE_NOSTAGE',text:'Make Unstaged'},
              ]}}},
              {field:'USER_1',title:'UDF 1',editor:'textbox'},
              {field:'USER_2',title:'UDF 2',editor:'textbox'},
              {field:'USER_3',title:'UDF 3',editor:'textbox'},
              {field:'USER_4',title:'UDF 4',editor:'textbox'},
              {field:'USER_5',title:'UDF 5',editor:'textbox'},
            ],
            
            onSelect: function(rw){
              var dg = $('#qlines');
              var opt = dg.datagrid('options');
              var row = dg.datagrid('getSelected')
              var idx = dg.datagrid('getRowIndex',row);
              var edi = dg.datagrid('getEditors',idx);
        
              
              ajaxget('/',{_sqlid:'inv^partall',_func:'get',ID:rw.value},function(part){
                opt.tbar.form.find('input[textboxname="PART_DESCRIPTION"]').textbox('setValue',part.DESCRIPTION);   
                opt.tbar.form.find('input[textboxname="PURCHASE_UOM"]').textbox('setValue',part.UOM_ID);  
      
                confirm(function(yn){
                  if(!yn) return false;
                    var oqty=opt.tbar.form.find('input[textboxname="QTY"]').numberbox('getValue')||0;
                    opt.tbar.form.find('input[textboxname="UNIT_PRICE"]').numberbox('setValue',part.PRICE[cid]||0);
                    
             

                },'Update Unit Price ?')
              })
      
      
              
            }  
          }}},
      {field:'ORDER_QTY',title:'Qty Reqd',width:60,fixed:true,align:'right',editor:{type:'numberspinner',options:{
        precision:2,
        min:0
      }}},
      
      {field:'UNIT_PRICE', title:'Unit Price', align:'right', width:70, fixed:true, formatter:eui.currency,editor:{type:'numberbox',options:{value:0,precision:2,min:0,prefix:'$'}}},
      
      {field:'TOTAL_PRICE', align:'right', title:'Total Price', width:100, fixed:true, 
        formatter:function(val,row,idx){
          return eui.currency(parseFloat(row.UNIT_PRICE*row.ORDER_QTY));
        }
      },
      
      {field:'WANT_DATE',title:'Want Date',width:80,fixed:true,editor:{type:'datebox',options:{required:true}},formatter:eui.date}, 

      
      {field:'PURCHASE_UOM',title:'Purchase UOM',width:80,editor:{type:'combobox',options:{required:true}},coloff:true},
      {field:'PART_DESCRIPTION',title:'Our Part Description',width:150,editor:'text'},
      {field:'CUST_PART_REF',title:'Cust Part Ref',width:100,editor:'text'},


      
      
    ]],
    
    onBeforeLoad: function(){
      var fdat = $('form#qhead').form('getData');
      if(!fdat.QUOTE_ID) return false;  
    },
    
    loadFilter: function(data){
      //console.log(data); 
      return data; 
    },
    onSelect:function(idx,row){
     },
    onLoadSuccess: function(){
    },
    
    onEndEdit: function(idx,row,chg){        
      if (!row.WANT_DATE) { 
        msgbox('Want Date is required.');
        $('#qlines').datagrid('reload');
      }
      else {
        var url = "/?_sqlid=sales^quoteline";
        var data = clone(row);

        ajaxget(url,data,function(data){})       
      }
  
    }
  }
  
  $.page.ready(function(){
  
   // use the global def (see note below)
   $('#QUOTE_ID').qbe({            
    queryParams: {
    _sqlid:'sales^quote_template_ids_qbe'  
    },
    onDemand: true,
    multiCol: true,
    valueField: 'QUOTE_ID',
    
    fields:[
        {field:'value',title:'Quote ID',editor:'textbox'},
        {field:'QUOTE_TYPE',title:'Quote Type',editor:'textbox'},
        {field:'CURRENCY_ID',title:'Currency ID'},
        {field:'PAYMENT_TERM',title:'Payment Term'},
        
    ],
    
    onSelect: function(rw){

    } });
  

    $.dui.page.allcombos();
  
    $('#QUOTE_TYPE').combobox({
        onSelect:function(rec){
            $('#UDF_LAYOUT_ID').combobox('setValue',rec.value);
        }
    })
   $('#UDF_LAYOUT_ID').combobox({
    onSelect:setudfs,
    })
  
   $.dui.page.defudf();

    $('#but_add').on('done',function(){
      $('#qlines').datagrid('loadData',{"total":0,"rows":[]});
      butEn('dx');
    })
  
    $('form#qhead').on('loadDone',function(jq,data){
  
     if(!data.QUOTE_ID) return;

      butEn('adx');
      
      $('#qlines').datagrid('reload',{QUOTE_ID:data.QUOTE_ID});

     var en_dis='disable';
      if (data.STATUS !='C') en_dis='enable'; 
      $('#qlines').datagrid('options').tbar.dgre_add.linkbutton(en_dis); 

      $.dui.page.defudf();
  
    }).on('changed',function(jq,data){
     
        var opts = $(this).form('options');
        if(!opts.loading) {
          butEn('sadx');
        } 
    }).on('success',function(data){

    })
  
  
  
    for(var k in $.dui.pdata.udfid){
      var val = $.dui.pdata.udfid[k];
      if(k.indexOf('UDF_')===0 && val !== '') {
        if(val.indexOf('*')===0) var req=true; else var req=false;
        $.dui.page.opts.columns[0].push({
          field: k.replace('UDF_','USER_'),
          title: val.replace('*',''),
          editor: {
            type:'textbox',
            options:{
              required: req
            }
          },
          coloff:true
        })
      }
    }
  
    var dg = $('#qlines'); 
    dg.datagrid('rowEditor',$.dui.page.opts);  
    dg.datagrid('options').tbar.dgre_add.linkbutton('disable');
    dg.datagrid('columns',$('#dgre_tb'));
  
    setTimeout(
      $.dui.page.defudf(),5000
    )

  })