import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, RotateCcw, Moon, Sun, Shield, Eye, Award, SlidersHorizontal,
  Image as ImageIcon, Rotate3d, Compass, Watch, Clock, Sparkles, Zap
} from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { soundManager } from '../../utils/audio';
import {
  createBrushedMetalTexture,
  createKnurledTexture,
  createFieldWatchFaceTexture,
  createSolarChronoDialTexture,
  createDiverWatchFaceTexture,
  createTacticalStrapTexture,
  createAlligatorStrapTexture,
  createGroundShadow
} from '../../utils/threeTextures';

export default function WatchSimulator({ product }) {
  // Determine if default watch is Diver, Field Watch, or Solar Chronograph
  const defaultIsDiver = (product?.slug || '').includes('diver') ||
    (product?.name || '').toLowerCase().includes('diver') ||
    (product?.id === 19) || (product?.id === 20);

  const defaultIsField = !defaultIsDiver && ((product?.slug || '').includes('titanium') ||
    (product?.slug || '').includes('field') ||
    (product?.name || '').toLowerCase().includes('titanium') ||
    (product?.id === 5));

  const [watchType, setWatchType] = useState(defaultIsDiver ? 'diver' : defaultIsField ? 'field' : 'chrono');
  const [bezelAngle, setBezelAngle] = useState(45);
  const [powerReserve, setPowerReserve] = useState(84);
  const [isLumeMode, setIsLumeMode] = useState(false);
  const [chronoRunning, setChronoRunning] = useState(false);
  const [chronoTime, setChronoTime] = useState(0);
  const [diveDepth, setDiveDepth] = useState(60); // 0 to 300m depth test

  const canvasRef = useRef(null);

  // Three.js References
  const bezelMeshRef = useRef(null);
  const secondsHandRef = useRef(null);
  const minuteHandRef = useRef(null);
  const hourHandRef = useRef(null);
  const chronoSubHandRef = useRef(null);
  const lumeLightRef = useRef(null);
  const watchMasterRef = useRef(null);

  const itemPhoto = product?.image_url || (watchType === 'diver'
    ? "https://images.unsplash.com/photo-1519327567471-ae47752b8089?auto=format&fit=crop&w=1200&q=90"
    : watchType === 'field'
    ? "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=90"
    : "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=90");

  // Chronograph timer
  useEffect(() => {
    let interval;
    if (chronoRunning) {
      interval = setInterval(() => {
        setChronoTime(prev => prev + 10);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [chronoRunning]);

  // Three.js Scene Setup
  useEffect(() => {
    if (!canvasRef.current) return;
    const container = canvasRef.current;
    const width = container.clientWidth || 480;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0A0C10');

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.8, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.6;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 8.5;
    controls.minDistance = 2.2;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.4);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xE2E8F0, 2.2);
    fillLight.position.set(-4, -2, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x38BDF8, 2.0);
    rimLight.position.set(-3, 3, -4);
    scene.add(rimLight);

    // Phosphorescent SuperLuminova Glow PointLight
    const lumeLight = new THREE.PointLight(watchType === 'field' ? 0x38BDF8 : 0x10B981, 0, 4.0);
    lumeLight.position.set(0, 0, 0.6);
    scene.add(lumeLight);
    lumeLightRef.current = lumeLight;

    // Ground Shadow
    const groundShadow = createGroundShadow();
    groundShadow.position.y = -1.9;
    groundShadow.scale.set(1.4, 1, 1.4);
    scene.add(groundShadow);

    // Master Watch Group
    const watchGroup = new THREE.Group();
    scene.add(watchGroup);
    watchMasterRef.current = watchGroup;

    // =========================================================================
    // 1. WATCH CASE & MATERIAL DISTINCTION
    // =========================================================================
    const isDiver = watchType === 'diver';
    const isField = watchType === 'field';
    const isChrono = watchType === 'chrono';

    // Titanium Bead-Blasted vs Polished 316L Stainless Steel
    const caseMat = new THREE.MeshStandardMaterial({
      map: createBrushedMetalTexture((isField || isDiver) ? '#64748B' : '#F1F5F9'),
      roughness: (isField || isDiver) ? 0.45 : 0.15,
      metalness: (isField || isDiver) ? 0.85 : 0.95,
      color: (isField || isDiver) ? 0x64748B : 0xF8FAFC
    });

    const bezelKnurlMat = new THREE.MeshStandardMaterial({
      map: createKnurledTexture(),
      roughness: 0.25,
      metalness: 0.9,
      color: (isField || isDiver) ? 0x334155 : 0x0F172A
    });

    // 40mm vs 42mm Case Geometry
    const caseRadius = isField ? 1.42 : 1.52;
    const caseGeo = new THREE.CylinderGeometry(caseRadius, caseRadius * 0.96, isDiver ? 0.42 : 0.36, 48);
    caseGeo.rotateX(Math.PI / 2);
    const caseMesh = new THREE.Mesh(caseGeo, caseMat);
    watchGroup.add(caseMesh);

    // Watch Lugs (Top and Bottom strap horns)
    const lugWidth = isField ? 0.22 : 0.24;
    const lugLength = 0.72;
    for (let side of [-1, 1]) { // Top (1) and Bottom (-1)
      for (let lr of [-1, 1]) {
        const lugGeo = new THREE.BoxGeometry(lugWidth, lugLength, 0.32);
        const lug = new THREE.Mesh(lugGeo, caseMat);
        lug.position.set(lr * (caseRadius * 0.62), side * (caseRadius + 0.22), -0.06);
        lug.rotation.z = side * lr * -0.12;
        watchGroup.add(lug);
      }
    }

    // Screw-down Crown at 3 o'clock
    const crownGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.24, 24);
    crownGeo.rotateZ(Math.PI / 2);
    const crown = new THREE.Mesh(crownGeo, bezelKnurlMat);
    crown.position.set(caseRadius + 0.12, 0, 0);
    watchGroup.add(crown);

    // If Diver: Automatic Helium Escape Valve at 9 o'clock
    if (isDiver) {
      const heliumGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.16, 20);
      heliumGeo.rotateZ(Math.PI / 2);
      const heliumValve = new THREE.Mesh(heliumGeo, bezelKnurlMat);
      heliumValve.position.set(-(caseRadius + 0.08), 0, 0);
      watchGroup.add(heliumValve);
    }

    // If Chronograph: Dual Pushers at 2 o'clock and 4 o'clock
    if (isChrono) {
      const pusherGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.22, 20);
      pusherGeo.rotateZ(Math.PI / 2);

      const topPusher = new THREE.Mesh(pusherGeo, caseMat);
      topPusher.position.set(caseRadius * 0.94, caseRadius * 0.48, 0);
      topPusher.rotation.z = -0.48;
      watchGroup.add(topPusher);

      const bottomPusher = new THREE.Mesh(pusherGeo, caseMat);
      bottomPusher.position.set(caseRadius * 0.94, -caseRadius * 0.48, 0);
      bottomPusher.rotation.z = 0.48;
      watchGroup.add(bottomPusher);
    }

    // =========================================================================
    // 2. DIAL & BEZEL DISTINCTION
    // =========================================================================
    const dialTex = isDiver
      ? createDiverWatchFaceTexture()
      : isField
      ? createFieldWatchFaceTexture()
      : createSolarChronoDialTexture();

    const dialMat = new THREE.MeshStandardMaterial({
      map: dialTex,
      roughness: 0.35,
      metalness: 0.4
    });

    const dialGeo = new THREE.CircleGeometry(caseRadius * 0.78, 48);
    const dial = new THREE.Mesh(dialGeo, dialMat);
    dial.position.set(0, 0, 0.18);
    watchGroup.add(dial);

    // Bezel (Fixed Titanium vs Ceramic Tachymeter vs 120-Click Diver Bezel)
    const bezelRingGeo = new THREE.RingGeometry(caseRadius * 0.79, caseRadius * 0.98, 48);
    const bezelMat = new THREE.MeshStandardMaterial({
      color: isDiver ? 0x020617 : isField ? 0x475569 : 0x020617,
      roughness: isDiver ? 0.06 : isField ? 0.35 : 0.08,
      metalness: isDiver ? 0.3 : isField ? 0.85 : 0.4
    });
    const bezelRing = new THREE.Mesh(bezelRingGeo, bezelMat);
    bezelRing.position.set(0, 0, 0.2);

    // Luminescent Bezel Triangle pip at 12 o'clock
    const pipGeo = new THREE.CircleGeometry(0.06, 16);
    const pipMat = new THREE.MeshBasicMaterial({ color: (isDiver || isField) ? 0x38BDF8 : 0xEF4444 });
    const pip = new THREE.Mesh(pipGeo, pipMat);
    pip.position.set(0, caseRadius * 0.88, 0.01);
    bezelRing.add(pip);

    watchGroup.add(bezelRing);
    bezelMeshRef.current = bezelRing;

    // Sapphire Crystal Dome
    const glassGeo = new THREE.CylinderGeometry(caseRadius * 0.82, caseRadius * 0.82, 0.04, 48);
    glassGeo.rotateX(Math.PI / 2);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x38BDF8,
      roughness: 0.04,
      metalness: 0.1,
      transmission: 0.9,
      transparent: true,
      opacity: 0.35
    });
    const crystal = new THREE.Mesh(glassGeo, glassMat);
    crystal.position.set(0, 0, 0.28);
    watchGroup.add(crystal);

    // =========================================================================
    // 3. FULL 3D WATCH STRAPS (Tactical FKM / Diver Ribbed vs Stitched Alligator Leather)
    // =========================================================================
    const strapMat = new THREE.MeshStandardMaterial({
      map: (isField || isDiver) ? createTacticalStrapTexture('#1E293B') : createAlligatorStrapTexture('#592B08'),
      roughness: (isField || isDiver) ? 0.75 : 0.55,
      metalness: (isField || isDiver) ? 0.08 : 0.15,
      color: isDiver ? 0x1E293B : isField ? 0x334155 : 0x6E3D1F
    });

    const strapWidth = isField ? 1.05 : 1.15;
    const strapThickness = 0.14;

    // --- TOP STRAP (Curving upward and wrapping backward around wrist) ---
    const topStrapCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, caseRadius + 0.15, -0.05),
      new THREE.Vector3(0, caseRadius + 0.75, -0.12),
      new THREE.Vector3(0, caseRadius + 1.45, -0.45),
      new THREE.Vector3(0, caseRadius + 1.85, -0.95),
      new THREE.Vector3(0, caseRadius + 1.95, -1.55)
    ]);
    const topStrapGeo = new THREE.TubeGeometry(topStrapCurve, 32, strapThickness, 12, false);
    topStrapGeo.scale(strapWidth, 1, 1);
    const topStrap = new THREE.Mesh(topStrapGeo, strapMat);
    watchGroup.add(topStrap);

    // --- BOTTOM STRAP (Curving downward with buckle/holes) ---
    const bottomStrapCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -(caseRadius + 0.15), -0.05),
      new THREE.Vector3(0, -(caseRadius + 0.75), -0.12),
      new THREE.Vector3(0, -(caseRadius + 1.45), -0.45),
      new THREE.Vector3(0, -(caseRadius + 1.85), -0.95),
      new THREE.Vector3(0, -(caseRadius + 1.95), -1.55)
    ]);
    const bottomStrapGeo = new THREE.TubeGeometry(bottomStrapCurve, 32, strapThickness, 12, false);
    bottomStrapGeo.scale(strapWidth, 1, 1);
    const bottomStrap = new THREE.Mesh(bottomStrapGeo, strapMat);
    watchGroup.add(bottomStrap);

    // --- STRAP KEEPERS (Loops) on Top Strap ---
    const keeperGeo = new THREE.TorusGeometry(0.24, 0.05, 12, 24);
    keeperGeo.scale(strapWidth * 1.6, 1, 1.2);
    const keeper1 = new THREE.Mesh(keeperGeo, strapMat);
    keeper1.position.set(0, caseRadius + 0.65, -0.1);
    watchGroup.add(keeper1);

    const keeper2 = new THREE.Mesh(keeperGeo, strapMat);
    keeper2.position.set(0, caseRadius + 1.05, -0.22);
    watchGroup.add(keeper2);

    // --- METAL BUCKLE / DEPLOYANT CLASP ---
    const buckleMat = new THREE.MeshStandardMaterial({
      color: isField ? 0x94A3B8 : 0xF1F5F9,
      metalness: 0.95,
      roughness: isField ? 0.35 : 0.15
    });
    const buckleGeo = new THREE.BoxGeometry(strapWidth * 1.15, 0.18, 0.22);
    const buckle = new THREE.Mesh(buckleGeo, buckleMat);
    buckle.position.set(0, caseRadius + 1.8, -0.85);
    watchGroup.add(buckle);

    // Buckle Prong / Tang
    const prongGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.22, 12);
    const prong = new THREE.Mesh(prongGeo, buckleMat);
    prong.position.set(0, caseRadius + 1.8, -0.75);
    watchGroup.add(prong);

    // =========================================================================
    // 4. HANDS & LIVE ESCAPEMENT
    // =========================================================================
    const handsMat = new THREE.MeshStandardMaterial({
      color: isField ? 0xF8FAFC : 0xFFFFFF,
      metalness: isField ? 0.8 : 0.95,
      roughness: 0.15
    });

    // Hour Hand
    const hourGeo = new THREE.BoxGeometry(0.075, 0.52, 0.02);
    hourGeo.translate(0, 0.26, 0);
    const hourHand = new THREE.Mesh(hourGeo, handsMat);
    hourHand.position.set(0, 0, 0.22);
    hourHand.rotation.z = -1.1;
    watchGroup.add(hourHand);
    hourHandRef.current = hourHand;

    // Minute Hand
    const minGeo = new THREE.BoxGeometry(0.055, 0.82, 0.02);
    minGeo.translate(0, 0.41, 0);
    const minHand = new THREE.Mesh(minGeo, handsMat);
    minHand.position.set(0, 0, 0.23);
    minHand.rotation.z = -0.45;
    watchGroup.add(minHand);
    minuteHandRef.current = minHand;

    // Seconds Hand (Tactical Orange Needle for Field vs Crimson Chrono Needle)
    const secGroup = new THREE.Group();
    secGroup.position.set(0, 0, 0.25);

    const secGeo = new THREE.BoxGeometry(0.025, 1.0, 0.012);
    secGeo.translate(0, 0.42, 0);
    const secMat = new THREE.MeshBasicMaterial({ color: isField ? 0xF97316 : 0xEF4444 });
    const secMesh = new THREE.Mesh(secGeo, secMat);
    secGroup.add(secMesh);

    // Center jewel cap
    const capGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.03, 16);
    capGeo.rotateX(Math.PI / 2);
    const cap = new THREE.Mesh(capGeo, buckleMat);
    secGroup.add(cap);

    watchGroup.add(secGroup);
    secondsHandRef.current = secGroup;

    // Stage presentation tilt
    watchGroup.rotation.x = 0.22;
    watchGroup.rotation.y = -0.15;

    // Animation Loop with continuous fluid mechanical sweep
    let animId;
    let lastTime = performance.now();
    let currentSecAngle = 0;

    const animate = (currentTime) => {
      animId = requestAnimationFrame(animate);
      controls.update();

      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // 6 beats per second mechanical sweeping hand
      currentSecAngle -= delta * 0.5;
      if (secondsHandRef.current) {
        secondsHandRef.current.rotation.z = currentSecAngle;
      }

      renderer.render(scene, camera);
    };
    animate(performance.now());

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
  }, [watchType]);

  // Update Rotating Bezel in 3D WebGL
  useEffect(() => {
    if (bezelMeshRef.current) {
      bezelMeshRef.current.rotation.z = -(bezelAngle * Math.PI) / 180;
    }
  }, [bezelAngle]);

  // Update SuperLuminova Night Lume Mode
  useEffect(() => {
    if (lumeLightRef.current) {
      lumeLightRef.current.intensity = isLumeMode ? 4.5 : 0;
    }
  }, [isLumeMode]);

  const handleBezelSliderChange = (val) => {
    const num = parseInt(val, 10);
    setBezelAngle(num);
    if (watchType === 'diver') {
      soundManager.playDiverBezelClick();
    } else if (Math.abs(num - bezelAngle) >= 15) {
      soundManager.playRatchetClick();
    }
  };

  const handleWindCrown = () => {
    setPowerReserve(prev => Math.min(100, prev + 12));
    soundManager.playCrownWindSound();
  };

  const handleToggleLume = () => {
    setIsLumeMode(!isLumeMode);
    soundManager.play('pop');
  };

  const handleToggleChrono = () => {
    setChronoRunning(!chronoRunning);
    soundManager.play('click');
  };

  const handleResetChrono = () => {
    setChronoRunning(false);
    setChronoTime(0);
    soundManager.play('pop');
  };

  const formatChrono = (ms) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
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
          <div style={{ width: '32px', height: '32px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #38BDF8' }}>
            <img src={itemPhoto} alt={product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#FFFFFF' }}>
                {watchType === 'field' ? "Apex 40mm Titanium Field Watch" : "Chrono Eclipse Solar Tachymeter"}
              </span>
              <span style={{
                fontSize: '9px',
                fontWeight: 800,
                color: watchType === 'field' ? '#38BDF8' : '#D97706',
                backgroundColor: watchType === 'field' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(217, 119, 6, 0.15)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)'
              }}>
                {watchType === 'field' ? 'TITANIUM MILITARY FIELD' : 'SOLAR CERAMIC CHRONO'}
              </span>
            </div>
            <span style={{ fontSize: '10px', color: '#9CA3AF' }}>
              {watchType === 'field'
                ? 'Grade 5 Titanium • Arabic Military Dial • Ribbed Tactical FKM Rubber Strap'
                : '316L Polished Steel • Ceramic Tachymeter • Stitched Italian Alligator Leather Strap'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={handleWindCrown}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.18)',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Zap size={12} color="#F59E0B" />
            Wind Crown (+12h Reserve)
          </button>

          <button
            onClick={handleToggleLume}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: isLumeMode ? '#10B981' : 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.18)',
              color: isLumeMode ? '#022C22' : '#FFFFFF',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Moon size={12} />
            {isLumeMode ? 'Daylight Mode' : 'SuperLuminova Night Lume'}
          </button>
        </div>
      </div>

      {/* DIVER VS FIELD VS CHRONO MODEL SWITCHER */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        width: '100%',
        backgroundColor: '#11141C',
        padding: '6px',
        borderRadius: '12px',
        border: '1px solid #2B3245'
      }}>
        <button
          onClick={() => {
            setWatchType('diver');
            soundManager.playRatchetClick();
          }}
          style={{
            flex: 1,
            minWidth: '180px',
            padding: '10px 14px',
            borderRadius: '8px',
            border: watchType === 'diver' ? '1px solid #10B981' : 'none',
            backgroundColor: watchType === 'diver' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
            color: watchType === 'diver' ? '#10B981' : '#94A3B8',
            fontSize: '11.5px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Compass size={15} />
          <span>🌊 Abyss 300m Diver (120-Click Bezel & Helium Valve)</span>
        </button>

        <button
          onClick={() => {
            setWatchType('field');
            soundManager.playRatchetClick();
          }}
          style={{
            flex: 1,
            minWidth: '180px',
            padding: '10px 14px',
            borderRadius: '8px',
            border: watchType === 'field' ? '1px solid #38BDF8' : 'none',
            backgroundColor: watchType === 'field' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            color: watchType === 'field' ? '#38BDF8' : '#94A3B8',
            fontSize: '11.5px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Watch size={15} />
          <span>⏱️ Apex 40mm Field (Tactical FKM Strap)</span>
        </button>

        <button
          onClick={() => {
            setWatchType('chrono');
            soundManager.playRatchetClick();
          }}
          style={{
            flex: 1,
            minWidth: '180px',
            padding: '10px 14px',
            borderRadius: '8px',
            border: watchType === 'chrono' ? '1px solid #D97706' : 'none',
            backgroundColor: watchType === 'chrono' ? 'rgba(217, 119, 6, 0.15)' : 'transparent',
            color: watchType === 'chrono' ? '#F59E0B' : '#94A3B8',
            fontSize: '11.5px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Clock size={15} />
          <span>🏁 Chrono Eclipse Solar (Alligator Leather)</span>
        </button>
      </div>

      {/* ROTATING BEZEL & CHRONOGRAPH CONTROLS */}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SlidersHorizontal size={16} color={watchType === 'diver' ? '#10B981' : watchType === 'field' ? '#38BDF8' : '#D97706'} />
            <span style={{ fontSize: '12px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.04em' }}>
              {watchType === 'diver'
                ? '120-CLICK UNIDIRECTIONAL CERAMIC DIVE BEZEL (0 TO 60 MINS):'
                : watchType === 'field'
                ? 'TACTICAL ROTATING TIMING BEZEL (0° TO 360°):'
                : 'CERAMIC TACHYMETER VELOCITY SCALE & 1/10TH STOPWATCH:'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', color: '#9CA3AF' }}>
            <span>Bezel Offset: <strong style={{ color: watchType === 'diver' ? '#10B981' : watchType === 'field' ? '#38BDF8' : '#D97706' }}>{bezelAngle}° ({Math.floor(bezelAngle / 6)} min)</strong></span>
            <span>•</span>
            <span>Power Reserve: <strong style={{ color: '#10B981' }}>{powerReserve}h / 42h Max</strong></span>
          </div>
        </div>

        {/* Real-time Bezel Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '10.5px', color: '#9CA3AF', fontWeight: 700, width: '90px' }}>
            0° (12 O'CLOCK)
          </span>

          <input
            type="range"
            min="0"
            max="360"
            step={watchType === 'diver' ? 3 : 1}
            value={bezelAngle}
            onChange={(e) => handleBezelSliderChange(e.target.value)}
            style={{
              flex: 1,
              height: '8px',
              borderRadius: '4px',
              accentColor: watchType === 'diver' ? '#10B981' : watchType === 'field' ? '#38BDF8' : '#D97706',
              cursor: 'grab'
            }}
          />

          <span style={{ fontSize: '10.5px', color: '#9CA3AF', fontWeight: 700, width: '90px', textAlign: 'right' }}>
            360° (60 MINS)
          </span>
        </div>

        {/* Diver 300m Hydrostatic Depth Simulator */}
        {watchType === 'diver' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            paddingTop: '6px',
            borderTop: '1px solid rgba(255,255,255,0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={14} color="#10B981" />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#E2E8F0' }}>
                HYDROSTATIC DEPTH TEST:
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="300"
              value={diveDepth}
              onChange={(e) => {
                setDiveDepth(Number(e.target.value));
                if (Math.random() > 0.8) soundManager.playWaterSubmerge(true);
              }}
              style={{ flex: 1, accentColor: '#10B981', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 800, color: '#10B981', minWidth: '170px', textAlign: 'right' }}>
              🌊 {diveDepth}m • {(diveDepth / 10 + 1).toFixed(1)} ATM ({( (diveDepth / 10 + 1) * 14.696 ).toFixed(0)} PSI)
            </span>
          </div>
        )}

        {/* Chronograph Stopwatch Toolbar */}
        {watchType === 'chrono' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', paddingTop: '4px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={handleToggleChrono}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: chronoRunning ? '#EF4444' : '#10B981',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                {chronoRunning ? <Pause size={12} /> : <Play size={12} />}
                {chronoRunning ? 'Pause Stopwatch' : 'Start Chronograph'}
              </button>

              <button
                onClick={handleResetChrono}
                style={{
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  color: '#E2E8F0',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Reset
              </button>

              <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 900, color: '#38BDF8', marginLeft: '6px' }}>
                ⏱️ {formatChrono(chronoTime)}
              </span>
            </div>

            <div style={{ fontSize: '10.5px', color: '#9CA3AF' }}>
              Escapement: <strong style={{ color: '#F59E0B' }}>21,600 VPH (6 Beats/Sec Sweeping Seconds)</strong>
            </div>
          </div>
        )}
      </div>

      {/* MAIN SIMULATION VIEWPORT: PHOTO ON LEFT, THREE.JS 3D CANVAS ON RIGHT */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '740px',
        minHeight: '440px',
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
          height: '290px',
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
          height: '360px',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid #334155',
          backgroundColor: '#0A0C10',
          boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)'
        }}>
          <div ref={canvasRef} style={{ width: '100%', height: '100%' }} />

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
            <Rotate3d size={12} color={watchType === 'field' ? '#38BDF8' : '#D97706'} />
            <span>Drag to rotate 360° • Scroll to zoom</span>
          </div>

          {/* Watch Status Badge */}
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            border: `1px solid ${watchType === 'field' ? '#38BDF8' : '#D97706'}`,
            fontSize: '9.5px',
            fontWeight: 800,
            color: watchType === 'field' ? '#38BDF8' : '#F59E0B',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            pointerEvents: 'none'
          }}>
            <Watch size={12} />
            <span>{watchType === 'field' ? 'TITANIUM + FKM STRAP' : 'STEEL + ALLIGATOR STRAP'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
