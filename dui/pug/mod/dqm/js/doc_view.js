/*
  PAC 171123 - 2.2.44
  1. BUG - added code to prevent multiple download requests (3) when downloading a single file.
  2. But it is impossible to detect when a file has completed downloading (not inline loading) in an iframe
     So the temporary solution is to set a timeout of 2 seconds to clear the loader but this is not the right way.
*/

$.page.fn.fmt = function (val, row) {
  if (!row.children) return val;
  return "";
};

$.page.fn.init = function () {
  if (!$("#folds").length || $("#folds").data("treegrid")) return;

  $('iframe#docview').on("load", function () {
    loading(false);
  });

  $("#folds").treegrid({
    lines: false,
    fit: true,
    method: "get",
    idField: "treeid",
    treeField: "text",
    fitColumns: true,
    init: false,
    url: "/",
    queryParams: {
      _sqlid: "admin^dir_tree",
      _func: "get",
      appid: "pubgrp",
      async: "yes",
    },

    onBeforeLoad: function (node, qp) {
      if (node) qp.appid = node.appid.split("^")[0];
    },

    columns: [[
      { field: "id", hidden: true },
      { field: "text", title: "Folder" },
      { field: "treeid", hidden: true },
      { field: "revn", width: 40, fixed: true, title: "Rev", formatter: $.page.fn.fmt },
      { field: "desc", title: "Description", formatter: $.page.fn.fmt, width: 200, fixed: false },
    ]],

    loadFilter: function (idata) {
      var opt = $(this).treegrid("options");
      if (opt.init) return idata;
      opt.init = true;

      var head = {
        grp: { text: "Group Files", iconCls: "icon-folder_share" },
        pub: { text: "Site Files", iconCls: "icon-folder_share" },
      };

      idata.map(function (e) {
        e.text = head[e.id].text;
        e.iconCls = head[e.id].iconCls;
      });

      return idata;
    },

    _onContextMenu: function (e) {
      e.preventDefault();
    },

    onLoadSuccess: function (node) {
      if (node) return;
      $("#folders .tree-collapsed").first().click();
    },

    onSelect: function (node) {
      if (node.children) return false;

      var ts = new Date().getTime();
      var url =
        "/?_func=tsdl&inline=y&libcon=y&cache=y&tsid=" +
        node.id +
        "&appid=" +
        node._parentId.replace(/\./g, "^");

      $("iframe#docview").attr("src", url);
      loading(true);

      // Work-around for Chrome download behavior in the iframe.
      setTimeout(function () {
        loading(false);
      }, 2000);
    },
  });
};

$.page.fn.initWhenReady = function (attempt) {
  var tries = attempt || 0;

  if ($("#folds").length && !$("#folds").data("treegrid")) {
    $.page.fn.init();
    return;
  }

  if (tries >= 20) return;

  setTimeout(function () {
    $.page.fn.initWhenReady(tries + 1);
  }, 100);
};

$.page.ready(function () {
  $.page.fn.initWhenReady();
});

setTimeout(function () {
  $.page.fn.initWhenReady();
}, 0);
