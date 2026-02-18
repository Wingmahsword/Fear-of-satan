/**
 * FEAR OF SATAN — MOBILE DETECTION & OPTIMIZATION
 * Detects mobile devices and applies performance optimizations
 */

(function() {
    'use strict';

    const MobileOptimizer = {
        // Device detection
        isTouch: window.matchMedia('(pointer: coarse)').matches,
        isMobile: window.innerWidth <= 768,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        
        // Battery and performance
        isLowPowerMode: false,
        connection: navigator.connection || navigator.mozConnection || navigator.webkitConnection,

        init() {
            this.detectCapabilities();
            this.applyOptimizations();
            this.bindEvents();
            console.log('📱 Mobile Optimizer initialized');
        },

        detectCapabilities() {
            // Check for low-end devices
            const memory = navigator.deviceMemory || 4;
            const cores = navigator.hardwareConcurrency || 4;
            
            this.isLowEndDevice = memory < 4 || cores < 4;
            
            // Check connection speed
            if (this.connection) {
                this.isSlowConnection = this.connection.effectiveType === '2g' || 
                                       this.connection.effectiveType === 'slow-2g' ||
                                       this.connection.saveData === true;
            }

            // Add classes to body
            document.body.classList.toggle('is-touch', this.isTouch);
            document.body.classList.toggle('is-mobile', this.isMobile);
            document.body.classList.toggle('is-low-end', this.isLowEndDevice);
            document.body.classList.toggle('reduced-motion', this.reducedMotion);
        },

        applyOptimizations() {
            // Disable 3D effects on mobile
            if (this.isTouch || this.isMobile || this.isLowEndDevice) {
                this.disable3DEffects();
            }

            // Disable heavy animations on low-end devices
            if (this.isLowEndDevice || this.reducedMotion) {
                this.disableHeavyAnimations();
            }

            // Optimize for slow connections
            if (this.isSlowConnection) {
                this.optimizeForSlowConnection();
            }

            // Adjust cart for mobile
            if (this.isMobile) {
                this.optimizeCartForMobile();
            }

            // Optimize lightbox for touch
            if (this.isTouch) {
                this.optimizeLightboxForTouch();
            }
        },

        disable3DEffects() {
            // Disable 3D card tilts
            document.querySelectorAll('.p-card').forEach(card => {
                card.style.transform = 'none';
                card.style.perspective = 'none';
                
                // Remove 3D event listeners if they exist
                if (card._tiltInstance) {
                    card._tiltInstance.destroy();
                }
            });

            // Disable parallax
            document.querySelectorAll('.parallax-layer').forEach(layer => {
                layer.style.transform = 'none';
            });

            // Disable floating elements
            document.querySelectorAll('.floating-3d').forEach(el => {
                el.style.display = 'none';
            });

            // Simplify scan effect
            const scanCanvas = document.getElementById('scanCanvas');
            if (scanCanvas) {
                // Reduce slice count for mobile
                if (window.scanTextEffect) {
                    window.scanTextEffect.sliceCount = 30; // Reduced from 80
                }
            }
        },

        disableHeavyAnimations() {
            // Disable particle effects
            if (window.ParticleSystem) {
                window.ParticleSystem.disabled = true;
            }

            // Simplify scroll animations
            document.querySelectorAll('[data-reveal]').forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'none';
            });

            // Disable scramble effects (CPU intensive)
            document.querySelectorAll('[data-scramble]').forEach(el => {
                el.dataset.scramble = '0'; // Disable
            });

            // Reduce marquee speed
            document.querySelectorAll('.marquee-track').forEach(track => {
                track.style.animationDuration = '40s'; // Slower
            });
        },

        optimizeForSlowConnection() {
            // Use lower resolution images
            document.querySelectorAll('img').forEach(img => {
                if (img.dataset.srcLow) {
                    img.src = img.dataset.srcLow;
                }
                img.loading = 'lazy';
            });

            // Disable auto-playing elements
            document.querySelectorAll('video, audio').forEach(media => {
                media.preload = 'none';
            });
        },

        optimizeCartForMobile() {
            // Ensure cart drawer is full width on mobile
            const style = document.createElement('style');
            style.textContent = `
                @media (max-width: 768px) {
                    .cart-drawer {
                        max-width: 100% !important;
                        width: 100% !important;
                    }
                }
            `;
            document.head.appendChild(style);

            // Improve touch targets
            document.querySelectorAll('.qty-btn, .cart-item-remove').forEach(btn => {
                btn.style.minHeight = '44px';
                btn.style.minWidth = '44px';
            });
        },

        optimizeLightboxForTouch() {
            // Enable touch gestures in lightbox
            if (window.lightbox) {
                // Touch is already handled in lightbox-system.js
                // Just ensure zoom controls are visible
                const zoomControls = document.querySelector('.lightbox-zoom-controls');
                if (zoomControls) {
                    zoomControls.style.opacity = '1';
                }
            }

            // Double-tap to zoom
            let lastTap = 0;
            document.querySelectorAll('.lightbox-image').forEach(img => {
                img.addEventListener('touchend', (e) => {
                    const currentTime = new Date().getTime();
                    const tapLength = currentTime - lastTap;
                    if (tapLength < 300 && tapLength > 0) {
                        // Double tap
                        if (window.lightbox) {
                            if (window.lightbox.scale > 1) {
                                window.lightbox.resetZoom();
                            } else {
                                window.lightbox.zoomIn();
                            }
                        }
                    }
                    lastTap = currentTime;
                });
            });
        },

        bindEvents() {
            // Handle resize
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    const newIsMobile = window.innerWidth <= 768;
                    if (newIsMobile !== this.isMobile) {
                        this.isMobile = newIsMobile;
                        location.reload(); // Reload to apply correct optimizations
                    }
                }, 250);
            });

            // Handle orientation change
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    // Adjust layout after orientation change
                    document.body.style.height = window.innerHeight + 'px';
                }, 100);
            });

            // Visibility change (save battery when tab is hidden)
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.pauseAnimations();
                } else {
                    this.resumeAnimations();
                }
            });

            // Handle offline/online
            window.addEventListener('online', () => {
                console.log('📶 Back online');
            });

            window.addEventListener('offline', () => {
                console.log('📵 Offline mode');
            });
        },

        pauseAnimations() {
            document.body.classList.add('animations-paused');
            
            // Pause marquee
            document.querySelectorAll('.marquee-track').forEach(track => {
                track.style.animationPlayState = 'paused';
            });

            // Pause floating elements
            document.querySelectorAll('.shape-3d').forEach(shape => {
                shape.style.animationPlayState = 'paused';
            });
        },

        resumeAnimations() {
            document.body.classList.remove('animations-paused');
            
            // Resume marquee
            document.querySelectorAll('.marquee-track').forEach(track => {
                track.style.animationPlayState = 'running';
            });

            // Resume floating elements
            document.querySelectorAll('.shape-3d').forEach(shape => {
                shape.style.animationPlayState = 'running';
            });
        },

        // Utility: Check if element is in viewport
        isInViewport(el, threshold = 0) {
            const rect = el.getBoundingClientRect();
            return (
                rect.top <= (window.innerHeight * (1 - threshold)) &&
                rect.bottom >= (window.innerHeight * threshold)
            );
        },

        // Utility: Throttle function
        throttle(func, limit) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => MobileOptimizer.init());
    } else {
        MobileOptimizer.init();
    }

    // Expose globally
    window.MobileOptimizer = MobileOptimizer;

})();
