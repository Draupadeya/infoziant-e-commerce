import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck, ShieldAlert, Sparkles, RotateCcw, Radio, CheckCircle2,
  Eye, CreditCard, Receipt, Wifi, BookOpen, Layers, Sliders, ChevronRight,
  Maximize2, ArrowDown, ArrowUp, DollarSign, Wallet, RefreshCw, Key,
  Shield, AlertTriangle, Compass, Check, Image as ImageIcon, SlidersHorizontal, Rotate3d, Lock
} from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { soundManager } from '../../utils/audio';
import {
  createCardTexture,
  createLeatherTexture,
  createBrushedMetalTexture,
  createBanknoteTexture,
  createGroundShadow
} from '../../utils/threeTextures';

export default function WalletSimulator({ product }) {
  // Determine if this product is fundamentally an aluminium Cardprotector or a leather wallet
  const isAluCardprotector = (product?.slug || '').includes('cardprotector') || (product?.name || '').toLowerCase().includes('cardprotector');

  // DUAL MECHANISM STATE: 'sliding' (Aluminium Cardprotector) vs 'foldable' (Leather Bifold)
  const [mechanismMode, setMechanismMode] = useState(isAluCardprotector ? 'sliding' : 'foldable');

  // Continuous Slider States:
  // For Foldable mode: 0% (folded closed) to 100% (unfolded 180° flat)
  const [foldProgress, setFoldProgress] = useState(85);
  // For Sliding mode: 0% (retracted in Faraday cage) to 100% (fully cascaded 5 cards)
  const [slideProgress, setSlideProgress] = useState(70);

  const [selectedCardIdx, setSelectedCardIdx] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [shakeResult, setShakeResult] = useState(null);
  const [simulatingSkim, setSimulatingSkim] = useState(false);
  const [posStatus, setPosStatus] = useState(null);
  const [skimResult, setSkimResult] = useState(null);

  const canvasRef = useRef(null);

  // Three.js References for Foldable Mechanism
  const leftWingRef = useRef(null);
  const rightWingRef = useRef(null);
  const foldableGroupRef = useRef(null);

  // Three.js References for Sliding Mechanism
  const slidingGroupRef = useRef(null);
  const leverRef = useRef(null);
  const slidingCardsRef = useRef([]);

  const itemPhoto = product?.image_url || "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1200&q=90";

  // Leather tone
  const getLeatherTone = () => {
    const name = (product?.name || '').toLowerCase();
    const slug = (product?.slug || '').toLowerCase();
    if (slug.includes('amber') || name.includes('amber')) {
      return { hex: 0xB45309, str: '#B45309', name: 'Dutch Amber Full-Grain European Leather' };
    }
    if (slug.includes('cognac') || name.includes('cognac') || slug.includes('brown')) {
      return { hex: 0x6E3D1F, str: '#6E3D1F', name: 'Vintage Cognac European Leather' };
    }
    return { hex: 0x1E232B, str: '#1E232B', name: 'Obsidian Black Dutch Cowhide' };
  };

  const leatherColor = getLeatherTone();

  // Card Definitions (FinTech EMV Cards)
  const cardsData = [
    { id: 1, name: "VAULTEX INFINIA METAL", network: "RuPay Global", num: "•••• 5491", bg1: "#1E293B", bg2: "#0F172A", textColor: "#F8FAFC" },
    { id: 2, name: "ICICI SAPPHIRO", network: "Mastercard World", num: "•••• 8920", bg1: "#881337", bg2: "#4C0519", textColor: "#FFE4E6" },
    { id: 3, name: "SBI AURUM ELITE", network: "Visa Signature", num: "•••• 3140", bg1: "#92400E", bg2: "#592B08", textColor: "#FEF3C7" },
    { id: 4, name: "AXIS MAGNUS RESERVE", network: "Burgundy Elite", num: "•••• 7762", bg1: "#4C1D95", bg2: "#2E1065", textColor: "#EDE9FE" },
    { id: 5, name: "AMEX PLATINUM CHARGE", network: "American Express", num: "•••• 1009", bg1: "#334155", bg2: "#1E293B", textColor: "#FFFFFF" }
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
    camera.position.set(0, 2.2, 5.2);

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

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.4);
    keyLight.position.set(4, 7, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xE2E8F0, 2.5);
    fillLight.position.set(-4, 3, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xC0A068, 2.0);
    rimLight.position.set(-2, 4, -4);
    scene.add(rimLight);

    // Ground Contact Shadow
    const groundShadow = createGroundShadow();
    groundShadow.position.y = -1.4;
    scene.add(groundShadow);

    // =========================================================================
    // 1. FOLDABLE LEATHER BIFOLD WALLET ASSEMBLY
    // =========================================================================
    const foldGroup = new THREE.Group();
    foldGroup.position.set(0, -0.15, 0);
    scene.add(foldGroup);
    foldableGroupRef.current = foldGroup;

    // Materials for Foldable Bifold
    const leatherTex = createLeatherTexture(leatherColor.str);
    const leatherMat = new THREE.MeshStandardMaterial({
      map: leatherTex,
      roughness: 0.72,
      metalness: 0.08,
      color: leatherColor.hex,
      bumpMap: leatherTex,
      bumpScale: 0.035
    });

    const innerLiningMat = new THREE.MeshStandardMaterial({
      color: 0x141820,
      roughness: 0.85
    });

    const noteTex = createBanknoteTexture('₹500');
    const noteMat = new THREE.MeshStandardMaterial({
      map: noteTex,
      roughness: 0.65,
      metalness: 0.05
    });

    // --- LEFT WING (Pivots at x = 0) ---
    const leftWing = new THREE.Group();
    leftWing.position.set(0, 0, 0);

    // Left Outer Leather Shell (w = 1.85, h = 2.4, d = 0.06)
    const leftCoverGeo = new THREE.BoxGeometry(1.85, 2.4, 0.06);
    leftCoverGeo.translate(-0.925, 0, -0.03);
    const leftCover = new THREE.Mesh(leftCoverGeo, leatherMat);
    leftWing.add(leftCover);

    // Left Inside Pocket Lining Panel
    const leftPocketGeo = new THREE.BoxGeometry(1.82, 2.36, 0.03);
    leftPocketGeo.translate(-0.925, 0, 0.03);
    const leftPocket = new THREE.Mesh(leftPocketGeo, innerLiningMat);
    leftWing.add(leftPocket);

    // LEFT HALF OF BANKNOTE (Nested INSIDE between outer leather and inside pocket)
    // Tucked properly so it never clips through the outside leather!
    const noteLeftGeo = new THREE.PlaneGeometry(1.78, 1.85);
    noteLeftGeo.translate(-0.89, 0.12, 0.015);
    const noteLeftMesh = new THREE.Mesh(noteLeftGeo, noteMat);
    leftWing.add(noteLeftMesh);

    // 3 Tiered Card Slots on Left Wing
    for (let slot = 0; slot < 3; slot++) {
      const slotGeo = new THREE.BoxGeometry(1.78, 0.52, 0.02);
      slotGeo.translate(-0.925, -0.7 + slot * 0.45, 0.05);
      const slotMesh = new THREE.Mesh(slotGeo, leatherMat);
      leftWing.add(slotMesh);

      // Card in slot
      const cData = cardsData[slot % cardsData.length];
      const cardTex = createCardTexture(cData);
      const cMat = new THREE.MeshStandardMaterial({ map: cardTex, roughness: 0.3, metalness: 0.5 });
      const cardGeo = new THREE.BoxGeometry(1.65, 1.05, 0.015);
      cardGeo.translate(-0.925, -0.55 + slot * 0.45, 0.065);
      const cardMesh = new THREE.Mesh(cardGeo, cMat);
      leftWing.add(cardMesh);
    }

    foldGroup.add(leftWing);
    leftWingRef.current = leftWing;

    // --- RIGHT WING (Pivots at x = 0) ---
    const rightWing = new THREE.Group();
    rightWing.position.set(0, 0, 0);

    // Right Outer Leather Shell
    const rightCoverGeo = new THREE.BoxGeometry(1.85, 2.4, 0.06);
    rightCoverGeo.translate(0.925, 0, -0.03);
    const rightCover = new THREE.Mesh(rightCoverGeo, leatherMat);
    rightWing.add(rightCover);

    // Right Inside Pocket Lining Panel
    const rightPocketGeo = new THREE.BoxGeometry(1.82, 2.36, 0.03);
    rightPocketGeo.translate(0.925, 0, 0.03);
    const rightPocket = new THREE.Mesh(rightPocketGeo, innerLiningMat);
    rightWing.add(rightPocket);

    // RIGHT HALF OF BANKNOTE (Nested INSIDE between outer leather and inside pocket)
    const noteRightGeo = new THREE.PlaneGeometry(1.78, 1.85);
    noteRightGeo.translate(0.89, 0.12, 0.015);
    const noteRightMesh = new THREE.Mesh(noteRightGeo, noteMat);
    rightWing.add(noteRightMesh);

    // Transparent ID Window on Right Wing
    const idFrameGeo = new THREE.BoxGeometry(1.75, 1.1, 0.02);
    idFrameGeo.translate(0.925, -0.4, 0.05);
    const idFrame = new THREE.Mesh(idFrameGeo, leatherMat);
    rightWing.add(idFrame);

    const idMeshGeo = new THREE.PlaneGeometry(1.4, 0.85);
    idMeshGeo.translate(0.925, -0.4, 0.065);
    const idMeshMat = new THREE.MeshPhysicalMaterial({ color: 0xE2E8F0, transmission: 0.75, transparent: true, opacity: 0.85 });
    const idMesh = new THREE.Mesh(idMeshGeo, idMeshMat);
    rightWing.add(idMesh);

    // Elite Card in Right Wing Slot
    const rightCardTex = createCardTexture(cardsData[3]);
    const rightCMat = new THREE.MeshStandardMaterial({ map: rightCardTex, roughness: 0.3, metalness: 0.5 });
    const rightCardGeo = new THREE.BoxGeometry(1.65, 1.05, 0.015);
    rightCardGeo.translate(0.925, 0.65, 0.065);
    const rightCardMesh = new THREE.Mesh(rightCardGeo, rightCMat);
    rightWing.add(rightCardMesh);

    foldGroup.add(rightWing);
    rightWingRef.current = rightWing;

    // =========================================================================
    // 2. SLIDING SPRING-LEVER CARDPROTECTOR ASSEMBLY
    // =========================================================================
    const slideGroup = new THREE.Group();
    slideGroup.position.set(0, -0.15, 0);
    scene.add(slideGroup);
    slidingGroupRef.current = slideGroup;

    // Aluminium Material (Brushed Silver or Matte Black based on product)
    const isMatteBlack = (product?.color || '').toLowerCase().includes('black') || (product?.slug || '').includes('black');
    const aluTex = createBrushedMetalTexture(isMatteBlack ? '#1E232B' : '#CBD5E1');
    const aluMat = new THREE.MeshStandardMaterial({
      map: aluTex,
      roughness: isMatteBlack ? 0.45 : 0.28,
      metalness: 0.92,
      color: isMatteBlack ? 0x1E232B : 0xE2E8F0
    });

    // Aluminium Outer Casing (w = 1.95, h = 2.85, d = 0.32)
    const aluCasingGeo = new THREE.BoxGeometry(1.95, 2.85, 0.32);
    const aluCasing = new THREE.Mesh(aluCasingGeo, aluMat);
    slideGroup.add(aluCasing);

    // Top Card Slot Cavity Opening
    const topSlotGeo = new THREE.BoxGeometry(1.82, 0.12, 0.22);
    topSlotGeo.translate(0, 1.4, 0);
    const topSlotMat = new THREE.MeshStandardMaterial({ color: 0x0A0C10, roughness: 0.9 });
    const topSlot = new THREE.Mesh(topSlotGeo, topSlotMat);
    slideGroup.add(topSlot);

    // Friction Silicone Grip Pads (Red elastomer inside)
    const gripPadGeo = new THREE.BoxGeometry(0.08, 0.6, 0.18);
    const gripPadMat = new THREE.MeshStandardMaterial({ color: 0xEF4444, roughness: 0.6 });
    const leftPad = new THREE.Mesh(gripPadGeo, gripPadMat);
    leftPad.position.set(-0.88, 0.8, 0);
    slideGroup.add(leftPad);

    const rightPad = new THREE.Mesh(gripPadGeo, gripPadMat);
    rightPad.position.set(0.88, 0.8, 0);
    slideGroup.add(rightPad);

    // 5 Cascading EMV Cards inside the Cardprotector
    const cardsList = [];
    cardsData.forEach((cData, idx) => {
      const cardTex = createCardTexture(cData);
      const cMat = new THREE.MeshStandardMaterial({ map: cardTex, roughness: 0.3, metalness: 0.5 });
      const cardGeo = new THREE.BoxGeometry(1.72, 1.15, 0.02);
      const cardMesh = new THREE.Mesh(cardGeo, cMat);

      // Staggered depth positions inside the slot
      const zPos = -0.08 + idx * 0.04;
      cardMesh.position.set(0, 0.6, zPos);
      slideGroup.add(cardMesh);

      cardsList.push({
        mesh: cardMesh,
        baseY: 0.6,
        maxRaise: 0.35 + idx * 0.28 // Stepped staircase cascade
      });
    });
    slidingCardsRef.current = cardsList;

    // Tactile Spring Lever at Bottom Corner
    const leverAssembly = new THREE.Group();
    leverAssembly.position.set(-0.85, -1.35, 0); // Pivot point at bottom left corner

    const leverArmGeo = new THREE.BoxGeometry(0.35, 0.14, 0.26);
    leverArmGeo.translate(-0.14, -0.06, 0);
    const leverMat = new THREE.MeshStandardMaterial({
      color: 0x0F172A,
      roughness: 0.4,
      metalness: 0.8
    });
    const leverMesh = new THREE.Mesh(leverArmGeo, leverMat);
    leverAssembly.add(leverMesh);

    // Red tactile grip tip
    const tipGeo = new THREE.BoxGeometry(0.12, 0.16, 0.28);
    tipGeo.translate(-0.3, -0.07, 0);
    const tipMat = new THREE.MeshStandardMaterial({ color: 0xEF4444, roughness: 0.5 });
    const tipMesh = new THREE.Mesh(tipGeo, tipMat);
    leverAssembly.add(tipMesh);

    slideGroup.add(leverAssembly);
    leverRef.current = leverAssembly;

    // Set initial visibility based on mechanismMode
    foldGroup.visible = mechanismMode === 'foldable';
    slideGroup.visible = mechanismMode === 'sliding';

    // Default angle for perspective showcase
    foldGroup.rotation.y = -0.32;
    foldGroup.rotation.x = 0.12;
    slideGroup.rotation.y = -0.32;
    slideGroup.rotation.x = 0.12;

    // Animation Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();

      const hoverY = -0.15 + Math.sin(Date.now() * 0.002) * 0.02;
      foldGroup.position.y = hoverY;
      slideGroup.position.y = hoverY;

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
  }, [mechanismMode]);

  // Update Foldable Bifold Angle in 3D WebGL (Inward folding with cash & card slots inside)
  useEffect(() => {
    if (mechanismMode !== 'foldable') return;
    // When foldProgress = 100%: fully flat 180° open (foldAngle = 0)
    // When foldProgress = 0%: folded closed inward towards +Z (foldAngle = ~86°)
    const closeFactor = (100 - foldProgress) / 100;
    const foldAngle = closeFactor * (Math.PI * 0.48);

    if (leftWingRef.current) {
      leftWingRef.current.rotation.y = foldAngle; // Folds forward inward
    }
    if (rightWingRef.current) {
      rightWingRef.current.rotation.y = -foldAngle; // Folds forward inward
    }
  }, [foldProgress, mechanismMode]);

  // Update Sliding Cardprotector Lever & Cards in 3D WebGL
  useEffect(() => {
    if (mechanismMode !== 'sliding') return;
    const factor = slideProgress / 100; // 0 (retracted) to 1 (full staircase cascade)

    // Lever rotates down up to 25°
    if (leverRef.current) {
      leverRef.current.rotation.z = -factor * 0.44;
    }

    // 5 Cards slide up in an authentic stepped fan
    slidingCardsRef.current.forEach((c) => {
      c.mesh.position.y = c.baseY + factor * c.maxRaise;
    });
  }, [slideProgress, mechanismMode]);

  const handleFoldSliderChange = (val) => {
    const num = parseInt(val, 10);
    setFoldProgress(num);
    if (Math.abs(num - 50) % 25 === 0) {
      soundManager.play('pop');
    }
  };

  const handleSlideSliderChange = (val) => {
    const num = parseInt(val, 10);
    setSlideProgress(num);
    if (Math.abs(num - 50) % 25 === 0) {
      soundManager.play('click');
    }
  };

  // Quick Action Toggles
  const handleToggleFold = () => {
    const nextVal = foldProgress >= 50 ? 5 : 95;
    setFoldProgress(nextVal);
    soundManager.play('pop');
  };

  const handleToggleSlide = () => {
    const nextVal = slideProgress >= 50 ? 0 : 100;
    setSlideProgress(nextVal);
    soundManager.play('click');
  };

  // Shake Grip Test
  const handleTriggerShake = () => {
    setIsShaking(true);
    setShakeResult(null);
    soundManager.play('pop');

    setTimeout(() => {
      setIsShaking(false);
      setShakeResult({
        grip: "Friction Pads Active • 0mm Card Slippage",
        msg: mechanismMode === 'sliding'
          ? "Secrid Red Silicone Friction Grippers held all 5 cards firmly in place even inverted at 180°."
          : "Full-Grain European Bovine Leather pockets contoured to card edges with zero card fallout."
      });
    }, 850);
  };

  // Tap to Pay
  const handleTapToPay = () => {
    const isProtected = mechanismMode === 'sliding' ? slideProgress < 30 : foldProgress < 40;
    if (isProtected) {
      soundManager.playPosDecline();
      setPosStatus('blocked');
      setTimeout(() => setPosStatus(null), 3500);
    } else {
      soundManager.playPosSuccess();
      setPosStatus('success');
      setTimeout(() => setPosStatus(null), 4000);
    }
  };

  // RFID Skim Test
  const handleTriggerSkim = () => {
    setSimulatingSkim(true);
    setSkimResult(null);
    soundManager.playRfidScanSound();

    setTimeout(() => {
      setSimulatingSkim(false);
      setSkimResult({
        blocked: true,
        title: "RFID / NFC SKIMMING ATTEMPT BLOCKED",
        msg: mechanismMode === 'sliding'
          ? "Patented 6063 aerospace aluminium Faraday cage blocked 100% of 13.56 MHz electromagnetic radio waves."
          : "Integrated RFID-blocking metallic mesh lining sandwiched between leather walls attenuates skimming signals by -92dB."
      });
    }, 1100);
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
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#FFFFFF' }}>{product?.name || "Secrid Luxury EDC Wallet"}</span>
              <span style={{
                fontSize: '9px',
                fontWeight: 800,
                color: mechanismMode === 'sliding' ? '#38BDF8' : '#C0A068',
                backgroundColor: mechanismMode === 'sliding' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(192, 160, 104, 0.15)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)'
              }}>
                {mechanismMode === 'sliding' ? 'SLIDING MECHANISM 3D' : 'FOLDABLE BIFOLD 3D'}
              </span>
            </div>
            <span style={{ fontSize: '10px', color: '#9CA3AF' }}>
              {mechanismMode === 'sliding'
                ? '6063 Aluminium Core • Corner Spring-Lever Cascading Fan'
                : `${leatherColor.name} • Internal ₹500 Billfold Sleeve & 4 Card Slots`}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={handleTriggerShake}
            disabled={isShaking}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: isShaking ? '#EF4444' : 'rgba(255,255,255,0.08)',
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
            <ShieldCheck size={12} />
            {isShaking ? 'Inverting & Shaking...' : 'Test Friction Grip'}
          </button>

          <button
            onClick={mechanismMode === 'sliding' ? handleToggleSlide : handleToggleFold}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: mechanismMode === 'sliding' ? '#38BDF8' : '#C0A068',
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
            <span>
              {mechanismMode === 'sliding'
                ? (slideProgress >= 50 ? 'Retract Cards' : 'Cascade Cards')
                : (foldProgress >= 50 ? 'Fold Closed' : 'Unfold Flat')}
            </span>
          </button>
        </div>
      </div>

      {/* DUAL MECHANISM SELECTOR TABS */}
      <div style={{
        display: 'flex',
        gap: '10px',
        width: '100%',
        backgroundColor: '#11141C',
        padding: '6px',
        borderRadius: '12px',
        border: '1px solid #2B3245'
      }}>
        <button
          onClick={() => {
            setMechanismMode('sliding');
            soundManager.play('click');
          }}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '8px',
            border: mechanismMode === 'sliding' ? '1px solid #38BDF8' : 'none',
            backgroundColor: mechanismMode === 'sliding' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            color: mechanismMode === 'sliding' ? '#38BDF8' : '#94A3B8',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <CreditCard size={15} />
          <span>🗂️ Aluminium Spring-Lever Sliding Mechanism</span>
        </button>

        <button
          onClick={() => {
            setMechanismMode('foldable');
            soundManager.play('pop');
          }}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '8px',
            border: mechanismMode === 'foldable' ? '1px solid #C0A068' : 'none',
            backgroundColor: mechanismMode === 'foldable' ? 'rgba(192, 160, 104, 0.15)' : 'transparent',
            color: mechanismMode === 'foldable' ? '#C0A068' : '#94A3B8',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <BookOpen size={15} />
          <span>📖 Leather Foldable Bifold Mechanism</span>
        </button>
      </div>

      {/* CONTINUOUS SLIDING / FOLDING MECHANISM SLIDER BAR */}
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
            <SlidersHorizontal size={16} color={mechanismMode === 'sliding' ? '#38BDF8' : '#C0A068'} />
            <span style={{ fontSize: '12px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.04em' }}>
              {mechanismMode === 'sliding'
                ? 'TACTILE SPRING-LEVER SLIDING & CARD CASCADING MECHANISM:'
                : 'LEATHER BIFOLD FOLDING & OPENING MECHANISM (CASH INSIDE):'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', color: '#9CA3AF' }}>
            {mechanismMode === 'sliding' ? (
              <>
                <span>Lever Angle: <strong style={{ color: '#38BDF8' }}>{Math.round((slideProgress / 100) * 25)}°</strong></span>
                <span>•</span>
                <span>Cascade State: <strong style={{ color: slideProgress > 40 ? '#10B981' : '#F59E0B' }}>
                  {slideProgress > 40 ? '5 Cards Ejected' : 'Retracted in Faraday Cage'}
                </strong></span>
              </>
            ) : (
              <>
                <span>Opening Angle: <strong style={{ color: '#C0A068' }}>{Math.round((foldProgress / 100) * 180)}°</strong></span>
                <span>•</span>
                <span>Spine State: <strong style={{ color: foldProgress > 50 ? '#10B981' : '#F59E0B' }}>
                  {foldProgress > 50 ? 'Full 180° Interior Access' : 'Folded for Pocket Carry'}
                </strong></span>
              </>
            )}
          </div>
        </div>

        {/* Real-time Slider Control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '10.5px', color: '#9CA3AF', fontWeight: 700, width: '90px' }}>
            {mechanismMode === 'sliding' ? '0% (RETRACTED)' : '0° (CLOSED)'}
          </span>

          <input
            type="range"
            min="0"
            max="100"
            value={mechanismMode === 'sliding' ? slideProgress : foldProgress}
            onChange={(e) => mechanismMode === 'sliding' ? handleSlideSliderChange(e.target.value) : handleFoldSliderChange(e.target.value)}
            style={{
              flex: 1,
              height: '8px',
              borderRadius: '4px',
              accentColor: mechanismMode === 'sliding' ? '#38BDF8' : '#C0A068',
              cursor: 'grab'
            }}
          />

          <span style={{ fontSize: '10.5px', color: '#9CA3AF', fontWeight: 700, width: '90px', textAlign: 'right' }}>
            {mechanismMode === 'sliding' ? '100% (CASCADED)' : '180° (FLAT OPEN)'}
          </span>
        </div>

        {/* Quick action buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', paddingTop: '4px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleTriggerSkim}
              disabled={simulatingSkim}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #EF4444',
                color: '#FCA5A5',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Radio size={12} className={simulatingSkim ? 'animate-spin' : ''} />
              13.56MHz RFID Attack Test
            </button>

            <button
              onClick={handleTapToPay}
              style={{
                padding: '5px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: '#2563EB',
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
              <Wifi size={12} />
              Test Tap-to-Pay POS
            </button>
          </div>

          <div style={{ fontSize: '10.5px', color: '#9CA3AF' }}>
            {mechanismMode === 'sliding'
              ? <span>Capacity: <strong style={{ color: '#38BDF8' }}>5 EMV Cards in Stepped Fan</strong></span>
              : <span>Holdings: <strong style={{ color: '#10B981' }}>₹500 Note Inside Sleeve + 4 Cards</strong></span>}
          </div>
        </div>
      </div>

      {/* POS Notification Banner */}
      {posStatus && (
        <div style={{
          width: '100%',
          maxWidth: '740px',
          padding: '12px 18px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          backgroundColor: posStatus === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: posStatus === 'success' ? '1px solid #10B981' : '1px solid #EF4444',
          color: posStatus === 'success' ? '#6EE7B7' : '#FCA5A5'
        }}>
          <span style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Receipt size={16} />
            {posStatus === 'success'
              ? `PAYMENT APPROVED: ₹4,999 Tap-to-Pay Authorized on ${cardsData[selectedCardIdx].name}`
              : 'POS BLOCKED: Faraday Cage Active (-92dB attenuation).'}
          </span>
          <span style={{ fontSize: '10px', color: '#FFFFFF', opacity: 0.85 }}>
            {posStatus === 'success' ? 'EMV ISO/IEC 14443 Verified' : 'Actuate lever / Unfold to Pay'}
          </span>
        </div>
      )}

      {/* Shake Test Result Banner */}
      {shakeResult && (
        <div style={{
          width: '100%',
          maxWidth: '740px',
          padding: '10px 16px',
          borderRadius: '8px',
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          border: '1px solid #3B82F6',
          color: '#93C5FD',
          fontSize: '11.5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="#60A5FA" />
            {shakeResult.msg}
          </span>
          <strong style={{ backgroundColor: '#1E3A8A', padding: '3px 8px', borderRadius: '4px', color: '#FFFFFF', fontSize: '11px' }}>
            {shakeResult.grip}
          </strong>
        </div>
      )}

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
            <Rotate3d size={12} color={mechanismMode === 'sliding' ? '#38BDF8' : '#C0A068'} />
            <span>Drag to rotate 360° • Scroll to zoom</span>
          </div>

          {/* Status Badge */}
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: mechanismMode === 'sliding' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(192, 160, 104, 0.2)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            border: mechanismMode === 'sliding' ? '1px solid #38BDF8' : '1px solid #C0A068',
            fontSize: '9.5px',
            fontWeight: 800,
            color: mechanismMode === 'sliding' ? '#38BDF8' : '#C0A068',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            pointerEvents: 'none'
          }}>
            {mechanismMode === 'sliding' ? (
              <>
                <CreditCard size={12} />
                <span>{slideProgress > 40 ? '5 CARDS CASCADED' : 'FARADAY RFID SHIELD ACTIVE'}</span>
              </>
            ) : (
              <>
                <BookOpen size={12} />
                <span>{foldProgress > 50 ? `UNFOLDED (${Math.round((foldProgress / 100) * 180)}°)` : 'FOLDED POCKET CARRY'}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Skimmer Result Banner */}
      {skimResult && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid #10B981',
          borderRadius: 'var(--radius-md)',
          padding: '14px 18px',
          width: '100%',
          maxWidth: '740px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontWeight: 800, fontSize: '12px' }}>
            <CheckCircle2 size={16} />
            {skimResult.title}
          </div>
          <p style={{ fontSize: '12px', color: '#E5E7EB', marginTop: '4px', lineHeight: 1.45 }}>
            {skimResult.msg}
          </p>
        </div>
      )}
    </div>
  );
}
