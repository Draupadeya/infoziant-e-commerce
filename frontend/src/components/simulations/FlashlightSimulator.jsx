import React, { useState, useEffect, useRef } from 'react';
import {
  Flashlight, Sun, Moon, Zap, Shield, Battery, SlidersHorizontal,
  Image as ImageIcon, Rotate3d, Compass, Eye, Sliders, Sparkles, CheckCircle2
} from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { soundManager } from '../../utils/audio';
import {
  createBrushedMetalTexture,
  createKnurledTexture,
  createGroundShadow
} from '../../utils/threeTextures';

export default function FlashlightSimulator({ product }) {
  // Continuous Lumens Slider (1 lm to 2,000 lm)
  const [lumens, setLumens] = useState(1200);
  // Continuous Beam Focus Slider (0% wide flood 120° to 100% focused pencil spot 15°)
  const [beamFocus, setBeamFocus] = useState(65);
  const [isStrobe, setIsStrobe] = useState(false);
  const [isOn, setIsOn] = useState(true);

  const canvasRef = useRef(null);

  // Three.js References
  const flashlightMasterRef = useRef(null);
  const spotLightRef = useRef(null);
  const lensGlowRef = useRef(null);
  const beamConeRef = useRef(null);

  const itemPhoto = product?.image_url || "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=1200&q=90";

  // Three.js Scene Setup
  useEffect(() => {
    if (!canvasRef.current) return;
    const container = canvasRef.current;
    const width = container.clientWidth || 480;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#07090E');

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(2.8, 1.8, 4.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.6;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxDistance = 8.5;
    controls.minDistance = 2.0;

    // Subtle Ambient Light (Tactical night environment so beam shines brightly)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const fillLight = new THREE.DirectionalLight(0x38BDF8, 1.4);
    fillLight.position.set(-4, 3, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xF59E0B, 1.2);
    rimLight.position.set(-2, 4, -4);
    scene.add(rimLight);

    // Ground Target Surface to catch the flashlight beam
    const groundGeo = new THREE.PlaneGeometry(16, 16);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      roughness: 0.85,
      metalness: 0.1
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -1.5;
    scene.add(groundMesh);

    // Ground Contact Shadow under flashlight
    const groundShadow = createGroundShadow();
    groundShadow.position.y = -1.48;
    groundShadow.scale.set(1.4, 1, 1.4);
    scene.add(groundShadow);

    // Master Flashlight Group
    const torchGroup = new THREE.Group();
    torchGroup.position.set(-0.6, 0.2, 0);
    scene.add(torchGroup);
    flashlightMasterRef.current = torchGroup;

    // Materials
    const anodizedMat = new THREE.MeshStandardMaterial({
      map: createBrushedMetalTexture('#1E232B'),
      roughness: 0.35,
      metalness: 0.85,
      color: 0x1E232B
    });

    const knurledMat = new THREE.MeshStandardMaterial({
      map: createKnurledTexture(),
      roughness: 0.45,
      metalness: 0.75,
      color: 0x0F172A
    });

    const stainlessClipMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.92,
      roughness: 0.18
    });

    const lensMat = new THREE.MeshPhysicalMaterial({
      color: 0xFEF08A,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.92,
      transparent: true,
      opacity: 0.7
    });

    const ledEmitterMat = new THREE.MeshBasicMaterial({ color: 0xFDE047 });

    // =========================================================================
    // 1. TACTICAL FLASHLIGHT CHASSIS
    // =========================================================================
    // Flashlight Body Barrel with Diamond Knurling (Length 1.6, Radius 0.26)
    const barrelGeo = new THREE.CylinderGeometry(0.26, 0.26, 1.6, 32);
    barrelGeo.rotateZ(Math.PI / 2);
    const barrel = new THREE.Mesh(barrelGeo, knurledMat);
    torchGroup.add(barrel);

    // Flashlight Head with Thermal Cooling Fins (Front: x = 1.0 to 1.7)
    const headGeo = new THREE.CylinderGeometry(0.38, 0.30, 0.7, 32);
    headGeo.rotateZ(Math.PI / 2);
    const head = new THREE.Mesh(headGeo, anodizedMat);
    head.position.set(1.15, 0, 0);
    torchGroup.add(head);

    // 5 CNC Thermal Heat-Dissipation Fins along head
    for (let f = 0; f < 5; f++) {
      const finGeo = new THREE.TorusGeometry(0.36, 0.02, 12, 32);
      finGeo.rotateY(Math.PI / 2);
      const fin = new THREE.Mesh(finGeo, anodizedMat);
      fin.position.set(0.95 + f * 0.1, 0, 0);
      torchGroup.add(fin);
    }

    // Crenelated Strike Bezel at front tip (x = 1.55)
    const bezelGeo = new THREE.CylinderGeometry(0.40, 0.38, 0.2, 32);
    bezelGeo.rotateZ(Math.PI / 2);
    const bezel = new THREE.Mesh(bezelGeo, stainlessClipMat);
    bezel.position.set(1.55, 0, 0);
    torchGroup.add(bezel);

    // Front Optical Lens
    const lensGeo = new THREE.CircleGeometry(0.36, 32);
    lensGeo.rotateY(Math.PI / 2);
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.position.set(1.65, 0, 0);
    torchGroup.add(lens);

    // CREE XHP50.2 Yellow Phosphor LED Emitter inside reflector
    const emitterGeo = new THREE.BoxGeometry(0.04, 0.12, 0.12);
    const emitter = new THREE.Mesh(emitterGeo, ledEmitterMat);
    emitter.position.set(1.48, 0, 0);
    torchGroup.add(emitter);

    // Deep-Carry Stainless Steel Pocket Clip
    const clipGeo = new THREE.BoxGeometry(1.2, 0.04, 0.14);
    const clip = new THREE.Mesh(clipGeo, stainlessClipMat);
    clip.position.set(0.1, 0.32, 0);
    torchGroup.add(clip);

    // Tactical Tailcap with Silicone Push-Button (Rear: x = -0.9)
    const tailGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.35, 32);
    tailGeo.rotateZ(Math.PI / 2);
    const tail = new THREE.Mesh(tailGeo, anodizedMat);
    tail.position.set(-0.95, 0, 0);
    torchGroup.add(tail);

    const buttonGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.08, 20);
    buttonGeo.rotateZ(Math.PI / 2);
    const buttonMat = new THREE.MeshStandardMaterial({ color: 0xEF4444, roughness: 0.6 });
    const button = new THREE.Mesh(buttonGeo, buttonMat);
    button.position.set(-1.14, 0, 0);
    torchGroup.add(button);

    // =========================================================================
    // 2. REAL THREE.JS OPTICAL SPOTLIGHT BEAM PROJECTION
    // =========================================================================
    const spotLight = new THREE.SpotLight(0xFFFBEB, 12, 18, Math.PI / 6, 0.35, 1.2);
    spotLight.position.set(1.68, 0.2, 0);
    const targetObj = new THREE.Object3D();
    targetObj.position.set(6.0, -1.5, 0); // Aiming at ground
    scene.add(targetObj);
    spotLight.target = targetObj;
    scene.add(spotLight);
    spotLightRef.current = spotLight;

    // Glowing Lens Halo Pip
    const haloGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const haloMat = new THREE.MeshBasicMaterial({ color: 0xFFFBEB, transparent: true, opacity: 0.85 });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.set(1.66, 0, 0);
    torchGroup.add(halo);
    lensGlowRef.current = haloMat;

    // Default stage showcase angle
    torchGroup.rotation.y = -0.32;
    torchGroup.rotation.z = -0.12;

    // Animation Loop
    let animId;
    let strobeCounter = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();

      // Strobe Effect Animation if enabled
      if (isStrobe && spotLightRef.current) {
        strobeCounter++;
        const strobeState = strobeCounter % 4 < 2;
        spotLightRef.current.intensity = strobeState ? (lumens / 2000) * 16 : 0;
        if (lensGlowRef.current) {
          lensGlowRef.current.opacity = strobeState ? 0.95 : 0;
        }
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

  // Update Spotlight Intensity & Focus in 3D WebGL
  useEffect(() => {
    if (!spotLightRef.current) return;

    if (!isOn) {
      spotLightRef.current.intensity = 0;
      if (lensGlowRef.current) lensGlowRef.current.opacity = 0;
      return;
    }

    if (!isStrobe) {
      // Intensity scales with lumens (up to 16 intensity at 2,000 lm)
      const intensity = (lumens / 2000) * 16.0;
      spotLightRef.current.intensity = intensity;
      if (lensGlowRef.current) {
        lensGlowRef.current.opacity = Math.min(1.0, 0.2 + (lumens / 2000) * 0.8);
      }
    }

    // Beam Focus: 0% = Flood (Math.PI / 3 = 60° half-angle), 100% = Pencil Spot (Math.PI / 18 = 10° half-angle)
    const angle = THREE.MathUtils.lerp(Math.PI / 3.2, Math.PI / 16, beamFocus / 100);
    const penumbra = THREE.MathUtils.lerp(0.85, 0.15, beamFocus / 100);
    spotLightRef.current.angle = angle;
    spotLightRef.current.penumbra = penumbra;
  }, [lumens, beamFocus, isOn, isStrobe]);

  // Mode Presets
  const setTacticalMode = (lVal, fVal, strobe = false) => {
    setLumens(lVal);
    setBeamFocus(fVal);
    setIsStrobe(strobe);
    setIsOn(true);
    soundManager.play('click');
  };

  const togglePower = () => {
    setIsOn(!isOn);
    soundManager.play('click');
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
          <div style={{ width: '32px', height: '32px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #F59E0B' }}>
            <img src={itemPhoto} alt={product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#FFFFFF' }}>{product?.name || "LumenForge 2,000-Lumen Tactical Flashlight"}</span>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.15)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                TACTICAL EDC TOOL
              </span>
            </div>
            <span style={{ fontSize: '10px', color: '#9CA3AF' }}>
              6061-T6 Aircraft Aluminium • Zoomable TIR Lens • 300m Beam Throw • IPX8 Submersible
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setTacticalMode(2000, 95, true)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: isStrobe ? '#EF4444' : 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #EF4444',
              color: isStrobe ? '#FFFFFF' : '#FCA5A5',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Zap size={12} />
            15Hz Tactical Strobe
          </button>

          <button
            onClick={togglePower}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: isOn ? '#F59E0B' : 'rgba(255,255,255,0.08)',
              border: 'none',
              color: isOn ? '#0A0C11' : '#FFFFFF',
              fontSize: '11px',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Flashlight size={12} />
            <span>{isOn ? 'Tailcap Switch ON' : 'Flashlight OFF'}</span>
          </button>
        </div>
      </div>

      {/* CONTINUOUS LUMENS & BEAM FOCUS ZOOM SLIDERS */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
        backgroundColor: '#181C26',
        padding: '14px 20px',
        borderRadius: '12px',
        border: '1px solid #2B3245'
      }}>
        {/* Brightness Lumens Slider */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sun size={16} color="#F59E0B" />
            <span style={{ fontSize: '12px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.04em' }}>
              CREE XHP50.2 LUMEN OUTPUT SLIDER:
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', color: '#9CA3AF' }}>
            <span>Brightness: <strong style={{ color: '#F59E0B' }}>{lumens} Lumens</strong></span>
            <span>•</span>
            <span>Est. Beam Throw: <strong style={{ color: '#38BDF8' }}>{Math.round((lumens / 2000) * 300)} Meters</strong></span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '10.5px', color: '#9CA3AF', fontWeight: 700, width: '90px' }}>
            1 LM (MOON)
          </span>

          <input
            type="range"
            min="1"
            max="2000"
            step="10"
            value={lumens}
            onChange={(e) => {
              setLumens(parseInt(e.target.value, 10));
              setIsOn(true);
              setIsStrobe(false);
            }}
            style={{
              flex: 1,
              height: '8px',
              borderRadius: '4px',
              accentColor: '#F59E0B',
              cursor: 'grab'
            }}
          />

          <span style={{ fontSize: '10.5px', color: '#9CA3AF', fontWeight: 700, width: '90px', textAlign: 'right' }}>
            2,000 LM (TURBO)
          </span>
        </div>

        {/* Optical TIR Beam Focus Zoom Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '10.5px', color: '#9CA3AF', fontWeight: 700, width: '130px' }}>
            OPTICAL BEAM FOCUS:
          </span>

          <input
            type="range"
            min="0"
            max="100"
            value={beamFocus}
            onChange={(e) => setBeamFocus(parseInt(e.target.value, 10))}
            style={{
              flex: 1,
              height: '8px',
              borderRadius: '4px',
              accentColor: '#38BDF8',
              cursor: 'grab'
            }}
          />

          <span style={{ fontSize: '10.5px', color: '#38BDF8', fontWeight: 800, width: '130px', textAlign: 'right' }}>
            {beamFocus > 70 ? '🎯 15° PENCIL SPOT' : beamFocus < 30 ? '🌊 120° WIDE FLOOD' : 'Balanced Mid-Beam'}
          </span>
        </div>

        {/* Quick Mode Presets */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
          <button
            onClick={() => setTacticalMode(1, 10)}
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.14)',
              color: '#FFFFFF',
              fontSize: '10.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🌙 Moonlight (1 lm)
          </button>
          <button
            onClick={() => setTacticalMode(350, 45)}
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.14)',
              color: '#FFFFFF',
              fontSize: '10.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ⚡ Medium (350 lm)
          </button>
          <button
            onClick={() => setTacticalMode(900, 75)}
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.14)',
              color: '#FFFFFF',
              fontSize: '10.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🔥 High (900 lm)
          </button>
          <button
            onClick={() => setTacticalMode(2000, 95)}
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid #F59E0B',
              color: '#FDE68A',
              fontSize: '10.5px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            🚀 Turbo (2,000 lm)
          </button>
        </div>
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
          backgroundColor: '#07090E',
          boxShadow: 'inset 0 0 40px rgba(0,0,0,0.9)'
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
            <Rotate3d size={12} color="#F59E0B" />
            <span>Drag to rotate 360° • Scroll to zoom</span>
          </div>

          {/* Active Status Badge */}
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid #F59E0B',
            fontSize: '9.5px',
            fontWeight: 800,
            color: '#F59E0B',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            pointerEvents: 'none'
          }}>
            <Flashlight size={12} />
            <span>{isOn ? `${lumens} LM BEAM ACTIVE` : 'FLASHLIGHT OFF'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

