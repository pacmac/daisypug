// initial page load
$.dui.page.init = function(){  
  ajaxget('/',{'_func':"get",'_sqlid':'vwltsa^jp_blank'},function(data){
    $.dui.page.dgrid($.dui.page.cols(data.config),data.rows);
    $.dui.page.util();
  })
}

// load utilisation data
$.dui.page.util = function(){
  ajaxget('/',{'_sqlid':'vwltsa^jp_util','_func':'get'},function(data){
    
    var dg = $('#resutil');
    var _errors = [];
    data.rows.map(function(e,i){
        
        /* PAC 221103
        if (e.rid=="XUT" || e.rid=="XRT")console.log('$.dui.page.util:i=',i,',row=',e);
        dg.datagrid('updateRow',{'index':i,'row':e});      
        // CLS, 2021-4-26, active of undefined error.
        // dg.datagrid('updateRow',{'index':i,'row':e});
        
        CLS >>> the query that build the blank datagrid returns a different number of records
        than this query. so I suspect that the filter criteria used in this query is different.
        
        */
    
      try {
        dg.datagrid('updateRow',{'index':i,'row':e}); 
      } catch(err){
        _errors.push(`${e.rid}:${err.message}`);
      }
    });
    
    dg.datagrid('fitColumns');
    //console.log(_errors);
    if(_errors.length > 0) {
      dglen = dg.datagrid('getRows').length;
      datlen = data.rows.length;  
      ce(_errors.join('</br>'));
      if(dglen != datlen) ce(`Data Length mismatch: blank-dgrid=${dglen}, load-data=${datlen}`);
      msgbox('Data Load Error.<br/>Please notify support.');
    }
  });
}

// add days to a date object
$.dui.page.addDays = function(days,date) {
  var dow = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var moy = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];    
  if(date) var now = new Date(date); else var now = new Date();
  now.setDate(date.getDate() + days);
  var off = false;
  if(now.getDay() == 0 || now.getDay() == 6) off = true;
  return {'day':dow[now.getDay()],'dow':now.getDay(),'off':off,'date':now,'yymmdd':(now.getFullYear()).toString()+pad(now.getMonth()+1,2).toString()+pad(now.getDate(),2).toString(),'dmon':(now.getDate())+' '+moy[now.getMonth()]};
}


// build the day columns
$.dui.page.cols = function(cfg) {
  //var dgw = $('.datagrid-view2 .datagrid-body').innerWidth();
  //cl(dgw);
  //var tdw = (dgw/28) || 0; 
  
  function ulf(val,row,idx){
    var me = $(this)[0];
    
    // set weekend array
    if(me.dow==6 || me.dow==0) {
      if(offs.indexOf(me.field)==-1) offs.push(me.field)
    }
    
    // calculate today's units
    var dcap = row.dcap[me.dow];
    var capor = row.capor;
    if(capor && capor[me.field]) var units = capor[me.field].units;  
    else if(dcap==0) var units=0;
    else units = row.units;
    var bgp = parseInt(val) || 0;
    if(bgp < 100) var col='ora';
    else if(bgp == 100) var col='grn';
    else if(bgp > 100) var col='red';
    
    var ul = '<ul class="ulbar '+col+'" style="background-size:100% '+bgp+'%;">';
    for (i = 0; i < units; i++) { ul += '<li title="'+bgp+'%'+'"></li>' }
    ul += '</ul>';
    return ul; 
  }   
  
  var offs = []; var cols = [], date = isodate(cfg.sdate), i=0, ymd=0; 
  while(ymd != cfg.edate){
    var now = $.dui.page.addDays(i,date);
    ymd = now.yymmdd 
    //var title = now.day+' '+now.dmon;
    var title = now.dmon;
    var col = {'dow':now.dow,'date':now.date,'off':now.off,'field':ymd,'title':title,'width':60,'fixed':false,'formatter':ulf,'align':'center'};
    cols.push(col);
    i++;
  }
  return [cols]; 
}

// add the datagrid
$.dui.page.dgrid = function(cols,data){
  $('#resutil').datagrid({
    method:'GET',
    loadMsg: 'Loading Schedule...',
    fit:true,
    fitColumns:true,
    striped:false,
    data:data,
    frozenColumns: [[
      {field:"active",hidden:true},
      {field:"rid",title:"Resource ID",width:100,fixed:true},
      {field:"units",title:"Units",align:'center',width:40,fixed:true, formatter:function(val,row,idx) {
        
        if(row.active===false) var ul = '<ul class="ulbar bg-red">';
        else var ul = '<ul class="ulbar gry">';
    
        var ul = '<ul class="ulbar gry">';  
        for (i=0; i<val; i++) { ul += '<li>'+(val-i)+'</li>' }
        ul += '</ul>';
        return ul; 
        
      }},
      {field:"tpct",title:"% &Sigma;",width:30,align:'center',formatter:function(val,row,idx){
        var rval = parseInt(val) || 0;
        return rval+'%';
      },styler:function(val,row,idx){
        return; // disable - does not look nice !
      }},
      {field:"class",title:"Class",width:50,hidden:true},
      {field:"desc",title:"Description",width:50,hidden:true},
      //{field:"unp",title:"Unplanned Jobs",width:110,fixed:true,formatter:function(){return '<ul class="ulbar"></ul>'}},
      //{field:"spacer",width:2,fixed:true}
    ]],
    
    columns:cols,
    onBeforeSelect:function(){return false;},
    onLoadSuccess:function(){
      //console.log(cols[0])
      cols[0].map(function(e){
        if(e.off) $('tr.datagrid-header-row td[field="'+e.field+'"]').addClass('off');
      })
    }
    //onRowContextMenu: function(evt,idx,row){evt.preventDefault()}
  })
  
}

$( document ).ready(function() {  
  $.dui.page.data = {};
  //$.dui.page.horiz = parseInt($.dui.bhave.horiz) * 7 || 14;
  $.dui.page.horiz = 1* 7 || 14;
  $.dui.page.init();
  
  eui.toolbar([
    {
      type: 'linkbutton',
      options:{
        iconCls:'icon-tick',
        toggle:true,
        selected: true,
        enabled: true,
        text: 'Show All',
        onClick: function(){
          var sel = $(this).linkbutton('options').selected;
          var dg = $('#resutil');
          var rows = dg.datagrid('getRows');
         // console.log(rows)
          rows.map(function(e,i){
            if(sel) dg.datagrid('showRow',i); 
            else if(!e.active) dg.datagrid('hideRow',i);
          })
        }   
      }
      
    },{}
  ])    

})