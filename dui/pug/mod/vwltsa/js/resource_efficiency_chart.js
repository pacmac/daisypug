

$.dui.page.data = {};
$.dui.page.chart = {};

$.dui.page.do = function(dgdat){    
    var sort = dgdat.rows;
    //console.log('do>sort:',sort);


    var pct=0, sum=0; 
    if (sort){
        sort.map(function(e){ sum += (e.SUM_EST/e.SUM_ACT);})
    }
    
    var odata = {bars:[],lines:[{lines:{show:true,align:"center"}, data:[],yaxis:2,points:{show:true,symbol:'circle'},'color':'#FF8A8A'}],ticks:[]};  
    for(var i in sort){
      var row = sort[i];
      pct = ((row.SUM_EST / row.SUM_ACT) * 100);
      var bar = {bars:{show:true,barWidth:0.9,align:"center"},label:row.RESOURCE_ID,color:row.color,data:[[i,pct]],sum:100};
      odata.bars.push(bar);
      
     // odata.lines[0].data.push([i,pct]);
      odata.ticks.push([i,row.RESOURCE_ID]);
    }
    return odata;
  }


$.dui.page.chart.pare = function(dgdata,elid){  
  
    var pare = $.dui.page.do(dgdata);
    console.log(pare)
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
    $.dui.page.flot = $.dui.page.fplot(elid,fdat,opts,function(item){
      var xval = item.dataIndex; 
      var yval = item.datapoint[1].toFixed(0);
      var label = item.series.xaxis.ticks[xval].label;
      console.log(item)
      //if(item.datapoint.length==2) var txt='%'; else var txt=' defects';
      var txt='%'
      return `${yval}${txt}`;
    });
  }

  // plot the graph
$.dui.page.fplot = function flot(elid,data,opts,xv,yv){
    var flt = $.plot($("#"+elid),data,opts);
    $.dui.page.hover(elid,xv,yv); 
    return flt;
  }

  // Graph Tool Tip
$.dui.page.showtip = function(x,y,contents) {
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
  $.dui.page.hover = function(elid,vfunc){  
    $.dui.page[elid+'_prev'] = null;  
    $("#"+elid).bind("plothover", function (event, pos, item) {
      if(item) {
        if ($.dui.page[elid+'_prev'] != item.dataIndex) {
          $.dui.page[elid+'_prev'] = item.dataIndex;
          $("#flot_tip").fadeOut(200).remove();
          if(typeof(vfunc) == "function") var data = vfunc(item);
          else {
            var x = item.datapoint[0].toFixed(0),
            y = item.datapoint[1].toFixed(0);
            var data = "("+x+","+y+")";
          }
          $.dui.page.showtip(item.pageX, item.pageY,data);
        }
      }
      else {
        $("#flot_tip").fadeOut(200).remove();
        $.dui.page[elid+'_prev'] = null;
      }
    });
  }
$.dui.page.getdata = function(){
    var res=$('#resources').multibox('getValue');
    var horiz =$('#horiz').numberspinner('getValue');

    var vars ={_func:'get',_sqlid:'vwltsa^resource_efficiency',horiz:`${horiz}`,resources:`${res}`,'_dgrid':'y'};
    //console.log(vars)
    ajaxget('/',vars,function(data){
      $.dui.page.data=data;
        $.dui.page.datagrid(data)
        
    })
}


// main datagrid
$.dui.page.datagrid = function(data){  
    var rows = clone(data.rows);
  
    
    $('#westdg').datagrid({
      
      singleSelect:true,
      fit:true,
      columns: [[{field:'RESOURCE_ID',title:'Resource ID',width:125},{field:'SUM_EST',title:'Estimated',width:40},{field:'SUM_ACT',title:'Actual',width:40}]],
      data: rows,
      fitColumns:true,
      onSelect:$.dui.page.dgall_sel,
      onLoadSuccess:function(){    
        $(this).datagrid('selectRow',0);
      }
    })

//    $.dui.page.dgall_sel();
  } 

// on-select of date range & view
$.dui.page.dgall_sel = function(idx,row){  
    $.dui.page.chart.pare($.dui.page.data,'swest');

    // highlight pareto
    /*
    var idx = objidx($.dui.page.flot.getData(),'label',row.RESOURCE_ID);
    if(idx !=-1) {
      $.dui.page.flot.unhighlight();
      $.dui.page.flot.highlight(idx,0);
    }  
    */
  }

$.dui.page.ready = function(){
    $('#mainlo > .panel > .panel-header .panel-tool').append( $('#ncatbar'));
}
 
$.page.ready(function () {
    
    $('#resources').multibox({
        onSelect:function(nv,ov){
         // console.log('nv:',nv,',ov:',ov)
            $.dui.page.getdata()
        },


        
    })
    
    $('#horiz').numberspinner({
        onChange:function(){
            $.dui.page.getdata()
        }
    })
    setTimeout(function(){
        $.dui.page.ready();
        $.dui.page.getdata()
    },100)
    
})