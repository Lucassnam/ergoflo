'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Fan3DProps {
  speed?: number; // RPM-like speed, 0-1
}

export default function Fan3D({ speed = 0.7 }: Fan3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef({
    scene: null as THREE.Scene | null,
    camera: null as THREE.PerspectiveCamera | null,
    renderer: null as THREE.WebGLRenderer | null,
    fan: null as THREE.Group | null,
    animationId: null as number | null,
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const refs = sceneRef.current;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene
    refs.scene = new THREE.Scene();
    refs.scene.background = new THREE.Color(0xffffff);

    // Camera
    refs.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    refs.camera.position.z = 3;

    // Renderer
    refs.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    refs.renderer.setSize(width, height);
    refs.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    refs.renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(refs.renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    refs.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 7);
    directionalLight.castShadow = true;
    refs.scene.add(directionalLight);

    const rimLight = new THREE.DirectionalLight(0x4488ff, 0.3);
    rimLight.position.set(-5, 3, -5);
    refs.scene.add(rimLight);

    // Create fan group
    refs.fan = new THREE.Group();
    refs.scene.add(refs.fan);

    // Fan hub (center)
    const hubGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.15, 32);
    const hubMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.8,
      roughness: 0.2,
    });
    const hub = new THREE.Mesh(hubGeometry, hubMaterial);
    hub.castShadow = true;
    hub.receiveShadow = true;
    refs.fan.add(hub);

    // Blade resources are created per-blade, so collect them for disposal
    // rather than reaching into createBlade's scope from the cleanup.
    const disposables: Array<{ dispose: () => void }> = [
      hubGeometry,
      hubMaterial,
    ];

    // Create 3 fan blades
    const createBlade = (rotationZ: number) => {
      const group = new THREE.Group();

      // Blade shape
      const bladeGeometry = new THREE.PlaneGeometry(1.6, 0.5);
      const bladeMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.6,
        roughness: 0.3,
        side: THREE.DoubleSide,
      });
      const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
      blade.position.x = 0.8;
      blade.castShadow = true;
      blade.receiveShadow = true;
      blade.rotation.y = Math.PI * 0.05; // Slight twist
      group.add(blade);

      // Blade edge highlight
      const edgeGeometry = new THREE.PlaneGeometry(1.6, 0.02);
      const edgeMaterial = new THREE.MeshStandardMaterial({
        color: 0x555555,
        metalness: 0.9,
        roughness: 0.1,
      });
      const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
      edge.position.z = 0.251;
      edge.position.x = 0.8;
      group.add(edge);

      disposables.push(
        bladeGeometry,
        bladeMaterial,
        edgeGeometry,
        edgeMaterial
      );

      group.rotation.z = rotationZ;
      refs.fan!.add(group);
      return group;
    };

    createBlade(0);
    createBlade((Math.PI * 2) / 3);
    createBlade((Math.PI * 4) / 3);

    // Animation
    const animate = () => {
      refs.animationId = requestAnimationFrame(animate);

      if (refs.fan) {
        refs.fan.rotation.z += (speed * 0.15) / 60; // Smooth rotation
      }

      // Slight camera orbit for depth
      const time = Date.now() * 0.0005;
      refs.camera!.position.x = Math.sin(time) * 0.5;
      refs.camera!.position.y = Math.cos(time * 0.7) * 0.3;
      refs.camera!.lookAt(0, 0, 0);

      refs.renderer!.render(refs.scene!, refs.camera!);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      const newWidth = containerRef.current?.clientWidth || width;
      const newHeight = containerRef.current?.clientHeight || height;

      refs.camera!.aspect = newWidth / newHeight;
      refs.camera!.updateProjectionMatrix();
      refs.renderer!.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (refs.animationId) cancelAnimationFrame(refs.animationId);
      if (containerRef.current && refs.renderer) {
        containerRef.current.removeChild(refs.renderer.domElement);
      }
      for (const d of disposables) d.dispose();
      refs.renderer?.dispose();
    };
  }, [speed]);

  return (
    <div
      ref={containerRef}
      className="h-48 w-full rounded-lg bg-white"
    />
  );
}
