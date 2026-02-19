/**
 * FEAR OF SATAN - Device Capability Detector
 * Detects device tier and assigns appropriate graphics quality
 */

class DeviceCapabilityDetector {
    constructor() {
        this.tier = 'low'; // low, mid, high
        this.capabilities = {};
        this.detect();
    }
    
    detect() {
        // Hardware info
        const memory = navigator.deviceMemory || 4;
        const cores = navigator.hardwareConcurrency || 4;
        
        // Screen info
        const pixelRatio = window.devicePixelRatio || 1;
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        
        // Connection
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const connectionType = connection ? connection.effectiveType : '4g';
        
        // Check WebGL support
        const webglSupport = this.checkWebGLSupport();
        const webgl2Support = this.checkWebGL2Support();
        
        // Check touch support
        const isTouch = window.matchMedia('(pointer: coarse)').matches;
        
        // Check battery
        const batteryPromise = navigator.getBattery ? navigator.getBattery() : Promise.resolve(null);
        
        // Determine tier based on hardware
        this.determineTier({
            memory,
            cores,
            pixelRatio,
            screenWidth,
            screenHeight,
            connectionType,
            webglSupport,
            webgl2Support,
            isTouch
        });
        
        this.capabilities = {
            memory,
            cores,
            pixelRatio,
            screenWidth,
            screenHeight,
            connectionType,
            webglSupport,
            webgl2Support,
            isTouch,
            tier: this.tier
        };
        
        console.log(`📱 Device Tier: ${this.tier.toUpperCase()}`, this.capabilities);
        
        // Add class to body
        document.body.classList.add(`device-tier-${this.tier}`);
        
        return this.capabilities;
    }
    
    determineTier(specs) {
        // HIGH-END: 6GB+ RAM, 6+ cores, WebGL2, high pixel ratio
        if (specs.memory >= 6 && 
            specs.cores >= 6 && 
            specs.webgl2Support && 
            specs.pixelRatio >= 2 &&
            specs.screenWidth >= 1080) {
            this.tier = 'high';
        }
        // MID: 4GB+ RAM, 4+ cores, WebGL support
        else if (specs.memory >= 4 && 
                 specs.cores >= 4 && 
                 specs.webglSupport &&
                 specs.screenWidth >= 720) {
            this.tier = 'mid';
        }
        // LOW: Everything else
        else {
            this.tier = 'low';
        }
        
        // Override for slow connections
        if (specs.connectionType === '2g' || specs.connectionType === 'slow-2g') {
            this.tier = 'low';
        }
    }
    
    checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return !!gl;
        } catch (e) {
            return false;
        }
    }
    
    checkWebGL2Support() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl2');
            return !!gl;
        } catch (e) {
            return false;
        }
    }
    
    getTier() {
        return this.tier;
    }
    
    getCapabilities() {
        return this.capabilities;
    }
    
    // Get graphics settings for current tier
    getGraphicsSettings() {
        const settings = {
            low: {
                particles: 50,
                useWebGL: false,
                useCanvas: true,
                useCSS: true,
                postProcessing: false,
                shadows: false,
                antialias: false,
                touchEffects: 'basic',
                frameRate: 30
            },
            mid: {
                particles: 500,
                useWebGL: true,
                useCanvas: true,
                useCSS: true,
                postProcessing: 'basic', // bloom only
                shadows: false,
                antialias: false,
                touchEffects: 'advanced',
                frameRate: 45
            },
            high: {
                particles: 2000,
                useWebGL: true,
                useCanvas: true,
                useCSS: true,
                postProcessing: 'full', // bloom + effects
                shadows: true,
                antialias: true,
                touchEffects: 'full',
                frameRate: 60
            }
        };
        
        return settings[this.tier];
    }
}

// Initialize and expose globally
window.DeviceCapability = new DeviceCapabilityDetector();
