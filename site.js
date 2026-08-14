/* Scroll progress bar + scroll-reveal — progressive enhancement; the page
   stays fully visible when JS is disabled. */
(function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- scroll progress ---- */
  var bar = document.querySelector(".scroll-progress");
  if (bar && !reduced) {
    var ticking = false;
    function update() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.setProperty("--p", max > 0 ? (h.scrollTop / max) : 0);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---- scroll reveal with a light stagger ---- */
  var targets = document.querySelectorAll(
    "section > h2, .skill-card, .release, .plain-card, .note-item"
  );
  if (reduced || !("IntersectionObserver" in window)) return;

  targets.forEach(function (el, i) {
    el.classList.add("reveal");
    el.style.transitionDelay = Math.min((i % 6) * 45, 180) + "ms";
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });

  targets.forEach(function (el) { io.observe(el); });
})();
