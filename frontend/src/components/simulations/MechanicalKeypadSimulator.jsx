import React, { useState, useEffect, useRef } from 'react';
import {
  Keyboard, Volume2, Sparkles, Cpu, Check, Layers, Disc3, Eye, RotateCw,
  SlidersHorizontal, Image as ImageIcon, Rotate3d, Calculator, Palette, Zap
} from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { soundManager } from '../../utils/audio';
import {
  createBrushedMetalTexture,
  createKnurledTexture,
  createKeycapTexture,
  createGroundShadow
} from '../../utils/threeTextures';

export default function MechanicalKeypadSimulator({ product }) {
  const [activeKey, setActiveKey] = useState(null);
  const [switchType, setSwitchType] = useState('clicky'); // 'clicky' | 'linear'
  const [selectedColor, setSelectedColor] = useState('#EC4899'); // User-selected color
  const [isRainbow, setIsRainbow] = useState(false);
  const [brightness, setBrightness] = useState(90);
  const [knobAngle, setKnobAngle] = useState(45);
  const [volumeLevel, setVolumeLevel] = useState(72);
  const [lastMacro, setLastMacro] = useState("Full QWERTY Layout (A-Z, F1-F12, Numpad) Initialized.");

  // Continuous Key Travel Sliding Mechanism (0.0mm to 4.0mm)
  const [keyTravel, setKeyTravel] = useState(0.0);
  const prevTravelRef = useRef(0);
  const canvasRef = useRef(null);

  // Three.js References
  const keyMeshesRef = useRef([]);
  const knobMeshRef = useRef(null);
  const rgbLightRef = useRef(null);

  const itemPhoto = product?.image_url || "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1200&q=90";

  // COMPLETE MECHANICAL KEYBOARD LAYOUT: A to Z, F1 to F12, Numbers, Numpad & Navigation
  // Normalized grid positions on keyboard plate
  const keysConfig = [
    // --- ROW 0: FUNCTION ROW (ESC, F1-F12, PRT, DEL) ---
    { id: 'esc', label: 'ESC', x: -4.4, z: -1.75, w: 1 },
    { id: 'f1', label: 'F1', x: -3.6, z: -1.75, w: 1 },
    { id: 'f2', label: 'F2', x: -3.05, z: -1.75, w: 1 },
    { id: 'f3', label: 'F3', x: -2.5, z: -1.75, w: 1 },
    { id: 'f4', label: 'F4', x: -1.95, z: -1.75, w: 1 },
    { id: 'f5', label: 'F5', x: -1.25, z: -1.75, w: 1 },
    { id: 'f6', label: 'F6', x: -0.7, z: -1.75, w: 1 },
    { id: 'f7', label: 'F7', x: -0.15, z: -1.75, w: 1 },
    { id: 'f8', label: 'F8', x: 0.4, z: -1.75, w: 1 },
    { id: 'f9', label: 'F9', x: 1.1, z: -1.75, w: 1 },
    { id: 'f10', label: 'F10', x: 1.65, z: -1.75, w: 1 },
    { id: 'f11', label: 'F11', x: 2.2, z: -1.75, w: 1 },
    { id: 'f12', label: 'F12', x: 2.75, z: -1.75, w: 1 },
    { id: 'prt', label: 'PRT', x: 3.45, z: -1.75, w: 1 },
    { id: 'del', label: 'DEL', x: 4.0, z: -1.75, w: 1 },

    // --- ROW 1: NUMBER ROW (`~`, 1-0, -, =, BACKSPACE) + NUMPAD TOP ROW ---
    { id: 'tilde', label: '~', x: -4.4, z: -1.15, w: 1 },
    { id: '1', label: '1', x: -3.85, z: -1.15, w: 1 },
    { id: '2', label: '2', x: -3.3, z: -1.15, w: 1 },
    { id: '3', label: '3', x: -2.75, z: -1.15, w: 1 },
    { id: '4', label: '4', x: -2.2, z: -1.15, w: 1 },
    { id: '5', label: '5', x: -1.65, z: -1.15, w: 1 },
    { id: '6', label: '6', x: -1.1, z: -1.15, w: 1 },
    { id: '7', label: '7', x: -0.55, z: -1.15, w: 1 },
    { id: '8', label: '8', x: 0.0, z: -1.15, w: 1 },
    { id: '9', label: '9', x: 0.55, z: -1.15, w: 1 },
    { id: '0', label: '0', x: 1.1, z: -1.15, w: 1 },
    { id: 'minus', label: '-', x: 1.65, z: -1.15, w: 1 },
    { id: 'equal', label: '=', x: 2.2, z: -1.15, w: 1 },
    { id: 'bksp', label: 'BKSP', x: 2.85, z: -1.15, w: 1.4 },
    // Numpad Row 1
    { id: 'num', label: 'NUM', x: 3.65, z: -1.15, w: 1 },
    { id: 'div', label: '/', x: 4.2, z: -1.15, w: 1 },
    { id: 'mul', label: '*', x: 4.75, z: -1.15, w: 1 },

    // --- ROW 2: QWERTY UPPER (TAB, Q-P, [, ], \) + NUMPAD 7,8,9,- ---
    { id: 'tab', label: 'TAB', x: -4.3, z: -0.6, w: 1.35 },
    { id: 'q', label: 'Q', x: -3.65, z: -0.6, w: 1 },
    { id: 'w', label: 'W', x: -3.1, z: -0.6, w: 1 },
    { id: 'e', label: 'E', x: -2.55, z: -0.6, w: 1 },
    { id: 'r', label: 'R', x: -2.0, z: -0.6, w: 1 },
    { id: 't', label: 'T', x: -1.45, z: -0.6, w: 1 },
    { id: 'y', label: 'Y', x: -0.9, z: -0.6, w: 1 },
    { id: 'u', label: 'U', x: -0.35, z: -0.6, w: 1 },
    { id: 'i', label: 'I', x: 0.2, z: -0.6, w: 1 },
    { id: 'o', label: 'O', x: 0.75, z: -0.6, w: 1 },
    { id: 'p', label: 'P', x: 1.3, z: -0.6, w: 1 },
    { id: 'bracket_l', label: '[', x: 1.85, z: -0.6, w: 1 },
    { id: 'bracket_r', label: ']', x: 2.4, z: -0.6, w: 1 },
    { id: 'backslash', label: '\\', x: 2.95, z: -0.6, w: 1 },
    // Numpad Row 2
    { id: 'np7', label: '7', x: 3.65, z: -0.6, w: 1 },
    { id: 'np8', label: '8', x: 4.2, z: -0.6, w: 1 },
    { id: 'np9', label: '9', x: 4.75, z: -0.6, w: 1 },

    // --- ROW 3: HOME ROW (CAPS, A-L, ;, ', ENTER) + NUMPAD 4,5,6,+ ---
    { id: 'caps', label: 'CAPS', x: -4.25, z: -0.05, w: 1.55 },
    { id: 'a', label: 'A', x: -3.5, z: -0.05, w: 1 },
    { id: 's', label: 'S', x: -2.95, z: -0.05, w: 1 },
    { id: 'd', label: 'D', x: -2.4, z: -0.05, w: 1 },
    { id: 'f', label: 'F', x: -1.85, z: -0.05, w: 1 },
    { id: 'g', label: 'G', x: -1.3, z: -0.05, w: 1 },
    { id: 'h', label: 'H', x: -0.75, z: -0.05, w: 1 },
    { id: 'j', label: 'J', x: -0.2, z: -0.05, w: 1 },
    { id: 'k', label: 'K', x: 0.35, z: -0.05, w: 1 },
    { id: 'l', label: 'L', x: 0.9, z: -0.05, w: 1 },
    { id: 'semicolon', label: ';', x: 1.45, z: -0.05, w: 1 },
    { id: 'quote', label: '\'', x: 2.0, z: -0.05, w: 1 },
    { id: 'enter', label: 'ENTER', x: 2.75, z: -0.05, w: 1.7 },
    // Numpad Row 3
    { id: 'np4', label: '4', x: 3.65, z: -0.05, w: 1 },
    { id: 'np5', label: '5', x: 4.2, z: -0.05, w: 1 },
    { id: 'np6', label: '6', x: 4.75, z: -0.05, w: 1 },

    // --- ROW 4: LOWER ROW (SHIFT, Z-M, ,, ., /, SHIFT) + ARROW UP + NUMPAD 1,2,3 ---
    { id: 'lshift', label: 'SHIFT', x: -4.15, z: 0.5, w: 1.8 },
    { id: 'z', label: 'Z', x: -3.3, z: 0.5, w: 1 },
    { id: 'x', label: 'X', x: -2.75, z: 0.5, w: 1 },
    { id: 'c', label: 'C', x: -2.2, z: 0.5, w: 1 },
    { id: 'v', label: 'V', x: -1.65, z: 0.5, w: 1 },
    { id: 'b', label: 'B', x: -1.1, z: 0.5, w: 1 },
    { id: 'n', label: 'N', x: -0.55, z: 0.5, w: 1 },
    { id: 'm', label: 'M', x: 0.0, z: 0.5, w: 1 },
    { id: 'comma', label: ',', x: 0.55, z: 0.5, w: 1 },
    { id: 'dot', label: '.', x: 1.1, z: 0.5, w: 1 },
    { id: 'slash', label: '/', x: 1.65, z: 0.5, w: 1 },
    { id: 'rshift', label: 'SHIFT', x: 2.35, z: 0.5, w: 1.6 },
    { id: 'arr_u', label: '▲', x: 3.0, z: 0.5, w: 1 },
    // Numpad Row 4
    { id: 'np1', label: '1', x: 3.65, z: 0.5, w: 1 },
    { id: 'np2', label: '2', x: 4.2, z: 0.5, w: 1 },
    { id: 'np3', label: '3', x: 4.75, z: 0.5, w: 1 },

    // --- ROW 5: BOTTOM ROW (CTRL, WIN, ALT, SPACEBAR, ALT, FN, CTRL) + ARROWS + NUMPAD 0, ., ENT ---
    { id: 'ctrl_l', label: 'CTRL', x: -4.3, z: 1.05, w: 1.2 },
    { id: 'win', label: 'WIN', x: -3.7, z: 1.05, w: 1 },
    { id: 'alt_l', label: 'ALT', x: -3.15, z: 1.05, w: 1 },
    { id: 'space', label: 'SPACEBAR', x: -1.3, z: 1.05, w: 4.2 },
    { id: 'alt_r', label: 'ALT', x: 0.9, z: 1.05, w: 1 },
    { id: 'fn', label: 'FN', x: 1.45, z: 1.05, w: 1 },
    { id: 'ctrl_r', label: 'CTRL', x: 2.0, z: 1.05, w: 1 },
    // Nav Arrows
    { id: 'arr_l', label: '◄', x: 2.5, z: 1.05, w: 1 },
    { id: 'arr_d', label: '▼', x: 3.0, z: 1.05, w: 1 },
    { id: 'arr_r', label: '►', x: 3.5, z: 1.05, w: 1 },
    // Numpad Row 5
    { id: 'np0', label: '0', x: 4.1, z: 1.05, w: 1.7 },
    { id: 'np_ent', label: 'ENT', x: 4.8, z: 1.05, w: 1.1 }
  ];

  // Lighting Presets
  const colorPresets = [
    { name: 'Cyber Neon', hex: '#EC4899' },
    { name: 'Emerald Matrix', hex: '#10B981' },
    { name: 'Electric Cyan', hex: '#06B6D4' },
    { name: 'Tokyo Amber', hex: '#F59E0B' },
    { name: 'Blood Crimson', hex: '#EF4444' },
    { name: 'Royal Violet', hex: '#8B5CF6' },
    { name: 'Glacier White', hex: '#FFFFFF' }
  ];

  // Initialize Three.js Scene
  useEffect(() => {
    if (!canvasRef.current) return;
    const container = canvasRef.current;
    const width = container.clientWidth || 480;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0A0C11');

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 5.2, 5.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.6;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxDistance = 12;
    controls.minDistance = 2.5;

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.4);
    keyLight.position.set(4, 8, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xE2E8F0, 2.5);
    fillLight.position.set(-6, 4, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x38BDF8, 2.0);
    rimLight.position.set(-2, 4, -5);
    scene.add(rimLight);

    // RGB Central PointLight
    const rgbPointLight = new THREE.PointLight(selectedColor, 4.0, 10);
    rgbPointLight.position.set(0, 0.8, 0);
    scene.add(rgbPointLight);
    rgbLightRef.current = rgbPointLight;

    // Ground Contact Shadow
    const groundShadow = createGroundShadow();
    groundShadow.position.y = -1.4;
    groundShadow.scale.set(1.6, 1, 1.2);
    scene.add(groundShadow);

    // Master Keyboard Assembly Group
    const kbGroup = new THREE.Group();
    kbGroup.position.set(0, -0.15, 0);
    scene.add(kbGroup);

    // 1. CNC Anodized Aluminium Chassis (Full-size width 11.2, depth 4.6, height 0.35)
    const chassisGeo = new THREE.BoxGeometry(10.8, 0.38, 4.4);
    const chassisMat = new THREE.MeshStandardMaterial({
      map: createBrushedMetalTexture('#1E2530'),
      roughness: 0.28,
      metalness: 0.88,
      color: 0x1E2530
    });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.y = -0.19;
    kbGroup.add(chassis);

    // Beveled Chamfer Edge Border
    const borderGeo = new THREE.BoxGeometry(10.5, 0.04, 4.1);
    const borderMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.9,
      roughness: 0.2
    });
    const borderMesh = new THREE.Mesh(borderGeo, borderMat);
    borderMesh.position.y = 0.01;
    kbGroup.add(borderMesh);

    // Matte Switch Plate
    const plateGeo = new THREE.BoxGeometry(10.3, 0.02, 3.9);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x0F172A,
      roughness: 0.65,
      metalness: 0.4
    });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.y = 0.03;
    kbGroup.add(plate);

    // 2. Rotary CNC Metal Volume Knob at Top Right
    const knobGroup = new THREE.Group();
    knobGroup.position.set(4.8, 0.26, -1.75);

    const knobBodyGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.28, 32);
    const knobMat = new THREE.MeshStandardMaterial({
      map: createKnurledTexture(),
      roughness: 0.3,
      metalness: 0.85,
      color: 0x64748B
    });
    const knobBody = new THREE.Mesh(knobBodyGeo, knobMat);
    knobGroup.add(knobBody);

    // Knob Indicator Pip
    const pipGeo = new THREE.BoxGeometry(0.04, 0.06, 0.22);
    const pipMat = new THREE.MeshStandardMaterial({ color: 0x38BDF8, emissive: 0x38BDF8, emissiveIntensity: 1.5 });
    const pip = new THREE.Mesh(pipGeo, pipMat);
    pip.position.set(0, 0.14, 0.14);
    knobGroup.add(pip);

    kbGroup.add(knobGroup);
    knobMeshRef.current = knobGroup;

    // 3. GENERATE ALL INDIVIDUAL KEYS WITH PER-KEY ILLUMINATION
    const keyMeshes = [];

    keysConfig.forEach((k) => {
      const isWide = (k.w || 1) > 1.2;
      const keyWidth = 0.48 * (k.w || 1);
      const keyDepth = 0.48;

      // Key Assembly Group
      const kGroup = new THREE.Group();
      kGroup.position.set(k.x, 0.12, k.z);

      // Translucent milky mechanical switch housing (Gateron / Cherry MX)
      const switchGeo = new THREE.BoxGeometry(keyWidth * 0.9, 0.14, keyDepth * 0.9);
      const switchMat = new THREE.MeshPhysicalMaterial({
        color: 0xFFFFFF,
        transmission: 0.6,
        roughness: 0.25,
        emissive: new THREE.Color(selectedColor),
        emissiveIntensity: 0.8
      });
      const switchMesh = new THREE.Mesh(switchGeo, switchMat);
      switchMesh.position.y = 0.07;
      kGroup.add(switchMesh);

      // High-End Dye-Sub PBT Keycap with Legend
      const keycapTex = createKeycapTexture(k.label, '', isWide);
      const keycapGeo = new THREE.BoxGeometry(keyWidth, 0.16, keyDepth);
      const keycapMat = new THREE.MeshStandardMaterial({
        map: keycapTex,
        roughness: 0.45,
        metalness: 0.15,
        emissive: new THREE.Color(selectedColor),
        emissiveIntensity: 0.45
      });
      const keycap = new THREE.Mesh(keycapGeo, keycapMat);
      keycap.position.y = 0.18;
      kGroup.add(keycap);

      kbGroup.add(kGroup);

      keyMeshes.push({
        id: k.id,
        label: k.label,
        group: kGroup,
        switchMesh: switchMesh,
        keycapMat: keycapMat,
        switchMat: switchMat,
        restY: 0.12,
        currentY: 0.12
      });
    });

    keyMeshesRef.current = keyMeshes;

    // Angled ergonomics
    kbGroup.rotation.x = 0.14;

    // Animation Loop
    let animId;
    let hueOffset = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();

      // Rainbow Dynamic Spectrum Cycle if enabled
      if (isRainbow) {
        hueOffset += 0.005;
        keyMeshes.forEach((km, idx) => {
          const keyHue = (hueOffset + (km.group.position.x * 0.1) + (km.group.position.z * 0.1)) % 1;
          const rainbowColor = new THREE.Color().setHSL(keyHue, 0.95, 0.55);
          km.keycapMat.emissive.copy(rainbowColor);
          km.switchMat.emissive.copy(rainbowColor);
        });
        if (rgbLightRef.current) {
          const globalColor = new THREE.Color().setHSL(hueOffset % 1, 0.9, 0.5);
          rgbLightRef.current.color.copy(globalColor);
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

  // UPDATE PER-KEY LIGHTS IMMEDIATELY BASED ON USER-SELECTED COLOR & BRIGHTNESS
  useEffect(() => {
    if (isRainbow) return;

    const intensity = (brightness / 100);
    const colorObj = new THREE.Color(selectedColor);

    if (rgbLightRef.current) {
      rgbLightRef.current.color.copy(colorObj);
      rgbLightRef.current.intensity = 3.5 * intensity;
    }

    keyMeshesRef.current.forEach((km) => {
      km.keycapMat.emissive.copy(colorObj);
      km.keycapMat.emissiveIntensity = 0.5 * intensity;
      km.switchMat.emissive.copy(colorObj);
      km.switchMat.emissiveIntensity = 0.9 * intensity;
    });
  }, [selectedColor, brightness, isRainbow]);

  // Handle continuous switch travel slider
  useEffect(() => {
    const travelOffset = (keyTravel / 4.0) * 0.08; // 4.0mm max travel
    keyMeshesRef.current.forEach((km) => {
      km.group.position.y = km.restY - travelOffset;
    });
  }, [keyTravel]);

  // Key Actuation Trigger (Clicking or typing)
  const triggerKeyActuation = (keyId, label) => {
    setActiveKey(keyId);
    soundManager.play(switchType === 'clicky' ? 'click' : 'pop');

    setLastMacro(`Key [${label}] Actuated • ${switchType === 'clicky' ? 'Tactile Click 50cN' : 'Smooth Linear 45cN'} • RGB Illumination Active`);

    const targetKey = keyMeshesRef.current.find(k => k.id === keyId);
    if (targetKey) {
      // Actuate down
      targetKey.group.position.y = targetKey.restY - 0.09;
      targetKey.keycapMat.emissiveIntensity = 2.2;
      targetKey.switchMat.emissiveIntensity = 2.5;

      setTimeout(() => {
        targetKey.group.position.y = targetKey.restY;
        targetKey.keycapMat.emissiveIntensity = 0.5 * (brightness / 100);
        targetKey.switchMat.emissiveIntensity = 0.9 * (brightness / 100);
        setActiveKey(null);
      }, 140);
    }
  };

  // Physical Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      const char = e.key.toLowerCase();
      const match = keysConfig.find(k => k.id === char || k.label.toLowerCase() === char);
      if (match) {
        triggerKeyActuation(match.id, match.label);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [switchType, brightness]);

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
          <div style={{ width: '32px', height: '32px', borderRadius: '6px', overflow: 'hidden', border: `1px solid ${selectedColor}` }}>
            <img src={itemPhoto} alt={product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#FFFFFF' }}>{product?.name || "Apex Mechanical Pro Keyboard"}</span>
              <span style={{ fontSize: '9px', fontWeight: 800, color: selectedColor, backgroundColor: 'rgba(255, 255, 255, 0.08)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                FULL 100% QWERTY + NUMPAD + F1-F12
              </span>
            </div>
            <span style={{ fontSize: '10px', color: '#9CA3AF' }}>
              Full A-Z Layout • Dedicated F1-F12 Function Row • 4x5 Numpad • Per-Key RGB LED
            </span>
          </div>
        </div>

        {/* Switch Type Toggle */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setSwitchType(switchType === 'clicky' ? 'linear' : 'clicky')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: switchType === 'clicky' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: switchType === 'clicky' ? '1px solid #38BDF8' : '1px solid #EF4444',
              color: switchType === 'clicky' ? '#38BDF8' : '#F87171',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Cpu size={12} />
            Switch: {switchType === 'clicky' ? 'Cherry MX Blue (Clicky)' : 'Cherry MX Red (Linear)'}
          </button>
        </div>
      </div>

      {/* PER-KEY RGB ILLUMINATION COLOR PICKER CONTROLS */}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Palette size={16} color={selectedColor} />
            <span style={{ fontSize: '12px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.04em' }}>
              PER-KEY RGB LIGHTING COLOR SELECTOR:
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: '#9CA3AF' }}>
            <span>Active Color: <strong style={{ color: selectedColor }}>{isRainbow ? '🌈 Rainbow Spectrum Wave' : selectedColor.toUpperCase()}</strong></span>
            <span>•</span>
            <span>Brightness: <strong style={{ color: '#FFFFFF' }}>{brightness}%</strong></span>
          </div>
        </div>

        {/* Color Palette Presets + Custom Color Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {colorPresets.map((p) => (
            <button
              key={p.hex}
              onClick={() => {
                setIsRainbow(false);
                setSelectedColor(p.hex);
                soundManager.play('pop');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: selectedColor === p.hex && !isRainbow ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)',
                border: selectedColor === p.hex && !isRainbow ? `2px solid ${p.hex}` : '1px solid rgba(255,255,255,0.12)',
                color: '#FFFFFF',
                fontSize: '10.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: p.hex, display: 'inline-block' }} />
              {p.name}
            </button>
          ))}

          {/* Rainbow Spectrum Wave Button */}
          <button
            onClick={() => {
              setIsRainbow(!isRainbow);
              soundManager.play('pop');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              background: isRainbow ? 'linear-gradient(90deg, #EF4444, #F59E0B, #10B981, #06B6D4, #8B5CF6)' : 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#FFFFFF',
              fontSize: '10.5px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            🌈 Rainbow Wave
          </button>

          {/* Custom HTML5 Color Picker */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.18)',
            cursor: 'pointer',
            fontSize: '10.5px',
            color: '#FFFFFF',
            fontWeight: 700
          }}>
            <span>Custom Color:</span>
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => {
                setIsRainbow(false);
                setSelectedColor(e.target.value);
              }}
              style={{
                width: '22px',
                height: '22px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: 'transparent'
              }}
            />
          </label>
        </div>

        {/* Continuous Key Travel Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '10.5px', color: '#9CA3AF', fontWeight: 700, width: '130px' }}>
            KEY TRAVEL: {keyTravel.toFixed(1)}mm
          </span>

          <input
            type="range"
            min="0"
            max="40"
            value={Math.round(keyTravel * 10)}
            onChange={(e) => setKeyTravel(parseFloat(e.target.value) / 10)}
            style={{
              flex: 1,
              height: '8px',
              borderRadius: '4px',
              accentColor: selectedColor,
              cursor: 'grab'
            }}
          />

          <span style={{ fontSize: '10.5px', color: '#9CA3AF', fontWeight: 700, width: '130px', textAlign: 'right' }}>
            ACTUATION: 2.0mm / 4.0mm
          </span>
        </div>
      </div>

      {/* Macro & Actuation Status Log */}
      <div style={{
        width: '100%',
        maxWidth: '740px',
        padding: '8px 16px',
        borderRadius: '8px',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        border: '1px solid #334155',
        color: '#E2E8F0',
        fontSize: '11px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={13} color={selectedColor} />
          {lastMacro}
        </span>
        <span style={{ color: '#94A3B8', fontSize: '10px' }}>
          Type on your keyboard or click 3D keys to actuate
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
            <Rotate3d size={12} color={selectedColor} />
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
            border: `1px solid ${selectedColor}`,
            fontSize: '9.5px',
            fontWeight: 800,
            color: selectedColor,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            pointerEvents: 'none'
          }}>
            <Keyboard size={12} />
            <span>{isRainbow ? 'RGB SPECTRUM WAVE' : `${selectedColor.toUpperCase()} PER-KEY LIGHTS`}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
