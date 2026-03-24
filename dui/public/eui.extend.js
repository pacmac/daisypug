/*
  PAC 171108 2.2.2830
  1. Added eui.aliases() and included call in form loadSuccess().
  
  
  
*/

/* #FUNCTIONS */
var eui = {
  
  navdelay: 800,
  ajax_method: 'post',
  
  aliases: function(){
    // update aliases (data-alias="XXX")
  	$.each($('#content input[data-alias]'), function(idx, obj) {
      var val = $($(this).data('alias')).textbox('getText');
      $(this).textbox('setText',val);
    })    
  },
  
  table: function (head,rows){
    if(!Array.isArray(rows)) rows=[rows];
    var tb = $('<table class="eui-table" />'), hed=$('<thead />'), bod=$('<tbody />');
    head.map(function(e){
      hed.append($('<th field="'+e.field+'" />').text(e.title));
    });  
    
    rows.map(function(row){
      var idx=0, tr=$('<tr />'); 
      for(var idx in head){
        var field = head[idx].field;
        if(head[idx].formatter) var val = head[idx].formatter(row[field]); else var val = row[field]||'';
        tr.append($('<td />').text(val).attr('style',head[idx].style||''));
        idx++;
      }
      tr.appendTo(bod);
    })
    return tb.append(hed,bod);
  },

  colsort: function (dg,arr) {
  	var table = $(dg).prev('.datagrid-view2').find('table');
  	var rows = $('tr', table), cols, cids=[]; 
  	$(rows[0]).children('th, td').each(function(e){cids.push($(this).attr('field'))});
  	cj(cids);
  	rows.each(function() {
	    var row=$(this), cols=row.children('th, td').remove();
	    arr.map(function(e){row.append(cols[cids.indexOf(e)])})
  	});
  },

  droplist: function(ul,cb){
    var indi = $('#_indi,indicator');
    if(indi.length==0) indi = $('<div id="_indi" class="indicator">>></div>').appendTo('body');
    
    ul.find('li.drag-item').draggable({
      revert:true,
      deltaX:0,
      deltaY:0,
      onBeforeDrag: function(evt){
        if($(evt.target).is('input')) return false;
      }
    }).droppable({
      
      onDragOver:function(e,source){
        indi.css({
          display:'block',
          left:$(this).offset().left-10,
          top:$(this).offset().top+$(this).outerHeight()-5
        });
      }, 
      
      onDragLeave:function(e,source){
        indi.hide();
      }, 
      
      onDrop:function(e,source){
        $(source).insertAfter(this);
        indi.hide();
        cb(source);
      }
    });
  },

  translate: function(obj){
    if(!dwap.lankeys) dwap.lankeys = Object.getOwnPropertyNames(dwap.lang);
    if(dwap.lang != 'eng'){
      var match = new RegExp(obj.text().trim(), 'i').exec(dwap.lankeys);
      if(match) obj.text(dwap.lang[match[0]]);
    }
    obj.css('visibility','visible');
  },

  formatValue: function(target){
    var t = $(target);
    var opts = t.textbox('options');
    var v = t.textbox('getValue');
    if (opts.formatter && v){
      var v = opts.formatter.call(target, v);
      t.textbox('setText', v);
    }
  },

  date: function(val){
    if(val) return val.match(/^[0-9|-]*/)[0];
  },

  ref2text: function(val){
    if(val) return val.replace(/\^/g,'.');
  },

  currency: function(val){
    return '$'+(eui.number(val,2));  
  },

  integer: function(val){
    return eui.number(val);  
  },

  number: function(val){
    var dec=2;
    if(!val || isNaN(val)) val=0;
    if(!isNaN(parseFloat(val))) val = parseFloat(val);  
    return val.toFixed(dec);
  },

  isloading: function(fid){
    return $(fid).form('options').loading;  
  },

  toolbar: function(els){
    var tb = $('#dyn-toolbar');
    if(tb.length==0) {
      var tbp = $('.layout-panel-center > .panel-header > .panel-tool');
      var tb = $('<div id="dyn-toolbar" style="display:inline-block" />');
      tb.appendTo(tbp);
    } else tb.empty();
    
    els.map(function(el){
      if(!el.type) tb.append($('<span class="vert-sep app-sep"/>'));
      else {
        var tag='div', item = $('<div class="fitem inline" />');
        if(el.label) item.append($('<label >'+el.label+'</label>'));
        if(el.type=='linkbutton') tag='a';
        if(!el.class) el.class=''; el.class += ' easyui-'+el.type;
        var eui = $('<'+tag+' class="'+el.class+'" name="'+(el.name||'')+'"/>');
        tb.append(item.append(eui));
        eui[el.type](el['options'] || el['data-options'] || {});
        $.parser.parse(item);
      } 
    })
  },

  textPut: function (obj){
    for(var k in obj){
      $('#'+k).textbox('setValue',obj[k]);
    }
  },
  
  textGet: function (arr){
    if(typeof(arr)=='string') arr=[arr];
    var obj={}; arr.map(function(k){obj[k] = $('#'+k).textbox('getValue')});
    return obj;
  },

  sqlid: function(sqlid){
    var url = '/?_func=get&_sqlid='+sqlid;
    var bits = sqlid.split('^');
    if(bits.length==1) url=gurl(url);
    return url;
  },
  
  navi: function(cbo){
    var fit = cbo.parent('.fitem');
    var nav = $('#cbonav > span.nav').clone();
    fit.append(nav);
    nav.children('.cbnav').linkbutton({disabled:false,onClick:function(){
      var lb = $(this); lb.linkbutton('disable');setTimeout(function(){lb.linkbutton('enable')},eui.navdelay);
      var dir = 1; if($(this).hasClass('bak')) dir = -1;
      if(cbo.hasClass('combobox-f')) cbo.combobox('index',dir);
      else cbo.trigger('navi',dir);
    }})
    nav.show();
    nav.navi = function(dir){};
  }, 

  eventOff: function (obj,type,evt){
    var opt = obj[type]('options');
    if(!opt['__'+evt]) opt['__'+evt] = opt[evt];
    opt[evt] = function(e){};
  },

  eventOn: function (obj,type,evt){
    var opt = obj[type]('options');
    if(typeof(opt['__'+evt]) == 'function') opt[evt] = opt['__'+evt];
  },

};


/* PARSER */
/*
$.parser.onComplete = function(){
  //cl($(this));
  $('.datagrid-f').each(function(){
      var dg = $(this);
      var me = dg.datagrid('getPanel');
      me.find(...).each(function(){
          //...
      });
  });
}
*/

/* #PANEL */
$.extend($.fn.panel.defaults,{loadingMessage:''});
$.extend($.fn.panel.methods, {
  setIcon: function(me,icon){
    $(this).closest('div.panel-icon').addClass(icon);  
  }
})

/* #DIALOG */
/*
var parser = $.fn.dialog.parseOptions;
$.fn.dialog.parseOptions = function(target){
  this.addClass('dialog-box');
  var opt = parser.call(this, target);
  return opt;
}
*/

$.extend($.fn.dialog.defaults,{
  bodyCls:'dbox'
});

/* #WINDOW */
$.extend($.fn.window.defaults,{
  doSize:true,
  closable:true,
  collapsible:false,
  minimizable:false,
  maximizable:false,
  modal:true
});

/* #TABS */
$.extend($.fn.tabs.defaults, {
  border:false,
  last:0,
  locked:false,
  

  onUpdate: function(title,index){
    $(this).find('span.tabs-title').each(function(){eui.translate($(this))});
    var asdpx = $(this).find('[asdpx]').first().attr('asdpx'); 
    if(index==0 && asdpx) butEn(asdpx,'tabinit');
  },

  onUnselect: function(tit,idx){
    var me = $(this);
    if(me.tabs('options').locked) return me.tabs('select',idx)  
    setTimeout(function(){
      // var tab = me.tabs('getSelected'); cl(tab);
      // var asdpx = tab.find('[asdpx]').first().attr('asdpx');
      var asdpx = me.find('[asdpx]').first().attr('asdpx');
      if(asdpx) butEn(asdpx,'tabchange');
    }); 
  }

})

$.extend($.fn.tabs.methods, {
  
  onDemand: function(jq,cbs){
    return jq.each(function(){
      var me = $(this);
      var opts = me.tabs('options');
      opts.onSelect = function(tit,idx){
        if(idx==0) return;
        var tab = me.tabs('getTab',idx); 
        var frag = tab.find('template').first();
        if(frag && frag.length > 0) {
          var id = tab.attr('id');
          showfrag(frag);
          me.find("form.single,form.multi").form();
          if(typeof(cbs.default)=='function') cbs.default(tit,idx); 
          if(id && typeof(cbs[id])=='function') cbs[id](tit,idx);
        }
      }
    })
  },

  enableAll:function(me,idx){
    $(me.tabs().data('tabs').tabs).each(function(i){me.tabs('enableTab',i)});
    if(idx==0 || idx) setTimeout(function(){me.tabs('select',idx)},100);
  },
  
  disableAll:function(me,idx){
    if(idx==0 || idx) me.tabs('select',idx);
    $(me.tabs().data('tabs').tabs).each(function(i){
      me.tabs('disableTab',i)})
    },
  
  lock:function(me,idx){if(idx==0 || idx) me.tabs('select',idx);me.tabs('options').locked=true},
  unlock:function(me,idx){me.tabs('options').locked=false; if(idx==0 || idx) me.tabs('select',idx)}
})


/** #FORM **/

/** FORM-PARSER **/
var parser = $.fn.form.parseOptions;
$.fn.form.parseOptions = function(target){
  var frm = $(target);
  var opt = parser.call(this, target);
  
  frm.attr('method',eui.ajax_method);
  
  // .single & .single.load forms.
  if(frm.hasClass('single')){
    if(!frm.attr('mode')) frm.attr('mode','upd');
    if(!frm.attr('asdpx')) frm.attr('asdpx','s');
    var sqlid = frm.attr('_sqlid'); 
    if(sqlid){
      var bits = sqlid.split('^');
      if(bits.length==1) sqlid = getMenu().root.id + '^' + bits[0];
      opt.url = [
        '/?_sqlid='+sqlid,
        '_func=get',
        frm.find('input[value][type=hidden]:not(.textbox-value)').serialize()
      ].join('&').replace(/\&$/,''); // remove trailing &
      if(frm.hasClass('load')) setTimeout(function(){frm.form('load',opt.url)})
    }
  }
  
  else if(frm.hasClass('multi')){
    if(!frm.attr('mode')) frm.attr('mode','add');
    if(!frm.attr('asdpx')) frm.attr('asdpx','ax');
    setTimeout(function(){frm.form('disable','.fkey')});    
  }
  
  return opt;
}

/** FORM-DEFAULTS **/
$.extend($.fn.form.defaults, {

  changed: [],
  loading: false,

  onChange: function(tgt){
    var opts = $(this).form('options');
    
    if(!opts.loading) {
      if(opts.changed.length==0) opts.changed=[$(this).find('input.fkey')];
      if(!$(tgt).hasClass('sub-off') && opts.changed.indexOf(tgt)==-1) opts.changed.push(tgt);
      $(tgt).addClass('changed');
    }
    // if(dwap.saved) dwap.saved = false;
    $(this).trigger('changed',tgt);
  },
  
  ___onBeforeSubmit: function(param){
    return true;    
  },
  
  onSubmit: function(param){
    if(!dwap.noron && dwap.ronly) return false;
    
    var me = $(this);
    var opt = me.form('options');
    var mode = me.attr('mode'); 
    
    /*
    // improve save mode upd,add,del
    var fkey = me.find('input.fkey').first();
    if(fkey.length) var fval = fkey.combobox('getValue');
    cl(mode);
    cl(opt.queryParams._func);
    opt.queryParams._func = 'xxx';
    cl(fval);
    */
    
    // if(!me.form('options').onBeforeSubmit()) return false;
    
    var b4 = me.triggerHandler('beforeSubmit',param);
    if(b4===false) return false;    
    var vali = me.form('validate');
    if(!vali && mode != 'del') {
    var vis = $(this).find('.textbox-invalid:visible').first();
      if(vis.length==0) {
        var inv = $(this).find('.tabs-panels .textbox-invalid:hidden');
        if(inv.length > 0) eltaben(inv);
      }
      alert('Complete all highlighted fields.');     
      return false;
    }
    return true;
  },

  success:function(data){
    data = jsontry(data);
    
    if(iserr(data)) return;
    
    var me = $(this)[0];
    // error when saving behaviors in 1.4.5.
    //var mode = me.queryParams._func;
    var frm = me.frm || $(this);

    var mode = frm.attr('mode');
    //var mode = frm.queryParams._func; cl(mode);
    
    var cbo = getCombo();
    frm.done = function(mode){};
    frm.success = function(mode){}; //testing
    
    if(mode=='del'){ 
      frm.form('reset');
      if(cbo.cbo) cbo.cbo.combobox('reload');
      frm.attr('mode','add');
    } 
    
    else {
      if(cbo.cbo) {
        var next = data._next || true;
        cbo.cbo.combobox('editbox',next);        
      }  
      
      else {
        var next = data._next || true;
        var qbe = $(cbo.frm).find('input.fkey.easyui-qbe').first();
        if(qbe.length > 0) qbe.textbox('runMode',next);
      } 
    
      frm.attr('mode','upd');
    }
    
    //dwap.saved = true;
    frm.form('unchange');
    frm.trigger('done',mode); // < Old Method
    frm.trigger('success',{'mode':mode,'res':data});
  },
  
  onBeforeLoad: function(param){
    $(this).form('unchange');
    $(this).form('options').loading = true;
    dwap.loading = true; 
  },

  onLoadSuccess:function(data){
    $(this).loadDone = function(data){};
    var me = $(this);
    var opt = me.form('options');
    
    if(dwap.noron || !dwap.ronly) me.form('enable');
    else me.form('disable','.fkey');

    // always unlock the tabs.
    me.find('ul.tabs').addClass('unlock');
    var fkey = $('input.fkey').first();
    if(fkey.length) dwap.page.fkey = fkey.textbox('getValue');
    dwap.saved = true; // << is this used anywhere ?
    me.attr('mode','upd');
    
    // PAC 160510 - Added a delay.
    setTimeout(function(){
      if(opt.noload) {
        delete opt.noload;
        opt.loading = false;
        dwap.loading = false;
        return false;
      }
      
      else {
        eui.aliases();
        me.trigger('loadDone',data);
        opt.loading = false;
        dwap.loading = false;
      }
              
    },250);
  },

}); 

/** FORM-METHODS **/
$.extend($.fn.form.methods, {

  reload: function(target){
    return target.each(function(){
  		var form  = $(target);
  		var opts  = form.form('options');
  		var sqlid = form.attr('_sqlid');
      var fkey  = form.find('.fkey');
      var kid   = fkey.attr('textboxname');
      var kval  = fkey.textbox('getValue');
      if(!kval) return;
      form.form('load',`/?_func=get&_sqlid=${sqlid}&${kid}=${kval}`);
    })  
  },

  reset: function(target){
    return target.each(function(){
  		var form = $(target);
  		var opts = form.form('options');
  		opts.fieldTypes.map(function(type){
			  var field = form.find('.'+type+'-f');
  			if(field.length && field[type]) field[type]('reset');
  		});
  		form.form('validate');
    })  
  },

  getData: function(jq){
    return frm2dic(jq);
  },
  
  focusFirst: function(jq){
    return jq.each(function(){
      var frm = $(this);
      setTimeout(function(){
        return frm.find((':input:enabled:visible:not([readonly]):first')).focus();
      },200);
    });
  },

  unchange: function(jq){
    return jq.each(function(){
      var frm = $(this);
      frm.find('input.changed:not(.fkey)').removeClass('changed');
      frm.form('options').changed = [frm.find('input.fkey')];
    });
  },

  preload: function(jq,data){
    return jq.each(function(){
      var me = $(this);
//var mode = me.attr('mode');
      eui.eventOff(me,'form','onLoadSuccess');
      me.form('load',data);      
      eui.eventOn(me,'form','onLoadSuccess');
//setTimeout(function(){me.attr('mode',mode)},500);
    })
  },

	changeFieldName: function(jq, fn){
		return jq.each(function(){
			var f = $(this);	// the form object
			$.map(['name','textboxName','sliderName'], function(name){
				f.find('['+name+']').each(function(){
					$(this).attr(name, fn($(this).attr(name)));
				})
			})
		});
	},

	// 1.4.1 BUG - combos are not selected on form load
	reselect: function(jq,not){
    not = not || '';
    jq.find('input.combobox-f').not('.fkey '+not).each(function(idx) {
      $(this).combobox('reselect');
    });
  },

  enable: function(jq){
    return jq.each(function(){
      var frm = $(this);
      frm.removeClass('form-lock');
      frm.find('.fitem.unlock').removeClass('unlock'); 
    }) 
  },  	
 	
  disable: function(jq,omit){
    console.log('@@@@ pac debug')
    return jq.each(function(){
      var frm = $(this);
      frm.addClass('form-lock');
      frm.find('input.fkey').closest('.fitem').addClass('unlock'); 
    })  
  },
	
	/*
	__160404_enable: function(jq){
    jq.form('disable','_enable_')	
  },
  	
	__160404_disable: function(jq,omit){
		// is this in 1.4.4 ?
		var omit = '' || omit, mode = 'disable';
		if(omit == '_enable_') mode = 'enable';
		return jq.each(function(){
			var t = $(this);
			var plugins = ['textbox','combo','combobox','combotree','combogrid','datebox','datetimebox','spinner','timespinner','numberbox','numberspinner','slider','validatebox'];
			for(var i=0; i<plugins.length; i++){
				var plugin = plugins[i];
				if(plugin=='validatebox') {
          var r = t.children().find('.easyui-validatebox').not(omit);
          if (r.length) {
            if(mode=='enable') r.removeAttr('disabled');
            else r.attr('disabled','disabled');
          }
  		  }
				else {
  				var r = t.children().find('.'+plugin+'-f').not(omit);
          if(r.length && r[plugin]) r[plugin](mode);
        }				
			}
			t.form('validate');
		})
	}
	*/
})

/*  #LINKBUTTON  */
/*

// 160416 - READONLY TESTS
var lbp = $.fn.linkbutton.parseOptions;
$.fn.linkbutton.parseOptions = function(target){
  var but = $(target);
  var opt = lbp.call(this, target);
  var cls = but.attr('class');
  if(dwap.ronly && cls && !cls.match(/ronly-on|cbnav/)) but.addClass('lock');
  return opt; // always return opt.
}
*/



var lbp = $.fn.linkbutton.parseOptions;
$.fn.linkbutton.parseOptions = function(target){
  var but = $(target);
  var opt = lbp.call(this, target);
  var cls = but.attr('class');
  //if(dwap.ronly && cls && !cls.match(/ronly-on|cbnav/)) but.addClass('lock');
  
  var ms = 2000;
  if(opt.clickms != undefined) ms = opt.clickms;
  
  
  // Prevent Double-Clicks on buttons (set delay with data-options.clickms
  but.on('mouseup',function(){
    but.addClass('click-lock');
    setTimeout(function(){
      but.removeClass('click-lock');  
    },ms)
    
  });

  return opt; // always return opt.
}

$.extend($.fn.linkbutton.defaults,{
  onClick: function(){
    $(this).done = function(butid){};
    var butid = $(this).attr('id');
    switch(butid){
      case 'but_add': but_add(); break;
      case "but_clr": but_clr(); break;
    }
  }
});


/*  #SWITCHBUTTON  */
/*
$.extend($.fn.switchbutton.defaults,{
  onText: 'YES',
  offText: 'NO',
  onChange: function(){
    
  }
});
*/

/* DATEBOX / TIMESPINNER */
$.extend($.fn.timespinner.defaults,{
  highlight:1,
  value:'12:00'
});

$.extend($.fn.datetimebox.defaults,{

  currentText: 'Now',
  
  formatter:function(date){
    return myTime(date);
  },

  parser: function(ymd){
		if(!ymd) return new Date();
		if(ymd.indexOf('T') == -1) ymd = ymd.replace(' ','T')+'.000Z';
		var os = new Date().getTimezoneOffset();
		if(ymd) var ts = new Date(ymd).getTime();
		else var ts = new Date().getTime();
		return new Date(ts+(os*60000));
  }
})

$.extend($.fn.datebox.defaults,{
  
  _sharedCalendar: '#calendar',
  
  formatter:function(date){
    return myDate(date);
  },

  parser: function(ymd){
    if(!ymd) return '';
    if(ymd.length==6) ymd = '20'+ymd;
    var t = Date.parse(iso2str(ymd)); 
    if (!isNaN(t)) return new Date(t);
    else return new Date();
  },
  
  postdate: true,
  predate: true,
  onChange: function(nv,ov){
    var msg, busy = $(this).closest('form').form('options').loading;
    var opt = $(this).datebox('options');
    if(busy) return;
    else if(!opt.predate && ymd2date(nv) < today()) msg = 'Cannot be earlier than today.';
    else if(!opt.postdate && ymd2date(nv) > today()) msg = 'Cannot be later than today.';  
    if(msg) {
      $(this).datebox('clear');
      msgbox(msg);
    }
  }

})

$.extend($.fn.datebox.methods, {
  getDate: function(me){
    var date = me.datebox('getValue').replace(/-/g,'/');
    return new Date(date);
  },
  
  today: function(me){
    var d = $.fn.datebox.defaults.formatter(new Date())
    if(!me) return d;
	  else me.datebox('setValue',d);
  },

  month: function(me){
    var d = $.fn.datebox.defaults.formatter(new Date(new Date().setDate(1)))
    if(!me) return d;
	  else me.datebox('setValue',d);
  },

  year: function(me){
    var d = $.fn.datebox.defaults.formatter(new Date(new Date().getFullYear(),0,1))
    if(!me) return d;
	  else me.datebox('setValue',d);
  }
})

$.extend($.fn.datetimebox.methods, {
  getTime: function(me){
    return new Date(me.datetimebox('getValue').replace(' ','T'));
  }
})

var parser = $.fn.datebox.parseOptions;
$.fn.datebox.parseOptions = function(target){
  var me = $(target);
  var opt = parser.call(this, target);
  if (me.hasClass('today')) var set = 'today';
  else if (me.hasClass('month')) var set = 'month';
  else if (me.hasClass('year')) var set = 'year';
  if(set) opt.value = $.fn.datebox.methods[set]()
  return opt;
}

/* #NUMBERBOX / #NUMBERSPINNER */
$.extend($.fn.numberspinner.defaults,{editable:true,min:0,precision:2});

$.extend($.fn.numberbox.methods, {
	set: function(jq,obj){
		return jq.each(function(){
		  for(var key in obj) $(this).numberbox('options')[key]=obj[key];
      $(this).numberbox('setValue', $(this).numberbox('getValue'));
		})
	}
})

/* #TEXTBOX / #VALIDATEBOX */
$.extend($.fn.validatebox.defaults,{
  deltaX:20
});

/** FOCUS-HANDLER **/
/*
var focusHandler = $.fn.textbox.defaults.inputEvents.focus;
$.extend($.fn.textbox.defaults.inputEvents, {
  focus: function(e){
    if (focusHandler){focusHandler(e);}
    var t = $(e.data.target);
    var v = t.textbox('getValue');
    if (v){t.textbox('setText', v);}
  }
});

var initValue = $.fn.textbox.methods.initValue;
$.fn.textbox.methods.initValue = function(jq, value){
  initValue.call($.fn.textbox.methods, jq, value);
  return jq.each(function(){
    var opts = $(this).textbox('options');
    eui.formatValue(this);
    opts.value = value;
  });
}

*/

//$.extend($.fn.textbox.defaults,{});

/** VALIDATE-PARSER **/
/*
var parser = $.fn.textbox.parseOptions;
$.fn.textbox.parseOptions = function(target){
  var me = $(target); 
  var opt = parser.call(this, target);
  if (opt.multiline==false && me.hasClass('spec, multiline')) opt.multiline=true;
  return opt;
}
*/

/** VALIDATE METHODS **/
$.extend($.fn.validatebox.methods, {
	required: function(jq, required){
		return jq.each(function(){
			var opts = $(this).validatebox('options');
			opts.required = required != undefined ? required : true;
			$(this).validatebox('validate');
		})
	},

	editable: function(jq,editable){
		return jq.each(function(){
			var opts = $(this).validatebox('options');
			opts.editable = editable != undefined ? editable:true;
			$(this).validatebox('validate');
		})
	}
})

/** TEXTBOX METHODS **/
$.extend($.fn.textbox.methods, {
	setValidType: function(jq, validType){
		return jq.each(function(){
			$(this).textbox('textbox').validatebox('options').validType = validType;
		})
	},

  dropbox: function(me,ext){
    ext=ext || []; if(typeof(ext)=='string') ext=[ext];
    var opts = me.textbox('options');
    me.textbox('textbox').on("dragenter",dropbox).on("drop",dropbox).on("dragleave",dropbox);
    
    function dropbox(e) {
      var me = $(this);
      var inp = me.parent('span.textbox').prev('input');
      inp.textbox('enable');
      e.stopPropagation(); e.preventDefault();    
      if (e.type == 'dragenter') me.addClass('over');
      else if (e.type == 'dragleave') me.removeClass('over');
      else if (e.type == 'drop') {
        var reader = new FileReader ();
        var file = e.originalEvent.dataTransfer.files[0];
        if(ext && ext.indexOf(extension(file.name.toLowerCase())) == -1) return false;
        reader.onloadend = function (e) {inp.textbox('setValue',this.result);};
        reader.readAsText (file);
        me.removeClass('over');
      }  
    }
  }
});

/** VALIDATE RULES **/
$.extend($.fn.validatebox.defaults.rules, {

  csn: {
		validator: function(value){
      return(/^[0-9, ]*$/.test(value));		
		},
		message: 'Numeric values only.'
	},

  neq: {
		validator: function(value, param){
			value = parseFloat(value);
			var v = parseFloat(param[0]);
			return value != v;			
		},
		message: 'Value can not equal {0}'
	},

  isJSON: {
		validator: function(val,par){
      try {JSON.parse(val);return true}
      catch(err){return false;}
    },
    message:'Invalid JSON.'
	},
  
  noList: {
    validator: function(val){
        return true
    },
    message:'Invalid Selection.'
  },
  
  inList: {
    validator:function(val){
      var me = $(this).parent('.textbox').prev('input.combo-f');
      if(me.length==0) return true;
      var opt = me.combobox('options');
      var data = me.combobox('getData');
      if(data.length==0 || opt.editable==false || me.hasClass('add-mode')) return true;
      var exists = false;
      for(var i=0; i < data.length; i++){
        if (val == data[i].text){
          exists = true;
          break;
        }
      }
      return exists;
    },
    message:'Invalid Selection.'
  },

	sqlsafe: {
		validator: function(val,par){
  		var reg = new RegExp(/\.|[A-Z]|[0-9]|-|\/|\\/);
  		for(var i in val){
    		var chr = {' ':'space'}[val[i]] || val[i];
    		$(this).validatebox.defaults.rules.sqlsafe.message = chr+' character not permitted.';
    		if(!reg.test(val[i])) return false;
  		} return true;
    }
	},

	xlsx: {validator: function(val,par){return (/(\w{1,})\.xlsx/).test(val)}},
	file: {validator: function(val,par){return !(/(\.|\*| )/).test(val)}},	

  // ignore combo definition prefix {} in length validation.
  udfLabels: {
    validator: function(val,param){
      val = val.replace(/^\*?\{.*\}|^\*/g,'').trim();
      return val.length <= param[0];
    },
    message: 'Must be less than {0} chars.'
  }
	
});

/*  #COMBOBOX */

/** COMBOBOX PRE-PARSER ^*/
var parser = $.fn.combobox.parseOptions;
$.fn.combobox.parseOptions = function(target){
  var cbo = $(target);
  cbo.closest('form').data('fkey',cbo);
  var opt = parser.call(this, target);
  if(!opt.validType) opt.validType = [];
  else if(typeof(opt.validType)=='string') opt.validType = [opt.validType];

  if(cbo.is('.first ,.last')) {
    opt.onLoadSuccess = function(){
      var data = cbo.combobox('getData');
      var last = data.slice(-1)[0].value
      var first = data[0].value;
      if(cbo.hasClass('first')) cbo.combobox('select',first);
      else cbo.combobox('select',last);  
    }
  }
  
  if(cbo.hasClass('edit')) {
    opt.editable = false;
    opt.onChange = function(nv,ov){
      if(!nv) return; 
      
      // if not a number then test if json.
      if(isNaN(nv)){
	      try {
	        var data = JSON.parse(nv);
	        cbo.combobox('clear').combobox('loadData',data);      
	      } catch(err){console.error('combo - bad JSON');}
      }
      
      var data = cbo.combobox('getData');
      var vf = cbo.combobox('textbox').next('input.textbox-value');
      vf.val( JSON.stringify(cbo.combobox('getData')));  
    };
    
    opt.onSelect = function(rec){cbo.combobox('options').rec=rec;}
    opt.iconAlign = 'right';
    opt.editBox = {
      init: function(but,e){
        var cbo = $(e.data.target);
        var ebox = but.data('ebox');
        if(!ebox){
          var fields = cbo.combobox('options').fields;
          if(!fields) return false;
          
          ebox = $('<div title="Edit Item" id="'+cbo.attr('name')+'_ebox" class="easyui-dialog" style="min-width:320px;min-height:100px;padding:12px;"/>'); 
          var form = $('<form class="easyui-form"/>');
          but.data('ebox',ebox);
          $('#_fragments_').append(ebox.append(form));
          $.parser.parse('#_fragments_');
          
          ebox.dialog({
            buttons: [
              {iconCls:'icon-ok',text:'Save',handler:function(){
                var rec = cbo.combobox('options').rec;
                var fdat = frm2dic(form);
								if(!fdat.value) fdat.value = fdat.text; // allow text-only combos.
                var cdat = cbo.combobox('getData');
								if(but.hasClass('icon-edit')) cdat.map(function(e,i){if(e==rec) {
								  cdat[i]=fdat; rec=fdat;
								}})  
                else cdat = cdat.concat(fdat);
                cbo.combobox('loadData',cdat).combobox('select',fdat.value)
                ebox.dialog('close');
              }},
              {iconCls:'icon-cancel',text:'Close',handler:function(){ebox.dialog('close')}},
            ]
          })
          
          dynadd(form,fields);
          
        }
        return ebox; 
      },
    };
    opt.icons = [
      { 
        iconCls:'icon-add',
        handler: function(e){
          var but = $(this);
          var ebox = opt.editBox.init(but,e);
          ebox.find('form').form('clear');
          ebox.dialog('open');
        }
      },{ 
        
        iconCls:'icon-edit',
        handler: function(e){
          var but = $(this);
          var cbo = $(e.data.target);
          var opt = cbo.combobox('options'); 
          var ebox = opt.editBox.init(but,e);
          var frm = ebox.find('form');
          frm.form('clear');
          frm.form('load',opt.rec);
          ebox.dialog('open');
        }
      }
      /*
      ,{ 
        // broken, this deletes everything
        iconCls:'icon-delete',
        handler: function(e){
          var cbo = $(e.data.target);
          var opt = cbo.combobox('options'); 
          var val = opt.rec.value;
          if(val=='') return;
          confirm(function(ok){
            //cbo.combobox('delete',val);
            var cdat = cbo.combobox('getData');
            var data = []; cdat.map(function(e){if(e.value !== val) data.push(e)})
            cbo.combobox('loadData',data).combobox('clear');
          })
        }
      }
      */
    ]
  }

  if(cbo.hasClass('fit')) opt.panelWidth = 208;

  if(cbo.hasClass('fkey')) { 
    //if(!cbo.hasClass('novali')) opt.validType.push('sqlsafe','inList');
    var vali = cbo.hasClass('novali'); 
    if(!vali) opt.validType.push('inList');
    
    // append Edit box
    //if(!cbo.hasClass('autonum')){
      var par = cbo.parent();
      opt.required = false; cbo.removeAttr('required');
      var div = $('<span class="edit-wrap">');
      var ebox = $('<input/>').attr({class:'easyui-validatebox edit-box upper'});
      if(cbo.hasClass('noupper')) ebox.removeClass('upper');
      var espan = $('<span class="edit-text" style="display:none;"/>');
      espan.append(ebox).appendTo(div); 
      $.parser.parse(div);
      if(vali) var vt = [];
      else var vt=['sqlsafe']; opt.validType.map(function(e){if(e!='inList') vt.push(e)});
      ebox.textbox({
        validType:vt,
        onChange: function(nv,ov){
          if(cbo.combobox('exists',nv)) {
            alert(nv+' already exists.');
            cbo.combobox('editbox',true);
            return cbo.combobox('select',nv);
          }
          else cbo.combobox('setValue',nv);
        }
      })   
      var cspan = $('<span class="edit-combo"/>');
      cbo.detach().appendTo(cspan);
      div.append(cspan).appendTo(par);
      cbo.data({'espan':espan,'cspan':cspan,'ebox':ebox});
    //}
 
  }

  if(cspan || cbo.hasClass('navi') && !cbo.hasClass('nonav')){
    var fit = cspan || cbo.parent('.fitem');
    var nav = $('#cbonav > span.nav').clone();
    fit.append(nav);
    nav.children('.cbnav').linkbutton({disabled:false,onClick:function(){
      var lb = $(this); lb.linkbutton('disable');setTimeout(function(){lb.linkbutton('enable')},eui.navdelay);
      var dir = 1; if($(this).hasClass('bak')) dir = -1;
      if(cbo.hasClass('combobox-f')) cbo.combobox('index',dir);
      else cbo.trigger('navi',dir);
    }})
    nav.show();
    nav.navi = function(dir){};
  }
  
  if(opt.cloneSource) {
    setTimeout(function(){
      cbo.combobox('cloneFrom',opt.cloneSource);
    })
  };
  
  return opt;
}

/** COMBOBOX DEFAULTS **/
$.extend($.fn.combobox.defaults,{
  queryParams:{}, 
  method:eui.ajax_method, 
  valueField:'value', 
  textField:'text', 
  selectOnNavigation:false,
  validType:['inList'],
  autoload: false,
  widths: ['40%','60%'],
  clicked: false,
  ___groupPosition: 'sticky',
  
  onShowPanel: function() {
    $(this).combobox('options').clicked = true;
  },

  onHidePanel: function() {
    $(this).combobox('options').clicked = false;
  },

  onResize: function(){
    var me = $(this);
    var opt = me.combobox('options');
    setTimeout(function(){
      var rec = me.combobox('getRec');
      if(rec && rec.iconCls) me.combobox('textbox').css({'padding-left':'24px','background':'url(../icons/'+rec.iconCls+'.png) no-repeat 4px 3px','background-size':'14px'});
    });
    
    if(me.combobox('options').groupField) me.combobox('sticky');

    if(!opt.run && opt.refresh && opt.refresh > 0.5){
      opt.run = setInterval(function(){
        try {if(!me.combobox('panel').is(':visible')) me.combobox('reload');}
        catch(err){clearInterval(opt.run);}
      }, opt.refresh * 60000);
    }
    
  },

  loadFilter:function(data){
    var me = $(this);
    if(!Array.isArray(data)) data=[data]; //170720 - prevent single {} record problems.
    if(!$(this).hasClass('all')) return data;
    var opts = $(this).combobox('options');
    var emptyRow = {};
    emptyRow[opts.valueField] = '';
    emptyRow[opts.textField] = '- ALL -';
    if(data.length) data.unshift(emptyRow);
    return data;
  },

	onSelect: function(rec){
  	$(this).combobox('formLoad');
  	$(this).trigger('select',rec);
  }, 
  
  onBeforeLoad: function(param){
    if($(this).attr('disabled')) return false;
    var opts = $(this).combobox('options');
    var uvars = opts.uvars;
    if(uvars) uvars = '&'+$.param(uvars); else uvars = ''; 
    //cl(opts.loaded);
    if(opts.loaded) return false;
    else opts.loaded = true;    
    //var combo = $(this).attr('_sqlid');
    //if(combo) opts.url = gurl('/?_func=get&_combo=y&_sqlid='+combo+uvars);
    var sid = $(this).attr('_sqlid');
    if(sid) opts.url = eui.sqlid(sid)+uvars+'&_combo=y';
    
  },
  
  onLoadSuccess: function(){
    var opts = $(this).combobox('options');
    // cl(opts.autoload);
    if(opts.autoload) {
      $(this).combobox('select',opts.autoload);
      try {opts.autoload=false;}
      catch(e){}
    }
  }
  
})

/** COMBOBOX METHODS **/
$.extend($.fn.combobox.methods, {


  paginate: function(cbo){
    var pan = cbo.combobox('panel');
    var opt = cbo.combobox('options');
    
    opt.loadFilter = function(data){
      //cl(data);
      return data;
    }
  },

  _paginate: function(cbo){
    setTimeout(function(){
      var pan = cbo.combobox('panel');
      var opt = cbo.combobox('options');
      var rht = 23;
      opt._more = true; // more data is available
      opt._url = opt.url; delete(opt.url);
      opt._init = false;
      opt.data = [];
      opt.like = opt.dbkey+'_LIKE_';
      if(!opt.queryParams._page) {
        opt.queryParams._page=1; 
        opt.queryParams._rows=25;
      }
      cbo.combobox('disableValidation');
      
      /*
        How to load record for re-select ?
      */
      
      cbo.loadFilter = function(data){
        cl(data);
      }
      
      if(opt.editable){
        opt.mode = 'remote';
        opt.onBeforeLoad = function(param){
          opt.queryParams._page = 1;
          opt.queryParams[opt.like] = param.q; delete param.q;
          load(true);
        }
      }

      function load(init){
        
        if(opt._busy || !opt._more) return;
        opt._busy = true;
        ajaxget(opt._url,opt.queryParams,function(data){
          if(init) cbo.combobox('loadData',data.rows);
          else {
            if(data.total / opt.queryParams._rows > opt.queryParams._page) opt._more = true;
            else opt._more = false;
            data.rows.map(function(e){cbo.combobox('append',e)});
          };
          opt._busy = false;
          opt.queryParams._page ++;
        })
      }
      
      pan.on('scroll',function(evt){
        var rows = cbo.combobox('getData').length;
        //cl(pan.find('.combobox-item:first-child').outerHeight());
        var top = pan.scrollTop();  
        var size = pan.height() / rht;
        var pct = (top/rht)/(rows-size);
        //cl('pct:'+pct+' len:'+rows+' top:'+top);
        if(pct > 0.8) load(false);
      });
      
      load(true);
      
    },200);  
  },
  
  
  /*
  groupAdd: function(jq,item){
    return jq.each(function(){ 
      var pan = $(this).combobox('panel');
      var state = $.data(this, 'combobox');
      var grp = item[opts.groupField];
      var idx = state.groups.map(function(e) {return e.value;}).indexOf(grp);
      if(idx==-1) return; // group exists.
      // groupIdPrefix, groups[{count, startIndex, value}]
			var grps = pan.find('.combobox-group');
			cl(state)
			
			// cl(grp);
			// if(!grp) pan.append('<div class="combobox-group" id="_easyui_combobox_g21_0">'++'</div>'); 

    })
  },
  */

	cloneFrom: function(jq, from){
		return jq.each(function(){
			$(this).combo('cloneFrom', from);
			$.data(this, 'combobox', $(from).data('combobox'));
			$(this).addClass('combobox-f').attr('comboboxName', $(this).attr('textboxName'));
		});
	},

	reset: function(jq){
		return jq.each(function(){
			var me = $(this);
			var opts = me.combobox('options');
      if(!me.combobox('selected')) me.combobox('setValue', opts.originalValue);
		});
	},

  selected:function(me){
    return me.each(function(){
      var val=false, data = me.combobox('getData');
      for(var e in data){if(data[e].selected) {val=data[e].value; break;}}
      if(val) setTimeout(function(){me.combobox('unselect').combobox('select',val)});
      return val;
    })
  },

  filtertip: function(jq,opts){
    
    return jq.each(function(){
      var cbo = $(this);
      var cookid = dwap.appid+'^'+cbo.attr('id');
      opts.default = opts.default || null;
      var cooks = getacook(cookid,opts.default);
      var cop = cbo.attr('data-options');
      cop += ", queryParams:{STATUS:'"+cooks.join(',')+"'}";
      cbo.attr('data-options',cop);
      var lab = cbo.closest('.fitem').find('label');
      var but = $('<a href="javascript:void(0);" class="cbo_filter_but" />');
      $.parser.parse(but);
      but.insertAfter(lab);
      
      but.tooltip({
        data: opts.data,
        deltaY: -7,
        showEvent: 'click',
        hideEvent: 'none',
        content: function(){
          var opt = $(this).tooltip('options');
          opt.div = $('<div class="cbo_filter_opt"/>');
          
          opt.data.map(function(e){
            var chk=''; if(cooks.indexOf(e.name)!=-1 && !e.nosave) chk = 'checked';
            opt.div.append('<div><input class="cbo_check" type="checkbox" name="'+e.name+'" '+chk+'/><label>'+e.text+'</label></div>'); 
          })
          
          var buts = opt.div.find('input.cbo_check'); 
          buts.on('click',function(e){
            var stats=[]; $.each(buts,function(){
              var name = $(this).attr('name'); 
              // single-select option.
              if(opts.singleSelect && e.target.name != name) {
                $(this).attr('checked',false);
              }
              if($(this).is(':checked')) stats.push(name);
            })
            cbo.combobox('options').queryParams[opts.field] = stats.join(',');
            cbo.combobox('reload');
            putcook(cookid,stats);
          })
          $.parser.parse(opt.div);
          return opt.div;
        },
        
        onShow: function(){
          var t = $(this);
          t.tooltip('tip').off().on('mouseleave',function(){
            t.tooltip('hide');
          });
        }      
        
      });
        
    })
  },

  delete: function(jq, item){
		return jq.each(function(){
			var state = $.data(this, 'combobox');
			var opts = state.options;
			var items = $(this).combobox('getData');
			var idx = items.map(function(e) {return e.value;}).indexOf(item.value);
			var id = state.itemIdPrefix+'_'+idx;
			items.splice(idx,1);
			$('#'+id).remove();
		})
	},  

  append: function(jq, item){
		return jq.each(function(){
			var pan = $(this).combobox('panel');
			var state = $.data(this, 'combobox');
			var opts = state.options;
			var items = $(this).combobox('getData');
			items.push(item);
			pan.append(
				'<div id="' + state.itemIdPrefix+'_'+(items.length-1) + '"  class="combobox-item">' +
				(opts.formatter ? opts.formatter.call(this, item) : item[opts.textField]) +
				'</div>'
			)
		})
	},
  
  sticky: function(cbo){
    setTimeout(function(){
      //cbo.combobox('panel').on('scroll',function(){
      cbo.combobox('panel').off('scroll').on('scroll',function(){
        var pan=$(this), top=pan.scrollTop(), grps=pan.find('.combobox-group');
        $.each(grps,function(idx){
          var row=$(this);
          if(row.position().top < 8) {
            grps.not(row).removeClass('active');
            row.addClass('active');
          }
        });
      });
      // cbo.combobox('panel').scrollTop(0);
    },200)  
  },

  formLoad: function(me){
    var rec = me.combobox('getRec');
    if(!rec || !me.hasClass('fkey')) return;

    var frm = me.closest("form");
    var mode = frm.attr('mode');
    var name = me.attr('comboname');
    var val = rec.value;
    me.data({'name':name,'val':val});
    var url = gurl('/?_func=get&_sqlid='+frm.attr('_sqlid')+'&'+name+'='+val);
    frm.form('load',url);
    butEn('xsda','cboselect'); //enable save, delete
    
    me.done = function(rec){};
    me.trigger('done',rec);    
  },
  
  empty: function(me){
    me.combobox('loadData',[]);
    return me;  
  },
  
  toCombo: function(me){
    var opts = me.combobox('options');
    if(opts.cbo) me.combobox({
      'editable':opts.cbo.editable,
      'hasDownArrow':opts.cbo.hasDownArrow,
      'onShowPanel':opts.cbo.onShowPanel,
      'onChange':opts.cbo.onChange 
    });
    return me;    
  },

  toText: function(me){
    var opts = me.combobox('options');
    if(!opts.cbo) opts.cbo = {
      'editable':opts.editable,
      'hasDownArrow':opts.hasDownArrow,
      'onShowPanel':opts.onShowPanel, 
      'onChange':opts.onChange,
      'validType': opts.validType    
    }
    
    //cl(euiver);
    //if(euiver=='1.4.4') return;
    //cl('1.4.1')
    
    var vt=[]; opts.validType.map(function(e){if(e!='inList') vt.push(e)}); 
    
    me.combobox({
      validType: vt,
      editable: true,
      hasDownArrow:false,
      onShowPanel: function() {me.combobox('hidePanel')},
      xonChange: function(nv,ov){
        var vb = me.combobox('textbox').next('input.textbox-value'); 
        if(vb.length > 0) me.data('vb',vb.clone());
        else me.combobox('textbox').parent('span.textbox.combo').append(me.data('vb'));
      }      
    }).combobox('validate');
    return me;
  },

  getField:function(me,key){
    var val = me.combobox('getValue');
    var dat = me.combobox('getData');
    var rec; dat.map(function(e){if(e.value==val) rec=e[key]})
    if(rec) return rec;
  },

  load:function(me,qp){
    var opts = me.combobox('options');
    if(opts.clicked) me.combobox('clear');
    $.extend(opts.queryParams,qp)
    me.combobox('reload');
  },

  reload:function(me,url){
    var val = me.combobox('getValue');
    var opts = me.combobox('options');
    opts.loaded = false;
    url = url || opts.url;
    me.combobox({url:url});
    if(!opts.autoload && val != '') opts.autoload=val;
  },

  find: function(me,keyval){
    var key = Object.keys(keyval)[0], val=keyval[key];
    var data = me.combobox('getData'); 
    if(!data) return false;
    var idx = data.map(function(e){return e[key]}).indexOf(val);
    if(idx !== -1) return data[idx]; else return null;    
  },
  
  selectKey: function(me,keyval){
    var rec = me.combobox('find',keyval);
    if(rec) me.combobox('select',rec.value); 
  },
  
  exists: function(me,val){
    val = val || me.combobox('getValue') 
    var data = me.combobox('getData'); 
    if(!data) return false;
    
    var idx = data.map(function(e){return e.value}).indexOf(val);
    
    if(idx !== -1) return true; else return false;    
  },

  reselect:function(me){
    var val = me.combobox('getValue'); 
    if(!val || !me.combobox('exists',val)) return;    
    var name = me.attr('comboname');
    // cl('Reselect '+name+':'+val);
    me.combobox('unselect',val);
    me.combobox('select',val);
  },

  getRec:function(me){
    var data = me.combobox('getData');
    var val = me.combobox('getValue');
    if(val=='') return false;
    var idx = data.map(function(e){return e.value}).indexOf(val);
    var rec = data[idx]; 
    return rec;
  },

  index:function(me,dir){ 
    var opts = me.combobox('options');
    if(opts.readonly || opts.disabled) return false;
    var d = {};
    //d.data = keysort(me.combobox('getData'),'value');
    d.data = me.combobox('getData');
    if(d.data.length==0) return;
    d.val = me.combobox('getValue');
    d.len = d.data.length;
    d.idx = d.data.map(function(e){return e.value}).indexOf(d.val)
   
    if(d.val=='' && d.idx==-1) { // un-selected combo.
      d.form = $(me[0].form);
      d.form.attr('mode','upd');
      if(dir==1) d.idx = 0; else d.idx = d.len -1;
    }
    else if(dir==1 && d.idx < d.len -1) d.idx++; 
    else if(dir == -1 && d.idx > 0) d.idx --;

    d.rec = d.data[d.idx];    
    d.nval = d.rec.value;
    
    me.combobox('unselect');
    me.combobox('select',d.nval);
    d = null;
  },
  
  autonum: function(me,next){
    return me.each(function(){
      if(!me.hasClass('autonum')) return false;
      
      if(next){
        me.combobox('readonly',false);
        me.combobox('reload');
        me.combobox('select',next);
        me.combobox('disableValidation');
        setTimeout(function(){
          me.combobox('enableValidation').combobox('validate');
        },100);
      }
      
      else {
        me.combobox('readonly',true);
        me.combobox('clear');
      }
    })
  },

  editbox: function(me,reset){
    
    if(reset){
      if(me.hasClass('autonum') && typeof(reset)=='string') me.combobox('autonum',reset);
      var val = me.combobox('getValue');
      me.combobox('options').autoload=val;
      me.combobox('options').editable=true;
      me.data('cspan').show();
      me.data('espan').hide();
      me.data('ebox').combobox('readonly',false);
      me.combobox('reload');
    }
    
    else {
      // add-new mode
      me.combobox('options').editable = false;
      me.data('cspan').hide();
      me.data('espan').show();
      
      if(me.hasClass('autonum')) {me.data('ebox').combobox('readonly',true);}
      me.closest('form').form('focusFirst');
    }
  }  
  
})

/* #DATAGRID */
/*
var parser = $.fn.datagrid.parseOptions;
$.parser.onComplete = function(){
  cl($(this));
}
*/
/*
$.fn.datebox.parseOptions = function(target){
  var me = $(target);
  var opt = parser.call(this, target);
  cl(opt);
  return opt;
}
*/

$.extend($.fn.datagrid.methods, {
  
  columns: function (jq,tgt){
    return jq.each(function(){
      var me = this;
      var dg = $(this);
      var opts = dg.datagrid('options'); 
    
      // Stored cookie
      var mid = dwap.menu.selected.id +'^'+ dg.attr('id')+'^cols';
      var mem = unique(getacook(mid) || []); 
      function colorder(mem){
        var memlen=mem.length, idx=0;
        if(opts.frozenColumns.length) var ctype = 'frozenColumns'; else var ctype = 'columns';         
        opts[ctype][0].map(function(col){
          if(!col.hide && col.title) {
            //if(!memlen) mem.push(col.field);
            if(!memlen && col.coloff!==true) mem.push(col.field);  //190228
            idx++;
          } 
          var mid=mem.indexOf(col.field); 
          if(mid==-1) mid=idx+1000; 
          col.index=mid;
        })
        
        if(!memlen) putacook(mid,mem);
        var cols = keysort(opts[ctype][0],'index'); 
        var dgo={}; dgo[ctype]=[cols];
        dg.datagrid(dgo);
        return cols;
      }

      var cols = colorder(mem);
      var pan = $('<div class="colpan combopanel" />');
      var ul = $('<ul class="drop-list" />');
      var res = $('<a class="col-reset">Reset</a>');
      if(Object.keys(cols).length > 12) pan.addClass('double');
      
      
      pan.append(ul).append(res);
      
      // Append to Page
      $('#content').append(pan);
      
      res.linkbutton({
        iconCls: 'icon-reset',
        onClick: function(){
          mem = [];
          colorder(mem);
          gocol();
        }
      })
      
      var but = $('<a class="ronly-on"/>'); tgt.append(but);
      but.linkbutton({
        size: 'small',
        toggle: true,
        iconCls: 'icon-column',
        onClick: function(){
          var me = $(this);
          var os = me.offset();
          if(me.linkbutton('options').selected) {pan.panel('move',{left:os.left+30, top:os.top+15}).panel('expand')}
          else {
            pan.panel('collapse');
            colorder(getacook(mid));
          } 
        }
      })
      
      pan.panel({
        style: {position:'fixed'},
        noheader: true,
        collapsed:true,
        collapsible:true,
        onCollapse: function(){dg.datagrid('resize')} 
      })
      
      function gocol(){
        ul.empty();
        var dcol=[];      
        for(var k in cols){
          var col = cols[k];
          if(col.hide || !col.title) continue; 
          var stat = {sh:true,col:'showColumn'}
          if(mem.indexOf(col.field) ===-1) stat = {sh:false,col:'hideColumn'}
          dg.datagrid(stat.col,col.field);
          var li = $('<li class="drag-item"/>'), inp = $('<input type="checkbox" />').attr('name',col.field).attr('checked',stat.sh);
          var lab = $('<label />').text(col.title);
          ul.append(li.append(inp).append(lab));
      
          inp.change(function(evt){
            var me=$(this), id=me.attr('name'), idx=mem.indexOf(id);
            var sh = {true:'showColumn',false:'hideColumn'}[me.is(':checked')];
            if(idx<0) mem.push(id); else mem.splice(idx,1);
            dg.datagrid(sh,id).datagrid('fitColumns');
            putacook(mid,mem);
          });
        };
              
        eui.droplist(ul,function(src){
          var xon = getacook(mid) || [], non = []; 
          ul.find('li.drag-item > input').each(function(){
            var name = $(this).attr('name'); 
            if(xon.indexOf(name)>-1) non.push(name);
          }); putacook(mid,non);
        });
      }
      
      gocol();
      
    })
  },

  editButs: function (jq,buts){
    function go(but,mode){
      if(mode=='lock') but.addClass('dgre-lock');
      else if(mode=='unlock') but.removeClass('dgre-lock');
      else if((/show|hide|click/).test(mode)) but[mode]();
      else if((/enable|disable/).test(mode)) but.linkbutton(mode);
    }
    
    buts = buts || {};
    return jq.each(function(){
      var dg = $(this);
      var opt = dg.datagrid('options');
      if(opt.tbar) setTimeout(function(){
        opt.tbar.bids.map(function(e){
          var but = e.split('_')[1];
          if(but in buts) go(opt.tbar[e],buts[but]);
          else go(opt.tbar[e],'show');  
        })  
      },50)
    })
  }, 

  readonly: function (jq,tf){
    return jq.each(function(){
      var dg = $(this);
      var mode = 'unlock', opt = dg.datagrid('options');
      opt.readonly = false;
      if(tf==true) {
        mode = 'lock';
        opt.readonly = true;
      } 
      
      if(opt.tbar){
        setTimeout(function(){
          dg.datagrid('editButs',{add:mode,del:mode,ok:mode,edit:mode})
        },200)
      }    
    })
  },

  editDone: function (jq){
    return jq.each(function(){
      var dg = $(this);
      var opt = dg.datagrid('options');
      if(opt.readonly) return false;
      if (opt.eidx==null) return true;
      if (dg.datagrid('validateRow', opt.eidx)){
        dg.datagrid('endEdit', opt.eidx);
        opt.eidx = null;
        return true;
      } else return false;
    })
  },

  editFocus: function(jq,idx){
    return jq.each(function(){
      var dg = $(this);
      var opt = dg.datagrid('options');
      if(opt.readonly) return false;
      if(opt.eidx != idx){
        if(dg.datagrid('editDone')){ // if no previous edit or previous is valid
          dg.datagrid('selectRow',idx).datagrid('beginEdit', idx);
          opt.eidx = idx;
        } 
      
        else setTimeout(function(){dg.datagrid('selectRow', opt.eidx)});
      }   
    })
  },

  editAppend: function(jq,data){
    return jq.each(function(){   
      var dg = $(this);
      var opt = dg.datagrid('options');
      if(opt.readonly) return false;
      var rows = dg.datagrid('getRows'), last=0, len=rows.length;
      for(var k in data){
        
        if(typeof data[k] == 'function'){
          var next = data[k](data); 
          data[k]= next;
        }
        
        else if((/\$autonum/).test(data[k])) {
          var inc=1, bits=data[k].split(':');
          if(bits[1]) inc*=parseInt(bits[1]);
          if(len > 0 ) last = parseInt(rows.slice(-1)[0][k]);
          data[k]=last+inc;
        }
        
        else if((/#/).test(data[k])) {data[k] = $(data[k]).textbox('getValue')}
      }
      
      // 200722 - allow insert.
      if(data._mode == 'insert') {
        var row = dg.datagrid('getSelected');
        len = dg.datagrid('getRowIndex',row);
        dg.datagrid('insertRow',{
          index : len,
          row   : data
        });
      }
      
      else dg.datagrid('appendRow',data);
       
      dg.datagrid('selectRow',len);
      if(opt.editor=='inline') dg.datagrid('editFocus',len);
      
      else opt.tbar.open(len,data,'add');
      
    })
  },
  
  tbar: function(jq,opts){
    return jq.each(function(){
      var dg = $(this);  
      var tb = {
        bids: ['dgre_add','dgre_insert','dgre_edit','dgre_del','dgre_ok'],
        tbar: $('<div id="dgre_tb" class="dgre_tb" />'),
        ebuten: function(endis){
          tb.dgre_edit.linkbutton(endis);
          tb.dgre_insert.linkbutton(endis);
          tb.dgre_ok.linkbutton(endis);
          tb.dgre_del.linkbutton(endis);
        }        
      }
      
      dg.append(tb.tbar);
      if(opts.tbarAppend) tb.tbar.append(opts.tbarAppend) 
      tb.bids.map(function(e){
        tb[e] = $('<a />').attr({'class':'dgre-ebuts '+e});
        tb[e].appendTo(tb.tbar);
      });
      tb.tbar.append($('<span class="vert-sep" />'));
      if(opts.tbarPrepend) tb.tbar.append(opts.tbarPrepend) 
      
      // evaluate opt.addData();
      function addData(mode){
        var opt = dg.datagrid('options');
        var data = {}; 
        
        dg.datagrid('getColumnFields').map(function(e){data[e]=''});
        data._mode = mode;
        
        if(typeof(opt.addData) == 'function') {
          $.extend(data,{_func:'add'},opt.addData());
          return data;
        }
        
        else {
          
          opt.adddata = {
            _func : 'add'  
          };
          
          for(var key in opt.addData){
            var rule = opt.addData[key];
            if(typeof rule == 'function') opt.adddata[key] = rule(data);
            else opt.adddata[key] = rule;
          }

          data = Object.assign(data,opt.adddata);
          return data;
        }        
      }
      
      tb.dgre_add.linkbutton({
        _text: 'Add',
        iconCls: 'icon-add',
        disabled: false,
        onClick: function(){
          nodclick($(this));
          var data = addData('append');
          dg.datagrid('editAppend',data);
        }  
      });
      
      tb.dgre_insert.linkbutton({
        _text: 'Insert',
        iconCls: 'icon-insert',
        disabled: true,
        onClick: function(){
          nodclick($(this));
          var data = addData('insert');
          dg.datagrid('editAppend',data);
        }  
      });

      tb.dgre_edit.linkbutton({
        _text: 'Edit',
        iconCls: 'icon-edit',
        disabled: true,
        onClick: function(){
          var opt = dg.datagrid('options');
          if(opt.readonly) return false; 
          var row = dg.datagrid('getSelected');
          var idx = dg.datagrid('getRowIndex',row);
          opt.tbar.open(idx,row,'upd');
        }  
      });

      tb.dgre_del.linkbutton({
        _text: 'Delete',
        iconCls: 'icon-delete',
        disabled: true,
        onClick: function(){
          var opt = dg.datagrid('options');
          var row = dg.datagrid('getSelected');
          var idx = dg.datagrid('getRowIndex',row);
          if(idx > -1) confirm(function(yn){
            if(yn) {          
              row._func = 'del';
              if(opt.editor=='inline') dg.datagrid('editDone');
              else opt.onEndEdit.call(jq,idx,row);
              dg.datagrid('deleteRow',idx);
              opts.tbar.ebuten('disable');
            }
          });
        }  
      });
      
      tb.dgre_ok.linkbutton({
        _text: 'Save',
        iconCls: 'icon-tick',
        disabled: true,
        onClick: function(){
          var opt = dg.datagrid('options');
          var idx = dg.datagrid('getRowIndex',dg.datagrid('getSelected'));
          if(idx > -1) {
            dg.datagrid('endEdit',idx);
            opt.eidx = null; 
          }
        }  
      })

      opts.toolbar = tb.tbar;
      opts.tbar = tb;
      
    });
  }, 

  rowEditor: function(jq,opts){
    return jq.each(function(){
      
      var dg = $(this);
      dg.datagrid('tbar',opts); // returns opts.tbar{}      
      opts.onBeforeEdit = function(idx,row){
        row._func=row._func || 'upd';
        opts.tbar.ebuten('enable');
      };
  
      // 200628 - hack for rowEditor in Rental Manager qp starting with &
      //if(!opts.queryParams) opts.url = '';

      opts.onAfterEdit = function(idx,row,chg){
        delete row._func;
        dg.datagrid('unselectRow',idx);
        opts.tbar.ebuten('disable'); 
      }
      
      opts.singleSelect = true;
      dg.datagrid(opts);
      if(opts.editor=='inline') dg.datagrid('rowedit');
      if(opts.editor=='form') dg.datagrid('formedit'); 

    });
  },

  formedit: function(jq){
    return jq.each(function(){
      var els=[], dg=$(this), opt=dg.datagrid('options');
      
      if(!dwap.noron) opt.readonly = dwap.ronly;  // set readonly earlyon
      else opt.readonly = false; 
      
      opt.dlg = opt.dlg || $('<div id="_dgform" />');
      
      //opt.tbar.form = $('<form class="grid-a"/>');
      opt.tbar.form = $('<form class=""/>');
      dg.append(opt.dlg.append(opt.tbar.form));
      
      opt.tbar.open = function(idx,row,fnc){
        if(!row) return; // 200729 - fix: Cannot set property '_func' of null
        row._func = fnc;
        opt.tbar.form.attr('rowidx',idx).form('load',row);
        opt.dlg.dialog('open');
      }
      
      opt.onDblClickRow = function(idx,row){
        opt.tbar.dgre_edit.click();
      }

      opt.onClickCell = function(idx,fld,val){
        opt.tbar.dgre_del.linkbutton('enable');
        opt.tbar.dgre_edit.linkbutton('enable');    
      }
    
      /*
      opt.onClickRow = function(idx,row){
        opt.tbar.dgre_del.linkbutton('enable');
        opt.tbar.dgre_edit.linkbutton('enable');    
      }
      */
      
      if(opt.twoColumns) {
        var one = $('<div style="max-width:400px;">');
        var two = $('<div style="max-width:400px;">');
        opt.tbar.form.addClass('two').append(one,two);
      }
    
      var tgt, cols= dg.datagrid('options').columns[0];
      cols.push({field:'_func', hidden:true});
      cols.map(function(e,i){
        if(e.editor){
          
          if(opt.twoColumns) {
            if(i > cols.length/2+1) tgt=two;
            else tgt=one;   
          }
          else tgt = opt.tbar.form;
          
          var fitem = $('<div class="fitem"/>');
          fitem.append($('<label >'+e.title+'</label>'));
          if(e.editor.options) var el = $('<input class="easyui-'+e.editor.type+'" name="'+e.field+'"/>'); 
          else {
            if(e.editor=='text') e.editor='textbox';
            var el = $('<input class="easyui-'+e.editor+'" name="'+e.field+'"/>');
          } 
          tgt.append(fitem.append(el));
          if(e.editor.options) el[e.editor.type](e.editor.options);
          els.push(el);
          //$.parser.parse(el);
        }
        else opt.tbar.form.prepend('<input type="hidden" name="'+e.field+'"/>'); 
      })
  
    
      $.parser.parse(opt.dlg);

      opt.dlg.buts = [
        {
          id: '_dlgsave',
          iconCls:'icon-save',
          text: 'Save',
          handler: function(){
            nodclick($(this));
            if(!opt.tbar.form.form('validate')){
              return alert('Complete all required fields.')
            }
            var fdat = frm2dic(opt.tbar.form);
            var idx = opt.tbar.form.attr('rowidx');
            var row = dg.datagrid('getRows')[idx];
            // don't update object fields
            for(var k in row){if(typeof(row[k])=='object') delete(fdat[k])}
var ok = opt.onBeforeEndEdit.call(jq,idx,row,fdat);
if(!ok) return false;             
            dg.datagrid('updateRow',{index:idx,row:fdat});
            opt.onEndEdit.call(jq,idx,fdat);
            opt.dlg.dialog('close');
            grnflash('#but_save');
            
          }
        },
        {
          iconCls:'icon-cancel',
          text: 'Cancel',
          handler: function(){
            var idx = opt.tbar.form.attr('rowidx');
            var row = dg.datagrid('getRows')[idx];
            if(row._func == 'add') dg.datagrid('deleteRow',idx);
            opt.dlg.dialog('close')
          }
        },        
      ] 

      // 171010 - New Readonly handler
      /*
        Virtually impossible to control, as the page can also
        modify the readonly and visibility of these buttons.
      */
      
      /*
      if(opt.readonly){
        opt.dlg.buts.splice(0,1);
        opt.tbar.dgre_del.hide();
      }
      */

      opt.dlg.dialog({
        closable: false,
        modal: true,
        title: 'Line Editor',
        closed: true,
        onClose: function(){
          opt.tbar.form.form('reset');
          dg.datagrid('unselectAll');
          opt.tbar.ebuten('disable'); 
        },
        buttons: opt.dlg.buts
      })

    })  
  },
  
  rowedit: function(jq){
    return jq.each(function(){
      var dg = $(this);
      var opt = dg.datagrid('options');
      opt.eidx = null;      
      opt.onClickCell = function(idx,fld){
        dg.datagrid('editFocus',idx);
        var ed = dg.datagrid('getEditor', {index:idx,field:fld});
        if (ed)($(ed.target).data('textbox') ? $(ed.target).textbox('textbox') : $(ed.target)).focus();        
      }
    })  
  },
  
  showRow: function(jq, index){
    return jq.each(function(){
      var opts = $(this).datagrid('options');
      opts.finder.getTr(this, index).show();
    })
  },
  
  hideRow: function(jq, index){
    return jq.each(function(){
      var opts = $(this).datagrid('options');
      opts.finder.getTr(this, index).hide();
    })
  },

  findRows: function(jq,pair){
    //{TYPE:['XX','YY']}
    var key = Object.keys(pair)[0], vals=pair[key];
    if($.type(vals) !== 'array') vals=[vals];
    var data = {rows:[],idxs:[]};
    jq.each(function(idx){
      var rows = $(this).datagrid('getRows');
      rows.map(function(e,idx){
        vals.map(function(v){
          if(e[key]==v) {
          data.rows.push(e);
          data.idxs.push(idx);
          }          
        })
      })
    })
    return data;
  },

  showRows: function(jq,idxs){
    var shows=0, rows=0;
    jq.each(function(){ // each datagrid
      var dg = $(this);
      var opts = dg.datagrid('options');
      if(idxs==-1) idxs = [-1];
      else if($.type(idxs) !== 'array'){idxs = dg.datagrid('findRows',idxs).idxs;}
      
      // loop every row and show or hide
      dg.datagrid('getRows').map(function(e,idx){
        if(idxs[0] == -1 || idxs.indexOf(idx) !== -1) {
          dg.datagrid('showRow',idx);
          shows ++;
        } 
        else dg.datagrid('hideRow',idx);
        rows ++;       
      })
    
      dg.datagrid('resize');
    })
    
    return ({'total':rows,'show':shows,'hides':rows-shows});
  },
  
  editCell: function(jq,param){
    return jq.each(function(){
      var opts = $(this).datagrid('options');
      opts.edix = undefined;
      var fields = $(this).datagrid('getColumnFields',true).concat($(this).datagrid('getColumnFields'));
      
      for(var i=0; i<fields.length; i++){
        var col = $(this).datagrid('getColumnOption', fields[i]);
        col.editor1 = col.editor;
        if (fields[i] != param.field){
          col.editor = null;
        }
      }
      
      $(this).datagrid('beginEdit', param.index);
      for(var i=0; i<fields.length; i++){
        var col = $(this).datagrid('getColumnOption', fields[i]);
        col.editor = col.editor1;
      } 
    });
  },
  
  enableCellEdit: function(jq){
    return jq.each(function(){
      var dg = $(this);
      var opts = dg.datagrid('options');
      opts.oldOnClickCell = opts.onClickCell;
      opts.onClickCell = function(index, field){
        if (opts.editIndex != undefined){
          if (dg.datagrid('validateRow', opts.editIndex)){
            dg.datagrid('endEdit', opts.editIndex);
            opts.editIndex = undefined;
          } else {
            return;
          }
        }
        
        dg.datagrid('selectRow', index).datagrid('editCell', {
          index: index,
          field: field
        });
        opts.editIndex = index;
        opts.oldOnClickCell.call(this, index, field);
      }
    });
  },

	resizeColumn:function(jq,param){
		return jq.each(function(){
			var dg = $(this);
			var col = dg.datagrid('getColumnOption', param.field);
			col.boxWidth = param.width + (col.boxWidth-col.width);
			col.width = param.width;
			dg.datagrid('fixColumnSize', param.field);
		})
	}


});

$.extend($.fn.datagrid.defaults, {
  
  eidx: null,
  dialog: null,
  form: null,
  onSave: function(obj){},
  onDelete: function(obj){},
  method: eui.ajax_method,
  fit: true,
  onBeforeLoad: function(param){
    var sid = $(this).attr('_sqlid');
    if(sid) $(this).datagrid('options').url = eui.sqlid(sid);
    // cl(`[eui.extends]:defaults ${$(this).datagrid('options').url}`)
  },

  onBeforeEndEdit: function(idx,row){
    return true;  
  },
  
  onBeforeOpen: function(){
    var me = $(this);
    setTimeout(function(){
      me.find('tr.datagrid-header-row td[field] .datagrid-cell > span:first-of-type').each(function(){eui.translate($(this))})
    }) 
  }
})

$.extend($.fn.datagrid.methods, {

  dialog: function(jq){
    return jq.each(function(){
      var dg = $(this);
      var opt = dg.datagrid('options');
      if(!opt.fields){
        opt.fields = [];
        opt.columns[0].map(function(e){
          if(e.editor) opt.fields.push({
            'id': e.field,
            'label': e.title,
            'type': e.editor.type,
            'data-options': e.editor.options || {}
          })
        })
      }  
      
      opt.dialog = dynDialog(
        {title: 'Edit Line',modal: true,fields: opt.fields},
        [
          {text:'Cancel',iconCls:'icon-cancel',handler:function(){opt.dialog.dialog('close'); dg.datagrid('unselectAll')}},
          {text:'Delete',iconCls:'icon-delete',handler:function(){
            var row = dg.datagrid('getSelected'), idx = dg.datagrid('getRowIndex',row);
            confirm(function(yn){if(yn) if(opt.onDelete) opt.onDelete.call(dg,{index:idx,row:row})});
            opt.dialog.dialog('close');
          }},
          {text:'Save',iconCls:'icon-save', handler:function(){
            nodclick($(this));
            if(!opt.form.form('validate')) return false;
            var idx = dg.datagrid('getRowIndex',dg.datagrid('getSelected'));
            var obj = {index:idx, row:frm2dic(opt.form)};
            if(opt.onSave) opt.onSave.call(dg,obj);
            opt.dialog.dialog('close');
          }}
        ]
      );
      
      opt.form = opt.dialog.find('form');
      opt.columns[0].map(function(e){
        if(e.editor) {
          e.editor.target = opt.form.find('input[textboxname='+e.field+']');
          if(e.editor.type=='combobox') e.formatter = function(val,row,idx){
            var rec = e.editor.target.combobox('find',{value:val});
            if(rec) return rec.text; else return val;
          }
        }
      });
    })  
  },

  toExcel: function(jq, filename, opts){
    opts = opts || {};

    // Stylesheet
    opts.style = opts.style || `

      table {
        border-collapse:collapse;
      }

      table.ulbar {
        width: 100%;
      }
      
      td {
        border:1px solid #EEEEEE;
        white-space: nowrap;
      }

      .datagrid-header-row {
        background-color: #EEEEEE;
        white-space: nowrap;
      }
      
      .datagrid-cell {
        vertical-align: top;
      }

      /* jobsched */
      td.bar .datagrid-cell > div {
        display: inline-block;
      }

      /* ulbar datagrids */
      .dow_0,
      .dow_6     {color: orange}

      .bg-red	   {background-color:#FFB5B5}
      .bg-grn	   {background-color:#CAFFD8 }
      .bg-ora	   {background-color:#FFE1C6}
      .bg-blu	   {background-color:#D0E6FF}
      
      .grywht,
      .whtgry,
      .bg-gry
                 {background-color:#DDDDDD}
      .bg-sil,
      .capoff
                 {background-color:#FAFAFA}
      .bg-pur	   {background-color:#E8C6FF }
      .bg-cyn	   {background-color:#B8E2EF}
      .bg-yel	   {background-color:#FFFFC8}
      .bg-brn	   {background-color:#EACDC1}
      .bg-clr	   {background-color:transparent}
    `;

    // dom parser
    opts.parser = opts.parser || function(dom){

      // Replace multi with a single important class.
      var clss = [
        'datagrid-cell',
        'datagrid-row',
        'datagrid-header-row',
        'ulbar',
        'bg-red',
        'bg-grn',
        'bg-ora',
        'bg-blu',
        'bg-gry',
        'bg-sil',
        'bg-pur',
        'bg-cyn',
        'bg-yel',
        'bg-brn',
        'bg-clr'
      ];
      
      // parse the classes
      dom.find('*').each(function(){
        var me = $(this);
        
        // Remove hidden elements
        if (me.css('display') == 'none') return me.remove();
        
        // search the clss list
        for(var idx in clss){
          var cls = clss[idx];
          if($(this).hasClass(cls)) {return $(this).attr('class',cls)}
        }
        
        // If multiple, only use last class
        var elcls = me.attr("class");
        if(elcls) me.attr('class',elcls.split(' ').slice(-1)[0]);
      })
      
      /*
        <td field="sched" class="bar">
          <div style="height:auto;" class="datagrid-cell">
            <div data-wor="J-00011^0^40" title="10TON ( 1.7999999999999998m )" style="left:0%;width:3.333%;" class="bg-red">&nbsp;40</div>
            <div data-wor="J-00011^0^60" title="5TON ( 4.2m )" style="left:0%;width:3.333%;" class="bg-red">&nbsp;60</div>
            <div data-wor="J-00011^0^70" title="5TON/FEED ( 40.2m )" style="left:0%;width:3.333%;" class="bg-red">&nbsp;70</div>
            <div data-wor="J-00011^0^80" title="10TON ( 3.3h )" style="left:0%;width:3.333%;" class="bg-red">&nbsp;80</div>
            <div data-wor="J-00011^0^90" title="5TON ( 1.3h )" style="left:0%;width:3.333%;" class="bg-red">&nbsp;90</div>
            <div data-wor="J-00011^0^100" title="10TON ( 40.2m )" style="left:0%;width:3.333%;" class="bg-red">&nbsp;100</div>
            <div data-wor="J-00011^0^110" title="10TON ( 2.0h )" style="left:0%;width:3.333%;background-size:44.166666666666664% 100%;" class="bg-red">&nbsp;110</div>
            <div data-wor="J-00011^0^120" title="ASSY ( 2.0h )" style="left:0%;width:3.333%;" class="bg-red">&nbsp;120</div>
            <div title="Wed Feb 20 2019 08:00:00 GMT+0800 (Singapore Standard Time)" class="arrow-left" style="left:0px;"></div>
          </div>
        </td>        
        
      */
      
      // JOBSCHED - convert div > table
      /*
      dom.find('td.bar > .datagrid-cell').each(function(){
        var old = $(this).html();
        var htm = old.replace(/<div/gi, "<td").replace(/<\/div>/gi,"</td>");
        $(this).html(`<table><tr>${htm}</tr></table>`);
      });
      */
      
      // JOBPLAN - Convert UL>LI to TABLE>TR>RD
      var htm = dom.html();
      return htm
        .replace(/<ul/gi, "<table")
        .replace(/<li/gi, "<tr><td")
        .replace(/<\/li>/gi, "</td></tr>")
        .replace(/<\/ul>/gi, "</table>")        
    }
    
    return jq.each(function(){
      var uri = 'data:application/vnd.ms-excel;base64,'
      ,template = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <!--[if gte mso 9]>
            <xml><x:ExcelWorkbook>
            <x:ExcelWorksheets>
            <x:ExcelWorksheet>
            <x:Name>{worksheet}</x:Name>
            <x:WorksheetOptions>
            <x:DisplayGridlines/>
            </x:WorksheetOptions>
            </x:ExcelWorksheet>
            </x:ExcelWorksheets>
            </x:ExcelWorkbook>
            </xml>
          <![endif]-->
        <style>${opts.style}</style>
        </head>
        <body>
          <table>{table}</table>
        </body>
      </html>`
      , base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))) }
      , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }

      var alink = $('<a style="display:none"></a>').appendTo('body');
      var view = $(this).datagrid('getPanel').find('div.datagrid-view');
      
      var table = view.find('div.datagrid-view2 table.datagrid-btable').clone();
      var tbody = table.find('>tbody');
      view.find('div.datagrid-view1 table.datagrid-btable>tbody>tr').each(function(index){
        $(this).clone().children().prependTo(tbody.children('tr:eq('+index+')'));
      });
      
      var head = view.find('div.datagrid-view2 table.datagrid-htable').clone();
      var hbody = head.find('>tbody');
      view.find('div.datagrid-view1 table.datagrid-htable>tbody>tr').each(function(index){
        $(this).clone().children().prependTo(hbody.children('tr:eq('+index+')'));
      });    
      hbody.prependTo(table);
      
      /*
        a#dg2excel
        var cbo = $('#content .datagrid-view:visible:first .datagrid-f');
      cbo.datagrid('toExcel',cbo.attr('id')+'.xls'||'datagrid.xls');
      */
      
      var ctx = { 
        worksheet: name || 'Worksheet', 
        table: opts.parser(table||'')
      };
      
      alink[0].href = uri + base64(format(template, ctx));
      alink[0].download = filename;
      alink[0].click();
      alink.remove();
    })
  }
});

$.extend($.fn.datagrid.defaults.editors, {
	label:{
		init:function(container,options){
			return $('<div class="label"></div>').appendTo(container);
		},
		getValue:function(target){
			return $(target).html();
		},
		setValue:function(target,value){
			$(target).html(value);
		},
		resize:function(target,width){
			$(target)._outerWidth(width);
		}
	}
});


$.extend($.fn.datagrid.defaults.view,{
  onAfterRender: function(e){
    var dg = $(e);
    var header = dg.datagrid('getPanel').find('.datagrid-header');
    var fields = dg.datagrid('getColumnFields',true).concat(dg.datagrid('getColumnFields',false));
    fields.map(function(field){
      var col = dg.datagrid('getColumnOption', field);
      if (col.sortable) header.find('td[field="'+field+'"] .datagrid-cell').addClass('datagrid-sort');
    })
  }
  
})

/*  #TREE */
/** TREE-DEFAULTS **/
$.extend($.fn.tree.defaults, {
  locked: false,
  method:eui.ajax_method,

	keyHandler:{
		
		down: function(e){
			$(this).combotree('tree').trigger(e);
		},
		
		up: function(e){
			$(this).combotree('tree').trigger(e);
		},
		
		left: function(e){
			$(this).combotree('tree').trigger(e);
		},
		
		right: function(e){
			$(this).combotree('tree').trigger(e);
		}
	},

  formatter:function(node){
    var txt = node.text;
    if(node.cls) txt = '<span class='+node.cls+'>'+node.text+'</span>';
    //if(node.count && node.children) txt += '<span class="count">('+node.children.length+')</span>';
    if(node.count || node.count==0) txt += '<span class="count">('+node.count+')</span>';
    return txt;
  },

  onBeforeLoad: function(node,param){
    var opt = $(this).tree('options');
    /*
    var sid = $(this).attr('_sqlid');
    if(sid) {
      var bits = sid.split('^');
      if(bits.length==2) opt.url = '/?_func=get&_sqlid='+bits[1]+'&_vpath='+bits[0]; 
      else $(this).tree('options').url = gurl('/?_func=get&_sqlid='+sid);
    }
    */
    
    if(!dwap.noron && dwap.ronly) {
      $(this).tree('disableDnd');
      $(this).tree('options').onContextMenu = function(e){e.preventDefault(); return false;};
    }
  },
  
  onBeforeSelect: function(){
   if($(this).tree('options').locked) return false; 
  },
  
  onBeforeCheck: function(node,checked){ 
  },
  
  onCheck: function(node,checked){
    var sqlid = $(this).attr('_sqlid');
    if(!sqlid) return;
    if(!checked) checked=null;
    
    // 180906- switch to get.
    ajaxget('/',{
      _func   : 'upd',
      _sqlid  : sqlid,
      text    : node.text,
      value   : checked
    },function(data){
      // do nothing.  
    })
    
    /*
    $.ajax({
      async: false,
      type: "GET", 
      url: gurl('/?_func=upd&_sqlid='+sqlid+'&text='+node.text+'&value='+(checked))
    }).done(function(data) {
    })
    */
  }
})

/** TREE-METHODS **/
$.extend($.fn.tree.methods, {

  getLevel: function(jq,target){
    return $(target).find('span.tree-indent,span.tree-hit').length;
  },

  lock:function(me,node){if(node) me.tree('select',node.target); me.tree('options').locked=true},
  
  unlock:function(me,node){me.tree('options').locked=false; if(node) me.tree('select',node.target)},

	move: function(jq, param){
		return jq.each(function(){
			var t = $(this);
			var li = $(param.target).parent();
			li = param.dir=='up' ? li.prev() : li.next();
			var pnode = li.children('div.tree-node');
			if (pnode.length){
				var data = t.tree('pop', param.target);
				var options = {data:data};
				if (param.dir == 'up'){
					options['before'] = pnode[0];
				} else {
					options['after'] = pnode[0];
				}
				t.tree('insert',options);
			}
		})
	},

  getLeafs: function(jq){
    var leafs = [];
    $.map(jq.tree('getChildren'), function(node){
      if (jq.tree('isLeaf', node.target)) leafs.push(node);
    });
    return leafs;
  },
	
	setIcon:function(jq,data){
  	data.icon.iconCls = data.icon;
  	$(data.node.target).find('span.tree-icon').addClass(data.icon);
	},

	clearIcon:function(jq,data){
  	data.icon.iconCls = data.icon;
  	$(data.node.target).find('span.tree-icon').removeClass(data.icon);
	},
	
	setFocus:function(jq,nid){
    var node = jq.tree('find',nid);
    jq.tree('select', node.target);
    jq.tree('expandTo',node.target);
    return node;  	
	},
	
	getRoot: function(jq, nodeEl){
		if (nodeEl){
			var target = nodeEl;
			var p = jq.tree('getParent', target);
			while(p){
				target = p.target;
				p = jq.tree('getParent', p.target);
			}
			return jq.tree('getNode', target);
		} else {
			var roots = jq.tree('getRoots');
			return roots.length ? roots[0] : null;
		}
	}
})

/* 
  ##MULTIBOX - MAIN 
  
  TODO:
  1. Find Better method than using onChange for form load

*/
$.parser.plugins.push('multibox');
$.fn.form.defaults.fieldTypes.unshift('multibox');

$.fn.multibox = function(options,param){

  function create(tgt){
  	var state = $.data(tgt, 'multibox');
  	var opts = state.options;
  	
  	var me = $(tgt);
  	me.addClass('multibox-f');
  	me.attr('multiboxname', me.attr('name'));

    // Prevent multiple-create
    if(opts.init) return;
    opts.init = true;
    
  	me.combo($.extend({}, opts, {}));
    var pan = me.multibox('panel');

    // create panel
    function panadd(){
      
      // styling
      pan.panel({
        openAnimation   : 'slide',
        closeAnimation  : 'slide',
        onOpen: function(){
          me.multibox('getIcon', 0).addClass('open');
        },
        
        onClose: function(){
          me.multibox('getIcon', 0).removeClass('open');  
        }
      });
  
      pan.append('<div class="multi-items">');
      pan = pan.find('.multi-items');
      
      // striping
      if(opts.striped || me.hasClass('striped')) pan.addClass('striped');
      
      // multi-column dropdown.
      pan.addClass({
        1 : 'one',
        2 : 'two',
        3 : 'three',
        4 : 'four'
      }[opts.columns]);
    }

    // initial load data
    function load(data){
      data.map(function (el){
        chk = '';
        var cbox = $('<input type="checkbox" data-name="'+el.value+'" '+chk+'/>');
        cbox[0].onclick = function(){
          opts.onChecked(me,pan);
        }
        var lab = $('<label>'+el.text+'</label>');
        var opt = $('<div/>');
        opt.append(cbox).append(lab);
        pan.append(opt);
      });
    }
    
    // add the panel
    panadd();
    
    // MAIN - sqlid or data
    opts._sqlid = opts._sqlid || me.attr('_sqlid') || null;
    
    if(opts._sqlid) {
      opts.url = eui.sqlid(opts._sqlid);
      ajaxget(opts.url,{},function(data){
        opts.data = data;
        load(data);  
      })          
    } 
    
    else load(opts.data);
    
  } // /create

	if (typeof options == 'string'){
		var method = $.fn.multibox.methods[options];
		if (method){
			return method(this, param);
		} else {
			return this.combo(options, param);
		}
	}
	
	options = options || {};
	return this.each(function(){
		var state = $.data(this, 'multibox');
		if (state){
			$.extend(state.options, options);
		} else {
			state = $.data(this, 'multibox', {
				options: $.extend({}, $.fn.multibox.defaults, $.fn.combo.parseOptions(this), options)
			});
		}
		create(this);
		
		// Testing
		state.options._onChange = state.options.onChange;
	});
};

/* ##MULTIBOX - DEFAULTS */
$.fn.multibox.defaults = $.extend({}, $.fn.combo.defaults, {
  
  validType       : 'minLength[1]',
  striped         : true,
  required        : false,
  editable        : false,
  prompt          : 'Selected Items (0)',
  data            : [],
  init            : false,
  seperator       : ',',
  _sqlid          : null,
  columns         : 1, /* multi-column dropdown 1,2,3,4 */

  onChecked: function(me,pan){
    var opts = me.multibox('options');
    var cbs = pan.find('input:checkbox');
    
    // save old values for onSelect();
    var ov = me.multibox('getValue');
    if(ov == [""]) ov = [];
    else ov = ov.split(opts.seperator);

    var vals = [];
    cbs.each(function(){
      var el = $(this);
      if(!el[0].checked) return;
      vals.push(el.data('name'));
    });
    
    me.multibox('setSelected',vals);
    
    
    me.multibox('options').onSelect(vals,ov);
  },
  
  onSelect: function(nv,ov){
    //console.log('@@@>>',nv,ov);
  }
  
});

/* ##MULTIBOX - METHODS */
$.fn.multibox.methods = {
	
	options: function(jq){
		var copts = jq.combo('options');
		return $.extend($.data(jq[0], 'multibox').options, {
			width         : copts.width,
			height        : copts.height,
			originalValue : copts.originalValue,
			disabled      : copts.disabled,
			readonly      : copts.readonly
		});
	},

  setSelected: function(jq,vals){
    return jq.each(function(){
      var me = $(this);
      var opts = me.multibox('options');
      me.textbox('setValue',vals.join(opts.seperator));
      var prompt = '';
      if(vals.length) prompt = `Selected Items (${vals.length})`;
      me.multibox('setText',prompt);
    })        
  },
  
  // custom setValue
  setValue: function(jq,val){
    return jq.each(function(){
      //cl('@@ debug setValue',val);
      var me = $(this);
      var opts = me.multibox('options');
      var vals = val.split(opts.seperator);
      var ons = [];
      vals = vals.filter(function(e){return e}); 
      var pan = me.multibox('panel');      
      pan.find('input:checkbox').each(function(){
        var el = $(this);
        var name = el.data('name');
        if(name && vals.indexOf(name) > -1) {
          el[0].checked = true;
          ons.push(name);
        }
        else el[0].checked = false; 
      });
      //cl('ons:',ons)
      me.multibox('setSelected',ons);
    }) //each 
  }

}


