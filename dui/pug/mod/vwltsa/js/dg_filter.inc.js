  if(!os) var os={url:'vwltsa/?_func=wostat',cols:[],striped:false,info:false};
  os.dg = $('#dgstat');
  os.autorf = false;
  //maxHeight(os[0]);
  if(!os.frozenColumns) os.frozenColumns = {};
  $.each(os.cols,function(i,v){if(v.field == 'bar') v.formatter = dgbars;})
  $.each(os.frozenColumns,function(i,v){if(v.field == 'bar') v.formatter = dgbars;})
  
  if(!os.noexcel) $('.datagrid-filter').append('<a id="dg2excel" href="#"></a>');
  os.refcook = $.page.state.pageId+'^refresh';
  os.refresh = true; // force on
  if(os.refresh){
    $('.datagrid-filter').append('<a id="dgreload" href="#" style="margin-left:10px;"></a><input id="autorf" type="checkbox" style="width:auto;margin:0 4px 0 10px;">Auto</input>');
    $('#dgreload').linkbutton({
      size: 'small',
      iconCls:'icon-reload',
      text:'',
      onClick: function(){$(this).linkbutton('disable');os.dg.datagrid('reload');}
    })
    
    // 
    $('#autorf').change(function(){
      os.autorf = $(this).is(":checked");
      if(os.autorf) $('#dgreload').linkbutton('disable'); 
      else $('#dgreload').linkbutton('enable');
      putcook(os.refcook,os.autorf);
    })
    
    if(getcook(os.refcook)) $('#autorf').prop('checked','checked').change();
    
  }
  
  window.clearInterval(ref);
  var ref = setInterval(function(){
    if(!os.autorf) return;
    try{os.dg.datagrid('reload')}
    catch(err){window.clearInterval(ref)}  
  }, 30000);
  
  // datagrid filter change
  function dgfChange(){
    os.pvar = {};
    $.each($('.datagrid-filter .easyui-combobox, .datagrid-filter .easyui-datebox'), function(key,val) {
      os.val = $(this).combobox('getValue');
      if(os.val) os.pvar[$(this).attr('comboname')] = os.val;
    });      
    os.dg.datagrid('options').queryParams = os.pvar;
    os.dg.datagrid('load');  
  }    

  // on filter change
  $('.datagrid-filter .easyui-combobox').combobox({onSelect:function(){dgfChange();}})
  $('.datagrid-filter .easyui-datebox').datebox({onSelect:function(){dgfChange();}})

  $('#but_print').linkbutton({
    onClick:function(){
      var pb = $(this);
      pb.linkbutton('disable');
      var pvar = {_func:"print",_page:"vwltsa/dg_ltbywo",_pdf:"y"};
      pvar.cols = JSON.stringify(os.cols);
      pvar.rows = JSON.stringify($('#dgstat').datagrid('getData'));  
      //$.ajax({async:false,type:"GET",url:'/',data:pvar}).done(function(data){
      ajaxget('/',pvar,function(data){
        $("#print").window("open");
        pb.linkbutton('enable');
        pvar = null;
      })
      
      
    }
  })

  //info menu
  function info(){
    inf = {woref:$('#opnmen').attr('woref')};
    //inf.pvar = {_func:"get",WOREF:inf.woref,_sqlid:'seq',_vpath:gurl()};
    inf.frm = $('form#seqinfo');
    //$.ajax({async:false,type:"GET", url:'/',data:inf.pvar}).done(function(data){
    ajaxget('/',{_func:"get",WOREF:inf.woref,_sqlid:'vwltsa^seq'},function(data){ 
      if(iserr(data)) return;
      $("#info").window("open");
      inf.frm.form('load',data);
      inf = null;  
    })       
  }

  //convert json bardata to ul.
  function json2ul(rows){
    function one(row){
      var ul="<ul>"
      $.each(row, function(key,val){
      ul+="<li>"+val.wor.replace(/\^/g,'.')+"</li>";
     }); ul+="</ul>";return ul;
    }
    
    var uls = "";
    if(!rows.rows) return one(rows.ops);
    $.each(rows.rows, function(idx,val){uls += one(val.ops)}); 
    return(uls);
  }

  $.extend($.fn.datagrid.defaults.onBeforeLoad = function (){
      //maxHeight($(this).closest('div.panel.datagrid'));
      //$(this).closest('div.panel.datagrid').css('height','400px');
  });
  
  $('#dgstat').datagrid({
    nowrap:true,
    fit:true,
    striped: os.striped,
    sortName:os.sort,
    sortOrder:os.order,
    rownumbers:false,
    pagination:false,
    url:os.url,
    fitColumns:true,
    columns:[os.cols],
    frozenColumns:[os.frozenColumns],
    onSelect:function(rowi,rowd){$(this).datagrid('unselectRow',rowi);},
    onLoadSuccess:function(data){
      if(!os.autorf) $('#dgreload').linkbutton('enable');
      iserr(data);
      if(typeof os.onLoad == 'function'){os.onLoad(data)}
    },
    
    onRowContextMenu:os.onRowContextMenu,
    onClickRow:os.onClickRow,
    onDblClickRow:os.onDblClickRow,
    rowStyler:os.rowStyler,
    
    xxxxxonRowContextMenu: function(e,rowIndex, rowData){
      e.preventDefault();
      if(!os.info) return;
      orc = {me:$(this),men:$('#opnmen')};
      orc.woref = $(e.target).text().trim().replace(/\./g,'^');
      orc.men.attr('woref',orc.woref);
      orc.men.menu('show',{left: e.pageX,top: e.pageY});
    }
  })
  