import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PenTool, Shield, Sparkles, Eye, RotateCcw, Award, Check, Layers, Zap, SlidersHorizontal } from 'lucide-react';
import { soundManager } from '../../utils/audio';
import { createBrushedMetalTexture, createGroundShadow } from '../../utils/threeTextures';

export default function PenSimulator({ product }) {
  const [boltProgress, setBoltProgress] = useState(0); // 0% (retracted) to 100% (locked)
  const [glassShattered, setGlassShattered] = useState(false);

  const mountRef = useRef(null);
  const boltMeshRef = useRef(null);
  const tipMeshRef = useRef(null);
  const prevProgressRef = useRef(0);

  const deployed = boltProgress >= 90;

  // Handle continuous bolt slider
  const handleBoltSliderChange = (val) => {
    const progress = parseInt(val);
    setBoltProgress(progress);

    if (boltMeshRef.current) {
      // Bolt slides forward along Z axis from -0.8 to -0.1, and rotates into J notch
      const zPos = -0.8 + (progress / 100) * 0.7;
      boltMeshRef.current.position.z = zPos;
      // Rotates into J-notch at the end
      if (progress > 80) {
        const rotX = ((progress - 80) / 20) * (Math.PI / 4);
        boltMeshRef.current.rotation.z = rotX;
      } else {
        boltMeshRef.current.rotation.z = 0;
      }
    }

    if (tipMeshRef.current) {
      // Tip projects out from nose cone
      const zTip = 2.45 + (progress / 100) * 0.45;
      tipMeshRef.current.position.z = zTip;
    }

    const prev = prevProgressRef.current;
    if (prev < 90 && progress >= 90) {
      soundManager.playBoltAction(true);
    } else if (prev >= 90 && progress < 90) {
      soundManager.playRetractSound();
    }
    prevProgressRef.current = progress;
  };

  const handleQuickToggleBolt = () => {
    if (boltProgress < 90) {
      handleBoltSliderChange(100);
    } else {
      handleBoltSliderChange(0);
    }
  };

  const handleGlassImpactTest = () => {
    soundManager.playGlassShatter();
    setGlassShattered(true);
    setTimeout(() => setGlassShattered(false), 2500);
  };

  // Initialize Three.js 3D WebGL Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 700;
    const height = 440;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0A0C11');

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(2.5, 2.5, 5.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 3;
    controls.maxDistance = 10;

    // Lighting
    const ambientLight = new THREE.HemisphereLight('#FFFFFF', '#1F2937', 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight('#FFFFFF', 2.2);
    keyLight.position.set(5, 7, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.PointLight('#38BDF8', 1.8, 15);
    rimLight.position.set(-5, 3, -5);
    scene.add(rimLight);

    const groundShadow = createGroundShadow();
    groundShadow.position.y = -1.5;
    scene.add(groundShadow);

    // Build 3D Pen Group
    const penGroup = new THREE.Group();
    // Rotate so it lays diagonally in space
    penGroup.rotation.x = Math.PI / 2;
    penGroup.rotation.z = Math.PI / 4;

    const titaniumTex = createBrushedMetalTexture('#64748B');

    // 1. Titanium Barrel Tube
    const barrelGeo = new THREE.CylinderGeometry(0.24, 0.24, 3.8, 32);
    const barrelMat = new THREE.MeshStandardMaterial({
      map: titaniumTex,
      metalness: 0.92,
      roughness: 0.22,
      bumpMap: titaniumTex,
      bumpScale: 0.02
    });
    const barrelMesh = new THREE.Mesh(barrelGeo, barrelMat);
    barrelMesh.castShadow = true;
    penGroup.add(barrelMesh);

    // 2. Nose Cone
    const coneGeo = new THREE.ConeGeometry(0.24, 0.8, 32);
    const coneMesh = new THREE.Mesh(coneGeo, barrelMat);
    coneMesh.position.y = 2.1;
    penGroup.add(coneMesh);

    // 3. Extending Pen Refill Tip (inside nose cone)
    const tipGeo = new THREE.ConeGeometry(0.06, 0.35, 16);
    const tipMat = new THREE.MeshStandardMaterial({ color: '#38BDF8', metalness: 0.95, roughness: 0.1 });
    const tipMesh = new THREE.Mesh(tipGeo, tipMat);
    tipMesh.position.y = 2.45; // starts slightly retracted inside
    tipMeshRef.current = tipMesh;
    penGroup.add(tipMesh);

    // 4. Sliding Bolt Assembly (Knob on side)
    const boltGroup = new THREE.Group();
    boltGroup.position.set(0.26, -0.6, 0); // initial retracted position

    const boltStemGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.2, 16);
    const boltKnobGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const goldMat = new THREE.MeshStandardMaterial({ color: '#D4AF37', metalness: 0.95, roughness: 0.18 });

    const stemMesh = new THREE.Mesh(boltStemGeo, goldMat);
    stemMesh.rotation.z = Math.PI / 2;
    boltGroup.add(stemMesh);

    const knobMesh = new THREE.Mesh(boltKnobGeo, goldMat);
    knobMesh.position.x = 0.14;
    boltGroup.add(knobMesh);

    boltMeshRef.current = boltGroup;
    penGroup.add(boltGroup);

    // 5. Pocket Clip
    const clipGeo = new THREE.BoxGeometry(0.08, 1.4, 0.06);
    const clipMesh = new THREE.Mesh(clipGeo, goldMat);
    clipMesh.position.set(0, -1.2, 0.3);
    penGroup.add(clipMesh);

    // 6. Tungsten Carbide Glass Breaker Tail Cap
    const tailGeo = new THREE.ConeGeometry(0.14, 0.3, 16);
    const tailMat = new THREE.MeshStandardMaterial({ color: '#E2E8F0', metalness: 0.99, roughness: 0.05 });
    const tailMesh = new THREE.Mesh(tailGeo, tailMat);
    tailMesh.rotation.x = Math.PI;
    tailMesh.position.y = -2.05;
    penGroup.add(tailMesh);

    scene.add(penGroup);

    // Render loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      titaniumTex.dispose();
    };
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '18px',
      width: '100%',
      fontFamily: 'var(--font-sans)'
    }}>
      {/* 3D Model Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        backgroundColor: '#161922',
        padding: '12px 18px',
        borderRadius: '12px',
        border: '1px solid #282E3E'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="#C0A068" />
          <span style={{ fontSize: '13px', fontWeight: 900, color: '#FFFFFF' }}>
            THREE.JS REALISTIC 3D BOLT-ACTION PEN SIMULATOR
          </span>
          <span style={{ fontSize: '9px', fontWeight: 800, color: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
            TC4 TITANIUM SHADER
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#9CA3AF' }}>
          <span>Refill: <strong style={{ color: '#C0A068' }}>Schmidt EasyFlow 9000M</strong></span>
          <span>•</span>
          <span>Tip: <strong style={{ color: deployed ? '#10B981' : '#F59E0B' }}>
            {deployed ? '2.5mm Tip Deployed & Rigid' : 'Retracted in Safe Guard'}
          </strong></span>
        </div>
      </div>

      {/* CONTINUOUS BOLT-ACTION SLIDING MECHANISM BAR */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        width: '100%',
        backgroundColor: '#181C26',
        padding: '14px 20px',
        borderRadius: '12px',
        border: '1px solid #2B3245'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: '#9CA3AF' }}>
          <span style={{ fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <SlidersHorizontal size={14} color="#C0A068" />
            BOLT-ACTION J-CHANNEL KINEMATIC SLIDER:
          </span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span>Bolt Slide: <strong style={{ color: '#C0A068' }}>{boltProgress}%</strong></span>
            <span>•</span>
            <span style={{ color: '#38BDF8' }}>Tip: Drag 3D canvas to orbit 360°, scroll to zoom</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '10.5px', color: '#9CA3AF', fontWeight: 700 }}>0% (SPRING RETRACT)</span>
          <input
            type="range"
            min="0"
            max="100"
            value={boltProgress}
            onChange={(e) => handleBoltSliderChange(e.target.value)}
            style={{ flex: 1, height: '8px', accentColor: '#C0A068', cursor: 'grab' }}
          />
          <span style={{ fontSize: '10.5px', color: '#9CA3AF', fontWeight: 700 }}>100% (J-LOCKED)</span>

          <button
            onClick={handleQuickToggleBolt}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: deployed ? '#10B981' : '#C0A068',
              border: 'none',
              color: deployed ? '#FFFFFF' : '#111215',
              fontSize: '11px',
              fontWeight: 900,
              cursor: 'pointer'
            }}
          >
            {deployed ? 'Spring Retract' : 'Bolt Deploy'}
          </button>

          <button
            onClick={handleGlassImpactTest}
            disabled={glassShattered}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #EF4444',
              color: '#FCA5A5',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Zap size={12} />
            Test Tungsten Breaker
          </button>
        </div>
      </div>

      {/* THREE.JS REALISTIC 3D VIEWPORT CONTAINER */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '740px',
        height: '440px',
        backgroundColor: '#0A0C11',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.14)',
        boxShadow: '0 30px 80px rgba(0,0,0,0.95)',
        overflow: 'hidden'
      }}>
        {/* Three.js Canvas Mount */}
        <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

        {/* Controls Guide */}
        <div style={{
          position: 'absolute',
          bottom: '14px',
          right: '16px',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid rgba(255,255,255,0.12)',
          fontSize: '10px',
          color: '#9CA3AF',
          pointerEvents: 'none'
        }}>
          Left Click + Drag: Orbit 360° | Scroll: Zoom | Right Click: Pan
        </div>

        {/* Glass Shatter Impact Banner */}
        {glassShattered && (
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            backgroundColor: 'rgba(239, 68, 68, 0.25)',
            border: '1px solid #EF4444',
            padding: '8px 16px',
            borderRadius: '8px',
            color: '#FCA5A5',
            fontSize: '11.5px',
            fontWeight: 800
          }}>
            92 HRA Tungsten Carbide Glass Breaker Fractured Tempered Glass!
          </div>
        )}
      </div>
    </div>
  );
}
