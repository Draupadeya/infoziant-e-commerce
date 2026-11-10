import * as THREE from 'three';

// 1. createDamascusTexture
export function createDamascusTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Base metallic bright silver-steel
  const baseGrad = ctx.createLinearGradient(0, 0, 1024, 1024);
  baseGrad.addColorStop(0, '#94A3B8');
  baseGrad.addColorStop(0.5, '#CBD5E1');
  baseGrad.addColorStop(1, '#64748B');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, 1024, 1024);

  // 67 Layers of folded flowing topography with razor-sharp contrast
  for (let y = -200; y < 1224; y += 7) {
    ctx.beginPath();
    const cycle = (y / 7) % 4;
    if (cycle === 0) {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3.0;
    } else if (cycle === 1) {
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 2.5;
    } else if (cycle === 2) {
      ctx.strokeStyle = '#F1F5F9';
      ctx.lineWidth = 2.0;
    } else {
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2.0;
    }

    for (let x = 0; x <= 1024; x += 12) {
      const wave1 = Math.sin(x * 0.018 + y * 0.025) * 22;
      const wave2 = Math.cos(x * 0.042 - y * 0.015) * 14;
      const wave3 = Math.sin((x + y) * 0.01) * 30;
      const py = y + wave1 + wave2 + wave3;
      if (x === 0) ctx.moveTo(x, py);
      else ctx.lineTo(x, py);
    }
    ctx.stroke();
  }

  // Acid-etched micro-grain
  const imgData = ctx.getImageData(0, 0, 1024, 1024);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 22;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 2. createBrushedMetalTexture
export function createBrushedMetalTexture(color = '#D1D5DB') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 512, 512);

  // Fine horizontal brush streaks
  for (let i = 0; i < 4000; i++) {
    const y = Math.random() * 512;
    const length = 50 + Math.random() * 400;
    const x = Math.random() * 512;
    const opacity = 0.04 + Math.random() * 0.12;
    const isLight = Math.random() > 0.5;
    ctx.strokeStyle = isLight ? `rgba(255,255,255,${opacity})` : `rgba(0,0,0,${opacity})`;
    ctx.lineWidth = 0.5 + Math.random() * 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + length, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 3. createCarbonFiberTexture
export function createCarbonFiberTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0F1216';
  ctx.fillRect(0, 0, 128, 128);

  const size = 16;
  for (let y = 0; y < 128; y += size) {
    for (let x = 0; x < 128; x += size) {
      const isAlt = ((x / size) + (y / size)) % 2 === 0;
      const grad = ctx.createLinearGradient(x, y, x + size, y + size);
      if (isAlt) {
        grad.addColorStop(0, '#2D333B');
        grad.addColorStop(0.5, '#16191E');
        grad.addColorStop(1, '#0B0D10');
      } else {
        grad.addColorStop(0, '#1E232A');
        grad.addColorStop(0.5, '#38414D');
        grad.addColorStop(1, '#13161A');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, size, size);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

// 4. createRipstopTexture
export function createRipstopTexture(baseTone = '#242F3E') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Rich tactical navy/slate fabric
  ctx.fillStyle = baseTone;
  ctx.fillRect(0, 0, 512, 512);

  // Micro Cordura ballistic weave (interlocking warp and weft)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  for (let y = 0; y < 512; y += 4) {
    for (let x = 0; x < 512; x += 4) {
      if ((x + y) % 8 === 0) {
        ctx.fillRect(x, y, 2, 2);
      }
    }
  }

  // Bold Diagonal X-Ply reinforcing grid lines (Signature X-Pac diamond pattern)
  const step = 48;
  for (let i = -512; i < 1024; i += step) {
    // Drop shadow under thread
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(i + 1, 1);
    ctx.lineTo(i + 513, 513);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(i + 1, 513);
    ctx.lineTo(i + 513, 1);
    ctx.stroke();

    // High-contrast Kevlar/Polyester reinforcing fiber
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.38)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 512, 512);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(i, 512);
    ctx.lineTo(i + 512, 0);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

// 5. createKeycapTexture
export function createKeycapTexture(label = 'M1', sub = '', isWide = false) {
  const canvas = document.createElement('canvas');
  canvas.width = isWide ? 384 : 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const cx = isWide ? 192 : 128;

  // Keycap concave dish gradient
  const grad = ctx.createRadialGradient(cx, 128, 20, cx, 128, isWide ? 180 : 128);
  grad.addColorStop(0, '#282E3A');
  grad.addColorStop(0.85, '#1B2029');
  grad.addColorStop(1, '#11141A');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, 256);

  // Keycap border bevel ring
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, canvas.width - 16, 240);

  // Text Legend
  ctx.fillStyle = '#FFFFFF';
  const fontSize = label.length > 3 ? 36 : label.length > 2 ? 42 : 54;
  ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cx, sub ? 112 : 128);

  if (sub) {
    ctx.fillStyle = '#C0A068';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(sub, cx, 168);
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// 6. createPinkHandbagTexture
export function createPinkHandbagTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Pastel luxury pink calfskin base
  ctx.fillStyle = '#F4A6BA'; // Matching the exact soft rose pink in photo
  ctx.fillRect(0, 0, 512, 512);

  // Fine leather pebble micro-grain
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 12;
    data[i] = Math.min(255, Math.max(0, data[i] + grain));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain));
  }
  ctx.putImageData(imgData, 0, 0);

  // Chevron V-Stripes on the front flap (Warm Cream White & Pastel Yellow)
  // Outer Cream White Chevron Band
  ctx.lineWidth = 22;
  ctx.strokeStyle = '#FEF3C7'; // Warm cream
  ctx.beginPath();
  ctx.moveTo(30, 210);
  ctx.lineTo(256, 310);
  ctx.lineTo(482, 210);
  ctx.stroke();

  // Inner Pastel Yellow Chevron Band
  ctx.lineWidth = 18;
  ctx.strokeStyle = '#FDE047'; // Pastel yellow
  ctx.beginPath();
  ctx.moveTo(30, 250);
  ctx.lineTo(256, 350);
  ctx.lineTo(482, 250);
  ctx.stroke();

  // Saddle stitching perimeter
  ctx.strokeStyle = '#FBCFE8';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(8, 8, 496, 496);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// 7. createBanknoteTexture
export function createBanknoteTexture(denom = '₹500') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 240;
  const ctx = canvas.getContext('2d');

  // Stone grey / green reserve currency paper
  const grad = ctx.createLinearGradient(0, 0, 512, 240);
  grad.addColorStop(0, '#78897D');
  grad.addColorStop(0.5, '#92A598');
  grad.addColorStop(1, '#6E8073');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 240);

  // Guilloche geometric security patterns
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 512; i += 20) {
    ctx.beginPath();
    ctx.arc(i, 120, 45, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Metallic security thread
  ctx.fillStyle = '#065F46';
  ctx.fillRect(360, 0, 12, 240);
  ctx.fillStyle = '#D97706';
  ctx.fillRect(362, 0, 8, 240);

  // Denomination text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px monospace';
  ctx.fillText(denom, 40, 60);
  ctx.fillText(denom, 400, 200);

  ctx.font = '14px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText('RESERVE BANK SECURE CURRENCY', 40, 100);
  ctx.fillText('GUARANTEED BY CENTRAL MONETARY AUTHORITY', 40, 130);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// 8. createCardTexture
export function createCardTexture({ name, num, network, bg1, bg2, textColor }) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');

  // Background Gradient
  const grad = ctx.createLinearGradient(0, 0, 512, 320);
  grad.addColorStop(0, bg1 || '#1E293B');
  grad.addColorStop(1, bg2 || '#0F172A');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 320);

  // Subtle Holographic Sheen
  const holo = ctx.createLinearGradient(0, 0, 512, 320);
  holo.addColorStop(0, 'rgba(255,255,255,0.12)');
  holo.addColorStop(0.5, 'transparent');
  holo.addColorStop(1, 'rgba(255,255,255,0.06)');
  ctx.fillStyle = holo;
  ctx.fillRect(0, 0, 512, 320);

  // EMV Chip (Gold with circuitry traces)
  ctx.fillStyle = '#D97706';
  ctx.fillRect(40, 80, 70, 55);
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 80, 70, 55);
  ctx.beginPath();
  ctx.moveTo(75, 80); ctx.lineTo(75, 135);
  ctx.moveTo(40, 107); ctx.lineTo(110, 107);
  ctx.stroke();

  // Contactless Radio Waves Symbol
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(140, 107, 12, -0.6, 0.6);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(140, 107, 18, -0.6, 0.6);
  ctx.stroke();

  // Bank Name & Network
  ctx.fillStyle = textColor || '#FFFFFF';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(name || 'VAULTEX INFINIA METAL', 40, 50);

  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(network || 'RuPay Global', 472, 50);
  ctx.textAlign = 'left';

  // Embossed Card Numbers (with simulated shadow and highlight)
  ctx.font = 'bold 26px monospace';
  ctx.fillStyle = '#000000';
  ctx.fillText(num || '•••• 5491', 41, 231);
  ctx.fillStyle = '#F8FAFC';
  ctx.fillText(num || '•••• 5491', 40, 230);

  // Expiration & Cardholder
  ctx.font = '14px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillText('VALID THRU 09/31', 40, 275);
  ctx.fillText('VAULTEX PRIVILEGE MEMBER', 260, 275);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// 9. createGroundShadow
export function createGroundShadow() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
  grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  const geo = new THREE.PlaneGeometry(10, 10);
  const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.8 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -2.5;
  return mesh;
}

// 10. createLeatherTexture
export function createLeatherTexture(baseColor = '#5C381E') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 512, 512);

  // Pebbled organic leather pores
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;

  // Add micro-noise and organic cellular grain
  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 512; x++) {
      const idx = (y * 512 + x) * 4;
      // Perlin-style pore cells
      const cell = Math.sin(x * 0.18) * Math.cos(y * 0.18) * 12 +
                   Math.sin(x * 0.35 + y * 0.25) * 8 +
                   (Math.random() - 0.5) * 14;

      data[idx] = Math.min(255, Math.max(0, data[idx] + cell));
      data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + cell * 0.8));
      data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + cell * 0.6));
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Saddle stitching edge details
  ctx.strokeStyle = 'rgba(255, 230, 180, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(10, 10, 492, 492);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

// 11. createKnurledTexture
export function createKnurledTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#262930';
  ctx.fillRect(0, 0, 128, 128);

  ctx.strokeStyle = '#4A505C';
  ctx.lineWidth = 1.2;
  const step = 8;
  for (let i = -128; i < 256; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, 0); ctx.lineTo(i + 128, 128);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(i, 128); ctx.lineTo(i + 128, 0);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

// 12. createPcbCircuitTexture
export function createPcbCircuitTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Matte Black FR4 substrate
  ctx.fillStyle = '#0D1117';
  ctx.fillRect(0, 0, 512, 512);

  // Gold ENIG Traces
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 2.5;

  for (let i = 20; i < 500; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 30);
    ctx.lineTo(i, 140);
    ctx.lineTo(i + 25, 165);
    ctx.lineTo(i + 25, 340);
    ctx.lineTo(i + 50, 365);
    ctx.lineTo(i + 50, 480);
    ctx.stroke();

    // Solder pads / vias
    ctx.fillStyle = '#FBBF24';
    ctx.beginPath();
    ctx.arc(i, 30, 4, 0, Math.PI * 2);
    ctx.arc(i + 50, 480, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Micro IC chip pads
  ctx.fillStyle = '#374151';
  ctx.fillRect(190, 190, 132, 132);
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(190, 190, 132, 132);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 13. createWatchFaceTexture
export function createWatchFaceTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Deep Sunburst Dial
  const grad = ctx.createRadialGradient(512, 512, 40, 512, 512, 500);
  grad.addColorStop(0, '#1E293B');
  grad.addColorStop(0.7, '#0F172A');
  grad.addColorStop(1, '#020617');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Circular brushed radial sheen
  ctx.save();
  ctx.translate(512, 512);
  for (let a = 0; a < 360; a += 0.5) {
    const rad = (a * Math.PI) / 180;
    ctx.strokeStyle = Math.random() > 0.6 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(rad) * 480, Math.sin(rad) * 480);
    ctx.stroke();
  }

  // Minute / Hour indices
  for (let i = 0; i < 60; i++) {
    const angle = (i * 6 * Math.PI) / 180;
    const isHour = i % 5 === 0;
    const rInner = isHour ? 410 : 445;
    const rOuter = 475;

    ctx.strokeStyle = isHour ? '#E2E8F0' : 'rgba(255,255,255,0.4)';
    ctx.lineWidth = isHour ? 6 : 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * rInner, Math.sin(angle) * rInner);
    ctx.lineTo(Math.cos(angle) * rOuter, Math.sin(angle) * rOuter);
    ctx.stroke();

    // Luminescent pip on hour markers
    if (isHour) {
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * (rInner - 22), Math.sin(angle) * (rInner - 22), 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Dial Typography
  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('VAULTEX AUTOMATIC', 0, -180);
  ctx.font = '600 24px sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('CHRONOMETER 300M / 1000FT', 0, 200);
  ctx.fillStyle = '#EF4444';
  ctx.fillText('SUPERLATIVE CO-AXIAL', 0, 235);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// 14. createFieldWatchFaceTexture
export function createFieldWatchFaceTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Matte tactical anti-reflective dial base
  ctx.fillStyle = '#0F1318';
  ctx.fillRect(0, 0, 1024, 1024);

  ctx.save();
  ctx.translate(512, 512);

  // Outer railroad minute track
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 460, 0, Math.PI * 2);
  ctx.arc(0, 0, 440, 0, Math.PI * 2);
  ctx.stroke();

  // 60-minute tick marks
  for (let i = 0; i < 60; i++) {
    const angle = (i * 6 * Math.PI) / 180;
    const isFive = i % 5 === 0;
    const rIn = isFive ? 430 : 445;
    ctx.strokeStyle = isFive ? '#38BDF8' : '#94A3B8';
    ctx.lineWidth = isFive ? 5 : 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * rIn, Math.sin(angle) * rIn);
    ctx.lineTo(Math.cos(angle) * 460, Math.sin(angle) * 460);
    ctx.stroke();
  }

  // Large bold 1-12 Arabic field numerals
  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 54px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const numerals = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
  numerals.forEach((num, idx) => {
    if (num === '3') return; // Date window spot
    const angle = ((idx * 30 - 90) * Math.PI) / 180;
    const r = 370;
    ctx.fillText(num, Math.cos(angle) * r, Math.sin(angle) * r);
  });

  // Inner 13-24 military hours track
  ctx.fillStyle = '#F59E0B';
  ctx.font = 'bold 26px monospace';
  const milNumerals = ['24', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
  milNumerals.forEach((num, idx) => {
    if (num === '15') return;
    const angle = ((idx * 30 - 90) * Math.PI) / 180;
    const r = 275;
    ctx.fillText(num, Math.cos(angle) * r, Math.sin(angle) * r);
  });

  // Date window aperture at 3 o'clock
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(315, -30, 75, 60);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 3;
  ctx.strokeRect(315, -30, 75, 60);
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 36px monospace';
  ctx.fillText('28', 352, 2);

  // Field Watch Typography
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 32px sans-serif';
  ctx.fillText('APEX TITANIUM', 0, -145);
  ctx.font = 'bold 20px monospace';
  ctx.fillStyle = '#38BDF8';
  ctx.fillText('AUTOMATIC 24 JEWELS', 0, -115);
  ctx.fillStyle = '#94A3B8';
  ctx.font = '18px sans-serif';
  ctx.fillText('100M WATER RESIST', 0, 150);

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// 15. createSolarChronoDialTexture
export function createSolarChronoDialTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Sunburst Deep Midnight Navy Blue
  const grad = ctx.createRadialGradient(512, 512, 40, 512, 512, 500);
  grad.addColorStop(0, '#1E293B');
  grad.addColorStop(0.65, '#0B132B');
  grad.addColorStop(1, '#020617');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  ctx.save();
  ctx.translate(512, 512);

  // Tachymeter / Chrono track
  for (let i = 0; i < 120; i++) {
    const angle = (i * 3 * Math.PI) / 180;
    const isMajor = i % 10 === 0;
    const rIn = isMajor ? 435 : 455;
    ctx.strokeStyle = isMajor ? '#E2E8F0' : 'rgba(255,255,255,0.35)';
    ctx.lineWidth = isMajor ? 4 : 1.5;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * rIn, Math.sin(angle) * rIn);
    ctx.lineTo(Math.cos(angle) * 475, Math.sin(angle) * 475);
    ctx.stroke();
  }

  // Applied faceted silver hour markers
  for (let i = 0; i < 12; i++) {
    const angle = ((i * 30 - 90) * Math.PI) / 180;
    ctx.save();
    ctx.translate(Math.cos(angle) * 390, Math.sin(angle) * 390);
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(-8, -25, 16, 50);
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(-3, -20, 6, 40);
    ctx.restore();
  }

  // Top Sub-Dial at 12 o'clock (30-Minute Chronograph Counter)
  ctx.save();
  ctx.translate(0, -180);
  ctx.beginPath();
  ctx.arc(0, 0, 115, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.stroke();
  for (let s = 0; s < 30; s += 5) {
    const a = ((s / 30) * Math.PI * 2) - Math.PI / 2;
    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`${s}`, Math.cos(a) * 80, Math.sin(a) * 80 + 7);
  }
  ctx.restore();

  // Bottom Sub-Dial at 6 o'clock (60-Second Running Seconds)
  ctx.save();
  ctx.translate(0, 180);
  ctx.beginPath();
  ctx.arc(0, 0, 115, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.stroke();
  for (let s = 0; s < 60; s += 15) {
    const a = ((s / 60) * Math.PI * 2) - Math.PI / 2;
    ctx.fillStyle = '#EF4444';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`${s}`, Math.cos(a) * 80, Math.sin(a) * 80 + 7);
  }
  ctx.restore();

  // Chrono Typography
  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ECLIPSE SOLAR', 220, -15);
  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = '#D97706';
  ctx.fillText('TACHYMETER', 220, 15);

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// 16. createTacticalStrapTexture
export function createTacticalStrapTexture(color = '#1E293B') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 256, 512);

  // Horizontal tactile grip ribs
  for (let y = 0; y < 512; y += 14) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(16, y, 224, 6);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(16, y + 6, 224, 4);
  }

  // Side beveled edge borders
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(0, 0, 16, 512);
  ctx.fillRect(240, 0, 16, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 17. createAlligatorStrapTexture
export function createAlligatorStrapTexture(color = '#78350F') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 256, 512);

  // Alligator scale tiles
  for (let y = 10; y < 500; y += 38) {
    for (let x = 20; x < 236; x += 48) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, 44, 34);

      // Scale dome gradient
      const scaleGrad = ctx.createRadialGradient(x + 22, y + 17, 4, x + 22, y + 17, 24);
      scaleGrad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
      scaleGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = scaleGrad;
      ctx.fillRect(x + 2, y + 2, 40, 30);
    }
  }

  // Ivory / Cream contrast saddle stitching along lateral borders
  ctx.strokeStyle = '#FEF3C7';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(14, 0); ctx.lineTo(14, 512);
  ctx.moveTo(242, 0); ctx.lineTo(242, 512);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 18. createSpeakerGrilleTexture
export function createSpeakerGrilleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Deep space-grey anodized chassis background
  const bgGrad = ctx.createLinearGradient(0, 0, 512, 0);
  bgGrad.addColorStop(0, '#1E232B');
  bgGrad.addColorStop(0.5, '#2A303C');
  bgGrad.addColorStop(1, '#1E232B');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 512, 512);

  // Micro-brush streaks
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  for (let i = 0; i < 600; i++) {
    const y = Math.random() * 512;
    ctx.fillRect(0, y, 512, 0.8);
  }

  // Hexagonal staggered micro-perforated acoustic grille holes
  const stepX = 14;
  const stepY = 12;
  const radius = 3.2;

  for (let y = 0; y < 512; y += stepY) {
    const row = Math.floor(y / stepY);
    const offsetX = (row % 2 === 0) ? 0 : stepX / 2;
    for (let x = -stepX; x < 512 + stepX; x += stepX) {
      const cx = x + offsetX;

      // Dark hole interior
      ctx.beginPath();
      ctx.arc(cx, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#05070A';
      ctx.fill();

      // Chamfered top highlight on each micro-hole
      ctx.beginPath();
      ctx.arc(cx, y - 0.6, radius, Math.PI, 0, false);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 19. createDiverWatchFaceTexture
export function createDiverWatchFaceTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Deep Ocean Abyss Dial Gradient
  const grad = ctx.createRadialGradient(512, 512, 60, 512, 512, 500);
  grad.addColorStop(0, '#06203B');
  grad.addColorStop(0.6, '#030E1C');
  grad.addColorStop(1, '#00040A');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  ctx.save();
  ctx.translate(512, 512);

  // Outer 60-Minute Diver Track
  for (let i = 0; i < 60; i++) {
    const angle = (i * 6 * Math.PI) / 180;
    const isMajor = i % 5 === 0;
    const rIn = isMajor ? 438 : 455;
    ctx.strokeStyle = isMajor ? '#38BDF8' : 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = isMajor ? 5 : 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * rIn, Math.sin(angle) * rIn);
    ctx.lineTo(Math.cos(angle) * 475, Math.sin(angle) * 475);
    ctx.stroke();
  }

  // 12 o'clock Inverted Triangle Luminescent Marker
  ctx.save();
  ctx.translate(0, -385);
  ctx.beginPath();
  ctx.moveTo(0, 32);
  ctx.lineTo(-24, -32);
  ctx.lineTo(24, -32);
  ctx.closePath();
  ctx.fillStyle = '#CBD5E1'; // Steel border
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, 24);
  ctx.lineTo(-18, -26);
  ctx.lineTo(18, -26);
  ctx.closePath();
  ctx.fillStyle = '#E0F2FE'; // Super-LumiNova BGW9 fill
  ctx.fill();
  ctx.restore();

  // 6 and 9 o'clock Heavy Batons
  [6, 9].forEach(hour => {
    const angle = ((hour * 30 - 90) * Math.PI) / 180;
    ctx.save();
    ctx.translate(Math.cos(angle) * 385, Math.sin(angle) * 385);
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(-12, -28, 24, 56);
    ctx.fillStyle = '#E0F2FE';
    ctx.fillRect(-8, -24, 16, 48);
    ctx.restore();
  });

  // Circular Lumed Plots at 1, 2, 4, 5, 7, 8, 10, 11 o'clock
  [1, 2, 4, 5, 7, 8, 10, 11].forEach(hour => {
    const angle = ((hour * 30 - 90) * Math.PI) / 180;
    const x = Math.cos(angle) * 385;
    const y = Math.sin(angle) * 385;
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#CBD5E1'; // Polished silver rim
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, 17, 0, Math.PI * 2);
    ctx.fillStyle = '#E0F2FE'; // Lume plot
    ctx.fill();
  });

  // Date Window at 3 o'clock
  ctx.save();
  ctx.translate(370, 0);
  ctx.fillStyle = '#CBD5E1';
  ctx.fillRect(-26, -20, 52, 40);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(-22, -16, 44, 32);
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('09', 0, 1);
  ctx.restore();

  // Dial Horology Typography
  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ABYSS DIVER', 0, -140);
  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = '#38BDF8';
  ctx.fillText('300m / 1000ft', 0, 140);
  ctx.font = 'bold 15px sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('AUTOMATIC HELIUM VALVE', 0, 175);

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// 20. createStonewashedTitaniumTexture
export function createStonewashedTitaniumTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base stonewashed titanium
  ctx.fillStyle = '#64748B';
  ctx.fillRect(0, 0, 512, 512);

  // Micro-abrasions and tumbled stone marks
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 36;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Laser-etched metric millimeter graduation scale along the right edge
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 1.2;
  for (let y = 10; y < 500; y += 8) {
    const isMajor = (y - 10) % 40 === 0;
    const isMid = (y - 10) % 20 === 0;
    const len = isMajor ? 32 : isMid ? 20 : 12;
    ctx.beginPath();
    ctx.moveTo(512 - len, y);
    ctx.lineTo(512, y);
    ctx.stroke();

    if (isMajor) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${(y - 10) / 8}`, 512 - len - 4, y + 4);
    }
  }

  // Laser engraved spec markings
  ctx.save();
  ctx.translate(140, 256);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('AEROFORGE • TC4 TITANIUM 6MM', 0, 0);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}
