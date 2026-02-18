(() => {
  const mascot = document.getElementById("mascot");
  const shadow = document.getElementById("mascotShadow");
  const reflection = document.getElementById("mascotReflection");
  if (!mascot || !shadow || !reflection) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let vw = window.innerWidth;
  let mw = mascot.getBoundingClientRect().width;
  let maxScroll = Math.max(document.body.scrollHeight - innerHeight, 1);

  let cx = 0;
  let tx = 0;
  let cy = 0;
  let ty = 0;
  let cr = 0;
  let tr = 0;
  let raf = 0;

  const lerp = (a, b, t) => a + (b - a) * t;

  function updateTargets() {
    const s = scrollY;
    const p = Math.min(Math.max(s / maxScroll, 0), 1);

    tx = -mw + (vw + mw * 2) * p;

    if (reduced) {
      ty = 0;
      tr = 0;
    } else {
      const walk = s * 0.045;
      ty = Math.sin(walk) * 10;
      tr = Math.sin(walk * 0.6) * 2.2;
    }

    if (!raf) raf = requestAnimationFrame(render);
  }

  function render() {
    raf = 0;

    cx = lerp(cx, tx, 0.16);
    cy = lerp(cy, ty, 0.16);
    cr = lerp(cr, tr, 0.16);

    mascot.style.transform = `translate3d(${cx}px, ${cy}px, 0) rotate(${cr}deg)`;
    shadow.style.transform = `translate3d(${cx + mw * 0.12}px, 0, 0) scale(${1 - Math.abs(cy) * 0.003})`;
    reflection.style.transform = `translate3d(${cx}px, ${cy + 18}px, 0) scaleY(-1) rotate(${-cr * 0.25}deg)`;

    if (Math.abs(cx - tx) > 0.3) raf = requestAnimationFrame(render);
  }

  function measure() {
    vw = innerWidth;
    mw = mascot.getBoundingClientRect().width;
    maxScroll = Math.max(document.body.scrollHeight - innerHeight, 1);
    updateTargets();
  }

  addEventListener("scroll", updateTargets, { passive: true });
  addEventListener("resize", measure, { passive: true });
  addEventListener("load", measure);

  measure();
})();