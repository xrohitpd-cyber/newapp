(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.getElementById("menuBtn");
  var nav = document.getElementById("nav");

  function setMenu(open) {
    nav.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.textContent = open ? "Close" : "Menu";
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      setMenu(!nav.classList.contains("open"));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
  }

  /* ---------- Active nav link while scrolling ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav a[href^='#']"));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = "#" + entry.target.id;
        links.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === id && !a.classList.contains("nav-cta"));
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Rack panel: power-on sequence ---------- */
  var rack = document.querySelector(".rack");
  if (rack) {
    // One staged moment on load: LEDs switch on in order.
    window.setTimeout(function () { rack.classList.add("on"); }, reduceMotion ? 0 : 350);
  }

  /* ---------- Rack panel: sample latency readings ---------- */
  var units = Array.prototype.slice.call(document.querySelectorAll("#rackList .unit"));

  function jitter() {
    units.forEach(function (unit) {
      var base = parseInt(unit.getAttribute("data-base"), 10);
      var next = Math.max(1, base + Math.round((Math.random() - 0.5) * Math.max(2, base * 0.2)));
      unit.querySelector("b").textContent = next;
    });
  }
  if (!reduceMotion) window.setInterval(jitter, 2600);

  /* ---------- Rack panel: uptime streak ---------- */
  var streakEl = document.getElementById("streak");
  // Sample start point: 214 days ago. Replace with a real date if you want an accurate counter.
  var streakStart = Date.now() - 214 * 24 * 60 * 60 * 1000;

  function pad(n) { return n < 10 ? "0" + n : String(n); }

  function renderStreak() {
    var s = Math.floor((Date.now() - streakStart) / 1000);
    var d = Math.floor(s / 86400);
    var h = Math.floor((s % 86400) / 3600);
    var m = Math.floor((s % 3600) / 60);
    var sec = s % 60;
    streakEl.textContent = d + "d " + pad(h) + "h " + pad(m) + "m " + pad(sec) + "s";
  }
  if (streakEl) {
    renderStreak();
    window.setInterval(renderStreak, 1000);
  }

  /* ---------- Skills filter ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var skills = Array.prototype.slice.call(document.querySelectorAll("#skillGrid li"));

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var filter = chip.getAttribute("data-filter");
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle("is-on", on);
        c.setAttribute("aria-pressed", String(on));
      });
      skills.forEach(function (li) {
        var match = filter === "all" || li.getAttribute("data-cat") === filter;
        li.classList.toggle("dim", !match);
      });
    });
  });

  /* ---------- Copy email ---------- */
  var copyBtn = document.getElementById("copyBtn");
  var mailLink = document.getElementById("mailLink");
  var statusEl = document.getElementById("copyStatus");

  function announce(msg) {
    statusEl.textContent = msg;
    window.setTimeout(function () { statusEl.textContent = ""; }, 3000);
  }

  if (copyBtn && mailLink) {
    copyBtn.addEventListener("click", function () {
      var email = mailLink.textContent.trim();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(
          function () { announce("Email copied."); },
          function () { announce("Copy failed. Select the address above and copy it."); }
        );
      } else {
        announce("Copy is not supported here. Select the address above and copy it.");
      }
    });
  }
})();