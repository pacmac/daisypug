$.page.fn.validateUdfLabel = function (value) {
  var nextValue = value || "";
  var prefixMatch = /.+?(?={)/i.exec(nextValue);
  var suffixMatch = /[^}]*$/i.exec(nextValue);

  if (prefixMatch && prefixMatch[0] !== "*") {
    msgbox("No Text in front of {}");
  }

  if (!suffixMatch || !suffixMatch.length) {
    return;
  }

  if (!suffixMatch[0].length) {
    if (nextValue.length > 0) {
      msgbox("Label Title cannot more than 20 characters");
    }
    return;
  }

  if (suffixMatch[0].length > 20) {
    msgbox("Label Title cannot more than 20 characters");
  }
};

$.page.ready(function () {
  $(".LBL").textbox({
    onChange: function (nv) {
      $.page.fn.validateUdfLabel(nv);
    },
  });
});
