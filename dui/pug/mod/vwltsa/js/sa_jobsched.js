$.page.ready(function () {

// Weekend Overlay
$.page.fn.wendol = function(){
  setTimeout(function(){
    var days    = $('th[data-field="sched"] span');
    var pct     = 100/days.length;
    days.each(function(i){
      var me = $(this);
      if(me.hasClass('dow-6') || me.hasClass('dow-0')){
        me.addClass("wkend");
      }
    });
  })
}

$.page.fn.data = $.page.fn.data || {
  sqlid : 'vwltsa^sa_jobsched'
};

$.dui.bhave.showMaxrun = $.dui.bhave.showMaxrun || 'y';


// show/hide row based on filter combos
$.page.fn.shrow = function(){
  var dg = $('#jsched');
  var dr = dg.datagrid('getRows');
  var filterBy = $.dui.bhave.filterBy || 'USER_1';
  var stats = [];
  var cus = $('#cuscbo').combobox('getValue');
  var woc = $('#woccbo').combobox('getValue');
  var fil = $('#filtercbo').combobox('getValue');
  var norm = function(v){ return (v == null ? '' : String(v)).trim().toUpperCase(); };
  var isAll = function(v){ return norm(v) === '**ALL**'; };
  var gridRows = dg.find('tbody > tr').filter(function(){ return this._rowData; });

  for(var r = 0; r < dr.length; r++){
    var row = gridRows.filter(function(){ return this._rowIndex === r; });
    if (isAll(cus)){
      if (isAll(woc)){
        if (isAll(fil)) row.show();
        else {
         if(norm(dr[r][filterBy])==norm(fil)) row.show();
         else row.hide();
        }
      }
      else {
        if(norm(dr[r].wo_class)==norm(woc)){
          if (isAll(fil)) row.show();
          else {
          if(norm(dr[r][filterBy])==norm(fil)) row.show();
          else row.hide();
          }
        }
        else row.hide();
      }
    }
    else{
      if(norm(dr[r].custid)==norm(cus) || norm(dr[r].custname)==norm(cus)){
        if (isAll(woc)){
          if (isAll(fil)) row.show();
          else {
           if(norm(dr[r][filterBy])==norm(fil)) row.show();
           else row.hide();
          }
        }
        else {
          if(norm(dr[r].wo_class)==norm(woc)){
            if (isAll(fil)) row.show();
            else {
            if(norm(dr[r][filterBy])==norm(fil)) row.show();
            else row.hide();
            }
          }
          else row.hide();
        }
      }
      else row.hide();
    }
    if(row.filter(':visible').length) stats.push(dr[r]);
  }
  $.page.fn.stats(stats);
}

// catch excessive runtimes
$.page.fn.maxrun = function(){
  if($.dui.bhave.showMaxrun != 'y') return;
  ajaxget('/',{_func:'get',_sqlid:'vwltsa^opn_runtimes'},function(maxruns){
    maxruns.map(function(e){
      $('div.ibar[data-wor="'+e.WOREF+'"]').addClass('maxrun');
    })
  })
}

$.page.fn.sethms = function(date,hms){
  date.setHours(hms[0]);date.setMinutes(hms[1]);date.setSeconds(hms[2]);
  return date;
}

// seconds to yyyy-mm-dd
$.page.fn.sec2date = function(secs,obj){
  if (secs=="-") return "-";
  var d = new Date();
  d.setTime(secs * 1000);
  if(obj) return d;
  return myDate(d);
}

// db times are in UTC, browser is + 8
$.page.fn.mnite = function(sec){
  var d = new Date()
  var gmt = -d.getTimezoneOffset()/60;
  return sec - (gmt * 60 * 60);
}

// want-date arrow
$.page.fn.arrow = function(val,row,idx){
  var range = $('#jsched').data('range');
  var wdate = new Date($.page.fn.sec2date(row.wdate));

  if(!row.opns) row.opns = [];
  var lasts = {sdate:row.sdate*1,edate:''}, ops='';

  // loop the operations
  row.opns.map(function(e,i){
    if(!e.sdate) e.sdate = lasts.sdate;
    var bar = $.page.fn.barpct(e.sdate,e.edate);

    if(new Date(wdate) < new Date(bar.edate)) var cls = 'bg-red'; else var cls = 'bg-grn';

    lasts = {sdate:bar.sdate,edate:bar.edate};
    if(e.hrs < 1) var hrs = (e.hrs*60+'m'); else var hrs = e.hrs.toFixed(1)+'h'; var title = e.RESOURCE_ID+' ( '+hrs+' )';

    var style = 'left:'+bar.startp+'%;width:'+bar.durnp+'%;';

    var pctc = 100-((e.qbal/e.qreq)*100);
    if(pctc > 0) {
      cls += ' bar-status';
      style += 'background-size:'+pctc+'% 100%;';
    }

    var wor = (row.woref+'^0^'+e.seq);
    if(parseInt(row.priority) < 100 ) cls += ' prio';

    ops+= '<div data-wor="'+wor+'" title="'+title+'" style="'+style+'" class="ibar '+cls+'">&nbsp;'+e.seq+'</div>';
   })

  var reqd = (((range.days.indexOf($.page.fn.sec2date(row.wdate))+0.33) * range.pctday)).toFixed(3);
  if(reqd >= 100) return ops+'<div title="'+wdate+'" class="arrow-right" style="left:99%"></div>';
  else if(reqd > 0) return ops+'<div title="'+wdate+'" class="arrow-up" style="left:'+reqd+'%"></div>';
  else return ops+'<div title="'+wdate+'" class="arrow-left" style="left:0px;"></div>';
}

$.page.fn.barpct = function(sdate,edate){
  var range = $('#jsched').data('range');

  // fix operations outside the horizon
  if(sdate < range.start) sdate = range.start;
  if(edate < range.start) edate = range.start;
  else if(edate > range.end) edate = range.end;

  var sd = $.page.fn.sec2date(sdate);
  var ed = $.page.fn.sec2date(edate);
  var si = range.days.indexOf(sd);
  var startp =  si * range.pctday;
  var ei = range.days.indexOf(ed);
  var durnp = ((ei-si)+1) * range.pctday;
  return {'sdate':sd,'edate':ed,'durnp':durnp,'startp':startp}
}


// schedule bar styler
$.page.fn.barwidth = function(val,row,idx){
  var bar = $.page.fn.barpct(row.sdate,row.edate);
  return {class:'bar'};
}

$.page.fn.range = function(){
  $.dui.bhave.horizon = $.dui.bhave.horizon || 30;
  var range = {cal:'', days:[], horiz:$.dui.bhave.horizon, dow:['s','m','t','w','t','f','s']};
  var now = new Date();
  now = $.page.fn.sethms(now,[0,0,0]);
  range.start = parseInt(now.getTime().toString()/1000);
  range.pctday = (100/range.horiz).toFixed(3);
  range.secs = 86400 * range.horiz;
  range.pctsec = 100 / range.secs;

  $.page.fn._colwidth = 33;
  $.page.fn._width = range.horiz * $.page.fn._colwidth;

  var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  for (i=0; i < range.horiz; i++) {
    var dom = now.getDate();
    var dow = now.getDay();
    var mon = months[now.getMonth()];
    if(dom==1) dom=mon;
    range.cal += '<span style="width:'+$.page.fn._colwidth+'px" class="dow-'+dow+'">'+dom+'&nbsp;</span>';
    range.days.push(isodate(now,true));
    now.setDate(now.getDate()+1);
  }
  range.end = parseInt($.page.fn.sethms(now,[23,59,59]).getTime().toString()/1000);
  range.pctd = (range.end - range.start) / range.horiz;
  return range;
}

// calculate Stats
$.page.fn.stats = function(rows){
  var tot=0, due=0, odue=0, now=new Date();
  rows.map(function(e){
    tot++; if($.page.fn.sec2date(e.wdate,true) < now) odue++; else due++;
  })
  $('#job_tot').val(tot);
  $('#job_due').val(due);
  $('#job_odue').val(odue);
}

// set datagrid row height
$.page.fn.rowhi = function(me,height){
  var dg = $('#jsched');
  var row = me.closest('tr');
  if(height && height > 0) row.animate({height:height},{ duration:500, queue:false})
  else row.css('height','auto');
}


// Dynamic UDF field labels from pdata (applied to DOM headers)
$.page.fn.fc = function(){
  if(!$.dui.pdata || !$.dui.pdata.udfid) return;
  for(var d in $.dui.pdata.udfid){
    var val = $.dui.pdata.udfid[d];
    if (d.indexOf('UDF_')==0 && val !=='') {
      var field = d.replace('UDF_','USER_');
      $('th[data-field="'+field+'"]').text(val.replace('*',''));
    }
  }
}


// show-hide overlapping operations on bar click
$(document).off('click', 'td[data-field="sched"]').on('click', 'td[data-field="sched"]', function(e) {
  var me = $(this);
  var ops = me.find('.ibar');
  var hi = me.innerHeight();
  var mar = 2;

  if(ops.length > 0) ops.each(function(){
    $(this).addClass('bg-blu');
    var cos = $(this).position();
    var prev = $(this).prev('.ibar');
    if(prev.length > 0){
      var pos = prev.position(), phi = prev.outerHeight();
      var pbot = pos.top+phi+mar;
      if(pos.left == cos.left) $(this).css({top:pbot+'px'});
      var cbot = $(this).position().top + $(this).outerHeight();
      if(cbot > hi) hi = cbot;
    }
  })

  if(hi > me.innerHeight()) $.page.fn.rowhi(me,hi);

}).off('mouseleave', 'td[data-field="sched"]').on('mouseleave', 'td[data-field="sched"]', function() {
  $.page.fn.rowhi($(this));
  $('.ibar').css({top:0}).removeClass('bg-blu');
})


// ##### READY #####

  // Context menu — DaisyUI positioned menu
  $('#opnmenu').data('src', null);

  // Right-click on datagrid rows → show context menu
  $('#jsched').closest('.overflow-auto').on('contextmenu', 'tbody tr', function(e){
    e.preventDefault();
    var row = $(this);
    var idx = row.index();
    var data = $('#jsched').datagrid('getRows')[idx];
    if(!data) return;
    $('#opnmenu').data('src', data.woref).css({
      display: 'block',
      left: e.pageX + 'px',
      top: e.pageY + 'px'
    });
  });

  // Context menu item click
  $('#opnmenu').on('click', 'a[data-name]', function(e){
    e.preventDefault();
    var name = $(this).data('name');
    var src = $('#opnmenu').data('src');
    $('#opnmenu').css('display','none');
    switch(name){
      case "open": newtab('vwltsa^sa_jobman&WOREF='+src); break;
    }
  });

  // Dismiss context menu on click outside
  $(document).on('click', function(e){
    if(!$(e.target).closest('#opnmenu').length) {
      $('#opnmenu').css('display','none');
    }
  });

  // Scroll arrows
  $('#fwd, #bak').on('click', function(){
    var dir = $(this).attr('id');
    var colw = $.page.fn._colwidth || 33;
    var view = $('#jsched').closest('.overflow-auto');
    if(dir=='fwd') var pos = view.scrollLeft()+colw; else var pos = view.scrollLeft()-colw;
    view.animate({scrollLeft:pos},500);
  });

  // Excel export
  $('#dg2excel').on('click', function(){
    $('#jsched').datagrid('toExcel');
  });

  // Compute range and sched column width
  var range = $.page.fn.range();
  $('#jsched').data('range', range);

  // Set dynamic sched column width in DOM (mixin rendered default 990px from JSON)
  $('th[data-field="sched"]').css('width', $.page.fn._width + 'px');

  // Apply dynamic UDF field labels from pdata
  $.page.fn.fc();

  // Init datagrid with callbacks (columns come from JSON, formatters registered below)
  $('#jsched').datagrid({
    url:'/',
    queryParams:{
      _func   : 'get',
      _sqlid  : $.page.fn.data.sqlid
    },

    onRowContextMenu: function(e,i,row){
      e.preventDefault();
      $('#opnmenu').data('src', row.woref).css({
        display: 'block',
        left: e.pageX + 'px',
        top: e.pageY + 'px'
      });
    },

    onBeforeSelect: function(){return false;},

    onBeforeLoad:function(qp){
      var range = $(this).data('range');
      $('th[data-field="sched"]').html(range.cal);
    },

    onLoadSuccess: function(data){
      var filterBy = $.dui.bhave.filterBy || 'USER_1';
      var wocdat = [{'text':'**ALL**','value':'**ALL**','selected':true}];
      var cusdat = [{'text':'**ALL**','value':'**ALL**','selected':true}];
      var filterdat = [{'text':'**ALL**','value':'**ALL**','selected':true}];
      for(var d in data.rows){
        cbodata(cusdat,data.rows[d].custid);
        cbodata(wocdat,data.rows[d].wo_class);
        cbodata(filterdat,data.rows[d][filterBy]);
      }

      $.page.fn.stats(data.rows);

      $('#cuscbo').combobox({
        data:keysort(cusdat,'value'),
        onSelect:function(rec){
          $.page.fn.shrow();
        },
        onChange:function(){
          $.page.fn.shrow();
        }
      })

      $('#woccbo').combobox({
        data:keysort(wocdat,'value'),
        onSelect:function(rec){
          $.page.fn.shrow();
        },
        onChange:function(){
          $.page.fn.shrow();
        }
      })

      $('#filtercbo').combobox({
        data:keysort(filterdat,'value'),
        onSelect:function(rec){
          $.page.fn.shrow();
        },
        onChange:function(){
          $.page.fn.shrow();
        }
      })

      $.page.fn.maxrun();
      $.page.fn.wendol();

      // Apply priority cell styling (styler equivalent — plugin doesn't apply styler callbacks)
      $('#jsched tbody tr').each(function(){
        var row = this._rowData;
        if(row && parseInt(row.priority) < 100){
          $(this).find('td[data-field="priority"]').addClass('bg-ora');
        }
      });
    }
  });

  // Register formatters on datagrid state (mixin renders columns, JS adds behavior)
  var state = $.data($('#jsched')[0], 'datagrid');
  if(state) {
    state._formatters = state._formatters || {};
    state._formatters['sched'] = $.page.fn.arrow;
    state._formatters['priority'] = function(val){
      if(parseInt(val) < 100) return val; else return '-';
    };
    state._formatters['wdate'] = function(val){ return $.page.fn.sec2date(val); };
    state._formatters['sdate'] = function(val){ return $.page.fn.sec2date(val); };
    state._formatters['edate'] = function(val){ return $.page.fn.sec2date(val); };
  }

  // Trigger data load (DUI plugin does not auto-load on init)
  $('#jsched').datagrid('load');

}) // end $.page.ready
