/**
 * FEAR OF SATAN — WebGPU Engine
 * GPU-Accelerated 3D Effects for Performance
 * Replaces CSS/JS with WebGPU for better performance on modern devices
 */

(function() {
    'use strict';

    // Matrix utilities
    const mat4 = {
        create: () => new Float32Array(16),
        identity: (out) => {
            out[0] = 1; out[1] = 0; out[2] = 0; out[3] = 0;
            out[4] = 0; out[5] = 1; out[6] = 0; out[7] = 0;
            out[8] = 0; out[9] = 0; out[10] = 1; out[11] = 0;
            out[12] = 0; out[13] = 0; out[14] = 0; out[15] = 1;
            return out;
        },
        multiply: (out, a, b) => {
            const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
            const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
            const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
            const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
            let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
            out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
            out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
            out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
            out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
            b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
            out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
            out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
            out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
            out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
            b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
            out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
            out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
            out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
            out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
            b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
            out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
            out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
            out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
            out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
            return out;
        },
        translate: (out, a, v) => {
            const x = v[0], y = v[1], z = v[2];
            if (a === out) {
                out[12] = a[0]*x + a[4]*y + a[8]*z + a[12];
                out[13] = a[1]*x + a[5]*y + a[9]*z + a[13];
                out[14] = a[2]*x + a[6]*y + a[10]*z + a[14];
                out[15] = a[3]*x + a[7]*y + a[11]*z + a[15];
            } else {
                const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
                const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
                const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
                out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03;
                out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13;
                out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23;
                out[12] = a00*x + a10*y + a20*z + a[12];
                out[13] = a01*x + a11*y + a21*z + a[13];
                out[14] = a02*x + a12*y + a22*z + a[14];
                out[15] = a03*x + a13*y + a23*z + a[15];
            }
            return out;
        },
        rotateY: (out, a, rad) => {
            const s = Math.sin(rad), c = Math.cos(rad);
            const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
            const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
            out[0] = a00*c - a20*s;
            out[1] = a01*c - a21*s;
            out[2] = a02*c - a22*s;
            out[3] = a03*c - a23*s;
            out[8] = a00*s + a20*c;
            out[9] = a01*s + a21*c;
            out[10] = a02*s + a22*c;
            out[11] = a03*s + a23*c;
            if (out !== a) {
                out[4] = a[4]; out[5] = a[5]; out[6] = a[6]; out[7] = a[7];
                out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15];
            }
            return out;
        },
        rotateX: (out, a, rad) => {
            const s = Math.sin(rad), c = Math.cos(rad);
            const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
            const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
            out[4] = a10*c + a20*s;
            out[5] = a11*c + a21*s;
            out[6] = a12*c + a22*s;
            out[7] = a13*c + a23*s;
            out[8] = a20*c - a10*s;
            out[9] = a21*c - a11*s;
            out[10] = a22*c - a12*s;
            out[11] = a23*c - a13*s;
            if (out !== a) {
                out[0] = a[0]; out[1] = a[1]; out[2] = a[2]; out[3] = a[3];
                out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15];
            }
            return out;
        },
        scale: (out, a, v) => {
            const x = v[0], y = v[1], z = v[2];
            out[0] = a[0] * x; out[1] = a[1] * x; out[2] = a[2] * x; out[3] = a[3] * x;
            out[4] = a[4] * y; out[5] = a[5] * y; out[6] = a[6] * y; out[7] = a[7] * y;
            out[8] = a[8] * z; out[9] = a[9] * z; out[10] = a[10] * z; out[11] = a[11] * z;
            if (out !== a) {
                out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15];
            }
            return out;
        },
        ortho: (out, left, right, bottom, top, near, far) => {
            const lr = 1 / (left - right);
            const bt = 1 / (bottom - top);
            const nf = 1 / (near - far);
            out[0] = -2 * lr; out[1] = 0; out[2] = 0; out[3] = 0;
            out[4] = 0; out[5] = -2 * bt; out[6] = 0; out[7] = 0;
            out[8] = 0; out[9] = 0; out[10] = 2 * nf; out[11] = 0;
            out[12] = (left + right) * lr; out[13] = (top + bottom) * bt; out[14] = (far + near) * nf; out[15] = 1;
            return out;
        }
    };

    /* ==================================================
       1. WebGPU DETECTION AND SETUP
       ================================================== */

    class WebGPUEngine {
        constructor() {
            this.supported = false;
            this.adapter = null;
            this.device = null;
            this.canvas = null;
            this.context = null;
            this.swapChainFormat = 'bgra8unorm';
            this.pipelines = new Map();
            this.buffers = new Map();
            this.bindGroups = new Map();
            this.uniformBuffer = null;
            this.textures = new Map();
            this.floatingElements = [
                { type: 'cube', position: [0.05, 0.2, 0], rotation: 0, color: [1, 0, 0, 0.8] },
                { type: 'pyramid', position: [0.92, 0.6, 0], rotation: 0, color: [0, 1, 0, 0.8] },
                { type: 'orb', position: [0.1, 0.4, 0], rotation: 0, color: [0, 0, 1, 0.8] }
            ];
            this.tiltingCards = [];
            this.parallaxElements = [];
            this.activeParticles = [];
            this.particleId = 0;
            this.mouseX = window.innerWidth / 2;
            this.mouseY = window.innerHeight / 2;

            this.projection = mat4.create();
            mat4.ortho(this.projection, -1, 1, -1, 1, -1, 1);

            // Track mouse position for parallax
            document.addEventListener('mousemove', (e) => {
                this.mouseX = e.clientX;
                this.mouseY = e.clientY;
            });

            this.init();
        }

        async init() {
            try {
                if (!navigator.gpu) {
                    console.log('WebGPU not supported, falling back to CSS/JS');
                    return;
                }

                this.adapter = await navigator.gpu.requestAdapter();
                if (!this.adapter) {
                    console.log('No WebGPU adapter found');
                    return;
                }

                this.device = await this.adapter.requestDevice();

                this.canvas = document.createElement('canvas');
                this.canvas.className = 'webgpu-canvas';
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
                this.canvas.style.position = 'fixed';
                this.canvas.style.top = '0';
                this.canvas.style.left = '0';
                this.canvas.style.pointerEvents = 'none';
                this.canvas.style.zIndex = '1000';
                document.body.appendChild(this.canvas);

                this.context = this.canvas.getContext('webgpu');
                if (!this.context) {
                    console.log('Failed to get WebGPU context');
                    return;
                }

                this.context.configure({
                    device: this.device,
                    format: this.swapChainFormat,
                    alphaMode: 'premultiplied'
                });

                this.supported = true;
                console.log('🎨 WebGPU initialized successfully');

                this.initParticleRenderer();
                this.initFloatingRenderer();
                this.initTiltRenderer();
                this.startRenderLoop();

            } catch (error) {
                console.error('WebGPU initialization failed:', error);
            }
        }

        startRenderLoop() {
            const render = () => {
                this.update();
                this.render();
                requestAnimationFrame(render);
            };
            render();
        }

        update() {
            // Update floating rotations
            this.floatingElements.forEach(el => {
                el.rotation += 0.01;
            });

            // Update particles
            const now = performance.now();
            const deltaTime = 16;
            this.activeParticles = this.activeParticles.filter(particle => {
                const age = (now - particle.startTime) / 800;
                if (age >= 1.0) return false;
                particle.x += particle.vx * (deltaTime / 1000);
                particle.y += particle.vy * (deltaTime / 1000);
                particle.life = 1.0 - age;
                particle.vy += 100 * (deltaTime / 1000);
                return true;
            });
        }

        render() {
            if (!this.supported) return;

            const commandEncoder = this.device.createCommandEncoder();
            const textureView = this.context.getCurrentTexture().createView();

            const renderPassDescriptor = {
                colorAttachments: [{
                    view: textureView,
                    loadValue: { r: 0, g: 0, b: 0, a: 0 },
                    storeOp: 'store'
                }]
            };

            const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

            // Render tilting cards first (background)
            this.renderTilt(passEncoder);

            // Render parallax elements
            this.renderParallax(passEncoder);

            // Render floating elements
            this.renderFloating(passEncoder);

            // Render particles (foreground)
            this.renderParticles(passEncoder);

            passEncoder.endPass();
            this.device.queue.submit([commandEncoder.finish()]);
        }

        /* ==================================================
           2. PARTICLE SYSTEM — GPU-Accelerated
           ================================================== */

        async initParticleRenderer() {
            const vertexShaderCode = `
                struct VertexInput {
                    [[location(0)]] position: vec2<f32>;
                    [[location(1)]] velocity: vec2<f32>;
                    [[location(2)]] life: f32;
                    [[location(3)]] size: f32;
                    [[location(4)]] color: vec4<f32>;
                };
                struct VertexOutput {
                    [[builtin(position)]] position: vec4<f32>;
                    [[location(0)]] color: vec4<f32>;
                    [[location(1)]] size: f32;
                };
                [[stage(vertex)]]
                fn main(input: VertexInput) -> VertexOutput {
                    var clipX: f32 = (input.position.x / 800.0) * 2.0 - 1.0;
                    var clipY: f32 = 1.0 - (input.position.y / 600.0) * 2.0;
                    var output: VertexOutput;
                    output.position = vec4<f32>(clipX, clipY, 0.0, 1.0);
                    output.color = input.color;
                    output.size = input.size;
                    return output;
                }
            `;

            const fragmentShaderCode = `
                [[location(0)]] color: vec4<f32>;
                [[stage(fragment)]]
                fn main() -> [[location(0)]] vec4<f32> {
                    return color;
                }
            `;

            const vertexModule = this.device.createShaderModule({ code: vertexShaderCode });
            const fragmentModule = this.device.createShaderModule({ code: fragmentShaderCode });

            const bindGroupLayout = this.device.createBindGroupLayout({
                entries: []
            });

            const pipelineDescriptor = {
                layout: this.device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
                vertex: {
                    module: vertexModule,
                    entryPoint: 'main',
                    buffers: [{
                        arrayStride: 4 * 4 + 4 * 4 + 4 + 4 + 4 * 4,
                        attributes: [
                            { shaderLocation: 0, offset: 0, format: 'float32x2' },
                            { shaderLocation: 1, offset: 8, format: 'float32x2' },
                            { shaderLocation: 2, offset: 16, format: 'float32' },
                            { shaderLocation: 3, offset: 20, format: 'float32' },
                            { shaderLocation: 4, offset: 24, format: 'float32x4' }
                        ]
                    }]
                },
                fragment: {
                    module: fragmentModule,
                    entryPoint: 'main',
                    targets: [{ format: this.swapChainFormat }]
                },
                primitive: { topology: 'triangle-list' }
            };

            this.pipelines.set('particles', this.device.createRenderPipeline(pipelineDescriptor));
            this.buffers.set('particles', this.device.createBuffer({
                size: 100 * (2 * 4 + 2 * 4 + 4 + 4 + 4 * 4) * 6, // quads
                usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
            }));
        }

        renderParticles(passEncoder) {
            if (!this.activeParticles.length) return;

            const vertexData = [];
            this.activeParticles.forEach(particle => {
                const halfSize = particle.size / 2;
                const x1 = particle.x - halfSize;
                const x2 = particle.x + halfSize;
                const y1 = particle.y - halfSize;
                const y2 = particle.y + halfSize;
                const clipX1 = (x1 / this.canvas.width) * 2 - 1;
                const clipX2 = (x2 / this.canvas.width) * 2 - 1;
                const clipY1 = 1 - (y1 / this.canvas.height) * 2;
                const clipY2 = 1 - (y2 / this.canvas.height) * 2;

                // Triangle 1
                vertexData.push(clipX1, clipY1, particle.vx, particle.vy, particle.life, particle.size, ...particle.color);
                vertexData.push(clipX2, clipY1, particle.vx, particle.vy, particle.life, particle.size, ...particle.color);
                vertexData.push(clipX1, clipY2, particle.vx, particle.vy, particle.life, particle.size, ...particle.color);
                // Triangle 2
                vertexData.push(clipX2, clipY1, particle.vx, particle.vy, particle.life, particle.size, ...particle.color);
                vertexData.push(clipX2, clipY2, particle.vx, particle.vy, particle.life, particle.size, ...particle.color);
                vertexData.push(clipX1, clipY2, particle.vx, particle.vy, particle.life, particle.size, ...particle.color);
            });

            this.device.queue.writeBuffer(this.buffers.get('particles'), 0, new Float32Array(vertexData));
            passEncoder.setPipeline(this.pipelines.get('particles'));
            passEncoder.setVertexBuffer(0, this.buffers.get('particles'));
            passEncoder.draw(vertexData.length / 10);
        }

        /* ==================================================
           3. FLOATING 3D ELEMENTS — GPU-Accelerated
           ================================================== */

        async initFloatingRenderer() {
            const vertexShaderCode = `
                struct Uniforms {
                    mvp: mat4x4<f32>;
                    color: vec4<f32>;
                };
                [[binding(0), group(0)]] var<uniform> uniforms: Uniforms;
                [[stage(vertex)]]
                fn main([[location(0)]] position: vec3<f32>) -> [[builtin(position)]] vec4<f32> {
                    return uniforms.mvp * vec4<f32>(position, 1.0);
                }
            `;

            const fragmentShaderCode = `
                struct Uniforms {
                    mvp: mat4x4<f32>;
                    color: vec4<f32>;
                };
                [[binding(0), group(0)]] var<uniform> uniforms: Uniforms;
                [[stage(fragment)]]
                fn main() -> [[location(0)]] vec4<f32> {
                    return uniforms.color;
                }
            `;

            const vertexModule = this.device.createShaderModule({ code: vertexShaderCode });
            const fragmentModule = this.device.createShaderModule({ code: fragmentShaderCode });

            const bindGroupLayout = this.device.createBindGroupLayout({
                entries: [{ binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } }]
            });

            const pipelineDescriptor = {
                layout: this.device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
                vertex: {
                    module: vertexModule,
                    entryPoint: 'main',
                    buffers: [{
                        arrayStride: 12,
                        attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x3' }]
                    }]
                },
                fragment: {
                    module: fragmentModule,
                    entryPoint: 'main',
                    targets: [{ format: this.swapChainFormat }]
                },
                primitive: { topology: 'triangle-list' }
            };

            this.pipelines.set('floating', this.device.createRenderPipeline(pipelineDescriptor));
            this.uniformBuffer = this.device.createBuffer({
                size: 80, // mat4 + vec4
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            });

            // Cube vertices and indices
            const cubeVertices = new Float32Array([
                -0.5, -0.5,  0.5,  0.5, -0.5,  0.5,  0.5,  0.5,  0.5, -0.5,  0.5,  0.5,
                -0.5, -0.5, -0.5,  0.5, -0.5, -0.5,  0.5,  0.5, -0.5, -0.5,  0.5, -0.5
            ]);
            const cubeIndices = new Uint16Array([
                0,1,2, 0,2,3, 4,5,6, 4,6,7, 0,1,5, 0,5,4,
                2,3,7, 2,7,6, 0,3,7, 0,7,4, 1,2,6, 1,6,5
            ]);

            this.buffers.set('cubeVertices', this.device.createBuffer({
                size: cubeVertices.byteLength,
                usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
            }));
            this.device.queue.writeBuffer(this.buffers.get('cubeVertices'), 0, cubeVertices);

            this.buffers.set('cubeIndices', this.device.createBuffer({
                size: cubeIndices.byteLength,
                usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
            }));
            this.device.queue.writeBuffer(this.buffers.get('cubeIndices'), 0, cubeIndices);

            // Pyramid
            const pyramidVertices = new Float32Array([
                0, 1, 0, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5
            ]);
            const pyramidIndices = new Uint16Array([
                0,1,2, 0,2,3, 0,3,4, 0,4,1, 1,2,3, 1,3,4
            ]);

            this.buffers.set('pyramidVertices', this.device.createBuffer({
                size: pyramidVertices.byteLength,
                usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
            }));
            this.device.queue.writeBuffer(this.buffers.get('pyramidVertices'), 0, pyramidVertices);

            this.buffers.set('pyramidIndices', this.device.createBuffer({
                size: pyramidIndices.byteLength,
                usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
            }));
            this.device.queue.writeBuffer(this.buffers.get('pyramidIndices'), 0, pyramidIndices);

            // Orb as cube for simplicity
            this.buffers.set('orbVertices', this.buffers.get('cubeVertices'));
            this.buffers.set('orbIndices', this.buffers.get('cubeIndices'));
        }

        renderFloating(passEncoder) {
            const projection = mat4.create();
            mat4.ortho(projection, -1, 1, -1, 1, -1, 1);

            this.floatingElements.forEach(el => {
                const model = mat4.create();
                mat4.identity(model);
                mat4.translate(model, model, [el.position[0] * 2 - 1, 1 - el.position[1] * 2, el.position[2]]);
                mat4.rotateY(model, model, el.rotation);
                mat4.scale(model, model, [0.05, 0.05, 0.05]);

                const mvp = mat4.create();
                mat4.multiply(mvp, projection, model);

                const uniformData = new Float32Array([...mvp, ...el.color]);
                this.device.queue.writeBuffer(this.uniformBuffer, 0, uniformData);

                const bindGroup = this.device.createBindGroup({
                    layout: this.pipelines.get('floating').getBindGroupLayout(0),
                    entries: [{ binding: 0, resource: { buffer: this.uniformBuffer } }]
                });

                passEncoder.setPipeline(this.pipelines.get('floating'));
                passEncoder.setBindGroup(0, bindGroup);
                passEncoder.setVertexBuffer(0, this.buffers.get(el.type + 'Vertices'));
                passEncoder.setIndexBuffer(this.buffers.get(el.type + 'Indices'), 'uint16');
                passEncoder.drawIndexed(this.buffers.get(el.type + 'Indices').size / 2);
            });
        }

        /* ==================================================
           4. TILT SYSTEM — GPU-Accelerated Card Rendering
           ================================================== */

        async initTiltRenderer() {
            const vertexShaderCode = `
                struct Uniforms {
                    mvp: mat4x4<f32>;
                };
                struct VertexOutput {
                    [[builtin(position)]] position: vec4<f32>;
                    [[location(0)]] uv: vec2<f32>;
                };
                [[binding(0), group(0)]] var<uniform> uniforms: Uniforms;
                [[stage(vertex)]]
                fn main([[location(0)]] position: vec3<f32>, [[location(1)]] uv: vec2<f32>) -> VertexOutput {
                    var output: VertexOutput;
                    output.position = uniforms.mvp * vec4<f32>(position, 1.0);
                    output.uv = uv;
                    return output;
                }
            `;

            const fragmentShaderCode = `
                [[binding(1), group(0)]] var texture: texture_2d<f32>;
                [[binding(2), group(0)]] var sampler: sampler;
                [[stage(fragment)]]
                fn main([[location(0)]] uv: vec2<f32>) -> [[location(0)]] vec4<f32> {
                    return textureSample(texture, sampler, uv);
                }
            `;

            const vertexModule = this.device.createShaderModule({ code: vertexShaderCode });
            const fragmentModule = this.device.createShaderModule({ code: fragmentShaderCode });

            this.sampler = this.device.createSampler();

            const bindGroupLayout = this.device.createBindGroupLayout({
                entries: [
                    { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
                    { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: 'float' } },
                    { binding: 2, visibility: GPUShaderStage.FRAGMENT, sampler: { type: 'filtering' } }
                ]
            });

            const pipelineDescriptor = {
                layout: this.device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
                vertex: {
                    module: vertexModule,
                    entryPoint: 'main',
                    buffers: [{
                        arrayStride: 20, // 3 pos + 2 uv
                        attributes: [
                            { shaderLocation: 0, offset: 0, format: 'float32x3' },
                            { shaderLocation: 1, offset: 12, format: 'float32x2' }
                        ]
                    }]
                },
                fragment: {
                    module: fragmentModule,
                    entryPoint: 'main',
                    targets: [{ format: this.swapChainFormat }]
                },
                primitive: { topology: 'triangle-list' }
            };

            this.pipelines.set('tilt', this.device.createRenderPipeline(pipelineDescriptor));

            // Quad vertices (0-1 space)
            const quadVertices = new Float32Array([
                0, 0, 0, 0, 0,  // bottom-left
                1, 0, 0, 1, 0,  // bottom-right
                0, 1, 0, 0, 1,  // top-left
                1, 1, 0, 1, 1   // top-right
            ]);
            const quadIndices = new Uint16Array([0,1,2, 1,3,2]);

            this.buffers.set('quadVertices', this.device.createBuffer({
                size: quadVertices.byteLength,
                usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
            }));
            this.device.queue.writeBuffer(this.buffers.get('quadVertices'), 0, quadVertices);

            this.buffers.set('quadIndices', this.device.createBuffer({
                size: quadIndices.byteLength,
                usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
            }));
            this.device.queue.writeBuffer(this.buffers.get('quadIndices'), 0, quadIndices);

            this.tiltUniformBuffer = this.device.createBuffer({
                size: 64,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            });
        }

        addTiltCard(card, tiltX, tiltY, scale) {
            if (!this.supported) return;

            const img = card.querySelector('img');
            if (!img) return;

            const src = img.src;
            if (!this.textures.has(src)) {
                const image = new Image();
                image.crossOrigin = 'anonymous';
                image.onload = () => {
                    const texture = this.device.createTexture({
                        size: [image.width, image.height],
                        format: 'rgba8unorm',
                        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
                    });
                    this.device.queue.copyExternalImageToTexture({ source: image }, { texture }, [image.width, image.height]);
                    this.textures.set(src, texture);
                };
                image.src = src;
            }

            // Hide original card
            card.style.opacity = '0';

            // Find or add to tilting cards
            let tiltCard = this.tiltingCards.find(tc => tc.card === card);
            if (!tiltCard) {
                tiltCard = { card, tiltX: 0, tiltY: 0, scale: 1, texture: null, imgSrc: src };
                this.tiltingCards.push(tiltCard);
            }
            tiltCard.tiltX = tiltX;
            tiltCard.tiltY = tiltY;
            tiltCard.scale = scale;
            tiltCard.texture = this.textures.get(src);
        }

        renderTilt(passEncoder) {
            if (!this.tiltingCards.length) return;

            const projection = mat4.create();
            mat4.ortho(projection, -1, 1, -1, 1, -1, 1);

            this.tiltingCards.forEach(tiltCard => {
                if (!tiltCard.texture) return;

                const rect = tiltCard.card.getBoundingClientRect();
                const clipX = (rect.left / this.canvas.width) * 2 - 1;
                const clipY = 1 - (rect.top / this.canvas.height) * 2;
                const widthClip = (rect.width / this.canvas.width) * 2;
                const heightClip = (rect.height / this.canvas.height) * 2;

                const model = mat4.create();
                mat4.identity(model);
                mat4.translate(model, model, [clipX, clipY - heightClip, 0]);
                mat4.scale(model, model, [widthClip, heightClip, 1]);
                mat4.rotateX(model, model, tiltCard.tiltX * Math.PI / 180);
                mat4.rotateY(model, model, tiltCard.tiltY * Math.PI / 180);

                const mvp = mat4.create();
                mat4.multiply(mvp, projection, model);

                this.device.queue.writeBuffer(this.tiltUniformBuffer, 0, mvp);

                const bindGroup = this.device.createBindGroup({
                    layout: this.pipelines.get('tilt').getBindGroupLayout(0),
                    entries: [
                        { binding: 0, resource: { buffer: this.tiltUniformBuffer } },
                        { binding: 1, resource: tiltCard.texture.createView() },
                        { binding: 2, resource: this.sampler }
                    ]
                });

                passEncoder.setPipeline(this.pipelines.get('tilt'));
                passEncoder.setBindGroup(0, bindGroup);
                passEncoder.setVertexBuffer(0, this.buffers.get('quadVertices'));
                passEncoder.setIndexBuffer(this.buffers.get('quadIndices'), 'uint16');
                passEncoder.drawIndexed(6);
            });
        }

        /* ==================================================
           6. PARALLAX SYSTEM — GPU-Accelerated
           ================================================== */

        addParallaxElement(el, speed) {
            if (!this.supported) return;

            const computed = getComputedStyle(el);
            const bgImage = computed.backgroundImage;

            if (bgImage && bgImage !== 'none') {
                const url = bgImage.match(/url\(['"]?(.*?)['"]?\)/)?.[1];
                if (url) {
                    if (!this.textures.has(url)) {
                        const image = new Image();
                        image.crossOrigin = 'anonymous';
                        image.onload = () => {
                            const texture = this.device.createTexture({
                                size: [image.width, image.height],
                                format: 'rgba8unorm',
                                usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
                            });
                            this.device.queue.copyExternalImageToTexture({ source: image }, { texture }, [image.width, image.height]);
                            this.textures.set(url, texture);
                        };
                        image.src = url;
                    }

                    el.style.opacity = '0';
                    this.parallaxElements.push({ el, speed, texture: this.textures.get(url), url });
                }
            }
        }

        renderParallax(passEncoder) {
            if (!this.parallaxElements.length) return;

            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            const offsetX = (this.mouseX - centerX) / centerX;
            const offsetY = (this.mouseY - centerY) / centerY;

            this.parallaxElements.forEach(parallaxEl => {
                const rect = parallaxEl.el.getBoundingClientRect();
                const clipX = (rect.left / this.canvas.width) * 2 - 1;
                const clipY = 1 - (rect.top / this.canvas.height) * 2;
                const widthClip = (rect.width / this.canvas.width) * 2;
                const heightClip = (rect.height / this.canvas.height) * 2;

                const moveX = offsetX * 30 * parallaxEl.speed;
                const moveY = offsetY * 20 * parallaxEl.speed;
                const translateX = (moveX / this.canvas.width) * 2;
                const translateY = -(moveY / this.canvas.height) * 2;

                const model = mat4.create();
                mat4.identity(model);
                mat4.translate(model, model, [clipX + translateX, clipY - heightClip + translateY, 0]);
                mat4.scale(model, model, [widthClip, heightClip, 1]);

                const mvp = mat4.create();
                mat4.multiply(mvp, this.projection, model);

                this.device.queue.writeBuffer(this.tiltUniformBuffer, 0, mvp);

                if (parallaxEl.texture) {
                    const bindGroup = this.device.createBindGroup({
                        layout: this.pipelines.get('tilt').getBindGroupLayout(0),
                        entries: [
                            { binding: 0, resource: { buffer: this.tiltUniformBuffer } },
                            { binding: 1, resource: parallaxEl.texture.createView() },
                            { binding: 2, resource: this.sampler }
                        ]
                    });

                    passEncoder.setPipeline(this.pipelines.get('tilt'));
                    passEncoder.setBindGroup(0, bindGroup);
                    passEncoder.setVertexBuffer(0, this.buffers.get('quadVertices'));
                    passEncoder.setIndexBuffer(this.buffers.get('quadIndices'), 'uint16');
                    passEncoder.drawIndexed(6);
                }
            });
        }

        burst(x, y, count = 8) {
            if (!this.supported) return;

            const colors = [
                { r: 1.0, g: 0.09, b: 0.27, a: 1.0 },
                { r: 1.0, g: 0.18, b: 0.48, a: 1.0 },
                { r: 0.0, g: 0.9, b: 1.0, a: 1.0 },
                { r: 0.78, g: 1.0, b: 0.0, a: 1.0 },
                { r: 0.69, g: 0.25, b: 1.0, a: 1.0 }
            ];

            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 * i) / count;
                const velocity = 50 + Math.random() * 100;
                const vx = Math.cos(angle) * velocity;
                const vy = Math.sin(angle) * velocity;
                const color = colors[Math.floor(Math.random() * colors.length)];

                this.activeParticles.push({
                    id: this.particleId++,
                    x: x,
                    y: y,
                    vx: vx,
                    vy: vy,
                    life: 1.0,
                    size: 4 + Math.random() * 4,
                    color: color,
                    startTime: performance.now()
                });
            }
        }

        destroy() {
            if (this.canvas) {
                this.canvas.remove();
            }
        }
    }

    // Global WebGPU instance
    const webgpuEngine = new WebGPUEngine();

    // Expose for integration
    window.FOSWebGPU = webgpuEngine;

})();
