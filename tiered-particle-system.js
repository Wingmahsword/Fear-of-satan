/**
 * FEAR OF SATAN - Tiered Mobile Particle System
 * Adaptive particle system based on device capability
 */

class TieredMobileParticles {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.tier = 'low';
        this.maxParticles = 50;
        this.animationId = null;
        this.isActive = true;
        this.frameCount = 0;
        this.targetFPS = 30;
        
        // Touch tracking
        this.touches = [];
        this.mouse = { x: null, y: null };
        
        this.init();
    }
    
    init() {
        // Check device tier
        if (window.DeviceCapability) {
            this.tier = window.DeviceCapability.getTier();
            const settings = window.DeviceCapability.getGraphicsSettings();
            this.maxParticles = settings.particles;
            this.targetFPS = settings.frameRate;
        }
        
        // Only run on mobile
        const isMobile = window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches;
        if (!isMobile) {
            console.log('Desktop detected - skipping mobile particles');
            return;
        }
        
        this.createCanvas();
        this.bindEvents();
        this.startAnimation();
        
        console.log(`🎨 Tiered Particles: ${this.tier.toUpperCase()} tier with ${this.maxParticles} particles @ ${this.targetFPS}fps`);
    }
    
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'tiered-particles-canvas';
        
        // Different opacity based on tier
        const opacity = this.tier === 'high' ? 0.8 : (this.tier === 'mid' ? 0.6 : 0.4);
        
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
            opacity: ${opacity};
        `;
        
        document.body.insertBefore(this.canvas, document.body.firstChild);
        
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        const dpr = window.devicePixelRatio || 1;
        // Limit DPR for performance on mid/low tier
        const maxDPR = this.tier === 'high' ? 2 : 1;
        const actualDPR = Math.min(dpr, maxDPR);
        
        this.canvas.width = window.innerWidth * actualDPR;
        this.canvas.height = window.innerHeight * actualDPR;
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
        this.ctx.scale(actualDPR, actualDPR);
    }
    
    bindEvents() {
        // Touch events
        document.addEventListener('touchstart', (e) => this.handleTouch(e), { passive: true });
        document.addEventListener('touchmove', (e) => this.handleTouch(e), { passive: true });
        document.addEventListener('touchend', () => this.handleTouchEnd());
        
        // Mouse for testing
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        // Visibility
        document.addEventListener('visibilitychange', () => {
            this.isActive = !document.hidden;
            if (this.isActive) {
                this.startAnimation();
            }
        });
    }
    
    handleTouch(e) {
        this.touches = Array.from(e.touches).map(t => ({
            x: t.clientX,
            y: t.clientY
        }));
        
        if (e.type === 'touchstart') {
            const burstSize = this.tier === 'high' ? 15 : (this.tier === 'mid' ? 10 : 5);
            this.touches.forEach(touch => {
                this.createBurst(touch.x, touch.y, burstSize);
            });
        }
    }
    
    handleTouchEnd() {
        this.touches = [];
    }
    
    createBurst(x, y, count) {
        const colors = this.tier === 'high' 
            ? ['#ff1744', '#00e5ff', '#76ff03', '#ffea00', '#d500f9', '#ff6d00']
            : ['#ff1744', '#00e5ff', '#76ff03'];
        
        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.maxParticles) {
                // Remove oldest particle
                this.particles.shift();
            }
            
            const angle = (Math.PI * 2 * i) / count;
            const velocity = 2 + Math.random() * 3;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                life: 1.0,
                decay: 0.01 + Math.random() * 0.02,
                size: this.tier === 'high' ? (2 + Math.random() * 4) : (2 + Math.random() * 2),
                color: colors[Math.floor(Math.random() * colors.length)],
                glow: this.tier !== 'low'
            });
        }
    }
    
    startAnimation() {
        if (this.animationId) return;
        this.animate();
    }
    
    animate() {
        if (!this.isActive) {
            this.animationId = null;
            return;
        }
        
        this.frameCount++;
        
        // Skip frames for performance on low tier
        const skipFrames = this.tier === 'low' ? 2 : (this.tier === 'mid' ? 1 : 0);
        if (this.frameCount % (skipFrames + 1) !== 0) {
            this.animationId = requestAnimationFrame(() => this.animate());
            return;
        }
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.98;
            p.vy *= 0.98;
            p.life -= p.decay;
            
            if (p.life > 0) {
                this.drawParticle(p);
            } else {
                this.particles.splice(i, 1);
            }
        }
        
        // Draw connections for mid/high tier
        if (this.tier !== 'low' && this.particles.length > 1) {
            this.drawConnections();
        }
        
        // Draw touch points
        this.drawTouchPoints();
        
        // Ambient particles
        if (this.particles.length < this.maxParticles * 0.3 && Math.random() < 0.05) {
            this.createBurst(
                Math.random() * window.innerWidth,
                Math.random() * window.innerHeight,
                3
            );
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    drawParticle(p) {
        const alpha = Math.floor(p.life * 255).toString(16).padStart(2, '0');
        
        if (p.glow) {
            // Glow effect for mid/high tier
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color + '20'; // Low alpha
            this.ctx.fill();
        }
        
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color + alpha;
        this.ctx.fill();
    }
    
    drawConnections() {
        const maxDist = 100;
        const maxConnections = this.tier === 'high' ? 3 : 2;
        
        for (let i = 0; i < this.particles.length; i++) {
            let connections = 0;
            
            for (let j = i + 1; j < this.particles.length && connections < maxConnections; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < maxDist) {
                    const alpha = Math.floor((1 - dist / maxDist) * 50).toString(16).padStart(2, '0');
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = '#ff1744' + alpha;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                    connections++;
                }
            }
        }
    }
    
    drawTouchPoints() {
        this.touches.forEach((touch, index) => {
            this.ctx.beginPath();
            this.ctx.arc(touch.x, touch.y, 20 + index * 5, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(0, 229, 255, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.tieredParticles = new TieredMobileParticles();
    });
} else {
    window.tieredParticles = new TieredMobileParticles();
}
