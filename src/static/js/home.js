/* Home page demos. Plain JS, no dependencies. */
(function () {
  "use strict";
  var P = (document.querySelector('meta[name="product"]') || {}).content || "Akka";
  function $(root, sel) { return root.querySelector(sel); }
  function el(tag, attrs, text) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") n.className = attrs[k]; else n.setAttribute(k, attrs[k]);
    });
    if (text != null) n.textContent = text;
    return n;
  }

  /* 01 · Balloon game */
  (function () {
    var root = document.getElementById("game");
    if (!root) return;
    var rounds = [
      { target: "ಅ", opts: ["ಆ", "ಅ", "ಇ", "ಈ"] },
      { target: "ಈ", opts: ["ಇ", "ಉ", "ಈ", "ಅ"] },
      { target: "ಉ", opts: ["ಊ", "ಇ", "ಒ", "ಉ"] }
    ];
    var fills = ["", "f1", "f2", ""];
    var s = { round: 0, won: false, wrong: null };
    var kn = $(root, '[data-g="kn"]'), en = $(root, '[data-g="en"]');
    var box = $(root, '[data-g="balloons"]'), count = $(root, '[data-g="count"]'), next = $(root, '[data-g="next"]');

    function render() {
      var done = s.round >= rounds.length;
      var r = rounds[Math.min(s.round, rounds.length - 1)];
      if (done) { kn.textContent = "ಶಭಾಷ್!"; en.textContent = "You found all three. Your child does this too."; }
      else if (s.won) { kn.textContent = "ಶಭಾಷ್!"; en.textContent = "Yes, that’s " + r.target + "!"; }
      else if (s.wrong) { kn.textContent = "ಇನ್ನೊಮ್ಮೆ ನೋಡು."; en.textContent = "That’s " + s.wrong + ". Look again."; }
      else { kn.textContent = r.target + " ಹುಡುಕು!"; en.textContent = "Find " + r.target + "."; }
      box.textContent = "";
      r.opts.forEach(function (l, i) {
        var w = el("div", { "class": "balloon-wrap" });
        var cls = "balloon " + fills[i];
        if ((s.won || done) && l === r.target) cls += " found";
        else if (!done && l === s.wrong) cls += " wrong";
        var b = el("button", { "class": cls, type: "button", "aria-label": "Balloon " + l }, l);
        b.addEventListener("click", function () {
          if (done || s.won) return;
          if (l === r.target) { s.won = true; s.wrong = null; } else { s.wrong = l; }
          render();
        });
        w.appendChild(b);
        w.appendChild(el("span", { "class": "balloon-string", "aria-hidden": "true" }));
        box.appendChild(w);
      });
      var found = done ? 3 : s.round + (s.won ? 1 : 0);
      count.textContent = found + " of 3 found";
      next.hidden = !(s.won || done);
      next.textContent = done ? "Play again" : (s.round === rounds.length - 1 ? "Finish" : "Next letter");
    }
    next.addEventListener("click", function () {
      if (s.round >= rounds.length) s = { round: 0, won: false, wrong: null };
      else s = { round: s.round + 1, won: false, wrong: null };
      render();
    });
    render();
  })();

  /* 02 · Lesson stepper */
  (function () {
    var root = document.getElementById("lesson");
    if (!root) return;
    var steps = [
      { title: "Meet the letter", kn: "ಇದು ಮ.", en: "This is ಮ, as in ಮರ, tree.", big: "ಮ", side: "ಮರ", body: P + " shows the letter, says its sound and gives a word that starts with it. Nothing is asked yet." },
      { title: "Play with it", kn: "ಮ ಎಲ್ಲಿದೆ?", en: "Where is ಮ? Careful, ಯ looks like it!", big: "ಮ", side: "ಯ  ವ  ಮ", body: "Quick games put the new letter next to look-alikes, so your child learns to tell them apart." },
      { title: "Write it on screen", kn: "ಈಗ ಬರೆ.", en: "Now you write it.", big: "ಮ", side: "✎", body: "Your child writes with a finger or stylus. " + P + " checks it and shows exactly what to fix." },
      { title: "Copy into the notebook", kn: "ಪುಸ್ತಕದಲ್ಲಿ ಬರೆ.", en: "Now copy it into your notebook.", big: "ಮ ಮ ಮ", side: "", body: "Writing on paper too, so it sticks. A photo of the page goes to you at the end." },
      { title: "Remember it later", kn: "ನೆನಪಿದೆಯಾ?", en: "Do you remember this one?", big: "?", side: "", body: "The letter comes back a little later, after other practice, to check it has really stuck." }
    ];
    var cur = 0;
    var list = $(root, '[data-l="steps"]');
    var f = {};
    ["kn", "en", "big", "side", "body"].forEach(function (k) { f[k] = $(root, '[data-l="' + k + '"]'); });
    var buttons = steps.map(function (st, i) {
      var li = el("li");
      var b = el("button", { "class": "step-btn", type: "button", "aria-pressed": "false" });
      b.appendChild(el("span", { "class": "n" }, String(i + 1)));
      b.appendChild(el("span", null, st.title));
      b.addEventListener("click", function () { cur = i; render(); });
      li.appendChild(b); list.appendChild(li);
      return b;
    });
    function render() {
      var st = steps[cur];
      buttons.forEach(function (b, i) { b.setAttribute("aria-pressed", i === cur ? "true" : "false"); });
      Object.keys(f).forEach(function (k) { f[k].textContent = st[k]; });
    }
    render();
  })();

  /* 03 · Spelling fix */
  (function () {
    var root = document.getElementById("spell");
    if (!root) return;
    var pick = null;
    var kn = $(root, '[data-s="kn"]'), en = $(root, '[data-s="en"]'), first = $(root, '[data-s="first"]');
    var choosing = $(root, '[data-s="choosing"]'), fixed = $(root, '[data-s="fixed"]'), box = $(root, '[data-s="choices"]');
    var opts = ["ಯ", "ಮ", "ವ"];
    var btns = opts.map(function (l) {
      var b = el("button", { "class": "choice", type: "button", "aria-label": "Letter " + l }, l);
      b.addEventListener("click", function () { pick = l; render(); });
      box.appendChild(b);
      return b;
    });
    $(root, '[data-s="reset"]').addEventListener("click", function () { pick = null; render(); });
    function render() {
      var ok = pick === "ಮ";
      if (ok) { kn.textContent = "ಸರಿ! ಮನೆ."; en.textContent = "That’s it: house. Now into the notebook!"; }
      else if (pick === "ಯ") { kn.textContent = "ಅದು ಯ."; en.textContent = "That’s the one we’re fixing. Try another."; }
      else if (pick === "ವ") { kn.textContent = "ಇನ್ನೊಮ್ಮೆ ನೋಡು."; en.textContent = "That’s ವ. Look again."; }
      else { kn.textContent = "ಒಂದು ಅಕ್ಷರ ತಪ್ಪಿದೆ."; en.textContent = "One letter needs fixing. I’ve marked it."; }
      first.textContent = ok ? "ಮ" : "ಯ";
      first.className = "tile " + (ok ? "ok" : "flag");
      choosing.hidden = ok; fixed.hidden = !ok;
      btns.forEach(function (b, i) { b.classList.toggle("picked", opts[i] === pick && !ok); });
    }
    render();
  })();

  /* 04 · Test view */
  (function () {
    var root = document.getElementById("test"), tabs = document.getElementById("test-tabs");
    if (!root || !tabs) return;
    var rows = [
      { q: "Write the word for “house”", a: "ಮನೆ", ok: true },
      { q: "Write the word for “tree”", a: "ಮರ", ok: true },
      { q: "Opposite of ದೊಡ್ಡ (big)", a: "ಚಿಕ್ಕ", ok: true },
      { q: "Write the word for “water”", a: "ನೀರು", ok: false }
    ];
    var after = false;
    var box = $(root, '[data-t="rows"]'), score = $(root, '[data-t="score"]'), note = $(root, '[data-t="note"]');
    var bs = tabs.querySelectorAll("button");
    bs.forEach(function (b) { b.addEventListener("click", function () { after = b.getAttribute("data-t") === "after"; render(); }); });
    function render() {
      bs.forEach(function (b) { b.setAttribute("aria-pressed", (b.getAttribute("data-t") === "after") === after ? "true" : "false"); });
      score.textContent = after ? "3 / 4" : "— / 4";
      note.textContent = after ? "Marks appear at the end, with the right answer shown for anything missed." : "During the test, " + P + " gives no verdicts. Your child just writes.";
      box.textContent = "";
      rows.forEach(function (r) {
        var row = el("div", { "class": "test-row" });
        row.appendChild(el("span", null, r.q));
        var a = el("span", { "class": "ans" });
        a.appendChild(el("span", { "class": "kn" }, r.a));
        var m = el("span", { "class": "mark " + (r.ok ? "ok" : "no") }, after ? (r.ok ? "✓" : "✗") : "");
        if (after) m.setAttribute("aria-label", r.ok ? "correct" : "not correct");
        a.appendChild(m);
        row.appendChild(a);
        box.appendChild(row);
      });
    }
    render();
  })();

  /* 05 · Parent view */
  (function () {
    var root = document.getElementById("parent");
    if (!root) return;
    var days = [
      { label: "Monday", items: [["Letters: ಪ ಫ ಬ ಭ ಮ", "Done"], ["Writing practice", "Done"]], lines: ["ಪ ಪ ಪ ಪ ಪ", "ಬ ಬ ಬ ಬ ಬ", "ಮ ಮ ಮ ಮ ಮ", "ಪದ  ಮಠ"] },
      { label: "Wednesday", items: [["Chapter 4 · Word pairs", "Done"], ["Recall: 6 words", "5 of 6"]], lines: ["ಮಳೆ  ಮೋಡ", "ಗಿಡ  ಮರ", "ನೀರು  ಹೊಳೆ", ""] },
      { label: "Sunday", items: [["Weekly test · Chapter 4", "3 of 4"], ["Missed word: ನೀರು", "Practising"]], lines: ["ನೀರು ನೀರು", "ಮನೆ  ಮರ", "ಚಿಕ್ಕ", ""] }
    ];
    var cur = 0;
    var tabs = $(root, '[data-p="days"]'), items = $(root, '[data-p="items"]'), lines = $(root, '[data-p="lines"]');
    var bs = days.map(function (d, i) {
      var b = el("button", { "class": "pill", type: "button", "aria-pressed": "false" }, d.label);
      b.addEventListener("click", function () { cur = i; render(); });
      tabs.appendChild(b);
      return b;
    });
    function render() {
      bs.forEach(function (b, i) { b.setAttribute("aria-pressed", i === cur ? "true" : "false"); });
      items.textContent = ""; lines.textContent = "";
      days[cur].items.forEach(function (p) {
        var r = el("div", { "class": "item" });
        r.appendChild(el("span", null, p[0]));
        r.appendChild(el("b", { "class": p[1] === "Done" ? "done" : "" }, p[1]));
        items.appendChild(r);
      });
      days[cur].lines.forEach(function (l) { lines.appendChild(el("div", { "class": "ln" }, l)); });
    }
    render();
  })();

  /* 06 · Tutor view */
  (function () {
    var root = document.getElementById("tutor");
    if (!root) return;
    var kids = [
      { name: "Aarav", grade: "Grade 4", tag: "On track", t: "on", assigned: "4 of 4 tasks done", knows: 14, got: 4, notyet: 1, help: "2 hints, 1 meaning", fixes: "ಯ → ಮ (twice)", test: "Chapter 4 · 9 of 10" },
      { name: "Diya", grade: "Grade 4", tag: "Needs a look", t: "look", assigned: "2 of 4 tasks done", knows: 7, got: 6, notyet: 6, help: "9 hints, 4 “I don’t remember”", fixes: "ಬ → ವ, ಳ → ಲ, ಘ → ಫ", test: "Chapter 4 · 5 of 10" },
      { name: "Kabir", grade: "Grade 5", tag: "On track", t: "on", assigned: "3 of 3 tasks done", knows: 11, got: 3, notyet: 2, help: "3 hints", fixes: "ದ → ಧ", test: "Poem 1 · 8 of 10" },
      { name: "Meera", grade: "Grade 3", tag: "Not started", t: "none", assigned: "0 of 3 tasks done", knows: 0, got: 0, notyet: 0, help: "—", fixes: "—", test: "Not taken yet" }
    ];
    var cur = 0;
    var list = $(root, '[data-k="kids"]');
    var f = {};
    ["name", "assigned", "knows", "got", "notyet", "help", "fixes", "test"].forEach(function (k) { f[k] = $(root, '[data-k="' + k + '"]'); });
    var bs = kids.map(function (k, i) {
      var li = el("li");
      var b = el("button", { "class": "kid", type: "button", "aria-pressed": "false" });
      var nm = el("span", { "class": "nm" });
      nm.appendChild(el("b", null, k.name));
      nm.appendChild(el("span", null, k.grade));
      b.appendChild(nm);
      b.appendChild(el("span", { "class": "tag " + k.t }, k.tag));
      b.addEventListener("click", function () { cur = i; render(); });
      li.appendChild(b); list.appendChild(li);
      return b;
    });
    function render() {
      bs.forEach(function (b, i) { b.setAttribute("aria-pressed", i === cur ? "true" : "false"); });
      Object.keys(f).forEach(function (k) { f[k].textContent = String(kids[cur][k]); });
    }
    render();
  })();
})();
