
$.page.ready(function () {

/*
CLS, 2019-1-29, WIP COUNT INIT
*/
$.page.fn.opts = {

    editor: 'form',
    addData:{
        LINE_NO:'$autonum:1',
        WIP_COUNT_ID: '#WIP_COUNT_ID'
    },
    striped: true,
    url: '/',
    queryParams:{
      _sqlid:'inv^wip_count_jobs',
      _func:'get',
      _dgrid:'y',
    },
    rownumbers: false,
    _fitColumns: true,
    fit: true,
    //pagePosition: 'bottom',
    //pagination:true,
    //pageList: [25,50,100,250],
    //pageSize:25,
    columns: [[
      {field:'WIP_COUNT_ID',hidden:true},
      {field:'LINE_NO',title:'#',width:30,fixed:true,align:'center'},
      {field:'WOREF',title:'Opn Ref',width:150,fixed:true,align:'left',editor:{
        type:'qbe',
        options:{
          required:true,
          queryParams: {  
          _sqlid:'inv^wip_count_jobs'  ,
          _qbe:'y'
          },
        onDemand: true,
        multiCol: true,
        valueField: 'WOREF',
        
        fields:[
          {field:'text',title:'Opn Ref',editor:'textbox'},
          {field:'WO_CLASS',title:'Job Class'},
          {field:'PART_ID',title:'Part ID',editor:'textbox'},
          {field:'TRACE_ID',title:'Trace ID'},
          {field:'CP_REF',title:'CP Ref'},
          
        ],
        
        onSelect: function(rw){
            $('#_dgform > form input[textboxname=WOREF').textbox('setValue',rw.text);
            $('#_dgform > form input[textboxname=CP_REF').textbox('setValue',rw.CP_REF);
            
        }  
        }
      }},
      {field:'PART_ID',title:'Our Part ID',width:150,editor:{type:'qbe',options:{
        required:true,
          queryParams: {
            _sqlid:'inv^partid_qbe'  
          },
          onDemand: true,
          multiCol: true,
          valueField: 'ID',
          fields:[
            {field:'value',title:'Part ID',editor:'textbox'},
            {field:'DESCRIPTION',title:'Description',editor:'textbox',formatter:function(val){
              if(!val) return '';
              else return val.substring(0,50);
            }},
            {field:'ALIAS_DESC',title:'Alias',editor:'textbox'},
            {field:'TRACEABLE',title:'Traceable', editor:{type:'combobox',options:{panelHeight:'auto',data:[
              {value:'',text:'All', selected:true},
              {value:'Y',text:'Yes'},
              {value:'N',text:'No'},
            ]}}},
            {field:'DIM_TRACKED',title:'Dimensions', editor:{type:'combobox',options:{panelHeight:'auto',data:[
              {value:'',text:'All', selected:true},
              {value:'Y',text:'Yes'},
              {value:'N',text:'No'},
            ]}}},
            {field:'PART_CLASS_ID',title:'Part Class', editor:{type:'combobox',options:{panelHeight:'auto',data:[
              {value:'',text:'All', selected:true},
              {value:'FG',text:'Finished Goods'},
              {value:'COMP',text:'Component'},
              {value:'CONSUMABLE',text:'Consumable'},
              {value:'MAKE_STAGED',text:'Make Staged'},
              {value:'MAKE_NOSTAGE',text:'Make Unstaged'}, 
            ]}}},

          ],
          onSelect: function(rw){
            if (rw.TRACEABLE=='Y') var ro=true;
            else var ro=false;
            var TID=$('#_dgform > form input[textboxname=TRACE_ID');
            TID.textbox('required',ro);
            TID.textbox('readonly',!ro);
            $('#_dgform > form input[textboxname=DESCRIPTION').textbox('setValue',rw.DESCRIPTION);
          } 
      }}},
      {field:'CP_REF',title:'CP REF',width:100,fixed:true,editor:{type:'textbox',options:{readonly:false}}},
      {field:'DESCRIPTION',title:'Description',width:100,fixed:true,editor:{type:'textbox',options:{readonly:false}}},
      {field:'TRACE_ID',title:'Trace ID',width:100,fixed:true,align:'left',editor:{type:'textbox',options:{readonly:true}}},
      {field:'COUNT',title:'Count Qty',width:100,fixed:true,align:'left',
        editor:{type:'numberspinner',options:{ 
          precision:2,min:0,value:0,id:'count', readonly: false,
        }}
      },
      {field:'RECOUNT',title:'RECount Qty',width:100,fixed:true,align:'left',
      editor:{type:'numberspinner',options:{
          precision:2, min:0,value:0,id:'recount',readonly: false,
        }}
      },
      {field:'NOTES',title:'Notes',width:250,fixed:true,editor:{type:'textbox',options:{readonly:false,multiline:true,height:150,}}},

      ]],
    onRowContextMenu: function(e){return e.preventDefault()},
    onBeforeLoad:function(qp){
      var tf=true;
      if (!qp.WIP_COUNT_ID && !qp.WO_CLASS)  tf=false;
      return tf;
      
        },
    loadFilter: function(data){
        if(!data || (!data.rows && data.length==0)) data = {rows:[],total:0}
        return data;
    },
    onEndEdit: function(idx,row,chg){
        var url = "/?_sqlid=inv^wip_count_line";
        var data = clone(row);
        if (data.WIP_COUNT_ID==undefined){}
        else {
          ajaxget(url,data,function(data){}) 
        }
    },
    onSelect:function(idx,row){
        if (row) {
          if (row.WIP_COUNT_ID==undefined)	$(this).datagrid('options').tbar.dgre_edit.linkbutton('disable');

          var endcount_user=$('#END_COUNT_USER').textbox('getValue');
          if (endcount_user !=""){
            $(this).datagrid('options').tbar.dgre_add.linkbutton('disable');
            $(this).datagrid('options').tbar.dgre_edit.linkbutton('disable');
            $(this).datagrid('options').tbar.dgre_del.linkbutton('disable');
          }

          $.page.fn.count();         
        }


    }

  }

    //GET operations Parts list
  $.page.fn.jobs=function(reload){
    var wip_count_id=$('#WIP_COUNT_ID').combobox('getValue');

    var dg=$('#lines');
    if (wip_count_id.length<=0 )  {
      var pvar={_func:'get',_sqlid:'inv^wip_count_jobs',WO_CLASS:$('#WO_CLASS').combobox('getValue')};
      dg.datagrid('options').queryParams._sqlid='inv^wip_count_jobs';
      delete dg.datagrid('options').queryParams.WIP_COUNT_ID;
    }
    else {

        pvar  ={_func:'get',_sqlid:'inv^wip_count_lines',WIP_COUNT_ID:wip_count_id};
            dg.datagrid('options').queryParams._sqlid='inv^wip_count_lines';
      delete dg.datagrid('options').queryParams.WO_CLASS;
    } 
    $('#lines').datagrid('load',pvar);
  }

  $.page.fn.saverows = function(id,jobclass){
          ajaxget('/',{_sqlid:'inv^wip_count_lines',_func:'add', 'WO_CLASS':jobclass,'wip_count_id':id},function(res){
              var wip_count_id=$('#WIP_COUNT_ID');
              wip_count_id.combobox('setValue',id);
    });
  }

  $.page.fn.count=function(){
      var dg = $('#lines');
      var row = dg.datagrid('getSelected');
      var ro=false;
      if (row.COUNT>0) ro=false;
      else ro=true;
      $('#_dgform > form input[textboxname=COUNT').numberspinner('readonly',!ro);
      $('#_dgform > form input[textboxname=RECOUNT').numberspinner('readonly',ro);
  }

  $.page.fn.endis=function(endis){
        $('#but_save').linkbutton(endis);
        $('#but_del').linkbutton(endis);
        $('#endcount').linkbutton(endis);

        $('#WO_CLASS').combobox(endis);
        $('#START_DATE').datebox(endis);
        $('#END_DATE').datebox(endis);
        $('#pwd').textbox(endis);

        $('#NOTES').textbox(endis);


        $('#lines').datagrid('options').tbar.dgre_add.linkbutton(endis);
        $('#lines').datagrid('options').tbar.dgre_edit.linkbutton(endis);
        $('#lines').datagrid('options').tbar.dgre_del.linkbutton(endis);
  }

  $(document).ready(function() {
    
    var dg = $('#lines'); 
    dg.datagrid('rowEditor',$.page.fn.opts);  

    $('#but_add').on('done',function(){
       // $.page.fn.jobs({_func:'get',_sqlid:'inv^wip_count_jobs',_dgrid:'y'});
        $('#WO_CLASS').combobox('reload');
        $('#WO_CLASS').combobox('enable');
        $('#START_DATE').datebox('enable');
        $('#END_DATE').datebox('disable');
        
        $('#lines').datagrid('options').tbar.dgre_add.linkbutton('disable');
        $('#lines').datagrid('options').tbar.dgre_edit.linkbutton('disable');
        $('#lines').datagrid('options').tbar.dgre_del.linkbutton('disable');

        $('#lines').datagrid('loadData',{"total":0,"rows":[]});
        $('#endcount').linkbutton('disable');
        butEn('sdx');
    })

    $('form#wip_count').on('loadDone',function(jq,data){
      //console.log('###');
     // console.log(data);
        /*
        $('#lines').datagrid('load',{
                _func:'get',
                _sqlid:'inv^wip_count_lines',
                _dgrid:'y',
                WIP_COUNT_ID:data.WIP_COUNT_ID
        });
        */
        $.page.fn.jobs();
        var endis='enable';
        if (data.END_COUNT_USER.length>0) endis='disable';
       $.page.fn.endis(endis);

        
    }).on('success',function(jq,mr){
        // only save lines if head saved success & we have wip count lines
        //console.log(mr);
        if(mr.res._next) {
          var jobclass=$('#WO_CLASS').combobox('getValue');
            $.page.fn.saverows(mr.res._next,jobclass);
           /* $('#lines').datagrid('load',{
                    _func:'get',
                    _sqlid:'inv^wip_count_lines',
                    _dgrid:'y',
                    WIP_COUNT_ID:mr.res._next
            });*/
            $.page.fn.jobs();

            var endis='enable';
            var endcount_user=$('#END_COUNT_USER').textbox('getValue');
            if (endcount_user.length>0) endis='disable';
            $.page.fn.endis(endis);

        }
        if (mr.mode=='del') {
                setTimeout(function(){
                  $('#lines').datagrid('loadData',{"total":0,"rows":[]});
                },500)

        }
    })

    $('#WO_CLASS').combobox({
      onSelect:function(v){
          $.page.fn.jobs();

      }
    })

     $('#endcount').linkbutton({
      onClick:function(){
        var id=$('#WIP_COUNT_ID').combobox('getValue'); 
        var pwd=$('#pwd').textbox('getValue');

        ajaxget('/',{_sqlid:'user^passwd',_func:'get', pwd:pwd,_uid:$.dui.udata.userid},function(res){
          if (res.error) return ;
            confirm(function(yn){
              if (yn){
                $('#END_DATE').datebox('setValue',new Date());
                $('#END_COUNT_USER').textbox('setValue',$.dui.udata.userid);
                ajaxget('/',{_sqlid:'inv^wip_count',_func:'upd', WIP_COUNT_ID:id,END_DATE:new Date(),END_COUNT_USER:$.dui.udata.userid},function(res){
                    $('#endcount').linkbutton('disable');
                    $('#pwd').textbox('clear');
                });
              }
            },'End Count :'+id+' ?')

        })

      }
    })

    //dialog 
    
       $('#_dgform').dialog({
      buttons: [
        {id:'prev', iconCls:'pagination-prev', 
          handler:function(){        
            var dg=$('#lines');
            var selected=dg.datagrid('getSelected');  
              var index=dg.datagrid('getRowIndex',selected);            
            var url = "/";
            var data = {WIP_COUNT_ID:selected.WIP_COUNT_ID,LINE_NO:selected.LINE_NO,_func:'upd',_sqlid:'inv^wip_count_line'}
            data.COUNT=$('#_dgform > form input[textboxname=COUNT').numberspinner('getValue');
            data.RECOUNT=$('#_dgform > form input[textboxname=RECOUNT').numberspinner('getValue');
            data.CP_REF=$('#_dgform > form input[textboxname=CP_REF').textbox('getValue');
            data.DESCRIPTION=$('#_dgform > form input[textboxname=DESCRIPTION').textbox('getValue');
            data.NOTES=$('#_dgform > form input[textboxname=NOTES').textbox('getValue');
            ajaxget(url,data,function(d){
                dg.datagrid('updateRow',{index:index,row:data});
            }) 


              var pageSize=dg.datagrid('options').pageSize;
              var pager=dg.datagrid('options').pageNumber;

              if (index==0){
                dg.datagrid('gotoPage',parseInt(pager)-1);

                setTimeout(function(){
                  dg.datagrid('selectRow',parseInt(pageSize)-1);
                  var selected1=dg.datagrid('getSelected');
                  $('#_dgform').form('load',selected1);
                  $('#_dgform > form input[textboxname=COUNT').numberspinner().focus()
                },500)

              }
              else {
                if (index<0)dg.datagrid('selectRow',0);
                else  dg.datagrid('selectRow',parseInt(index)-1);

                var selected1=dg.datagrid('getSelected');
                $('#_dgform').form('load',selected1);                  
              }

          }
        },
        {id:'next', iconCls:'pagination-next',
            handler:function(){
              var dg=$('#lines');
              var selected=dg.datagrid('getSelected');
              var index=dg.datagrid('getRowIndex',selected);
              var url = "/";
            var data = {WIP_COUNT_ID:selected.WIP_COUNT_ID,LINE_NO:selected.LINE_NO,_func:'upd',_sqlid:'inv^wip_count_line'}
            data.COUNT=$('#_dgform > form input[textboxname=COUNT').numberspinner('getValue');
            data.RECOUNT=$('#_dgform > form input[textboxname=RECOUNT').numberspinner('getValue');
            data.CP_REF=$('#_dgform > form input[textboxname=CP_REF').textbox('getValue');
            data.DESCRIPTION=$('#_dgform > form input[textboxname=DESCRIPTION').textbox('getValue');
            data.NOTES=$('#_dgform > form input[textboxname=NOTES').textbox('getValue');
            ajaxget(url,data,function(d){
                dg.datagrid('updateRow',{index:index,row:data});
            }) 


              var pageSize=dg.datagrid('options').pageSize;
              var pager=dg.datagrid('options').pageNumber;

             
              if (pageSize==(parseInt(index)+1)) {
                dg.datagrid('gotoPage',parseInt(pager)+1);
                setTimeout(function(){
                  dg.datagrid('selectRow',0);
                  var selected1=dg.datagrid('getSelected');
                  $('#_dgform').form('load',selected1);                  
                },500)

            
              }
              else {
                dg.datagrid('selectRow',parseInt(index)+1);
                var selected1=dg.datagrid('getSelected');
                $('#_dgform').form('load',selected1);                
              }
          }
        
         },
        {
        text:'Save',
        iconCls:'icon-save',
        handler:function(){
        var frm = $('#_dgform > form');
        if(!frm.form('validate')) return;
        var fdat = frm.form('getData');
        //console.log(fdat);
        //fdat._func='upd';
        fdat._sqlid='inv^wip_count_line'

  		  ajaxget('/',fdat,function(){
    		  $('#_dgform').dialog('close');  
          $('#lines').datagrid('reload');
  		  });
  		}
      },{
        text:'Cancel',
        iconCls:'icon-cancel',
        handler:function(){$('#_dgform').dialog('close')}
      }]
    });
    
  })
  

});  // $.page.ready