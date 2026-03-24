/*

  PAC 171108 - 2.2.1441
  1. Modified attachments to include attached part files.
  2. show the appdoc field.

  PAC 180523 - 3.13
  1. Fixed sqlid & added _func

  DUI Migration — fresh translate from EUI source.
  Namespace: dwap.page → $.page.fn, dwap.pdata → $.dui.pdata, etc.
*/

var cl = console.log;
var pg = $.page.fn;

pg.clsfilt  = $('#clsfilt');
pg.opncls   = $('#opncls');
pg.grl      = $('#grl');
pg.addmenu  = $('#addmenu');
pg.trmenu   = $('#trmenu');
pg.wosel    = $('#wosel');
pg.wotree   = $('.wotree');
pg.addid    = null;
pg.day      = {now:new Date(),then:new Date(2010,0,1),sday:1000*60*60*24,days:function(){return Math.floor(((this.now - this.then)/this.sday))}};
pg.basid    = '';

// Bridge: fragments (wo_bas.inc, wo_seq.inc, wo_sub.inc) define on $.dui.page
// but parent page uses pg ($.page.fn). Expose key refs for fragments.
$.dui.page.wotree = pg.wotree;
$.dui.page.wosel  = pg.wosel;

// PAC 221004 - qbe_job_search
pg.qbe_job_search = function (){
  $('input#woselqbe').qbe({
    queryParams: {
      _sqlid:'vwltsa^basid_qbe',
    },
    onDemand: true,
    valueField: 'BASE_ID',
    fields:[
      {field:'value',title:'Job ID',editor:'textbox'},
      {field:'WO_CLASS',title:'Job Class',editor:{type:'combobox',options:{
        panelHeight: 'auto',
        data:$.dui.pdata.wocid}}},
      {field:'WO_TYPE',title:'Job Type',editor:{type:'combobox',options:{
        panelHeight: 'auto',
        data:[
          {text:'Component Part',value:'COMP'},
          {text:'Make To Stock',value:'FG'},
          {text:'Make To Order - Staged',value:'MAKE_STAGED'},
          {text:'Make To Order - Un-Staged',value:'MAKE_NOSTAGE'}
      ]}}},
      {field:'STATUS',title:'Status',editor:{type:'combobox',options:{
        panelHeight: 'auto',
        data:[
        {value:'R',text:'Released', selected:true},
        {value:'U',text:'Unreleased'},
        {value:'C',text:'Closed'},
        {value:'X',text:'Cancelled'},
      ]}}},
      {field:'CUSTOMER_ID',title:'Customer ID',editor:'textbox'},
      {field:'SALES_ORDER_ID',title:'Sales Order ID',editor:'textbox'},
      {field:'DESIRED_WANT_DATE',title:'Want Date',formatter:$.dui.fmt.date,editor:{type:'datebox',range:true, options:{}}},
      {field:'PART_ID',title:'Our Part ID',editor:'textbox'},
      {field:'USER_1',title:'USER_1',editor:'textbox'},
      {field:'USER_2',title:'USER_2',editor:'textbox'},
      {field:'USER_3',title:'USER_3',editor:'textbox'},
      {field:'USER_4',title:'USER_4',editor:'textbox'},
      {field:'USER_5',title:'USER_5',editor:'textbox'},
      {field:'USER_6',title:'USER_6',editor:'textbox'},
      {field:'USER_7',title:'USER_7',editor:'textbox'},
      {field:'USER_8',title:'USER_8',editor:'textbox'},
      {field:'USER_9',title:'USER_9',editor:'textbox'},
      {field:'USER_10',title:'USER_10',editor:'textbox'},
    ],

    onSelect: function(row){
        pg.reload_wo(row);
    },
    preload:true
  })

  var icon = $("#leftwr > div:nth-child(4) > span > span > a");
  var cbnav = $("#leftwr > div:nth-child(3) > span.nav")
  var nicon = icon.clone(icon);
  nicon.appendTo(cbnav)
  nicon.on('click',function(){icon.click();})
  $('body').addClass('qbe_job_search');
}

// CLS 221004, reload_WO Tree
pg.reload_wo = function(row){
    pg.wosel.combobox('setValue',row.value);
    $('#bastabs').tabs('select',0);

    if (pg.wosel.val()) var value = pg.wosel.val();
    else var value=row.value;

    if(value) var bas = '&BASE_ID='+value.replace(/\\/g, ''); else var bas='';

    pg.wotree.tree({url:'/?_func=get&_sqlid=vwltsa^bastree'+bas});
    pg.wotree.tree('reload');
    $('#bastabs').tabs('enableAll');

    $('#printmen').data('vars',{'base_id':value});

    if(!row) return false;
    pg.fkey = row.value;
    $('#basfiles').datagrid('docFiles',pg.fkey);
}

//CLS 221004, show /hide qbe job search icon
pg.qbe_job_search_bhave = function(){
  pg.qbe_job_search();
    var search=$('body.qbe_job_search a.textbox-icon.icon-search');
    if($.dui.bhave.qbe_job_search=='Y')search.show();
    else search.hide();
}

// PAC 160410 - Before Tree Click Validation
pg.validate = function(tree,node){

  pg.fload = true;
  var sel = tree.tree('getSelected');
  if(sel){
    if(sel.id == node.id) return false;
    if(sel.attributes) {
      var type = {'seq':'Operation','sub':'Sub Item','bas':'Job'}[sel.attributes.type];
      if(sel.attributes.mode) {
        msgbox('Please save '+type+' first.');
        return false;
      }
    }
    else return true;
  }

  return true;
}

// PAC 160404 - Behavior Settings.
pg.dobhave = function(){
  setTimeout(function(){

    var bdat = frm2dic($('form#basf'));
    var sdat = frm2dic($('form#seqf'));

    var dwd=false, svali=$.dui.bhave.schedule_req || 'N';
    if(svali=='Y') {
      $('#RUN').numberspinner('setValidType',{neq:[0]});
      if(bdat.WO_CLASS != 'TEMPLATE') dwd=true;
    }

    $('input[comboname="DESIRED_WANT_DATE"]').datebox('required',dwd)

    // Lead times
    $.dui.bhave.leadtime_ok = $.dui.bhave.leadtime_ok || 'Y';
    var endis='enable'; if($.dui.bhave.leadtime_ok=='N') endis='disable';
    $('#LEAD_TIME').numberspinner(endis);

  })
}
$.dui.page.dobhave = pg.dobhave;


// TODO - PAC 160323A - Add New Job.
var pacdev_bas_add = false;
pg.bas_add = function(wocls){
  var tr = pg.wotree;
  var wo = $('#wosel');
  ajaxget('/',{'_func':"get",'_sqlid':'vwltsa^basnxt','WO_CLASS':wocls},function(res){
    pg.basid = res.NEXT;
    pg.delbase();
    $('#bastabs').tabs('select',0);
    wo.combobox('options').autoload = res.NEXT;

    tr.tree('append',{
      data:{
        "iconCls":'folder',  // semantic key → Lucide 'folder'
        "iconColor":'text-primary',
        "cls":'type-bas',
        'id':res.NEXT+'^0',
        'text':res.NEXT,
        'attributes':{
          'type':'bas',
          'mode':'add',
          'woclass':wocls
        }
      }
    });

    // butEn('sx'); // deprecated — toolbar plugin manages button state
  })
}

// When Print is done.
pg.onprinted = function(pvar){
  pg.printed = true;
  var appid = pvar._xldata;
  if(appid=='vwltsa^sa_jobman^OMS_Traveller'){
    //cl('download attachments ?');
  }
}

// after all is loaded (called by wo_seq.inc.js)
pg.done = function(req){
  if($.dui.doc && $.dui.doc.id=='WOREF'){
    $('#wosel').combobox('select',$.dui.doc.ref);
    delete $.dui.doc;
  }

  // 171108 - show column.
  setTimeout(function(){
    $('#basfiles').datagrid('showColumn','appdoc');
  });
}
$.dui.page.done = pg.done;

// close an operation shortcut
pg.opclose = function(){
  var node = pg.wotree.tree('getSelected');
  if(node.attributes.type=='seq'){
      if (node.attributes.stat=='R'){
        $('form#seqf #STATUS').combobox('select','C');
        $('form#seqf #CLOSE_DATE').textbox('setValue',isodate(new Date()));
      }
      if (node.attributes.stat=='C'){
        $('form#seqf #STATUS').combobox('select','R');
        $('form#seqf #CLOSE_DATE').textbox('setValue','');
      }
    but_save();
  }
}

// fix for tree-scroll
pg.treeht = function(){
  var ht = $('[data-panel="west"]').innerHeight();
  var ul = $('[data-panel="west"] ul.wotree li > ul').first();
  if(ul.length == 0) var ot = 0;
  else var ot = ul.offset().top;
  ul.css({'height':ht-ot+20+'px','overflow-y':'auto'});
}

pg.getnew = function(){
  if(!pg.addid) return pg.wotree.tree('getRoot');
  return pg.wotree.tree('find',pg.addid)
}

pg.wotree.getbas = function() {
  var top = pg.wotree.tree('getRoots');
  if(top.length) return top[0];
  else return '';
}

pg.wosel.val = function(){
  return pg.wosel.combobox('getValue')
};

pg.delbase = function(){
  pg.wotree.tree('remove',pg.wotree.getbas().target);
}

// reset the page
pg.clear = function(){
  uiunlock();
  pg.wosel.combobox('unselect');
  pg.wosel.combobox('clear');
  pg.wotree.tree('loadData',[]);
  $('#content form').form('reset');
  pg.taben(0);
  $('#bastabs').tabs('disableAll',0);
  $('#seqtabs').tabs('select',0);
}

//PAC 190302 - This used to come from $.dui.pdata
pg.wocid = function(cb){
  ajaxget('/',{_sqlid:'vwltsa^woclassid',_func:'get'},function(data){
    $.dui.pdata.wocid=data;
    cb(data);
  })
}

// build add menu + job class checkboxes
pg.jobmenu = function(){
  var cf = $('#clsfilt-items');
  var cook = getacook('vwltsa^sa_jobman^wocls');

  // free version uses userid.
  if($.dui.runmode=='free') var def = $.dui.udata.userid;
  else def = 'DEFAULT';
  if(cook.length==0) cook = [def];

  // Try to find the "Job" menu item for dynamic sub-items
  // menu('findItem') may not be supported in DUI — guard it
  var jt = null;
  try { jt = pg.addmenu.menu('findItem','Job'); } catch(e) { /* menu shim gap */ }

  if(jt) {
    pg.addmenu.menu('appendItem', {'parent':jt.target,'name':'clone','text': 'From Existing','iconCls':'icon-clone'});
    pg.addmenu.menu('appendItem', {'parent':jt.target,separator:true});
  }

  pg.wocid(function(data){

    if($.dui.pdata.wocid.value) $.dui.pdata.wocid=[$.dui.pdata.wocid]; /* PAC 170720 - single records */
    $.each($.dui.pdata.wocid, function(i,val) {
      var el = $(this)[0];
      if(!cook) {var chk = 'checked="checked"';}
      else if( cook.indexOf(el.value) != -1) var chk = 'checked="checked"';
      else var chk = '';
      // Add to menu if findItem was available
      if(jt) pg.addmenu.menu('appendItem', {'parent':jt.target,'name':'bas^'+el.value,'text': el.text,'iconCls': 'aicon-tab_add'});
      // Always add checkboxes — this is critical for data loading
      cf.append('<label class="flex items-center gap-1.5 cursor-pointer text-xs"><input type="checkbox" class="checkbox checkbox-xs" name="'+el.value+'" '+chk+'/><span>'+el.text.substring(0,10)+'</span></label>');
    });

    pg.cook_stat();
    $('#clsfilt-items input').click(function(e){
      pg.apply();
    });

    $('#cloneopt #classid').combobox();
    $('#importopt #woclassid').combobox();
    $('#cloneopt #classid').combobox('loadData',data)
    $('#importopt #woclassid').combobox('loadData',data)
  })
}

// apply filter changes (delayed)
pg.apply = function(){
  pg.wosel.combobox('readonly',true);
  if(pg._tout) clearTimeout(pg._tout);
  pg._tout = setTimeout(function(){
    pg.getwo();
  },800)
}

// get filters
pg.filters = function(){
  var filts = pg.cbox() || {};
  var stats = Array.isArray(filts.stats) ? filts.stats : [];
  var wocls = Array.isArray(filts.wocls) ? filts.wocls : [];
  return {
    _sqlid:'vwltsa^basid_filt',
    _func: 'get',
    STATUS: stats.join('^') || '_',
    WO_CLASS: wocls.join('^') || '_'
  }
}

// Server-side w/o filters
pg.getwo = function(){
  var param = pg.filters();

  ajaxget('/',param,function(data){
    if(!data.error){
      pg.wosel.combobox('loadData',data);
      $('#clsfilt .collapse-title').text('Job Class Filter (' + data.length + ')');
    }
    pg.wosel.combobox('readonly',false);
  })
}

// set status button from cookie.
pg.cook_stat = function(){
  var stats = getcook('vwltsa^sa_jobman^wostats') || ['R','U'];
  $('#selfilt button.stat-toggle').each(function(){
    if(stats.indexOf($(this).attr('name')) !=-1) $(this).trigger('click');
  })
}

// get check-box filters
pg.cbox = function(){
  var clsfilt = $('#clsfilt-items input'), stafilt= $('#selfilt input');
  if(clsfilt.length == 0) return {stats:[],wocls:[]}; // not ready yet.
  var stcls = [], stats = [], wocls = [];

  $.each($('#selfilt button.stat-toggle'), function(key,val) {
    if($(this).hasClass('btn-active')) {
      var name = $(this).attr('name');
      stats.push(name);
      if(name!='X' && name!='C') stcls.push(name);
    }
  });

  // 160410 - Don't save Closed & Canceled
  putacook('vwltsa^sa_jobman^wostats',stcls);

  $.each(clsfilt, function(key,val) {if($(this).prop('checked')) wocls.push($(this).attr('name'));});
  putacook('vwltsa^sa_jobman^wocls',wocls);

  return {'stats':stats,'wocls':wocls};
}

pg.taben = function(tid){
  var panels = ['wo_bas_inc','wo_sub_inc','wo_seq_inc'];
  for(var t=0; t<3; t++) {
    var el = document.getElementById(panels[t]);
    el.style.display = (t === tid) ? 'flex' : 'none';
  }
}

//clone a base ID
pg.clone = function(){
  var frm = $('#cloneopt form');
  $('#cloneopt').dialog('close');
  var fdat = frm2dic(frm);
	ajaxget('/',{'_sqlid':'vwltsa^clonejob','_func':'get','woclass':fdat.woclass,'BASE_ID':fdat.baseid,'nextno':'y','altpart':$.dui.bhave.altpart,'altres':$.dui.bhave.altres},function(data){
	   if(data.job) {
		   loadpage('vwltsa^sa_jobman&WOREF='+data.job.BASE_ID);
	   }
  });
}

// add a node to the tree
pg.tradd = function(atype,woclass){
  var aok = {}
  aok.types = ['bas','sub','seq'];
  aok.tr = pg.wotree;
  aok.woclass = woclass;
  aok.atype = atype;

  // PAC160115 - Disallow changes if COC / Completed.
  if(aok.stype!='bas'){
    var type, fdat = frm2dic($('form#basf'));
    if($.dui.bhave.allowNewOpIfCompletedQtyMoreThanZero=='N' && fdat.COMPLETED_QTY > 0) type='Complete';
    if($.dui.bhave.allowNewOpIfCOCQtyMoreThanZero=='N' && fdat.COC_QTY > 0) {if(type) type+=' or COC'; else type='COC';}
    if(type) return msgbox('Cannot add new operation when qty '+type+' is greater than 0.');
  }

  //determine what and where to add
  if(aok.atype == 'bas') aok.par = '';

  else {
    aok.top = aok.tr.tree('getRoots')[0];
    if(!aok.top) return;

    // selected
    aok.sel = aok.tr.tree('getSelected');
    aok.stype = aok.sel.attributes.type;

    if(atype == 'seqin' && aok.stype == 'seq') {

      var bits = aok.sel.id.split('^');
      var seq = bits[bits.length-1];
      aok.above = seq;
      aok.atype = 'seq';

      // PAC 160319 - can we insert here ?
      aok.prvi = parseInt(seq)-1;
      bits[bits.length-1] = aok.prvi;
      aok.prev = bits.join('^');
      if(aok.prvi < 1 || aok.tr.tree('find',aok.prev)) return msgbox('Cannot insert operation here.');

    }

    var bid = aok.sel.id.split('^')[0]; // 30001^0 = 3001

    switch(aok.stype){  // selected node

      case "bas":
        aok.par = aok.sel;
        if(aok.atype=="sub") aok.woref = bid;
        if(aok.atype=="seq") aok.woref = bid+'^0';
        break;

      case "sub":
        if(aok.atype=="sub") {
          aok.par = aok.top;
          aok.woref = bid;
        }
        if(aok.atype=="seq") {
          aok.par = aok.sel;
          aok.woref = aok.sel.id;
        }
        break;

      case "seq":
        if(aok.atype=="sub") {
          aok.par = aok.top;
          aok.woref = bid;
        }

        if(aok.atype=="seq") {

          aok.par = aok.tr.tree('getParent',aok.sel.target);
          if(aok.par.attributes.type == 'bas') aok.woref = bid+'^0';
          else aok.woref = aok.par.id;
        }
        break;
    }
  }

  aok.frm = $('form#'+aok.atype+'f');

  // get next number based on woref from previous.
  // requires: aok.woref, aok.par, aok.atype
  aok.avar = {_func:"get",_sqlid:'vwltsa^'+aok.atype+'nxt',WOREF:aok.woref};
  if(aok.above) aok.avar.above = aok.above;
  if(aok.woclass) aok.avar.WO_CLASS = aok.woclass;

  ajaxget('/',aok.avar,function(next){

    if(aok.atype == 'bas') aok.woref = next.NEXT+'^0'; else aok.woref += '^'+ next.NEXT;

    var im = _iconMap[{'seq':'seq-U'}[aok.atype] || aok.atype] || {};
    aok.add = {
      "iconCls": im.icon || aok.atype,
      "iconColor": im.color || '',
      "cls": 'type-' + aok.atype,
      'id':aok.woref,
      'text':next.NEXT,
      attributes:{
        'type':aok.atype,
        'mode':'add',
        'woclass':aok.woclass
      }
    };

    // if base then clear the tree
    if(aok.atype == 'bas') {
      pg.delbase();
      if(aok.tr.tree('getData')) aok.tr.tree('insert',{before:aok.top.target,data:aok.add});
      else aok.tr.tree('append',{data:aok.add});
      $('#bastabs').tabs('select',0);
    }

    else {
      if(atype == 'seqin' && aok.stype == 'seq') aok.tr.tree('insert', {before: aok.sel.target,data:aok.add});
      else { aok.tr.tree('append', {parent: aok.par.target,data:aok.add});}
      $('#seqtabs').tabs('select',0);

    }

    aok.foc = aok.tr.tree('setFocus',aok.woref);
    aok.frm.attr('mode','add');
    $('.tabs-selected.lock, .tabs-selected.lock > a').removeClass('lock');
  })
}

// ADD button callback
pg.addok = function(frm,data){
  pg.tradd();
}

//Load the forms
pg.dotclick = function(node){
  pg._loaded = false;
  var oc = {"tabs":['bas','sub','seq'],"frm":$('#'+node.attributes.type+'f'),"mode":node.attributes.mode||'upd',"type":node.attributes.type}
  oc.frm.form('reset');
  oc.wob = node.id.split('^');
  oc.woclass = node.attributes.woclass;

  if(oc.type == 'bas') oc.woref = oc.wob[0]; else oc.woref = node.id;

  if(oc.mode == 'add') {
    var data = {"WO_CLASS":oc.woclass,"BASE_ID":oc.wob[0],"WORKORDER_BASE_ID":oc.wob[0],"SUB_ID":oc.wob[1],"WORKORDER_SUB_ID":oc.wob[1],"SEQUENCE_NO":oc.wob[2]};
    oc.frm.form('load',data);
    oc.frm.attr('mode','add');

    // PAC 160319 - set NEW op stat same as head.
    if(oc.type == 'seq') {
      var bstat = $('#WO_STATUS').combobox('getValue');
      $('form#seqf #STATUS').combobox('select',bstat);
    }
  }

  else {
    oc.frm.form('load',`/?_func=get&WOREF=${oc.woref}&_sqlid=vwltsa^${node.attributes.type}`);
    oc.frm.attr('mode','upd');
  }

  pg.taben(oc.tabs.indexOf(node.attributes.type));

  /* ### PAC TEST CODE ## */
  setTimeout(function(){
    cl('@@ temporary fix on tree-click.');
    butEn('dsxn','trclik');
  },1000);
  oc = null;
}

pg.subpart = function(subid,partid){
  // detect if sub 0 or not.
  if(isNaN(subid)) var max = 22 - subid.length;
  else var max = 15 - subid.length;
  if(partid.length > max) var pid = partid.substr(0,max)+'...'; else var pid=partid;
  return '<span>'+subid+'</span><span class="partid" title="'+partid+'">'+pid+'</span>';
}

// JOB Import.
pg.import = function(){
  var frm = $('#importopt form');
  $('#importopt').dialog('close');
  var fdat = frm2dic(frm);
  $('#filewin').window('open');
  $('form#fileup #uldesc').textbox('setValue','*.job file import.').textbox('readonly',true);
  $('form#fileup').data('vars',{
    'woclass'   :fdat.woclass,
    'nextno'    :fdat.nextno,
    'altpart'   :$.dui.bhave.altpart,
    'altres'    :$.dui.bhave.altres,
    '_sqlid'    :'vwltsa^importjob_json',
    '_func'     :'add'
  })
}

// 151104 - Template Enable / Disables.
pg.istemp = function(){
  var fdat = frm2dic($('form#basf'));
  var tf=false; if(fdat.WO_CLASS=='TEMPLATE') var tf=true;
  $('#WO_STATUS').combobox('readonly',tf);
  $('#STATUS').combobox('readonly',tf);
  $('input[comboname=DESIRED_WANT_DATE]').combobox('readonly',tf);
  $('input[comboname=DESIRED_RLS_DATE]').combobox('readonly',tf);
  $('#PRIORITY').numberspinner('readonly',tf);
}

// PAC 151219 -  dynamically load tab onselect (not used)
pg.dyntab = function(type){
  var tabwr = $('#wo_'+type+'_inc');
  if(!tabwr.html()) {
    tabwr.addClass('opacity-0');
    tabwr.panel('refresh','/?_page=vwltsa^wo_'+type+'_inc');
    tabwr.removeClass('opacity-0').addClass('opacity-100 transition-opacity duration-500');
  }
}

//CLS 170220, Add sub leg
pg.addsubleg = function(){
  var frm = $('#addsub form');
  $('#addsub').dialog('close');

  var frm1 = frm2dic(frm);
  var fdat = frm2dic($('form#basf'));

  if (!fdat.BASE_ID){
    return msgbox('Target Job cannot be blank.');
  }
  else {
      if (fdat.STATUS=='R'){
        ajaxget('/',{'_sqlid':'vwltsa^addSubLeg','_func':'add','woclass':fdat.woclass,'BASE_ID':frm1.TEMPLATE_JOB,'JOB_ID':fdat.BASE_ID,'nextno':'n','altpart':$.dui.bhave.altpart,'altres':$.dui.bhave.altres},function(data){
         if(data.job) {
           loadpage('vwltsa^sa_jobman&WOREF='+data.job.BASE_ID);
         }
      });
      }
      else return msgbox('Target Job MUST in RELEASED status.');

  }

}

// ## DOM IS READY ##
$.page.ready(function(){

  // tree-scroll height on resize
  $('[data-panel="west"]').on('resize', pg.treeht);

  toolbut([
    {
      id:'job_clone',
      iconCls: 'icon-clone',
      text: 'Job Clone',
      disabled: false,
      noText: true,
      onClick: function(){
        $('#cloneopt').dialog('open');
      }
    } ,{
      id:'add_subleg',
      iconCls: 'icon-org',
      text: 'Import Sub Assy',
      disabled: false,
      noText: true,
      onClick: function(){
        $('#addsub').dialog('open');
      }
    },{
      id:'job_export',
      iconCls: 'icon-download',
      text: 'Job Export',
      disabled: true,
      noText: true,
      onClick: function(){
        var fdat = frm2dic($('form#basf'));
        var BASE_ID = fdat.BASE_ID;
        if(!BASE_ID) return false;
        window.location = '?_sqlid=vwltsa^exportjob&_func=get&BASE_ID='+BASE_ID+'&_dload=y&_fname='+BASE_ID+'.job';
      }
    },{
      id:'job_import',
      iconCls: 'icon-upload',
      text: 'Job Import',
      disabled: false,
      noText: true,
      onClick: function(e){
        if(!$.dui.onUploaded) $.dui.onUploaded = function(res){
          if(res.job) loadpage('vwltsa^sa_jobman&WOREF='+res.job.BASE_ID);
        }
        $('#importopt form').form('clear');
        $('#importopt').dialog('open');
        $('#imp_next').prop('disabled', true);
      }

    },{},{
      id:'print_trav',
      iconCls: 'icon-barcode',
      text: 'Print Traveller',
      disabled: false,
      noText: true,
      onClick: function(){
        var rptid='vwltsa^sa_jobman^PURETRV';
        if($.dui.runmode=='free') rptid='vwltsa^sa_jobman^dispuretrv'
        printmen({id:rptid})
      }
    },{},{
      id:'ncr_open',
      iconCls: 'icon-flag_red',
      text: 'Open NCR',
      disabled: true,
      noText: true
    },{}
  ]);

  // Status toggle buttons — toggle btn-active class on click, then re-filter
  $('#selfilt button.stat-toggle').on('click', function(){
    $(this).toggleClass('btn-active');
    pg.apply();
  });

  // Check all COMBOS are selected in import dialog.
  $('#importopt .combobox').combobox({
    onSelect: function(){
      var fdat = frm2dic($('#importopt form'));
      var ok = true;
      for(var i in fdat){ if(fdat[i]=='') ok = false; }
      $('#imp_next').prop('disabled', !ok);
    }
  })

  /* ### PAC TEST CODE 170302 ### */
  if($.isdev) $('#but_del').on('beforeClick',function(e){
    cl('Long-term fix - This is where I will check & return false to prevent delete.');
    return true;
  })

  $('#but_clr').on('click', pg.clear);

  // PAC 151219 - dynamically load the bas, sub and seq panels.
  var _pnlCount = 0;
  function _pnlLoaded(){ if(++_pnlCount === 3) { pg.taben(0); } }
  setTimeout(function(){
    $('#wo_bas_inc').panel({onLoad:_pnlLoaded}).panel('refresh','/?_page=vwltsa^_wo_bas_inc');
    $('#wo_sub_inc').panel({onLoad:_pnlLoaded}).panel('refresh','/?_page=vwltsa^_wo_sub_inc');
    $('#wo_seq_inc').panel({onLoad:_pnlLoaded}).panel('refresh','/?_page=vwltsa^_wo_seq_inc');
  })

  // after bas,seq or sub form submit()
  $(document).off('done','#content form').on('done','#content form',function(me,mode){

    // PAC 160409 - changeonly spec fields.
    $(this).find('input.changed').removeClass('changed');

    var fdat = frm2dic($(this));
    var sok = {};
    sok.tr = pg.wotree;
    sok.sel = pg.wotree.tree('getSelected');
    sok.woref = sok.sel.id;
    sok.sel.attributes.mode = '';
    sok.bas = sok.woref.split('^')[0];
    sok.type = sok.sel.attributes.type;

    function delok(){
      if(sok.type=='bas') reload();
      else sok.tr.tree('reload');
    }

    function saveok(frm){
      // butEn('dsn','saveok'); // deprecated — toolbar plugin manages button state

      if(sok.type=='sub') {
        var ttel = $(sok.sel.target).find('span.tree-title');
        ttel.html( pg.subpart(ttel.text(),fdat.PART_ID) );
      }

      else if(sok.type=='bas') {

        // PAC 151021 - Doug Email Fix
        $('#bastabs').tabs('enableAll');

        // PAC 160319 - Update for File Uploads.
        pg.fkey = sok.bas;
        $('#basfiles').datagrid('docFiles',pg.fkey)

        pg.wosel.combobox('setValue',sok.bas);
        pg.addid = sok.sel.id + '^10';

      }

      else pg.addid = sok.sel.id;
      pg.dotclick(sok.sel);
      uiunlock();
      sok = null;
    }

    if(mode=="del") delok($(this));
    else if(mode=="add") saveok($(this));

    // PAC 160410 - Reload Opn Tree when Header Changes.
    else if(sok.type=='bas'){
      $('#wosel').combobox('reselect');
    };

  });

  // job class collapse — toggle triggers tree height recalc
  pg.clsfilt.on('transitionend', pg.treeht);

  // 161020 - Create Gauge Rental Line — button handler
  $('#grl button[name="savegrl"]').on('click', function(){
    var opn={};
    var seqf=frm2dic($('#seqf'));
    var grlf=frm2dic($('#grl form'));
    opn._sqlid = "vwltsa^opngrl";
    opn._func = "add";
    opn.RENTAL_ID=grlf.RENTAL_ID;
    opn.WOREF=seqf.WOREF;
    ajaxget('/',opn,function(res){
      pg.grl.dialog('close');
      if(res.error) return cl(res.msg);
      msgbox('OP# '+opn.WOREF+' was added into Gauge Rental '+opn.RENTAL_ID+' .');
    });
  });

  // 151103 - Create Operation Class — button handler
  $('#opncls button[name="saveoc"]').on('click', function(){
    var opn = $.extend(frm2dic($('#seqf')),frm2dic($('#opncls form')))
    opn._sqlid = "vwltsa^seqcls";
    opn._func = "add";
    ajaxget('/',opn,function(res){
      pg.opncls.dialog('close');
      if(res.error) return cl(res.msg);
      msgbox('OP#'+opn.SEQUENCE_NO+' saved as '+opn.WORKORDER_BASE_ID+' template.');
    });
  });

  // right-click on tree
  pg.trmenu.menu({
    onClick: function(item){
      if(item.name=='close') pg.opclose();
      else if(item.name=='opcls') pg.opncls.dialog('open');
      else if(item.name=='seqin') pg.tradd('seqin');
      else if(item.name=='grl') pg.grl.dialog('open');
    },
    onShow:function(){
      var me  = $(this);
      var grl = me.menu('findItem', 'Insert into Gauge Rental Line');
      if ($.dui.udata.groups.indexOf('OPN-GRL')==-1)me.menu('disableItem',grl.target)
    }
  })

  // Main Add-Menu
  pg.addmenu.menu({
    onClick: function(item){
      if(!item.name) return false;

      // PAC - 150606 - Default Dates & Enable Main Tab.
      $('#bastabs').tabs('enableTab',0);
      $('#bastabs .today').datebox({value:$.fn.datebox.defaults.formatter(new Date())});

      // 151105 - Is this a Template ?
      pg.istemp();

      var bits = item.name.split('^');

      // PAC 160323D - Test Code for Add Job.
      if(pacdev_bas_add && bits[0]=='bas') return pg.bas_add(bits[1]);

      if(bits[0] == 'clone') $('#cloneopt').dialog('open');

      else if(bits.length == 2) pg.tradd(bits[0],bits[1]);
      else pg.tradd(bits[0]);
    },

    onShow:function(){
      var me  = $(this);
      var os = {me:$(this),mode:'disableItem'}
      if(pg.wotree.getbas()) os.mode='enableItem';

      os.sub = me.menu('findItem', 'Sub Assy').target;
      os.opn = me.menu('findItem', 'Operation').target;
      me.menu(os.mode,[os.opn,os.sub]);
    }
  });

  // Main W/O Combo
  pg.wosel.combobox({
    groupField: 'woclass',
    panelWidth: 228,
    formatter: cbocols,
    widths:['50%','50%'],
    selectOnNavigation:true,
    data:$.dui.pdata.basid || [],

    onSelect:function(rec){
      // Guard: skip if form is loading (form-plugin sets BASE_ID which re-triggers this)
      if($('#basf').form('options').loading) return;
      $('#bastabs').tabs('select',0);

      if (pg.wosel.val()) var value = pg.wosel.val();
      else var value=rec.value;

      if(value) var bas = '&BASE_ID='+value.replace(/\\/g, ''); else var bas='';

        pg.wotree.tree({url:'/?_func=get&_sqlid=vwltsa^bastree'+bas});
        pg.wotree.tree('reload');
        $('#bastabs').tabs('enableAll');
        $('#printmen').data('vars',{'base_id':value});
        // File Attachments
        if(!rec) return false;
        pg.fkey = rec.value;
        $('#basfiles').datagrid('docFiles',pg.fkey);
    },

    onResize: function(){
    },

  	groupFormatter: function(group){
  		return group;
  	},

    onLoadSuccess: function(data){
      if($.dui.runmode=='free'){
        if(data.length==1){
          setTimeout(function(){
            pg.wosel.combobox('select',data[0].value);
          },500);
        }
      }
    }

  }).combobox('sticky');

  // W/O TREE — icon mapping: server iconCls → Lucide icon + DaisyUI color
  var _iconMap = {
    'bas':   { icon: 'folder',         color: 'text-primary' },
    'sub':   { icon: 'network',        color: 'text-secondary' },
    'tree-folder sub': { icon: 'network', color: 'text-secondary' },
    'seq':   { icon: 'wrench',         color: '' },
    'seq-U': { icon: 'lock',           color: 'text-warning' },
    'seq-C': { icon: 'circle-check',   color: 'text-success' },
    'seq-X': { icon: 'x-circle',       color: 'text-error' }
  };

  pg.wotree.tree({
    dnd:true,
    checkbox:false,
    lines:false,

    loadFilter: function(data, parent) {
      // Remap iconCls to Lucide names, add iconColor + cls for CSS ::before prefixes
      function remap(nodes) {
        if (!nodes) return nodes;
        for (var i = 0; i < nodes.length; i++) {
          var n = nodes[i];
          var m = _iconMap[n.iconCls];
          if (m) {
            n.iconCls = m.icon;
            if (m.color) n.iconColor = m.color;
          }
          // Add type class on li for CSS ::before prefixes (SEQ:/SUB:)
          var type = n.attributes && n.attributes.type;
          if (type) n.cls = (n.cls ? n.cls + ' ' : '') + 'type-' + type;
          if (n.children) remap(n.children);
        }
        return nodes;
      }
      return remap(Array.isArray(data) ? data : (data.rows || data));
    },

    formatter: function(node){
      if(node.attributes.type =='seq') {
        var pct = node.pct_comp || 0;
        var barCls = pct >= 100 ? 'bar complete' : 'bar';
        var spans = '<span class="'+barCls+'" style="--pct:'+pct+'%">'+node.text+'</span>';

        // Operation parts indicator
        if(node.attributes.opnparts && typeof(node.attributes.opnparts)=='object') {
          if (node.attributes.opnparts.required) {
            if (node.attributes.opnparts.toIssue==0)
              spans += '<span data-lucide="package-check" class="w-3.5 h-3.5 text-success inline-block icon-bold" title="Parts complete"></span>';
            else
              spans += '<span data-lucide="package" class="w-3.5 h-3.5 text-warning inline-block icon-bold" title="Parts required"></span>';
          }
        }

        // NCR flags
        if(node.attributes.ncrs && typeof(node.attributes.ncrs)=='object') {
          node.attributes.ncrs.map(function(e){
            if(e.id) {
              if(e.open)
                spans += '<span data-lucide="triangle-alert" class="w-3.5 h-3.5 text-error inline-block icon-bold" title="'+e.id+'"></span>';
              else
                spans += '<span data-lucide="check-circle" class="w-3.5 h-3.5 text-success inline-block icon-bold" title="'+e.id+' (closed)"></span>';
            }
          })
        }

        return spans;
      }
      else if(node.attributes.partid){
        return pg.subpart(node.text,node.attributes.partid);
      }

      else return node.text;
    },

    onLoadSuccess:function(node,tdat){
      var sel = $(this).tree('getSelected');
      if(!sel) {
        var base = pg.wotree.getbas();
        if(base) pg.wotree.tree('select',base.target);
      }
      pg.treeht();
    },

    onBeforeSelect: function(node){
      return pg.validate($(this),node);
    },

    onSelect:function(node){
      pg.dotclick(node);
    },

    onContextMenu: function(e, node){
      e.preventDefault();
      if(node.attributes.type=='seq') {
        pg.wotree.tree('select',node.target);
        pg.trmenu.menu('show',{left: e.pageX,top: e.pageY});
      }
    }
  });


  // push to stack-bottom;
  setTimeout(function(){

    // Clone dialog — init QBE on first open
    $('#cloneopt').on('open', function(){
      if(pg._qbeinit) return;
      $('#baseid').qbe({defid:'job'});
      pg._qbeinit = true;
    });

    // Import Sub Assy dialog — reload template jobs on open
    $('#addsub').on('open', function(){
      $('#TEMPLATE_JOB').combobox('reload','/?_sqlid=vwltsa^templatejobs&_func=get');
    })

    // Gauge Rental dialog — reload rental IDs on open
    $('#grl').on('open', function(){
      $('#RENTAL_ID').combobox('reload','/?_sqlid=dqm^rent_ids&_func=get');
    })

    // CLS 221005 - qbe_job_search
    pg.qbe_job_search_bhave();
  })

  // Clone button in dialog
  $('#cloneopt button[data-action="clone"]').on('click', pg.clone);

  // Import Next button
  $('#imp_next').on('click', pg.import);

  // Add Sub Assy button in dialog
  $('#addsub button[data-action="addsubleg"]').on('click', pg.addsubleg);

  pg.jobmenu();
  pg.apply();

})
