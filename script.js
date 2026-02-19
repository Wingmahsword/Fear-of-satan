document.addEventListener('DOMContentLoaded', () => {

    /* ==============================================
       1. GLOBAL VARS & HELPERS
       ============================================== */
    const nav = document.getElementById('nav');
    const hero = document.querySelector('.hero-image');
    let lastScrollY = 0;

    /* ==============================================
       2. SCROLL REVEAL & NAV BEHAVIOR
       ============================================== */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.mag-card, .menu-btn, .hero-content > *').forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });

    // Nav hide/show on scroll
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            nav.classList.add('hide');
        } else {
            nav.classList.remove('hide');
        }
        lastScrollY = currentScrollY;
    });


    /* ==============================================
       3. FILTER SYSTEM
       ============================================== */
    const filterBtns = document.querySelectorAll('.f-btn');
    const cards = document.querySelectorAll('.p-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;

            cards.forEach(card => {
                const category = card.dataset.category;
                if (filter === 'all' || category.includes(filter)) {
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });


    /* ==============================================
       4. CART & BAG LOGIC
       ============================================== */
    let cartCount = 0;
    const cartDisplay = document.getElementById('bagCount');
    const addBtns = document.querySelectorAll('.add-btn, .p-add');

    addBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            cartCount++;
            cartDisplay.textContent = cartCount;

            const originalText = btn.innerHTML;
            btn.innerHTML = 'ADDED';
            btn.style.background = '#4CAF50';
            btn.style.color = 'white';

            if (btn.classList.contains('p-add')) {
                btn.style.transform = 'translateY(0) scale(1.1)';
                btn.style.opacity = '1';
            }

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
                btn.style.color = '';
                if (btn.classList.contains('p-add')) {
                    btn.style.transform = '';
                    btn.style.opacity = '';
                }
            }, 1500);
        });
    });


    /* ==============================================
       5. NEWSLETTER
       ============================================== */
    const nlForm = document.querySelector('.nl-form');
    if (nlForm) {
        nlForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = nlForm.querySelector('input');
            const btn = nlForm.querySelector('button');
            const originalBtn = btn.innerHTML;
            if (input.value) {
                btn.innerHTML = 'WELCOME TO THE CULT';
                input.value = '';
                setTimeout(() => {
                    btn.innerHTML = originalBtn;
                }, 3000);
            }
        });
    }

    /* ==============================================
       6. LOADER
       ============================================== */
    window.addEventListener('load', () => {
        const loader = document.getElementById('loader');
        if (loader) {
            setTimeout(() => {
                loader.classList.add('done');
            }, 800);
        }
    });

    /* ==============================================
       7. HERO MOUSE PARALLAX
       ============================================== */
    const heroImg = document.getElementById('heroImg');
    if (heroImg) {
        document.addEventListener('mousemove', (e) => {
            const x = (window.innerWidth - e.pageX * 2) / 90;
            const y = (window.innerHeight - e.pageY * 2) / 90;
            heroImg.style.transform = `translateX(${x}px) translateY(${y}px)`;
        });
    }

    /* ==============================================
       8. MOBILE MENU
       ============================================== */
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobileNav');
    const mLinks = document.querySelectorAll('.m-link');

    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            mobileNav.classList.toggle('open');
            document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
        });

        mLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('open');
                mobileNav.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    /* ==============================================
       9. DIA SCAN EFFECT (CANVAS) - IMPROVED
       ============================================== */
    class ScanText {
        constructor(canvasId) {
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) return;
            this.ctx = this.canvas.getContext('2d');
            this.offCanvas = document.createElement('canvas');
            this.offCtx = this.offCanvas.getContext('2d');

            this.resize();
            window.addEventListener('resize', () => this.resize());
            this.animate();
        }

        resize() {
            const parent = this.canvas.parentElement;
            if (!parent) return;
            this.width = parent.offsetWidth;
            this.height = parent.offsetHeight;

            this.canvas.width = this.width * 2;
            this.canvas.height = this.height * 2;
            this.ctx.scale(2, 2);

            this.offCanvas.width = this.width * 2;
            this.offCanvas.height = this.height * 2;
            this.offCtx.scale(2, 2);

            this.drawText();
        }

        drawText() {
            const w = this.width;
            const h = this.height;
            this.offCtx.clearRect(0, 0, w, h);
            this.offCtx.textAlign = 'center';
            this.offCtx.textBaseline = 'middle';

            const vw = window.innerWidth / 100;
            const bigSize = Math.max(64, Math.min(136, 12 * vw));
            const smallSize = Math.max(40, Math.min(80, 8 * vw));

            this.offCtx.font = `700 ${bigSize}px "Anton", sans-serif`;
            this.offCtx.fillStyle = '#f2ede8';
            this.offCtx.fillText('FEAR', w / 2, h * 0.25);

            this.offCtx.font = `italic 400 ${smallSize}px "Instrument Serif", serif`;
            const grad = this.offCtx.createLinearGradient(w / 2 - 50, 0, w / 2 + 50, 0);
            grad.addColorStop(0, '#ff1744');
            grad.addColorStop(1, '#ff2d7b');
            this.offCtx.fillStyle = grad;
            this.offCtx.fillText('of', w / 2, h * 0.5);

            this.offCtx.font = `700 ${bigSize}px "Anton", sans-serif`;
            this.offCtx.fillStyle = '#f2ede8';
            this.offCtx.fillText('SATAN', w / 2, h * 0.75);
        }

        animate() {
            const time = performance.now() * 0.002;
            this.ctx.clearRect(0, 0, this.width, this.height);

            const slices = 200;
            const sliceH = this.height / slices;
            const scaledSliceH = sliceH * 2;

            for (let i = 0; i < slices; i++) {
                const y = i * sliceH;

                // STABLE BASE - No constant wave
                let movement = 0;

                // Random tear (GLITCH)
                let tear = 0;
                if (Math.random() > 0.995) { // Occasional
                    tear = (Math.random() - 0.5) * 50;
                }

                // Scanner bar effect (GLITCH)
                let sourceH = scaledSliceH;
                let sourceY = y * 2;

                const scanBarY = (time * 150) % (this.height * 1.5) - (this.height * 0.25);
                const distToBar = Math.abs(y - scanBarY);

                if (distToBar < 50) {
                    // Near scan bar: Distortion & Stretch
                    movement = (Math.sin(y * 0.2) * 10); // Local wave only at scan bar
                    sourceH = scaledSliceH * 0.3; // Stretch vertically
                }

                const offsetX = movement + tear;

                this.ctx.drawImage(
                    this.offCanvas,
                    0, sourceY, this.width * 2, sourceH,
                    offsetX, y, this.width, sliceH + 0.5
                );
            }
            requestAnimationFrame(() => this.animate());
        }
    }

    new ScanText('scanCanvas');

});
