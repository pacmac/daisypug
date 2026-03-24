/*
  PAC 171218-23 2.2.334 → DUI Migration 2026-03-02
  Job Planner — Gantt-style scheduling board.

  Namespace: dwap.page.* → $.page.fn.*
  Behaviour: dwap.bhave.* → $.dui.bhave.*
  Production paths only (temp=false branches removed).
*/

Number.prototype.round = function(places) {return +(Math.round(this + "e+" + places) + "e-" + places);}

if($.dui.bhave.planplus == '1') {
  $('#crumbs').html('<span class="fg-red">Advanced</span> Planner');
  $.dui.bhave.ddon = false;
}

$.dui.bhave.showMaxrun = $.dui.bhave.showMaxrun || 'y';

$.page.fn.getridx = function(resid){return objidx($('#jplandg').datagrid('getData').rows,'rid',resid)}

$.page.fn.getrow = function(src){
  var tr = $(src).closest('tr')[0];
  if(!tr || tr._rowIndex == null) return null;
  return $('#jplandg').datagrid('getData').rows[tr._rowIndex];
}

$.page.fn.cleanup = function(){
  $('td .datagrid-cell ul.ulbar:empty').remove();
}

$.page.fn.focusfix = function(){
  // DUI: single table — just reset heights so rows auto-size
  $('#jplandg tbody tr').each(function(){
    $(this).css('height','');
    $(this).find('td[data-field="unp"]').css('height','');
  });
}

$.page.fn.noblanks = function(opres){
  var dg = $('#jplandg');
  var rows = dg.datagrid('getRows'), dels=[];
  rows.map(function(e,i){if(opres.indexOf(e.rid)==-1) dels.push(i)});
  dels.reverse().map(function(e){dg.datagrid('deleteRow',e);});
  $('td .datagrid-cell ul.ulbar:empty').remove();
}

$.page.fn.getcol = function(ymd){return $.page.fn._colMap ? $.page.fn._colMap[ymd] : null}

$.page.fn.durn = function(hrs,dcap,wcap,ldays){
  if(ldays) var dur = ldays.toFixed(1) + ' dlt';
  else if(!hrs || hrs==0) var dur = '0h';
  else dur = hrs.round(2)+'h';
  return dur;
}

$.page.fn.resshow = function(resid){
  var rows = $('#jplandg tbody tr');
  if(resid=='ALL') return rows.show();
  var idx = $.page.fn.getridx(resid);
  rows.hide();
  rows.filter(function(){ return this._rowIndex === idx }).show();
}

$.page.fn.bgcolour = function(el,col){
  el.removeClass (function (index, className) {
      return (className.match (/(^|\s)bg-\S+/g) || []).join(' ');
  }).addClass(col);
}

$.page.fn.maxruns = function(){
  if($.dui.bhave.showMaxrun != 'y') return;
  ajaxget('/',{_func:'get',_sqlid:'vwltsa^opn_runtimes'},function(maxruns){
    maxruns.map(function(e){
      $.dui.bhave.max_col = $.dui.bhave.max_col || 'bg-brn';
      var el = $('.ulbar > li[data-wor="'+e.WOREF+'"]');
      el.addClass('maxrun');
      $.page.fn.bgcolour(el,$.dui.bhave.max_col);
    })
  })
}

$.page.fn.jobshow = function(bas){
  if(bas=='ALL') {
    $('div.datagrid-cell').removeClass('capdis');
    $('ul.ulbar li').show();
    $('#jplandg tbody tr').show();
    $.page.fn.fixheight();
    return;
  }

  $('#jplandg tbody tr').show();
  $('div.datagrid-cell').addClass('capdis');
  $('ul.ulbar li').hide();
  var ops = $('ul.ulbar li[data-wor^='+bas+']').show();
  var shows = {}; ops.each(function(){
   var idx = $(this).closest('tr')[0]._rowIndex;
   shows[idx] = true;
  })

  $('#jplandg tbody tr').each(function(){
    if(!shows[this._rowIndex]) $(this).hide();
  })
}

$.page.fn.clear = function(resid){
  if(resid && resid != 'ALL'){
    var idx = $.page.fn.getridx(resid);
    var tds = $('#jplandg tbody tr').filter(function(){ return this._rowIndex === idx }).find('td');
  } else var tds = $('#jplandg tbody td');
  tds.removeClass('capex capmax').find('ul.ulbar:not(.ultot)').empty();
}

$.page.fn.getload = function(resid,url){
  $.page.fn.loading(true);
  setTimeout(function(){
    ajaxget(url,{},function(ops){
      if(ops.error) return $.page.fn.loading(false);
      if(resid=='apply') alert(ops.msg);
      else {
        $.page.fn.clear(resid);
        $.page.fn.load(ops);
      }
      $.page.fn.loading(false);
    })
  });
}

$.page.fn.loading = function(show){
  var dg = $('#jplandg');
  dg.datagrid('options').loadMsg = 'Please Wait...';

  if(show) {
    dg.datagrid('loading');
    setTimeout(function(){
      try{ dg.datagrid('loaded');} catch(err){}
    },15000);
  }
  else dg.datagrid('loaded');
}

$.page.fn.hover = function(tgt){
  if(!$(tgt).data('wor')) return;
  var sel = 'ul.ulbar li[data-wor="'+$(tgt).data('wor')+'"]';
  $(tgt).hover(
    function() {$(sel).addClass('hover');},
    function() {$(sel).removeClass('hover');}
  )
}

$.page.fn.dgrid = function(cols,data){
  // Merge frozen columns + dynamic date columns into single array
  var frozen = [
    {field:"rid",title:"Resource ID",width:100,fixed:true},
    {field:"active",hidden:true},
    {field:"units",title:"Units",width:50,fixed:true,align:'center'},
    {field:"class",title:"Class",width:50,hidden:true},
    {field:"desc",title:"Description",width:50,hidden:true},
    {field:"unp",title:"Unplanned Jobs",width:132,fixed:true,formatter:function(val,row,idx){
      return '<ul class="ulbar ultot"/><ul class="ulbar unp" style="max-height:25px;overflow:auto;height:inherit;" />';
    }},
  ];
  var dateCols = (cols && cols[0]) ? cols[0] : [];
  var allCols = frozen.concat(dateCols);

  // Store column map for getcol() lookups
  $.page.fn._colMap = {};
  dateCols.forEach(function(c){ $.page.fn._colMap[c.field] = c; });

  $('#jplandg').datagrid({
    method:'GET',
    fit:true,
    striped:false,
    columns: [allCols],
    onBeforeSelect:function(){return false;},
    onLoadSuccess:function(){
      $.page.fn.getload('ALL','/?_func=get&_sqlid=vwltsa^jp&resid=ALL');
    }
  });

  // renderColumns (via reload) then load local data
  $('#jplandg').datagrid('reload');
  $('#jplandg').datagrid('loadData', data);
}

$.page.fn.active = function(){
  $.page.fn.data.active.map(function(e){
    var pct = parseInt((e.COMPLETED_QTY / e.CALC_END_QTY)*100);
    if(pct > 100) pct = 100;
    var act = $('.ulbar > li[data-wor="'+e.WOREF+'"]');
    act.removeClass($.dui.bhave.pln_col).addClass('active '+$.dui.bhave.act_col).css({'backgroundSize':pct+'% 100%'});
  })
}

$.page.fn.uldata = function(trp,uls){
  var tds = trp.find('td[data-field]');
  tds.each(function(){
    var td = $(this);
    var day = td.attr('data-field');
    var cell = td.find('div.datagrid-cell');
    var cls = uls[day];
    td.removeClass('capoff capor');
    cell.removeClass('capex capmax');

    if(cls){
      if(cls.td) td.addClass(cls.td);
      if(cls.ce) cell.addClass(cls.ce);
      if(cls.td=='capor') {
        var txt = cls.capor.units+' units * '+cls.capor.hrs+'hrs';
        if(cls.capor.note) txt += ' ('+cls.capor.note+')'
        td.attr('title',txt);
        td.addClass($.dui.bhave.cor_col);
        td.tooltip({
          position:'right',
          trackMouse: true
        });
      }
    }
  })
}

$.page.fn.nozeros = function(wor){
  if($.dui.bhave.nozeros!=1) return wor;
  var bits = wor.split('.');
  bits[0] = bits[0].replace(/^0+/,'');
  return bits.join('.');
}

$.page.fn.fixheight = function(){
  $.page.fn.jpdg.datagrid('fixRowHeight');
  $('[data-field=unp] .datagrid-cell').each(function(){
    $(this).height(($(this).closest('tr').height()-4)+'px')
  });
  $('.ulbar.unp').css('max-height','');
}

$.page.fn.load = function(resops){
  var opres=[], optot = 0, worcbo=$('#worcbo'), wordat=[];

  var dg = $('#jplandg');

  function min2hrs(mins){return pad(parseInt(mins/60),2)+':'+pad((mins%60),2)}

  for(var r in resops){
    var resid = r;
    var ridx = $.page.fn.getridx(resid);
    if(resops[r].plan.length > 0) opres.push(resid);
    var trp = $('#jplandg tbody tr').filter(function(){ return this._rowIndex === ridx; });
    var tru = trp; // DUI: single table — frozen and scrollable in same row
    var res = $.page.fn.getrow(trp);

    if(!res) continue;

    // set TD & CELL classes
    var uls = resops[r].uldata;
    $.page.fn.uldata(trp,uls);

    // planned & unplanned operations
    var pops = resops[r].plan;

    for(var o in pops){
      var opn = pops[o];

      // Unplanned needs {wor,hrs,wcap,ldays,prio}
      if(opn.mode=='uplan'){
        var ul = tru.find('td[data-field="unp"] div.datagrid-cell ul.ulbar:not(.ultot)');
        var lit = tru.find('td[data-field="unp"] div.datagrid-cell ul.ultot li.litot');

        // add a total header
        if(lit.length==0) {
          lit = $('<li class="litot bold center whtgry" style="background-size:100%;"/>');
          tru.find('td[data-field="unp"] div.datagrid-cell ul.ultot').append(lit);
          lit.data('total',0);
        }

        lit.data('total',lit.data('total')+1);
        lit.text('Total: '+lit.data('total'))

        var txt = opn.wor.split('^').join('.');
        try{var durn = $.page.fn.durn(opn.hrs,res.wcap/7,res.wcap, opn.ldays);}
        catch(err){cl(opn)};
        var clsid = 'uplan '+$.dui.bhave.unp_col;
        if(opn.prio && opn.prio < 100) {
          durn += ' P'+opn.prio;
          clsid += ' prio';
        }
        var li = $('<li>').text(txt).attr({'data-wor':opn.wor,'data-hrs':opn.hrs,'data-durn':durn,'class':clsid});
        li.tooltip({'position':'left','deltaX':8,'content':li.data('durn')});
        ul.append(li);
      }

      else {
        optot ++;
        var chis = opn.chi;
        var idx = 0;

        for(var c in chis){
          var hrs = chis[c];
          var bits = c.split('-'), ymd = bits[0], ysq = bits[1];
          var cell = trp.find('td[data-field='+ymd+'] div.datagrid-cell');

          opn.resi = opn.resi || 0;
          var ul = cell.children('ul.ulbar.u'+opn.resi);

          var txt = opn.wor.split('^').join('.');
          var col = $.page.fn.getcol(ymd);
          if(col) {
            if('capor' in res && ymd in res.capor){
              var dcap = res.capor[ymd].hrs;
            }
            else var dcap = res.dcap[col.dow];
          }
          var durn = $.page.fn.durn(hrs,dcap,res.wcap, opn.ldays);
          var clsid='';
          if(opn.prio && opn.prio < 100) {
            durn += ' P'+opn.prio;
            clsid = 'prio';
          }
          if(opn.lock) clsid += ' slock';

          // planner +
          if(opn.slots !==undefined){
            var chk=0;
            opn.slots.map(function(e){
              if(ymd=='20'+e.ymd) {
                if(chk==0) opn.stime = min2hrs(e.beg);
                opn.etime = min2hrs(e.end);
                chk++;
              }
            })
            durn = '#'+(opn.resi+1)+' '+opn.stime+' > '+opn.etime;
            if(opn.grpop) {
              clsid += ' group';
              durn += ' G';
            }
          }

          var li = $('<li>').text($.page.fn.nozeros(txt)).attr({'data-wor':opn.wor,'data-hrs':hrs,'data-durn':durn,'class':clsid});
          li.tooltip({'position':'left','deltaX':8,'content':li.data('durn')});
          if(idx == 0) li.addClass('parop'); else li.addClass('days');
          if(opn.ldays > 0) li.addClass($.dui.bhave.flt_col);
          else li.addClass($.dui.bhave.pln_col);
          $.page.fn.hover(li);
          ul.append(li);
          idx++;
        }
      }

      var bas = opn.wor.split('^')[0];
      var idx = objidx(wordat,'value',bas);
      if(idx==-1) wordat.push({'text':bas,'value':bas});
    } // for-ops
  } // for-res

  $.page.fn.noblanks(opres);

  $.each($('ul.ulbar.unp'),function(){
    var height = $(this).closest('tr').height();
    $(this).css('max-height',(height-4)+'px');
  });

  // right-click menu
  $('ul.ulbar li').on('contextmenu', function(e){
    e.preventDefault();
    var opn = $(this);
    if(opn.hasClass('days')) return;
    var $menu = $('#opnmenu');
    $menu.data('src', opn);
    $menu.css({ left: e.pageX, top: e.pageY, display: 'block' });
    // onShow logic — enable/disable items based on source state
    if($.page.fn.planplus) {
      var $lock = $menu.find('a[data-name="lock"]').parent();
      var $unlock = $menu.find('a[data-name="unlock"]').parent();
      if(opn.hasClass('slock')) {
        $lock.addClass('opacity-40 pointer-events-none');
        $unlock.removeClass('opacity-40 pointer-events-none');
      } else {
        $lock.removeClass('opacity-40 pointer-events-none');
        $unlock.addClass('opacity-40 pointer-events-none');
      }
    } else {
      var disabled = opn.hasClass('uplan') || opn.hasClass('active');
      $menu.find('a[data-name="up"],a[data-name="down"],a[data-name="uplan"],a[data-name="aplan"]').each(function(){
        if(disabled) $(this).parent().addClass('opacity-40 pointer-events-none');
        else $(this).parent().removeClass('opacity-40 pointer-events-none');
      });
    }
  });

  // wo combo-load
  wordat = keysort(wordat,'value');
  wordat.unshift({'text':'ALL','value':'ALL','selected':true})
  worcbo.combobox('loadData',wordat);

  $('ul.ulbar li.parop.focus').removeClass('focus');
  $('li[data-wor="'+$.page.fn.focwor+'"].parop').addClass('focus');

  // get active jobs
  $.page.fn.active();

  // catch any excessive runtimes
  $.page.fn.maxruns();

  // Estimated apply time
  $.page.fn.msup = optot * parseInt($.dui.bhave.msup);

  // Do this last
  setTimeout(function(){
    $.page.fn.cleanup();
    if($.dui.bhave.ddon=='1') $.page.fn.ddrop()
    $.page.fn.fixheight();
  });
}

$.page.fn.ddrop = function(){

  $('ul.ulbar li.parop, ul.ulbar li.uplan').not('.active').draggable({
    revert:false,

    proxy:function(src){
      var prox = $('<div id="_ddprox_"></div>').appendTo('body');
      prox.html($(src).html()).attr('class', $(src).attr('class')).attr('style', $(src).attr('style'));
      prox.addClass('prox ' + $.dui.bhave.col_pln);
      return prox;
    },

    onBeforeDrag: function(e){
      if(e.which == 3) return false;
      if(! $.page.fn.ddconfirm) confirm(function(yn){
        if(!yn) return false;
        else $.page.fn.ddconfirm = true;
      },'This will disable auto-scheduling.')
    },

    onStartDrag: function(e){
      $.page.fn.ddsrc = e.target;
    },

    onStopDrag: function(e){
      $($.page.fn.ddsrc).removeAttr('style');
    }

  });

  // droppable
  $('#jplandg tbody tr td[data-field]').droppable({

    onDragOver: function (e,src){
      var tgt = e.target;
      var td = $(src).closest('td.droppable');
      if(td[0] == tgt && td.attr('data-field') != 'bar') {
        $(src).draggable('options').revert = true;
        return false;
      }
    },

    onDragLeave: function(e,src){
      var tgt = e.target;
      $(tgt).removeClass('over');
    },

    onDragEnter: function(e,src){
      var tgt = e.target;

      if($(src).closest('td.droppable')[0] == e.target) {
        $(src).draggable('options').revert = false;
      }
      else {
        $(src).draggable('options').revert = false;
        $(tgt).addClass('over');
      }
    },

    onDrop: function(e,src){
      $('td.droppable.over').removeClass('over');
      var tgt = e.target;
      if($(src).draggable('options').revert == true) return false;
      var mode = 'hor';
      $.page.fn.domove(src,mode,tgt);
    }
  });
}

$.page.fn.domove = function (src,mode,tgt){

  function go(){
    $('ul li[data-wor="'+swor+'"]').remove();
    var data = {'_sqlid':'vwltsa^jp_move','_func':'upd','rdate':rdate,'swor':swor,'resid':srow.rid,'mode':mode,'dresid':drow.rid};
    ajaxget('/',data,function(ops){
      $.page.fn.getload('ALL','/?_func=get&_sqlid=vwltsa^jp&resid=ALL');
    });
  }

  var srow = $.page.fn.getrow(src);
  var drow = $.page.fn.getrow(tgt);

  var swor = $(src).attr('data-wor');
  $.page.fn.focwor = swor;
  if(!tgt) var tgt = src.closest('td[data-field]');
  var rdate = $(tgt).attr('data-field');

  if(srow.rid != drow.rid) {
    var mode = 'resmv';
    confirm(function(yn){
      if(!yn) return false;
      else go();
    },'Move this operation to '+drow.rid+' ?')
  }

  else {
    if($(src).hasClass('uplan')) var mode = 'add';
    go();
  }
}

$.page.fn.cols = function(cfg) {

  function ulf(val,row,idx){
    var ulx = [];
    for (var idx = 0; idx < row.units; idx++){
      ulx.push('<ul class="ulbar u'+idx+'"></ul>')
    }
    return ulx.join('');
  }

  var cols = [], date = isodate(cfg.sdate), i=0, ymd=0;
  while(ymd != cfg.edate){
    var now = $.page.fn.addDays(i,date);
    ymd = now.yymmdd
    var title = now.day+' '+now.dmon;
    var col = {
      'dow'     : now.dow,
      'date'    : now.date,
      'off'     : now.off,
      'field'   : ymd,
      'title'   : `<span class="dow_${now.dow}">${title}</span>`,
      'width'   : 110,
      'fixed'   : true,
      'formatter': ulf
    };
    cols.push(col);
    i++;
  }
  return [cols];
}

$.page.fn.addDays = function(days,date) {
  var dow = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var moy = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  if(date) var now = new Date(date); else var now = new Date();
  now.setDate(date.getDate() + days);
  var off = false;
  if(now.getDay() == 0 || now.getDay() == 6) off = true;
  return {'day':dow[now.getDay()],'dow':now.getDay(),'off':off,'date':now,'yymmdd':(now.getFullYear()).toString()+pad(now.getMonth()+1,2).toString()+pad(now.getDate(),2).toString(),'dmon':(now.getDate())+' '+moy[now.getMonth()]};
}

$.page.fn.aplan = function(data){
  var rescbo=$('#rescbo');
  var resdat = [{'text':'ALL','value':'ALL','selected':true}];
  for(var d in data){
    var rid = data[d].rid;
    resdat.push({'text':rid,'value':rid});
  }
  rescbo.combobox('loadData',resdat);
}

$.page.fn.getstats = function(data){
  $.page.fn.stats             = data.config.stats;
  $.page.fn.stats.sdate       = iso2str(data.config.sdate);
  $.page.fn.stats.edate       = iso2str(data.config.edate);
  $.page.fn.stats.planned     = data.config.stats.plan.planned || 0;
  $.page.fn.stats.unplanned   = data.config.stats.plan.unplanned || 0;
  $.page.fn.stats.partial     = data.config.stats.plan.partial || 0;
  if($.page.fn.stats.plan.warn) msgbox($.page.fn.stats.plan.warn);
}

$.page.fn.check = function(data){
  data.rows.map(function(row,i){
    //if(row.units < 1) msgbox('WARNING - '+row.rid+' has no units.');
  })
}

$.page.fn.init = function(){
  var param = {_sqlid:'vwltsa^jp_blank',_func:'get'};
  ajaxget('/',param,function(data){
    data.inactive = []; var active=[];
    data.rows.map(function(e){if(e.active) active.push(e); else data.inactive.push(e)})
    data.rows = active;

    $.page.fn.data = data;
    $.page.fn.aplan(data.rows);
    $.page.fn.dgrid($.page.fn.cols(data.config),data.rows);
    $.page.fn.getstats(data);
    $.page.fn.check(data);
  })
}

$.page.fn.hilite = function(base){
  var wors = $("ul.ulbar li[data-wor^='"+base+"']");
  var olds = $('ul.ulbar li.jfocus');
  olds.removeClass('jfocus');
  if(olds.length && olds.first().attr('data-wor').split('^')[0]==base) return
  wors.addClass('jfocus');
}

$.page.fn.doprio = function(me){
  var dir = $(this).attr('id').split('_')[1];
  var dg = $('#priodg');
  var row = dg.datagrid('getSelected');
  if(dir=='up' && row.PRIORITY > 1) var pri = row.PRIORITY -1;
  else if(dir=='dn' && row.PRIORITY < 101) var pri = row.PRIORITY +1;
  if(dir=='reset') var pvar = {'_sqlid':'vwltsa^pri_reset','_func':'get'};
  else var pvar = {'_sqlid':'vwltsa^basprio','_func':'upd','BASE_ID':row.BASE_ID, 'PRIORITY':pri};
  ajaxget('/',pvar,function(res){
    $('#priodg').datagrid('reload');
  })
}


// ##### READY #####
$.page.ready(function() {

  $.page.fn.jpdg = $('#jplandg');

  if($.dui.bhave.fscreen=='y') nomenu();
  $.page.fn.data = {};
  $.page.fn.horiz = parseInt($.dui.bhave.horiz) * 7 || 14;
  $.page.fn.init();

  // Scroll day columns forward/back
  $('#fwd, #bak').on('click', function(){
    var dir = $(this).attr('id');
    var dayw = $('#jplandg thead th[data-field]:first').outerWidth();
    var view = $('#jplandg').closest('.overflow-auto');
    if(dir=='fwd') var pos = view.scrollLeft()+dayw; else var pos=view.scrollLeft()-dayw;
    view.animate({scrollLeft:pos},500);
  })

  // Planner Stats tooltip
  $('#stats').tooltip({
    onShow:function(e){
      var opt = [
        {text:'Last Run',value: myTime(new Date($.page.fn.stats.plan.stamp))},
        {text:'Start Date',value: $.page.fn.stats.sdate},
        {text:'End Date',value: $.page.fn.stats.edate},
        {text:'Total Jobs',value: $.page.fn.stats.plan.jobtot},
        {text:'Total Opns',value: $.page.fn.stats.plan.opstot},
        {text:'Apply Msec',value: $.page.fn.stats.apply.durn || '-'}
      ]

      var ul = $('<ul id="ulstats" />');
      opt.map(function(e){
        ul.append('<li><span>'+e.text+'</span>'+e.value+'</li>');
      })

      $(this).tooltip('update',ul).tooltip('reposition');
    }
  })

  // Priorities button
  $('#propen').on('click', function(){$('#priowin').window('open')})

  // Priority window
  $('#priowin').window({
    minimizable: false,
    draggable: false,
    modal:false,
    onOpen: function(){
      var left = $(window).width() -550;
      $(this).window('move',{left:left,top:100});
      $('#priodg').datagrid('load','/?_func=get&_sqlid=vwltsa^basprio&dgrid=y');
    }
  })

  // Priority datagrid
  $('#priodg').datagrid({
    singleSelect: true,
    checkOnSelect: true,
    remoteSort: false,
    striped: true,
    method: 'get',
    xurl: '/?_func=get&_sqlid=vwltsa^basprio&dgrid=y',
    fit:true,
    fitColumns: false,

    onSelect: function(){
      $('#dg_up, #dg_dn, #dg_reset, #dg_hilite, #dg_view').linkbutton('enable');
    },

    columns: [[
      {field:'_CK',title:'S', width:50,checkbox:true,fixed:true},
      {field:'PRIORITY',title:'PRI',with:60,sortable:true,styler:function(val){
        if(val < 100) return 'color:#08C'; return val;
      }},
      {field:'BASE_ID',title:'Job ID',with:150,sortable:true},
      {field:'PART_ID',title:'Part ID',with:60,sortable:true, hidden:true},
      {field:'DESIRED_RLS_DATE',title:'Rels Date',with:80,sortable:true, hidden:true},
      {field:'DESIRED_WANT_DATE',title:'Want Date',with:80,sortable:true},
      {field:'SCHED_START_DATE',title:'Start date',with:80,sortable:true},
      {field:'SCHED_FINISH_DATE',title:'End Date',with:80,sortable:true},
      {field:'DESIRED_QTY',title:'Qty',with:60}
    ]],

      toolbar: [{
        id:'dg_up',
        text: 'Up',
        iconCls: 'icon-up',
        disabled: true,
        handler: $.page.fn.doprio
      },{
        id: 'dg_dn',
        text: 'Down',
        iconCls: 'icon-down',
        disabled: true,
        handler: $.page.fn.doprio
      },'-',{
        id: 'dg_reset',
        text: 'Reset All',
        iconCls: 'icon-reset',
        disabled: false,
        handler: $.page.fn.doprio
      },'-',{
        id: 'dg_hilite',
        text: 'Highlight',
        iconCls: 'aicon-lightbulb',
        disabled: true,
        handler: function(){
          var row = $('#priodg').datagrid('getSelected');
          $.page.fn.hilite(row.BASE_ID);
        }
      },{
        id: 'dg_view',
        text: 'View',
        iconCls: 'icon-view',
        disabled: true,
        handler: function(){
          var row = $('#priodg').datagrid('getSelected');
          var link = '/#vwltsa^sa_jobman&WOREF='+row.BASE_ID;
          linkwin(link);
        }
      },{
        id: 'dg_focus',
        text: 'Focus',
        iconCls: 'icon-focus',
        disabled: true,
        handler: function(){
          var row = $('#priodg').datagrid('getSelected');
          $('#worcbo').combobox('select',row.BASE_ID);
        }
      }
    ]
  })

  // RESET PRIORITIES
  $('a#preset').linkbutton({
    onClick:function(){
      var me = $(this);
      confirm(function(yn){
        if(yn){
          me.linkbutton('disable');
          ajaxget('/',{_func:'get',_sqlid:'vwltsa^pri_reset'},function(res){
            alert(res.msg)
            me.linkbutton('disable');
          });
        }
      })
    }
  })

  // Context menu — click handler (delegated)
  $('#opnmenu').on('click', 'a[data-name]', function(e){
    e.preventDefault();
    var $menu = $('#opnmenu');
    var src = $menu.data('src');
    var name = $(this).data('name');
    var wor = src.data('wor');
    $menu.hide();
    $.page.fn.focwor = wor;
    switch(name){
      case "open":
        var link = '/#vwltsa^sa_jobman&WOREF='+wor.split('^')[0];
        linkwin(link);
        break;

      case "up": case "down":
        $.page.fn.domove(src,name);
        break;

      case "uplan":
        var resid = $.page.fn.getrow(src).rid;
        var url = '/?_func=upd&_sqlid=vwltsa^jp_clear&resid='+resid+'&woref='+wor;
        $.page.fn.getload(resid,url);
        break;

      case "aplan":
        break;

      case "focus":
        $('#worcbo').combobox('select',wor.split('^')[0]);
        break;

      case "hilite":
        var base = wor.split('^')[0];
        $.page.fn.hilite(base);
        break;

      case "lock":
        var param = {_sqlid:'vwltsa^jp_lock',_func:'upd','woref':wor};
        ajaxget('/',param,function(res){
          $('#jplandg tbody tr li[data-wor="'+src.data('wor')+'"]').addClass('slock');
          alert(res.msg);
        })
        break;

      case "unlock":
        var param = {_sqlid:'vwltsa^jp_unlock',_func:'upd','woref':wor};
        ajaxget('/',param,function(res){
          $('#jplandg tbody tr li[data-wor="'+src.data('wor')+'"]').removeClass('slock');
          alert(res.msg);
        })
        break;
    }
  });

  // Dismiss context menu on click outside
  $(document).on('click', function(e){
    if(!$(e.target).closest('#opnmenu').length) $('#opnmenu').hide();
  })

  // Apply plan to Operations
  $('#apply').on('click', function(){
    var url = '/?_func=upd&_sqlid=vwltsa^jp_apply';
    $.page.fn.getload('apply',url);
  })

  // Plan ALL
  $('#jplan').on('click', function(){
    var url = '/?_func=upd&_sqlid=vwltsa^jp_jplan&basid=ALL';
    $.page.fn.getload('ALL',url);
  })

  // Un-Plan ALL
  $('#uplan').on('click', function(){
    var url = '/?_func=upd&_sqlid=vwltsa^jp_clear&resid=ALL';
    $.page.fn.getload('ALL',url);
  })

  // Resource & Job combos
  $('#rescbo, #worcbo').combobox({
    onSelect:function(rec){
      $.page.fn.resshow(rec.value);
    }
  })

  $('#worcbo').combobox({
    onSelect:function(rec){
      $.page.fn.jobshow(rec.value);
      $.page.fn.jpdg.datagrid('fixRowHeight');
      $.page.fn.focusfix();
    }
  })

});
