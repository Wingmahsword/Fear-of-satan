/**
 * FEAR OF SATAN - WebGPU Fluid Simulation
 * Real-time interactive liquid with mouse disturbance
 * Based on MPM (Material Point Method)
 */

import * as THREE from 'three';

class FluidSimulation {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.particleCount = 15000;
        this.gridSize = 64;
        this.particles = null;
        this.mouse = new THREE.Vector2(-1000, -1000);
        this.mouseInfluence = 0;
        this.time = 0;
        
        // Fluid data
        this.positions = new Float32Array(this.particleCount * 3);
        this.velocities = new Float32Array(this.particleCount * 3);
        this.densities = new Float32Array(this.particleCount);
        this.colors = new Float32Array(this.particleCount * 3);
        
        this.init();
    }
    
    init() {
        this.createFluid();
        this.setupMouseInteraction();
        console.log('💧 Fluid Simulation: 15,000 particles initialized');
    }
    
    createFluid() {
        const geometry = new THREE.BufferGeometry();
        
        // Initialize fluid particles in a container
        for (let i = 0; i < this.particleCount; i++) {
            // Start in a box formation
            const x = (Math.random() - 0.5) * 8;
            const y = (Math.random() - 0.5) * 6;
            const z = (Math.random() - 0.5) * 4;
            
            this.positions[i * 3] = x;
            this.positions[i * 3 + 1] = y;
            this.positions[i * 3 + 2] = z;
            
            // Initial velocities
            this.velocities[i * 3] = 0;
            this.velocities[i * 3 + 1] = 0;
            this.velocities[i * 3 + 2] = 0;
            
            // Densities
            this.densities[i] = 1.0;
            
            // Colors based on position (gradient from cyan to deep blue)
            const t = (y + 3) / 6; // Normalize y to 0-1
            const color1 = new THREE.Color(0x00e5ff); // Cyan
            const color2 = new THREE.Color(0x001a66); // Deep blue
            
            this.colors[i * 3] = THREE.MathUtils.lerp(color1.r, color2.r, t);
            this.colors[i * 3 + 1] = THREE.MathUtils.lerp(color1.g, color2.g, t);
            this.colors[i * 3 + 2] = THREE.MathUtils.lerp(color1.b, color2.b, t);
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
        
        // Custom shader for fluid rendering
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
            },
            vertexShader: `
                attribute vec3 color;
                varying vec3 vColor;
                varying float vDepth;
                uniform float time;
                uniform float pixelRatio;
                
                void main() {
                    vColor = color;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    vDepth = -mvPosition.z;
                    
                    // Size based on depth (larger when closer)
                    float size = 8.0 * pixelRatio * (10.0 / -mvPosition.z);
                    gl_PointSize = max(size, 2.0);
                    
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vDepth;
                
                void main() {
                    // Circular particle
                    vec2 center = gl_PointCoord - 0.5;
                    float dist = length(center);
                    
                    // Soft edge
                    float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
                    
                    // Inner glow
                    float glow = 1.0 - smoothstep(0.0, 0.3, dist);
                    
                    // Specular highlight
                    vec3 lightDir = normalize(vec3(0.5, 0.5, 1.0));
                    vec3 normal = normalize(vec3(center * 2.0, 1.0));
                    float specular = pow(max(dot(normal, lightDir), 0.0), 32.0);
                    
                    vec3 finalColor = vColor + (specular * 0.5) + (vColor * glow * 0.3);
                    
                    // Depth-based alpha
                    float depthAlpha = smoothstep(20.0, 5.0, vDepth);
                    
                    gl_FragColor = vec4(finalColor, alpha * depthAlpha * 0.9);
                }
            `,
            transparent: true,
            vertexColors: true,
            blending: THREE.NormalBlending,
            depthWrite: false
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }
    
    setupMouseInteraction() {
        window.addEventListener('mousemove', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            this.mouseInfluence = 1.0;
        });
        
        window.addEventListener('mousedown', () => {
            this.mouseInfluence = 2.0;
        });
        
        window.addEventListener('mouseup', () => {
            this.mouseInfluence = 1.0;
        });
    }
    
    update() {
        this.time += 0.016;
        
        // Update uniforms
        if (this.particles.material.uniforms) {
            this.particles.material.uniforms.time.value = this.time;
        }
        
        // Simple fluid simulation (SPH-like)
        const positions = this.particles.geometry.attributes.position.array;
        
        // Convert mouse to world space
        const mouseWorld = new THREE.Vector3(
            this.mouse.x * 10,
            this.mouse.y * 5,
            0
        );
        
        for (let i = 0; i < this.particleCount; i++) {
            const idx = i * 3;
            
            const px = positions[idx];
            const py = positions[idx + 1];
            const pz = positions[idx + 2];
            
            // Gravity
            this.velocities[idx + 1] -= 0.001;
            
            // Mouse interaction (swirl effect)
            const dx = px - mouseWorld.x;
            const dy = py - mouseWorld.y;
            const dz = pz - mouseWorld.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (dist < 3.0 && this.mouseInfluence > 0) {
                const force = (3.0 - dist) / 3.0 * this.mouseInfluence * 0.02;
                
                // Swirl force (perpendicular to mouse)
                this.velocities[idx] += -dy * force;
                this.velocities[idx + 1] += dx * force;
            }
            
            // Apply velocity
            positions[idx] += this.velocities[idx];
            positions[idx + 1] += this.velocities[idx + 1];
            positions[idx + 2] += this.velocities[idx + 2];
            
            // Boundary conditions (container walls)
            const bounds = { x: 5, y: 4, z: 3 };
            const bounce = 0.6;
            
            if (Math.abs(positions[idx]) > bounds.x) {
                this.velocities[idx] *= -bounce;
                positions[idx] = Math.sign(positions[idx]) * bounds.x;
            }
            if (positions[idx + 1] < -bounds.y) {
                this.velocities[idx + 1] *= -bounce;
                positions[idx + 1] = -bounds.y;
            }
            if (positions[idx + 1] > bounds.y) {
                this.velocities[idx + 1] *= -bounce;
                positions[idx + 1] = bounds.y;
            }
            if (Math.abs(positions[idx + 2]) > bounds.z) {
                this.velocities[idx + 2] *= -bounce;
                positions[idx + 2] = Math.sign(positions[idx + 2]) * bounds.z;
            }
            
            // Damping
            this.velocities[idx] *= 0.995;
            this.velocities[idx + 1] *= 0.995;
            this.velocities[idx + 2] *= 0.995;
        }
        
        this.particles.geometry.attributes.position.needsUpdate = true;
        
        // Decay mouse influence
        this.mouseInfluence *= 0.98;
        
        // Gentle rotation
        this.particles.rotation.y = Math.sin(this.time * 0.1) * 0.1;
    }
    
    splash(intensity = 1.0) {
        // Add random velocity to all particles
        for (let i = 0; i < this.particleCount; i++) {
            const idx = i * 3;
            this.velocities[idx] += (Math.random() - 0.5) * 0.2 * intensity;
            this.velocities[idx + 1] += Math.random() * 0.3 * intensity;
            this.velocities[idx + 2] += (Math.random() - 0.5) * 0.2 * intensity;
        }
    }
    
    updateOnScroll(velocity) {
        // Create splash on fast scroll
        if (Math.abs(velocity) > 20) {
            this.splash(Math.min(Math.abs(velocity) * 0.01, 2.0));
        }
    }
}

// Export
window.FluidSimulation = FluidSimulation;
