$.page.ready(function () {
  $("#butGo").linkbutton({
    size: "small",
    iconCls: "icon-go",
    text: "Go",
    onClick: function () {
      // var sd1 = new Date($("#sdate").datebox("getValue"));
      // var sd = date.setDate(sd1 - 1);

      var sd = $("#sdate").datebox("getValue");
      var ed = $("#edate").datebox("getValue");

      if (sd > ed) {
        return msgbox("Before Date should be greater than After Date.");
      }

      var fstat = $("#fstat").combobox("getValue");
      var ftype = $("#ftype").combobox("getValue");
      $.dui.page.commits(sd, ed, fstat, ftype);
    },
  });

  $("table#commits").datagrid({
    singleSelect: false,
    rownumbers: true,
    fitColumns: true,
    striped: true,
    fit: true,

    columns: [
      [
        { field: "select", checkbox: true, title: "select" },
        { field: "commit", hidden: true },
        { field: "short_commit", order: "asc", title: "Commit" }, // width: 55 },
        { field: "type", order: "asc", title: "Type" }, //, width: 30 },
        { field: "dbname", order: "asc", title: "Database" }, //, width: 50 },

        { field: "version", order: "asc", title: "Version" }, //, width: 40 },
        {
          field: "date",
          order: "asc",
          title: "Date",
          // width: 90, //orig code:90,
          formatter: function (val) {
            return val.split(" ").splice(0, 2).join(" ");
          },
        },

        { field: "file", order: "asc", title: "File Name" },

        {
          field: "description",
          order: "asc",
          title: "Description",
          // width: 500,
        },
      ],
    ],

    loadFilter: function (rels) {
      var data = { rows: [], total: 0 };
      for (var rel in rels) {
        const arrs = ["dbname", "type"];
        arrs.forEach((item) => {
          if (rels[rel][item] == null || rels[rel][item] == "") {
            rels[rel][item] = "-";
          }
        });
        data.rows.push({
          commit: rels[rel]["commit"],
          short_commit: rels[rel]["commit"].substr(0, 7),
          file: rels[rel]["file"],
          version: rels[rel]["version"],
          date: rels[rel]["date"],
          dbname: rels[rel]["dbname"],
          type: rels[rel]["type"],
          description: rels[rel]["description"],
        });
      }
      data.total = data.rows.length;
      return data;
    },
  });

  $.dui.page.commits = function (startDate, endDate, fstat, ftype) {
    ajaxget(
      "/",
      {
        _func: "get",
        _sqlid: "admin^commits_json",
        start: startDate,
        end: endDate,
        fstat: fstat,
        ftype: ftype,
      },
      function (rs) {
        rs.sort(function (a, b) {
          return new Date(b.date) - new Date(a.date).toISOString();
        });

        $("table#commits").datagrid("loadData", rs);
      }
    );
  };
});
