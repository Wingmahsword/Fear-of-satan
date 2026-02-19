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

    // Wait for Lenis to be ready
    const startAnimations = () => {
      if (!window.lenis) {
        setTimeout(startAnimations, 50);
        return;
      }

      // 1. HERO ENTRANCE ANIMATIONS
      const heroTl = gsapLib.timeline({ delay: 0.3 });
      
      heroTl
        .from(".hero-tag", {
          opacity: 0,
          y: 30,
          duration: 0.8,
          ease: "power2.out"
        })
        .from("#scanCanvas", {
          opacity: 0,
          scale: 0.9,
          duration: 1,
          ease: "back.out(1.7)"
        }, "-=0.4")
        .from(".hero-deck", {
          opacity: 0,
          y: 20,
          duration: 0.7
        }, "-=0.5")
        .from(".hero-insight", {
          opacity: 0,
          y: 28,
          duration: 0.9,
          stagger: 0.12
        }, "-=0.4")
        .from(".hero-cta", {
          opacity: 0,
          y: 18,
          duration: 0.75
        }, "-=0.5");

      // 2. HERO PARALLAX & SCROLL EFFECTS
      gsapLib.to(".hero-visual", {
        yPercent: -10,
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 1.1
        }
      });

      gsapLib.to(".hero-text", {
        yPercent: -5,
        opacity: 0.3,
        scrollTrigger: {
          trigger: ".hero",
          start: "center top",
          end: "bottom top",
          scrub: 1.5
        }
      });

      // 3. SIGIL ANIMATION
      gsapLib.to(".sigil-core", {
        scale: 1.08,
        duration: 2.4,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });

      gsapLib.to(".sigil-runes", {
        rotation: 360,
        duration: 20,
        repeat: -1,
        ease: "none"
      });

      // 4. MARQUEE SPEED BASED ON SCROLL VELOCITY
      if (window.lenis) {
        window.lenis.on('scroll', ({ velocity }) => {
          const speed = 1 + Math.abs(velocity) * 0.02;
          gsapLib.to(".marquee-track", {
            duration: 0.3,
            timeScale: speed,
            overwrite: true
          });
        });
      }

      // 5. ODOOURLESS SECTION REVEAL
      gsapLib.from("#odourless", {
        scale: 0.9,
        opacity: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "#odourless",
          start: "top 80%",
          end: "top 50%",
          scrub: 1
        }
      });

      gsapLib.from("#odourless h2", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: "#odourless",
          start: "top 70%"
        }
      });

      // 6. PRODUCT CARDS WITH ENHANCED STAGGER
      gsapLib.from(".p-card", {
        opacity: 0,
        y: 60,
        rotateX: 15,
        duration: 0.9,
        stagger: { 
          each: 0.1, 
          from: "start",
          grid: "auto"
        },
        ease: "power2.out",
        scrollTrigger: {
          trigger: "#shop",
          start: "top 75%"
        }
      });

      // Product card hover effects
      document.querySelectorAll(".p-card").forEach((card) => {
        card.addEventListener("mouseenter", () => {
          gsapLib.to(card, {
            y: -10,
            scale: 1.02,
            duration: 0.3,
            ease: "power2.out",
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
          });
          gsapLib.to(card.querySelector(".card-glare"), {
            opacity: 0.15,
            duration: 0.3
          });
        });

        card.addEventListener("mouseleave", () => {
          gsapLib.to(card, {
            y: 0,
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
            boxShadow: "0 0 0 rgba(0,0,0,0)"
          });
          gsapLib.to(card.querySelector(".card-glare"), {
            opacity: 0,
            duration: 0.3
          });
        });
      });

      // 7. WORLD SECTION PARALLAX
      gsapLib.from("#worldMascot", {
        y: 100,
        rotation: -10,
        opacity: 0,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".world",
          start: "top 70%"
        }
      });

      gsapLib.to("#worldMascot", {
        y: -50,
        rotation: 5,
        scrollTrigger: {
          trigger: ".world",
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5
        }
      });

      // Stats counter animation
      gsapLib.from(".world-right .stat", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".world",
          start: "top 65%"
        }
      });

      // 8. NEWSLETTER SECTION
      gsapLib.from(".nl-inner", {
        scale: 0.95,
        opacity: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".newsletter",
          start: "top 75%"
        }
      });

      // 9. FOOTER REVEAL
      gsapLib.from(".footer-brand", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: ".footer",
          start: "top 85%"
        }
      });

      gsapLib.from(".footer-socials a", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        scrollTrigger: {
          trigger: ".footer",
          start: "top 80%"
        }
      });

      // 10. FLOATING 3D SHAPES PARALLAX
      gsapLib.utils.toArray(".floating-3d").forEach((shape, i) => {
        const speed = parseFloat(shape.dataset.float) || 1;
        gsapLib.to(shape, {
          y: -30 * speed,
          rotation: 10 * speed,
          scrollTrigger: {
            trigger: shape,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5
          }
        });
      });

      // 11. NAVIGATION INTERACTIONS
      const navLinks = document.querySelectorAll(".nav-center a");
      navLinks.forEach((link) => {
        link.addEventListener("mouseenter", () => {
          gsapLib.to(link, { 
            y: -2, 
            duration: 0.2, 
            overwrite: true 
          });
        });
        link.addEventListener("mouseleave", () => {
          gsapLib.to(link, { 
            y: 0, 
            duration: 0.2, 
            overwrite: true 
          });
        });
      });

      // Bag button hover
      const bagBtn = document.getElementById("bagBtn");
      if (bagBtn) {
        bagBtn.addEventListener("mouseenter", () => {
          gsapLib.to(bagBtn, {
            scale: 1.05,
            duration: 0.2,
            overwrite: true
          });
        });
        bagBtn.addEventListener("mouseleave", () => {
          gsapLib.to(bagBtn, {
            scale: 1,
            duration: 0.2,
            overwrite: true
          });
        });
      }

      // Newsletter submit button
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

      // 12. SMOOTH SCROLL TO ANCHORS
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute('href'));
          if (target && window.scrollToSection) {
            window.scrollToSection(target);
          } else if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });

      console.log(' GSAP Ritual Motion initialized with Lenis');
    };

    startAnimations();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRitualMotion, { once: true });
  } else {
    initRitualMotion();
  }
})();