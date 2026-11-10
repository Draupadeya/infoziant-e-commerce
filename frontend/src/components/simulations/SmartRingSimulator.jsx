import React, { useState, useEffect, useRef } from 'react';
import { Activity, Heart, Thermometer, Battery, Shield, Zap, Sparkles, SlidersHorizontal, Image as ImageIcon, Rotate3d } from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { soundManager } from '../../utils/audio';
import { createBrushedMetalTexture, createGroundShadow } from '../../utils/threeTextures';

export default function SmartRingSimulator({ product }) {
  const [dockProgress, setDockProgress] = useState(20); // 0% (free biometric monitoring) to 100% (docked)
  const [heartRate, setHeartRate] = useState(72);
  const [spo2, setSpo2] = useState(99);
  const [temp, setTemp] = useState(36.6);
  const [hrv, setHrv] = useState(68); // ms
  const [ecgPhase, setEcgPhase] = useState(0);

  const prevDockRef = useRef(20);
  const canvasRef = useRef(null);

  // Three.js References
  const ringGroupRef = useRef(null);
  const ppgLightRef = useRef(null);
  const dockRingMatRef = useRef(null);

  const itemPhoto = product?.image_url || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=90";
  const isDocked = dockProgress >= 90;

  // Real-time ECG rhythm sweep animation
  useEffect(() => {
    let anim;
    const tick = () => {
      setEcgPhase(prev => (prev + 1) % 100);
      anim = requestAnimationFrame(tick);
    };
    anim = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(anim);
  }, []);

  // Simulated live cardiac fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setHeartRate(prev => 70 + Math.floor(Math.random() * 5));
      setHrv(prev => 64 + Math.floor(Math.random() * 8));
      soundManager.playLaserBeep(1200);
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  // Three.js Scene Setup
  useEffect(() => {
    if (!canvasRef.current) return;
    const container = canvasRef.current;
    const width = container.clientWidth || 480;
    const height = container.clientHeight || 340;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0A0C10');

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.4, 4.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 8;
    controls.minDistance = 2;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xC0A068, 1.6);
    rimLight.position.set(-3, -2, -3);
    scene.add(rimLight);

    // Green Optical PPG Biometric Pulsing Light
    const ppgLight = new THREE.PointLight(0x10B981, 3.5, 4);
    ppgLight.position.set(0, 0, 0);
    scene.add(ppgLight);
    ppgLightRef.current = ppgLight;

    // Ground Shadow
    const groundShadow = createGroundShadow();
    groundShadow.position.y = -1.2;
    scene.add(groundShadow);

    // Main Stage Assembly
    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    // 1. Magnetic Wireless Charging Puck Dock Base
    const dockGroup = new THREE.Group();
    dockGroup.position.set(0, -0.75, 0);

    const dockChassisMat = new THREE.MeshStandardMaterial({
      map: createBrushedMetalTexture('#374151'),
      roughness: 0.35,
      metalness: 0.85,
      color: 0x1E232B
    });
    const dockGeo = new THREE.CylinderGeometry(1.2, 1.25, 0.22, 36);
    const dockMesh = new THREE.Mesh(dockGeo, dockChassisMat);
    dockGroup.add(dockMesh);

    // Dock Center Post / Puck
    const postGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.45, 36);
    const postMesh = new THREE.Mesh(postGeo, dockChassisMat);
    postMesh.position.set(0, 0.2, 0);
    dockGroup.add(postMesh);

    // Dock Inductive Charging Ring
    const dockRingGeo = new THREE.RingGeometry(0.76, 0.88, 36);
    dockRingGeo.rotateX(-Math.PI / 2);
    const dockRingMat = new THREE.MeshBasicMaterial({ color: 0xC0A068, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
    const dockRing = new THREE.Mesh(dockRingGeo, dockRingMat);
    dockRing.position.set(0, 0.12, 0);
    dockGroup.add(dockRing);
    dockRingMatRef.current = dockRingMat;

    stageGroup.add(dockGroup);

    // 2. 3D Smart Ring Band
    const ringGroup = new THREE.Group();
    ringGroup.position.set(0, 0.5, 0); // initial floating position

    // Outer Titanium Band
    const ringMat = new THREE.MeshStandardMaterial({
      map: createBrushedMetalTexture('#E2E8F0'),
      roughness: 0.25,
      metalness: 0.9,
      color: 0xD1D5DB
    });

    // Torus / Ring Band geometry: radius = 0.85, tube radius = 0.16
    const ringGeo = new THREE.TorusGeometry(0.85, 0.16, 24, 48);
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringGroup.add(ringMesh);

    // Inner Medical Epoxy Resin Layer
    const innerResinMat = new THREE.MeshStandardMaterial({
      color: 0x0A0D12,
      roughness: 0.1,
      metalness: 0.5
    });
    const resinGeo = new THREE.CylinderGeometry(0.74, 0.74, 0.26, 40, 1, true);
    const resinMesh = new THREE.Mesh(resinGeo, innerResinMat);
    ringGroup.add(resinMesh);

    // Dual Optical PPG Sensor Beads (Green LEDs inside)
    for (let angle of [0.4, -0.4]) {
      const beadGeo = new THREE.SphereGeometry(0.05, 12, 12);
      const beadMat = new THREE.MeshBasicMaterial({ color: 0x10B981 });
      const bead = new THREE.Mesh(beadGeo, beadMat);
      bead.position.set(Math.sin(angle) * 0.73, 0, Math.cos(angle) * 0.73);
      ringGroup.add(bead);
    }

    stageGroup.add(ringGroup);
    ringGroupRef.current = ringGroup;

    // Stage rotation
    stageGroup.rotation.x = 0.25;
    stageGroup.rotation.y = -0.3;

    // Animation Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();

      // Optical PPG heartbeat pulse
      if (ppgLightRef.current) {
        ppgLightRef.current.intensity = 2.0 + Math.sin(Date.now() * 0.007) * 1.5;
      }

      // Subtle float when not docked
      if (ringGroupRef.current && dockProgress < 90) {
        ringGroupRef.current.position.y = 0.5 + Math.sin(Date.now() * 0.002) * 0.04;
      }

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

  // Update Ring Position based on continuous docking slider
  useEffect(() => {
    const factor = dockProgress / 100; // 0 (floating worn) to 1 (docked on post)

    if (ringGroupRef.current) {
      // Y-axis translation: from 0.5 down to -0.55 (settled on dock post)
      ringGroupRef.current.position.y = THREE.MathUtils.lerp(0.5, -0.55, factor);
    }

    if (dockRingMatRef.current) {
      if (dockProgress >= 90) {
        dockRingMatRef.current.opacity = 0.95;
        dockRingMatRef.current.color.setHex(0x10B981);
      } else {
        dockRingMatRef.current.opacity = THREE.MathUtils.lerp(0.15, 0.5, factor);
        dockRingMatRef.current.color.setHex(0xC0A068);
      }
    }
  }, [dockProgress]);

  // Handle continuous docking slider
  const handleDockSliderChange = (val) => {
    const progress = parseInt(val);
    setDockProgress(progress);

    const prev = prevDockRef.current;
    if (prev < 90 && progress >= 90) {
      soundManager.playHapticSnap();
      soundManager.playRfidScanSound();
    } else if (prev >= 90 && progress < 90) {
      soundManager.playRetractSound();
    }
    prevDockRef.current = progress;
  };

  const handleToggleDock = () => {
    if (dockProgress < 90) {
      soundManager.playHapticSnap();
      soundManager.playRfidScanSound();
      setDockProgress(100);
    } else {
      soundManager.playRetractSound();
      setDockProgress(0);
    }
  };

  // Generate realistic SVG ECG waveform path with P-Q-R-S-T cardiac cycle
  const generateEcgPath = () => {
    let d = "M 0 35 ";
    for (let x = 0; x <= 320; x += 4) {
      const cycle = ((x + ecgPhase * 3.2) % 120);
      let y = 35;
      if (cycle > 30 && cycle < 42) {
        // P-wave
        y = 35 - Math.sin((cycle - 30) / 12 * Math.PI) * 7;
      } else if (cycle >= 48 && cycle < 52) {
        // Q-drop
        y = 39;
      } else if (cycle >= 52 && cycle <= 60) {
        // R-spike
        y = 35 - 32 * Math.sin((cycle - 52) / 8 * Math.PI);
      } else if (cycle > 60 && cycle <= 65) {
        // S-drop
        y = 42;
      } else if (cycle > 74 && cycle < 95) {
        // T-wave
        y = 35 - Math.sin((cycle - 74) / 21 * Math.PI) * 11;
      }
      d += `L ${x} ${y} `;
    }
    return d;
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
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#FFFFFF' }}>{product?.name || "OmniRing Titanium Biometric"}</span>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#C0A068', backgroundColor: 'rgba(192, 160, 104, 0.15)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                THREE.JS 3D PBR
              </span>
            </div>
            <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Medical-Grade Optical PPG Sensor & Grade 5 Titanium Band</span>
          </div>
        </div>

        <button
          onClick={handleToggleDock}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: isDocked ? '#10B981' : 'rgba(255, 255, 255, 0.1)',
            border: isDocked ? '1px solid #34D399' : '1px solid rgba(255, 255, 255, 0.2)',
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Zap size={12} />
          {isDocked ? 'Docked & Qi Recharging' : 'Dock on Magnetic Charger'}
        </button>
      </div>

      {/* CONTINUOUS DOCKING SLIDING MECHANISM BAR */}
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
            RING POSITION & DOCKING SLIDING MECHANISM:
          </span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span>Position: <strong style={{ color: '#C0A068' }}>{dockProgress}%</strong></span>
            <span>•</span>
            <span>Sensor Status: <strong style={{ color: isDocked ? '#38BDF8' : '#10B981' }}>
              {isDocked ? 'Fast Wireless Recharging' : 'Live Arterial Pulse Active'}
            </strong></span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '10.5px', color: '#9CA3AF', fontWeight: 700 }}>0% (WORN/FLOAT)</span>
          <input
            type="range"
            min="0"
            max="100"
            value={dockProgress}
            onChange={(e) => handleDockSliderChange(e.target.value)}
            style={{
              flex: 1,
              height: '8px',
              borderRadius: '4px',
              accentColor: '#C0A068',
              cursor: 'grab'
            }}
          />
          <span style={{ fontSize: '10.5px', color: '#9CA3AF', fontWeight: 700 }}>100% (DOCKED)</span>
        </div>
      </div>

      {/* Real-time Biometric Strip */}
      <div style={{
        width: '100%',
        maxWidth: '740px',
        backgroundColor: '#111317',
        border: '1px solid #2B303C',
        borderRadius: '10px',
        padding: '12px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '11.5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', fontWeight: 800 }}>
            <Activity size={14} />
            <span>Dual 525nm Green & 940nm Infrared Optical PPG Sensor</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', color: '#9CA3AF' }}>
            <span>HR: <strong style={{ color: '#EF4444' }}>{heartRate} BPM</strong></span>
            <span>SpO2: <strong style={{ color: '#38BDF8' }}>{spo2}%</strong></span>
            <span>Skin Temp: <strong style={{ color: '#F59E0B' }}>{temp}°C</strong></span>
            <span>HRV: <strong style={{ color: '#A7F3D0' }}>{hrv} ms</strong></span>
          </div>
        </div>

        {/* Live SVG ECG Waveform */}
        <div style={{ width: '100%', height: '44px', backgroundColor: '#07090C', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
          <svg width="100%" height="44" viewBox="0 0 320 44" preserveAspectRatio="none">
            <path d={generateEcgPath()} fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
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
          height: '270px',
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
          height: '340px',
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
            <Rotate3d size={12} color="#C0A068" />
            <span>Drag to rotate 360° • Scroll to zoom</span>
          </div>

          {/* Ring Dock Status Badge */}
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: isDocked ? 'rgba(56, 189, 248, 0.2)' : 'rgba(16, 185, 129, 0.2)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            border: isDocked ? '1px solid #38BDF8' : '1px solid #10B981',
            fontSize: '9.5px',
            fontWeight: 800,
            color: isDocked ? '#7DD3FC' : '#34D399',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            pointerEvents: 'none'
          }}>
            <Activity size={12} />
            <span>{isDocked ? 'INDUCTIVE DOCK ACTIVE' : '525nm BIOMETRIC SCAN'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
