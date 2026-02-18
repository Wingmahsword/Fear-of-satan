/**
 * FEAR OF SATAN — COMPLETE CART SYSTEM
 * Full-featured shopping cart with slide-out drawer, localStorage persistence,
 * quantity controls, and real-time updates.
 */

(function() {
    'use strict';

    class CartSystem {
        constructor() {
            this.items = JSON.parse(localStorage.getItem('fos_cart')) || [];
            this.isOpen = false;
            this.listeners = [];
            this.overlay = null;
            this.drawer = null;
            this.init();
        }

        init() {
            this.createCartDrawer();
            this.createOverlay();
            this.bindEvents();
            this.updateUI();
            console.log('🛒 Cart System initialized');
        }

        createCartDrawer() {
            const drawer = document.createElement('div');
            drawer.className = 'cart-drawer';
            drawer.id = 'cartDrawer';
            drawer.innerHTML = `
                <div class="cart-header">
                    <h3>YOUR BAG (<span class="cart-count">0</span>)</h3>
                    <button class="cart-close" aria-label="Close cart">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="cart-items" id="cartItems">
                    <div class="cart-empty">
                        <div class="cart-empty-icon">🧦</div>
                        <p>Your bag is empty</p>
                        <span>Add some socks to get started</span>
                    </div>
                </div>
                <div class="cart-footer">
                    <div class="cart-subtotal">
                        <span>Subtotal</span>
                        <span class="cart-total">₹0</span>
                    </div>
                    <p class="cart-note">Shipping and taxes calculated at checkout</p>
                    <button class="cart-checkout-btn" id="checkoutBtn">
                        CHECKOUT
                    </button>
                    <button class="cart-continue">Continue Shopping</button>
                </div>
            `;
            document.body.appendChild(drawer);
            this.drawer = drawer;
        }

        createOverlay() {
            const overlay = document.createElement('div');
            overlay.className = 'cart-overlay';
            overlay.id = 'cartOverlay';
            document.body.appendChild(overlay);
            this.overlay = overlay;
        }

        bindEvents() {
            // Open cart button
            const bagBtn = document.getElementById('bagBtn');
            if (bagBtn) {
                bagBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.open();
                });
            }

            // Close buttons
            const closeBtn = this.drawer.querySelector('.cart-close');
            const continueBtn = this.drawer.querySelector('.cart-continue');
            
            closeBtn.addEventListener('click', () => this.close());
            continueBtn.addEventListener('click', () => this.close());
            this.overlay.addEventListener('click', () => this.close());

            // Keyboard close
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            });

            // Add to cart buttons
            document.querySelectorAll('.p-add').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const card = btn.closest('.p-card');
                    if (card) {
                        this.addFromCard(card, btn);
                    }
                });
            });

            // Checkout button
            const checkoutBtn = document.getElementById('checkoutBtn');
            if (checkoutBtn) {
                checkoutBtn.addEventListener('click', () => {
                    if (this.items.length > 0) {
                        this.showCheckoutNotification();
                    }
                });
            }
        }

        addFromCard(card, btn) {
            const name = card.querySelector('.p-name')?.textContent || 'Product';
            const priceText = card.querySelector('.p-price')?.textContent || '₹0';
            const price = parseInt(priceText.replace(/[^0-9]/g, ''));
            const image = card.querySelector('.p-img img')?.src || '';
            const category = card.dataset.category || '';
            
            const product = {
                id: Date.now() + Math.random(),
                name: name,
                price: price,
                image: image,
                category: category,
                quantity: 1,
                size: 'M', // Default size
                addedAt: new Date().toISOString()
            };

            this.add(product);
            
            // Visual feedback
            this.animateAddToCart(btn);
            
            // Optional: Open cart
            setTimeout(() => this.open(), 300);
        }

        add(product) {
            // Check if item already exists (same product, same size)
            const existing = this.items.find(item => 
                item.name === product.name && item.size === product.size
            );

            if (existing) {
                existing.quantity += product.quantity;
            } else {
                this.items.push(product);
            }

            this.save();
            this.emit('add', product);
            
            // Show toast notification
            this.showToast(`${product.name} added to bag`);
        }

        remove(id) {
            const item = this.items.find(i => i.id === id);
            this.items = this.items.filter(item => item.id !== id);
            this.save();
            this.emit('remove', id);
            this.renderCartItems();
            
            if (item) {
                this.showToast(`${item.name} removed from bag`);
            }
        }

        updateQuantity(id, quantity) {
            const item = this.items.find(item => item.id === id);
            if (item) {
                if (quantity <= 0) {
                    this.remove(id);
                } else {
                    item.quantity = quantity;
                    this.save();
                    this.emit('update', item);
                    this.renderCartItems();
                }
            }
        }

        updateSize(id, size) {
            const item = this.items.find(item => item.id === id);
            if (item) {
                item.size = size;
                this.save();
                this.emit('update', item);
            }
        }

        clear() {
            this.items = [];
            this.save();
            this.emit('clear');
            this.renderCartItems();
        }

        getTotal() {
            return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        }

        getCount() {
            return this.items.reduce((sum, item) => sum + item.quantity, 0);
        }

        save() {
            localStorage.setItem('fos_cart', JSON.stringify(this.items));
            this.updateUI();
        }

        updateUI() {
            const count = this.getCount();
            const total = this.getTotal();

            // Update header badge
            const bagCount = document.getElementById('bagCount');
            if (bagCount) {
                bagCount.textContent = count;
                bagCount.classList.add('updated');
                setTimeout(() => bagCount.classList.remove('updated'), 300);
            }

            // Update drawer count
            const drawerCount = this.drawer.querySelector('.cart-count');
            if (drawerCount) {
                drawerCount.textContent = count;
            }

            // Update total
            const totalEl = this.drawer.querySelector('.cart-total');
            if (totalEl) {
                totalEl.textContent = `₹${total.toLocaleString()}`;
            }

            // Render items
            this.renderCartItems();
        }

        renderCartItems() {
            const container = document.getElementById('cartItems');
            
            if (this.items.length === 0) {
                container.innerHTML = `
                    <div class="cart-empty">
                        <div class="cart-empty-icon">🧦</div>
                        <p>Your bag is empty</p>
                        <span>Add some socks to get started</span>
                    </div>
                `;
                return;
            }

            container.innerHTML = this.items.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}" loading="lazy">
                    </div>
                    <div class="cart-item-details">
                        <h4 class="cart-item-name">${item.name}</h4>
                        <p class="cart-item-price">₹${item.price}</p>
                        <div class="cart-item-options">
                            <select class="cart-item-size" data-id="${item.id}">
                                <option value="S" ${item.size === 'S' ? 'selected' : ''}>S</option>
                                <option value="M" ${item.size === 'M' ? 'selected' : ''}>M</option>
                                <option value="L" ${item.size === 'L' ? 'selected' : ''}>L</option>
                                <option value="XL" ${item.size === 'XL' ? 'selected' : ''}>XL</option>
                            </select>
                        </div>
                        <div class="cart-item-quantity">
                            <button class="qty-btn minus" data-id="${item.id}">−</button>
                            <span class="qty-value">${item.quantity}</span>
                            <button class="qty-btn plus" data-id="${item.id}">+</button>
                        </div>
                    </div>
                    <button class="cart-item-remove" data-id="${item.id}" aria-label="Remove item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            `).join('');

            // Bind item events
            this.bindItemEvents();
        }

        bindItemEvents() {
            // Remove buttons
            this.drawer.querySelectorAll('.cart-item-remove').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = parseFloat(btn.dataset.id);
                    this.remove(id);
                });
            });

            // Quantity buttons
            this.drawer.querySelectorAll('.qty-btn.minus').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = parseFloat(btn.dataset.id);
                    const item = this.items.find(i => i.id === id);
                    if (item) {
                        this.updateQuantity(id, item.quantity - 1);
                    }
                });
            });

            this.drawer.querySelectorAll('.qty-btn.plus').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = parseFloat(btn.dataset.id);
                    const item = this.items.find(i => i.id === id);
                    if (item) {
                        this.updateQuantity(id, item.quantity + 1);
                    }
                });
            });

            // Size selectors
            this.drawer.querySelectorAll('.cart-item-size').forEach(select => {
                select.addEventListener('change', () => {
                    const id = parseFloat(select.dataset.id);
                    this.updateSize(id, select.value);
                });
            });
        }

        open() {
            this.isOpen = true;
            this.drawer.classList.add('open');
            this.overlay.classList.add('visible');
            document.body.style.overflow = 'hidden';
            this.emit('open');
        }

        close() {
            this.isOpen = false;
            this.drawer.classList.remove('open');
            this.overlay.classList.remove('visible');
            document.body.style.overflow = '';
            this.emit('close');
        }

        toggle() {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        }

        animateAddToCart(btn) {
            // Particle burst effect
            const rect = btn.getBoundingClientRect();
            const colors = ['#ff1744', '#ff2d7b', '#00e5ff', '#c6ff00', '#b040ff'];
            
            for (let i = 0; i < 8; i++) {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: fixed;
                    width: 8px;
                    height: 8px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 9999;
                    left: ${rect.left + rect.width/2}px;
                    top: ${rect.top + rect.height/2}px;
                `;
                document.body.appendChild(particle);

                const angle = (Math.PI * 2 * i) / 8;
                const velocity = 50 + Math.random() * 50;
                
                particle.animate([
                    { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                    { transform: `translate(${Math.cos(angle) * velocity}px, ${Math.sin(angle) * velocity}px) scale(0)`, opacity: 0 }
                ], {
                    duration: 600,
                    easing: 'cubic-bezier(0, .9, .57, 1)'
                }).onfinish = () => particle.remove();
            }

            // Button animation
            btn.style.transform = 'scale(1.2)';
            setTimeout(() => btn.style.transform = '', 200);
        }

        showToast(message) {
            const toast = document.createElement('div');
            toast.className = 'cart-toast';
            toast.textContent = message;
            document.body.appendChild(toast);

            toast.animate([
                { transform: 'translateY(100%)', opacity: 0 },
                { transform: 'translateY(0)', opacity: 1 }
            ], {
                duration: 300,
                easing: 'ease-out'
            });

            setTimeout(() => {
                toast.animate([
                    { transform: 'translateY(0)', opacity: 1 },
                    { transform: 'translateY(-100%)', opacity: 0 }
                ], {
                    duration: 300,
                    easing: 'ease-in'
                }).onfinish = () => toast.remove();
            }, 2500);
        }

        showCheckoutNotification() {
            const modal = document.createElement('div');
            modal.className = 'checkout-modal';
            modal.innerHTML = `
                <div class="checkout-modal-content">
                    <div class="checkout-icon">🎉</div>
                    <h3>Ready to Checkout?</h3>
                    <p>This is a demo store. In production, this would redirect to your payment processor.</p>
                    <p class="checkout-total">Total: ₹${this.getTotal().toLocaleString()}</p>
                    <button class="checkout-close">Got it!</button>
                </div>
            `;
            document.body.appendChild(modal);

            modal.querySelector('.checkout-close').addEventListener('click', () => {
                modal.remove();
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.remove();
            });
        }

        emit(event, data) {
            this.listeners.forEach(cb => cb(event, data));
        }

        on(callback) {
            this.listeners.push(callback);
        }

        off(callback) {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        }
    }

    // Initialize cart when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.cart = new CartSystem();
        });
    } else {
        window.cart = new CartSystem();
    }

})();
