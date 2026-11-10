import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Droplet, Sun, ShieldCheck, Thermometer, Battery, RotateCcw, Zap, SlidersHorizontal, Sparkles } from 'lucide-react';
import { soundManager } from '../../utils/audio';
import { createGroundShadow } from '../../utils/threeTextures';

export default function SmartBottleSimulator({ product }) {
  const [slidePurify, setSlidePurify] = useState(0); // 0% to 100%
  const [tempC, setTempC] = useState(24);
  const [xrayView, setXrayView] = useState(false);

  const mountRef = useRef(null);
  const uvBeamRef = useRef(null);
  const bodyMeshRef = useRef(null);
  const bubblesGroupRef = useRef(null);

  const isUvActive = slidePurify >= 70;

  // Handle continuous slider
  const handleSlideChange = (val) => {
    const progress = parseInt(val);
    setSlidePurify(progress);

    const targetTemp = Math.round(24 + (progress / 100) * 44);
    setTempC(targetTemp);

    if (uvBeamRef.current) {
      uvBeamRef.current.visible = progress >= 70;
      uvBeamRef.current.material.opacity = (progress / 100) * 0.75;
    }

    if (bubblesGroupRef.current) {
      bubblesGroupRef.current.visible = progress >= 70;
    }

    if (progress >= 70) {
      soundManager.playRfidScanSound();
    }
  };

  const handleQuickPurify = () => {
    if (slidePurify < 70) {
      handleSlideChange(100);
    } else {
      handleSlideChange(0);
    }
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
    camera.position.set(0, 1.2, 5.5);

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
    controls.minDistance = 2.5;
    controls.maxDistance = 10;

    // Lighting
    const ambientLight = new THREE.HemisphereLight('#FFFFFF', '#1F2937', 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight('#FFFFFF', 2.2);
    keyLight.position.set(4, 6, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.PointLight('#38BDF8', 2.0, 15);
    rimLight.position.set(-4, 3, -4);
    scene.add(rimLight);

    const groundShadow = createGroundShadow();
    groundShadow.position.y = -1.9;
    scene.add(groundShadow);

    // Build 3D Bottle Group
    const bottleGroup = new THREE.Group();
    bottleGroup.position.set(0, -0.3, 0);

    // 1. Powder-coated Stainless Steel Body
    const bodyGeo = new THREE.CylinderGeometry(0.85, 0.85, 2.6, 32);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: '#2F5A44', // Matte Emerald Green matching product
      roughness: 0.65,
      metalness: 0.18
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.castShadow = true;
    bodyMeshRef.current = bodyMesh;
    bottleGroup.add(bodyMesh);

    // 2. Curved Neck & Collar
    const neckGeo = new THREE.CylinderGeometry(0.48, 0.85, 0.5, 32);
    const neckMesh = new THREE.Mesh(neckGeo, bodyMat);
    neckMesh.position.y = 1.55;
    bottleGroup.add(neckMesh);

    // 3. Smart Cap with OLED Ring
    const capGroup = new THREE.Group();
    capGroup.position.set(0, 2.0, 0);

    const capGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.42, 32);
    const capMat = new THREE.MeshStandardMaterial({ color: '#1B3F2E', roughness: 0.4, metalness: 0.6 });
    const capMesh = new THREE.Mesh(capGeo, capMat);
    capGroup.add(capMesh);

    // Glowing OLED Ring on Cap
    const ringGeo = new THREE.TorusGeometry(0.42, 0.04, 16, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: '#38BDF8' });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0.22;
    capGroup.add(ringMesh);

    bottleGroup.add(capGroup);

    // 4. Internal UV-C Sterilization Light Beam (Visible when isUvActive)
    const uvGeo = new THREE.CylinderGeometry(0.35, 0.35, 2.4, 32);
    const uvMat = new THREE.MeshBasicMaterial({
      color: '#38BDF8',
      transparent: true,
      opacity: 0.0
    });
    const uvMesh = new THREE.Mesh(uvGeo, uvMat);
    uvMesh.visible = false;
    uvBeamRef.current = uvMesh;
    bottleGroup.add(uvMesh);

    // 5. Water Bubbles (Particle System inside bottle)
    const bubblesGroup = new THREE.Group();
    const bubbleGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const bubbleMat = new THREE.MeshBasicMaterial({ color: '#BAE6FD', transparent: true, opacity: 0.7 });
    for (let i = 0; i < 24; i++) {
      const b = new THREE.Mesh(bubbleGeo, bubbleMat);
      b.position.set((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 2.2, (Math.random() - 0.5) * 0.6);
      bubblesGroup.add(b);
    }
    bubblesGroup.visible = false;
    bubblesGroupRef.current = bubblesGroup;
    bottleGroup.add(bubblesGroup);

    scene.add(bottleGroup);

    // Render loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Animate bubbles floating upwards when UV-C is active
      if (bubblesGroup.visible) {
        bubblesGroup.children.forEach(b => {
          b.position.y += 0.02;
          if (b.position.y > 1.2) b.position.y = -1.2;
        });
      }

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
    };
  }, []);

  // Update body transparency when X-ray mode toggles
  useEffect(() => {
    if (!bodyMeshRef.current) return;
    if (xrayView) {
      bodyMeshRef.current.material.transparent = true;
      bodyMeshRef.current.material.opacity = 0.45;
    } else {
      bodyMeshRef.current.material.transparent = false;
      bodyMeshRef.current.material.opacity = 1.0;
    }
  }, [xrayView]);

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
            THREE.JS REALISTIC 3D HYDROSMART BOTTLE SIMULATOR
          </span>
          <span style={{ fontSize: '9px', fontWeight: 800, color: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
            POWDER-COATED PBR
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#FFFFFF', fontWeight: 800 }}>
          <span style={{ backgroundColor: '#1E293B', padding: '4px 10px', borderRadius: 'var(--radius-full)', border: '1px solid #334155' }}>
            OLED Temp: <strong style={{ color: tempC > 45 ? '#EF4444' : '#38BDF8' }}>{tempC}°C</strong>
          </span>
          <span style={{ backgroundColor: '#1E293B', padding: '4px 10px', borderRadius: 'var(--radius-full)', border: '1px solid #334155' }}>
            UV-C: <strong style={{ color: isUvActive ? '#10B981' : '#94A3B8' }}>{isUvActive ? 'ACTIVE (99.999%)' : 'STANDBY'}</strong>
          </span>
        </div>
      </div>

      {/* CONTINUOUS PURIFICATION & TEMP SLIDING MECHANISM BAR */}
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
            UV-C STERILIZATION & HEATING KINEMATIC SLIDER:
          </span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span>Purity: <strong style={{ color: isUvActive ? '#10B981' : '#38BDF8' }}>
              {isUvActive ? '99.999% Bio-Clean Sterilized' : 'Standard Filtered'}
            </strong></span>
            <span>•</span>
            <span style={{ color: '#38BDF8' }}>Tip: Drag 3D canvas to orbit 360°, scroll to zoom</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '10.5px', color: '#9CA3AF', fontWeight: 700 }}>24°C (COOL)</span>
          <input
            type="range"
            min="0"
            max="100"
            value={slidePurify}
            onChange={(e) => handleSlideChange(e.target.value)}
            style={{ flex: 1, height: '8px', accentColor: '#38BDF8', cursor: 'grab' }}
          />
          <span style={{ fontSize: '10.5px', color: '#9CA3AF', fontWeight: 700 }}>68°C (UV-C CYCLE)</span>

          <button
            onClick={handleQuickPurify}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: isUvActive ? '#10B981' : '#0284C7',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 900,
              cursor: 'pointer'
            }}
          >
            {isUvActive ? 'Reset Cycle' : 'Trigger UV-C Cycle'}
          </button>

          <button
            onClick={() => setXrayView(!xrayView)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: xrayView ? '#2563EB' : 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            {xrayView ? 'Solid Shell' : 'Translucent UV-C Beam View'}
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

        {/* 3D Controls Guide */}
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
      </div>
    </div>
  );
}
