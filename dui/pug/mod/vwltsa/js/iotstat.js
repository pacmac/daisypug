

$.dui.page.dodgrid = function(){
    $('#txgrid').datagrid({
      toolbar:'#tbar',
      fit:true,
      fitColumns:true,
      queryParams: frm2dic($('form#gfilter')),
      url:'/?_func=get&_sqlid=vwltsa^mcstat',
      //url:'/',
      //queryParams:{
      //  _sqlid:'vwltsa^part_trace',
      //  _func:'get',
      //  sdate:null,
      //  edate:null
      //},
      checkOnSelect:false,
      singleSelect:true,
      method: 'get',
      striped:true,
      columns: [[
        {field:"MODE",title:"Mode",align:"center",formatter:function(val,row,idx){
          var divs = ''; var cls = {'R':'RUN','S':'SETUP','I':'INDIR'}[val];
          //if(cls) cls=cls.toLowerCase(); else cls='';
          //console.log(cls);
          //divs += '<div class="'+cls+'"/>';
  
          return '<span style="width:100px;height:100px;" class=icon-'+cls+'>'+cls+'</span>';
        }},
  
        {field:"ENABLE",title:"Enable",align:"center",formatter:function(val,row,idx){
  
          var en={"y":"icon-tick","n":"icon-cross"}[val];
  
          //console.log(en);
          return '<span  >'+val.toUpperCase()+'</span>';
         // return '<span style="width:100px;height:100px;" >'+val.toUpperCase()+'</span>';
         // return val;
          
        }},
        {field:"MAC_ID",title:"MAC ID"},
        {field:"EMP_ID",title:"Operator ID"},
        {field:"RESOURCE_ID",title:"Resource ID",align:"left"},
        {field:"TRANS_DATE",title:"last Ticket Date",align:"left",formatter:function(val,row,idx){
          //return(isodate(new Date(val),true));
          return val.replace('T',' ').replace('.000Z','');
        }},
        {field:"WOREF",title:"Job Reference",align:"left",formatter:function(val,row,idx){return val.split('^').join('.')}},
        {field:"CALC_START_QTY",title:"Reqd Qty",align:"right"},
        {field:"COMPLETED_QTY",title:"Good Qty",align:"right"},
        {field:"DEVIATED_QTY",title:"Bad Qty",align:"right"},
        {field:"qbal",title:"Bal Qty",align:"right"},
        {field:"BATLEV",title:"% Batt Level",align:"center",
        /*formatter:function(val,row,idx){
            return val.toFixed(2)*100;
        }
        */
        formatter:function(value){
          
          var val=value.toFixed(2)*100;
          if (val>=90) var val1=90;
          if (val<90 && val>=80) var val1=80;
          if (val<80 && val>=70) var val1=70;
          if (val<70 && val>=60) var val1=60;
          if (val<60 && val>=45) var val1=45;
          if (val<45 && val>=30) var val1=30;
          if (val<30 && val>=15) var val1=15;
          if (val<15 && val>=0) var val1=0;
          
          //console.log(val1);
          
          var col={0:"#ff0000",15:"#ff4000",30:"#ff8000",45:"#ffbf00",60:"#ffff00",70:"#40ff00",80:"#00ff00",90:"#00ff40"}[val1];
          //console.log(val)
          //console.log(col)
          if (val>=0){
            
              var s = '<div style="width:100%;border:1px solid #ccc">' +
                      '<div style="background:'+col+';color:#fff">' + val + '%' + '</div>'
                      '</div>';
              return s;
          } else {
              return '';
          }
      }},
        
        {field:"cbar",title:"% Complete",align:"left",width:100,fit:true,
          formatter:function(value){
            if (value){
                var s = '<div style="width:100%;border:1px solid #ccc">' +
                        '<div style="width:' + value + '%;background:#0080ff;color:#fff">' + value + '%' + '</div>'
                        '</div>';
                return s;
            } else {
                return '';
            }
        }
        },
      ]],
        onBeforeLoad:function(qp){
         // if(!qp.sdate) return false;  
        },

      
      onLoadSuccess:function(){
        $('form#parttrans').form('clear');
      }
    });
  }
  
  $.page.ready(function(){
    

    /*
    $('form#parttrans').attr('mode','upd').on('loadDone',function(){
      var data = frm2dic($(this));
    })
    */
    setTimeout(function(){
      $.dui.page.dodgrid();
      $('#txgrid').datagrid('reload');
      $('form#gfilter').form({
        onChange:function(){
          $('#txgrid').datagrid('reload',frm2dic($('form#gfilter')));  
        }
      })      
        
    })
   /* 
    setInterval(function(){
         $('#txgrid').datagrid('reload');
    },5000)
    */
  })