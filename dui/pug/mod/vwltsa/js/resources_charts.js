$.dui.page.data = {};
$.dui.page.chart = {};
$.dui.page.flot = {};
$.dui.page.color={};
$.dui.page.colors=function(pct){

  var charts = $('#charts').multibox('getValue');
  if (charts=="e1") var segment={pct_1:$.dui.page.color.EFFICIENCY_PCT_1,pct_2:$.dui.page.color.EFFICIENCY_PCT_2,color_1:$.dui.page.color.EFFICIENCY_COLOR_1,color_2:$.dui.page.color.EFFICIENCY_COLOR_2,color_3:$.dui.page.color.EFFICIENCY_COLOR_3};
  else var segment={pct_1:$.dui.page.color.EFFECTIVENESS_PCT_1,pct_2:$.dui.page.color.EFFECTIVENESS_PCT_2,color_1:$.dui.page.color.EFFECTIVENESS_COLOR_1,color_2:$.dui.page.color.EFFECTIVENESS_COLOR_2,color_3:$.dui.page.color.EFFECTIVENESS_COLOR_3};
  
//  console.log(segment);
  var colors={ 'bg-brn':'Brown','bg-red':'Red','bg-ora':'Orange','bg-yel':'Yellow','bg-grn':'Green','bg-cyn':'Cyan','bg-blu':'Blue','bg-pur':'Purple','bg-gry':'Grey','bg-sil':'Silver','bg-clr':'Clear'};
  var color="";
  if (pct>=segment.pct_1*1) color=colors[segment.color_1];
  else if ((pct<segment.pct_1*1) && (pct>segment.pct_2*1)) color=colors[segment.color_2];
  else if (pct<segment.pct_2*1) color=colors[segment.color_3];
  return color;
}
$.dui.page.dostack = function(colrow){



    var sort = colrow.rows;
    var pct=0, sum=0; 
    if (sort) sort.map(function(e){ sum += (e.GOOD_QTY + e.BAD_QTY);})

    var odata = {bars:[],lines:[{lines:{show:true,align:"center"}, data:[],yaxis:2,points:{show:true,symbol:'circle'},'color':'#FF8A8A'}],ticks:[]};  
    for(var i in sort){
      var row = sort[i];
      //pct = (row.GOOD_QTY)*1 + (row.BAD_QTY)*1;
      pct =( (row.GOOD_QTY)*1 / ((row.GOOD_QTY)*1 + (row.BAD_QTY)*1))*100;
      row.color=$.dui.page.colors(pct);
      //var bar = {bars:{show:true,barWidth:0.9,align:"center"},label:row.RESOURCE_ID,color:row.color,data:[[i,row.GOOD_QTY],[i,row.BAD_QTY],[i, (row.GOOD_QTY)*1 + (row.BAD_QTY)*1]],sum: pct};
      var bar = {bars:{show:true,barWidth:0.9,align:"center"},label:row.RESOURCE_ID,color:row.color,data:[[i,pct]],sum:100};
      odata.bars.push(bar);
      odata.ticks.push([i,row.RESOURCE_ID]);
    }
    return odata;
}

$.dui.page.do = function(dgdat){    


    var sort = dgdat.rows;
    var pct=0, sum=0; 
    if (sort)sort.map(function(e){ sum += (e.SUM_EST/e.SUM_ACT);})
    
    var odata = {bars:[],lines:[{lines:{show:true,align:"center"}, data:[],yaxis:2,points:{show:true,symbol:'circle'},'color':'#FF8A8A'}],ticks:[]};  
    for(var i in sort){
      var row = sort[i];
      pct = ((row.SUM_EST / row.SUM_ACT) * 100);
      row.color=$.dui.page.colors(pct);
      var bar = {bars:{show:true,barWidth:0.9,align:"center"},label:row.RESOURCE_ID,color:row.color,data:[[i,pct]],sum:100};
      odata.bars.push(bar);
      odata.ticks.push([i,row.RESOURCE_ID]);
    }
    return odata;
  }

$.dui.page.chart.global = function(chartType,dgdata,elid){
  //console.log('charttype:',chartType)
  switch ( chartType){
    case "e1":
        var pare = $.dui.page.do(dgdata);
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
        $.dui.page.flot.pare = $.dui.page.fplot(elid,fdat,opts,function(item){
         //console.log(chartType,':',item)
          var xval = item.dataIndex; 
          var yval = item.datapoint[1].toFixed(0);
          var label = item.series.xaxis.ticks[xval].label;
        //
          //if(item.datapoint.length==2) var txt='%'; else var txt=' defects';

          return `${yval}%`;
        });
      break;
    case "e2":
      var stack = $.dui.page.dostack(dgdata); 
     // console.log('stack:',stack)
      var opts = {
        grid: {hoverable: true,background:'#EEEEEE'}, 
        legend:{show:false, noColumns:12, container:$('#legend')}, 
        xaxis:{tickDecimals:0,ticks:stack.ticks}, 
        series:{bars: {show: true,barWidth: 0.9, align:"center"}, stack:false}, 
        yaxis:{tickDecimals:0}
      };
      
     // console.log('stack opts:',opts)
      // plot stack & custom tooltip.
      $.dui.page.flot.stack = $.dui.page.fplot(elid,stack.bars,opts,function(item){
        //console.log('chart/stack:',item)
        var xval = item.dataIndex; 
        var yval1 = item.datapoint[1].toFixed(0);
        var label = item.series.xaxis.ticks[xval].label;
        return `Total:${yval1}`;
      });
      break;
    
      default:
        return '';
  }
}
$.dui.page.chart.pare = function(dgdata,elid){  
  
    var pare = $.dui.page.do(dgdata);
    //console.log(pare)
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
    $.dui.page.flot.pare = $.dui.page.fplot(elid,fdat,opts,function(item){
     
      var xval = item.dataIndex; 
      var yval = item.datapoint[1].toFixed(0);
      var label = item.series.xaxis.ticks[xval].label;
     // console.log(item)
      //if(item.datapoint.length==2) var txt='%'; else var txt=' defects';
      var txt=''
      return `${yval}${txt}`;
    });
  }

  // stack graph
$.dui.page.chart.stack = function(rowcol,elid){   
    var stack = $.dui.page.dostack(rowcol); 
   // console.log('stack:',stack)
    var opts = {
      grid: {hoverable: true,background:'#EEEEEE'}, 
      legend:{show:false, noColumns:12, container:$('#legend')}, 
      xaxis:{tickDecimals:0,ticks:stack.ticks}, 
      series:{bars: {show: true,barWidth: 0.9, align:"center"}, stack:false}, 
      yaxis:{tickDecimals:0}
    };
    
    //console.log('stack opts:',opts)
    // plot stack & custom tooltip.
    $.dui.page.flot.stack = $.dui.page.fplot(elid,stack.bars,opts,function(item){
     // console.log('chart/stack:',item)
      var xval = item.dataIndex; 
      var yval = item.datapoint[1].toFixed(0);
      var label = item.series.xaxis.ticks[xval].label;
      return yval;
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
    var horiz =$('#horiz').numberbox('getValue');
    var charts =$('#charts').combobox('getValue');

    if (charts=="e1"){
      var sqlid="vwltsa^resource_efficiency";
      var cols=[{field:'RESOURCE_ID',title:'Resource ID',width:80},{field:'SUM_EST',title:'Estimated',width:30},{field:'SUM_ACT',title:'Actual',width:30},{field:'PCT',title:'%',width:40,formatter:function(value,row,index){ if (row.SUM_ACT==0) return '-'; else return ((row.SUM_EST/row.SUM_ACT)*100).toFixed(0)}}]
    } 
    else {
      var sqlid="vwltsa^resource_effectiveness";
      var cols=[{field:'RESOURCE_ID',title:'Resource ID',width:80},{field:'GOOD_QTY',title:'Good Qty',width:30},{field:'BAD_QTY',title:'Bad Qty',width:30},{field:'PCT',title:'%',width:40,formatter:function(value,row,index){ if ((row.GOOD_QTY+row.BAD_QTY)==0) return '-'; else return ((row.GOOD_QTY/(row.GOOD_QTY+row.BAD_QTY))*100).toFixed(0)}}]
    }
    var vars ={_func:'get',_sqlid:`${sqlid}`,horiz:`${horiz}`,resources:`${res}`,'_dgrid':'y'};
    
    ajaxget('/',vars,function(data){
      $.dui.page.data=data;
        $.dui.page.datagrid(data,cols)
        
    })
}


// main datagrid
$.dui.page.datagrid = function(data,cols){  
    var rows = clone(data.rows);
    $('#westdg').datagrid({
      singleSelect:true,
      fit:true,
      columns: [cols],
      data: rows,
      fitColumns:true,
      onSelect:$.dui.page.dgall_sel,
      onLoadSuccess:function(){    
        $(this).datagrid('selectRow',0);
      }
    })

  } 

// on-select of date range & view
$.dui.page.dgall_sel = function(idx,row){  
    var charts = $('#charts').combobox('getValue');
    $.dui.page.chart.global(charts,$.dui.page.data,'swest')

}

$.dui.page.ready = function(){
    $('#mainlo > .panel > .panel-header .panel-tool').append( $('#ncatbar'));
    $('#charts').combobox('select','e1');
}

$.page.ready(function () {
  $('#resources').multibox({
      onSelect:function(nv,ov){
          $.dui.page.getdata()
      },
  })
  $('#horiz').numberbox({
      onChange:function(){
          $.dui.page.getdata()
      }
  })
  setTimeout(function(){
      $.dui.page.ready();
      $.dui.page.getdata()
  },100)
    

  $('#charts').combobox({
    editable:false,
    panelHeight:'auto',
    data:[{text:'Resource Efficiency',value:'e1'},{text:'Resource Effectiveness',value:'e2'}],
    onSelect:function(rec){

        var res=$('#resources').multibox();
        var horiz=$('#horiz').numberbox();
        ajaxget("/",{_func:'get',_sqlid:'admin^bhave',appid:'vwltsa^status^resources_charts'},function(bhave){
          if (rec.value=="e1") {
            res.multibox('setValue',bhave.EFFICIENCY_RES);
            horiz.numberbox('setValue',bhave.EFFICIENCY_HORIZ);
            $.dui.page.color.EFFICIENCY_PCT_1=bhave.EFFICIENCY_PCT_1 || 85;
            $.dui.page.color.EFFICIENCY_PCT_2=bhave.EFFICIENCY_PCT_2 || 65; 
            $.dui.page.color.EFFICIENCY_COLOR_1=bhave.EFFICIENCY_COLOR_1 || "green";
            $.dui.page.color.EFFICIENCY_COLOR_2=bhave.EFFICIENCY_COLOR_2 || "orange";
            $.dui.page.color.EFFICIENCY_COLOR_3=bhave.EFFICIENCY_COLOR_3 || "red";

            
          }
          else {
            res.multibox('setValue',bhave.EFFECTIVENESS_RES);
            horiz.numberbox('setValue',bhave.EFFECTIVENESS_HORIZ);
            $.dui.page.color.EFFECTIVENESS_PCT_1=bhave.EFFECTIVENESS_PCT_1 ||85;
            $.dui.page.color.EFFECTIVENESS_PCT_2=bhave.EFFECTIVENESS_PCT_2 ||65;
            $.dui.page.color.EFFECTIVENESS_COLOR_1=bhave.EFFECTIVENESS_COLOR_1 || "green";
            $.dui.page.color.EFFECTIVENESS_COLOR_2=bhave.EFFECTIVENESS_COLOR_2 || "orange";
            $.dui.page.color.EFFECTIVENESS_COLOR_3=bhave.EFFECTIVENESS_COLOR_3 || "red";
          } 
          $.dui.page.getdata();
        })
 
    }
  })

})