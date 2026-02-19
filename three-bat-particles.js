/**
 * FEAR OF SATAN - Flying Bat Particle Animation
 * Animated bats made of colored particles flying across screen
 */

import * as THREE from 'three';

class BatParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.bats = [];
        this.batColors = [
            0xff1744, // Red
            0x00e5ff, // Cyan
            0x76ff03, // Green
            0xffea00, // Yellow
            0xd500f9, // Purple
            0xff6d00, // Orange
            0xff1744, // Red
            0x00e5ff  // Cyan
        ];
        
        this.init();
    }
    
    init() {
        // Create multiple bats
        for (let i = 0; i < 8; i++) {
            this.createBat(i);
        }
        console.log('🦇 Bat Particle System: 8 animated bats initialized');
    }
    
    createBat(index) {
        const particleCount = 150;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        const color = new THREE.Color(this.batColors[index % this.batColors.length]);
        
        // Create bat wing shape
        for (let i = 0; i < particleCount; i++) {
            const t = i / particleCount;
            
            // Left wing
            if (i < particleCount * 0.45) {
                const wingT = (i / (particleCount * 0.45));
                const angle = Math.PI * 0.8 * wingT;
                const radius = 0.3 + wingT * 0.8;
                positions[i * 3] = -Math.cos(angle) * radius - 0.1;
                positions[i * 3 + 1] = Math.sin(angle) * radius * 0.5;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
            } 
            // Right wing
            else if (i < particleCount * 0.9) {
                const wingT = ((i - particleCount * 0.45) / (particleCount * 0.45));
                const angle = Math.PI * 0.8 * wingT;
                const radius = 0.3 + wingT * 0.8;
                positions[i * 3] = Math.cos(angle) * radius + 0.1;
                positions[i * 3 + 1] = Math.sin(angle) * radius * 0.5;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
            }
            // Body
            else {
                const bodyT = (i - particleCount * 0.9) / (particleCount * 0.1);
                positions[i * 3] = (Math.random() - 0.5) * 0.15;
                positions[i * 3 + 1] = -0.1 - Math.random() * 0.2;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
            }
            
            // Color variation
            const variation = 0.8 + Math.random() * 0.4;
            colors[i * 3] = color.r * variation;
            colors[i * 3 + 1] = color.g * variation;
            colors[i * 3 + 2] = color.b * variation;
            
            sizes[i] = 0.03 + Math.random() * 0.04;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.PointsMaterial({
            size: 0.08,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        
        const bat = new THREE.Points(geometry, material);
        
        // Random starting position
        bat.position.x = -15 - Math.random() * 10;
        bat.position.y = 2 + Math.random() * 4;
        bat.position.z = -2 - Math.random() * 3;
        
        // Store bat data
        bat.userData = {
            speed: 0.03 + Math.random() * 0.02,
            wingSpeed: 8 + Math.random() * 4,
            wingPhase: Math.random() * Math.PI * 2,
            baseY: bat.position.y,
            bobSpeed: 2 + Math.random() * 2,
            bobPhase: Math.random() * Math.PI * 2,
            originalPositions: positions.slice()
        };
        
        this.scene.add(bat);
        this.bats.push(bat);
    }
    
    update(time) {
        this.bats.forEach((bat, index) => {
            const data = bat.userData;
            
            // Move bat across screen
            bat.position.x += data.speed;
            
            // Reset when off screen
            if (bat.position.x > 15) {
                bat.position.x = -15 - Math.random() * 5;
                bat.position.y = 2 + Math.random() * 4;
            }
            
            // Bobbing motion
            bat.position.y = data.baseY + Math.sin(time * data.bobSpeed + data.bobPhase) * 0.3;
            
            // Wing flapping animation
            const wingAngle = Math.sin(time * data.wingSpeed + data.wingPhase);
            const positions = bat.geometry.attributes.position.array;
            const originalPositions = data.originalPositions;
            
            for (let i = 0; i < positions.length / 3; i++) {
                const ox = originalPositions[i * 3];
                const oy = originalPositions[i * 3 + 1];
                
                // Apply wing flap
                if (i < 150 * 0.45) {
                    // Left wing
                    positions[i * 3] = ox;
                    positions[i * 3 + 1] = oy * (0.5 + wingAngle * 0.5);
                } else if (i < 150 * 0.9) {
                    // Right wing
                    positions[i * 3] = ox;
                    positions[i * 3 + 1] = oy * (0.5 + wingAngle * 0.5);
                }
            }
            
            bat.geometry.attributes.position.needsUpdate = true;
            
            // Rotate slightly based on wing flap
            bat.rotation.z = wingAngle * 0.1;
        });
    }
}

// Export
window.BatParticleSystem = BatParticleSystem;
