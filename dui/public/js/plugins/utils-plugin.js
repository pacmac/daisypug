/**
 * DUI Utils Plugin — Pure utility functions (zero DOM dependencies)
 *
 * Date/time helpers, string/object manipulation, localStorage wrappers.
 * All functions registered as window globals for page script access.
 * Moved from ESM utils.js / main.js bundle — eliminates esbuild step.
 */
;(function() {
  'use strict';

  // ===== Date Prototypes =====
  Date.prototype.getHrMin = function(){ return pad(this.getHours(),2)+':'+ pad(this.getMinutes(),2)+':00';}
  Date.prototype.setHrMin = function(hm){var bits = hm.split(":"); this.setHours(bits[0]);this.setMinutes(bits[1]);return this;}
  Date.prototype.isValid = function () {return this.getTime() === this.getTime()};

  // ===== Date/Time =====
  function now(){return new Date()}
  function today(){return new Date().setHours(0,0,0,0)}
  function hrmin() {var d=new Date; return d.getHours()+':'+d.getMinutes()}
  function ms2date(str,dss){ if(!str) return str; else if(dss=='d') return str.split('T')[0];else if(dss=='t') return str.split('T')[1]; else return str.replace('T',' ').replace('Z','')}
  function myDate(date){ var y = date.getFullYear(); var m = pad(date.getMonth()+1,2); var d = pad(date.getDate(),2); return y+'-'+m+'-'+d;}
  function myTime(date){var y = date.getFullYear(); var m = pad(date.getMonth()+1,2); var d = pad(date.getDate(),2); var h = pad(date.getHours(),2); var i = pad(date.getMinutes(),2);var s = pad(date.getSeconds(),2);return y+'-'+m+'-'+d+' '+h+':'+i+':'+s;}
  function yymmdd(date){ var y = date.getFullYear()-2000; var m = pad(date.getMonth()+1,2); var d = pad(date.getDate(),2); return y+m+d;}
  function ymd2date(ymd){var bits = ymd.split('-'); return new Date(parseInt(bits[0]), parseInt(bits[1])-1, parseInt(bits[2]));}

  function isodate(date,fmt){
    if(date instanceof Date){
      var y=date.getFullYear(),m=pad(date.getMonth()+1,2),d=pad(date.getDate(),2);
      if(fmt) return y+'-'+m+'-'+d;
      else return y+m+d;
    }
    var dstr = date.toString();
    if(dstr.length != 8) return date;
    var b = dstr.match(/([0-9]{4})([0-9]{2})([0-9]{2})/);
    return new Date(b[1]+'/'+b[2]+'/'+b[3]);
  }

  function isdate(date){if(date instanceof Date == false) return false; return !isNaN( date.getTime())}
  function tz2date(val){if(!val) return val; return val.split('T')[0]}
  function iso2str(iso){if(!iso) return iso; var arr=iso.toString().match(/([0-9]{4})([0-9]{2})([0-9]{2})/); if(arr) return arr.splice(1).join('-'); return iso;}

  // Date Formatters
  function datetimef(str){return new Date(str).toString().split(' ').slice(1,5).join(' ');}
  function datef(str){return new Date(str).toString().split(' ').slice(1,4).join(' ');}
  function timef(str){return new Date(str).toString().split(' ')[4];}

  function daysBetween(one, another) {
    return Math.round(Math.abs((+one) - (+another))/8.64e7);
  }

  // ===== String/Object =====
  function ireplace(str,h,n){
    if(str && str.length > 0) return str.replace(h,n);
    return str;
  }

  function multisort(arr,sf) {
    var s = '';
    sf.forEach(function(f,idx) {
      if(f.charAt(0)=='<'){f = f.replace('<',''); var k = '<';} else k = '>';
      s += 'if(arguments[0].'+f+k+'arguments[1].'+f+') return 1;';
      s += 'else if(arguments[0].'+f+'==arguments[1].'+f+')';
      s += (idx < sf.length-1)? '{' : 'return 0';
    });
    s += Array(sf.length).join('}')+';return -1';
    return arr.sort(new Function(s));
  }

  function mobileurl(url){if(!(/mobile/).test(url)) return url+='&mobile='+mobile;else return url;}
  function jsonParse(data){try{return JSON.parse(data)} catch(e){return data}}
  function jsonString(data){try{return JSON.stringify(data)} catch(e){return data}}
  function jsontry(data){try{return JSON.parse(data)} catch(e){return data}}
  function pad(val,max) { var str=val.toString(); return str.length < max ? pad("0" + str, max) : str;}
  function plus(n){return(n > 0) ? "+" + n : n;}
  function dic2str(obj){return JSON.stringify(obj).replace(/"/g,"'").slice(1,-1)}
  function unique(arr){return Array.from(new Set(arr))}
  function url2obj(uv) {return uv.replace(/\/\?|\?/,'').split("&").map(function(n){return n = n.split("="),this[n[0]] = n[1],this}.bind({}))[0];}
  function obj2arr(arr){if(!arr) return []; else if(!Array.isArray(arr)) return[arr]; return arr;}
  function str2dic(str){return JSON.parse('{'+str.replace(/'/g,'"')+'}')}

  function tokparse(str,qry){
    if(!qry || !str) return str;
    Object.keys(qry).sort().reverse().map(function(key){
      var reg = new RegExp('\\$'+key,"g");
      str = str.replace(reg,qry[key]);
    });
    return str;
  }

  function keysort(array, key) {if(!array) return; return array.sort(function(a, b) {var x = a[key]; var y = b[key];return ((x < y) ? -1 : ((x > y) ? 1 : 0));});}
  function objidx(ar,key,val){return ar.map(function(e){return e[key]}).indexOf(val);}
  function arrdel(arr,key,vals){var i=arr.length; while(i--) {if(vals.indexOf(arr[i][key])!==-1) arr.splice(i,1);}}
  function clone(obj){
    try{return JSON.parse(JSON.stringify(obj))}
    catch(err){return null}
  }
  function proper(str){return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});}
  function nocrlf(str){ if(!str) return; return str.toString().replace(/\n/g,'').replace(/\r/g,'')}
  function fext(fname){return fname.substr((~-fname.lastIndexOf(".") >>> 0) + 2);}
  function extension(path){ var extn = path.match(/\.([0-9a-z]+)(?:[\?#]|$)/i); if(extn) return extn[1];return null}

  function woref2text(wor){
    if(!wor) return '';
    var bits = wor.split('^');
    var ref = bits.slice(0,2).join('.');
    if(bits.length==3) ref += ' - '+bits[2];
    return ref;
  }

  function extncls(ext){
    var extn=false, types={
      doc:['doc','txt','rtf','csv','docx','dot'],
      zip:['zip','tar'],
      table_excel:['xlsx'],
      ppt:['ppt'],
      pdf:['pdf'],
      img:['png','gif','jpg'],
      xls:['xls','xlsx','xlst','xlsm']
    };
    for(var f in types){types[f].map(function(e){if(e==ext.toLowerCase()) extn=f})}
    return extn;
  }

  // Object path resolver (dwap.page.xxx → value)
  function dotval(x){
    var b = x.split('.');
    var z = window[b.shift()];
    b.map(function(b){ z = z[b]; });
    return z;
  }

  // Rename object keys
  function krename(obj,keys){
    for(var key in keys){
      if(obj.hasOwnProperty(key)) {
        obj[keys[key]] = obj[key];
        delete obj[key];
      }
    }
    return obj;
  }

  // ===== Cookies (real document.cookie) =====
  function cookget(name) {return (name = new RegExp('(?:^|;\\s*)' + ('' + name).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '=([^;]*)').exec(document.cookie)) && name[1];}
  function cookdel(name) {document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';}

  // ===== LocalStorage (cookie-style API) =====
  function putcook(name,value,days){localStorage.setItem(name,JSON.stringify(value))}
  function getcook(name) { var data = localStorage.getItem(name); if(data) return JSON.parse(data)}
  function delcook(name) { localStorage.removeItem(name)}
  function getacook(name,def){var val = getcook(name); if(val) return val; else if(def) return def; else return [];}

  function putacook(name,val,opt){
    opt = opt || {'max':false,'append':false};
    if(!Array.isArray(val)) val=val.split(',');
    var cook = getacook(name);
    if(!cook || !opt.append) cook=val; else val.map(function(e){if(cook.indexOf(e)==-1) cook.push(e);});
    if(opt.max && cook.length > opt.max) cook.splice(opt.max-1);
    putcook(name,cook);
    return cook;
  }

  function putocook(name,obj){
    try {var js = JSON.stringify(obj)}
    catch(err){var js={}}
    putcook(name,js);
  }

  function getocook(name,obj){
    var str = getcook(name);
    try {return JSON.parse(str)}
    catch(err){return {}}
  }

  // ===== Register all as window globals =====
  var fns = {
    now:now, today:today, hrmin:hrmin, ms2date:ms2date, myDate:myDate, myTime:myTime,
    yymmdd:yymmdd, ymd2date:ymd2date, isodate:isodate, isdate:isdate, tz2date:tz2date,
    iso2str:iso2str, datetimef:datetimef, datef:datef, timef:timef, daysBetween:daysBetween,
    ireplace:ireplace, multisort:multisort, mobileurl:mobileurl, jsonParse:jsonParse,
    jsonString:jsonString, jsontry:jsontry, pad:pad, plus:plus, dic2str:dic2str, unique:unique,
    url2obj:url2obj, obj2arr:obj2arr, str2dic:str2dic, tokparse:tokparse, keysort:keysort,
    objidx:objidx, arrdel:arrdel, clone:clone, proper:proper, nocrlf:nocrlf, fext:fext,
    extension:extension, woref2text:woref2text, extncls:extncls, dotval:dotval, krename:krename,
    cookget:cookget, cookdel:cookdel, putcook:putcook, getcook:getcook, delcook:delcook,
    getacook:getacook, putacook:putacook, putocook:putocook, getocook:getocook
  };
  Object.assign(window, fns);

  if ($.dui && $.dui._plugins) $.dui._plugins.loaded.push('utils-plugin');

})();
