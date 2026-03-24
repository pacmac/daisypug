
    $('form').on('loadDone',function(){butEn('dasx');})
    
    $('#TABLE_NAME1').combobox({
    onSelect:function(rec){
        var cbo = $('#COLUMN_NAME1');
        var url = '/?_func=get&_combo=y&_sqlid=vwltsacolumnname&TABLE_NAME='+rec.value;
        cbo.combobox('clear');
        cbo.combobox('reload',url);



    }
    }
    )
    $('#TABLE_NAME2').combobox({
        onSelect:function(rec){


            var cbo2 = $('#COLUMN_NAME2');
            var url = '/?_func=get&_combo=y&_sqlid=vwltsa^columnname&TABLE_NAME='+rec.value;
            cbo2.combobox('clear');
            cbo2.combobox('reload',url);

        }
    }

    )
    
    // Load combos on demand ( _sqlid_ ## NOT FIRST TAB ## )
    $('#lists').tabs({
      onSelect:function(tit,idx){
        tabcombos($(this));
        var frm = $(this).tabs('getSelected').find('form').first();
        frm.form('reset');
        setTimeout(function(){butEn(frm.attr('asdpx'));},100)
      }
    }) 
    
    /*
    $('#lists #nng').on('loadDone',function(jq,data){
      //console.log(data);  
      if (data.DESCRIPTION){
          var desc=data.DESCRIPTION;
          if (desc.indexOf('*LOCK*') !== -1 ) var ro=true;
          else var ro=false;
          $('#lists #nng #NNG_NEXT').numberspinner('readonly',ro);
          $('#lists #nng #NNG_DESC').textbox('readonly',ro);
      }
      
    })
    */
