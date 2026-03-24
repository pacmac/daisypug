$.page.ready(function () {

  // ─── FORMATTERS & STYLERS ──────────────────────────────────
  $.page.fn.fkey=function(){
    return $('#GAUGE_ID').searchbox('getValue')
  }
  $.page.fn.criteriaFmt = function (val, row, idx) {
    var cls = 'icon-' + row.LTYPE.toLowerCase();
    return '<span style="width:20px" class="' + cls + ' icon-dg"></span><span>' + val + '</span>';
  };

  $.page.fn.statusStyler = function (val, row, idx) {
    return { class: '' + val.toLowerCase() };
  };

  // ─── PAGE FUNCTIONS ────────────────────────────────────────

  // build description
  $.page.fn.gendesc = function () {
    var typ = $('#GAUGE_TYPE').combobox('getField', 'DESCRIPTION');
    if (typ !== undefined) typ += ', ';
    else typ = '';
    var ran = $('#RANGE').textbox('getValue');
    $('#DESCRIPTION').textbox('setValue', typ + ran);
  };

  // MANUAL OR AUTO-NUMBERING
  $.page.fn.automan = function () {
    var gid = $('#GAUGE_ID');
    if ($.dui.bhave.autonum == 'AUTO') {
      butEn('nsdx');
      gid.addClass('autonum').removeAttr('required');
    } else {
      butEn('asdx');
      gid.removeClass('autonum').attr('required', 'required');
    }
  };

  // Create & Build The Gauge Types Menus
  $.page.fn.menus = function (data) {
    var addmenu = $('#addmenu');

    addmenu.menu({
      onClick: function (item) {
        if (!item.name) return false;
        but_add();
        if ($.dui.bhave.autonum == 'AUTO') {
          $('#GAUGE_TYPE').combobox('setValue', item.name);
          $('input[name="GAUGE_TYPE"]').removeAttr('disabled');
        }
      }
    });

    var item = addmenu.menu('findItem', 'GaugeType');
    for (var i in data) {
      addmenu.menu('appendItem', {
        parent: item.target,
        name: data[i].value,
        text: data[i].text,
        iconCls: 'icon-micrometer'
      });
    }
    butEn('ndx');
  };

  // calculate due / overdue
  $.page.fn.due = function () {
    var dd = $('#DUE_DATE');
    var ddi = dd.next('span.textbox').find('input.textbox-text');
    var now = new Date();
    var date = new Date(dd.textbox('getValue'));
    var due = parseInt($('#DUE_DATE_ALERT_DAYS').numberspinner('getValue'));
    var days = parseInt((now - date) / 1000 / 60 / 60 / 24);
    var txt = Math.abs(days);

    ddi.removeClass('bg-ora bg-red bg-grn');
    if (days > 0) {
      if ($.dui.bhave.duealert == 'y') alert('Gauge has expired by ' + txt + ' days.');
      ddi.addClass('bg-red');
    } else if (due > txt) {
      if ($.dui.bhave.duealert == 'y') alert('Gauge calibration due in ' + txt + ' days.');
      ddi.addClass('bg-ora');
    } else {
      ddi.addClass('bg-grn');
    }
  };

  // set page defaults
  $.page.fn.bhave = function () {
    $.page.fn.automan();
    $('#DUE_DATE_ALERT_DAYS').val($.dui.bhave.alertdays);
    $('#CALDAYS_1').val($.dui.bhave.caldays1);
    $('#CALDAYS_2').val($.dui.bhave.caldays2);
  };

  // Last Transaction
  $.page.fn.lasttx = function (data) {
    if (!data || !data.TYPE) return;
    var bits = data.TYPE.split('-');
    var io = bits[1], mode = bits[0], txt = [io];
    if (io == 'OUT') txt.push(mode, data.DOC_ID.split('^').join('.'));
    if (data.NOTES) txt.push(data.NOTES);
    $('#LAST_TX').textbox('setValue', txt.join(', '));
  };

  // ─── ON-DEMAND TABS ────────────────────────────────────────

  $('#gmtabs').tabs({
    onSelect: function (tit, idx) {
      var fdat = frm2dic($('form#gauge'));
      switch (tit) {
        case 'Attachments':
          $('#gmfiles').datagrid('docFiles', $.page.fn.fkey);
          break;
        case 'Test Results':
          $('#calids').combobox('reload', '?_sqlid=dqm^qt_ids&_func=get&GAUGE_ID=' + fdat.ID);
          break;
        case 'User Fields':
          var rec = $('#UDF_LAYOUT_ID').combobox('getRec');
          setudfs(rec, $('form#gauge'));
          break;
        case 'RentalX':
          $('#GAUGE_RENT_DIAMETER').combobox({
            data: jsonParse($.dui.bhave.CBO_OUTSIDE_DIAMETER || '[]')
          });
          break;
      }
    }
  }).tabs('disableAll');

  // ─── INITIALIZATION ────────────────────────────────────────

  // when user selects different UDF layout
  $('#UDF_LAYOUT_ID').combobox({ onSelect: setudfs });

  $('#GAUGE_ID').searchbox({ defid: 'gauge_ids' });

  $.page.fn.bhave(); // do this FIRST

  toolbut([
    {
      id: 'calibrate',
      iconCls: 'icon-calibrate',
      text: 'Calibrate',
      noText: true,
      disabled: true,
      onClick: function () {
        var qpid = $('input#PLAN_ID').textbox('getValue');
        if (!qpid) return false;
        var gid = $('#GAUGE_ID').searchbox('getValue');
        loadpage('dqm^qp^qp_test&newgauge=' + qpid + '^' + gid);
      }
    },
    {
      id: 'rename',
      iconCls: 'icon-rename',
      text: 'Rename',
      disabled: true,
      noText: true,
      onClick: function () {
        var gid = $('#GAUGE_ID').searchbox('getValue');
        if (!gid) return;
        confirm(function (yn) {
          if (yn) {
            var cid = $('#RENAME_GAUGE_ID');
            cid.textbox('readonly', true);
            if (gid) cid.textbox('setValue', gid);
           // $('#gaugerenamebtn').button('disabled',false);
            $('#gaugerenameopt').dialog('open');
          }
        }, 'This rename is permanent(' + gid + '), are you sure ?');
      }
    },
    {
      id: 'copy_text',
      iconCls: 'icon-copy',
      text: 'Copy text',
      noText: true,
      onClick: function () {
        var tempG = $('#GAUGE_ID').val();
        navigator.clipboard.writeText(tempG).then(function () {
          alert('Text ' + tempG + ' copied to clipboard!');
        });
      }
    },
    {}
  ]);

  // Gauge Rename
  $('#gaugerenamebtn').button({
    onClick: function () {
      var src = $('#RENAME_GAUGE_ID').textbox('getValue');
      var newid = $('#NEW_GAUGE_ID').textbox('getValue');

      var tf = false;
      var arr = ['`','~','!','@','#','$','%','^','&','*','(',')','=','[',']','{','}','|','>','<'];
      arr.map(function (a) {
        if (tf == false) {
          if (newid.indexOf(a) != -1) tf = true;
        }
      });
      if (tf == false) {
        if (src) {
          ajaxget('/', { _sqlid: 'dqm^gauges', _func: 'get', ID: src }, function (rssrc) {
            var oldid = rssrc.OLD_ID;
            ajaxget('/', { _sqlid: 'dqm^gauges', _func: 'get', ID: newid }, function (rs) {
              if (rs.ID) msgbox('Asset ID already exists.');
              else {
                ajaxget('/', {
                  _sqlid: 'dqm^gaugeRename',
                  _func: 'get',
                  SRC_ID: src,
                  NEW_ID: newid,
                  OLD_ID: oldid,
                  UID: $.dui.udata.userid
                }, function (res) {
                  if (res.error) return msgbox(res.msg);
                  $('#gaugerenameopt').dialog('close');
                  $('#GAUGE_ID').textbox('setValue', newid);
                });
              }
            });
          });
        }
      } else msgbox('Illegal characters found in New ID,' + newid);
    }
  });

  $('#PLAN_ID').combobox({
    onSelect: function (rec) {
      $('#calnow').button('enable');
    }
  });

  // Initiate New Calibration
  $('#calnow').button({
    onClick: function () {
      var qpid = $('input#PLAN_ID').textbox('getValue');
      if (!qpid) return false;
      var gid = $('#GAUGE_ID').searchbox('getValue');
      loadpage('dqm^qp^qp_test&newgauge=' + qpid + '^' + gid);
    }
  });

  // Open Calibration Test
  $('#DOC_REF').textbox({
    icons: [{
      iconCls: 'icon-godoc',
      handler: function (e) {
        var val = $(e.data.target).textbox('getValue');
        if (val.length < 1) return false;
        loadpage('dqm^qp^qp_test&QPID=' + val);
      }
    }]
  });

  // Description Generator
  $('#DESCRIPTION').textbox({
    icons: [{
      iconCls: 'icon-og',
      handler: $.page.fn.gendesc
    }]
  });

  // Gauge-Type combo
  $('#GAUGE_TYPE').combobox({
    onLoadSuccess: function () {
      var data = $(this).combobox('getData');
      if ($.dui.bhave.autonum == 'AUTO') $.page.fn.menus(data);
    },
    onChange: function () {
      $.page.fn.gendesc();
    }
  });

  // Select Test
  $('#calids').combobox({
    onSelect: function (rec) {
      ajaxget('?_sqlid=dqm^qt_tree&_func=get&qtref=' + rec.value, {}, function (test) {
        $('#teststatus').textbox('setValue', test[0].TEST_STATUS);
        $('#caldate').textbox('setValue', test[0].test.CREATE_DATE);
        var tests = test[0].children;
        var obj = {};
        obj.value = 'ALL';
        obj.text = '- ALL -';
        obj.selected = true;
        tests.unshift(obj);
        $('#calseq').prop('disabled', false).combobox('loadData', tests).combobox('select', 'ALL');
      });
    }
  });

  // Select Test Operation
  $('#calseq').combobox({
    onSelect: function (rec) {
      var dg = $('#dgtests');

      function fixed(val) {
        if (isNaN(val) || val === '') return na;
        else return parseFloat(val).toFixed(5);
      }

      if (rec.value == 'ALL') var recs = $(this).combobox('getData').slice(1);
      else var recs = [rec];

      var na = '-', rows = [];
      recs.map(function (rec) {
        for (var t in rec.tests) {
          var row = {};
          row.TEST_ID = rec.id;
          row.PROC_SEQ = rec.tests[t].PROC_SEQ;
          row.TICK_SEQ = rec.tests[t].TICK_SEQ + 1;
          row.LTYPE = rec.proc.LTYPE;
          row.TITLE = rec.proc.TITLE;
          if (rec.proc.LTYPE == 'value') {
            row.CRITERIA = fixed(rec.proc.VNOM) + ' ' + rec.proc.UOM + ' ( -' + fixed(rec.proc.VLOW) + ' / +' + fixed(rec.proc.VUPP) + ' )';
            row.VALUE = fixed(rec.tests[t].VALUE);
            var vari = fixed(row.VALUE - rec.proc.VNOM);
            if (vari > 0) vari = '+' + vari;
            row.VAR = vari;
          } else if (rec.proc.LTYPE == 'bool') {
            row.CRITERIA = rec.proc.BOOL_TEXT;
            row.VAR = na;
            row.VALUE = na;
          }
          row.STATUS = rec.tests[t].STATUS;
          row.NOTES = rec.tests[t].NOTES;
          rows.push(row);
        }
      });

      setTimeout(function () {
        dg.datagrid('loadData', rows);
        $('#dg2excel').button('enable');
      });
    }
  });

  // Datagrid init (merge JS opts with JSON config)
  $.page.fn.dgtestsOpts = {
    onLoadSuccess: function () {}
  };
  $('#dgtests').datagrid($.page.fn.dgtestsOpts);

  // ─── AFTER GAUGE IS LOADED ─────────────────────────────────

  $('#gauge').on('loadDone', function (evt, fdat) {
    $.page.fn.due();
    $('#gmtabs').tabs('enableAll', 1);

    // sort outer diameters before loading combobox
    var bhaveDiameters = jsonParse($.dui.bhave.CBO_OUTSIDE_DIAMETER || '[]');
    var bhaveDiameterValues = bhaveDiameters.sort(function (a, b) {
      return parseFloat(a.value) - parseFloat(b.value);
    });
    $('#GAUGE_RENT_DIAMETER').combobox({
      data: bhaveDiameterValues,
      value: fdat.GAUGE_RENT_DIAMETER
    });

    // Apply UDF labels from selected layout
    var rec = $('#UDF_LAYOUT_ID').combobox('getRec');
    setudfs(rec, $('form#gauge'));
    // Reload plan combo for this gauge
    $('#PLAN_ID').combobox('reload',
      '?_sqlid=dqm^gauge_planid&_func=get&GAUGE_ID=' + fdat.ID + '&GAUGE_TYPE=' + fdat.GAUGE_TYPE
    );

    if (fdat.PLAN_ID != '') $('#calnow').button('enable');
    else $('#calnow').button('disable');

    if ($.dui.bhave['allow_gauge_rename'] == 'y') {
      $('#rename').button('enable');
    }

    $('#calibrate').button('enable');

    $.page.fn.automan();

    if (fdat.LAST_TX) $.page.fn.lasttx(fdat.LAST_TX);

    // clear caltest combos & grid
    $('#calids').combobox('clear').combobox('loadData', []);
    $('#calseq').combobox('clear').combobox('loadData', []).prop('disabled', true);
    $('#dgtests').datagrid('loadData', []);
    $('#dg2excel').button('disable');
  });
});
