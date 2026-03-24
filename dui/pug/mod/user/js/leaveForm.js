//console.log(dwap);

$.dui.page.bal=function(){
  var yr=$.dui.page.yearno();
  ajaxget('/',{_sqlid:'admin^user_leaveBal', _func:'get',UID:$.dui.udata.userid,YEAR_NO:yr},function(data){
      //console.log(data);           
      if (data.BAL==undefined) {
          msgbox('**<b>Your Leave Entitlement for Year '+yr+' not configured yet.</b>**\n Please check with your System Admin (User Manager>Leave>Entitlement) ');
          butEn('x');
      }
      else butEn('sx');
      var bal=parseFloat(data.BAL)-parseFloat(data.DAYS)

      $('#BALANCE').textbox('setValue',bal);
  });
}
$.dui.page.yearno=function(){
  var s1=$('#START_DATE').datebox('getValue');
  return new Date(s1).getFullYear();
}
  //calculate number of days
  $.dui.page.days=function(){
    $.dui.page.bal();
    var s1=$('#START_DATE').datebox('getValue');
    var s2=$('#END_DATE').datebox('getValue');
    
    var date1=new Date(s1);
    var date2=new Date(s2);

    /*
    if (date1){
      if (date1.getDay()==0 || date1.getDay()==6) {
        msgbox('Date in weekend, Pls re-select ');
        $('#START_DATE').datebox('setValue','');

        $('#DAYS').numberspinner('setValue',0);
        return '';
      }
    }

    if (date2){
      if (date2.getDay()==0 || date2.getDay()==6) {
        msgbox('Date in weekend, Pls re-select ');
        
        $('#END_DATE').datebox('setValue','');
        $('#DAYS').numberspinner('setValue',0);
        return '';
      }
    }
    */

    var p1=$('#START_PERIOD').combobox('getValue');
    var p2=$('#END_PERIOD').combobox('getValue');

    //check the date range in weekend
    var weekends=0;
    while (date1<=date2){
      var day=date1.getDay();

      if (day==0 || day==6) {
        weekends+=1;
        //console.log('wk:'+weekends);
      }
       // if (p1==p2) diffDays-=0.5;
      //  else diffDays-=1; 
      
      date1.setDate(date1.getDate() + 1);
    }

    var D1H=new Date(s1).getDay();
    var D2H=new Date(s2).getDay();

    var H1=0;
    var H2=0;
    if (D1H==0 || D1H==6) var H1=1;
    if (D2H==0 || D2H==6) var H2=1;
    


  switch (H1){
    case 1:
        if (H2==0){
            if (p2=="AM")weekends=weekends+0.5;
            else weekends=weekends+0;
        }    
        break;
    case 0:
        if (H2==0){
               if (p1=="AM"){
                   if (p2=="AM")weekends=weekends+0.5; 
                   else   weekends=weekends+0;
               }
               else
               {
                   if (p2=="AM") weekends=weekends+1; 
                   else weekends=weekends+0.5;
               }
        }
        break;
}

    //console.log('wk ='+weekends);
    var dd1=new Date(s1);
    var dd2=new Date(s2);

    var one_day = 24*60*60*1000;
    
    var timeDiff = one_day+ Math.abs(dd1.getTime() - dd2.getTime());
   // console.log('timeOff0 ='+timeDiff);
   // if (dd1==dd2) timeDiff += ( 3600*24*1000);
   // console.log('timeOff1 ='+timeDiff);

    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
      diffDays =diffDays - weekends;
    $('#DAYS').numberspinner('setValue',diffDays);
  }
  //Leave History
  $.dui.page.History = {
    rownumbers: true,
     //queryParams: frm2dic($('form#gfilter')),
      checkOnSelect:false,
      singleSelect:true,

      striped:true,
    //url: '/?_func=get&_sqlid=admin^user_leaveHistory',
    url: '/',
    toolbar:'#tbar',
    queryParams:{
      _func:'get',
      _sqlid:'admin^user_leaveHistory',
      _dgrid:'y',
      YEAR_NO:new Date().getFullYear(),
      UID:$.dui.udata.userid
    },
    columns:[[
      {field:'UID',hidden:true},
      {field:"TYPE", title:"Type", width:100},
      {field:'TRANSACTION_ID', title:"Tx ID", width:80},
      {field:"YEAR_NO", title:"Year No", width:60},
      {field:"START_DATE", title:"Start Date", width:80,formatter:eui.date},
      {field:"START_PERIOD", title:"AM/PM", width:50},
      {field:"END_DATE", title:"End Date", width:80,formatter:eui.date},
      {field:"END_PERIOD", title:"AM/PM", width:50},
      {field:"DAYS", title:"#Days", width:50},
      {field:"STATUS", title:"Status", width:70,formatter:function(val,row,idx){  
          var status={"R":"Rejected","A":"Approved","P":"Pending","X":"Cancelled"}[val];
          return status;
        }
      },
      {field:"STATUS_DATE", title:"Approved Date", width:160,formatter:function(val,row,idx){
        if (val) return val.replace('T',' ').replace('.000Z','');
        else return '';
        }},
      {field:"CREATE_DATE", title:"Apply Date", width:160,formatter:function(val,row,idx){
          if (val) return val.replace('T',' ').replace('.000Z','');
          else return '';
        }},
    ]]
  }

  $( document ).ready(function() {

   // 
   // console.log(dwap);
      // Hide Buttons.
  setTimeout(function(){
    var tbar = $('#hist').datagrid('options').tbar;
    tbar.dgre_add.hide();
    tbar.dgre_del.hide();
    tbar.dgre_edit.hide();
    tbar.dgre_ok.hide();
  });

     $('#but_add').on('done',function(){
        $('.lock').removeClass('lock');
        $('#UID').textbox('setValue',$.dui.udata.userid);
        $('#START_DATE').datebox('setValue',new Date());
        $('#END_DATE').datebox('setValue',new Date());
        $('#START_PERIOD').combobox('setValue','AM');
        $('#END_PERIOD').combobox('setValue','AM');

        $.dui.page.bal();

    })


    $('form#leaveForm').on('success',function(jq,mr){
      $('form#leaveForm').attr('mode','add');
      $.dui.page.bal();
    })

  /*
  $('.daysCalc').datebox({
      onChange:function(){
        $.dui.page.days();
      }
    })
    */
  
    $('#START_DATE').datebox({onChange:function(){   
        $.dui.page.days();  
      }  
    })
    $('#END_DATE').datebox({ onChange:function(){    $.dui.page.days();  }  })
    $('#START_PERIOD').combobox({  onSelect:function(){   $.dui.page.days();    } })
    $('#END_PERIOD').combobox({    onSelect:function(){   $.dui.page.days();    }  })

    var dg1=$('#hist');
    dg1.datagrid('rowEditor',$.dui.page.History);
    
  })