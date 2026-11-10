import React, { useState, useEffect, useRef } from 'react';
import {
  Wrench, Shield, Sparkles, Moon, Sun, RotateCcw, Compass,
  SlidersHorizontal, Image as ImageIcon, Rotate3d, CheckCircle2,
  Zap, Award, AlertCircle, Droplets
} from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { soundManager } from '../../utils/audio';
import {
  createStonewashedTitaniumTexture,
  createBrushedMetalTexture,
  createGroundShadow
} from '../../utils/threeTextures';

export default function PrybarSimulator({ product }) {
  // Simulation State
  const [activeAction, setActiveAction] = useState('pry'); // 'pry' | 'bottle' | 'hex' | 'stress'
  const [pryProgress, setPryProgress] = useState(45);
  const [capPopped, setCapPopped] = useState(false);
  const [hexBitInserted, setHexBitInserted] = useState(true);
  const [isNightMode, setIsNightMode] = useState(false);
  const [activeTab, setActiveTab] = useState('simulate'); // 'simulate' | 'photo'

  const containerRef = useRef(null);

  // Three.js References
  const prybarMasterRef = useRef(null);
  const bottleCapRef = useRef(null);
  const hexBitMeshRef = useRef(null);
  const tritiumLightRef = useRef(null);
  const ambientLightRef = useRef(null);
  const keyLightRef = useRef(null);
  const prybarMatRef = useRef(null);

  const itemPhoto = product?.image_url || "https://images.unsplash.com/photo-1588597575483-f4e43e191c94?auto=format&fit=crop&w=1200&q=90";

  // Trigger Bottle Cap Pop
  const handlePopBottle = () => {
    soundManager.playBottleCapPop();
    setCapPopped(true);
    setTimeout(() => {
      setCapPopped(false);
    }, 2500);
  };

  // Toggle Hex Bit
  const handleToggleHexBit = () => {
    soundManager.playFidlockSnap();
    setHexBitInserted(!hexBitInserted);
  };

  // Night Tritium Mode Toggle
  const handleToggleNight = () => {
    soundManager.playLaserBeep(1200);
    setIsNightMode(!isNightMode);
  };

  // Three.js Scene Setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 480;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isNightMode ? '#040608' : '#0B0D12');

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 5.0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isNightMode ? 0.8 : 1.6;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 2.0;
    controls.maxDistance = 8.0;

    // Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, isNightMode ? 0.15 : 1.4);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const keyLight = new THREE.DirectionalLight(0xffffff, isNightMode ? 0.3 : 3.4);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    const fillLight = new THREE.DirectionalLight(0x94A3B8, isNightMode ? 0.1 : 2.0);
    fillLight.position.set(-4, -1, 3);
    scene.add(fillLight);

    // Glowing Tritium Green PointLight
    const tritiumLight = new THREE.PointLight(0x10B981, isNightMode ? 4.5 : 1.2, 5.0);
    tritiumLight.position.set(0, 0.65, 0.25);
    scene.add(tritiumLight);
    tritiumLightRef.current = tritiumLight;

    // Ground Shadow
    const groundShadow = createGroundShadow();
    groundShadow.position.y = -1.8;
    groundShadow.scale.set(1.4, 1, 1.4);
    scene.add(groundShadow);

    // Master Group
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);
    prybarMasterRef.current = masterGroup;

    // =========================================================================
    // 1. SOLID 6MM TC4 TITANIUM BILLET GEOMETRY
    // =========================================================================
    const tiTex = createStonewashedTitaniumTexture();
    const tiMat = new THREE.MeshStandardMaterial({
      map: tiTex,
      roughness: 0.42,
      metalness: 0.88,
      color: 0x94A3B8
    });
    prybarMatRef.current = tiMat;

    // Main Titanium Shank (120mm length x 28mm width x 6mm thickness)
    const barWidth = 0.85;
    const barLength = 3.2;
    const barThickness = 0.18;

    const shankGeo = new THREE.BoxGeometry(barWidth, barLength, barThickness);
    const shankMesh = new THREE.Mesh(shankGeo, tiMat);
    masterGroup.add(shankMesh);

    // Chisel Pry Wedge Tip at the Bottom
    const wedgeGeo = new THREE.CylinderGeometry(barWidth * 0.48, barWidth * 0.52, 0.45, 4);
    wedgeGeo.rotateY(Math.PI / 4);
    const wedgeMat = new THREE.MeshStandardMaterial({
      map: createBrushedMetalTexture('#CBD5E1'),
      roughness: 0.25,
      metalness: 0.95,
      color: 0xE2E8F0
    });
    const wedgeMesh = new THREE.Mesh(wedgeGeo, wedgeMat);
    wedgeMesh.position.set(0, -(barLength * 0.5 + 0.18), 0);
    wedgeMesh.scale.set(1, 1, 0.45);
    masterGroup.add(wedgeMesh);

    // Nail Puller / Staple Lifter V-Notch
    const notchGeo = new THREE.ConeGeometry(0.14, 0.35, 3);
    notchGeo.rotateZ(Math.PI);
    const notchMat = new THREE.MeshBasicMaterial({ color: 0x090B10 });
    const notchMesh = new THREE.Mesh(notchGeo, notchMat);
    notchMesh.position.set(0, -(barLength * 0.5 + 0.28), 0);
    masterGroup.add(notchMesh);

    // =========================================================================
    // 2. INTEGRATED BOTTLE OPENER HOOK & CUTOUT
    // =========================================================================
    const hookCutoutGeo = new THREE.CylinderGeometry(0.24, 0.24, barThickness * 1.2, 24);
    hookCutoutGeo.rotateX(Math.PI / 2);
    const cutoutMat = new THREE.MeshBasicMaterial({ color: 0x090B10 });
    const hookCutout = new THREE.Mesh(hookCutoutGeo, cutoutMat);
    hookCutout.position.set(-barWidth * 0.42, -0.45, 0);
    masterGroup.add(hookCutout);

    // =========================================================================
    // 3. 1/4" HEX DRIVER SOCKET & REMOVABLE SCREWDRIVER BIT
    // =========================================================================
    const hexSocketGeo = new THREE.CylinderGeometry(0.18, 0.18, barThickness * 1.1, 6);
    hexSocketGeo.rotateX(Math.PI / 2);
    const hexSocket = new THREE.Mesh(hexSocketGeo, cutoutMat);
    hexSocket.position.set(0, -0.85, 0);
    masterGroup.add(hexSocket);

    // 1/4" Hex Bit (S2 Steel Titanium-Coated Phillips PH2 bit)
    const hexBitGroup = new THREE.Group();
    hexBitGroup.position.set(0, -0.85, 0);

    const bitGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.75, 6);
    bitGeo.rotateX(Math.PI / 2);
    const bitMat = new THREE.MeshStandardMaterial({
      color: 0xD97706, // Titanium Nitride Gold
      metalness: 0.95,
      roughness: 0.2
    });
    const bitMesh = new THREE.Mesh(bitGeo, bitMat);
    hexBitGroup.add(bitMesh);

    // Phillips cross tip
    const crossGeo = new THREE.BoxGeometry(0.08, 0.08, 0.25);
    const crossMesh = new THREE.Mesh(crossGeo, bitMat);
    crossMesh.position.z = 0.42;
    hexBitGroup.add(crossMesh);

    masterGroup.add(hexBitGroup);
    hexBitMeshRef.current = hexBitGroup;

    // =========================================================================
    // 4. GREEN TRITIUM GAS LOCATOR VIAL (25-YEAR GLOW)
    // =========================================================================
    const tritiumSlotGeo = new THREE.BoxGeometry(0.14, 0.65, barThickness * 0.9);
    const tritiumSlot = new THREE.Mesh(tritiumSlotGeo, cutoutMat);
    tritiumSlot.position.set(0, 0.65, 0);
    masterGroup.add(tritiumSlot);

    // Phosphorescent Borosilicate Glass Tritium Capsule
    const vialGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.55, 16);
    const vialMat = new THREE.MeshBasicMaterial({ color: 0x10B981 });
    const vialMesh = new THREE.Mesh(vialGeo, vialMat);
    vialMesh.position.set(0, 0.65, 0);
    masterGroup.add(vialMesh);

    // =========================================================================
    // 5. DEEP-CARRY TITANIUM POCKET CLIP & TORX T6 SCREWS
    // =========================================================================
    const clipGeo = new THREE.BoxGeometry(0.26, 1.4, 0.06);
    const clipMat = new THREE.MeshStandardMaterial({
      color: 0x64748B,
      metalness: 0.9,
      roughness: 0.3
    });
    const clipMesh = new THREE.Mesh(clipGeo, clipMat);
    clipMesh.position.set(0, 0.75, barThickness * 0.5 + 0.12);
    masterGroup.add(clipMesh);

    // Two Torx Screws
    [-1, 1].forEach(side => {
      const screwGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.04, 16);
      screwGeo.rotateX(Math.PI / 2);
      const screwMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, metalness: 0.9 });
      const screw = new THREE.Mesh(screwGeo, screwMat);
      screw.position.set(0, 1.25 + side * 0.12, barThickness * 0.5 + 0.14);
      masterGroup.add(screw);
    });

    // =========================================================================
    // 6. INTERACTIVE BOTTLE CAP (FOR BOTTLE POPPING SIMULATION)
    // =========================================================================
    const capGroup = new THREE.Group();
    capGroup.position.set(-barWidth * 0.42, -0.45, 0.25);

    const capCrownGeo = new THREE.CylinderGeometry(0.32, 0.35, 0.1, 24);
    const capMat = new THREE.MeshStandardMaterial({
      color: 0xEF4444, // Red Vintage Bottle Cap
      metalness: 0.85,
      roughness: 0.25
    });
    const capMesh = new THREE.Mesh(capCrownGeo, capMat);
    capMesh.rotateX(Math.PI / 2);
    capGroup.add(capMesh);

    masterGroup.add(capGroup);
    bottleCapRef.current = capGroup;

    // =========================================================================
    // 7. ANIMATION LOOP & SIMULATION PHYSICS
    // =========================================================================
    let clock = new THREE.Clock();
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Slow idle turntable rotation when not dragging
      masterGroup.rotation.y += 0.003;

      // Tritium Glow Breathing Pulse
      const glowIntensity = isNightMode ? 3.5 + Math.sin(elapsedTime * 3) * 0.8 : 1.2;
      if (tritiumLightRef.current) {
        tritiumLightRef.current.intensity = glowIntensity;
      }

      // Bottle Cap Pop Physics Animation
      if (bottleCapRef.current) {
        if (capPopped) {
          bottleCapRef.current.position.y += 0.04;
          bottleCapRef.current.position.x -= 0.03;
          bottleCapRef.current.rotation.z += 0.15;
          bottleCapRef.current.visible = true;
        } else {
          bottleCapRef.current.position.set(-barWidth * 0.42, -0.45, 0.25);
          bottleCapRef.current.rotation.set(0, 0, 0);
          bottleCapRef.current.visible = activeAction === 'bottle';
        }
      }

      // Hex Bit Visibility
      if (hexBitMeshRef.current) {
        hexBitMeshRef.current.visible = hexBitInserted;
      }

      // Fulcrum Prying Elastic Deflection
      if (activeAction === 'pry') {
        const deflectionAngle = ((pryProgress - 50) / 100) * 0.18;
        shankMesh.rotation.z = deflectionAngle;
        wedgeMesh.rotation.z = deflectionAngle;
      } else {
        shankMesh.rotation.z = 0;
        wedgeMesh.rotation.z = 0;
      }

      // Stress Heatmap Material Mode
      if (prybarMatRef.current) {
        if (activeAction === 'stress') {
          prybarMatRef.current.color.setHex(0x10B981); // Green resilient stress band
        } else {
          prybarMatRef.current.color.setHex(0x94A3B8);
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 480;
      const h = container.clientHeight || 360;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, [isNightMode, activeAction, pryProgress, capPopped, hexBitInserted]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      backgroundColor: '#11141B',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      overflow: 'hidden',
      color: '#FFFFFF'
    }}>
      {/* Simulation Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 20px',
        backgroundColor: '#181C26',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10B981',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <Wrench size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>
              AeroForge Grade 5 Titanium Multi-Tool Prybar
            </h3>
            <p style={{ fontSize: '11px', color: '#94A3B8', margin: '2px 0 0 0' }}>
              6mm TC4 Titanium Billet • Bottle Opener • 1/4" Hex Socket • Tritium Vial
            </p>
          </div>
        </div>

        {/* View Switcher: 3D Simulation vs Studio Photo */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setActiveTab('simulate')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTab === 'simulate' ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: activeTab === 'simulate' ? '#10B981' : 'transparent',
              color: activeTab === 'simulate' ? '#000000' : '#E2E8F0',
              transition: 'all 0.2s'
            }}
          >
            <Rotate3d size={14} /> 3D EDC SIMULATOR
          </button>
          <button
            onClick={() => setActiveTab('photo')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTab === 'photo' ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: activeTab === 'photo' ? '#10B981' : 'transparent',
              color: activeTab === 'photo' ? '#000000' : '#E2E8F0',
              transition: 'all 0.2s'
            }}
          >
            <ImageIcon size={14} /> STUDIO PHOTO
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      {activeTab === 'simulate' ? (
        <div style={{ position: 'relative', width: '100%', height: '380px' }}>
          <div ref={containerRef} style={{ width: '100%', height: '100%', outline: 'none' }} />

          {/* Floating Telemetry & Night Mode Button */}
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            pointerEvents: 'auto'
          }}>
            <button
              onClick={handleToggleNight}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '20px',
                backgroundColor: isNightMode ? '#10B981' : 'rgba(15, 23, 42, 0.85)',
                border: isNightMode ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.15)',
                color: isNightMode ? '#000000' : '#E2E8F0',
                backdropFilter: 'blur(8px)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {isNightMode ? <Sun size={13} /> : <Moon size={13} />}
              <span>{isNightMode ? 'TRITIUM GLOW ACTIVE' : 'TEST NIGHT TRITIUM GLOW'}</span>
            </button>

            {activeAction === 'pry' && (
              <div style={{
                padding: '6px 12px',
                borderRadius: '20px',
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                fontSize: '11px',
                fontWeight: 700,
                color: '#38BDF8',
                pointerEvents: 'none'
              }}>
                LEVERAGE TORQUE: {(pryProgress * 2.1).toFixed(0)} N·m
              </div>
            )}
          </div>

          {/* Bottom Hint */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '16px',
            fontSize: '11px',
            color: '#64748B',
            pointerEvents: 'none'
          }}>
            Drag to rotate 360° • Scroll to zoom • Select action below to test mechanical functions
          </div>
        </div>
      ) : (
        <div style={{
          width: '100%',
          height: '380px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0A0C10',
          padding: '24px'
        }}>
          <img
            src={itemPhoto}
            alt="AeroForge Titanium Prybar Studio Reference"
            style={{
              maxHeight: '100%',
              maxWidth: '100%',
              objectFit: 'contain',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
            }}
          />
        </div>
      )}

      {/* Interactive Tool Actions */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '0 20px 20px 20px'
      }}>
        {/* Action Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '8px'
        }}>
          {[
            { id: 'pry', label: 'FULCRUM PRY', icon: SlidersHorizontal },
            { id: 'bottle', label: 'BOTTLE OPENER', icon: Droplets },
            { id: 'hex', label: '1/4" HEX DRIVER', icon: Wrench },
            { id: 'stress', label: '500MPa STRESS FEA', icon: Shield }
          ].map(act => {
            const Icon = act.icon;
            const isSel = activeAction === act.id;
            return (
              <button
                key={act.id}
                onClick={() => {
                  soundManager.playRatchetClick();
                  setActiveAction(act.id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSel ? 'rgba(16, 185, 129, 0.2)' : '#161A23',
                  border: isSel ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: isSel ? '#10B981' : '#94A3B8',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={14} />
                {act.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Action Sub-Control Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          padding: '16px',
          backgroundColor: '#161A23',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {activeAction === 'pry' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
              <span style={{ fontSize: '12px', color: '#94A3B8', minWidth: '120px' }}>
                Leverage Load Force:
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={pryProgress}
                onChange={(e) => {
                  setPryProgress(Number(e.target.value));
                  if (Math.random() > 0.7) soundManager.playPryLeverCreak();
                }}
                style={{
                  flex: '1',
                  accentColor: '#10B981',
                  cursor: 'pointer'
                }}
              />
              <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'monospace', minWidth: '60px' }}>
                {(pryProgress * 2.1).toFixed(0)} N·m
              </span>
            </div>
          )}

          {activeAction === 'bottle' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>
                  Integrated CNC Bottle Cap Lifter
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                  Leverage fulcrum removes crown caps in one smooth motion without bending prybar
                </div>
              </div>
              <button
                onClick={handlePopBottle}
                style={{
                  padding: '8px 20px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Droplets size={15} />
                POP CROWN CAP
              </button>
            </div>
          )}

          {activeAction === 'hex' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>
                  1/4" Magnetic Hex Driver Socket
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                  Fits standard 1/4" driver bits with neodymium magnetic retention
                </div>
              </div>
              <button
                onClick={handleToggleHexBit}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: hexBitInserted ? 'rgba(217, 119, 6, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  color: hexBitInserted ? '#D97706' : '#FFFFFF',
                  border: hexBitInserted ? '1px solid #D97706' : '1px solid rgba(255, 255, 255, 0.2)',
                  fontWeight: 700,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Wrench size={14} />
                {hexBitInserted ? 'EJECT 1/4" BIT' : 'SNAP-IN 1/4" BIT'}
              </button>
            </div>
          )}

          {activeAction === 'stress' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} /> Grade 5 TC4 Titanium Finite Element Analysis (FEA)
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                  Yield Strength: 880 MPa • Applied Test Force: 500 MPa • 0.00% Plastic Deformation
                </div>
              </div>
              <div style={{
                padding: '6px 14px',
                borderRadius: '20px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10B981',
                color: '#10B981',
                fontSize: '11px',
                fontWeight: 700
              }}>
                STRUCTURALLY INDESTRUCTIBLE
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

