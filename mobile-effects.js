/**
 * FEAR OF SATAN - Mobile Optimized Effects
 * Lightweight particle system and touch interactions for mobile
 */

class MobileEffects {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.touches = [];
        this.isActive = true;
        this.animationId = null;
        
        // Mobile-optimized settings
        this.maxParticles = 50; // Very light for mobile
        this.connectionDistance = 100;
        this.mouse = { x: null, y: null };
        
        this.init();
    }
    
    init() {
        // Check if mobile
        const isMobile = window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches;
        if (!isMobile) return;
        
        this.createCanvas();
        this.bindEvents();
        this.animate();
        console.log('📱 Mobile effects initialized - 50 particles');
    }
    
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'mobile-effects-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
            opacity: 0.6;
        `;
        document.body.insertBefore(this.canvas, document.body.firstChild);
        
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    bindEvents() {
        // Touch events
        document.addEventListener('touchstart', (e) => this.handleTouch(e), { passive: true });
        document.addEventListener('touchmove', (e) => this.handleTouch(e), { passive: true });
        document.addEventListener('touchend', () => this.handleTouchEnd());
        
        // Mouse for testing on desktop
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        // Visibility
        document.addEventListener('visibilitychange', () => {
            this.isActive = !document.hidden;
        });
    }
    
    handleTouch(e) {
        this.touches = Array.from(e.touches).map(t => ({
            x: t.clientX,
            y: t.clientY
        }));
        
        // Create burst on touch
        if (e.type === 'touchstart') {
            this.touches.forEach(touch => {
                this.createBurst(touch.x, touch.y, 8);
            });
        }
    }
    
    handleTouchEnd() {
        this.touches = [];
        this.mouse.x = null;
        this.mouse.y = null;
    }
    
    createBurst(x, y, count) {
        const colors = ['#ff1744', '#00e5ff', '#76ff03', '#ffea00', '#d500f9'];
        
        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.maxParticles) break;
            
            const angle = (Math.PI * 2 * i) / count;
            const velocity = 2 + Math.random() * 2;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                life: 1.0,
                decay: 0.02 + Math.random() * 0.02,
                size: 2 + Math.random() * 3,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }
    }
    
    animate() {
        if (!this.isActive) {
            this.animationId = requestAnimationFrame(() => this.animate());
            return;
        }
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Update position
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.98; // Friction
            p.vy *= 0.98;
            p.life -= p.decay;
            
            // Draw particle
            if (p.life > 0) {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2, '0');
                this.ctx.fill();
                
                // Glow effect
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color + Math.floor(p.life * 50).toString(16).padStart(2, '0');
                this.ctx.fill();
            } else {
                this.particles.splice(i, 1);
            }
        }
        
        // Connect nearby particles
        this.drawConnections();
        
        // Draw touch points
        this.drawTouchPoints();
        
        // Auto-generate ambient particles
        if (this.particles.length < 20 && Math.random() < 0.1) {
            this.createBurst(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height,
                3
            );
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    drawConnections() {
        this.ctx.strokeStyle = 'rgba(255, 23, 68, 0.1)';
        this.ctx.lineWidth = 0.5;
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < this.connectionDistance) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }
    
    drawTouchPoints() {
        this.touches.forEach(touch => {
            // Draw ripple
            this.ctx.beginPath();
            this.ctx.arc(touch.x, touch.y, 20, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(0, 229, 255, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.mobileEffects = new MobileEffects();
    });
} else {
    window.mobileEffects = new MobileEffects();
}
