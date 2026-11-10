import React, { useState } from 'react';
import { ShoppingBag, Search, ShieldCheck, Server, Menu, X, Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '../utils/audio';

export default function Navbar({
  cartCount,
  onOpenCart,
  onOpenArchitecture,
  searchQuery,
  setSearchQuery,
  activeCategory,
  onSelectCategory,
  systemStatus
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'Wallets', label: 'Wallets' },
    { id: 'Watches', label: 'Watches' },
    { id: 'Audio & Tech', label: 'Audio & Tech' },
    { id: 'Bags & Carry', label: 'Bags & Carry' },
    { id: 'EDC Tools', label: 'EDC Tools' },
    { id: 'Lifestyle & Optics', label: 'Optics' }
  ];

  const handleToggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundManager.playAddToCartSound();
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      backgroundColor: 'rgba(246, 245, 242, 0.94)',
      backdropFilter: 'blur(14px)',
      borderBottom: '1px solid var(--border-light)'
    }}>
      {/* Top Banner: India Express Shipping & Architecture Port Status Banner */}
      <div style={{
        backgroundColor: '#121316',
        color: '#E5E7EB',
        fontSize: '11px',
        padding: '6px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontWeight: 600,
        letterSpacing: '0.05em'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: systemStatus === 'healthy' ? '#10B981' : '#F59E0B',
            boxShadow: '0 0 8px #10B981',
            animation: 'pulseGlow 2s infinite'
          }}></span>
          <span>VAULTEX INDIA • FREE EXPRESS DELIVERY ON ALL ORDERS OVER ₹2,499</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={handleToggleSound}
            aria-label="Toggle Sound Effects"
            style={{
              color: isMuted ? '#9CA3AF' : '#10B981',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            {isMuted ? 'Audio Off' : 'Audio On'}
          </button>
          <button
            onClick={onOpenArchitecture}
            style={{
              color: '#C0A068',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Server size={13} />
            EC2 & Ports Spec
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '74px',
        gap: '24px'
      }}>
        {/* Brand Logo - VAULTEX */}
        <a href="/" style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            fontWeight: 800,
            letterSpacing: '0.14em',
            color: 'var(--text-main)',
            lineHeight: 1
          }}>
            VAULTEX
          </span>
          <span style={{
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '0.24em',
            color: 'var(--accent-gold-dark)',
            textTransform: 'uppercase',
            marginTop: '3px'
          }}>
            Industrial Titanium & Everyday Carry • Bengaluru & Delft
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav style={{
          display: 'none',
          gap: '28px',
          alignItems: 'center'
        }} className="desktop-nav">
          {categories.map((cat) => {
            const isActive = activeCategory.toLowerCase() === cat.id.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                style={{
                  fontSize: '13px',
                  fontWeight: isActive ? 800 : 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                  borderBottom: isActive ? '2px solid var(--text-main)' : '2px solid transparent',
                  paddingBottom: '4px',
                  transform: isActive ? 'translateY(-1px)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                {cat.label}
              </button>
            );
          })}
          <a
            href="#mechanism-demo"
            style={{
              fontSize: '13px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--accent-gold-dark)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            Mechanism
          </a>
        </nav>

        {/* Right Search & Cart Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Search bar */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search watches, tech, bags, wallets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '8px 12px 8px 34px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-light)',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                fontSize: '13px',
                width: '190px',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => e.target.style.width = '220px'}
              onBlur={(e) => e.target.style.width = '190px'}
            />
          </div>

          {/* Cart Icon with bounce counter */}
          <button
            onClick={onOpenCart}
            aria-label="Shopping Cart"
            style={{
              position: 'relative',
              padding: '10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <ShoppingBag size={18} color="var(--text-main)" />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: 'var(--text-main)',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 800,
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
              }}>
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'flex',
              padding: '8px',
              borderRadius: 'var(--radius-sm)'
            }}
            className="mobile-toggle"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--border-light)',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id);
                setMobileMenuOpen(false);
              }}
              style={{
                textAlign: 'left',
                padding: '8px 0',
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'uppercase',
                color: activeCategory.toLowerCase() === cat.id.toLowerCase() ? 'var(--accent-gold-dark)' : 'var(--text-main)'
              }}
            >
              {cat.label}
            </button>
          ))}
          <button
            onClick={() => {
              onOpenArchitecture();
              setMobileMenuOpen(false);
            }}
            style={{
              textAlign: 'left',
              padding: '8px 0',
              fontSize: '14px',
              fontWeight: 700,
              color: '#1F2937',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Server size={16} /> Docker & EC2 Architecture Details
          </button>
        </div>
      )}

      <style>{`
        @media (min-width: 900px) {
          .desktop-nav { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
        @media (max-width: 899px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
