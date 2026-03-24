$('.colours').combobox({
    formatter: function(row){
    return '<div class="'+row.value+'">'+row.text+'</div>';
    },
    
    onChange: function(nv,ov){
      $(this).next().find('.textbox-text').removeClass(ov);
     $(this).next().find('.textbox-text').addClass(nv);
     //$(this).textbox('textbox').css('background',rec.value)

    },
    
    onSelect: function(rec){

      $(this).next().find('.textbox-text').addClass(rec.value);  
    },      
    
    data:[
    {value:'bg-brn',text:'Brown'},
    {value:'bg-red',text:'Red'},
    {value:'bg-ora',text:'Orange'},
    {value:'bg-yel',text:'Yellow'},
    {value:'bg-grn',text:'Green'},
    {value:'bg-cyn',text:'Cyan'},
    {value:'bg-blu',text:'Blue'},
    {value:'bg-pur',text:'Purple'},
    {value:'bg-gry',text:'Grey'},
    {value:'bg-sil',text:'Silver'},
    {value:'bg-clr',text:'Clear'}
    ]
    
}); 