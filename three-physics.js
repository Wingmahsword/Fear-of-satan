/**
 * FEAR OF SATAN - Physics Integration
 * Cloth simulation, soft bodies, and wind effects
 */

import * as THREE from 'three';

class PhysicsSystem {
    constructor(scene) {
        this.scene = scene;
        this.cloths = [];
        this.softBodies = [];
        this.windForce = new THREE.Vector3(0, 0, 0);
        this.time = 0;
        
        this.init();
    }
    
    init() {
        this.createCloth();
        this.createSoftBody();
        console.log('🌊 Physics System: Cloth + Soft Body initialized');
    }
    
    createCloth() {
        // Cloth parameters
        const width = 4;
        const height = 3;
        const segmentsX = 20;
        const segmentsY = 15;
        
        const geometry = new THREE.PlaneGeometry(width, height, segmentsX, segmentsY);
        
        // Store original positions for physics simulation
        const positions = geometry.attributes.position.array;
        const originalPositions = new Float32Array(positions.length);
        const velocities = new Float32Array(positions.length);
        
        for (let i = 0; i < positions.length; i++) {
            originalPositions[i] = positions[i];
            velocities[i] = 0;
        }
        
        // Custom shader material for cloth
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                windStrength: { value: 1.0 }
            },
            vertexShader: `
                uniform float time;
                uniform float windStrength;
                varying vec2 vUv;
                varying float vElevation;
                
                void main() {
                    vUv = uv;
                    
                    vec3 pos = position;
                    
                    // Wave motion based on position and time
                    float wave1 = sin(pos.x * 2.0 + time * 1.5) * 0.3 * windStrength;
                    float wave2 = sin(pos.y * 3.0 + time * 2.0) * 0.2 * windStrength;
                    float wave3 = sin((pos.x + pos.y) * 1.5 + time) * 0.15 * windStrength;
                    
                    // Pin the top edge
                    float pinFactor = smoothstep(0.9, 1.0, uv.y);
                    
                    pos.z += (wave1 + wave2 + wave3) * (1.0 - pinFactor);
                    vElevation = pos.z;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                varying vec2 vUv;
                varying float vElevation;
                
                void main() {
                    // Gradient from red to dark based on elevation
                    vec3 color1 = vec3(1.0, 0.09, 0.27); // Red
                    vec3 color2 = vec3(0.04, 0.04, 0.08); // Dark
                    
                    float mixFactor = smoothstep(-0.5, 0.5, vElevation);
                    vec3 color = mix(color2, color1, mixFactor);
                    
                    // Add some texture/pattern
                    float pattern = sin(vUv.x * 20.0) * sin(vUv.y * 20.0) * 0.05;
                    color += pattern;
                    
                    // Edges fade
                    float edgeX = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);
                    float edgeY = smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);
                    
                    gl_FragColor = vec4(color, 0.8 * edgeX * edgeY);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            wireframe: false
        });
        
        const cloth = new THREE.Mesh(geometry, material);
        cloth.position.set(3, 2, -2);
        cloth.rotation.y = -0.3;
        
        // Store physics data
        cloth.userData = {
            type: 'cloth',
            originalPositions: originalPositions,
            velocities: velocities,
            width: width,
            height: height,
            segmentsX: segmentsX,
            segmentsY: segmentsY
        };
        
        this.scene.add(cloth);
        this.cloths.push(cloth);
    }
    
    createSoftBody() {
        // Create a soft jelly-like sphere
        const geometry = new THREE.IcosahedronGeometry(0.8, 4);
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(0xd500f9) } // Purple
            },
            vertexShader: `
                uniform float time;
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    vNormal = normal;
                    
                    vec3 pos = position;
                    
                    // Squash and stretch based on time
                    float squash = sin(time * 2.0) * 0.1;
                    pos.y *= 1.0 + squash;
                    pos.x *= 1.0 - squash * 0.5;
                    pos.z *= 1.0 - squash * 0.5;
                    
                    // Add some noise
                    float noise = sin(pos.x * 5.0 + time) * sin(pos.y * 5.0 + time) * sin(pos.z * 5.0 + time) * 0.05;
                    pos += normal * noise;
                    
                    vPosition = pos;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    // Fresnel effect for soft body look
                    vec3 viewDir = normalize(cameraPosition - vPosition);
                    float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 2.0);
                    
                    // Inner glow
                    vec3 innerColor = color * 0.5;
                    vec3 outerColor = color + vec3(fresnel * 0.3);
                    
                    vec3 finalColor = mix(innerColor, outerColor, fresnel);
                    
                    // Specular highlight
                    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                    vec3 halfDir = normalize(lightDir + viewDir);
                    float specular = pow(max(dot(vNormal, halfDir), 0.0), 64.0);
                    finalColor += vec3(specular * 0.5);
                    
                    float alpha = 0.7 + fresnel * 0.2;
                    
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        const softBody = new THREE.Mesh(geometry, material);
        softBody.position.set(-3, -1, -1);
        
        softBody.userData = {
            type: 'softBody',
            baseScale: 1.0,
            squishPhase: 0
        };
        
        this.scene.add(softBody);
        this.softBodies.push(softBody);
    }
    
    update() {
        this.time += 0.016;
        
        // Update cloths
        this.cloths.forEach(cloth => {
            if (cloth.material.uniforms) {
                cloth.material.uniforms.time.value = this.time;
                
                // Wind strength based on scroll velocity
                const scrollData = window.getLenisData ? window.getLenisData() : null;
                const windStrength = scrollData ? 1.0 + Math.abs(scrollData.velocity) * 0.02 : 1.0;
                cloth.material.uniforms.windStrength.value = windStrength;
            }
        });
        
        // Update soft bodies
        this.softBodies.forEach(body => {
            if (body.material.uniforms) {
                body.material.uniforms.time.value = this.time;
            }
            
            // Gentle floating motion
            body.position.y = -1 + Math.sin(this.time * 0.5) * 0.2;
            body.rotation.x = Math.sin(this.time * 0.3) * 0.1;
            body.rotation.z = Math.cos(this.time * 0.4) * 0.1;
        });
    }
    
    updateOnScroll(velocity) {
        // Increase wind on scroll
        const windStrength = Math.min(Math.abs(velocity) * 0.001, 2.0);
        this.windForce.set(
            (Math.random() - 0.5) * windStrength,
            -windStrength * 0.5,
            (Math.random() - 0.5) * windStrength
        );
    }
}

// Export
window.PhysicsSystem = PhysicsSystem;
