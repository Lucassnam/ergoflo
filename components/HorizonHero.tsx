'use client';

import React, { useEffect, useRef } from "react";
import * as THREE from 'three';
import Image from 'next/image';
import Reveal from './Reveal';
import { SHIP_WINDOW, PRICING } from '@/lib/site';
import ReserveButton from './ReserveButton';

export default function HorizonHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const threeRefs = useRef({
    scene: null as THREE.Scene | null,
    camera: null as THREE.PerspectiveCamera | null,
    renderer: null as THREE.WebGLRenderer | null,
    stars: [] as THREE.Points[],
    animationId: null as number | null,
  });

  useEffect(() => {
    if (!canvasRef.current) return;

    const refs = threeRefs.current;

    // Scene
    refs.scene = new THREE.Scene();

    // Camera
    refs.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    refs.camera.position.set(0, 0, 100);

    // Renderer - transparent background
    refs.renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    refs.renderer.setSize(window.innerWidth, window.innerHeight);
    refs.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create simple starfield (no gradients)
    const createStarField = () => {
      const starCount = 1500;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(starCount * 3);
      const colors = new Float32Array(starCount * 3);
      const sizes = new Float32Array(starCount);

      for (let j = 0; j < starCount; j++) {
        const radius = 300 + Math.random() * 600;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);

        positions[j * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[j * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[j * 3 + 2] = radius * Math.cos(phi);

        // Pure white and cyan only
        const isBlue = Math.random() < 0.15;
        if (isBlue) {
          colors[j * 3] = 0.2; // R
          colors[j * 3 + 1] = 0.8; // G
          colors[j * 3 + 2] = 1.0; // B (cyan)
        } else {
          colors[j * 3] = 0.9; // R
          colors[j * 3 + 1] = 0.9; // G
          colors[j * 3 + 2] = 0.9; // B (white)
        }

        sizes[j] = Math.random() * 1.5 + 0.5;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
        },
        vertexShader: `
          attribute float size;
          attribute vec3 color;
          varying vec3 vColor;
          uniform float time;

          void main() {
            vColor = color;
            vec3 pos = position;

            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * (200.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            float opacity = 1.0 - smoothstep(0.0, 0.5, dist);
            gl_FragColor = vec4(vColor, opacity * 0.6);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const stars = new THREE.Points(geometry, material);
      refs.scene!.add(stars);
      refs.stars.push(stars);
    };

    createStarField();

    // Animation loop
    const animate = () => {
      refs.animationId = requestAnimationFrame(animate);

      const time = Date.now() * 0.001;

      refs.stars.forEach((starField) => {
        if (starField.material instanceof THREE.ShaderMaterial) {
          starField.material.uniforms.time.value = time;
        }
      });

      // Subtle camera sway
      refs.camera!.position.x = Math.sin(time * 0.3) * 5;
      refs.camera!.position.y = Math.cos(time * 0.2) * 3;

      if (refs.renderer) {
        refs.renderer.render(refs.scene!, refs.camera!);
      }
    };

    animate();

    const handleResize = () => {
      if (refs.camera && refs.renderer) {
        refs.camera.aspect = window.innerWidth / window.innerHeight;
        refs.camera.updateProjectionMatrix();
        refs.renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (refs.animationId) cancelAnimationFrame(refs.animationId);

      refs.stars.forEach((star) => {
        star.geometry.dispose();
        (star.material as THREE.Material).dispose();
      });

      if (refs.renderer) {
        refs.renderer.dispose();
      }
    };
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      {/* Background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Content grid */}
      <div className="relative z-10 grid h-full grid-cols-1 md:grid-cols-2 items-center">
        {/* LEFT: Copy & Features */}
        <div className="px-8 sm:px-12 py-20 sm:py-0 flex flex-col justify-center">
          <Reveal>
            <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/[0.08] px-4 py-2 font-mono text-[11px] tracking-[0.16em] text-cyan uppercase w-fit">
              <span
                aria-hidden="true"
                className="inline-block h-1.5 w-1.5 rounded-full bg-cyan"
              />
              Available now · {SHIP_WINDOW}
            </p>
          </Reveal>

          <Reveal delay={0.06}>
            <h1 className="text-5xl sm:text-6xl leading-tight font-bold tracking-tight text-white mb-6">
              Stay cool on every adventure.
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="text-lg sm:text-xl text-gray-300 max-w-md mb-8 leading-relaxed">
              Active cooling for any backpack. Two brushless fans move air on purpose. No more sweat, no compromise.
            </p>
          </Reveal>

          {/* Quick features */}
          <Reveal delay={0.18}>
            <div className="space-y-4 mb-10">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan flex items-center justify-center">
                  <span className="text-black text-sm font-bold">✓</span>
                </div>
                <div>
                  <p className="text-white font-medium">25°F cooler</p>
                  <p className="text-gray-400 text-sm">Temperature drop at your back</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan flex items-center justify-center">
                  <span className="text-black text-sm font-bold">✓</span>
                </div>
                <div>
                  <p className="text-white font-medium">46 hours runtime</p>
                  <p className="text-gray-400 text-sm">Full week of commuting</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan flex items-center justify-center">
                  <span className="text-black text-sm font-bold">✓</span>
                </div>
                <div>
                  <p className="text-white font-medium">Near silent</p>
                  <p className="text-gray-400 text-sm">Only 26 dB at your shoulder</p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* CTA */}
          <Reveal delay={0.24}>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <ReserveButton size="lg">
                Reserve — ${PRICING.deposit} deposit
              </ReserveButton>
              <a
                href="#build"
                className="rounded-full px-6 py-4 text-[15px] text-gray-300 transition-colors hover:text-cyan font-medium"
              >
                Learn more →
              </a>
            </div>
            <p className="mt-6 font-mono text-[11px] tracking-[0.08em] text-gray-500 uppercase">
              ${PRICING.deposit} today · ${PRICING.total} total
            </p>
          </Reveal>
        </div>

        {/* RIGHT: Product Image with Blend */}
        <div className="relative h-full hidden md:flex items-center justify-center overflow-hidden">
          {/* Desaturated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-l from-black via-black/40 to-transparent opacity-60 z-20" />

          {/* Subtle desaturated color overlay */}
          <div
            className="absolute inset-0 z-10 mix-blend-multiply"
            style={{
              background:
                "linear-gradient(135deg, rgba(200,200,200,0.2) 0%, rgba(180,180,180,0.1) 50%, transparent 100%)",
            }}
          />

          <Image
            src="/product-hero.png"
            alt="ErgoFlow backpack"
            width={600}
            height={800}
            className="object-contain h-5/6 w-auto grayscale-[0.3] relative z-0"
            priority
          />
        </div>
      </div>
    </section>
  );
}
