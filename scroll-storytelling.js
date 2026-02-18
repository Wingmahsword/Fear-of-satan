/**
 * FEAR OF SATAN — SCROLL STORYTELLING SYSTEM
 * Scroll-driven narrative with pinning, parallax, and sequential reveals
 * Vanilla JS implementation (no GSAP dependency)
 */

(function() {
    'use strict';

    class ScrollStorytelling {
        constructor() {
            this.sections = [];
            this.triggers = [];
            this.isScrolling = false;
            this.scrollY = 0;
            this.lastScrollY = 0;
            this.direction = 'down';
            this.init();
        }

        init() {
            this.bindScroll();
            this.initPinnedSections();
            this.initParallax();
            this.initRevealTriggers();
            this.initHorizontalScroll();
            this.initProgressIndicator();
            this.initSmoothScroll();
            console.log('📜 Scroll Storytelling initialized');
        }

        // Bind scroll events with throttling
        bindScroll() {
            let ticking = false;

            window.addEventListener('scroll', () => {
                this.scrollY = window.scrollY;
                this.direction = this.scrollY > this.lastScrollY ? 'down' : 'up';

                if (!ticking) {
                    requestAnimationFrame(() => {
                        this.update();
                        ticking = false;
                    });
                    ticking = true;
                }

                this.lastScrollY = this.scrollY;
            }, { passive: true });
        }

        // Update all scroll-based animations
        update() {
            this.updateTriggers();
            this.updateParallax();
            this.updateProgress();
        }

        // Pinned sections (sticky scroll)
        initPinnedSections() {
            document.querySelectorAll('[data-pin]').forEach(section => {
                const duration = parseFloat(section.dataset.pin) || 100; // viewport heights
                
                section.style.position = 'sticky';
                section.style.top = '0';
                section.style.height = '100vh';
                
                // Create wrapper for pinning
                const wrapper = document.createElement('div');
                wrapper.className = 'pin-wrapper';
                wrapper.style.height = `${duration * 100}vh`;
                section.parentNode.insertBefore(wrapper, section);
                wrapper.appendChild(section);

                // Add to triggers
                this.triggers.push({
                    element: section,
                    wrapper: wrapper,
                    type: 'pin',
                    start: () => wrapper.offsetTop,
                    end: () => wrapper.offsetTop + wrapper.offsetHeight - window.innerHeight,
                    onEnter: () => section.classList.add('pinned'),
                    onLeave: () => section.classList.remove('pinned'),
                    onProgress: (progress) => {
                        section.style.setProperty('--pin-progress', progress);
                        this.updatePinnedContent(section, progress);
                    }
                });
            });
        }

        updatePinnedContent(section, progress) {
            // Animate child elements based on scroll progress
            const layers = section.querySelectorAll('[data-pin-layer]');
            layers.forEach(layer => {
                const start = parseFloat(layer.dataset.pinStart) || 0;
                const end = parseFloat(layer.dataset.pinEnd) || 1;
                const layerProgress = Math.max(0, Math.min(1, (progress - start) / (end - start)));
                
                const translateY = (1 - layerProgress) * 100;
                const opacity = layerProgress;
                const scale = 0.8 + (layerProgress * 0.2);
                
                layer.style.transform = `translateY(${translateY}vh) scale(${scale})`;
                layer.style.opacity = opacity;
            });
        }

        // Parallax effects
        initParallax() {
            document.querySelectorAll('[data-parallax]').forEach(el => {
                const speed = parseFloat(el.dataset.parallax) || 0.5;
                const direction = el.dataset.parallaxDirection || 'vertical';
                
                this.triggers.push({
                    element: el,
                    type: 'parallax',
                    speed: speed,
                    direction: direction,
                    update: (scrollY) => {
                        const rect = el.getBoundingClientRect();
                        const centerY = rect.top + rect.height / 2;
                        const viewportCenter = window.innerHeight / 2;
                        const distance = centerY - viewportCenter;
                        
                        if (direction === 'vertical') {
                            const y = distance * speed * -1;
                            el.style.transform = `translateY(${y}px)`;
                        } else if (direction === 'horizontal') {
                            const x = distance * speed * -1;
                            el.style.transform = `translateX(${x}px)`;
                        }
                    }
                });
            });
        }

        updateParallax() {
            this.triggers
                .filter(t => t.type === 'parallax')
                .forEach(trigger => trigger.update(this.scrollY));
        }

        // Reveal animations on scroll
        initRevealTriggers() {
            const revealTypes = [
                { selector: '[data-reveal="fade"]', className: 'revealed-fade' },
                { selector: '[data-reveal="slide-up"]', className: 'revealed-slide-up' },
                { selector: '[data-reveal="slide-down"]', className: 'revealed-slide-down' },
                { selector: '[data-reveal="slide-left"]', className: 'revealed-slide-left' },
                { selector: '[data-reveal="slide-right"]', className: 'revealed-slide-right' },
                { selector: '[data-reveal="scale"]', className: 'revealed-scale' },
                { selector: '[data-reveal="rotate"]', className: 'revealed-rotate' },
                { selector: '[data-reveal="flip"]', className: 'revealed-flip' }
            ];

            revealTypes.forEach(({ selector, className }) => {
                document.querySelectorAll(selector).forEach(el => {
                    const delay = parseInt(el.dataset.revealDelay) || 0;
                    const threshold = parseFloat(el.dataset.revealThreshold) || 0.2;
                    
                    // Add initial hidden state
                    el.classList.add('reveal-hidden');
                    
                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                setTimeout(() => {
                                    el.classList.remove('reveal-hidden');
                                    el.classList.add(className);
                                    el.classList.add('revealed');
                                }, delay);
                                observer.unobserve(el);
                            }
                        });
                    }, { threshold });

                    observer.observe(el);
                });
            });

            // Stagger reveals
            document.querySelectorAll('[data-stagger-reveal]').forEach(container => {
                const children = container.children;
                const staggerDelay = parseInt(container.dataset.staggerReveal) || 100;
                const threshold = parseFloat(container.dataset.revealThreshold) || 0.1;
                
                Array.from(children).forEach((child, index) => {
                    child.classList.add('reveal-hidden');
                    child.style.transitionDelay = `${index * staggerDelay}ms`;
                });

                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            Array.from(children).forEach(child => {
                                child.classList.remove('reveal-hidden');
                                child.classList.add('revealed-fade');
                                child.classList.add('revealed');
                            });
                            observer.unobserve(container);
                        }
                    });
                }, { threshold });

                observer.observe(container);
            });
        }

        // Horizontal scroll sections
        initHorizontalScroll() {
            document.querySelectorAll('[data-horizontal-scroll]').forEach(section => {
                const container = section.querySelector('.horizontal-scroll-container');
                if (!container) return;

                const items = container.children;
                const totalWidth = Array.from(items).reduce((sum, item) => sum + item.offsetWidth, 0);
                
                // Set container height for scroll distance
                section.style.height = `${totalWidth}px`;
                container.style.position = 'sticky';
                container.style.top = '0';
                container.style.height = '100vh';
                container.style.display = 'flex';
                container.style.flexWrap = 'nowrap';

                this.triggers.push({
                    element: section,
                    type: 'horizontal',
                    container: container,
                    totalWidth: totalWidth,
                    update: (scrollY) => {
                        const rect = section.getBoundingClientRect();
                        const progress = Math.max(0, Math.min(1, -rect.top / (section.offsetHeight - window.innerHeight)));
                        const translateX = progress * -(totalWidth - window.innerWidth);
                        container.style.transform = `translateX(${translateX}px)`;
                    }
                });
            });
        }

        // Progress indicator
        initProgressIndicator() {
            const indicator = document.createElement('div');
            indicator.className = 'scroll-progress';
            indicator.innerHTML = '<div class="scroll-progress-bar"></div>';
            document.body.appendChild(indicator);
            
            this.progressBar = indicator.querySelector('.scroll-progress-bar');
        }

        updateProgress() {
            if (!this.progressBar) return;
            
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollTop / docHeight) * 100;
            
            this.progressBar.style.width = `${progress}%`;
        }

        // Smooth scroll for anchor links
        initSmoothScroll() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    const targetId = anchor.getAttribute('href');
                    if (targetId === '#') return;
                    
                    const target = document.querySelector(targetId);
                    if (target) {
                        e.preventDefault();
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });
        }

        // Update all triggers
        updateTriggers() {
            this.triggers.forEach(trigger => {
                if (trigger.type === 'pin') {
                    const start = trigger.start();
                    const end = trigger.end();
                    const progress = Math.max(0, Math.min(1, (this.scrollY - start) / (end - start)));
                    
                    if (this.scrollY >= start && this.scrollY <= end) {
                        if (!trigger.isActive) {
                            trigger.isActive = true;
                            trigger.onEnter && trigger.onEnter();
                        }
                        trigger.onProgress && trigger.onProgress(progress);
                    } else {
                        if (trigger.isActive) {
                            trigger.isActive = false;
                            trigger.onLeave && trigger.onLeave();
                        }
                    }
                } else if (trigger.type === 'horizontal') {
                    trigger.update(this.scrollY);
                }
            });
        }

        // Utility: Get scroll progress of element
        getElementProgress(el) {
            const rect = el.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const elementTop = rect.top;
            const elementHeight = rect.height;
            
            // Progress from 0 (element entering viewport) to 1 (element leaving viewport)
            return Math.max(0, Math.min(1, (windowHeight - elementTop) / (windowHeight + elementHeight)));
        }

        // Utility: Check if element is in viewport
        isInViewport(el, threshold = 0) {
            const rect = el.getBoundingClientRect();
            return (
                rect.top <= (window.innerHeight * (1 - threshold)) &&
                rect.bottom >= (window.innerHeight * threshold)
            );
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.scrollStory = new ScrollStorytelling();
        });
    } else {
        window.scrollStory = new ScrollStorytelling();
    }

})();
