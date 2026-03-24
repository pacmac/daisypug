// button handler.
$('#but_save, #but_del').linkbutton({
    onClick: function(){
    var fdat = frm2dic($('#main'));
    fdat._func = 'add'; if( $(this).attr('id') == 'but_del' ) fdat._func = 'del';
    if(fdat.lang=='eng') return msgbox('Cannot delete english phrases.');
    ajaxget('/',fdat,function(res){
        if(!res.error && fdat._func=='del') $('#main').form('reset');
        if(res.msg) alert(res.msg);
    })
    }
})

$('#val').textbox({
    onChange: function(nv,ov){
    var olen = $('#key').textbox('getValue').length;
    $('#labval').text(nv).removeClass('fg-grn fg-red');
    if(nv.length > olen) $('#labval').addClass('fg-red');
    else $('#labval').addClass('fg-grn'); 
    }
})

$('#key').combobox({
    url: '/',
    queryParams: {
    _sqlid:'admin^lang_ids',
    _func: 'get',
    },
    
    onSelect: function(rec){
    ajaxget('/',{
        _sqlid: 'admin^lang',
        _func: 'get',
        key: rec.value,
        lang: $('#lang_cbo').combobox('getValue')
    },function(res){
        $('.clear').textbox('clear');
        $('form').form('load',res);
        butEn('sxd');
    })
    }
}); 

$('#lang_cbo').combobox({
    onSelect:function(rec){
    $('#lang').val(rec.value);
    $('#key').combobox('reload');
    butEn('ax');    
    }
})  

$('form').form();