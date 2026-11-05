/* Contact form: nothing is sent to a server. The message opens in WhatsApp or the visitor's email app. */
(function () {
  "use strict";
  var form = document.getElementById("contact-form");
  if (!form) return;
  var role = "parent";
  var labels = { parent: "Parent", school: "School", centre: "Tutoring centre" };
  var fieldsByRole = {
    parent: [["grade", "Child's grade"], ["school", "School"], ["area", "Area"], ["book", "Kannada textbook"]],
    school: [["role", "Role"], ["schoolName", "School"], ["board", "Board"], ["children", "Children who might benefit"]],
    centre: [["centre", "Centre"], ["centreArea", "Area"], ["students", "Students learning Kannada"]]
  };
  var pills = form.querySelectorAll("[data-role]");
  var groups = form.querySelectorAll("[data-group]");
  var parentNote = form.querySelector('[data-group-note="parent"]');
  var err = document.getElementById("form-error");

  function setRole(r) {
    role = r;
    pills.forEach(function (p) { p.setAttribute("aria-pressed", p.getAttribute("data-role") === r ? "true" : "false"); });
    groups.forEach(function (g) { g.hidden = g.getAttribute("data-group") !== r; });
    parentNote.hidden = r !== "parent";
  }
  pills.forEach(function (p) { p.addEventListener("click", function () { setRole(p.getAttribute("data-role")); }); });

  function val(name) { var f = form.elements[name]; return f ? String(f.value || "").trim() : ""; }

  function compose() {
    var product = form.getAttribute("data-product");
    var lines = ["Hi! I found " + product + " on your website.", "", "I am a: " + labels[role], "Name: " + val("name")];
    if (val("phone")) lines.push("Phone: " + val("phone"));
    fieldsByRole[role].forEach(function (f) { if (val(f[0])) lines.push(f[1] + ": " + val(f[0])); });
    if (val("message")) { lines.push(""); lines.push(val("message")); }
    return lines.join("\n");
  }

  function send(kind) {
    if (!val("name")) { err.hidden = false; form.elements.name.focus(); return; }
    err.hidden = true;
    var text = compose();
    if (kind === "wa") {
      window.location.href = "https://wa.me/" + form.getAttribute("data-wa") + "?text=" + encodeURIComponent(text);
    } else {
      var subject = form.getAttribute("data-product") + " enquiry (" + labels[role] + ")";
      window.location.href = "mailto:" + form.getAttribute("data-email") + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
    }
  }
  form.querySelector('[data-send="wa"]').addEventListener("click", function () { send("wa"); });
  form.querySelector('[data-send="email"]').addEventListener("click", function () { send("email"); });
  setRole("parent");
})();
