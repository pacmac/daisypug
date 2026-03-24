$.dui.page.grpcheck = function(idx,row,chk){
  var opt = $('#dggroup').datagrid('options');
  if(!opt.loaded) return false;
  var gid = $('#ID').combobox('getValue');
  if(gid) ajaxget('/',{
    _func:chk,
    _sqlid:'vwltsa^resgrp',
    ID: gid, 
    MEMBER_RESOURCE_ID: row.value,
  })

}

$.dui.page.icons = [{
  iconCls:'icon-search',
  handler: function(e){
    var val = $(e.data.target).textbox('getValue');
    $('#SHIFT_ID').combobox('select',val);
  } 
}] 

$.dui.page.members = function(data){
  if(!$.dui.planplus) return;
  var dg = $('#dggroup');
  var opt = dg.datagrid('options');
  var cdata = []; if(data.TYPE=='G') cdata = $('#ID').combobox('getData'); 
  opt.loaded = false;
  dg.datagrid('loadData',cdata);
  dg.datagrid('uncheckAll');
  if(data.TYPE=='G') data._MEMBERS.map(function(e){
    //console.log(e);
    var idx = dg.datagrid('getRowIndex',e);
    dg.datagrid('checkRow',idx);  
  })
  opt.loaded = true;
}

$( document ).ready(function() {
  
  $('#but_add').on('done',function(){
    try{$('#maintab').tabs('enableTab',2)}
    catch(err){}
  
    // PAC 190313 - Select Default Shifts
    if($.dui.planplus) $('#plusshifts input.easyui-combobox').each(function(e){
      $(this).combobox('select','DEFAULT');
    });
  
  })
  
  //$('#grpdiv').hide();
  $('#maintab').tabs('disableAll');
  
  // after form loads
  $('form#resall').on('loadDone',function(me,data){
    
    $('#maintab').tabs('enableAll');
    
    var rid = $('input.fkey').combobox('getValue');
    $('#capor_res').combobox('select',rid);     

    // plus - group members
    $.dui.page.members(data);
  
    // maintenance.
    ajaxget('/',{_func:'get',_sqlid:'vwltsa^maint_sched_res', RESOURCE_ID:$('#ID').combobox('getValue')},function(rs){
      $('#UNIT').numberspinner('readonly',(rs && rs.length>0));
    });
    
  })
  
  $('#MON_SHIFT_ID').combobox({
    icons: $.dui.page.icons,
    url:'/?_func=get&_combo=y&_sqlid=vwltsa^shiftid&SHIFT_TYPE=R&ACTIVE=Y',
    onLoadSuccess: function(data){
      $('.shift').combobox({
        'data':data,
        'icons': $.dui.page.icons,      
      });  
    }
  })

  $('#TYPE').combobox({
    editable:false,
    data:[
      {text:'Work Center',value:'W'},
      {text:'Individual/Team',value:'I'},
      {text:'Contractor',value:'C'},
      {text:'Group',value:'G'}
    ],
    
    onChange:function(prv,val){
      $(this).combobox('options').prev = val;
    },
    
    onSelect:function(rec){
      var me = $(this);
      var prev = me.combobox('options').prev;
      if(prev=='G') {
        setTimeout(function(){
          me.combobox('setValue','G')  
        })
        alert('Cannot change GROUP type.');
      }  
    },
    
    loadFilter:function(data){
      if($.dui.planplus) return data;
      var odata=[]; data.map(function(e){
        if(e.value=='G') return;
        odata.push(e);    
      });
      return odata;
    }
  })


  $('#SHIFT_ID').combobox({
    onSelect:function(rec){
      ajaxget('/',{
        _func:'get',
        _sqlid:'vwltsa^shiftdayall',
        SHIFT_ID: rec.value
      },function(res){
        delete(res.SHIFT_ID);
        $('.shift-time').timespinner('clear');
        for(var f in res){
          var val = res[f];
          $('#'+f).timespinner('setValue',val);
        }
      })
    }
  })

  $('#dggroup').datagrid({
    selectOnCheck: false,
    idField: 'value',
    fitColumns:true,
    fit: true,
    data: [],
    loaded: false,
    
    /*
    loader: function(qp,ok,err){
      var data = $('#ID').combobox('getData');
      console.log(data);
      ok(data)
    },
    */
    
    loadFilter:function(data){
      var odata={rows:[]};
      data.map(function(e){if(e.TYPE !='G') odata.rows.push(e)})
      odata.total = odata.rows.length;
      return odata; 
    },
    
    onLoadSuccess: function(){
      var opt = $(this).datagrid('options');
    },
    
    columns:[[
      {field:'_',checkbox:true},
      {field:'value',title:'ID',width:30},
      {title:'Description',field:'text',width:70}
    ]],
    
    onCheck:function(idx,row){
      $.dui.page.grpcheck(idx,row,'add');
    },
    
    onUncheck:function(idx,row){
      $.dui.page.grpcheck(idx,row,'del')
    },
    
  });
  
})