/**
 * FEAR OF SATAN - Three.js Post-Processing Pipeline
 * Cinematic visual effects: Bloom, Chromatic Aberration, Vignette, Film Grain
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

class PostProcessingPipeline {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.composer = null;
        this.bloomPass = null;
        this.effects = {
            bloom: true,
            chromaticAberration: true,
            vignette: true,
            grain: true,
            toneMapping: true
        };
        
        this.init();
    }
    
    init() {
        // Create effect composer
        this.composer = new EffectComposer(this.renderer);
        
        // Add render pass
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        // Bloom effect (glow on bright areas)
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5,  // strength
            0.4,  // radius
            0.85  // threshold
        );
        this.composer.addPass(this.bloomPass);
        
        // Custom post-processing shader pass
        this.createCustomEffectsPass();
        
        console.log('✨ Post-processing pipeline initialized');
    }
    
    createCustomEffectsPass() {
        // Custom shader combining chromatic aberration, vignette, and grain
        const customShader = {
            uniforms: {
                tDiffuse: { value: null },
                resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                time: { value: 0 },
                chromaticAberration: { value: 0.003 },
                vignetteIntensity: { value: 1.2 },
                grainIntensity: { value: 0.04 },
                enableChromatic: { value: 1.0 },
                enableVignette: { value: 1.0 },
                enableGrain: { value: 1.0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform vec2 resolution;
                uniform float time;
                uniform float chromaticAberration;
                uniform float vignetteIntensity;
                uniform float grainIntensity;
                uniform float enableChromatic;
                uniform float enableVignette;
                uniform float enableGrain;
                varying vec2 vUv;
                
                // Random function for grain
                float random(vec2 st) {
                    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
                }
                
                void main() {
                    vec2 uv = vUv;
                    vec4 color = vec4(0.0);
                    
                    // Chromatic Aberration
                    if (enableChromatic > 0.5) {
                        float r = texture2D(tDiffuse, uv + vec2(chromaticAberration, 0.0)).r;
                        float g = texture2D(tDiffuse, uv).g;
                        float b = texture2D(tDiffuse, uv - vec2(chromaticAberration, 0.0)).b;
                        color = vec4(r, g, b, 1.0);
                    } else {
                        color = texture2D(tDiffuse, uv);
                    }
                    
                    // Vignette
                    if (enableVignette > 0.5) {
                        vec2 center = uv - 0.5;
                        float dist = length(center);
                        float vignette = smoothstep(0.8, 0.3, dist * vignetteIntensity);
                        color.rgb *= vignette;
                    }
                    
                    // Film Grain
                    if (enableGrain > 0.5) {
                        float grain = random(uv + time) * grainIntensity;
                        color.rgb += grain - (grainIntensity * 0.5);
                    }
                    
                    gl_FragColor = color;
                }
            `
        };
        
        this.customPass = new ShaderPass(customShader);
        this.composer.addPass(this.customPass);
    }
    
    // Update effects based on scroll velocity
    updateOnScroll(velocity) {
        // Increase chromatic aberration on fast scroll
        const aberrationIntensity = Math.min(0.01, 0.003 + Math.abs(velocity) * 0.0001);
        this.customPass.uniforms.chromaticAberration.value = aberrationIntensity;
        
        // Subtle bloom intensity change
        this.bloomPass.strength = 1.5 + Math.abs(velocity) * 0.001;
    }
    
    // Update grain animation
    update(time) {
        if (this.customPass) {
            this.customPass.uniforms.time.value = time;
        }
    }
    
    // Toggle effects
    toggleEffect(effectName) {
        if (this.effects.hasOwnProperty(effectName)) {
            this.effects[effectName] = !this.effects[effectName];
            
            switch(effectName) {
                case 'bloom':
                    this.bloomPass.enabled = this.effects.bloom;
                    break;
                case 'chromaticAberration':
                    this.customPass.uniforms.enableChromatic.value = this.effects.chromaticAberration ? 1.0 : 0.0;
                    break;
                case 'vignette':
                    this.customPass.uniforms.enableVignette.value = this.effects.vignette ? 1.0 : 0.0;
                    break;
                case 'grain':
                    this.customPass.uniforms.enableGrain.value = this.effects.grain ? 1.0 : 0.0;
                    break;
            }
        }
    }
    
    // Resize handler
    onResize(width, height) {
        this.composer.setSize(width, height);
        this.customPass.uniforms.resolution.value.set(width, height);
    }
    
    // Render
    render() {
        this.composer.render();
    }
}

// Export for use in main engine
window.PostProcessingPipeline = PostProcessingPipeline;
