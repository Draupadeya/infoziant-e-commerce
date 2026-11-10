import React, { useState } from 'react';
import { ArrowDown, Shield, Sparkles, Check, Cpu, Watch, Headphones, Briefcase } from 'lucide-react';
import ProductImage from './ProductImage';
import { soundManager } from '../utils/audio';

export default function Hero({ onExploreClick, onTestMechanismClick }) {
  const [selectedItemKey, setSelectedItemKey] = useState('watch');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const heroShowcase = {
    watch: {
      name: 'Apex 40mm Titanium Field Watch',
      tag: '24-Jewel Mechanical Automatic Movement',
      price: '₹18,499',
      category: 'Watches',
      simulationType: 'watch',
      img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=90',
      colorDot: '#C0A068',
      desc: 'Grade 5 aerospace titanium, sweeping mechanical seconds, SuperLuminova BGW9 dial & 100m water resistance.'
    },
    wallet: {
      name: 'Miniwallet Vintage Cognac',
      tag: 'Full-Grain Waxed European Leather & Aluminium',
      price: '₹5,999',
      category: 'Wallets',
      simulationType: 'wallet',
      img: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
      colorDot: '#9A5B32',
      desc: 'Patented counter-spring card cascading lever, RFID/NFC Faraday defense & billfold cash pocket.'
    },
    audio: {
      name: 'SonicPro Hybrid ANC Earbuds',
      tag: '45dB Active Noise Cancellation & Titanium Drivers',
      price: '₹8,999',
      category: 'Audio & Tech',
      simulationType: 'earbuds',
      img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
      colorDot: '#38BDF8',
      desc: 'Real-time anti-phase DSP acoustic wave cancellation, capacitive tap sensors & Qi magnetic wireless charging.'
    },
    backpack: {
      name: 'Vanguard 24L Weatherproof Backpack',
      tag: 'Dimension-Polyant X-Pac with German FIDLOCK',
      price: '₹11,999',
      category: 'Bags & Carry',
      simulationType: 'backpack',
      img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      colorDot: '#10B981',
      desc: 'Hydrophobic monsoon-proof sailcloth membrane, magnetic auto-snap buckle & suspended 16" laptop cradle.'
    }
  };

  const active = heroShowcase[selectedItemKey];

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const handleSelectItem = (key) => {
    setSelectedItemKey(key);
    soundManager.playAddToCartSound();
  };

  return (
    <section style={{
      position: 'relative',
      padding: '75px 0 65px',
      overflow: 'hidden',
      borderBottom: '1px solid var(--border-light)',
      background: 'radial-gradient(ellipse at 80% 20%, rgba(212, 196, 168, 0.28) 0%, rgba(246, 245, 242, 1) 70%)'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '48px',
          alignItems: 'center'
        }}>
          {/* Left Column: Brand Story */}
          <div style={{ maxWidth: '620px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-full)',
              padding: '6px 14px',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--accent-gold-dark)',
              marginBottom: '20px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <Sparkles size={14} />
              VAULTEX • Complete Industrial Everyday Carry & Smart Tech
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.025em',
              color: 'var(--text-main)',
              marginBottom: '20px'
            }}>
              Engineered for strength. Refined for every day.
            </h1>

            <p style={{
              fontSize: '17px',
              lineHeight: 1.6,
              color: 'var(--text-muted)',
              marginBottom: '32px',
              maxWidth: '540px'
            }}>
              Not only wallets — explore our complete shopping collection of Grade 5 titanium automatic timepieces,
              Active Noise Cancelling audio, MagSafe magnetic induction power, bolt-action EDC pens, and weatherproof carrywear.
              Each with an interactive mechanical simulation engine.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '40px' }}>
              <button
                onClick={onExploreClick}
                style={{
                  backgroundColor: 'var(--text-main)',
                  color: '#FFFFFF',
                  padding: '15px 30px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '14px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
              >
                Explore All Items
                <ArrowDown size={16} />
              </button>

              <button
                onClick={onTestMechanismClick}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-light)',
                  padding: '15px 28px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '14px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--text-main)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <Cpu size={16} color="var(--accent-gold-dark)" />
                Test Simulation Lab
              </button>
            </div>

            {/* Micro Feature Highlights */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              paddingTop: '24px',
              borderTop: '1px solid var(--border-light)'
            }}>
              <div>
                <span style={{ display: 'block', fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>17 Essentials</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Full EDC Catalogue</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>100% Sim Labs</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Every Item Simulated</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>19,000+</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>All-India Delivery</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Interactive Showcase Card */}
          <div style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            perspective: '1200px'
          }}>
            {/* Ambient circular backdrop */}
            <div style={{
              position: 'absolute',
              width: '420px',
              height: '420px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(192, 160, 104, 0.28) 0%, rgba(246, 245, 242, 0) 70%)',
              zIndex: 0,
              animation: 'pulseGlow 4s infinite'
            }} />

            {/* Featured Interactive 3D Presentation Card */}
            <div
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                maxWidth: '460px',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                padding: '28px',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid rgba(255, 255, 255, 0.9)',
                transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
                transition: 'transform 0.15s ease-out, box-shadow 0.2s ease',
                transformStyle: 'preserve-3d'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <span className="secrid-badge badge-dark">VAULTEX FLAGSHIP</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Interactive Item Showcase
                </span>
              </div>

              {/* Product Hero Image */}
              <div style={{
                height: '260px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                backgroundColor: '#F3F2EE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px',
                position: 'relative'
              }}>
                <ProductImage
                  src={active.img}
                  alt={active.name}
                  category={active.category}
                  simulationType={active.simulationType}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                />
                <button
                  onClick={onTestMechanismClick}
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(18, 19, 22, 0.9)',
                    backdropFilter: 'blur(8px)',
                    color: '#FFFFFF',
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '11px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer'
                  }}
                >
                  <Cpu size={12} color="var(--accent-gold)" />
                  Simulate in Lab
                </button>
              </div>

              {/* Interactive Item Switcher */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                padding: '10px 14px',
                backgroundColor: '#F8F7F4',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)'
              }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Switch Showcase:
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {Object.keys(heroShowcase).map((key) => {
                    const isCur = selectedItemKey === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleSelectItem(key)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: isCur ? 'var(--text-main)' : 'rgba(0,0,0,0.06)',
                          color: isCur ? '#FFFFFF' : '#4B5563',
                          border: isCur ? '1px solid var(--text-main)' : '1px solid transparent',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {key.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detail specs */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {active.name}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {active.tag}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {active.price}
                  </span>
                  <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Incl. GST
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
