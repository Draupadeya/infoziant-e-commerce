import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Radio, Shield, BatteryCharging, Sparkles, Headphones, SlidersHorizontal, Image as ImageIcon, Rotate3d } from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { soundManager } from '../../utils/audio';
import { createBrushedMetalTexture, createGroundShadow } from '../../utils/threeTextures';

export default function EarbudsSimulator({ product }) {
  const [slideOpen, setSlideOpen] = useState(100); // 0% (closed) to 100% (open)
  const [ancMode, setAncMode] = useState('anc'); // 'anc' | 'transparency' | 'off'
  const [ambientAudioActive, setAmbientAudioActive] = useState(false);
  const canvasRef = useRef(null);

  // Three.js References
  const lidGroupRef = useRef(null);
  const leftBudRef = useRef(null);
  const rightBudRef = useRef(null);
  const ledMeshRef = useRef(null);

  const itemPhoto = product?.image_url || "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1200&q=90";
  const caseOpen = slideOpen >= 50;

  useEffect(() => {
    return () => {
      soundManager.stopAncSimulation();
    };
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
    camera.position.set(0, 1.8, 4.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 8.5;
    controls.minDistance = 2.2;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38BDF8, 1.5);
    rimLight.position.set(-3, -2, -3);
    scene.add(rimLight);

    // Ground Shadow
    const groundShadow = createGroundShadow();
    groundShadow.position.y = -1.2;
    scene.add(groundShadow);

    // Master Earbuds Group
    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    // Case Material (Matte Obsidian Black with subtle metallic flake)
    const caseMat = new THREE.MeshStandardMaterial({
      map: createBrushedMetalTexture('#1E232B'),
      roughness: 0.45,
      metalness: 0.65,
      color: 0x1E222A
    });

    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x0D0F14,
      roughness: 0.7
    });

    // 1. Case Bottom Body (Pebble shape: rounded cylinder / capsule)
    const bottomGeo = new THREE.CylinderGeometry(1.2, 1.0, 0.9, 32);
    bottomGeo.scale(1.3, 1, 0.85);
    const bottomMesh = new THREE.Mesh(bottomGeo, caseMat);
    bottomMesh.position.set(0, -0.4, 0);
    stageGroup.add(bottomMesh);

    // Dock interior well
    const wellGeo = new THREE.CylinderGeometry(1.05, 0.9, 0.35, 32);
    wellGeo.scale(1.3, 1, 0.85);
    const wellMesh = new THREE.Mesh(wellGeo, innerMat);
    wellMesh.position.set(0, 0.05, 0);
    stageGroup.add(wellMesh);

    // Front Charging Status LED dot
    const ledGeo = new THREE.CircleGeometry(0.04, 16);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x10B981 });
    const ledMesh = new THREE.Mesh(ledGeo, ledMat);
    ledMesh.position.set(0, -0.3, 0.7);
    stageGroup.add(ledMesh);
    ledMeshRef.current = ledMat;

    // 2. Hinged Lid Group
    // Rear hinge pivot at y = 0.05, z = -0.55
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 0.05, -0.55);

    const lidGeo = new THREE.CylinderGeometry(1.0, 1.2, 0.7, 32);
    lidGeo.scale(1.3, 1, 0.85);
    lidGeo.translate(0, 0.35, 0.55); // offset so pivot is at rear hinge
    const lidMesh = new THREE.Mesh(lidGeo, caseMat);
    lidGroup.add(lidMesh);

    // Hinge pin
    const pinGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 16);
    pinGeo.rotateZ(Math.PI / 2);
    const pinMat = new THREE.MeshStandardMaterial({ color: 0x64748B, metalness: 0.9, roughness: 0.2 });
    const pinMesh = new THREE.Mesh(pinGeo, pinMat);
    lidGroup.add(pinMesh);

    stageGroup.add(lidGroup);
    lidGroupRef.current = lidGroup;

    // 3. Two 3D Sculpted Earbuds
    const budMat = new THREE.MeshStandardMaterial({
      roughness: 0.2,
      metalness: 0.8,
      color: 0x11161F
    });
    const tipMat = new THREE.MeshStandardMaterial({
      roughness: 0.8,
      metalness: 0.05,
      color: 0x334155
    });

    // Helper to create an earbud
    const createEarbud = (isLeft) => {
      const budGroup = new THREE.Group();

      // Acoustic head
      const headGeo = new THREE.SphereGeometry(0.24, 24, 24);
      headGeo.scale(1, 1.1, 1);
      const headMesh = new THREE.Mesh(headGeo, budMat);
      budGroup.add(headMesh);

      // Silicone ear tip
      const tipGeo = new THREE.CylinderGeometry(0.12, 0.2, 0.16, 20);
      tipGeo.rotateX(Math.PI / 2);
      const tipMesh = new THREE.Mesh(tipGeo, tipMat);
      tipMesh.position.set(0, 0.05, 0.24);
      budGroup.add(tipMesh);

      // Stem
      const stemGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.6, 16);
      const stemMesh = new THREE.Mesh(stemGeo, budMat);
      stemMesh.position.set(0, -0.35, 0);
      stemMesh.rotation.z = isLeft ? 0.1 : -0.1;
      budGroup.add(stemMesh);

      // Gold charging contact rings
      const contactGeo = new THREE.CylinderGeometry(0.072, 0.072, 0.05, 16);
      const contactMat = new THREE.MeshStandardMaterial({ color: 0xD4AF37, metalness: 0.9, roughness: 0.2 });
      const contactMesh = new THREE.Mesh(contactGeo, contactMat);
      contactMesh.position.set(0, -0.6, 0);
      budGroup.add(contactMesh);

      return budGroup;
    };

    // Left Earbud
    const leftBud = createEarbud(true);
    leftBud.position.set(-0.5, 0.25, 0);
    stageGroup.add(leftBud);
    leftBudRef.current = leftBud;

    // Right Earbud
    const rightBud = createEarbud(false);
    rightBud.position.set(0.5, 0.25, 0);
    stageGroup.add(rightBud);
    rightBudRef.current = rightBud;

    // Aesthetic stage rotation
    stageGroup.rotation.x = 0.2;
    stageGroup.rotation.y = -0.25;

    // Animation Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();

      // Subtle float
      stageGroup.position.y = Math.sin(Date.now() * 0.0018) * 0.03;
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

  // Update Lid Angle and Earbud Elevation based on continuous slider
  useEffect(() => {
    const factor = slideOpen / 100; // 0 (closed) to 1 (full open)

    // 1. Lid rotates back around rear hinge (0 rad to -1.9 rad / -110°)
    if (lidGroupRef.current) {
      lidGroupRef.current.rotation.x = -factor * 1.9;
    }

    // 2. Earbuds elevate out of docking well as lid opens
    if (leftBudRef.current && rightBudRef.current) {
      const lift = factor * 0.35; // 0 to 0.35 units
      leftBudRef.current.position.y = 0.05 + lift;
      rightBudRef.current.position.y = 0.05 + lift;
    }

    // 3. LED indicator updates
    if (ledMeshRef.current) {
      if (slideOpen > 50) {
        ledMeshRef.current.color.setHex(0x10B981); // Paired / Active
      } else {
        ledMeshRef.current.color.setHex(0xF59E0B); // Charging / Standby
      }
    }
  }, [slideOpen]);

  const handleSlideChange = (val) => {
    const progress = parseInt(val);
    setSlideOpen(progress);
    if (progress > 50 && !caseOpen) {
      soundManager.playHapticSnap();
    } else if (progress <= 50 && caseOpen) {
      soundManager.playHapticSnap();
    }
  };

  const handleToggleAnc = (mode) => {
    soundManager.playAncToggle(mode === 'anc');
    setAncMode(mode);
    if (ambientAudioActive) {
      soundManager.updateAncMode(mode);
    }
  };

  const handleToggleAmbient = () => {
    if (!ambientAudioActive) {
      soundManager.startAncSimulation(ancMode);
      setAmbientAudioActive(true);
    } else {
      soundManager.stopAncSimulation();
      setAmbientAudioActive(false);
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
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#FFFFFF' }}>{product?.name || "EchoGrid ANC Studio Earbuds"}</span>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#C0A068', backgroundColor: 'rgba(192, 160, 104, 0.15)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                THREE.JS 3D PBR
              </span>
            </div>
            <span style={{ fontSize: '10px', color: '#9CA3AF' }}>45dB Hybrid Active Noise Cancellation & LDAC Hi-Res Audio</span>
          </div>
        </div>

        {/* Ambient Noise Test Button */}
        <button
          onClick={handleToggleAmbient}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: ambientAudioActive ? '#10B981' : 'rgba(255, 255, 255, 0.1)',
            border: ambientAudioActive ? '1px solid #34D399' : '1px solid rgba(255, 255, 255, 0.2)',
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {ambientAudioActive ? <Volume2 size={12} /> : <VolumeX size={12} />}
          {ambientAudioActive ? 'Live Audio Noise Active' : 'Test Hybrid ANC Acoustics'}
        </button>
      </div>

      {/* CONTINUOUS CASE LID SLIDING MECHANISM BAR */}
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
            CHARGING CASE LID HINGE SLIDING MECHANISM:
          </span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span>Hinge Opening: <strong style={{ color: '#C0A068' }}>{Math.round((slideOpen / 100) * 110)}°</strong></span>
            <span>•</span>
            <span>Dock State: <strong style={{ color: caseOpen ? '#10B981' : '#F59E0B' }}>
              {caseOpen ? 'Earbuds Elevated & Ready' : 'Magnetic Sealed Recharging'}
            </strong></span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '10.5px', color: '#9CA3AF', fontWeight: 700 }}>0% (SEALED)</span>
          <input
            type="range"
            min="0"
            max="100"
            value={slideOpen}
            onChange={(e) => handleSlideChange(e.target.value)}
            style={{
              flex: 1,
              height: '8px',
              borderRadius: '4px',
              accentColor: '#C0A068',
              cursor: 'grab'
            }}
          />
          <span style={{ fontSize: '10.5px', color: '#9CA3AF', fontWeight: 700 }}>100% (FULL 110° OPEN)</span>
        </div>

        {/* ANC Mode Switcher Pills */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', paddingTop: '4px' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '10.5px', color: '#9CA3AF' }}>Acoustic Filter:</span>
            {[
              { id: 'anc', label: 'Hybrid ANC (-45dB)' },
              { id: 'transparency', label: 'Bionic Transparency' },
              { id: 'off', label: 'Passive Isolation' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => handleToggleAnc(m.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '9.5px',
                  fontWeight: 800,
                  backgroundColor: ancMode === m.id ? '#2563EB' : 'rgba(255,255,255,0.06)',
                  color: ancMode === m.id ? '#FFFFFF' : '#D1D5DB',
                  border: ancMode === m.id ? '1px solid #60A5FA' : '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer'
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', fontSize: '10.5px', color: '#9CA3AF' }}>
            <span>Buds: <strong style={{ color: '#10B981' }}>100%</strong></span>
            <span>Case: <strong style={{ color: '#38BDF8' }}>88% (32h Total)</strong></span>
          </div>
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

          {/* Lid Status Badge */}
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: caseOpen ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            border: caseOpen ? '1px solid #10B981' : '1px solid #F59E0B',
            fontSize: '9.5px',
            fontWeight: 800,
            color: caseOpen ? '#34D399' : '#FBBF24',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            pointerEvents: 'none'
          }}>
            <Headphones size={12} />
            <span>{caseOpen ? 'LID 110° OPEN (UNLOCKED)' : 'LID CLOSED (CHARGING)'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
