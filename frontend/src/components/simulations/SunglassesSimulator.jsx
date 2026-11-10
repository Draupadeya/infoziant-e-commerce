import React, { useState, useEffect, useRef } from 'react';
import { Eye, Shield, SlidersHorizontal, Image as ImageIcon, Rotate3d, Sparkles, Sun } from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { soundManager } from '../../utils/audio';
import { createCarbonFiberTexture, createGroundShadow } from '../../utils/threeTextures';

export default function SunglassesSimulator({ product }) {
  const [polarizationPos, setPolarizationPos] = useState(75); // 0-100 slider
  const [isFlexing, setIsFlexing] = useState(false);
  const canvasRef = useRef(null);

  // Three.js object references
  const leftLensMatRef = useRef(null);
  const rightLensMatRef = useRef(null);
  const leftTempleRef = useRef(null);
  const rightTempleRef = useRef(null);
  const glareMeshRef = useRef(null);

  const itemPhoto = product?.image_url || "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=90";

  // Three.js 3D Scene Initialization
  useEffect(() => {
    if (!canvasRef.current) return;
    const container = canvasRef.current;
    const width = container.clientWidth || 480;
    const height = container.clientHeight || 340;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0A0C10');

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 5.0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 9;
    controls.minDistance = 2.5;

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);

    const blueRimLight = new THREE.DirectionalLight(0x38BDF8, 1.8);
    blueRimLight.position.set(-4, -2, -3);
    scene.add(blueRimLight);

    const sunGlareLight = new THREE.PointLight(0xFFFBEB, 3.0, 15);
    sunGlareLight.position.set(2, 3, 3);
    scene.add(sunGlareLight);

    // Ground Shadow
    const groundShadow = createGroundShadow();
    groundShadow.position.y = -1.4;
    scene.add(groundShadow);

    // Sunglasses Group
    const glassesGroup = new THREE.Group();
    scene.add(glassesGroup);

    // Materials
    const frameMat = new THREE.MeshStandardMaterial({
      map: createCarbonFiberTexture(),
      roughness: 0.35,
      metalness: 0.2,
      color: 0x1E232A
    });

    const titaniumMat = new THREE.MeshStandardMaterial({
      roughness: 0.2,
      metalness: 0.85,
      color: 0x94A3B8
    });

    const lensMat = new THREE.MeshPhysicalMaterial({
      color: 0x0A1826,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.55,
      ior: 1.52,
      reflectivity: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      transparent: true,
      opacity: 0.88
    });
    leftLensMatRef.current = lensMat;
    rightLensMatRef.current = lensMat;

    // 1. Left & Right Lens Frames (Sculpted Torus / Extruded Ring)
    const frameShape = new THREE.Shape();
    // Rounded rectangular wayfarer/aviator shape
    const w = 0.9, h = 0.65, r = 0.25;
    frameShape.moveTo(-w + r, -h);
    frameShape.lineTo(w - r, -h);
    frameShape.quadraticCurveTo(w, -h, w, -h + r);
    frameShape.lineTo(w, h - r);
    frameShape.quadraticCurveTo(w, h, w - r, h);
    frameShape.lineTo(-w + r, h);
    frameShape.quadraticCurveTo(-w, h, -w, h - r);
    frameShape.lineTo(-w, -h + r);
    frameShape.quadraticCurveTo(-w, -h, -w + r, -h);

    const holeShape = new THREE.Path();
    const iw = 0.8, ih = 0.55, ir = 0.2;
    holeShape.moveTo(-iw + ir, -ih);
    holeShape.lineTo(iw - ir, -ih);
    holeShape.quadraticCurveTo(iw, -ih, iw, -ih + ir);
    holeShape.lineTo(iw, ih - ir);
    holeShape.quadraticCurveTo(iw, ih, iw - ir, ih);
    holeShape.lineTo(-iw + ir, ih);
    holeShape.quadraticCurveTo(-iw, ih, -iw, ih - ir);
    holeShape.lineTo(-iw, -ih + ir);
    holeShape.quadraticCurveTo(-iw, -ih, -iw + ir, -ih);
    frameShape.holes.push(holeShape);

    const extrudeSettings = { depth: 0.12, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.03, bevelThickness: 0.03 };
    const rimGeo = new THREE.ExtrudeGeometry(frameShape, extrudeSettings);

    // Left Rim
    const leftRim = new THREE.Mesh(rimGeo, frameMat);
    leftRim.position.set(-1.08, 0, 0);
    leftRim.scale.set(0.9, 0.9, 0.9);
    glassesGroup.add(leftRim);

    // Right Rim
    const rightRim = new THREE.Mesh(rimGeo, frameMat);
    rightRim.position.set(1.08, 0, 0);
    rightRim.scale.set(0.9, 0.9, 0.9);
    glassesGroup.add(rightRim);

    // 2. Lenses (Curved Elliptical Plates)
    const lensGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.04, 32);
    lensGeo.rotateX(Math.PI / 2);
    lensGeo.scale(1.05, 0.75, 1);

    const leftLens = new THREE.Mesh(lensGeo, lensMat);
    leftLens.position.set(-1.08, 0, 0.06);
    glassesGroup.add(leftLens);

    const rightLens = new THREE.Mesh(lensGeo, lensMat);
    rightLens.position.set(1.08, 0, 0.06);
    glassesGroup.add(rightLens);

    // 3. Glare Highlight Simulation Plate (fades out as polarization approaches 100%)
    const glareGeo = new THREE.PlaneGeometry(0.65, 0.65);
    const glareMat = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    const glareMesh = new THREE.Mesh(glareGeo, glareMat);
    glareMesh.position.set(-0.85, 0.15, 0.1);
    glareMesh.rotation.z = 0.4;
    glassesGroup.add(glareMesh);
    glareMeshRef.current = glareMat;

    // 4. Titanium Nose Bridge (Center Connector)
    const bridgeGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 16);
    bridgeGeo.rotateZ(Math.PI / 2);
    const bridge = new THREE.Mesh(bridgeGeo, titaniumMat);
    bridge.position.set(0, 0.12, 0.06);
    glassesGroup.add(bridge);

    // Top brow bar
    const browGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.58, 16);
    browGeo.rotateZ(Math.PI / 2);
    const brow = new THREE.Mesh(browGeo, frameMat);
    brow.position.set(0, 0.35, 0.06);
    glassesGroup.add(brow);

    // 5. Left & Right Temples (Arms extending backwards)
    const templeGeo = new THREE.BoxGeometry(0.06, 0.12, 2.2);
    templeGeo.translate(0, 0, -1.1); // pivot at hinge front

    // Left Temple Pivot
    const leftHinge = new THREE.Group();
    leftHinge.position.set(-1.95, 0.15, 0.05);
    const leftArm = new THREE.Mesh(templeGeo, frameMat);
    leftHinge.add(leftArm);

    // Hinge screw
    const screwGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.16, 12);
    const leftScrew = new THREE.Mesh(screwGeo, titaniumMat);
    leftHinge.add(leftScrew);
    glassesGroup.add(leftHinge);
    leftTempleRef.current = leftHinge;

    // Right Temple Pivot
    const rightHinge = new THREE.Group();
    rightHinge.position.set(1.95, 0.15, 0.05);
    const rightArm = new THREE.Mesh(templeGeo, frameMat);
    rightHinge.add(rightArm);
    const rightScrew = new THREE.Mesh(screwGeo, titaniumMat);
    rightHinge.add(rightScrew);
    glassesGroup.add(rightHinge);
    rightTempleRef.current = rightHinge;

    // Tilt entire glasses slightly for optimal studio showcase
    glassesGroup.rotation.x = 0.12;
    glassesGroup.rotation.y = -0.25;

    // Animation loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();

      // Subtle float
      glassesGroup.position.y = Math.sin(Date.now() * 0.0015) * 0.04;
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

  // Update lens physical properties based on continuous polarization slider
  useEffect(() => {
    const factor = polarizationPos / 100; // 0 = raw glare, 1 = 100% polarized
    if (leftLensMatRef.current) {
      // At 100% polarization: specular glare extinguished, deep Japanese TAC blue/black tint
      leftLensMatRef.current.reflectivity = THREE.MathUtils.lerp(0.95, 0.12, factor);
      leftLensMatRef.current.transmission = THREE.MathUtils.lerp(0.3, 0.75, factor);
      leftLensMatRef.current.roughness = THREE.MathUtils.lerp(0.02, 0.08, factor);
    }
    if (glareMeshRef.current) {
      // Extinguish blinding glare plate
      glareMeshRef.current.opacity = (1 - factor) * 0.7;
    }
  }, [polarizationPos]);

  // Memory hinge 45° flex animation
  const handleFlexTest = () => {
    soundManager.playMechanicalClick(1700, 0.035);
    setIsFlexing(true);

    if (leftTempleRef.current && rightTempleRef.current) {
      // Flex outward
      leftTempleRef.current.rotation.y = 0.45;
      rightTempleRef.current.rotation.y = -0.45;
    }

    setTimeout(() => {
      soundManager.playRetractSound();
      if (leftTempleRef.current && rightTempleRef.current) {
        // Snap back
        leftTempleRef.current.rotation.y = 0;
        rightTempleRef.current.rotation.y = 0;
      }
      setIsFlexing(false);
    }, 1200);
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
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#FFFFFF' }}>{product?.name || "AeroGrid Carbon Sunglasses"}</span>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#C0A068', backgroundColor: 'rgba(192, 160, 104, 0.15)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                THREE.JS 3D PBR
              </span>
            </div>
            <span style={{ fontSize: '10px', color: '#9CA3AF' }}>9-Layer Japanese Polarized Triacetate Filter (UV400 Certified)</span>
          </div>
        </div>

        <button
          onClick={handleFlexTest}
          disabled={isFlexing}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: isFlexing ? '#F59E0B' : 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: isFlexing ? '#0F172A' : '#FFFFFF',
            fontSize: '11px',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          {isFlexing ? 'Flexing 45° Beta-Titanium...' : 'Test Memory Hinge (Flex 45°)'}
        </button>
      </div>

      {/* CONTINUOUS POLARIZED SLIDING MECHANISM BAR */}
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
            3D POLARIZED LENS GLARE REDUCTION SLIDING MECHANISM:
          </span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span>Polarized Filter: <strong style={{ color: '#C0A068' }}>{polarizationPos}%</strong></span>
            <span>•</span>
            <span>Glare Cancellation: <strong style={{ color: '#10B981' }}>{polarizationPos > 70 ? '99.9% Horizontal Glare Extinguished' : 'Specular Reflection Active'}</strong></span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '10.5px', color: '#9CA3AF', fontWeight: 700 }}>0% (BLINDING GLARE)</span>
          <input
            type="range"
            min="0"
            max="100"
            value={polarizationPos}
            onChange={(e) => {
              setPolarizationPos(parseInt(e.target.value));
              soundManager.playMechanicalClick(1300 + e.target.value * 5, 0.02);
            }}
            style={{
              flex: 1,
              height: '8px',
              borderRadius: '4px',
              accentColor: '#C0A068',
              cursor: 'grab'
            }}
          />
          <span style={{ fontSize: '10.5px', color: '#9CA3AF', fontWeight: 700 }}>100% (POLARIZED 99.9%)</span>
        </div>
      </div>

      {/* Main Simulation Viewport: Photo Reference on Left, Three.js 3D Viewport on Right */}
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

          {/* Polarized Optical Badge */}
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: polarizationPos > 70 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            border: polarizationPos > 70 ? '1px solid #10B981' : '1px solid #F59E0B',
            fontSize: '9.5px',
            fontWeight: 800,
            color: polarizationPos > 70 ? '#34D399' : '#FBBF24',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            pointerEvents: 'none'
          }}>
            <Sun size={12} />
            <span>{polarizationPos > 70 ? 'JAPANESE TAC POLARIZED' : 'RAW SUNLIGHT SPECTRUM'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
