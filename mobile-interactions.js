/**
 * FEAR OF SATAN - Mobile Interactions
 * Touch gestures and interactions based on device tier
 */

class MobileInteractions {
    constructor() {
        this.tier = 'low';
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchStartTime = 0;
        this.longPressTimer = null;
        this.isSwiping = false;
        
        this.init();
    }
    
    init() {
        // Get device tier
        if (window.DeviceCapability) {
            this.tier = window.DeviceCapability.getTier();
        }
        
        // Only on mobile
        const isMobile = window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches;
        if (!isMobile) return;
        
        this.bindGlobalTouch();
        this.bindProductCards();
        this.bindCartButton();
        this.bindNavigation();
        
        console.log(`👆 Mobile Interactions: ${this.tier.toUpperCase()} tier loaded`);
    }
    
    bindGlobalTouch() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            // Prevent default on horizontal swipes for product cards
            const touchX = e.touches[0].clientX;
            const diffX = touchX - touchStartX;
            
            if (Math.abs(diffX) > 10 && e.target.closest('.p-card')) {
                // Allow horizontal swipe on cards
            }
        }, { passive: false });
        
        document.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const touchDuration = Date.now() - touchStartTime;
            
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;
            
            // Swipe detection
            if (Math.abs(diffX) > 50 && touchDuration < 300) {
                if (diffX > 0) {
                    this.onSwipeRight(e.target);
                } else {
                    this.onSwipeLeft(e.target);
                }
            }
            
            // Tap detection
            if (touchDuration < 200 && Math.abs(diffX) < 10 && Math.abs(diffY) < 10) {
                this.onTap(e.target);
            }
            
            // Long press detection
            if (touchDuration > 500 && Math.abs(diffX) < 10 && Math.abs(diffY) < 10) {
                this.onLongPress(e.target);
            }
        }, { passive: true });
    }
    
    bindProductCards() {
        const cards = document.querySelectorAll('.p-card');
        
        cards.forEach(card => {
            // 3D Tilt effect for high-end devices
            if (this.tier === 'high') {
                card.addEventListener('touchmove', (e) => {
                    const touch = e.touches[0];
                    const rect = card.getBoundingClientRect();
                    const x = touch.clientX - rect.left;
                    const y = touch.clientY - rect.top;
                    
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    
                    const rotateX = (y - centerY) / 10;
                    const rotateY = (centerX - x) / 10;
                    
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
                }, { passive: true });
                
                card.addEventListener('touchend', () => {
                    card.style.transform = '';
                });
            }
            
            // Haptic feedback on add to cart (if supported)
            const addButton = card.querySelector('.add-btn, button');
            if (addButton && this.tier !== 'low') {
                addButton.addEventListener('touchstart', () => {
                    if (navigator.vibrate) {
                        navigator.vibrate(50);
                    }
                }, { passive: true });
            }
        });
    }
    
    bindCartButton() {
        const bagBtn = document.getElementById('bagBtn') || document.querySelector('.bag-btn');
        if (bagBtn && this.tier !== 'low') {
            bagBtn.addEventListener('click', () => {
                // Haptic feedback
                if (navigator.vibrate) {
                    navigator.vibrate([50, 100, 50]);
                }
                
                // Animation
                bagBtn.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    bagBtn.style.transform = '';
                }, 150);
            });
        }
    }
    
    bindNavigation() {
        const navLinks = document.querySelectorAll('.nav-center a, .nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('touchstart', () => {
                link.style.opacity = '0.7';
            }, { passive: true });
            
            link.addEventListener('touchend', () => {
                link.style.opacity = '';
            });
        });
    }
    
    onSwipeLeft(target) {
        // Next product logic
        if (target.closest('.p-card')) {
            console.log('Swipe left on product');
            this.showSwipeIndicator('left');
        }
    }
    
    onSwipeRight(target) {
        // Previous product logic
        if (target.closest('.p-card')) {
            console.log('Swipe right on product');
            this.showSwipeIndicator('right');
        }
    }
    
    onTap(target) {
        // Create ripple effect
        if (this.tier !== 'low') {
            this.createRipple(target);
        }
    }
    
    onLongPress(target) {
        // Quick add to cart or show options
        if (target.closest('.p-card')) {
            console.log('Long press on product');
            
            // Haptic
            if (navigator.vibrate) {
                navigator.vibrate(100);
            }
            
            // Visual feedback
            target.closest('.p-card').style.transform = 'scale(0.98)';
            setTimeout(() => {
                target.closest('.p-card').style.transform = '';
            }, 200);
        }
    }
    
    createRipple(target) {
        const element = target.closest('button, .btn, .p-card') || target;
        const rect = element.getBoundingClientRect();
        
        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.4);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        `;
        
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (rect.width / 2 - size / 2) + 'px';
        ripple.style.top = (rect.height / 2 - size / 2) + 'px';
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }
    
    showSwipeIndicator(direction) {
        const indicator = document.createElement('div');
        indicator.className = `swipe-indicator swipe-${direction}`;
        indicator.innerHTML = direction === 'left' ? '→' : '←';
        indicator.style.cssText = `
            position: fixed;
            top: 50%;
            ${direction}: 20px;
            transform: translateY(-50%);
            font-size: 40px;
            color: rgba(255, 23, 68, 0.5);
            pointer-events: none;
            z-index: 9999;
            animation: fadeOut 0.5s forwards;
        `;
        
        document.body.appendChild(indicator);
        setTimeout(() => indicator.remove(), 500);
    }
}

// Add ripple animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes fadeOut {
        to {
            opacity: 0;
        }
    }
    
    .p-card {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .p-card:active {
        transform: scale(0.98);
    }
    
    .bag-btn, button, .btn {
        transition: transform 0.15s ease;
    }
    
    .bag-btn:active, button:active, .btn:active {
        transform: scale(0.95);
    }
`;
document.head.appendChild(style);

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.mobileInteractions = new MobileInteractions();
    });
} else {
    window.mobileInteractions = new MobileInteractions();
}
