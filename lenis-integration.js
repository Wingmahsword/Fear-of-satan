/**
 * FEAR OF SATAN - Lenis Smooth Scroll Integration
 * Syncs Lenis with GSAP ScrollTrigger
 */

(function() {
    'use strict';

    // Initialize Lenis with optimized settings
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false,
    });

    // Integrate with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Add lenis class to html
    document.documentElement.classList.add('lenis');

    // Expose globally
    window.lenis = lenis;
    window.scrollToSection = (target, options = {}) => {
        lenis.scrollTo(target, {
            offset: options.offset || 0,
            duration: options.duration || 1.2,
            easing: options.easing,
            immediate: options.immediate || false
        });
    };

    // Expose scroll data for other modules
    window.getLenisData = () => ({
        scroll: lenis.scroll,
        limit: lenis.limit,
        velocity: lenis.velocity,
        direction: lenis.direction,
        progress: lenis.progress
    });

    console.log(' Lenis smooth scroll initialized');
})();
