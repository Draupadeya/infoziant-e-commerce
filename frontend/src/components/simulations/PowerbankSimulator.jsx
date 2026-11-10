import React, { useState, useEffect, useRef } from 'react';
import {
  BatteryCharging, Zap, Shield, Smartphone, Cable, RotateCcw,
  SlidersHorizontal, Image as ImageIcon, Rotate3d, Cpu, Activity,
  Radio, CheckCircle2, Flame, Gauge
} from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { soundManager } from '../../utils/audio';
import { createBrushedMetalTexture, createGroundShadow } from '../../utils/threeTextures';

/**
 * Dynamic Canvas Generator for Hyper-Realistic OLED Telemetry Screen
 * Renders live Watts, Volts, Amps, Battery %, Temperature & Rolling Waveform
 */
function createOledDisplayTexture(watts, percent, temp, mode) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');

  // OLED Deep Black Background
  ctx.fillStyle = '#05070B';
  ctx.fillRect(0, 0, 512, 320);

  // Outer High-Tech Frame Border
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 3;
  ctx.strokeRect(6, 6, 500, 308);

  // Top Status Bar: Mode, Temp, Battery %
  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(mode === 'magsafe' ? '⚡ QI2 MAGSAFE 15W' : '🚀 140W GaN PD 3.1', 20, 32);

  ctx.fillStyle = temp > 40 ? '#EF4444' : '#10B981';
  ctx.fillText(`TEMP: ${temp.toFixed(1)}°C`, 360, 32);

  // Divider Line
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(15, 42); ctx.lineTo(497, 42);
  ctx.stroke();

  // Left Circular Battery Gauge
  const cx = 95;
  const cy = 135;
  const cr = 60;

  // Background Ring
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(cx, cy, cr, 0, Math.PI * 2);
  ctx.stroke();

  // Active Green / Cyan Gradient Battery Progress Ring
  const ringGrad = ctx.createLinearGradient(cx - cr, cy, cx + cr, cy);
  ringGrad.addColorStop(0, '#06B6D4');
  ringGrad.addColorStop(1, '#10B981');
  ctx.strokeStyle = ringGrad;
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + (percent / 100) * (Math.PI * 2);
  ctx.arc(cx, cy, cr, startAngle, endAngle);
  ctx.stroke();

  // Percentage Text in center
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${percent}%`, cx, cy + 10);
  ctx.font = 'bold 11px monospace';
  ctx.fillStyle = '#64748B';
  ctx.fillText('25,000mAh', cx, cy + 28);

  // Right Side: Large Real-Time Output Wattage Display
  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748B';
  ctx.font = 'bold 14px monospace';
  ctx.fillText('ACTIVE POWER OUTPUT', 185, 80);

  ctx.fillStyle = watts > 0 ? '#38BDF8' : '#64748B';
  ctx.font = 'bold 64px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText(`${watts.toFixed(1)}`, 185, 145);
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(' W', 380, 145);

  // Voltage & Amperage Metrics Box
  const volts = watts > 0 ? Math.min(28.0, 5.0 + (watts / 140) * 23.0) : 0.0;
  const amps = volts > 0 ? watts / volts : 0.0;

  ctx.fillStyle = '#0F172A';
  ctx.fillRect(185, 165, 305, 50);
  ctx.strokeStyle = '#1E293B';
  ctx.strokeRect(185, 165, 305, 50);

  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 15px monospace';
  ctx.fillText(`VOLTAGE: ${volts.toFixed(1)}V`, 200, 196);
  ctx.fillText(`CURRENT: ${amps.toFixed(2)}A`, 350, 196);

  // Bottom Live Power Waveform Graph
  ctx.fillStyle = '#090D14';
  ctx.fillRect(15, 230, 482, 75);
  ctx.strokeStyle = '#1E293B';
  ctx.strokeRect(15, 230, 482, 75);

  ctx.strokeStyle = watts > 0 ? '#10B981' : '#334155';
  ctx.lineWidth = 2;
  ctx.beginPath();
  const points = 32;
  for (let i = 0; i < points; i++) {
    const gx = 20 + i * (472 / (points - 1));
    const wave = watts > 0 ? Math.sin(i * 0.45 + Date.now() * 0.005) * (watts / 140) * 22 : 0;
    const gy = 268 - wave;
    if (i === 0) ctx.moveTo(gx, gy);
    else ctx.lineTo(gx, gy);
  }
  ctx.stroke();

  ctx.fillStyle = '#64748B';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('LIVE PD 3.1 TELEMETRY WAVEFORM', 25, 248);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export default function PowerbankSimulator({ product }) {
  // Charging Output Wattage Slider (0W to 140W)
  const [outputWatts, setOutputWatts] = useState(100);
  // Mode: 'magsafe' (Magnetic Qi2 snap) vs 'dual_cable' (140W Dual USB-C GaN)
  const [chargeMode, setChargeMode] = useState('magsafe');
  const [slideAlignment, setSlideAlignment] = useState(85); // MagSafe alignment slider (0 to 100%)
  const [bankBattery, setBankBattery] = useState(98);
  const [phoneBattery, setPhoneBattery] = useState(62);
  const [temperature, setTemperature] = useState(29.4);

  const canvasRef = useRef(null);

  // Three.js References
  const phoneGroupRef = useRef(null);
  const oledMeshRef = useRef(null);
  const fluxLightRef = useRef(null);
  const cableGroupRef = useRef(null);
  const powerbankGroupRef = useRef(null);

  const itemPhoto = product?.image_url || "https://images.unsplash.com/photo-1609592424364-50a8b9e67a0d?auto=format&fit=crop&w=1200&q=90";
  const isSnapped = slideAlignment >= 88;

  // Live battery charge progression
  useEffect(() => {
    let timer;
    if (outputWatts > 0 && phoneBattery < 100) {
      timer = setInterval(() => {
        setPhoneBattery(prev => Math.min(100, prev + 1));
        setTemperature(prev => Math.min(48, prev + 0.05));
      }, 700);
    }
    return () => clearInterval(timer);
  }, [outputWatts, phoneBattery]);

  // Three.js Scene Setup
  useEffect(() => {
    if (!canvasRef.current) return;
    const container = canvasRef.current;
    const width = container.clientWidth || 480;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0A0C10');

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 5.2);

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
    controls.minDistance = 2.2;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.4);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38BDF8, 2.2);
    fillLight.position.set(-4, -2, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x10B981, 1.8);
    rimLight.position.set(-2, 4, -4);
    scene.add(rimLight);

    // Inductive MagSafe Charging Glow PointLight
    const fluxLight = new THREE.PointLight(0x10B981, 2.5, 5);
    fluxLight.position.set(0, 0.2, 0.4);
    scene.add(fluxLight);
    fluxLightRef.current = fluxLight;

    // Ground Contact Shadow
    const groundShadow = createGroundShadow();
    groundShadow.position.y = -1.6;
    groundShadow.scale.set(1.4, 1, 1.2);
    scene.add(groundShadow);

    // Master Power Bank Group
    const pbMaster = new THREE.Group();
    pbMaster.position.set(0, -0.1, 0);
    scene.add(pbMaster);
    powerbankGroupRef.current = pbMaster;

    // =========================================================================
    // 1. HYPER-REALISTIC POWERBANK UNIBODY CHASSIS
    // =========================================================================
    // Space-Gray Anodized Aerospace Aluminium with Soft Chamfers
    const aluMat = new THREE.MeshStandardMaterial({
      map: createBrushedMetalTexture('#374151'),
      roughness: 0.32,
      metalness: 0.88,
      color: 0x1E2530
    });

    const rubberBumperMat = new THREE.MeshStandardMaterial({
      color: 0x0F172A,
      roughness: 0.85,
      metalness: 0.1
    });

    // Main Power Bank Body (Width 1.8, Height 2.8, Depth 0.42)
    const bodyGeo = new THREE.BoxGeometry(1.8, 2.8, 0.42);
    const bodyMesh = new THREE.Mesh(bodyGeo, aluMat);
    pbMaster.add(bodyMesh);

    // Ribbed Side Grip Rails (Dual lateral rubber bumpers)
    for (let side of [-1, 1]) {
      const railGeo = new THREE.BoxGeometry(0.06, 2.7, 0.38);
      const rail = new THREE.Mesh(railGeo, rubberBumperMat);
      rail.position.set(side * 0.92, 0, 0);
      pbMaster.add(rail);

      // Micro grip sipes along the side
      for (let s = -1.0; s <= 1.0; s += 0.25) {
        const sipeGeo = new THREE.BoxGeometry(0.08, 0.04, 0.3);
        const sipe = new THREE.Mesh(sipeGeo, aluMat);
        sipe.position.set(side * 0.92, s, 0);
        pbMaster.add(sipe);
      }
    }

    // =========================================================================
    // 2. ACTIVE OLED COLOR TELEMETRY SMART SCREEN
    // =========================================================================
    const oledTex = createOledDisplayTexture(outputWatts, bankBattery, temperature, chargeMode);
    const oledMat = new THREE.MeshBasicMaterial({
      map: oledTex,
      transparent: false
    });
    const oledGeo = new THREE.PlaneGeometry(1.58, 1.05);
    const oledMesh = new THREE.Mesh(oledGeo, oledMat);
    oledMesh.position.set(0, -0.65, 0.215);
    pbMaster.add(oledMesh);
    oledMeshRef.current = oledMesh;

    // Glass Screen Bezel Protector
    const screenGlassGeo = new THREE.BoxGeometry(1.64, 1.12, 0.02);
    const screenGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0A0C10,
      roughness: 0.1,
      metalness: 0.2,
      transmission: 0.7,
      transparent: true,
      opacity: 0.85
    });
    const screenGlass = new THREE.Mesh(screenGlassGeo, screenGlassMat);
    screenGlass.position.set(0, -0.65, 0.22);
    pbMaster.add(screenGlass);

    // =========================================================================
    // 3. QI2 / MAGSAFE WIRELESS CHARGING ARRAY ON TOP FACE
    // =========================================================================
    // Magnetic White Alignment Ring
    const magRingGeo = new THREE.RingGeometry(0.40, 0.48, 48);
    const magRingMat = new THREE.MeshStandardMaterial({
      color: 0x38BDF8,
      roughness: 0.4,
      metalness: 0.5,
      side: THREE.DoubleSide
    });
    const magRing = new THREE.Mesh(magRingGeo, magRingMat);
    magRing.position.set(0, 0.58, 0.215);
    pbMaster.add(magRing);

    // Center Lightning Bolt Induction Icon
    const boltGeo = new THREE.CircleGeometry(0.12, 24);
    const boltMat = new THREE.MeshBasicMaterial({ color: 0x10B981 });
    const bolt = new THREE.Mesh(boltGeo, boltMat);
    bolt.position.set(0, 0.58, 0.216);
    pbMaster.add(bolt);

    // Vertical alignment orientation bar below ring
    const barGeo = new THREE.PlaneGeometry(0.07, 0.24);
    const barMesh = new THREE.Mesh(barGeo, magRingMat);
    barMesh.position.set(0, 0.05, 0.215);
    pbMaster.add(barMesh);

    // =========================================================================
    // 4. I/O PORTS (Dual USB-C 140W with Orange Liners & USB-A QC 3.0)
    // =========================================================================
    const portBaseMat = new THREE.MeshStandardMaterial({ color: 0x090D14, roughness: 0.9 });
    const orangeTongueMat = new THREE.MeshStandardMaterial({ color: 0xF97316, roughness: 0.3 });
    const metalContactMat = new THREE.MeshStandardMaterial({ color: 0xD97706, metalness: 0.9, roughness: 0.2 });

    // Top Port Header Cutout (Bottom edge of powerbank y = -1.4)
    for (let c = -1; c <= 1; c += 2) {
      // Dual USB-C Ports (C1 and C2)
      const cPortGeo = new THREE.BoxGeometry(0.36, 0.12, 0.16);
      const cPort = new THREE.Mesh(cPortGeo, portBaseMat);
      cPort.position.set(c * 0.45, -1.38, 0);
      pbMaster.add(cPort);

      // Orange USB-C Tongue
      const tongueGeo = new THREE.BoxGeometry(0.24, 0.03, 0.12);
      const tongue = new THREE.Mesh(tongueGeo, orangeTongueMat);
      tongue.position.set(c * 0.45, -1.38, 0);
      pbMaster.add(tongue);
    }

    // USB-A Port in center
    const aPortGeo = new THREE.BoxGeometry(0.44, 0.18, 0.16);
    const aPort = new THREE.Mesh(aPortGeo, portBaseMat);
    aPort.position.set(0, -1.38, 0);
    pbMaster.add(aPort);

    // =========================================================================
    // 5. ATTACHED 3D SMARTPHONE (For MagSafe Snap Alignment)
    // =========================================================================
    const phoneGroup = new THREE.Group();
    phoneGroup.position.set(0, 0.58, 1.2); // Start aligned but detached

    const phoneBodyMat = new THREE.MeshStandardMaterial({
      roughness: 0.2,
      metalness: 0.8,
      color: 0x0F172A
    });
    const phoneGeo = new THREE.BoxGeometry(1.68, 2.7, 0.16);
    const phoneMesh = new THREE.Mesh(phoneGeo, phoneBodyMat);
    phoneGroup.add(phoneMesh);

    // Phone Camera Plateau
    const camPlateauGeo = new THREE.BoxGeometry(0.68, 0.68, 0.06);
    const camPlateauMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.3, metalness: 0.8 });
    const camPlateau = new THREE.Mesh(camPlateauGeo, camPlateauMat);
    camPlateau.position.set(-0.45, 0.88, 0.1);
    phoneGroup.add(camPlateau);

    // Phone MagSafe Magnet Ring on back
    const pRingGeo = new THREE.RingGeometry(0.40, 0.46, 32);
    const pRingMat = new THREE.MeshBasicMaterial({ color: 0x64748B, side: THREE.DoubleSide });
    const pRing = new THREE.Mesh(pRingGeo, pRingMat);
    pRing.position.set(0, 0, 0.09);
    phoneGroup.add(pRing);

    pbMaster.add(phoneGroup);
    phoneGroupRef.current = phoneGroup;

    // Stage Presentation Angle
    pbMaster.rotation.x = 0.18;
    pbMaster.rotation.y = -0.32;

    // Animation Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();

      // Subtle resting float
      pbMaster.position.y = -0.1 + Math.sin(Date.now() * 0.002) * 0.02;

      // Pulse charging flux light when charging
      if (fluxLightRef.current && outputWatts > 0) {
        fluxLightRef.current.intensity = 2.0 + Math.sin(Date.now() * 0.008) * 0.8;
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

  // Update Dynamic OLED Canvas Texture whenever Watts, Mode, or Battery changes
  useEffect(() => {
    if (oledMeshRef.current) {
      const newTex = createOledDisplayTexture(outputWatts, bankBattery, temperature, chargeMode);
      oledMeshRef.current.material.map = newTex;
      oledMeshRef.current.material.needsUpdate = true;
    }
  }, [outputWatts, bankBattery, temperature, chargeMode]);

  // Update Phone 3D position based on continuous alignment slider
  useEffect(() => {
    const factor = slideAlignment / 100; // 0 (detached) to 1 (snapped flush)

    if (phoneGroupRef.current) {
      // At 0%: phone is at z = 1.4, rotated 0.3 rad
      // At 100%: phone snaps flush against MagSafe pad at z = 0.29, rotated 0
      const targetZ = THREE.MathUtils.lerp(1.4, 0.29, factor);
      const targetY = THREE.MathUtils.lerp(0.85, 0.58, factor);
      const targetRotX = THREE.MathUtils.lerp(0.25, 0.0, factor);
      const targetRotY = THREE.MathUtils.lerp(0.35, 0.0, factor);

      phoneGroupRef.current.position.z = targetZ;
      phoneGroupRef.current.position.y = targetY;
      phoneGroupRef.current.rotation.x = targetRotX;
      phoneGroupRef.current.rotation.y = targetRotY;
    }

    if (fluxLightRef.current) {
      if (slideAlignment >= 88 && outputWatts > 0) {
        fluxLightRef.current.color.setHex(0x10B981);
        fluxLightRef.current.intensity = 3.2;
      } else {
        fluxLightRef.current.color.setHex(0x38BDF8);
        fluxLightRef.current.intensity = 0.8 * factor;
      }
    }
  }, [slideAlignment, outputWatts]);

  const handleWattChange = (val) => {
    const num = parseFloat(val);
    setOutputWatts(num);
    if (Math.abs(num - 70) % 30 === 0) {
      soundManager.play('pop');
    }
  };

  const handleSlideChange = (val) => {
    const progress = parseInt(val, 10);
    setSlideAlignment(progress);
    if (progress >= 88 && slideAlignment < 88) {
      soundManager.playHapticSnap();
      soundManager.playRfidScanSound();
    }
  };

  const handleQuickSnap = () => {
    const nextVal = slideAlignment >= 88 ? 15 : 100;
    setSlideAlignment(nextVal);
    if (nextVal === 100) {
      soundManager.playHapticSnap();
    } else {
      soundManager.play('pop');
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
          <div style={{ width: '32px', height: '32px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #38BDF8' }}>
            <img src={itemPhoto} alt={product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#FFFFFF' }}>{product?.name || "MagPulse 25,000mAh 140W Smart Power Bank"}</span>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#38BDF8', backgroundColor: 'rgba(56, 189, 248, 0.15)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                ACTIVE OLED TELEMETRY
              </span>
            </div>
            <span style={{ fontSize: '10px', color: '#9CA3AF' }}>
              GaN PD 3.1 140W • Live Watts/Volts/Amps Display • Qi2 Magnetic Snap Array
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setChargeMode(chargeMode === 'magsafe' ? 'dual_cable' : 'magsafe')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.18)',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Cpu size={12} color="#38BDF8" />
            Mode: {chargeMode === 'magsafe' ? 'Qi2 MagSafe 15W' : 'Dual 140W USB-C GaN'}
          </button>

          <button
            onClick={handleQuickSnap}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: isSnapped ? '#10B981' : '#38BDF8',
              border: 'none',
              color: '#0A0C11',
              fontSize: '11px',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RotateCcw size={12} />
            <span>{isSnapped ? 'Detach Phone' : 'Magnetic Snap-On'}</span>
          </button>
        </div>
      </div>

      {/* CONTINUOUS 140W OUTPUT WATTAGE & MAGSAFE ALIGNMENT SLIDERS */}
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
        {/* Output Wattage Slider */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={16} color="#38BDF8" />
            <span style={{ fontSize: '12px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.04em' }}>
              REAL-TIME USB-C PD 3.1 POWER DELIVERY OUTPUT:
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', color: '#9CA3AF' }}>
            <span>Telemetry: <strong style={{ color: '#38BDF8' }}>{outputWatts.toFixed(1)} Watts</strong></span>
            <span>•</span>
            <span>Temperature: <strong style={{ color: temperature > 40 ? '#EF4444' : '#10B981' }}>{temperature.toFixed(1)}°C</strong></span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '10.5px', color: '#9CA3AF', fontWeight: 700, width: '85px' }}>
            0W (IDLE)
          </span>

          <input
            type="range"
            min="0"
            max="140"
            step="5"
            value={outputWatts}
            onChange={(e) => handleWattChange(e.target.value)}
            style={{
              flex: 1,
              height: '8px',
              borderRadius: '4px',
              accentColor: '#38BDF8',
              cursor: 'grab'
            }}
          />

          <span style={{ fontSize: '10.5px', color: '#9CA3AF', fontWeight: 700, width: '85px', textAlign: 'right' }}>
            140W (TURBO)
          </span>
        </div>

        {/* Magnetic Snap Proximity Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '10.5px', color: '#9CA3AF', fontWeight: 700, width: '130px' }}>
            MAGSAFE PROXIMITY:
          </span>

          <input
            type="range"
            min="0"
            max="100"
            value={slideAlignment}
            onChange={(e) => handleSlideChange(e.target.value)}
            style={{
              flex: 1,
              height: '8px',
              borderRadius: '4px',
              accentColor: '#10B981',
              cursor: 'grab'
            }}
          />

          <span style={{ fontSize: '10.5px', color: isSnapped ? '#10B981' : '#9CA3AF', fontWeight: 800, width: '130px', textAlign: 'right' }}>
            {isSnapped ? '⚡ 15W Qi2 SNAPPED' : `${slideAlignment}% DISTANT`}
          </span>
        </div>
      </div>

      {/* Telemetry Status Bar */}
      <div style={{
        width: '100%',
        maxWidth: '740px',
        padding: '10px 16px',
        borderRadius: '8px',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        border: '1px solid #334155',
        color: '#E2E8F0',
        fontSize: '11px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Activity size={14} color="#10B981" />
          Power Bank: <strong style={{ color: '#10B981' }}>{bankBattery}% (25,000mAh)</strong> • Phone: <strong style={{ color: '#38BDF8' }}>{phoneBattery}% (+1% every 700ms)</strong>
        </span>
        <span style={{ color: '#94A3B8', fontSize: '10.5px' }}>
          Check the 3D model: OLED screen reflects real-time Watts & battery!
        </span>
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
            <Rotate3d size={12} color="#38BDF8" />
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
            border: '1px solid #38BDF8',
            fontSize: '9.5px',
            fontWeight: 800,
            color: '#38BDF8',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            pointerEvents: 'none'
          }}>
            <BatteryCharging size={12} />
            <span>{outputWatts.toFixed(0)}W FAST CHARGE ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
