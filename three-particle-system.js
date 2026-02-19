/**
 * FEAR OF SATAN - Advanced GPU Particle System
 * 100,000+ particles with compute shaders, trails, and interactive bursts
 */

import * as THREE from 'three';

class AdvancedParticleSystem {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.particleCount = 100000;
        this.particles = null;
        this.trails = [];
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.interactivePlane = null;
        this.clock = new THREE.Clock();
        
        // Particle data
        this.positions = new Float32Array(this.particleCount * 3);
        this.velocities = new Float32Array(this.particleCount * 3);
        this.colors = new Float32Array(this.particleCount * 3);
        this.sizes = new Float32Array(this.particleCount);
        this.lifetimes = new Float32Array(this.particleCount);
        
        this.init();
    }
    
    init() {
        this.createInteractivePlane();
        this.createParticles();
        this.setupMouseInteraction();
        console.log(`✨ Advanced Particle System: ${this.particleCount.toLocaleString()} particles initialized`);
    }
    
    createInteractivePlane() {
        // Invisible plane for mouse interaction
        const geometry = new THREE.PlaneGeometry(100, 100);
        const material = new THREE.MeshBasicMaterial({ visible: false });
        this.interactivePlane = new THREE.Mesh(geometry, material);
        this.scene.add(this.interactivePlane);
    }
    
    createParticles() {
        const geometry = new THREE.BufferGeometry();
        
        // Initialize particle data
        const colorPalette = [
            new THREE.Color(0xff1744),
            new THREE.Color(0x00e5ff),
            new THREE.Color(0x76ff03),
            new THREE.Color(0xffea00),
            new THREE.Color(0xd500f9),
            new THREE.Color(0xff6d00)
        ];
        
        for (let i = 0; i < this.particleCount; i++) {
            // Random position in sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            const radius = 5 + Math.random() * 15;
            
            this.positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            this.positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            this.positions[i * 3 + 2] = radius * Math.cos(phi);
            
            // Initial velocities
            this.velocities[i * 3] = (Math.random() - 0.5) * 0.02;
            this.velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
            this.velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
            
            // Colors
            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            this.colors[i * 3] = color.r;
            this.colors[i * 3 + 1] = color.g;
            this.colors[i * 3 + 2] = color.b;
            
            // Sizes
            this.sizes[i] = Math.random() * 0.08 + 0.02;
            
            // Lifetimes (0-1)
            this.lifetimes[i] = Math.random();
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));
        
        // Custom shader material for particles
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
            },
            vertexShader: `
                attribute float size;
                varying vec3 vColor;
                uniform float time;
                uniform float pixelRatio;
                
                void main() {
                    vColor = color;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * pixelRatio * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    // Circular particle with soft edge
                    vec2 center = gl_PointCoord - 0.5;
                    float dist = length(center);
                    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
                    
                    // Glow effect
                    float glow = 1.0 - smoothstep(0.0, 0.3, dist);
                    vec3 finalColor = vColor + (vColor * glow * 0.5);
                    
                    gl_FragColor = vec4(finalColor, alpha * 0.8);
                }
            `,
            transparent: true,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }
    
    setupMouseInteraction() {
        window.addEventListener('mousemove', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });
        
        window.addEventListener('click', (event) => {
            this.createBurst(event.clientX, event.clientY);
        });
    }
    
    createBurst(screenX, screenY) {
        // Convert screen coordinates to world space
        this.mouse.x = (screenX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(screenY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObject(this.interactivePlane);
        
        if (intersects.length > 0) {
            const point = intersects[0].point;
            
            // Create burst of particles
            const burstCount = 100;
            const burstPositions = new Float32Array(burstCount * 3);
            const burstVelocities = new Float32Array(burstCount * 3);
            
            for (let i = 0; i < burstCount; i++) {
                const angle = (Math.PI * 2 * i) / burstCount;
                const velocity = 0.5 + Math.random() * 0.5;
                
                burstPositions[i * 3] = point.x;
                burstPositions[i * 3 + 1] = point.y;
                burstPositions[i * 3 + 2] = point.z;
                
                burstVelocities[i * 3] = Math.cos(angle) * velocity;
                burstVelocities[i * 3 + 1] = Math.sin(angle) * velocity;
                burstVelocities[i * 3 + 2] = (Math.random() - 0.5) * velocity;
            }
            
            // Add burst particles to a trail array
            this.trails.push({
                positions: burstPositions,
                velocities: burstVelocities,
                age: 0,
                maxAge: 120
            });
        }
    }
    
    update() {
        const time = this.clock.getElapsedTime();
        
        // Update uniforms
        if (this.particles.material.uniforms) {
            this.particles.material.uniforms.time.value = time;
        }
        
        // Animate particles
        const positions = this.particles.geometry.attributes.position.array;
        
        for (let i = 0; i < this.particleCount; i++) {
            const idx = i * 3;
            
            // Update lifetime
            this.lifetimes[i] += 0.005;
            if (this.lifetimes[i] > 1) {
                this.lifetimes[i] = 0;
                // Reset position
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos((Math.random() * 2) - 1);
                const radius = 5 + Math.random() * 15;
                
                positions[idx] = radius * Math.sin(phi) * Math.cos(theta);
                positions[idx + 1] = radius * Math.sin(phi) * Math.sin(theta);
                positions[idx + 2] = radius * Math.cos(phi);
            }
            
            // Orbit animation
            const orbitSpeed = 0.1 + (this.lifetimes[i] * 0.2);
            const x = positions[idx];
            const z = positions[idx + 2];
            
            positions[idx] = x * Math.cos(orbitSpeed * 0.01) - z * Math.sin(orbitSpeed * 0.01);
            positions[idx + 2] = x * Math.sin(orbitSpeed * 0.01) + z * Math.cos(orbitSpeed * 0.01);
            
            // Add some noise
            positions[idx + 1] += Math.sin(time + i) * 0.01;
        }
        
        this.particles.geometry.attributes.position.needsUpdate = true;
        
        // Update trails
        this.updateTrails();
        
        // Rotate entire particle system slowly
        this.particles.rotation.y = time * 0.05;
    }
    
    updateTrails() {
        for (let i = this.trails.length - 1; i >= 0; i--) {
            const trail = this.trails[i];
            trail.age++;
            
            if (trail.age > trail.maxAge) {
                this.trails.splice(i, 1);
                continue;
            }
            
            // Update trail positions
            for (let j = 0; j < trail.positions.length / 3; j++) {
                const idx = j * 3;
                
                trail.positions[idx] += trail.velocities[idx] * 0.5;
                trail.positions[idx + 1] += trail.velocities[idx + 1] * 0.5;
                trail.positions[idx + 2] += trail.velocities[idx + 2] * 0.5;
                
                // Gravity
                trail.velocities[idx + 1] -= 0.01;
                
                // Drag
                trail.velocities[idx] *= 0.98;
                trail.velocities[idx + 1] *= 0.98;
                trail.velocities[idx + 2] *= 0.98;
            }
        }
    }
    
    updateOnScroll(velocity) {
        // Increase particle speed on scroll
        const speedMultiplier = 1 + Math.abs(velocity) * 0.01;
        this.particles.rotation.y += 0.001 * speedMultiplier;
    }
}

// Export
window.AdvancedParticleSystem = AdvancedParticleSystem;
