(() => {
  // Section reveal – mobile safe
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  const targets = document.querySelectorAll("[data-reveal]");

  // Add base class
  targets.forEach(el => el.classList.add("reveal"));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target); // run once
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -10% 0px" });

  targets.forEach(el => io.observe(el));
})();