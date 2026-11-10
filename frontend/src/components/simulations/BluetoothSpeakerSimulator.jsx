import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, Volume2, VolumeX, Zap, Radio, Shield, Sparkles,
  Droplets, Power, SlidersHorizontal, Image as ImageIcon, Rotate3d,
  Disc, Activity, Bluetooth, CheckCircle2
} from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { soundManager } from '../../utils/audio';
import {
  createBrushedMetalTexture,
  createSpeakerGrilleTexture,
  createGroundShadow
} from '../../utils/threeTextures';

export default function BluetoothSpeakerSimulator({ product }) {
  // Device & Simulation State
  const [isPowered, setIsPowered] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(75);
  const [bassBoost, setBassBoost] = useState(true);
  const [showWaves, setShowWaves] = useState(true);
  const [waterSplash, setWaterSplash] = useState(false);
  const [activeTab, setActiveTab] = useState('simulate'); // 'simulate' | 'photo'

  const containerRef = useRef(null);

  // Three.js References
  const topRadiatorRef = useRef(null);
  const bottomRadiatorRef = useRef(null);
  const waveGroupRef = useRef(null);
  const splashParticlesRef = useRef(null);
  const ledRingDotsRef = useRef([]);
  const beatTimerRef = useRef(null);

  const itemPhoto = product?.image_url || "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1200&q=90";

  // Power Toggle
  const handleTogglePower = () => {
    if (isPowered) {
      soundManager.playSpeakerShutdown();
      setIsPowered(false);
      setIsPlaying(false);
    } else {
      soundManager.playSpeakerStartup();
      setIsPowered(true);
      setIsPlaying(true);
    }
  };

  // Play / Pause Toggle
  const handleTogglePlay = () => {
    if (!isPowered) return;
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    if (nextState) {
      soundManager.playSpeakerBassPulse(bassBoost);
    }
  };

  // Rhythmic synthesized audio beat loop when playing
  useEffect(() => {
    if (isPowered && isPlaying) {
      beatTimerRef.current = setInterval(() => {
        soundManager.playSpeakerBassPulse(bassBoost);
      }, 550); // ~110 BPM groove
    } else {
      if (beatTimerRef.current) clearInterval(beatTimerRef.current);
    }
    return () => {
      if (beatTimerRef.current) clearInterval(beatTimerRef.current);
    };
  }, [isPowered, isPlaying, bassBoost]);

  // Three.js Scene Setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 480;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#090B10');

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 1.4, 5.2);

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
    controls.minDistance = 2.4;
    controls.maxDistance = 8.5;

    // 4-Point High-Fidelity Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38BDF8, 2.0);
    fillLight.position.set(-4, -1, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x818CF8, 2.4);
    rimLight.position.set(0, 5, -4);
    scene.add(rimLight);

    // Ground Shadow
    const groundShadow = createGroundShadow();
    groundShadow.position.y = -1.85;
    groundShadow.scale.set(1.5, 1, 1.5);
    scene.add(groundShadow);

    // Master Speaker Group
    const speakerGroup = new THREE.Group();
    speakerGroup.position.set(0, 0, 0);
    scene.add(speakerGroup);

    // =========================================================================
    // 1. CNC 6063 BILLET ALUMINIUM CHASSIS & ACOUSTIC GRILLE
    // =========================================================================
    const chassisRadius = 0.95;
    const chassisHeight = 2.7;

    // Inner Solid Aluminium Core
    const coreMat = new THREE.MeshStandardMaterial({
      map: createBrushedMetalTexture('#334155'),
      roughness: 0.35,
      metalness: 0.85,
      color: 0x475569
    });

    const coreGeo = new THREE.CylinderGeometry(chassisRadius * 0.98, chassisRadius * 0.98, chassisHeight, 48);
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    speakerGroup.add(coreMesh);

    // Outer 360° Acoustic Micro-Perforated Grille Mesh
    const grilleTex = createSpeakerGrilleTexture();
    grilleTex.repeat.set(3, 2);
    const grilleMat = new THREE.MeshStandardMaterial({
      map: grilleTex,
      roughness: 0.4,
      metalness: 0.75,
      bumpScale: 0.05
    });

    const grilleGeo = new THREE.CylinderGeometry(chassisRadius, chassisRadius, chassisHeight * 0.78, 48);
    const grilleMesh = new THREE.Mesh(grilleGeo, grilleMat);
    grilleMesh.position.y = 0;
    speakerGroup.add(grilleMesh);

    // CNC Chamfered Top & Bottom Accent Rings
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x94A3B8,
      roughness: 0.15,
      metalness: 0.95
    });

    [-1, 1].forEach(side => {
      const ringGeo = new THREE.TorusGeometry(chassisRadius * 0.97, 0.05, 16, 48);
      ringGeo.rotateX(Math.PI / 2);
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = side * (chassisHeight * 0.39);
      speakerGroup.add(ring);
    });

    // =========================================================================
    // 2. DUAL OPPOSED PASSIVE BASS RADIATORS (TOP & BOTTOM)
    // =========================================================================
    const rubberMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.9,
      metalness: 0.1
    });

    const discMat = new THREE.MeshStandardMaterial({
      map: createBrushedMetalTexture('#1E293B'),
      roughness: 0.2,
      metalness: 0.9,
      color: 0x334155
    });

    // Top Radiator
    const topRadiator = new THREE.Group();
    topRadiator.position.y = chassisHeight * 0.5 + 0.02;

    const topRubberGeo = new THREE.TorusGeometry(0.72, 0.08, 16, 48);
    topRubberGeo.rotateX(Math.PI / 2);
    const topRubber = new THREE.Mesh(topRubberGeo, rubberMat);
    topRadiator.add(topRubber);

    const topDiscGeo = new THREE.CylinderGeometry(0.68, 0.68, 0.06, 36);
    const topDisc = new THREE.Mesh(topDiscGeo, discMat);
    topRadiator.add(topDisc);

    speakerGroup.add(topRadiator);
    topRadiatorRef.current = topRadiator;

    // Bottom Radiator
    const bottomRadiator = new THREE.Group();
    bottomRadiator.position.y = -(chassisHeight * 0.5 + 0.02);

    const bottomRubber = new THREE.Mesh(topRubberGeo, rubberMat);
    bottomRadiator.add(bottomRubber);

    const bottomDisc = new THREE.Mesh(topDiscGeo, discMat);
    bottomRadiator.add(bottomDisc);

    speakerGroup.add(bottomRadiator);
    bottomRadiatorRef.current = bottomRadiator;

    // Non-slip silicone base feet ring
    const feetGeo = new THREE.TorusGeometry(chassisRadius * 0.92, 0.04, 12, 36);
    feetGeo.rotateX(Math.PI / 2);
    const feet = new THREE.Mesh(feetGeo, rubberMat);
    feet.position.y = -chassisHeight * 0.5;
    speakerGroup.add(feet);

    // =========================================================================
    // 3. TOP CAPACITIVE TOUCH PANEL & 360° LED VOLUME HALO RING
    // =========================================================================
    const ledDots = [];
    const ledCount = 24;
    const ledRadius = 0.84;

    for (let i = 0; i < ledCount; i++) {
      const angle = (i / ledCount) * Math.PI * 2;
      const dotGeo = new THREE.SphereGeometry(0.022, 12, 12);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0x38BDF8 });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(
        Math.cos(angle) * ledRadius,
        chassisHeight * 0.5 + 0.05,
        Math.sin(angle) * ledRadius
      );
      speakerGroup.add(dot);
      ledDots.push(dot);
    }
    ledRingDotsRef.current = ledDots;

    // Center Capacitive Glass Button Core
    const glassCapGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.04, 32);
    const glassCapMat = new THREE.MeshPhysicalMaterial({
      color: 0x020617,
      roughness: 0.1,
      metalness: 0.2,
      clearcoat: 1.0
    });
    const glassCap = new THREE.Mesh(glassCapGeo, glassCapMat);
    glassCap.position.y = chassisHeight * 0.5 + 0.06;
    speakerGroup.add(glassCap);

    // Power / Bluetooth Status LED Pip
    const statusLedGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const statusLedMat = new THREE.MeshBasicMaterial({ color: 0x38BDF8 });
    const statusLed = new THREE.Mesh(statusLedGeo, statusLedMat);
    statusLed.position.set(0, chassisHeight * 0.5 + 0.09, 0);
    speakerGroup.add(statusLed);

    // =========================================================================
    // 4. 360° ACOUSTIC SOUNDWAVE PARTICLE RINGS
    // =========================================================================
    const waveGroup = new THREE.Group();
    const ringCount = 5;
    const waveRings = [];

    for (let i = 0; i < ringCount; i++) {
      const ringGeo = new THREE.RingGeometry(1.2 + i * 0.45, 1.25 + i * 0.45, 48);
      ringGeo.rotateX(Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x38BDF8 : 0xA855F7,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
      });
      const waveMesh = new THREE.Mesh(ringGeo, ringMat);
      waveMesh.position.y = 0;
      waveGroup.add(waveMesh);
      waveRings.push(waveMesh);
    }
    speakerGroup.add(waveGroup);
    waveGroupRef.current = waveGroup;

    // =========================================================================
    // 5. WATER IMMERSION IP67 SPLASH PARTICLES
    // =========================================================================
    const splashCount = 45;
    const splashGeo = new THREE.BufferGeometry();
    const splashPositions = new Float32Array(splashCount * 3);
    const splashVelocities = [];

    for (let i = 0; i < splashCount; i++) {
      const r = Math.random() * 0.55;
      const th = Math.random() * Math.PI * 2;
      splashPositions[i * 3] = Math.cos(th) * r;
      splashPositions[i * 3 + 1] = chassisHeight * 0.5 + 0.08 + Math.random() * 0.2;
      splashPositions[i * 3 + 2] = Math.sin(th) * r;
      splashVelocities.push({
        vy: 0.02 + Math.random() * 0.04,
        origY: chassisHeight * 0.5 + 0.08
      });
    }
    splashGeo.setAttribute('position', new THREE.BufferAttribute(splashPositions, 3));
    const splashMat = new THREE.PointsMaterial({
      color: 0xBAE6FD,
      size: 0.06,
      transparent: true,
      opacity: 0.75
    });
    const splashPoints = new THREE.Points(splashGeo, splashMat);
    splashPoints.visible = false;
    speakerGroup.add(splashPoints);
    splashParticlesRef.current = { points: splashPoints, vels: splashVelocities };

    // =========================================================================
    // 6. ANIMATION LOOP WITH REAL-TIME RADIATOR OSCILLATION
    // =========================================================================
    let clock = new THREE.Clock();
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Subtle slow turntable rotation for 360° showcase
      speakerGroup.rotation.y += 0.003;

      // Update LED Ring based on volume & power
      const activeLedThreshold = isPowered ? Math.floor((volume / 100) * ledCount) : 0;
      ledDots.forEach((dot, idx) => {
        if (idx <= activeLedThreshold && isPowered) {
          dot.material.color.setHex(idx > 18 ? 0xEF4444 : 0x38BDF8);
          dot.visible = true;
        } else {
          dot.visible = false;
        }
      });
      statusLed.material.color.setHex(isPowered ? (isPlaying ? 0x10B981 : 0x38BDF8) : 0x334155);

      // Active Physical Radiator Vibration
      if (isPowered && isPlaying) {
        const amplitudeFactor = (volume / 100) * (bassBoost ? 0.065 : 0.035);
        const oscillation = Math.sin(elapsedTime * 35) * amplitudeFactor;

        if (topRadiatorRef.current) {
          topRadiatorRef.current.position.y = (chassisHeight * 0.5 + 0.02) + oscillation;
        }
        if (bottomRadiatorRef.current) {
          bottomRadiatorRef.current.position.y = -(chassisHeight * 0.5 + 0.02) - oscillation;
        }

        // Pulse soundwave concentric rings
        if (waveGroupRef.current) {
          waveRings.forEach((wRing, idx) => {
            const waveScale = 1.0 + ((elapsedTime * 1.5 + idx * 0.25) % 1.5);
            wRing.scale.set(waveScale, waveScale, waveScale);
            wRing.material.opacity = Math.max(0, 0.45 - (waveScale - 1.0) * 0.35);
          });
        }
      } else {
        if (topRadiatorRef.current) topRadiatorRef.current.position.y = chassisHeight * 0.5 + 0.02;
        if (bottomRadiatorRef.current) bottomRadiatorRef.current.position.y = -(chassisHeight * 0.5 + 0.02);
      }

      // Water Splash Physics
      if (splashParticlesRef.current && splashParticlesRef.current.points.visible) {
        const posAttr = splashParticlesRef.current.points.geometry.attributes.position;
        const vels = splashParticlesRef.current.vels;
        for (let i = 0; i < splashCount; i++) {
          posAttr.array[i * 3 + 1] += vels[i].vy;
          if (posAttr.array[i * 3 + 1] > vels[i].origY + 0.35) {
            posAttr.array[i * 3 + 1] = vels[i].origY;
          }
        }
        posAttr.needsUpdate = true;
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
  }, [bassBoost, volume, isPowered, isPlaying]);

  // Synchronize waves and water visibility
  useEffect(() => {
    if (waveGroupRef.current) {
      waveGroupRef.current.visible = showWaves && isPowered && isPlaying;
    }
    if (splashParticlesRef.current) {
      splashParticlesRef.current.points.visible = waterSplash && isPowered && isPlaying;
    }
  }, [showWaves, waterSplash, isPowered, isPlaying]);

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
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38BDF8',
            border: '1px solid rgba(56, 189, 248, 0.3)'
          }}>
            <Disc size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>
              SoundBillet 360° CNC Aluminium Acoustic Simulator
            </h3>
            <p style={{ fontSize: '11px', color: '#94A3B8', margin: '2px 0 0 0' }}>
              Dual Opposed Passive Radiators • 24-Hour Battery • IP67 Submersible
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
              border: activeTab === 'simulate' ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: activeTab === 'simulate' ? '#38BDF8' : 'transparent',
              color: activeTab === 'simulate' ? '#000000' : '#E2E8F0',
              transition: 'all 0.2s'
            }}
          >
            <Rotate3d size={14} /> 3D ACOUSTIC SIMULATOR
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
              border: activeTab === 'photo' ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: activeTab === 'photo' ? '#38BDF8' : 'transparent',
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

          {/* Floating Live Telemetry Badge */}
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            pointerEvents: 'none'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '20px',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              fontSize: '11px',
              fontWeight: 700,
              color: isPowered ? '#38BDF8' : '#64748B'
            }}>
              <Bluetooth size={13} />
              <span>{isPowered ? 'CONNECTED: APTX HD 24-BIT' : 'POWER STANDBY'}</span>
            </div>

            {isPowered && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '20px',
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                fontSize: '11px',
                fontWeight: 700,
                color: bassBoost ? '#10B981' : '#E2E8F0'
              }}>
                <Zap size={13} />
                <span>{bassBoost ? 'BASSUP™ ACTIVE (+12dB @ 40Hz)' : 'NATURAL HI-RES PROFILE'}</span>
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
            Drag to rotate 360° • Scroll to zoom • Watch passive radiators oscillate physically
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
            alt="SoundBillet Speaker Studio Reference"
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

      {/* Interactive Controls Bar */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '0 20px 20px 20px'
      }}>
        {/* Playback Controls & Volume Slider */}
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
          {/* Main Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleTogglePower}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: isPowered ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                border: isPowered ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.1)',
                color: isPowered ? '#38BDF8' : '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="Power ON / OFF"
            >
              <Power size={18} />
            </button>

            <button
              onClick={handleTogglePlay}
              disabled={!isPowered}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isPlaying ? '#38BDF8' : 'rgba(255, 255, 255, 0.1)',
                color: isPlaying ? '#000000' : '#FFFFFF',
                border: 'none',
                fontWeight: 700,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: isPowered ? 'pointer' : 'not-allowed',
                opacity: isPowered ? 1 : 0.5,
                transition: 'all 0.2s'
              }}
            >
              {isPlaying ? <Pause size={15} /> : <Play size={15} />}
              {isPlaying ? 'PAUSE GROOVE' : 'PLAY 360° AUDIO'}
            </button>

            <button
              onClick={() => setBassBoost(!bassBoost)}
              disabled={!isPowered}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: bassBoost ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                color: bassBoost ? '#10B981' : '#94A3B8',
                border: bassBoost ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.15)',
                fontWeight: 700,
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: isPowered ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}
            >
              <Zap size={14} />
              {bassBoost ? 'BASSUP™ ON' : 'BASSUP™ OFF'}
            </button>
          </div>

          {/* Continuous Volume Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1', minWidth: '220px', maxWidth: '360px' }}>
            <Volume2 size={16} color="#38BDF8" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              disabled={!isPowered}
              onChange={(e) => {
                setVolume(Number(e.target.value));
              }}
              style={{
                flex: '1',
                accentColor: '#38BDF8',
                cursor: isPowered ? 'pointer' : 'not-allowed'
              }}
            />
            <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'monospace', minWidth: '38px', textAlign: 'right' }}>
              {volume}%
            </span>
          </div>
        </div>

        {/* Feature Visualizer Toggles */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          <button
            onClick={() => setShowWaves(!showWaves)}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: showWaves ? 'rgba(56, 189, 248, 0.15)' : '#161A23',
              border: showWaves ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.08)',
              color: showWaves ? '#38BDF8' : '#94A3B8',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Activity size={14} />
            360° SOUNDWAVE PARTICLES
          </button>

          <button
            onClick={() => {
              const next = !waterSplash;
              setWaterSplash(next);
              if (next) soundManager.playWaterSubmerge(true);
            }}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: waterSplash ? 'rgba(56, 189, 248, 0.25)' : '#161A23',
              border: waterSplash ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.08)',
              color: waterSplash ? '#38BDF8' : '#94A3B8',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Droplets size={14} />
            IP67 WATER SPLASH DANCE TEST
          </button>
        </div>
      </div>
    </div>
  );
}

