/**
 * Scroll mascot background behavior aligned to the demo reference.
 * Uses rAF scheduling to avoid running layout/paint work on every scroll event.
 */

(function() {
    'use strict';

    const wrapper = document.getElementById('scrollMascotWrapper');
    const mascot = document.getElementById('scrollMascotImage');
    if (!wrapper || !mascot) return;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = reducedMotionQuery.matches;
    let rafId = 0;

    function computeTranslateX() {
        const doc = document.documentElement;
        const scrollTop = doc.scrollTop;
        const maxScroll = doc.scrollHeight - doc.clientHeight;
        const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;

        if (reducedMotion) {
            return (window.innerWidth - mascot.offsetWidth) * 0.5;
        }

        const travelWidth = window.innerWidth + mascot.offsetWidth * 2;
        return progress * travelWidth - mascot.offsetWidth;
    }

    function updatePosition() {
        rafId = 0;
        const translateX = computeTranslateX();
        wrapper.style.transform = `translate3d(${translateX}px, -50%, 0)`;
    }

    function requestUpdate() {
        if (rafId) return;
        rafId = requestAnimationFrame(updatePosition);
    }

    function onReducedMotionChange(event) {
        reducedMotion = event.matches;
        requestUpdate();
    }

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
    mascot.addEventListener('load', requestUpdate);

    if (typeof reducedMotionQuery.addEventListener === 'function') {
        reducedMotionQuery.addEventListener('change', onReducedMotionChange);
    } else if (typeof reducedMotionQuery.addListener === 'function') {
        reducedMotionQuery.addListener(onReducedMotionChange);
    }

    requestUpdate();
})();
