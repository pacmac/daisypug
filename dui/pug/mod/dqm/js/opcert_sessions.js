$.page.fn.leaves = function (tree) {
  var leafs = [];
  $.map(tree.tree("getChildren"), function (node) {
    if (tree.tree("isLeaf", node.target)) {
      leafs.push(node);
    }
  });
  return leafs;
};

// set operator checks
$.page.fn.opset = function () {
  var pass = $("#USERS_PASS").val().split(",");
  var fail = $("#USERS_FAIL").val().split(",");
  var tr = $("#operators");
  var nodes = $.page.fn.leaves(tr);
  for (var n in nodes) {
    if (pass && pass.indexOf(nodes[n].ID) != -1) {
      var chk = "check";
      var cls = "icon-tick";
    } else if (fail && fail.indexOf(nodes[n].ID) != -1) {
      var chk = "check";
      var cls = "icon-cross";
    } else {
      var chk = "uncheck";
      var cls = "icon-field";
    }
    tr.tree(chk, nodes[n].target);
    tr.tree("update", { target: nodes[n].target, iconCls: cls });
    if (chk == "check") tr.tree("expandTo", nodes[n].target);
  }
};

// set module checks
$.page.fn.modset = function () {
  var mods = $("#MODULES").val().split(",");
  var tr = $("#modules");
  var nodes = $.page.fn.leaves(tr);
  for (var n in nodes) {
    if (mods && mods.indexOf(nodes[n].ID) != -1) var chk = "check";
    else var chk = "uncheck";
    tr.tree(chk, nodes[n].target);
    if (chk == "check") tr.tree("expandTo", nodes[n].target);
  }
};

// set date & lock the page
$.page.fn.status = function (nolock) {
  var cdate = $("#COMPLETED_DATE");
  var stat = $("#STATUS").combobox("getValue");
  switch (stat) {
    case "COMPLETED":
      cdate.datebox("enable");
      if (!nolock) $("div.canlock").addClass("lock");
      break;
    case "PLANNED":
      cdate.datebox("setValue", "");
      cdate.datebox("disable");
      $("div.canlock").removeClass("lock");
      break;

    default:
      break;
  }
};

$.page.ready(function () {
  $("#INSTRUCTOR").combobox({
    onSelect: function (rec) {
      $("#INSTRUCTOR_EMAIL").val(rec.email);
    },
  });
  $("#STATUS").combobox({
    // don't lock when status is initially changed.
    onChange: function (nv, ov) {
      $.page.fn.status(true);
    },
  });

  // check/un-check operators & modules
  $("form#cert").on("loadDone", function (me, mode) {
    // prevent tree onCheck() during form load
    $("#modules").tree("collapseAll");
    $("ul#operators").tree("collapseAll");
    $.page.fn.load = true;
    $.page.fn.opset();
    $.page.fn.modset();
    $.page.fn.load = false;
    $.page.fn.status();
  });

  // after add button is pressed
  $("#but_add").on("done", function (me, butid) {
    var status = $("#STATUS");
    status.combobox("setValue", "PLANNED");
  });

  // modules tree
  $("#modules").tree({
    animate: false,
    onlyLeafCheck: true,
    checkbox: true,
    method: "get",
    url: "/?_func=get&_combo=y&_sqlid=dqm^modtree",
    formatter: function (node) {
      if (node.children !== undefined) return node.DESCRIPTION.toUpperCase();
      else return node.ID + " - " + node.DESCRIPTION;
    },
    //onBeforeExpand:function(node){if($(this).tree('getLevel', node.target)==1) $(this).tree('collapseAll');},

    onLoadSuccess: function (node, data) {
      $(this).tree("collapseAll");
      $(this).tree("options").animate = true;
    },

    onCheck: function (node, chk) {
      if ($.page.fn.load) return;
      var chkd = $(this).tree("getChecked");
      var csv = [];
      chkd.map(function (e) {
        if (e.children === undefined) csv.push(e.ID);
      });
      $("#MODULES").val(csv.join(","));
    },
  });

  // operators tree
  $("ul#operators").tree({
    animate: false,
    onlyLeafCheck: true,
    cascadeCheck: false,
    checkbox: true,
    url: "?_func=get&_combo=y&_sqlid=vwltsa^emptree",
    dnd: false,
    formatter: function (node) {
      if (node.HEAD_ID !== undefined) return node.DESCRIPTION.toUpperCase();
      else return node.ID + " - " + node.LAST_NAME + ", " + node.FIRST_NAME;
    },

    //onBeforeExpand:function(node){if($(this).tree('getLevel', node.target)==1) $(this).tree('collapseAll');},
    onLoadSuccess: function (node, data) {
      $(this).tree("collapseAll");
      $(this).tree("options").animate = true;
    },

    onCheck: function (node, chk) {
      if (!chk) var cls = "icon-file";
      else var cls = "icon-tick";
      $(this).tree("update", { target: node.target, iconCls: cls });
      if ($.page.fn.load) return;
      $.page.fn.chk(node);
    },

    onDblClick: function (node) {
      if (node.iconCls == "icon-tick") var cls = "icon-cross";
      else var cls = "icon-tick";
      $(this).tree("update", { target: node.target, iconCls: cls });
      $.page.fn.chk(node);
    },
  });

  // process operator status
  $.page.fn.chk = function (node) {
    var chkd = $("ul#operators").tree("getChecked");
    var pass = [],
      fail = [];
    chkd.map(function (e) {
      if (e.HEAD_ID === undefined) {
        if (e.iconCls == "icon-cross") fail.push(e.ID);
        else pass.push(e.ID);
      }
    });
    $("#USERS_PASS").val(pass.join(","));
    $("#USERS_FAIL").val(fail.join(","));
  };
});
