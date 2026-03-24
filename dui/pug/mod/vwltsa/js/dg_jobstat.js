var os={
  
  xonRowContextMenu: function(e){
    e.preventDefault();
  },

  onDblClickRow: function(idx,row){
    loadpage('vwltsa^sa_jobman&WOREF='+row.WOREF.split('.')[0]);
  },
  
  onLoad: function(){
    $('td div.info').tooltip({
      position:'right',
      onShow: function(e){
        //var opt = $(this).tooltip('options');
        //var bits = opt.content.split('^');
        //$(this).tooltip('update',dat);
        $(this).tooltip('tip').css({
          backgroundColor: '#f0f8ff',
          borderColor: '#AAAAAA',
          boxShadow: '3px 3px 6px #999999'
        });
      }
    });  
  },
  
  info: true,
  striped:false,
  url:'/?_func=get&_sqlid=vwltsa^jobstat',
  cols:[

    {field:"INFO",title:"Info",width:30,fixed:true, formatter:function(val,row,idx){
      var txt = row.USER_6 +'<br/>'+row.USER_9;
      if(txt.length > 5) return '<div class="info" title="'+txt+'"></div>'
    }},
        
    {field:"WOREF",title:"Job ID",formatter:function(val,row,idx){
      return val.split('.')[0];
    }},
    
    {field:"DESIRED_WANT_DATE",title:"Job Want Date",align:"left",formatter:function(val,row,idx){
      return(isodate(new Date(val),true))
    }},
    
    {field:"HRS_BAL",title:"Job Hrs Bal",align:"right",formatter:function(val,row,idx){
      //return '-'; // << Delete this line When Working
      var bal = (row.BAL_HRS) || 0;

      return bal.toFixed(2);
    }},
    
    {field:"SEQUENCE_NO",title:"Opn No",align:"right"},
    {field:"RESOURCE_ID",title:"Resource ID",align:"left"},
    {field:"EMPLOYEE_ID",title:"Operator ID"},
    {field:"EMPLOYEE_NAME",title:"Operator Name"},
    {field:"CALC_END_QTY",title:"Reqd Qty",align:"right"},
    {field:"COMPLETED_QTY",title:"Comp Qty",align:"right"},
    {field:"qbal",title:"Bal Qty",align:"right"},

    {field:"NCR_FLAG", title:"NCR", width:35, fixed:true, styler:function(val,row,idx){
      if(row.NCR_ID) return ('background:url(../icons/flag_red.png) no-repeat scroll center center');
    }},    
    
    {field:"cbar",title:"% Complete",align:"left",width:100,fit:true,formatter:function(val,row,idx){
      var val1= val ||0;
      val = val1.toFixed(2);
      function stat(val){if(val>99) return 'grn'; if(val>50) return 'ora'; if(val>25) return 'blu';return 'gry';}
      return "<ul class='ulbar single'><li class="+stat(val)+" style=' background-size:"+val+"%'>"+val+"%</li></ul>";
    }},
    
    {field:"USER_9",title:"UDF",hidden:true},
    {field:"USER_6",title:"UDF",hidden:true},
  ]
}



 