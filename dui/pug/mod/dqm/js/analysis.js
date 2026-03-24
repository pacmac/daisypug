//var dwap = {page:{}}
$.page.fn.pastel = ["#FDC68A", "#8493CA", "#C4DF9B", "#6ECFF6", "#F7977A", "#7BCDC8", "#8882BE", "#A2D39C", "#7EA7D8", "#82CA9D",  "#F9AD81", "#F49AC2", "#A187BE", "#BC8DBF", "#FFF79A", "#F6989D"];
$.page.fn.moy = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
$.page.fn.sevids = {crit:'SEVERITY CRITICAL',hifq:'HIGH & FREQUENT',tops:'TOP DEFECT'};

$.page.fn.flot = {};
$.page.fn.chart = {};
$.page.fn.data = {};
$.dui.bhave = $.dui.bhave || {
  nonetext: 'NO CODE',
  alltext: 'ALL CODES',
  top: 3
}

$.dui.bhave.frdate = $.dui.bhave.frdate || isodate(new Date(),'fmt'); 
$.page.fn.nonetext = $.dui.bhave.nonetext;
$.page.fn.alltext = $.dui.bhave.alltext;
$.page.fn.top = parseInt($.dui.bhave.top); 

//##### MISC FUNCTIONS #####//
function addmonth(date,add){
  return new Date(new Date(date).setMonth(date.getMonth()+add))
}

$.page.fn.ymdtick = function(val,axis){
  //cl(val);
  var ymd = val.toString().split('.')[0];
  var tick = ($.page.fn.moy[parseInt(ymd.match(/([0-9]{4})([0-9]{2})/)[2])-1]);
  //cl(tick);
  return tick;
}

// plot the graph
$.page.fn.fplot = function flot(elid,data,opts,xv,yv){
  var flt = $.plot($("#"+elid),data,opts);
  $.page.fn.hover(elid,xv,yv); 
  return flt;
}

$.page.fn.iso = function(str){
  var str = str.toString();
  if(!str || str.length != 8) return {y:'',ym:'',moy:''};
  var ymd = str.match(/([0-9]{4})([0-9]{2})([0-9]{2})/);
  return{y:ymd[1],ym:ymd[1]+ymd[2],moy:$.page.fn.moy[parseInt(ymd[2])-1]}
}

// Graph Tool Tip
$.page.fn.showtip = function(x,y,contents) {
  $('<div id="flot_tip">' + contents + '</div>').css({
    position: 'absolute',
    display: 'none',
    top: y -30,
    left: x + 5,
    border: '1px solid #AAAAAA',
    padding: '2px 6px',
    'background-color': '#EEEEEE',
    'border-radius': '6px'
  }).appendTo("body").fadeIn(200);
}

// graph Tooltip Event
$.page.fn.hover = function(elid,vfunc){  
  $.page.fn[elid+'_prev'] = null;  
  $("#"+elid).bind("plothover", function (event, pos, item) {
    if(item) {
      if ($.page.fn[elid+'_prev'] != item.dataIndex) {
        $.page.fn[elid+'_prev'] = item.dataIndex;
        $("#flot_tip").fadeOut(200).remove();
        if(typeof(vfunc) == "function") var data = vfunc(item);
        else {
          var x = item.datapoint[0].toFixed(0),
          y = item.datapoint[1].toFixed(0);
          var data = "("+x+","+y+")";
        }
        $.page.fn.showtip(item.pageX, item.pageY,data);
      }
    }
    else {
      $("#flot_tip").fadeOut(200).remove();
      $.page.fn[elid+'_prev'] = null;
    }
  });
}

//##### DATA BUILDING #####//

$.page.fn.getdata = function(cb){
  var sdate = isodate($('#frdate').datebox('getDate'));
  var edate = isodate($('#todate').datebox('getDate'));   
  var myncr = $('#myncr').prop('checked');
  var status = $('#ncrstat').combobox('getValue'); 
  
  $.page.fn.data = {};
  
  $.page.fn.data.vars = $.page.fn.data.vars || {
    _func:'get', 
    _sqlid:'dqm^'+$.page.fn.page+'an', 
    sdate:sdate, 
    edate:edate, 
    myncr:myncr, 
    status:status
  };
  
  // demo Mode Switches
  if($.page.fn.demo) {
    var url = '/json/ncr.json';
    $.page.fn.data.vars.sdate = '20150101';
    $.page.fn.data.vars.edate = '20151231';
  } else var url = '/';  
  
  $.page.fn.dgcols();
  
  ajaxget(url,$.page.fn.data.vars,function(data) {
    $.page.fn.data.ncrs = data;
    $.page.fn.data.dgall = $.page.fn.dgall(data);
    $.page.fn.data.dgtop = $.page.fn.dgtop(data);
    $.page.fn.data.dgstat = $.page.fn.dgstat(data);
    cb(data);
  });
}

$.page.fn.rowcol = function(val){
  return '<span class="legcol" style="background-color:'+val+'"></span>';
}

// build columns
$.page.fn.dgcols = function(){
  var cols = [{field:'color',title:'#',width:'5%',align:'center',formatter:$.page.fn.rowcol}, {field:'drclass',title:'Defect Type',width:'25%'},{field:'class', title:'Rank Class', width:'25%',hidden:true}, {field:'sum',title:'&sum;',width:'7%',align:'center'}]; 
  
  var sdate = isodate($.page.fn.data.vars.sdate);
  var edate = isodate($.page.fn.data.vars.edate);
  var ym=0, idx=0, eym=edate.getFullYear()+pad(edate.getMonth()+1,2);
  
  while(ym < eym){
    var date = addmonth(sdate,idx);
    var mon = date.getMonth()+1;
    var ym = date.getFullYear()+pad(mon,2);
    cols.push({field:ym,title:$.page.fn.moy[mon-1],data:true,width:'5%',align:'right',sum:0,fixed:true})
    idx ++;
  }
  cols.push({field:'filler',width:500,fixed:false});
  $.page.fn.data.dgcols = cols;
}

// status datagrid.
$.page.fn.dgstat = function(data){  
  var tmp = {rows:{},idx:0}
  var odata = {rows:[],cols:$.page.fn.data.dgcols,foot:{drclass:$.page.fn.alltext,color:'#FF8A8A',sum:0}};
  
  return odata;
}

// main datagrid.
$.page.fn.dgall = function(data){  
  var tmp = {rows:{},idx:0}
  var odata = {rows:[],cols:$.page.fn.data.dgcols,foot:{drclass:$.page.fn.alltext,color:'#FF8A8A',sum:0}};  

  data.map(function(e){    
    var ym = e.date.substr(0,6);
    if(!e.drclass) e.drclass = $.page.fn.nonetext;
    
    if(!tmp.rows[e.drclass]) tmp.rows[e.drclass] = {};
    if(!tmp.rows[e.drclass][ym]) tmp.rows[e.drclass][ym]=[e];
    else tmp.rows[e.drclass][ym].push(e);   
  })

  for(var r in tmp.rows){
    var type = tmp.rows[r];
    var color = $.page.fn.pastel[tmp.idx]; tmp.idx ++;
    var rarr = {drclass:r,color:color,sum:0, ncr:[]};
    for(var c in odata.cols){ // each month
      if(!odata.cols[c].data) continue;
      var ym = odata.cols[c].field;
      if(type[ym]) {
        var sum=type[ym].length;
        type[ym].map(function(e){ rarr.ncr.push(e.ncrid);})
      } else var sum=0;
      rarr[ym]=sum; rarr.sum+=sum;
      
      // footer
      if(!odata.foot[ym]) odata.foot[ym]=sum;
      else odata.foot[ym] += sum;
      odata.foot.sum+=sum;
      
    }
    odata.rows.push(rarr);
  }
  return odata;
}

//cl($.page.fn.dgall(data));

// TOP Datagrid
$.page.fn.dgtop = function(data){  
  var tmp = {crit:{}, hifq:{}, tops:{}}, idx=0, sort=[];
  var pre = {crit:[], hifq:[], tops:[]};
  var odata = {rows:[],cols:$.page.fn.data.dgcols,foot:{drclass:'All Defects',color:'#FF8A8A',sum:0}};  

  data.map(function(e){    
    var ym = e.date.substr(0,6);
    if(!e.drclass) e.drclass = $.page.fn.nonetext;
    
    if(e.severity=='CRITICAL') {
      e.class = 'CRITICAL';
      if(!tmp.crit[e.drclass]) tmp.crit[e.drclass]={};
      if(!tmp.crit[e.drclass][ym]) tmp.crit[e.drclass][ym]=[e];
      else tmp.crit[e.drclass][ym].push(e);
    }
    
    else if(e.severity=='HIGH' && e.recur=='FREQUENT') {
      e.class = 'HIGH-FREQUENT';
      if(!tmp.hifq[e.drclass]) tmp.hifq[e.drclass]={};
      if(!tmp.hifq[e.drclass][ym]) tmp.hifq[e.drclass][ym]=[e];
      else tmp.hifq[e.drclass][ym].push(e);
    }
    
    else {
      if(!tmp.tops[e.drclass])tmp.tops[e.drclass]={};
      if(!tmp.tops[e.drclass][ym]) tmp.tops[e.drclass][ym]=[e];
      else tmp.tops[e.drclass][ym].push(e);
      var ix = objidx(sort,'key',e.drclass);
      if(ix==-1) sort.push({key:e.drclass,sum:1});
      else sort[ix].sum ++;
    }
    
  })

  for(var cid in tmp){ // for each class of 3
    var cls = tmp[cid];   
    for(var drc in cls){
      var type = cls[drc];
      var color = $.page.fn.pastel[idx]; idx ++;      
      var txt = $.page.fn.sevids[cid];
      var rarr = {class:txt, drclass:drc, color:color, sum:0, ncr:[]};

      for(var cmy in odata.cols){ // each col/month
        if(!odata.cols[cmy].data) continue;
        var ym = odata.cols[cmy].field;          
        if(cls[drc][ym]) {
          var sum=cls[drc][ym].length;
          cls[drc][ym].map(function(e){rarr.ncr.push(e.ncrid);})
        } else var sum=0;
        rarr[ym]=sum; rarr.sum+=sum;
        
        // footer
        if(!odata.foot[ym]) odata.foot[ym]=sum;
        else odata.foot[ym] += sum;
        odata.foot.sum+=sum;
        
      }
      pre[cid].push(rarr);
    }
  }
  
  // limit the list
  for(var p in pre){
    rows = keysort(pre[p],'sum').reverse();
    if(p!='tops') odata.rows = odata.rows.concat(rows); 
    else {
      var len=odata.rows.length; 
      if(len >= $.page.fn.top) odata.rows.push(rows[0]);
      else odata.rows = odata.rows.concat(rows.slice(0,($.page.fn.top - len)));
    }
  }
  return odata;
}


//cl($.page.fn.dgtop(data,5));

// stack from {rows:[], cols"[]}
$.page.fn.dostack = function(colrow){
  var stack=[], ticks=[], first=true;
  for(var r in colrow.rows){
    var sarr = {data:[]}, row=colrow.rows[r], idx=0;
    for(var c in row){
      if(isNaN(c)) sarr[c]=row[c];
      else {
        if(first) {
          var title; colrow.cols.map(function(e){if(e.field==c) title=e.title;})
          ticks.push([idx,title]);
        }
        sarr.data.push([idx,row[c]]);        
      idx++;
      }
    }
    first = false;
    stack.push(sarr);
  }
  return {bars:stack,ticks:ticks};
}

//var dg = $.page.fn.dogrid(data);
//cl($.page.fn.dostack(dg));

// pareto analysis from dgrid (top 3)
$.page.fn.dopare = function(dgdat,top){    
  var sort = keysort(dgdat.rows,'sum').reverse();
  if(top) sort.splice(0,top);
  var pct=0, sum=0; sort.map(function(e){ sum += e.sum;})
  var odata = {bars:[],lines:[{lines:{show:true,align:"center"}, data:[],yaxis:2,points:{show:true,symbol:'circle'},'color':'#FF8A8A'}],ticks:[]};  
  for(var i in sort){
    var row = sort[i];
    var bar = {bars:{show:true,barWidth:0.9,align:"center"},label:row.drclass,color:row.color,data:[[i,row.sum]],sum:row.sum};
    odata.bars.push(bar);
    pct += ((row.sum / sum) * 100);
    odata.lines[0].data.push([i,pct]);
    odata.ticks.push([i,row.drclass]);
  }
  return odata;
}

//var dg = $.page.fn.dogrid(cols);
//var dg = $.page.fn.t3grid(data,5);
//cl($.page.fn.dopare(dg).lines[0].data);

/*
// permonth from datagrid
$.page.fn.doperm = function(dgdat){    
  var odata = {bars:[],lines:[],ticks:[]};  
  for(var i in dgdat.rows){
    var row = dgdat.rows[i];
    var bar = {bars:{show:true,barWidth:0.9,align:"center"},label:row.drclass,color:row.color,data:[[row.sum]],sum:row.sum};
    odata.bars.push(bar);
    odata.ticks.push([i,row.drclass]);
  }
  return odata;
}
//var dg = $.page.fn.dogrid(cols);
//var dg = $.page.fn.t3grid(data,5);
//cl($.page.fn.doperm(dg));
*/

//##### SHOW GRAPHS #####//

// pareto analysis
$.page.fn.chart.pare = function(dgdata,elid){  
  
  var pare = $.page.fn.dopare(dgdata);
  var fdat = pare.bars;
  fdat.push(pare.lines[0]);  

  var opts = {
    grid: {hoverable: true,background:'#EEEEEE'}, 
    legend:{show:false}, 
    xaxis:{ticks:pare.ticks}, 
    yaxes:[{min:0},{min:0,max:105,position:0}],
    yaxis:{tickDecimals:0}
  }
  
  // plot pareto & custom hover.
  $.page.fn.flot.pare = $.page.fn.fplot(elid,fdat,opts,function(item){
    var xval = item.dataIndex; 
    var yval = item.datapoint[1].toFixed(0);
    var label = item.series.xaxis.ticks[xval].label;
    if(item.datapoint.length==2) var txt='%'; else var txt=' defects';
    return yval+txt;
  });
}

// stack graph
$.page.fn.chart.stack = function(rowcol,elid){   
  var stack = $.page.fn.dostack(rowcol); 
  
  var opts = {
    grid: {hoverable: true,background:'#EEEEEE'}, 
    legend:{show:false, noColumns:12, container:$('#legend')}, 
    xaxis:{tickDecimals:0,ticks:stack.ticks}, 
    series:{bars: {show: true,barWidth: 0.9, align:"center"}, stack:false}, 
    yaxis:{tickDecimals:0}
  };
  
  // plot stack & custom tooltip.
  $.page.fn.flot.stack = $.page.fn.fplot(elid,stack.bars,opts,function(item){
    //console.log('stack:',item)
    var xval = item.dataIndex; 
    var yval = item.datapoint[1].toFixed(0);
    var label = item.series.xaxis.ticks[xval].label;
    return yval+' defects';
  });
}

// datagrid row-select graph
$.page.fn.chart.dgrow = function(idx,row,elid){  
  var color=row.color, bars=[], ticks=[], idx=0;
  var cols=[]; $.page.fn.data.dgcols.map(function(e){if(e.data) cols.push(e.title)});
  
  //cj(row);
  
  for(var i in row){
    var cell = row[i];
    if(isNaN(i)) continue;  // only dates
    bars.push([idx,cell]);
    ticks.push([idx,cols[idx]]);
    idx++;
  }

  var opts = { 
    yaxis:{tickDecimals:0},
    xaxis:{tickDecimals:0,ticks:ticks}, 
    grid: {hoverable:true,background:'#EEEEEE'}, 
    series: {color:color, lines:{show:false,align:'center'}, 
    bars:{show:true,align:'center',barWidth:0.9}, 
    points:{show:false}}
  };
  
  // plot graph & add custom hover
  $.page.fn.flot.perm = $.page.fn.fplot(elid,[bars],opts,function(item){
    var xval = item.dataIndex; 
    var yval = item.datapoint[1].toFixed(0);
    var label = item.series.xaxis.ticks[xval].label;
    return yval+' defects';
  });
}

// main datagrid
$.page.fn.chart.dgall = function(data,foot){  
  var rows = clone(data.rows);
  if(foot && foot.sum > 0) {
    var fon = true;
    rows.unshift($.page.fn.data.dgall.foot);
  } else var fon = false;    
  
  $('#westdg').datagrid({
    showFooter: fon,
    singleSelect:true,
    fit:true,
    columns: [data.cols],
    data: rows,
    fitColumns:true,
    onSelect:$.page.fn.dgall_sel,
    onLoadSuccess:function(){    
      $(this).datagrid('selectRow',0);
    }
  })
}  

// NCR Listing
$.page.fn.chart.dgncr = function(data){  
  $('#ncrlist').datagrid({
    striped: false,
    rownumbers:false,
    selectOnCheck:true,
    singleSelect:true,
    fit:true,
    fitColumns:true,
    columns: [[{field:"open",title:"Open",checkbox:true},{field:'ncrid',title:'Doc ID',width:120,fixed:true},{field:'date',title:'Date',width:85,fixed:true},{field:'status',title:'Status',width:100,fixed:true,hidden:true},{field:'drclass',title:'Defect Code',width:120,fixed:true},{field:'subject',title:'Title / Subject',width:500,fixed:false},{field:'NCR_QTY',title:'NCR Qty',width:500,fixed:false}]],
    data:data,
    onCheck:function(idx,row){
      if($.page.fn.demo) alert('Not Available in Demo.');
      else setTimeout(function(){
        //loadpage('dqm^'+$.page.fn.plink+'&NCR_ID='+row.ncrid);
        loadpage('dqm^comp^'+$.page.fn.page+'_man&NCR_ID='+row.ncrid); 
      },300);
    }
  })
}

// on-select of date range & view
$.page.fn.dgall_sel = function(idx,row){  
    
  if(row.class) {
    var src = $.page.fn.data['dgtop'];
    var mode = 'Top 3';
  }
  else {
    var src = $.page.fn.data['dgall'];
    var mode = 'Overall';
  }
  $.page.fn.chart.pare(src,'swest');
  $.page.fn.chart.stack(src,'seast');
  $.page.fn.chart.dgrow(idx,row,'neast');
  
  // filter the NCR Records
  var rows = $('#ncrlist').prev('.datagrid-view2').find('.datagrid-body tbody tr');
  if(row.ncr) {rows.each(function(){
    var nid = $(this).find('td[field="ncrid"] div.datagrid-cell').text();
    if(row.ncr.indexOf(nid) != -1) $(this).show();
    else $(this).hide();
  })} else rows.show();
  
  // set the panel titles
  $('#neast').panel('setTitle',mode+' by Month - <span style="color:'+row.color+'">'+row.drclass+'</span>');
  $('#swest').panel('setTitle','Pareto - '+mode);
  $('#seast').panel('setTitle','Monthly Totals - '+mode);
  
  /*
  var tis = ['nwest','neast','swest','seast'}];
  for(var t in tis){
    $('#'+tis[t]).panel('setTitle',rec.text+' - XXXXX');
  }
  */
  //return;

  // highlight pareto
  var idx = objidx($.page.fn.flot.pare.getData(),'label',row.drclass);
  if(idx !=-1) {
    $.page.fn.flot.pare.unhighlight();
    $.page.fn.flot.pare.highlight(idx,0);
  }  
  
  // highlight stacks
  $.page.fn.flot.stack.unhighlight();
  var data = $.page.fn.flot.stack.getData();
  var idx = objidx(data,'drclass',row.drclass);
  if(idx != -1) {
    for(var i in data[idx].data){
      $.page.fn.flot.stack.highlight(idx,parseInt(i));
    }
  }
}

// ajax data is loaded
$.page.fn.ready = function(data){
  $('#mainlo > .panel > .panel-header .panel-tool').append( $('#ncatbar'));
  $('#views').combobox('select','cio');
  $('#views').combobox('select','sum');
  $.page.fn.chart.dgncr($.page.fn.data.ncrs);
}

$.page.ready(function () {

  // Filters
  $('#todate, #frdate').datebox({
    onChange: function(){
      $.page.fn.getdata(function(data){
        $.page.fn.ready(data);
      });
    }
  })
  
  $('#myncr').on('click',function(txt,idx){
    $.page.fn.getdata(function(data){
      $.page.fn.ready(data);
      })
  })
  
  $('#ncrstat').combobox({
    panelHeight:'auto',
    data:[{text:'Open',value:'open'},{text:'Closed',value:'closed'},{text:'All',value:'all',selected:true}],
    onSelect: function(txt,idx){
      $.page.fn.getdata(function(data){
        $.page.fn.ready(data);
      });
    }    
  })

  $('#type').combobox({
    panelHeight:'auto',
    data:[
      {text:'NCR',value:'ncr',selected:true, iconCls:'flag_red'},
      {text:'CPAR',value:'cpar', iconCls:'cpar'},
      {text:'CF',value:'cf', iconCls:'user_comment_blu'},
      {text:'CI',value:'ci', iconCls:'ci'}
    ],
    
    formatter: function(rec){
      return '<span style="background: url(../icons/'+rec.iconCls+'.png) no-repeat left center;padding-left:22px;">'+rec.text+'</span>'  
    },
        
    onSelect: function(rec){
      $(this).combobox('textbox').css({'padding-left':'26px','background':'url(../icons/'+rec.iconCls+'.png) no-repeat 4px 2px'});
      
      $.page.fn.page = rec.value;
      $.page.fn.plink = 'dqm^comp^'+rec.value;
      $.page.fn.getdata(function(data){
        $.page.fn.ready(data);
      });
    }    
  })
  
  $('#views').combobox({
    editable:false,
    panelHeight:'auto',
    data:[{text:'Defect Summary',value:'sum'},{text:'Top Defects',value:'cio'}],
    //data:[{text:'Defect Summary',value:'sum'},{text:'Top Defects',value:'cio'},{text:'Status Summary',value:'stat'}],
    onSelect:function(rec){
      setTimeout(function(){
        
        if(rec.value=='sum') {
          $.page.fn.chart.dgall($.page.fn.data.dgall,true);
          $.page.fn.data.dgcols.map(function(e){
            if(e.data) e.hidden = true;
            if(e.field=='class') e.hidden = false;
          })           
        }
        else if(rec.value=='cio'){
          $.page.fn.chart.dgall($.page.fn.data.dgtop);
          $.page.fn.data.dgcols.map(function(e){
            if(e.data) e.hidden = false;
            if(e.field=='class') e.hidden = true;
          }) 
        }
        else {
          $.page.fn.chart.dgall($.page.fn.data.dgstat,true);  
        }
         
      });  
    }
  })

  setTimeout(function(){
    $('#type').combobox('reselect');
  }); 
  
})