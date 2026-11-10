import React, { useState, useEffect, useRef } from 'react';
import { Shield, Sparkles, Scissors, RotateCcw, AlertTriangle, Layers, SlidersHorizontal, Image as ImageIcon, Rotate3d, Compass } from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { soundManager } from '../../utils/audio';
import { createDamascusTexture, createBrushedMetalTexture, createGroundShadow } from '../../utils/threeTextures';

export default function MultiToolSimulator({ product }) {
  const [bladeAngle, setBladeAngle] = useState(65); // 0 deg (closed inside handle) to 155 deg (locked open)
  const [sliceTesting, setSliceTesting] = useState(false);
  const [sliceProgress, setSliceProgress] = useState(0);

  const prevAngleRef = useRef(65);
  const mountRef = useRef(null);
  const bladeGroupRef = useRef(null);

  const itemPhoto = product?.image_url || "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=1200&q=90";
  const isLocked = bladeAngle >= 140;

  // Sharpness Paracord Slicing Test
  const handleSharpnessTest = () => {
    if (sliceTesting) return;
    setSliceTesting(true);
    setSliceProgress(0);
    soundManager.playMechanicalClick(1800, 0.05);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 15;
      setSliceProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        soundManager.playLaserBeep(1600);
        setTimeout(() => setSliceTesting(false), 2000);
      }
    }, 150);
  };

  // Initialize Three.js 3D WebGL Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 480;
    const height = container.clientHeight || 360;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0A0C11');

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0.5, 2.2, 5.8);

    // 2. Renderer with High Exposure for Crystal-Clear Metal Reflections
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.6; // High exposure: No dark voids!
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 2.5;
    controls.maxDistance = 10;

    // 4. Studio Lighting (Crisp, High-Luminance Illumination)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    // Bright White Key Light
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.5);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);

    // Fill Light for Metallic Specular Glint
    const fillLight = new THREE.DirectionalLight(0xE2E8F0, 2.8);
    fillLight.position.set(-5, 4, 4);
    scene.add(fillLight);

    // Cyan Rim Light for Crisp Edge Silhouette
    const rimLight = new THREE.DirectionalLight(0x38BDF8, 2.2);
    rimLight.position.set(-4, -2, -5);
    scene.add(rimLight);

    // Top Down Diffuser
    const topLight = new THREE.DirectionalLight(0xffffff, 2.0);
    topLight.position.set(0, 7, 0);
    scene.add(topLight);

    // Ground Contact Shadow
    const groundShadow = createGroundShadow();
    groundShadow.position.y = -1.5;
    scene.add(groundShadow);

    // 5. Knife Master Assembly Group
    const knifeGroup = new THREE.Group();
    knifeGroup.position.set(0.4, 0, 0);
    scene.add(knifeGroup);

    // Textures
    const damascusTex = createDamascusTexture();
    const titaniumTex = createBrushedMetalTexture('#CBD5E1');

    // -------------------------------------------------------------------------
    // TITANIUM HANDLE SCALES & CHASSIS
    // -------------------------------------------------------------------------
    const handleMat = new THREE.MeshStandardMaterial({
      map: titaniumTex,
      color: 0x94A3B8, // Bright titanium silver
      metalness: 0.82,
      roughness: 0.28,
      bumpMap: titaniumTex,
      bumpScale: 0.02
    });

    // Top Scale
    const scaleGeo = new THREE.BoxGeometry(3.6, 0.82, 0.12);
    const topScale = new THREE.Mesh(scaleGeo, handleMat);
    topScale.position.set(1.4, 0, 0.12);
    knifeGroup.add(topScale);

    // Bottom Scale
    const bottomScale = new THREE.Mesh(scaleGeo, handleMat);
    bottomScale.position.set(1.4, 0, -0.12);
    knifeGroup.add(bottomScale);

    // Black G10 Backspacer
    const spacerGeo = new THREE.BoxGeometry(2.4, 0.72, 0.14);
    const spacerMat = new THREE.MeshStandardMaterial({ color: 0x1E242E, roughness: 0.7 });
    const backspacer = new THREE.Mesh(spacerGeo, spacerMat);
    backspacer.position.set(2.0, 0, 0);
    knifeGroup.add(backspacer);

    // Chamfered Speed Cutouts (Skeletonized handle weight reduction)
    for (let i = 0; i < 3; i++) {
      const holeGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.4, 16);
      holeGeo.rotateX(Math.PI / 2);
      const holeMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, metalness: 0.9, roughness: 0.2 });
      const hole = new THREE.Mesh(holeGeo, holeMat);
      hole.position.set(0.8 + i * 0.8, 0, 0);
      knifeGroup.add(hole);
    }

    // Torx T8 Pivot Screw (Gold Anodised Finish)
    const pivotGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.44, 32);
    pivotGeo.rotateX(Math.PI / 2);
    const pivotMat = new THREE.MeshStandardMaterial({ color: 0xD4AF37, metalness: 0.95, roughness: 0.18 });
    const pivotMesh = new THREE.Mesh(pivotGeo, pivotMat);
    pivotMesh.position.set(-0.2, 0, 0);
    knifeGroup.add(pivotMesh);

    // Torx Star indentation
    const torxStarGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.46, 6);
    torxStarGeo.rotateX(Math.PI / 2);
    const torxStarMat = new THREE.MeshStandardMaterial({ color: 0x1E293B });
    const torxStar = new THREE.Mesh(torxStarGeo, torxStarMat);
    torxStar.position.set(-0.2, 0, 0);
    knifeGroup.add(torxStar);

    // Deep-Carry Titanium Pocket Clip
    const clipGeo = new THREE.BoxGeometry(2.4, 0.22, 0.06);
    const clipMat = new THREE.MeshStandardMaterial({ color: 0x64748B, metalness: 0.9, roughness: 0.25 });
    const clipMesh = new THREE.Mesh(clipGeo, clipMat);
    clipMesh.position.set(1.7, -0.16, 0.21);
    knifeGroup.add(clipMesh);

    // -------------------------------------------------------------------------
    // DAMASCUS STEEL BLADE (Pivots at x = -0.2, y = 0)
    // -------------------------------------------------------------------------
    const bladeGroup = new THREE.Group();
    bladeGroup.position.set(-0.2, 0, 0);

    // Drop Point / Reverse Tanto Blade Shape
    const bladeShape = new THREE.Shape();
    bladeShape.moveTo(0, -0.22);
    bladeShape.lineTo(-2.9, -0.32); // Slicing cutting belly
    bladeShape.lineTo(-3.5, 0.08);  // Reinforced piercing tip
    bladeShape.lineTo(-2.6, 0.58);  // Top spine swedge
    bladeShape.lineTo(-0.2, 0.48);  // Spine jimpy ramps
    bladeShape.lineTo(0.2, 0.12);
    bladeShape.closePath();

    const extrudeSettings = {
      steps: 1,
      depth: 0.07,
      bevelEnabled: true,
      bevelThickness: 0.035,
      bevelSize: 0.035,
      bevelSegments: 3
    };

    const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, extrudeSettings);
    bladeGeo.center();
    bladeGeo.translate(-1.65, 0.06, 0); // Origin at pivot pin

    const bladeMat = new THREE.MeshStandardMaterial({
      map: damascusTex,
      color: 0xFFFFFF,
      metalness: 0.78, // High metalness with bright texture
      roughness: 0.24,
      bumpMap: damascusTex,
      bumpScale: 0.04
    });

    const bladeMesh = new THREE.Mesh(bladeGeo, bladeMat);
    bladeGroup.add(bladeMesh);

    // Razor-Polished Cutting Edge Bevel (Catches light brightly)
    const edgeGeo = new THREE.BoxGeometry(3.0, 0.05, 0.02);
    const edgeMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, metalness: 0.98, roughness: 0.08 });
    const edgeMesh = new THREE.Mesh(edgeGeo, edgeMat);
    edgeMesh.position.set(-1.65, -0.3, 0.04);
    bladeGroup.add(edgeMesh);

    // Double Brass Thumb Stud
    const studGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.22, 16);
    studGeo.rotateX(Math.PI / 2);
    const studMat = new THREE.MeshStandardMaterial({ color: 0xD4AF37, metalness: 0.95, roughness: 0.2 });
    const studMesh = new THREE.Mesh(studGeo, studMat);
    studMesh.position.set(-0.6, 0.28, 0);
    bladeGroup.add(studMesh);

    knifeGroup.add(bladeGroup);
    bladeGroupRef.current = bladeGroup;

    // Default angle for perspective showcase
    knifeGroup.rotation.x = 0.15;
    knifeGroup.rotation.y = -0.3;

    // Animation Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();

      // Gentle floating animation
      knifeGroup.position.y = Math.sin(Date.now() * 0.002) * 0.03;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Blade Angle in 3D WebGL based on continuous slider
  useEffect(() => {
    if (bladeGroupRef.current) {
      // Rotate around Z-axis: 0 deg (closed at 0 rad) to 155 deg (open at 2.7 rad)
      const rad = (bladeAngle * Math.PI) / 180;
      bladeGroupRef.current.rotation.z = -rad;
    }
  }, [bladeAngle]);

  // Handle continuous slider change
  const handleSliderChange = (val) => {
    const angle = parseInt(val);
    setBladeAngle(angle);

    const prev = prevAngleRef.current;
    if (prev < 140 && angle >= 140) {
      soundManager.playLinerLockClick();
    } else if (prev >= 140 && angle < 140) {
      soundManager.playMechanicalClick(1400, 0.02);
    }
    prevAngleRef.current = angle;
  };

  const handleToggleDeploy = () => {
    if (bladeAngle < 140) {
      soundManager.playBladeDeploy();
      setBladeAngle(155);
    } else {
      soundManager.playRetractSound();
      setBladeAngle(0);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
      width: '100%',
      fontFamily: 'var(--font-sans)'
    }}>
      {/* Header Match */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #C0A068' }}>
            <img src={itemPhoto} alt={product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#FFFFFF' }}>{product?.name || "VaultEx VG-10 Damascus Knife"}</span>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#C0A068', backgroundColor: 'rgba(192, 160, 104, 0.15)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                CRYSTAL-CLEAR 3D
              </span>
            </div>
            <span style={{ fontSize: '10px', color: '#9CA3AF' }}>67-Layer VG-10 Core (60-62 HRC) & Grade 5 TC4 Titanium Frame</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={handleSharpnessTest}
            disabled={sliceTesting || bladeAngle < 90}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: sliceTesting ? '#10B981' : 'rgba(255, 255, 255, 0.08)',
              border: sliceTesting ? '1px solid #34D399' : '1px solid rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 800,
              cursor: bladeAngle >= 90 ? 'pointer' : 'not-allowed',
              opacity: bladeAngle >= 90 ? 1 : 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Scissors size={12} />
            <span>{sliceTesting ? `Slicing Paracord (${sliceProgress}%)` : 'Paracord Sharpness Test'}</span>
          </button>

          <button
            onClick={handleToggleDeploy}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: isLocked ? '#10B981' : '#C0A068',
              border: 'none',
              color: '#111827',
              fontSize: '11px',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RotateCcw size={12} className={isLocked ? 'rotate-180 transition-transform' : ''} />
            <span>{isLocked ? 'Fold Blade' : 'Fast Flipper Snap'}</span>
          </button>
        </div>
      </div>

      {/* CONTINUOUS BLADE PIVOT SLIDING MECHANISM BAR */}
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
            CERAMIC BALL-BEARING PIVOT SLIDING MECHANISM:
          </span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span>Blade Angle: <strong style={{ color: '#C0A068' }}>{bladeAngle}° / 155°</strong></span>
            <span>•</span>
            <span>Liner Lock: <strong style={{ color: isLocked ? '#10B981' : '#F59E0B' }}>
              {isLocked ? 'Rigidly Engaged (Zero Play)' : 'Pivot Free-Floating'}
            </strong></span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '10.5px', color: '#9CA3AF', fontWeight: 700 }}>0° (CLOSED)</span>
          <input
            type="range"
            min="0"
            max="155"
            value={bladeAngle}
            onChange={(e) => handleSliderChange(e.target.value)}
            style={{
              flex: 1,
              height: '8px',
              borderRadius: '4px',
              accentColor: '#C0A068',
              cursor: 'grab'
            }}
          />
          <span style={{ fontSize: '10.5px', color: '#9CA3AF', fontWeight: 700 }}>155° (LOCK-BAR ENGAGED)</span>
        </div>
      </div>

      {/* MAIN SIMULATION VIEWPORT: PHOTO ON LEFT, THREE.JS 3D CANVAS ON RIGHT */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '740px',
        minHeight: '400px',
        backgroundColor: '#0F1218',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.85)',
        overflow: 'hidden',
        padding: '24px 20px'
      }}>
        {/* Studio Reference Card */}
        <div style={{
          width: '180px',
          height: '280px',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 16px 32px rgba(0,0,0,0.8)',
          position: 'relative',
          flexShrink: 0
        }}>
          <img src={itemPhoto} alt={product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
            padding: '8px 10px',
            fontSize: '9px',
            fontWeight: 800,
            color: '#FFFFFF'
          }}>
            STUDIO REFERENCE PHOTO
          </div>
        </div>

        {/* THREE.JS 3D WEBGL VIEWPORT */}
        <div style={{
          position: 'relative',
          flex: 1,
          height: '350px',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid #334155',
          backgroundColor: '#0A0C10',
          boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)'
        }}>
          <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

          {/* 3D OrbitControls pill overlay */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(255,255,255,0.15)',
            fontSize: '9.5px',
            color: '#94A3B8',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            pointerEvents: 'none'
          }}>
            <Rotate3d size={12} color="#C0A068" />
            <span>Drag to rotate 360° • Scroll to zoom</span>
          </div>

          {/* Liner Lock Status Badge */}
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: isLocked ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            border: isLocked ? '1px solid #10B981' : '1px solid #F59E0B',
            fontSize: '9.5px',
            fontWeight: 800,
            color: isLocked ? '#34D399' : '#FBBF24',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            pointerEvents: 'none'
          }}>
            <Shield size={12} />
            <span>{isLocked ? 'LINER LOCK 100% ENGAGED' : 'BLADE PIVOTING'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
