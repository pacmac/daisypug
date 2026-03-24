// seq.inc callback
$.dui.page.done = function(){}

$('#wocid').combobox({
  editable: false,
  panelHeight: 'auto',
  url: '/?_func=get&_sqlid=vwltsa^wocid',
  onSelect:function(rec){
    putcook('vwltsa^lt_allocate^wocid',rec.value);
    var trdat=[]; $.dui.page.wors.map(function(e){if(e.attributes.class==rec.value) trdat.push(e);});
    $('ul#wotr').tree('loadData',trdat);    
  
  }, onLoadSuccess: function(){
    var cbo = $(this);
    var sel = getcook('vwltsa^lt_allocate^wocid');
    //ajaxget('vwltsa/?_func=wotree',{},function(wors){
    ajaxget('/',{_func:'get',_sqlid:'vwltsa^wotree'},function(wors){
      //console.log('========');
      //console.log(wors);

      $.dui.page.wors = wors;  
      if(sel) cbo.combobox('select',sel);
    })
  }
})


$('#dept').combobox({
  onSelect:function(rec){
    var emt = $('ul#emptr');
    var roots = emt.tree('getRoots');
    for(var i in roots){
      var node = $(roots[i].target).parent();
      if(rec.value && roots[i].dept !== rec.value) node.addClass('hide');
      else node.removeClass('hide');
    }
  }
})

// employee tree
$('ul#emptr').tree({
  url:"/?_func=get&_sqlid=vwltsa^ewo",
  dnd:true,
  
  onLoadSuccess:function(data){
    var wow = $('ul#wotr');
    //if(wow.tree('getRoots').length ==0) wow.tree({url:'vwltsa/?_func=wotree&page=0&size=999'});
    if(wow.tree('getRoots').length ==0) wow.tree({url:'/?_func=get&_sqlid=vwltsa^wotree&page=0&size=999'});
  },
  
  onDblClick:function(node){
    var odc = {me:$(this),node:node};
    empdel(odc);
  },

  onContextMenu: function(e, node){
    e.preventDefault();
    $(this).tree('select', node.target);
    $('#emmen').menu('show',{
      left: e.pageX,
      top: e.pageY
    });
  },
        
  onBeforeDrop:function(target,src,point){
    obd = {"tdata":[]};
    obd.opn = src;
    obd.me = $(this);
    obd.root = obd.me.tree('getRoot',target);
    obd.wow = $(src.target).closest('ul.tree');
    obd.sdata = $.extend(true,{},$(obd.wow).tree('getData', src.target));
    obd.type = obd.sdata.attributes.type;
    obd.exists = function(id){
      var chids = obd.me.tree('getData',obd.root.target).children;
      if(chids){for(var i in chids){if(chids[i].id == id) return true;}}
      return false;
    }
    if (obd.wow[0] == this){return true;}
    if( obd.type == 'sub') obd.tdata = obd.sdata.children;
    else if(obd.type == 'seq') obd.tdata = [obd.sdata];
    else if(obd.type == 'bas') {
      obd.subs = obd.sdata.children;
      for(var s in obd.subs){
        obd.ch = obd.subs[s].children; if(obd.ch) {for(var c in obd.ch){obd.tdata.push(obd.ch[c]);}}
        else obd.tdata.push(obd.subs[s]);
      }
    }

    for(var i in obd.tdata){
      obd.tdata[i].text = obd.tdata[i].id.replace(/\^/g,'.');
      if(!obd.exists(obd.tdata[i].id)) {
        //if(point == 'top') obd.me.tree('insert', {before:obd.root.target,data:obd.tdata[i]});
        //else if (point == 'bottom') obd.me.tree('insert', {after:obd.root.target,data:obd.tdata[i]})
        obd.me.tree('append', {parent:obd.root.target,data:obd.tdata[i]});
        }       
    }

    empsave(obd);
    basloop(obd.opn);     
    obd = null;
    return false;
  }
})



$('ul#wotr').tree({
  dnd:true,
  animate: false,
  
  formatter:function(node){
		if(node.attributes.type=='seq') return node.text+' - <span class="fg-blu">'+node.resid+'</span>';
		else return node.text;
	},
  
  onSelect:function(node){
    var os= {emp:$('ul#emptr'),seqs:[]}
    if(node.iconCls == 'seq') {
      os.text = node.id.split('^').join('.');
      os.emp.find('.tree-node.droppable.wo-sel').removeClass('wo-sel');
      os.emp.find('div:contains("'+os.text+'")').addClass('wo-sel');
      //os.emp.find('div:contains("'+os.text+'")').prev().find('.tree-icon').addClass('wo-sel');
    }
  },
  
  onContextMenu: function(e, node){
    e.preventDefault();
    $(this).tree('select', node.target);
    $('#women').menu('show',{
      left: e.pageX,
      top: e.pageY
    });
  },
  
  onBeforeExpand:function(){$(this).tree('collapseAll')},
  
  onBeforeDrop:function(target,src,point){return false;},

  loadFilter: function(data){return data;},
  
  onLoadSuccess:function(node,data){
   // console.log(data);
    if(!data.length) return;
    var ols = {};
    ols.wow = $(this);
    ols.woe = $('ul#emptr');
    ols.info = data[0].attributes.info;
    //$('#pagi').pagination('options').total = (ols.info.pages * ols.info.size);
    ols.wow.tree('collapseAll');//.tree('options').animate = true;
  
    ols.woes = ols.woe.tree('getRoots');
    for(var c in ols.woes){
      for(var i in ols.woes[c].children){
        ols.opn = ols.wow.tree('find',ols.woes[c].children[i].id);
        basloop(ols.opn)
      }
    }
    ols = null;
  }
})

/*
$('#pagi').pagination({
  layout:['first','prev','manual','next','last'],
  total:3,
  pageSize:100,
  showPageList:false,
  showRefresh:false,
  displayMsg:'',
  afterPageText:'',
  beforePageText:'',
  onSelectPage:function(page,size){
    //$('ul#wotr').tree({url:'vwltsa/?_func=wotree&page='+page+'&size='+size})         
  }      
})
*/

$("#but_del").on("click", function() {
  var cbo = getCombo();
  cbo.frm.attr('mode','get');
  cboEdit(cbo.cbo,true);
  cbo.frm.form('clear');
})

$("#but_save").on("click", function() {
  var os = {tr:$('ul#emptr')}
  //os.chkd = os.tr.tree('getChecked');
  os.oper = os.tr.tree('getRoots');
  for(var i in os.oper){
   // console.log(os.oper[i].id);  
  }
})

// delete allocations
function alodel(){
  alo = {em:$('ul#emptr'),wo:$('ul#wotr')};
  alo.node = alo.wo.tree('getSelected');
  if(alo.node.attributes.type !== 'seq') return;
  alo.text = alo.node.id.split('^').join('.');
  alo.emwo = alo.em.find('div:contains("'+alo.text+'")');
  alo.emwo.each(function(){alo.em.tree('select',$(this));empdel();});
  alo=null;
}

// show info screen
function info(){
  inf = {me:$('ul#emptr')};
  inf.node = inf.me.tree('getSelected');  
  inf.url = gurl('/?_func=get&WOREF='+inf.node.id+'&_sqlid=seq');
  $.ajax({async:false,type:"GET", url:inf.url}).done(function(data){
    if(iserr(data)) return;
    $("#info").window("open");
    $('form#seqinfo').form('load',data);
    inf = null;  
  })        
}

// Move up/down
function move(dir){
  mv = {me:$('ul#emptr')};
  mv.node = mv.me.tree('getSelected');
  mv.root = mv.me.tree('getRoot',mv.node.target);
  mv.me.tree('move',{target: mv.node.target, dir:dir});
  empsave(mv);
  mv = null;
}

// loop entire w/o
function basloop(node){
  if(!node) return;
  woi = {wo:$('ul#wotr'),emp:$('ul#emptr')};
  woi.bas = woi.wo.tree('getRoot',node.target);
  woi.sub = woi.bas.children;
  woi.stally = 0;
  woi.stotal = 0;
  
  woi.seticon = function(seq){
    woi.stotal ++;
    woi.opn = woi.emp.tree('find',seq.id); 
    if(woi.opn) {
      woi.wo.tree('setIcon',{node:seq,icon:'icon-tick'});
      woi.stally ++;
    } else $(seq.target).find('span.tree-icon').removeClass('icon-tick');
  }

  for(var q in woi.sub){ // for each level 0
    woi.seq0 = woi.sub[q];
    if(woi.seq0.iconCls == 'seq') woi.seticon(woi.seq0);
    else {
      woi.btally = 0; woi.btotal = 0;
      for(var i in woi.seq0.children){
        woi.btotal ++;
        woi.seticon(woi.seq0.children[i]);
        if(woi.opn) woi.btally ++;
      }
      
      if(woi.btally == 0) $(woi.seq0.target).find('span.tree-icon').removeClass('icon-tick icon-pclip');
      else {
        if(woi.btally == woi.btotal) woi.basic = 'icon-tick'; 
        else woi.basic = 'icon-pclip';
        woi.wo.tree('setIcon',{node:woi.seq0,icon:woi.basic})
      }
    }
  }
  
  if(woi.stally == 0) $(woi.bas.target).find('span.tree-icon').removeClass('icon-tick icon-pclip');
  else {
    if(woi.stally == woi.stotal) woi.basic = 'icon-tick'; 
    else woi.basic = 'icon-pclip';
    woi.wo.tree('setIcon',{node:woi.bas,icon:woi.basic})
  }
  woi = null;
}

// delete & save
function empdel(){
  var odc = {me:$('ul#emptr')};
  odc.node = odc.me.tree('getSelected');      
  if(odc.me.tree('getLevel',odc.node.target) == 1) return;
  odc.root = odc.me.tree('getRoot',odc.node.target);
  odc.me.tree('remove',odc.node.target);
  empsave(odc);        
  if(odc.me.tree('find',odc.node.id)) return;
  odc.opn = $('ul#wotr').tree('find',odc.node.id);
  basloop(odc.opn);
  odc = null;
}

// update database
function empsave(obd){ // requires:{me,root}
  if(!obd){var odc = {me:$('ul#emptr')}; obd.node = obd.me.tree('getSelected');}
  obd.edat = obd.me.tree('getData',obd.root.target);
  obd.worefs = []; for(var i in obd.edat.children){obd.worefs.push(obd.edat.children[i].id);}
  obd.url = '/?_func=upd&_sqlid=vwltsa^ewo&EMP_ID='+obd.edat.id+'&WOREFS='+obd.worefs.join();
  $.ajax({async:false,type:"GET", url:obd.url}).done(function(data){
    iserr(data);
    obd = null;  
  }) 
}

