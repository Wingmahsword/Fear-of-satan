/**
 * FEAR OF SATAN — KINETIC TYPOGRAPHY SYSTEM
 * Bold, animated text effects with scramble, split text, and kinetic motion
 */

(function() {
    'use strict';

    class KineticTypography {
        constructor() {
            this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';
            this.init();
        }

        init() {
            this.splitText();
            this.initScrambleEffects();
            this.initTypewriterEffects();
            this.initRevealAnimations();
            console.log('✨ Kinetic Typography initialized');
        }

        // Split text into characters for animation
        splitText() {
            document.querySelectorAll('[data-split]').forEach(el => {
                const type = el.dataset.split || 'chars';
                const text = el.textContent;
                
                if (type === 'chars') {
                    el.innerHTML = text
                        .split('')
                        .map((char, i) => {
                            if (char === ' ') return ' ';
                            return `<span class="char" style="--char-index: ${i}">${char}</span>`;
                        })
                        .join('');
                } else if (type === 'words') {
                    el.innerHTML = text
                        .split(' ')
                        .map((word, i) => `
                            <span class="word" style="--word-index: ${i}">
                                ${word}
                            </span>
                        `)
                        .join(' ');
                }

                el.classList.add('split-text');
            });
        }

        // Scramble text effect for bold headlines
        initScrambleEffects() {
            document.querySelectorAll('[data-scramble]').forEach(el => {
                const finalText = el.textContent;
                const duration = parseInt(el.dataset.scramble) || 2000;
                const delay = parseInt(el.dataset.scrambleDelay) || 0;
                
                // Create scramble on scroll into view
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && !el.classList.contains('scrambled')) {
                            el.classList.add('scrambled');
                            setTimeout(() => {
                                this.scrambleText(el, finalText, duration);
                            }, delay);
                        }
                    });
                }, { threshold: 0.5 });

                observer.observe(el);
            });
        }

        scrambleText(element, finalText, duration) {
            let iteration = 0;
            const interval = duration / (finalText.length * 3);
            
            const scramble = setInterval(() => {
                element.textContent = finalText
                    .split('')
                    .map((char, index) => {
                        if (char === ' ') return ' ';
                        if (index < iteration) return finalText[index];
                        return this.chars[Math.floor(Math.random() * this.chars.length)];
                    })
                    .join('');

                iteration += 1/3;

                if (iteration >= finalText.length) {
                    clearInterval(scramble);
                    element.textContent = finalText;
                    element.classList.add('scramble-complete');
                }
            }, interval);
        }

        // Typewriter effect for descriptions
        initTypewriterEffects() {
            document.querySelectorAll('[data-typewriter]').forEach(el => {
                const text = el.textContent;
                const speed = parseInt(el.dataset.typewriter) || 50;
                const delay = parseInt(el.dataset.typewriterDelay) || 0;
                
                el.textContent = '';
                el.style.opacity = '1';

                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && !el.classList.contains('typed')) {
                            el.classList.add('typed');
                            setTimeout(() => {
                                this.typewrite(el, text, speed);
                            }, delay);
                        }
                    });
                }, { threshold: 0.5 });

                observer.observe(el);
            });
        }

        typewrite(element, text, speed) {
            let i = 0;
            element.textContent = '';
            
            const type = () => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    setTimeout(type, speed);
                } else {
                    element.classList.add('typewriter-complete');
                }
            };
            
            type();
        }

        // Reveal animations for text
        initRevealAnimations() {
            const reveals = [
                { selector: '[data-reveal="slide-up"]', animation: 'slideUp' },
                { selector: '[data-reveal="slide-down"]', animation: 'slideDown' },
                { selector: '[data-reveal="fade-in"]', animation: 'fadeIn' },
                { selector: '[data-reveal="scale"]', animation: 'scaleIn' },
                { selector: '[data-reveal="rotate"]', animation: 'rotateIn' },
                { selector: '[data-reveal="glitch"]', animation: 'glitch' }
            ];

            reveals.forEach(({ selector, animation }) => {
                document.querySelectorAll(selector).forEach(el => {
                    el.classList.add('kinetic-hidden');
                    
                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                el.classList.remove('kinetic-hidden');
                                el.classList.add(`kinetic-${animation}`);
                                el.classList.add('kinetic-visible');
                                observer.unobserve(el);
                            }
                        });
                    }, { threshold: 0.3 });

                    observer.observe(el);
                });
            });
        }

        // Wave animation for text
        initWaveEffect() {
            document.querySelectorAll('[data-wave]').forEach(el => {
                const text = el.textContent;
                el.innerHTML = text
                    .split('')
                    .map((char, i) => `
                        <span class="wave-char" style="--wave-index: ${i}">
                            ${char === ' ' ? '&nbsp;' : char}
                        </span>
                    `)
                    .join('');
                
                el.classList.add('wave-text');
            });
        }

        // Hover scramble effect
        initHoverScramble() {
            document.querySelectorAll('[data-hover-scramble]').forEach(el => {
                const originalText = el.textContent;
                let scrambleInterval;

                el.addEventListener('mouseenter', () => {
                    let iteration = 0;
                    const duration = 500;
                    const interval = duration / (originalText.length * 2);

                    scrambleInterval = setInterval(() => {
                        el.textContent = originalText
                            .split('')
                            .map((char, index) => {
                                if (char === ' ') return ' ';
                                if (index < iteration) return originalText[index];
                                return this.chars[Math.floor(Math.random() * this.chars.length)];
                            })
                            .join('');

                        iteration += 1/2;

                        if (iteration >= originalText.length) {
                            clearInterval(scrambleInterval);
                            el.textContent = originalText;
                        }
                    }, interval);
                });

                el.addEventListener('mouseleave', () => {
                    clearInterval(scrambleInterval);
                    el.textContent = originalText;
                });
            });
        }

        // Text highlight animation
        initHighlightEffect() {
            document.querySelectorAll('[data-highlight]').forEach(el => {
                const text = el.textContent;
                el.innerHTML = `<span class="highlight-text">${text}</span>`;
                
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            el.classList.add('highlight-active');
                        }
                    });
                }, { threshold: 0.5 });

                observer.observe(el);
            });
        }

        // Counter animation for numbers
        initCounterAnimation() {
            document.querySelectorAll('[data-counter]').forEach(el => {
                const target = parseInt(el.textContent);
                const suffix = el.textContent.replace(/[0-9]/g, '');
                const duration = parseInt(el.dataset.counter) || 2000;
                
                el.textContent = '0' + suffix;
                
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && !el.classList.contains('counted')) {
                            el.classList.add('counted');
                            this.animateCounter(el, target, suffix, duration);
                            observer.unobserve(el);
                        }
                    });
                }, { threshold: 0.5 });

                observer.observe(el);
            });
        }

        animateCounter(element, target, suffix, duration) {
            const startTime = performance.now();
            const startValue = 0;

            const update = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function (ease-out)
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(startValue + (target - startValue) * easeOut);
                
                element.textContent = current + suffix;

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    element.textContent = target + suffix;
                }
            };

            requestAnimationFrame(update);
        }

        // Marquee text effect
        initMarquee() {
            document.querySelectorAll('[data-marquee]').forEach(el => {
                const text = el.textContent;
                const copies = parseInt(el.dataset.marquee) || 3;
                
                let marqueeContent = '';
                for (let i = 0; i < copies; i++) {
                    marqueeContent += `<span class="marquee-item">${text}</span>`;
                }
                
                el.innerHTML = `<div class="marquee-content">${marqueeContent}</div>`;
                el.classList.add('marquee-container');
            });
        }

        // Stagger text animation
        initStaggerAnimation() {
            document.querySelectorAll('[data-stagger]').forEach(container => {
                const children = container.children;
                const delay = parseInt(container.dataset.stagger) || 100;
                
                Array.from(children).forEach((child, index) => {
                    child.style.animationDelay = `${index * delay}ms`;
                    child.classList.add('stagger-item');
                });
                
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            container.classList.add('stagger-active');
                            observer.unobserve(container);
                        }
                    });
                }, { threshold: 0.2 });

                observer.observe(container);
            });
        }

        // Glitch effect
        initGlitchEffect() {
            document.querySelectorAll('[data-glitch]').forEach(el => {
                const text = el.textContent;
                el.innerHTML = `
                    <span class="glitch" data-text="${text}">${text}</span>
                `;
                el.classList.add('glitch-container');
            });
        }

        // Text mask reveal
        initMaskReveal() {
            document.querySelectorAll('[data-mask-reveal]').forEach(el => {
                const text = el.textContent;
                el.innerHTML = `
                    <span class="mask-text">${text}</span>
                    <span class="mask-reveal">${text}</span>
                `;
                el.classList.add('mask-container');
                
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            el.classList.add('mask-active');
                            observer.unobserve(el);
                        }
                    });
                }, { threshold: 0.5 });

                observer.observe(el);
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.kineticTypography = new KineticTypography();
        });
    } else {
        window.kineticTypography = new KineticTypography();
    }

})();
