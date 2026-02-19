/**
 * FEAR OF SATAN - Three.js Post-Processing Pipeline (Simplified)
 * Cinematic visual effects using built-in Three.js post-processing
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

class PostProcessingPipeline {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.composer = null;
        this.bloomPass = null;
        this.effects = {
            bloom: true
        };
        
        this.init();
    }
    
    init() {
        try {
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
            
            console.log('✨ Post-processing pipeline initialized (Bloom active)');
        } catch (error) {
            console.warn('Post-processing init failed:', error);
        }
    }
    
    // Update effects based on scroll velocity
    updateOnScroll(velocity) {
        if (this.bloomPass) {
            // Subtle bloom intensity change on scroll
            this.bloomPass.strength = 1.5 + Math.abs(velocity) * 0.001;
        }
    }
    
    // Update grain animation
    update(time) {
        // Effects update here
    }
    
    // Toggle effects
    toggleEffect(effectName) {
        if (this.effects.hasOwnProperty(effectName)) {
            this.effects[effectName] = !this.effects[effectName];
            
            if (effectName === 'bloom' && this.bloomPass) {
                this.bloomPass.enabled = this.effects.bloom;
            }
        }
    }
    
    // Resize handler
    onResize(width, height) {
        if (this.composer) {
            this.composer.setSize(width, height);
        }
    }
    
    // Render
    render() {
        if (this.composer) {
            this.composer.render();
        } else if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
}

// Export for use in main engine
window.PostProcessingPipeline = PostProcessingPipeline;
