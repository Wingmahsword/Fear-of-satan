(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  function initRitualMotion() {
    const gsapLib = window.gsap;
    const scrollTrigger = window.ScrollTrigger;

    if (!gsapLib || !scrollTrigger || prefersReduced.matches) {
      return;
    }

    gsapLib.registerPlugin(scrollTrigger);
    gsapLib.defaults({ ease: "power3.out" });

    gsapLib.from(".hero-insight", {
      opacity: 0,
      y: 28,
      duration: 0.9,
      stagger: 0.12,
      delay: 0.2
    });

    gsapLib.from(".hero-cta", {
      opacity: 0,
      y: 18,
      duration: 0.75,
      delay: 0.5
    });

    gsapLib.to(".hero-visual", {
      yPercent: -10,
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1.1
      }
    });

    gsapLib.to(".sigil-core", {
      scale: 1.08,
      duration: 2.4,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });

    gsapLib.to(".hero-insights", {
      yPercent: -5,
      scrollTrigger: {
        trigger: ".hero",
        start: "top 10%",
        end: "bottom top",
        scrub: 1.2
      }
    });

    gsapLib.from(".p-card", {
      opacity: 0,
      y: 34,
      duration: 0.85,
      stagger: { each: 0.08, from: "start" },
      scrollTrigger: {
        trigger: "#shop",
        start: "top 78%"
      }
    });

    gsapLib.from(".world-right .stat", {
      opacity: 0,
      y: 20,
      duration: 0.65,
      stagger: 0.12,
      scrollTrigger: {
        trigger: ".world",
        start: "top 74%"
      }
    });

    const navLinks = document.querySelectorAll(".nav-center a");
    navLinks.forEach((link) => {
      link.addEventListener("mouseenter", () => {
        gsapLib.to(link, { y: -1, duration: 0.2, overwrite: true });
      });
      link.addEventListener("mouseleave", () => {
        gsapLib.to(link, { y: 0, duration: 0.2, overwrite: true });
      });
    });

    const submitButton = document.querySelector(".nl-submit");
    if (submitButton) {
      submitButton.addEventListener("mouseenter", () => {
        gsapLib.to(submitButton, {
          scale: 1.03,
          duration: 0.24,
          overwrite: true,
          boxShadow: "0 10px 32px rgba(255,77,45,0.45)"
        });
      });

      submitButton.addEventListener("mouseleave", () => {
        gsapLib.to(submitButton, {
          scale: 1,
          duration: 0.24,
          overwrite: true,
          boxShadow: "0 0 0 rgba(0,0,0,0)"
        });
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRitualMotion, { once: true });
  } else {
    initRitualMotion();
  }
})();