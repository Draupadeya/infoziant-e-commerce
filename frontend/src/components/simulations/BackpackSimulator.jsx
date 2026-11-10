import React, { useState, useEffect, useRef } from 'react';
import { Shield, Droplets, CloudRain, RotateCcw, Compass, SlidersHorizontal, Image as ImageIcon, Rotate3d, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { soundManager } from '../../utils/audio';
import { createRipstopTexture, createPinkHandbagTexture, createGroundShadow } from '../../utils/threeTextures';

export default function BackpackSimulator({ product }) {
  // Determine if this product is the Pink Handbag, Tactical Tech Sling, or Technical Backpack
  const isPinkHandbag = () => {
    const slug = (product?.slug || '').toLowerCase();
    const name = (product?.name || '').toLowerCase();
    const img = (product?.image_url || '').toLowerCase();
    return slug.includes('saffiano') || slug.includes('chevron') || (slug.includes('crossbody') && !slug.includes('apex')) || name.includes('saffiano') || name.includes('chevron') || img.includes('photo-1566150905458') || (product?.id === 12);
  };

  const isTechSling = () => {
    const slug = (product?.slug || '').toLowerCase();
    const name = (product?.name || '').toLowerCase();
    return (slug.includes('sling') || name.includes('sling') || slug.includes('apex-5l') || product?.id === 21) && !isPinkHandbag();
  };

  const isHandbag = isPinkHandbag();
  const isSling = isTechSling();

  // Continuous Mechanism Slider:
  // For Handbag: Flap Opening Angle (0% closed to 100% full 110° open flap)
  // For Tech Sling: Fidlock V-Buckle Release & AquaGuard Zip Slider (0% closed to 100% open)
  // For Backpack: Volume Expansion (0% 24L to 100% 34L roll-top)
  const [mechanismSlider, setMechanismSlider] = useState(isHandbag ? 0 : isSling ? 0 : 30);
  const [claspLocked, setClaspLocked] = useState(true);
  const [rainActive, setRainActive] = useState(false);

  const mountRef = useRef(null);
  const flapGroupRef = useRef(null);
  const rollTopMeshRef = useRef(null);
  const rainSystemRef = useRef(null);

  const itemPhoto = product?.image_url || "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1200&q=90";

  // Clasp Toggle
  const handleToggleClasp = () => {
    soundManager.playFidlockSnap();
    setClaspLocked(!claspLocked);
    if (claspLocked) {
      setMechanismSlider(100);
    } else {
      setMechanismSlider(0);
    }
  };

  // Initialize Three.js 3D WebGL Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 480;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0A0C11');

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 5.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.6;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 2.5;
    controls.maxDistance = 10;

    // Studio Lighting (Vivid, crisp 4-point illumination)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.4);
    keyLight.position.set(5, 7, 6);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xFFE4E6, 2.6);
    fillLight.position.set(-5, 4, 4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x38BDF8, 2.2);
    rimLight.position.set(-3, -2, -5);
    scene.add(rimLight);

    // Ground Contact Shadow
    const groundShadow = createGroundShadow();
    groundShadow.position.y = -1.5;
    scene.add(groundShadow);

    // Master Bag Group
    const bagGroup = new THREE.Group();
    bagGroup.position.set(0, -0.2, 0);
    scene.add(bagGroup);

    if (isHandbag) {
      // -----------------------------------------------------------------------
      // MODEL A: LUXURY PASTEL PINK LEATHER HANDBAG (100% PHOTO-MATCHED)
      // -----------------------------------------------------------------------
      const pinkLeatherTex = createPinkHandbagTexture();

      const pinkMat = new THREE.MeshStandardMaterial({
        map: pinkLeatherTex,
        roughness: 0.65,
        metalness: 0.08,
        color: 0xF4A6BA // Soft pastel rose pink
      });

      const silverChainMat = new THREE.MeshStandardMaterial({
        color: 0xE2E8F0,
        metalness: 0.95,
        roughness: 0.15
      });

      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xFDE047,
        metalness: 0.9,
        roughness: 0.2
      });

      // 1. Handbag Main Body (Rectangular structured clutch/shoulder silhouette)
      // Dimensions: w=2.6, h=1.5, d=0.85
      const bodyGeo = new THREE.BoxGeometry(2.6, 1.5, 0.85);
      const bodyMesh = new THREE.Mesh(bodyGeo, pinkMat);
      bodyMesh.position.set(0, 0, 0);
      bagGroup.add(bodyMesh);

      // Interior Gussets (Accordion side panels)
      for (let side of [-1, 1]) {
        const sideGussetGeo = new THREE.BoxGeometry(0.08, 1.4, 0.78);
        const sideMat = new THREE.MeshStandardMaterial({ color: 0xE598A8, roughness: 0.7 });
        const sideGusset = new THREE.Mesh(sideGussetGeo, sideMat);
        sideGusset.position.set(side * 1.31, 0, 0);
        bagGroup.add(sideGusset);
      }

      // 2. Front Fold-Over Flap Group (Pivoting at top-rear hinge)
      // Hinge at y = 0.75, z = -0.42
      const flapGroup = new THREE.Group();
      flapGroup.position.set(0, 0.75, -0.42);

      // Flap Plate extending forward and folding down over front
      // Top section
      const flapTopGeo = new THREE.BoxGeometry(2.64, 0.08, 0.9);
      flapTopGeo.translate(0, 0, 0.45);
      const flapTop = new THREE.Mesh(flapTopGeo, pinkMat);
      flapGroup.add(flapTop);

      // Front drape section with Chevron V-Stripes
      const flapFrontGeo = new THREE.BoxGeometry(2.64, 1.25, 0.08);
      flapFrontGeo.translate(0, -0.6, 0.88);
      const flapFront = new THREE.Mesh(flapFrontGeo, pinkMat);
      flapGroup.add(flapFront);

      // Polished Silver Magnetic Snap Clasp
      const claspGeo = new THREE.BoxGeometry(0.24, 0.24, 0.1);
      const claspMesh = new THREE.Mesh(claspGeo, silverChainMat);
      claspMesh.position.set(0, -1.15, 0.94);
      flapGroup.add(claspMesh);

      bagGroup.add(flapGroup);
      flapGroupRef.current = flapGroup;

      // 3. Silver Metal Chain Strap (Curving arch over top)
      // Grommets on top left and right
      for (let side of [-1, 1]) {
        const grommetGeo = new THREE.TorusGeometry(0.08, 0.03, 12, 24);
        grommetGeo.rotateX(Math.PI / 2);
        const grommet = new THREE.Mesh(grommetGeo, silverChainMat);
        grommet.position.set(side * 0.9, 0.76, 0);
        bagGroup.add(grommet);
      }

      // Silver Chain Links Path (Graceful drape loop over the bag)
      const chainCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.9, 0.76, 0),
        new THREE.Vector3(-0.95, 1.5, 0.1),
        new THREE.Vector3(0, 1.9, 0.2),
        new THREE.Vector3(0.95, 1.5, 0.1),
        new THREE.Vector3(0.9, 0.76, 0)
      ]);
      const chainGeo = new THREE.TubeGeometry(chainCurve, 40, 0.028, 8, false);
      const chainMesh = new THREE.Mesh(chainGeo, silverChainMat);
      bagGroup.add(chainMesh);

      // Hanging chain tail draping down right side (as in photo)
      const tailCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.9, 0.76, 0),
        new THREE.Vector3(1.1, 0.2, 0.1),
        new THREE.Vector3(1.25, -0.6, 0.25),
        new THREE.Vector3(1.35, -1.2, 0.35)
      ]);
      const tailGeo = new THREE.TubeGeometry(tailCurve, 30, 0.024, 8, false);
      const tailMesh = new THREE.Mesh(tailGeo, silverChainMat);
      bagGroup.add(tailMesh);

    } else if (isSling) {
      // -----------------------------------------------------------------------
      // MODEL C: TACTICAL APEX 5L CORDURA TECH SLING
      // -----------------------------------------------------------------------
      const corduraTex = createRipstopTexture('#1E293B');
      const slingMat = new THREE.MeshStandardMaterial({
        map: corduraTex,
        color: 0x1E232B,
        roughness: 0.75,
        metalness: 0.12,
        bumpMap: corduraTex,
        bumpScale: 0.03
      });

      const hardwareMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.85,
        roughness: 0.25
      });

      const fidlockMat = new THREE.MeshStandardMaterial({
        color: 0x0F172A,
        metalness: 0.9,
        roughness: 0.2
      });

      // 1. Aerodynamic Sling Bag Body
      const slingGeo = new THREE.BoxGeometry(2.5, 1.35, 0.75, 4, 4, 4);
      const slingMesh = new THREE.Mesh(slingGeo, slingMat);
      bagGroup.add(slingMesh);

      // Front EDC slash compartment
      const frontSlashGeo = new THREE.BoxGeometry(2.2, 0.85, 0.18);
      const frontSlash = new THREE.Mesh(frontSlashGeo, slingMat);
      frontSlash.position.set(0, -0.15, 0.42);
      bagGroup.add(frontSlash);

      // YKK AquaGuard Weatherproof Zipper Line
      const zipGeo = new THREE.BoxGeometry(2.1, 0.04, 0.03);
      const zipMat = new THREE.MeshBasicMaterial({ color: 0x10B981 }); // Waterproof green seam
      const zipMesh = new THREE.Mesh(zipGeo, zipMat);
      zipMesh.position.set(0, 0.28, 0.45);
      bagGroup.add(zipMesh);

      // German Fidlock Magnetic V-Buckle
      const fidlockGroup = new THREE.Group();
      fidlockGroup.position.set(0, -0.15, 0.54);

      const fidlockBase = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.28, 0.1), fidlockMat);
      fidlockGroup.add(fidlockBase);

      const fidlockPull = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.04), new THREE.MeshBasicMaterial({ color: 0xF59E0B }));
      fidlockPull.position.set(0, -0.16, 0.04);
      fidlockGroup.add(fidlockPull);

      bagGroup.add(fidlockGroup);

      // Diagonal Crossbody Webbing Strap
      const strapCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.3, 0.5, 0),
        new THREE.Vector3(-1.6, 1.2, -0.6),
        new THREE.Vector3(0, 1.8, -1.2),
        new THREE.Vector3(1.6, 0.8, -0.6),
        new THREE.Vector3(1.3, -0.5, 0)
      ]);
      const strapGeo = new THREE.TubeGeometry(strapCurve, 32, 0.09, 8, false);
      const strapMesh = new THREE.Mesh(strapGeo, new THREE.MeshStandardMaterial({ color: 0x090B10, roughness: 0.9 }));
      bagGroup.add(strapMesh);

      rollTopMeshRef.current = fidlockGroup;

    } else {
      // -----------------------------------------------------------------------
      // MODEL B: TECHNICAL WEATHERPROOF BACKPACK
      // -----------------------------------------------------------------------
      const ripstopTex = createRipstopTexture('#2C384A');
      const fabricMat = new THREE.MeshStandardMaterial({
        map: ripstopTex,
        color: 0x334155,
        roughness: 0.65,
        metalness: 0.15,
        bumpMap: ripstopTex,
        bumpScale: 0.04
      });

      const darkMat = new THREE.MeshStandardMaterial({ color: 0x1E2530, roughness: 0.8 });

      // Main Pack Body
      const bodyGeo = new THREE.BoxGeometry(2.1, 2.5, 1.35, 4, 4, 4);
      const bodyMesh = new THREE.Mesh(bodyGeo, fabricMat);
      bagGroup.add(bodyMesh);

      // Front Pocket with metal zipper
      const frontPocketGeo = new THREE.BoxGeometry(1.7, 1.25, 0.35);
      const frontPocket = new THREE.Mesh(frontPocketGeo, fabricMat);
      frontPocket.position.set(0, -0.45, 0.72);
      bagGroup.add(frontPocket);

      // Yellow Tag
      const tagGeo = new THREE.BoxGeometry(0.24, 0.22, 0.04);
      const tagMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, roughness: 0.4 });
      const tagMesh = new THREE.Mesh(tagGeo, tagMat);
      tagMesh.position.set(0, -0.25, 0.18);
      frontPocket.add(tagMesh);

      // Expandable Roll-Top Upper Closure
      const rollGroup = new THREE.Group();
      rollGroup.position.set(0, 1.25, 0);

      const rollGeo = new THREE.BoxGeometry(2.05, 0.8, 1.2);
      const rollMesh = new THREE.Mesh(rollGeo, fabricMat);
      rollMesh.position.set(0, 0.4, 0);
      rollGroup.add(rollMesh);

      bagGroup.add(rollGroup);
      rollTopMeshRef.current = rollGroup;
    }

    // Default angle for perspective showcase
    bagGroup.rotation.y = -0.25;
    bagGroup.rotation.x = 0.1;

    // Animation Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();

      // Gentle floating animation
      bagGroup.position.y = -0.2 + Math.sin(Date.now() * 0.0018) * 0.03;
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
  }, [isHandbag, isSling]);

  // Update Flap / Roll-Top based on continuous slider
  useEffect(() => {
    const factor = mechanismSlider / 100; // 0 to 1

    if (isHandbag && flapGroupRef.current) {
      // Flap pivots upward and backward: 0 rad (closed) to -1.9 rad (-110° full open)
      flapGroupRef.current.rotation.x = -factor * 1.9;
    } else if (!isHandbag && rollTopMeshRef.current) {
      const targetScaleY = THREE.MathUtils.lerp(0.85, 1.55, factor);
      rollTopMeshRef.current.scale.set(1, targetScaleY, 1);
      rollTopMeshRef.current.position.y = THREE.MathUtils.lerp(1.2, 1.45, factor);
    }
  }, [mechanismSlider, isHandbag, isSling]);

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
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#FFFFFF' }}>{product?.name || (isSling ? "Apex 5L Cordura Tech Sling" : "Nomad 30L Waterproof Backpack")}</span>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#C0A068', backgroundColor: 'rgba(192, 160, 104, 0.15)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                PHOTO-MATCHED 3D
              </span>
            </div>
            <span style={{ fontSize: '10px', color: '#9CA3AF' }}>
              {isHandbag ? 'Calfskin Leather, Chevron V-Stripes & Silver Link Chain Strap' : isSling ? 'Cordura 1000D, German Fidlock V-Buckle & YKK AquaGuard' : 'X-Pac VX21 Weatherproof Fabric'}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleToggleClasp}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: claspLocked ? '#10B981' : '#F59E0B',
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
          <Lock size={12} />
          <span>{claspLocked ? (isSling ? 'Fidlock V-Buckle Locked' : 'Magnetic Clasp Locked') : (isSling ? 'Fidlock Released' : 'Flap Unlocked & Open')}</span>
        </button>
      </div>

      {/* CONTINUOUS MECHANISM SLIDING BAR */}
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
            {isHandbag ? 'LEATHER FLAP OPENING CONTINUOUS SLIDING MECHANISM:' : isSling ? 'FIDLOCK V-BUCKLE & AQUAGUARD OPENING MECHANISM:' : 'VOLUME EXPANSION SLIDING MECHANISM:'}
          </span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span>Flap Angle: <strong style={{ color: '#C0A068' }}>{Math.round((mechanismSlider / 100) * 110)}°</strong></span>
            <span>•</span>
            <span>Interior Access: <strong style={{ color: mechanismSlider > 40 ? '#10B981' : '#F59E0B' }}>
              {mechanismSlider > 40 ? 'Main Compartment Unveiled' : 'Magnetic Sealed'}
            </strong></span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '10.5px', color: '#9CA3AF', fontWeight: 700 }}>0° (SEALED FLAP)</span>
          <input
            type="range"
            min="0"
            max="100"
            value={mechanismSlider}
            onChange={(e) => {
              setMechanismSlider(parseInt(e.target.value));
              soundManager.playMechanicalClick(1300 + e.target.value * 4, 0.02);
            }}
            style={{
              flex: 1,
              height: '8px',
              borderRadius: '4px',
              accentColor: '#C0A068',
              cursor: 'grab'
            }}
          />
          <span style={{ fontSize: '10.5px', color: '#9CA3AF', fontWeight: 700 }}>110° (FULL OPEN)</span>
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

          {/* Handbag Status Badge */}
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: 'rgba(244, 114, 182, 0.2)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid #F472B6',
            fontSize: '9.5px',
            fontWeight: 800,
            color: '#FBCFE8',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            pointerEvents: 'none'
          }}>
            <Sparkles size={12} />
            <span>{isHandbag ? 'PASTEL PINK CHEVRON LEATHER' : 'X-PAC VX21 WEAVE'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
