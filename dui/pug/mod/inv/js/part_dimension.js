
$.page.ready(function () {
$.page.fn.dec4 = function(val){
    var n = parseFloat(val);
    return isNaN(n) ? val : n.toFixed(4);
}

$( document ).ready(function() {

    $('#UOM_ID').combobox({onLoadSuccess:function(data){
        $('#DIM_UOM').combobox('loadData',data);
    }});    

    $('#dgdim').datagrid({
        
        title: 'Piece Balances',
        striped: true,
        rownumbers:true,
        url:'/',
        queryParams: {
        _sqlid: 'inv^partdim_bal',
        _func: 'get',
        PART_ID: null 
        },
        
        onBeforeSelect: function(){
        return false;
        },
        
        onBeforeLoad: function(qp){
        var me = $(this)
        if(!$.page.fn.fdat) return false;
        var fdat = $.page.fn.fdat();
        if(fdat.ID) {
            ['HEIGHT','WIDTH','LENGTH'].map(function(e){
            var sh = 'showColumn'; if(fdat[e]=='N') var sh = 'hideColumn';
            me.datagrid(sh,e); 
            })
            qp.PART_ID = fdat.ID;
            $.page.fn.partuom = fdat.UOM_ID;
        } else {
            $.page.fn.partuom = '';
            return false;
        }
        },
        
        fit: true,
        fitColumns: true,
        columns:[[
        {field:'PART_ID', hidden: true},
        {field:'LENGTH',title:'Length',formatter:$.page.fn.dec4,align:'right',width:80,fixed:true},
        {field:'WIDTH',title:'Width',formatter:$.page.fn.dec4,align:'right',width:80,fixed:true},
        {field:'HEIGHT',title:'Height',formatter:$.page.fn.dec4,align:'right',width:80,fixed:true},
        {field:'PIECES_BAL',title:'Pieces',align:'right', formatter:function(val){return parseInt(val);},width:50,fixed:true},
        {field:'_UOM_TOTAL',title:'Total', align:'right', formatter:function(val,row,idx){
            var total = ((row.LENGTH||1) * (row.HEIGHT||1) * (row.WIDTH||1) * row.PIECES_BAL).toFixed(4);
            return total;  
        },width:80,fixed:true},
        {field:'TRACE_ID',title:'Trace ID',width:80,fixed:false},
        ]],
        
        onLoadSuccess: function(data){
        if(data.total > 0) $('#dimsdiv').addClass('lock');
        var dpt = $('#DIM_PC_TOTAL'); 
        if(!dpt.length) return;
        var total=0; data.rows.map(function(e){total+=e.PIECES_BAL})
        dpt.numberbox('setValue',total);
        }
        
        
    })
})

});  // $.page.ready
