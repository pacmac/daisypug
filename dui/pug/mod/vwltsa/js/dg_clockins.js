// exceed threshold ?
$.dui.page.isover = function(row){
  if(!$.dui.page.thold) $.dui.page.thold = parseFloat($('#dgstat').datagrid('getData').thold);
  //console.log(row);
  if (row){
	  if (row.inday==undefined)return false;
	  else {
		  var dy = row.inday.substr(0,4)+'-'+row.inday.substr(4,2)+'-'+row.inday.substr(6,2);
		  var ts = new Date(dy+'T'+row.intime);
		  var dur = ((new Date() - ts)/3600000);
		  if(dur > $.dui.page.thold) return true;
		  return false;  	  
	  }
  }
  else return false;

}
var os = {
  info: false,
  striped:false,
  url:'/?_func=get&_sqlid=vwltsa^clockins',
  cols: [
    {field:"emp_id",title:"ID"},
    {field:"name",title:"Operator  Name"},
    {field:"department_id",title:"Department ID"},
    {field:"shift",title:"Shift ID"},
    {field:"status",title:"Status", width:50, fixed:true,
      formatter:function(val){
        return {'Run':'RUN','Setup':'SETUP','Indirect':'INDIR'}[val];
      }
    },
    {field:"inday",title:"In Day",formatter:function(val,row,idx){
      if (val=='' || val==undefined) return '';
      else  return val.substr(0,4)+'-'+val.substr(4,2)+'-'+val.substr(6,2);
	  
    }},
    
    {field:"intime",title:"In Time"},    
    {field:"flags",title:"Flags",align:'center',formatter:function(val,row,idx){
      var divs = ''; var cls = {'Run':'RUN','Setup':'SETUP','Indirect':'INDIR'}[row.status];
      if(cls) cls=cls.toLowerCase(); else cls='';
      divs += '<div class="'+cls+'"/>';
      
      // Threshold
      if($.dui.page.isover(row)) divs += '<div class="thold" title="Shift Exceeded"/>';
      return divs;
    }},
    {field:"bar",title:"Active Operations",width:1500}
  ],
  onLoad:function(data){},
  
  rowStyler:function(idx,row){
		if ($.dui.page.isover(row)){
			return {class:'fg-red'};	
		}
	}
}
