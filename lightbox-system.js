/**
 * FEAR OF SATAN — PRODUCT LIGHTBOX SYSTEM
 * Full-featured lightbox with zoom, thumbnails, touch support
 */

(function() {
    'use strict';

    class ProductLightbox {
        constructor() {
            this.isOpen = false;
            this.currentIndex = 0;
            this.images = [];
            this.touchStartX = 0;
            this.touchEndX = 0;
            this.scale = 1;
            this.isDragging = false;
            this.init();
        }

        init() {
            this.createLightbox();
            this.bindEvents();
            console.log('🔍 Product Lightbox initialized');
        }

        createLightbox() {
            const lightbox = document.createElement('div');
            lightbox.className = 'product-lightbox';
            lightbox.id = 'productLightbox';
            lightbox.innerHTML = `
                <div class="lightbox-backdrop"></div>
                <div class="lightbox-container">
                    <button class="lightbox-close" aria-label="Close">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    
                    <button class="lightbox-nav prev" aria-label="Previous">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="15,18 9,12 15,6"></polyline>
                        </svg>
                    </button>
                    
                    <button class="lightbox-nav next" aria-label="Next">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9,18 15,12 9,6"></polyline>
                        </svg>
                    </button>

                    <div class="lightbox-main">
                        <div class="lightbox-image-wrapper">
                            <img src="" alt="" class="lightbox-image" id="lightboxImage">
                            <div class="lightbox-loader">
                                <div class="spinner"></div>
                            </div>
                        </div>
                        
                        <div class="lightbox-zoom-controls">
                            <button class="zoom-btn zoom-out" aria-label="Zoom out">−</button>
                            <span class="zoom-level">100%</span>
                            <button class="zoom-btn zoom-in" aria-label="Zoom in">+</button>
                            <button class="zoom-btn zoom-reset" aria-label="Reset zoom">⟲</button>
                        </div>
                    </div>

                    <div class="lightbox-info">
                        <h3 class="lightbox-title"></h3>
                        <p class="lightbox-price"></p>
                        <p class="lightbox-counter">1 / 6</p>
                    </div>

                    <div class="lightbox-thumbnails">
                        <!-- Thumbnails will be generated dynamically -->
                    </div>
                </div>
            `;
            document.body.appendChild(lightbox);
            this.lightbox = lightbox;
        }

        bindEvents() {
            // Product card clicks
            document.querySelectorAll('.p-card').forEach((card, index) => {
                const img = card.querySelector('.p-img img');
                if (img) {
                    img.style.cursor = 'zoom-in';
                    img.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.open(index);
                    });
                }
            });

            // Close button
            this.lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
                this.close();
            });

            // Backdrop click
            this.lightbox.querySelector('.lightbox-backdrop').addEventListener('click', () => {
                this.close();
            });

            // Navigation
            this.lightbox.querySelector('.lightbox-nav.prev').addEventListener('click', () => {
                this.prev();
            });

            this.lightbox.querySelector('.lightbox-nav.next').addEventListener('click', () => {
                this.next();
            });

            // Zoom controls
            this.lightbox.querySelector('.zoom-in').addEventListener('click', () => {
                this.zoomIn();
            });

            this.lightbox.querySelector('.zoom-out').addEventListener('click', () => {
                this.zoomOut();
            });

            this.lightbox.querySelector('.zoom-reset').addEventListener('click', () => {
                this.resetZoom();
            });

            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (!this.isOpen) return;
                
                switch(e.key) {
                    case 'Escape':
                        this.close();
                        break;
                    case 'ArrowLeft':
                        this.prev();
                        break;
                    case 'ArrowRight':
                        this.next();
                        break;
                    case '+':
                    case '=':
                        this.zoomIn();
                        break;
                    case '-':
                        this.zoomOut();
                        break;
                    case '0':
                        this.resetZoom();
                        break;
                }
            });

            // Touch events for swipe
            const container = this.lightbox.querySelector('.lightbox-container');
            container.addEventListener('touchstart', (e) => {
                this.touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            container.addEventListener('touchend', (e) => {
                this.touchEndX = e.changedTouches[0].screenX;
                this.handleSwipe();
            }, { passive: true });

            // Image zoom with mouse wheel
            const image = this.lightbox.querySelector('.lightbox-image');
            image.addEventListener('wheel', (e) => {
                e.preventDefault();
                if (e.deltaY < 0) {
                    this.zoomIn();
                } else {
                    this.zoomOut();
                }
            });

            // Drag to pan when zoomed
            let startX, startY, scrollLeft, scrollTop;
            const wrapper = this.lightbox.querySelector('.lightbox-image-wrapper');
            
            image.addEventListener('mousedown', (e) => {
                if (this.scale <= 1) return;
                this.isDragging = true;
                startX = e.pageX - wrapper.offsetLeft;
                startY = e.pageY - wrapper.offsetTop;
                scrollLeft = wrapper.scrollLeft;
                scrollTop = wrapper.scrollTop;
                image.style.cursor = 'grabbing';
            });

            image.addEventListener('mousemove', (e) => {
                if (!this.isDragging) return;
                e.preventDefault();
                const x = e.pageX - wrapper.offsetLeft;
                const y = e.pageY - wrapper.offsetTop;
                const walkX = (x - startX) * 2;
                const walkY = (y - startY) * 2;
                wrapper.scrollLeft = scrollLeft - walkX;
                wrapper.scrollTop = scrollTop - walkY;
            });

            image.addEventListener('mouseup', () => {
                this.isDragging = false;
                image.style.cursor = this.scale > 1 ? 'grab' : 'default';
            });

            image.addEventListener('mouseleave', () => {
                this.isDragging = false;
                image.style.cursor = this.scale > 1 ? 'grab' : 'default';
            });
        }

        collectImages() {
            this.images = [];
            document.querySelectorAll('.p-card').forEach(card => {
                const img = card.querySelector('.p-img img');
                const name = card.querySelector('.p-name')?.textContent || '';
                const price = card.querySelector('.p-price')?.textContent || '';
                
                if (img) {
                    this.images.push({
                        src: img.src,
                        alt: img.alt || name,
                        name: name,
                        price: price,
                        thumb: img.src
                    });
                }
            });
        }

        open(index = 0) {
            this.collectImages();
            if (this.images.length === 0) return;

            this.currentIndex = index;
            this.isOpen = true;
            this.scale = 1;
            
            this.lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            this.loadImage();
            this.generateThumbnails();
            this.updateCounter();
        }

        close() {
            this.isOpen = false;
            this.lightbox.classList.remove('active');
            document.body.style.overflow = '';
            this.resetZoom();
        }

        loadImage() {
            const image = this.lightbox.querySelector('.lightbox-image');
            const loader = this.lightbox.querySelector('.lightbox-loader');
            const info = this.images[this.currentIndex];

            loader.classList.add('visible');
            image.style.opacity = '0';

            const img = new Image();
            img.onload = () => {
                image.src = info.src;
                image.alt = info.alt;
                image.style.opacity = '1';
                loader.classList.remove('visible');
                
                // Update info
                this.lightbox.querySelector('.lightbox-title').textContent = info.name;
                this.lightbox.querySelector('.lightbox-price').textContent = info.price;
                
                // Update thumbnails
                this.updateThumbnailSelection();
            };
            img.src = info.src;
        }

        prev() {
            if (this.images.length <= 1) return;
            this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
            this.resetZoom();
            this.loadImage();
            this.updateCounter();
        }

        next() {
            if (this.images.length <= 1) return;
            this.currentIndex = (this.currentIndex + 1) % this.images.length;
            this.resetZoom();
            this.loadImage();
            this.updateCounter();
        }

        handleSwipe() {
            const swipeThreshold = 50;
            const diff = this.touchStartX - this.touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    this.next();
                } else {
                    this.prev();
                }
            }
        }

        zoomIn() {
            if (this.scale < 3) {
                this.scale += 0.5;
                this.applyZoom();
            }
        }

        zoomOut() {
            if (this.scale > 1) {
                this.scale -= 0.5;
                this.applyZoom();
            }
        }

        resetZoom() {
            this.scale = 1;
            this.applyZoom();
            
            // Reset scroll
            const wrapper = this.lightbox.querySelector('.lightbox-image-wrapper');
            wrapper.scrollLeft = 0;
            wrapper.scrollTop = 0;
        }

        applyZoom() {
            const image = this.lightbox.querySelector('.lightbox-image');
            image.style.transform = `scale(${this.scale})`;
            image.style.cursor = this.scale > 1 ? 'grab' : 'default';
            
            // Update zoom level display
            const zoomLevel = this.lightbox.querySelector('.zoom-level');
            zoomLevel.textContent = `${Math.round(this.scale * 100)}%`;
        }

        generateThumbnails() {
            const container = this.lightbox.querySelector('.lightbox-thumbnails');
            container.innerHTML = this.images.map((img, index) => `
                <div class="lightbox-thumb ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <img src="${img.thumb}" alt="${img.alt}" loading="lazy">
                </div>
            `).join('');

            // Bind thumbnail clicks
            container.querySelectorAll('.lightbox-thumb').forEach(thumb => {
                thumb.addEventListener('click', () => {
                    this.currentIndex = parseInt(thumb.dataset.index);
                    this.resetZoom();
                    this.loadImage();
                    this.updateCounter();
                });
            });
        }

        updateThumbnailSelection() {
            this.lightbox.querySelectorAll('.lightbox-thumb').forEach((thumb, index) => {
                thumb.classList.toggle('active', index === this.currentIndex);
            });
        }

        updateCounter() {
            const counter = this.lightbox.querySelector('.lightbox-counter');
            counter.textContent = `${this.currentIndex + 1} / ${this.images.length}`;
        }
    }

    // Initialize lightbox when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.lightbox = new ProductLightbox();
        });
    } else {
        window.lightbox = new ProductLightbox();
    }

})();
