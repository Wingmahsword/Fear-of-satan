/**
 * FEAR OF SATAN - Three.js WebGPU Engine
 * GPU-Accelerated 3D Effects with Auto-Fallback
 * Replaces/Enhances custom WebGPU implementation
 */

import * as THREE from 'three';
import { WebGPURenderer } from 'three/addons/renderers/webgpu/WebGPURenderer.js';

class ThreeWebGPUEngine {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.canvas = null;
        this.isWebGPU = false;
        this.particles = null;
        this.floatingShapes = [];
        this.mouse = { x: 0, y: 0 };
        this.scrollData = { scroll: 0, velocity: 0 };
        
        this.init();
    }
    
    async init() {
        try {
            // Check WebGPU support
            if (!navigator.gpu) {
                console.log('WebGPU not supported, using fallback');
                this.useFallback();
                return;
            }
            
            // Create canvas
            this.canvas = document.createElement('canvas');
            this.canvas.className = 'webgpu-canvas three-webgpu';
            this.canvas.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1000;
            `;
            document.body.appendChild(this.canvas);
            
            // Three.js WebGPU renderer
            this.renderer = new WebGPURenderer({ 
                canvas: this.canvas,
                antialias: true,
                alpha: true 
            });
            await this.renderer.init();
            
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            
            // Scene setup
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(
                75, 
                window.innerWidth / window.innerHeight, 
                0.1, 
                1000
            );
            this.camera.position.z = 5;
            
            this.isWebGPU = true;
            
            // Initialize effects
            this.initParticles();
            this.initFloatingShapes();
            this.initLights();
            
            // Event listeners
            window.addEventListener('resize', () => this.onResize());
            window.addEventListener('mousemove', (e) => this.onMouseMove(e));
            
            // Sync with Lenis
            if (window.lenis) {
                window.lenis.on('scroll', ({ scroll, velocity }) => {
                    this.scrollData = { scroll, velocity };
                    this.updateOnScroll(scroll, velocity);
                });
            }
            
            // Start render loop
            this.animate();
            
            console.log(' Three.js WebGPU initialized successfully');
            
            // Disable custom engine if Three.js works
            if (window.FOSWebGPU && window.FOSWebGPU.supported) {
                console.log('Using Three.js WebGPU instead of custom engine');
                window.FOSWebGPU.destroy();
            }
            
        } catch (error) {
            console.error('Three.js WebGPU init failed:', error);
            this.useFallback();
        }
    }
    
    initParticles() {
        const particleCount = 500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        const colorPalette = [
            new THREE.Color(0xff1744), // Red
            new THREE.Color(0x00e5ff), // Cyan
            new THREE.Color(0x76ff03), // Green
            new THREE.Color(0xffea00), // Yellow
            new THREE.Color(0xd500f9)  // Purple
        ];
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
            
            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
            
            sizes[i] = Math.random() * 0.1 + 0.05;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }
    
    initFloatingShapes() {
        // Cube
        const cubeGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const cubeMat = new THREE.MeshStandardMaterial({ 
            color: 0xff1744,
            metalness: 0.3,
            roughness: 0.4,
            transparent: true,
            opacity: 0.9
        });
        const cube = new THREE.Mesh(cubeGeo, cubeMat);
        cube.position.set(-3, 2, -2);
        cube.userData = { 
            rotationSpeed: { x: 0.01, y: 0.02, z: 0 },
            floatSpeed: 0.002,
            floatOffset: 0
        };
        this.scene.add(cube);
        this.floatingShapes.push(cube);
        
        // Pyramid (Tetrahedron)
        const pyramidGeo = new THREE.TetrahedronGeometry(0.4);
        const pyramidMat = new THREE.MeshStandardMaterial({ 
            color: 0x00e5ff,
            metalness: 0.3,
            roughness: 0.4,
            transparent: true,
            opacity: 0.9
        });
        const pyramid = new THREE.Mesh(pyramidGeo, pyramidMat);
        pyramid.position.set(3, 1, -3);
        pyramid.userData = { 
            rotationSpeed: { x: 0.02, y: 0.01, z: 0.005 },
            floatSpeed: 0.003,
            floatOffset: Math.PI
        };
        this.scene.add(pyramid);
        this.floatingShapes.push(pyramid);
        
        // Orb (Sphere)
        const orbGeo = new THREE.SphereGeometry(0.3, 32, 32);
        const orbMat = new THREE.MeshStandardMaterial({ 
            color: 0x76ff03,
            metalness: 0.5,
            roughness: 0.2,
            transparent: true,
            opacity: 0.9,
            emissive: 0x76ff03,
            emissiveIntensity: 0.2
        });
        const orb = new THREE.Mesh(orbGeo, orbMat);
        orb.position.set(-2, -1, -1);
        orb.userData = { 
            rotationSpeed: { x: 0.005, y: 0.03, z: 0 },
            floatSpeed: 0.0015,
            floatOffset: Math.PI / 2
        };
        this.scene.add(orb);
        this.floatingShapes.push(orb);
    }
    
    initLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        const pointLight = new THREE.PointLight(0xffffff, 1, 100);
        pointLight.position.set(0, 0, 5);
        this.scene.add(pointLight);
    }
    
    updateOnScroll(scroll, velocity) {
        // Rotate floating shapes faster based on scroll velocity
        this.floatingShapes.forEach(shape => {
            const speedMultiplier = 1 + Math.abs(velocity) * 0.01;
            shape.rotation.x += shape.userData.rotationSpeed.x * speedMultiplier;
            shape.rotation.y += shape.userData.rotationSpeed.y * speedMultiplier;
        });
        
        // Move particles based on scroll
        if (this.particles) {
            this.particles.rotation.y = scroll * 0.001;
            this.particles.position.y = -scroll * 0.002;
        }
    }
    
    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Subtle camera movement based on mouse
        if (this.camera) {
            gsap.to(this.camera.position, {
                x: this.mouse.x * 0.5,
                y: this.mouse.y * 0.5,
                duration: 1,
                ease: 'power2.out'
            });
        }
    }
    
    onResize() {
        if (!this.camera || !this.renderer) return;
        
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (!this.isWebGPU || !this.renderer) return;
        
        const time = Date.now() * 0.001;
        
        // Animate floating shapes
        this.floatingShapes.forEach((shape, i) => {
            // Continuous rotation
            shape.rotation.x += shape.userData.rotationSpeed.x;
            shape.rotation.y += shape.userData.rotationSpeed.y;
            
            // Floating motion
            shape.position.y += Math.sin(time + shape.userData.floatOffset) * 0.002;
        });
        
        // Animate particles
        if (this.particles) {
            this.particles.rotation.y += 0.001;
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    burst(x, y, count = 8) {
        // Use custom engine for particle bursts (it's more optimized for this)
        if (window.FOSWebGPU && window.FOSWebGPU.supported) {
            window.FOSWebGPU.burst(x, y, count);
        }
    }
    
    useFallback() {
        console.log('Using custom WebGPU engine as fallback');
        document.body.classList.add('three-webgpu-fallback');
        // Custom engine continues to work
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.ThreeWebGPU = new ThreeWebGPUEngine();
    });
} else {
    window.ThreeWebGPU = new ThreeWebGPUEngine();
}
