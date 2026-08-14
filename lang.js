/* Shared trilingual switcher — every .t element carries data-en / data-zh / data-ja. */
(function () {
  var LANGS = ["en", "zh", "ja"];

  function apply(lang) {
    document.documentElement.lang = (lang === "zh") ? "zh-Hant" : lang;
    document.querySelectorAll(".t").forEach(function (el) {
      var v = el.getAttribute("data-" + lang);
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      var on = btn.getAttribute("data-lang") === lang;
      btn.classList.toggle("on", on);
      btn.setAttribute("aria-pressed", String(on));
    });
    try { localStorage.setItem("lang", lang); } catch (e) {}
  }

  var saved = null;
  try { saved = localStorage.getItem("lang"); } catch (e) {}

  var initial = (saved && LANGS.indexOf(saved) >= 0) ? saved
    : (/^zh/i.test(navigator.language)) ? "zh"
    : (/^ja/i.test(navigator.language)) ? "ja"
    : "en";

  apply(initial);

  document.querySelectorAll(".lang-btn").forEach(function (btn) {
    btn.addEventListener("click", function () { apply(btn.getAttribute("data-lang")); });
  });
})();
