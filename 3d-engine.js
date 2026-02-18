/**
 * FEAR OF SATAN — 3D ENGINE
 * Performance-First 3D System with O(1) Complexity
 * Single RAF Loop | Throttled Events | Object Pooling
 */

(function() {
    'use strict';

    /* ==================================================
       1. UTILITY FUNCTIONS — O(1) Operations
       ================================================== */
    const utils = {
        // Throttle function for event handlers
        throttle: (fn, limit) => {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    fn.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        // Debounce for resize events
        debounce: (fn, wait) => {
            let timeout;
            return function(...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => fn.apply(this, args), wait);
            };
        },

        // Clamp value between min and max
        clamp: (val, min, max) => Math.min(Math.max(val, min), max),

        // Linear interpolation
        lerp: (start, end, factor) => start + (end - start) * factor,

        // Check if element is in viewport
        isInViewport: (el) => {
            const rect = el.getBoundingClientRect();
            return rect.top < window.innerHeight && rect.bottom > 0;
        },

        // Detect touch device
        isTouch: () => window.matchMedia('(pointer: coarse)').matches,

        // Check for reduced motion preference
        prefersReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
    };

    /* ==================================================
       2. GLOBAL STATE MANAGEMENT — Singleton Pattern
       ================================================== */
    const state = {
        mouseX: 0,
        mouseY: 0,
        targetMouseX: 0,
        targetMouseY: 0,
        scrollY: 0,
        lastScrollY: 0,
        scrollDirection: 'down',
        viewport: { width: window.innerWidth, height: window.innerHeight },
        isTouch: utils.isTouch(),
        reducedMotion: utils.prefersReducedMotion(),
        performanceMode: false
    };

    /* ==================================================
       3. ANIMATION LOOP — Single RAF (O(1))
       ================================================== */
    class AnimationLoop {
        constructor() {
            this.callbacks = new Set();
            this.isRunning = false;
            this.frameId = null;
            this.lastTime = 0;
        }

        add(callback) {
            this.callbacks.add(callback);
            if (!this.isRunning) this.start();
            return () => this.callbacks.delete(callback);
        }

        start() {
            this.isRunning = true;
            this.tick();
        }

        stop() {
            this.isRunning = false;
            if (this.frameId) {
                cancelAnimationFrame(this.frameId);
                this.frameId = null;
            }
        }

        tick(currentTime = 0) {
            if (!this.isRunning) return;

            const deltaTime = currentTime - this.lastTime;
            
            // Update mouse position with smoothing
            state.mouseX = utils.lerp(state.mouseX, state.targetMouseX, 0.15);
            state.mouseY = utils.lerp(state.mouseY, state.targetMouseY, 0.15);

            // Execute all callbacks
            this.callbacks.forEach(callback => {
                try {
                    callback(currentTime, deltaTime);
                } catch (e) {
                    console.error('Animation callback error:', e);
                }
            });

            this.lastTime = currentTime;
            this.frameId = requestAnimationFrame((t) => this.tick(t));
        }
    }

    // Global animation loop instance
    const animLoop = new AnimationLoop();

    /* ==================================================
       4. 3D TILT SYSTEM — Optimized (O(1) per element)
       ================================================== */
    class Tilt3D {
        constructor(element, options = {}) {
            this.el = element;
            this.layers = element.querySelectorAll('.tilt-layer');
            this.glare = element.querySelector('.card-glare');
            
            // Configuration with defaults
            this.config = {
                maxTilt: options.maxTilt || 15,
                perspective: options.perspective || 1000,
                scale: options.scale || 1.02,
                speed: options.speed || 400,
                glare: options.glare !== false,
                ...options
            };

            this.bounds = null;
            this.isHovering = false;
            this.rafId = null;

            // Skip if touch device or reduced motion
            if (state.isTouch || state.reducedMotion) return;

            this.init();
        }

        init() {
            // Store reference for cleanup
            this.el._tiltInstance = this;

            // Bind events with throttling
            this.el.addEventListener('mouseenter', () => this.onEnter());
            this.el.addEventListener('mouseleave', () => this.onLeave());
            this.el.addEventListener('mousemove', 
                utils.throttle((e) => this.onMove(e), 16)
            );

            // Register with animation loop
            this.unsubscribe = animLoop.add(() => this.update());
        }

        onEnter() {
            this.isHovering = true;
            this.bounds = this.el.getBoundingClientRect();
            this.el.style.transition = 'transform 0.1s ease-out';
        }

        onLeave() {
            this.isHovering = false;
            this.el.style.transition = `transform ${this.config.speed}ms ease-out`;
            
            // Reset transforms
            requestAnimationFrame(() => {
                this.el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
                this.layers.forEach(layer => {
                    layer.style.transform = layer.dataset.depth 
                        ? `translateZ(${parseInt(layer.dataset.depth) * 10}px)` 
                        : '';
                });
                if (this.glare) {
                    this.glare.style.background = 'transparent';
                }
            });
        }

        onMove(e) {
            if (!this.bounds || !this.isHovering) return;
            
            this.lastMouseEvent = e;
        }

        update() {
            if (!this.isHovering || !this.lastMouseEvent) return;

            const e = this.lastMouseEvent;
            const { left, top, width, height } = this.bounds;
            
            // Calculate normalized position (0-1)
            const x = (e.clientX - left) / width;
            const y = (e.clientY - top) / height;

            // Calculate rotation (inverted for natural feel)
            const rotateX = (y - 0.5) * -this.config.maxTilt;
            const rotateY = (x - 0.5) * this.config.maxTilt;

            // Apply main card transform
            this.el.style.transform = `
                perspective(${this.config.perspective}px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                scale(${this.config.scale})
            `;

            // Apply parallax to layers
            this.layers.forEach((layer, index) => {
                const depth = (index + 1) * 10;
                const layerRotateX = (y - 0.5) * -(this.config.maxTilt + depth * 0.5);
                const layerRotateY = (x - 0.5) * (this.config.maxTilt + depth * 0.5);
                const translateZ = depth;

                layer.style.transform = `
                    translateZ(${translateZ}px)
                    rotateX(${layerRotateX}deg)
                    rotateY(${layerRotateY}deg)
                `;
            });

            // Update glare position
            if (this.glare) {
                const glareX = x * 100;
                const glareY = y * 100;
                this.glare.style.background = `
                    radial-gradient(
                        circle at ${glareX}% ${glareY}%,
                        rgba(255, 255, 255, 0.3) 0%,
                        rgba(255, 255, 255, 0.1) 40%,
                        transparent 70%
                    )
                `;
            }
        }

        destroy() {
            if (this.unsubscribe) this.unsubscribe();
            this.el._tiltInstance = null;
        }
    }

    /* ==================================================
       5. PARALLAX SYSTEM — Global Mouse Tracking
       ================================================== */
    class ParallaxSystem {
        constructor() {
            this.layers = [];
            this.isActive = !state.isTouch && !state.reducedMotion;
        }

        add(selector, speed = 0.5) {
            if (!this.isActive) return;

            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                this.layers.push({
                    element: el,
                    speed: speed,
                    baseTransform: el.style.transform || ''
                });
            });

            // Subscribe to animation loop
            if (this.layers.length === 1) {
                this.unsubscribe = animLoop.add(() => this.update());
            }
        }

        update() {
            const centerX = state.viewport.width / 2;
            const centerY = state.viewport.height / 2;

            // Calculate offset from center (-1 to 1)
            const offsetX = (state.mouseX - centerX) / centerX;
            const offsetY = (state.mouseY - centerY) / centerY;

            this.layers.forEach(layer => {
                const moveX = offsetX * 30 * layer.speed;
                const moveY = offsetY * 20 * layer.speed;

                layer.element.style.transform = `
                    ${layer.baseTransform}
                    translate3d(${moveX}px, ${moveY}px, 0)
                `;
            });
        }
    }

    /* ==================================================
       6. SCROLL REVEAL 3D — IntersectionObserver
       ================================================== */
    class ScrollReveal3D {
        constructor() {
            this.observer = null;
            this.elements = new Map();
            this.isActive = !state.reducedMotion;
        }

        init() {
            if (!this.isActive) {
                // Show all elements immediately
                document.querySelectorAll('.reveal-3d').forEach(el => {
                    el.style.opacity = '1';
                    el.style.transform = 'none';
                });
                return;
            }

            this.observer = new IntersectionObserver(
                (entries) => this.onIntersect(entries),
                {
                    threshold: [0, 0.25, 0.5, 0.75, 1],
                    rootMargin: '0px 0px -50px 0px'
                }
            );

            document.querySelectorAll('.reveal-3d').forEach(el => {
                this.observer.observe(el);
                this.elements.set(el, { ratio: 0 });
            });
        }

        onIntersect(entries) {
            entries.forEach(entry => {
                const el = entry.target;
                const ratio = entry.intersectionRatio;

                if (entry.isIntersecting) {
                    el.classList.add('visible');
                    
                    // Calculate 3D transform based on visibility
                    const rotateX = (1 - ratio) * 20;
                    const scale = 0.9 + (ratio * 0.1);
                    
                    if (!el.classList.contains('visible')) {
                        el.style.transform = `
                            perspective(1000px)
                            rotateX(${rotateX}deg)
                            scale(${scale})
                        `;
                    }
                }
            });
        }
    }

    /* ==================================================
       7. PARTICLE SYSTEM — Burst Effect
       ================================================== */
    class ParticleSystem {
        constructor() {
            this.container = null;
            this.pool = [];
            this.active = [];
            this.maxParticles = 50;
        }

        init() {
            this.container = document.createElement('div');
            this.container.className = 'particle-container';
            document.body.appendChild(this.container);

            // Pre-create particle pool
            for (let i = 0; i < this.maxParticles; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                this.pool.push(particle);
            }
        }

        burst(x, y, count = 8) {
            if (state.isTouch || state.reducedMotion) return;

            const colors = ['#ff1744', '#ff2d7b', '#00e5ff', '#c6ff00', '#b040ff'];

            for (let i = 0; i < count; i++) {
                const particle = this.pool.pop() || document.createElement('div');
                
                particle.style.left = x + 'px';
                particle.style.top = y + 'px';
                particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                particle.style.transform = 'scale(1)';
                particle.style.opacity = '1';

                this.container.appendChild(particle);

                // Calculate burst trajectory
                const angle = (Math.PI * 2 * i) / count;
                const velocity = 50 + Math.random() * 100;
                const tx = Math.cos(angle) * velocity;
                const ty = Math.sin(angle) * velocity;

                // Animate with Web Animations API
                const animation = particle.animate([
                    { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                    { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
                ], {
                    duration: 600 + Math.random() * 200,
                    easing: 'cubic-bezier(0, .9, .57, 1)',
                    fill: 'forwards'
                });

                animation.onfinish = () => {
                    particle.remove();
                    this.pool.push(particle);
                };
            }
        }
    }

    /* ==================================================
       8. MAGNETIC BUTTONS — Attraction Effect
       ================================================== */
    class MagneticSystem {
        constructor() {
            this.buttons = [];
            this.isActive = !state.isTouch && !state.reducedMotion;
        }

        init(selector) {
            if (!this.isActive) return;

            document.querySelectorAll(selector).forEach(btn => {
                btn.classList.add('magnetic');
                
                btn.addEventListener('mousemove', (e) => {
                    const rect = btn.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    
                    btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
                });

                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = 'translate(0, 0)';
                });
            });
        }
    }

    /* ==================================================
       9. PERFORMANCE MONITOR
       ================================================== */
    class PerformanceMonitor {
        constructor() {
            this.frames = [];
            this.lastTime = performance.now();
            this.fps = 60;
        }

        start() {
            animLoop.add(() => this.measure());
        }

        measure() {
            const now = performance.now();
            const delta = now - this.lastTime;
            this.lastTime = now;

            const fps = 1000 / delta;
            this.frames.push(fps);

            if (this.frames.length > 60) {
                this.frames.shift();
            }

            // Calculate average FPS
            const avg = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
            this.fps = Math.round(avg);

            // Enable performance mode if FPS drops below 30
            if (this.fps < 30 && !state.performanceMode) {
                state.performanceMode = true;
                document.body.classList.add('performance-mode');
                console.log('Performance mode enabled');
            }
        }
    }

    /* ==================================================
       10. INITIALIZATION
       ================================================== */
    function init() {
        // Check for reduced motion preference
        if (state.reducedMotion) {
            document.body.classList.add('reduced-motion');
        }

        // Initialize particle system
        const particles = new ParticleSystem();
        particles.init();

        // Initialize scroll reveals
        const scrollReveal = new ScrollReveal3D();
        scrollReveal.init();

        // Initialize parallax system
        const parallax = new ParallaxSystem();
        parallax.add('.parallax-layer', 0.5);

        // Initialize magnetic buttons
        const magnetic = new MagneticSystem();
        magnetic.init('.btn-3d, .p-add');

        // Initialize 3D tilt on product cards
        document.querySelectorAll('.p-card').forEach((card, index) => {
            // Add stagger index
            card.style.setProperty('--index', index);
            
            // Initialize tilt (delayed for performance)
            setTimeout(() => {
                new Tilt3D(card, {
                    maxTilt: 15,
                    perspective: 1000,
                    scale: 1.02,
                    glare: true
                });
            }, index * 50);
        });

        // Add burst effect to add-to-cart buttons
        document.querySelectorAll('.p-add, .btn-3d').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const rect = btn.getBoundingClientRect();
                particles.burst(
                    rect.left + rect.width / 2,
                    rect.top + rect.height / 2,
                    10
                );
            });
        });

        // Track mouse position globally
        document.addEventListener('mousemove', 
            utils.throttle((e) => {
                state.targetMouseX = e.clientX;
                state.targetMouseY = e.clientY;
            }, 16)
        );

        // Update viewport on resize
        window.addEventListener('resize', 
            utils.debounce(() => {
                state.viewport.width = window.innerWidth;
                state.viewport.height = window.innerHeight;
            }, 100)
        );

        // Start performance monitor
        const monitor = new PerformanceMonitor();
        monitor.start();

        console.log('🎨 FOS 3D Engine initialized');
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
