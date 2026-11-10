import React, { useState, useEffect } from 'react';

export default function ProductImage({ 
  src, 
  alt, 
  category = "Wallets", 
  simulationType = "wallet", 
  style = {}, 
  className = "" 
}) {
  const [imageError, setImageError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setImageError(false);
    setLoaded(false);
  }, [src]);

  // High-fidelity, photorealistic vector illustration fallbacks for each product
  const renderRealisticVector = () => {
    switch (simulationType) {
      case 'watch':
        return (
          <svg viewBox="0 0 300 300" width="100%" height="100%" style={{ filter: 'drop-shadow(0 14px 20px rgba(0,0,0,0.25))' }}>
            <defs>
              <linearGradient id="titaniumCase" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9CA3AF" />
                <stop offset="50%" stopColor="#4B5563" />
                <stop offset="100%" stopColor="#1F2937" />
              </linearGradient>
              <radialGradient id="sunburstDial" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1E232B" />
                <stop offset="85%" stopColor="#0B0D11" />
                <stop offset="100%" stopColor="#000000" />
              </radialGradient>
              <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E6CA92" />
                <stop offset="50%" stopColor="#C0A068" />
                <stop offset="100%" stopColor="#8A6D3B" />
              </linearGradient>
            </defs>
            {/* Top & Bottom Straps */}
            <rect x="110" y="10" width="80" height="50" rx="6" fill="#1C1F26" stroke="#374151" strokeWidth="2" />
            <rect x="110" y="240" width="80" height="50" rx="6" fill="#1C1F26" stroke="#374151" strokeWidth="2" />
            {/* Outer Bezel with Tachymeter Ring */}
            <circle cx="150" cy="150" r="95" fill="url(#titaniumCase)" stroke="#6B7280" strokeWidth="4" />
            <circle cx="150" cy="150" r="82" fill="url(#sunburstDial)" stroke="#2D333F" strokeWidth="2" />
            {/* Hour Marks */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
              <line 
                key={i}
                x1="150" y1="72" x2="150" y2={i % 3 === 0 ? "82" : "78"} 
                stroke={i % 3 === 0 ? "url(#goldAccent)" : "#9CA3AF"} 
                strokeWidth={i % 3 === 0 ? "3" : "1.5"} 
                transform={`rotate(${deg} 150 150)`} 
              />
            ))}
            {/* Sub-dials */}
            <circle cx="150" cy="180" r="18" fill="none" stroke="#C0A068" strokeWidth="1" strokeDasharray="2,2" />
            <circle cx="120" cy="150" r="14" fill="none" stroke="#6B7280" strokeWidth="1" />
            {/* Brand Mark */}
            <text x="150" y="122" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="800" fontFamily="sans-serif" letterSpacing="2">VAULTEX</text>
            <text x="150" y="132" textAnchor="middle" fill="#C0A068" fontSize="6" fontWeight="700" fontFamily="sans-serif" letterSpacing="1">AUTOMATIC 100M</text>
            {/* Hands */}
            <line x1="150" y1="150" x2="150" y2="105" stroke="#E5E7EB" strokeWidth="4" strokeLinecap="round" transform="rotate(295 150 150)" />
            <line x1="150" y1="150" x2="150" y2="85" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" transform="rotate(40 150 150)" />
            <line x1="150" y1="165" x2="150" y2="78" stroke="#EF4444" strokeWidth="1.5" transform="rotate(130 150 150)" />
            <circle cx="150" cy="150" r="5" fill="#EF4444" />
            {/* Crown */}
            <rect x="245" y="142" width="12" height="16" rx="2" fill="#9CA3AF" stroke="#4B5563" strokeWidth="1.5" />
          </svg>
        );

      case 'speaker':
        return (
          <svg viewBox="0 0 300 300" width="100%" height="100%" style={{ filter: 'drop-shadow(0 14px 20px rgba(0,0,0,0.35))' }}>
            <defs>
              <linearGradient id="speakerBody" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="30%" stopColor="#1E293B" />
                <stop offset="70%" stopColor="#0F172A" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
            </defs>
            {/* Cylindrical CNC Enclosure */}
            <rect x="105" y="55" width="90" height="190" rx="18" fill="url(#speakerBody)" stroke="#64748B" strokeWidth="2.5" />
            {/* Acoustic Grille Texture Dots */}
            {[75, 95, 115, 135, 155, 175, 195, 215].map((y, row) => (
              <g key={row} opacity="0.45">
                {[118, 130, 142, 154, 166, 178].map((x, col) => (
                  <circle key={col} cx={x + (row % 2) * 5} cy={y} r="2" fill="#94A3B8" />
                ))}
              </g>
            ))}
            {/* Top Capacitive LED Halo */}
            <ellipse cx="150" cy="58" rx="40" ry="12" fill="#020617" stroke="#38BDF8" strokeWidth="2" />
            <circle cx="150" cy="58" r="4" fill="#38BDF8" />
            {/* Bass Radiator Wave Rings */}
            <ellipse cx="150" cy="242" rx="40" ry="10" fill="#0B0F19" stroke="#64748B" strokeWidth="2" />
            <path d="M 85 150 Q 70 150 75 130" stroke="#38BDF8" strokeWidth="2" fill="none" opacity="0.6" />
            <path d="M 215 150 Q 230 150 225 130" stroke="#38BDF8" strokeWidth="2" fill="none" opacity="0.6" />
            <text x="150" y="275" textAnchor="middle" fill="#94A3B8" fontSize="8" fontWeight="800" letterSpacing="1.5">360° CNC ALUMINIUM</text>
          </svg>
        );

      case 'prybar':
        return (
          <svg viewBox="0 0 300 300" width="100%" height="100%" style={{ filter: 'drop-shadow(0 14px 20px rgba(0,0,0,0.3))' }}>
            <defs>
              <linearGradient id="tiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#94A3B8" />
                <stop offset="50%" stopColor="#64748B" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
            </defs>
            {/* Titanium Prybar Billet */}
            <path d="M 125 40 L 165 40 L 165 240 L 140 265 L 125 240 Z" fill="url(#tiGrad)" stroke="#334155" strokeWidth="2.5" />
            {/* Chisel Pry Tip */}
            <polygon points="125,40 165,40 160,25 130,25" fill="#CBD5E1" stroke="#475569" strokeWidth="1.5" />
            {/* Bottle Opener Hook */}
            <path d="M 125 110 Q 140 115 140 130 Q 125 135 125 140" fill="#1E232B" stroke="#334155" strokeWidth="2" />
            {/* 1/4 Hex Driver Socket */}
            <polygon points="145,170 155,175 155,187 145,192 135,187 135,175" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
            {/* Tritium Green Glow Slot */}
            <rect x="141" y="70" width="8" height="24" rx="4" fill="#10B981" filter="drop-shadow(0 0 6px #10B981)" />
            {/* Laser Etched Metric Scale */}
            {[55, 65, 75, 85, 95, 105, 150, 160, 200, 210, 220].map((y, idx) => (
              <line key={idx} x1="160" y1={y} x2="165" y2={y} stroke="#F8FAFC" strokeWidth="1.5" />
            ))}
            <text x="150" y="285" textAnchor="middle" fill="#C0A068" fontSize="8" fontWeight="800" letterSpacing="1">GRADE 5 TC4 TITANIUM</text>
          </svg>
        );

      case 'sling':
        return (
          <svg viewBox="0 0 300 300" width="100%" height="100%" style={{ filter: 'drop-shadow(0 14px 20px rgba(0,0,0,0.3))' }}>
            {/* Crossbody Tactical Strap */}
            <path d="M 40 260 L 260 40" stroke="#1E293B" strokeWidth="24" strokeLinecap="round" />
            {/* Sling Bag Body */}
            <rect x="75" y="105" width="150" height="90" rx="16" fill="#1E232B" stroke="#475569" strokeWidth="3" />
            {/* Weatherproof AquaGuard Zipper */}
            <line x1="85" y1="130" x2="215" y2="130" stroke="#10B981" strokeWidth="2.5" strokeDasharray="4,2" />
            {/* Fidlock Magnetic V-Buckle */}
            <rect x="135" y="150" width="30" height="24" rx="4" fill="#020617" stroke="#C0A068" strokeWidth="2" />
            <circle cx="150" cy="162" r="3" fill="#10B981" />
            <text x="150" y="225" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="800" letterSpacing="1.5">CORDURA 5L SLING</text>
          </svg>
        );

      case 'earbuds':
        return (
          <svg viewBox="0 0 300 300" width="100%" height="100%" style={{ filter: 'drop-shadow(0 14px 20px rgba(0,0,0,0.25))' }}>
            <defs>
              <linearGradient id="caseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#374151" />
                <stop offset="50%" stopColor="#1F2937" />
                <stop offset="100%" stopColor="#111827" />
              </linearGradient>
            </defs>
            {/* Charging Case Base */}
            <rect x="70" y="90" width="160" height="120" rx="36" fill="url(#caseGrad)" stroke="#4B5563" strokeWidth="3" />
            {/* Case Cutout Lip */}
            <path d="M 70 140 Q 150 155 230 140" fill="none" stroke="#111827" strokeWidth="3" />
            {/* Left Earbud */}
            <g transform="translate(100, 110)">
              <circle cx="15" cy="15" r="16" fill="#111827" stroke="#38BDF8" strokeWidth="1.5" />
              <rect x="10" y="24" width="10" height="28" rx="5" fill="#1F2937" stroke="#4B5563" strokeWidth="1" />
              <circle cx="15" cy="15" r="6" fill="#38BDF8" opacity="0.8" />
            </g>
            {/* Right Earbud */}
            <g transform="translate(165, 110)">
              <circle cx="15" cy="15" r="16" fill="#111827" stroke="#38BDF8" strokeWidth="1.5" />
              <rect x="10" y="24" width="10" height="28" rx="5" fill="#1F2937" stroke="#4B5563" strokeWidth="1" />
              <circle cx="15" cy="15" r="6" fill="#38BDF8" opacity="0.8" />
            </g>
            {/* LED Status Light */}
            <circle cx="150" cy="190" r="3.5" fill="#10B981" />
          </svg>
        );

      case 'powerbank':
        return (
          <svg viewBox="0 0 300 300" width="100%" height="100%" style={{ filter: 'drop-shadow(0 14px 20px rgba(0,0,0,0.25))' }}>
            <rect x="85" y="45" width="130" height="210" rx="20" fill="#1F2937" stroke="#6B7280" strokeWidth="3" />
            {/* MagSafe White Magnetic Circle */}
            <circle cx="150" cy="140" r="45" fill="none" stroke="#9CA3AF" strokeWidth="4" strokeDasharray="8,4" />
            <circle cx="150" cy="140" r="16" fill="#111827" stroke="#10B981" strokeWidth="2" />
            <path d="M 148 132 L 143 141 L 149 141 L 147 149 L 157 139 L 151 139 Z" fill="#10B981" />
            {/* OLED Display */}
            <rect x="105" y="65" width="90" height="28" rx="5" fill="#000000" stroke="#374151" strokeWidth="1.5" />
            <text x="150" y="83" textAnchor="middle" fill="#10B981" fontSize="12" fontWeight="800" fontFamily="monospace">94% QI2 15W</text>
            <text x="150" y="235" textAnchor="middle" fill="#E5E7EB" fontSize="8" fontWeight="800" letterSpacing="1.5">VAULTEX MAGPULSE</text>
          </svg>
        );

      case 'backpack':
        return (
          <svg viewBox="0 0 300 300" width="100%" height="100%" style={{ filter: 'drop-shadow(0 14px 20px rgba(0,0,0,0.25))' }}>
            <path d="M 90 260 L 75 110 Q 80 50 150 45 Q 220 50 225 110 L 210 260 Z" fill="#1F2937" stroke="#4B5563" strokeWidth="3" />
            {/* Top Roll-top fold */}
            <rect x="85" y="65" width="130" height="30" rx="6" fill="#111827" stroke="#374151" strokeWidth="2" />
            {/* FIDLOCK Buckle */}
            <rect x="135" y="125" width="30" height="22" rx="4" fill="#000000" stroke="#C0A068" strokeWidth="2" />
            {/* Vertical YKK Zipper Line */}
            <line x1="150" y1="95" x2="150" y2="230" stroke="#10B981" strokeWidth="2" strokeDasharray="3,2" />
            {/* Bottom Base */}
            <rect x="95" y="235" width="110" height="25" rx="4" fill="#0B0D11" stroke="#374151" strokeWidth="1" />
          </svg>
        );

      case 'pen':
        return (
          <svg viewBox="0 0 300 300" width="100%" height="100%" style={{ filter: 'drop-shadow(0 14px 20px rgba(0,0,0,0.25))' }}>
            <rect x="35" y="140" width="220" height="20" rx="10" fill="#9CA3AF" stroke="#374151" strokeWidth="2" />
            {/* Bolt Action Track */}
            <path d="M 80 146 H 115 V 154 H 80 Z" fill="#111827" />
            <circle cx="110" cy="148" r="6" fill="#C0A068" stroke="#FFFFFF" strokeWidth="1" />
            {/* Tungsten Tip */}
            <polygon points="255,145 275,150 255,155" fill="#374151" />
            {/* Clip */}
            <rect x="60" y="134" width="35" height="5" rx="2" fill="#D1D5DB" stroke="#4B5563" strokeWidth="1" />
          </svg>
        );

      case 'sunglasses':
        return (
          <svg viewBox="0 0 300 300" width="100%" height="100%" style={{ filter: 'drop-shadow(0 14px 20px rgba(0,0,0,0.25))' }}>
            <rect x="45" y="115" width="95" height="70" rx="22" fill="#1E293B" stroke="#C0A068" strokeWidth="4" />
            <rect x="160" y="115" width="95" height="70" rx="22" fill="#1E293B" stroke="#C0A068" strokeWidth="4" />
            <line x1="140" y1="135" x2="160" y2="135" stroke="#C0A068" strokeWidth="4" />
            <line x1="30" y1="125" x2="45" y2="125" stroke="#C0A068" strokeWidth="3" />
            <line x1="255" y1="125" x2="270" y2="125" stroke="#C0A068" strokeWidth="3" />
            {/* Polarization glare sheen */}
            <path d="M 55 125 L 115 175" stroke="#38BDF8" strokeWidth="2" opacity="0.7" />
            <path d="M 170 125 L 230 175" stroke="#38BDF8" strokeWidth="2" opacity="0.7" />
          </svg>
        );

      case 'flashlight':
      case 'torch':
        return (
          <svg viewBox="0 0 300 300" width="100%" height="100%" style={{ filter: 'drop-shadow(0 14px 20px rgba(0,0,0,0.35))' }}>
            {/* Flashlight body */}
            <rect x="50" y="130" width="130" height="40" rx="6" fill="#1E293B" stroke="#475569" strokeWidth="3" />
            {/* Knurled grip ribs */}
            <line x1="80" y1="130" x2="80" y2="170" stroke="#334155" strokeWidth="3" />
            <line x1="95" y1="130" x2="95" y2="170" stroke="#334155" strokeWidth="3" />
            <line x1="110" y1="130" x2="110" y2="170" stroke="#334155" strokeWidth="3" />
            <line x1="125" y1="130" x2="125" y2="170" stroke="#334155" strokeWidth="3" />
            <line x1="140" y1="130" x2="140" y2="170" stroke="#334155" strokeWidth="3" />
            {/* Tailcap */}
            <rect x="35" y="135" width="15" height="30" rx="3" fill="#0F172A" stroke="#334155" strokeWidth="2" />
            {/* Bezel head */}
            <polygon points="180,125 220,115 220,185 180,175" fill="#0F172A" stroke="#64748B" strokeWidth="3" />
            {/* Strike crenellations */}
            <rect x="220" y="118" width="6" height="12" fill="#C0A068" />
            <rect x="220" y="144" width="6" height="12" fill="#C0A068" />
            <rect x="220" y="170" width="6" height="12" fill="#C0A068" />
            {/* Light beam glow */}
            <polygon points="226,120 285,90 285,210 226,180" fill="url(#beamGrad)" opacity="0.4" />
            <defs>
              <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FACC15" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#FACC15" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'multitool':
        return (
          <svg viewBox="0 0 300 300" width="100%" height="100%" style={{ filter: 'drop-shadow(0 14px 20px rgba(0,0,0,0.25))' }}>
            <rect x="80" y="110" width="140" height="55" rx="8" fill="#374151" stroke="#6B7280" strokeWidth="3" />
            <circle cx="100" cy="137" r="8" fill="#111827" stroke="#C0A068" strokeWidth="2" />
            <circle cx="200" cy="137" r="8" fill="#111827" stroke="#C0A068" strokeWidth="2" />
            {/* Damascus Blade emerging */}
            <path d="M 100 110 Q 140 40 220 50 Q 200 100 140 110 Z" fill="#CBD5E1" stroke="#475569" strokeWidth="2" />
            <text x="150" y="142" textAnchor="middle" fill="#C0A068" fontSize="8" fontWeight="800" letterSpacing="1">DAMASCUS TC4</text>
          </svg>
        );

      case 'bottle':
        return (
          <svg viewBox="0 0 300 300" width="100%" height="100%" style={{ filter: 'drop-shadow(0 14px 20px rgba(0,0,0,0.25))' }}>
            <rect x="110" y="70" width="80" height="180" rx="14" fill="#1F2937" stroke="#4B5563" strokeWidth="3" />
            {/* Smart OLED Cap */}
            <rect x="115" y="45" width="70" height="28" rx="6" fill="#000000" stroke="#38BDF8" strokeWidth="2" />
            <text x="150" y="63" textAnchor="middle" fill="#38BDF8" fontSize="10" fontWeight="800" fontFamily="monospace">4°C COLD</text>
            <text x="150" y="160" textAnchor="middle" fill="#9CA3AF" fontSize="7" fontWeight="800" letterSpacing="2" transform="rotate(-90 150 160)">THERMOSHIELD UV-C</text>
          </svg>
        );

      case 'smartring':
        return (
          <svg viewBox="0 0 300 300" width="100%" height="100%" style={{ filter: 'drop-shadow(0 14px 20px rgba(0,0,0,0.25))' }}>
            <circle cx="150" cy="150" r="75" fill="none" stroke="#9CA3AF" strokeWidth="18" />
            <circle cx="150" cy="150" r="66" fill="#111827" />
            {/* Dual Optical PPG LEDs */}
            <circle cx="150" cy="100" r="5" fill="#10B981" />
            <circle cx="150" cy="200" r="5" fill="#10B981" />
            <text x="150" y="148" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="800" fontFamily="monospace">72</text>
            <text x="150" y="162" textAnchor="middle" fill="#EF4444" fontSize="8" fontWeight="800">♥ BPM</text>
          </svg>
        );

      case 'macropad':
        return (
          <svg viewBox="0 0 300 300" width="100%" height="100%" style={{ filter: 'drop-shadow(0 14px 20px rgba(0,0,0,0.25))' }}>
            <rect x="70" y="70" width="160" height="160" rx="16" fill="#1E232B" stroke="#4B5563" strokeWidth="3" />
            {/* Knob */}
            <circle cx="190" cy="105" r="16" fill="#374151" stroke="#EC4899" strokeWidth="2" />
            {/* Keys */}
            <rect x="90" y="90" width="35" height="30" rx="6" fill="#282F3B" stroke="#EC4899" strokeWidth="1.5" />
            <rect x="135" y="90" width="35" height="30" rx="6" fill="#282F3B" stroke="#38BDF8" strokeWidth="1.5" />
            <rect x="90" y="130" width="35" height="30" rx="6" fill="#282F3B" stroke="#10B981" strokeWidth="1.5" />
            <rect x="135" y="130" width="35" height="30" rx="6" fill="#282F3B" stroke="#F59E0B" strokeWidth="1.5" />
            <rect x="90" y="170" width="35" height="30" rx="6" fill="#282F3B" stroke="#8B5CF6" strokeWidth="1.5" />
            <rect x="135" y="170" width="35" height="30" rx="6" fill="#282F3B" stroke="#EC4899" strokeWidth="1.5" />
          </svg>
        );

      case 'wallet':
      default:
        return (
          <svg viewBox="0 0 300 300" width="100%" height="100%" style={{ filter: 'drop-shadow(0 14px 20px rgba(0,0,0,0.25))' }}>
            <defs>
              <linearGradient id="metalShell" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4B5563" />
                <stop offset="50%" stopColor="#374151" />
                <stop offset="100%" stopColor="#1F2937" />
              </linearGradient>
            </defs>
            {/* Fanning Cards */}
            <rect x="96" y="55" width="108" height="60" rx="5" fill="#1E293B" stroke="#38BDF8" strokeWidth="1" transform="rotate(-3 96 55)" />
            <rect x="96" y="70" width="108" height="60" rx="5" fill="#7C2D12" stroke="#F59E0B" strokeWidth="1" transform="rotate(2 96 70)" />
            <rect x="96" y="85" width="108" height="60" rx="5" fill="#065F46" stroke="#10B981" strokeWidth="1" />
            {/* Aluminium Casing */}
            <rect x="90" y="105" width="120" height="150" rx="10" fill="url(#metalShell)" stroke="#6B7280" strokeWidth="2.5" />
            {/* Lever */}
            <rect x="95" y="246" width="32" height="14" rx="3" fill="#111317" stroke="#4B5563" strokeWidth="1" />
            {/* Brand */}
            <text x="150" y="175" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="800" fontFamily="sans-serif" letterSpacing="3">VAULTEX</text>
            <text x="150" y="190" textAnchor="middle" fill="#C0A068" fontSize="7" fontWeight="700" letterSpacing="1.5">ALUMINIUM RFID</text>
          </svg>
        );
    }
  };

  return (
    <div 
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#F6F5F2',
        ...style
      }}
      className={className}
    >
      {!imageError && src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setImageError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            padding: '16px',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.3s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
      ) : null}

      {/* If image is loading or failed, render the crisp photorealistic studio vector artwork */}
      {(!src || imageError || !loaded) && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '18px'
        }}>
          {renderRealisticVector()}
        </div>
      )}
    </div>
  );
}
