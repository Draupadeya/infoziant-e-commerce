import React from 'react';
import { Sparkles, ShoppingBag, CheckCircle2, Shield, Cpu, Info } from 'lucide-react';
import WalletSimulator from './WalletSimulator';
import WatchSimulator from './WatchSimulator';
import EarbudsSimulator from './EarbudsSimulator';
import PowerbankSimulator from './PowerbankSimulator';
import SmartRingSimulator from './SmartRingSimulator';
import MechanicalKeypadSimulator from './MechanicalKeypadSimulator';
import BackpackSimulator from './BackpackSimulator';
import MultiToolSimulator from './MultiToolSimulator';
import PenSimulator from './PenSimulator';
import SunglassesSimulator from './SunglassesSimulator';
import SmartBottleSimulator from './SmartBottleSimulator';
import FlashlightSimulator from './FlashlightSimulator';
import BluetoothSpeakerSimulator from './BluetoothSpeakerSimulator';
import PrybarSimulator from './PrybarSimulator';
import { soundManager } from '../../utils/audio';

export default function ItemSimulator({ product, onAddToCart }) {
  if (!product) return null;

  const simType = product.simulation_type || (
    product.category === 'Watches' ? 'watch' :
    product.category === 'Audio & Tech' ? (
      product.slug.includes('speaker') ? 'speaker' :
      product.slug.includes('ring') ? 'smartring' :
      product.slug.includes('power') ? 'powerbank' :
      product.slug.includes('keypad') ? 'macropad' : 'earbuds'
    ) :
    product.category === 'Bags & Carry' ? (product.slug.includes('crossbody') ? 'backpack' : product.slug.includes('sling') ? 'sling' : 'backpack') :
    product.category === 'EDC Tools' ? (
      product.slug.includes('prybar') ? 'prybar' :
      product.slug.includes('pen') ? 'pen' :
      product.slug.includes('flash') || product.slug.includes('torch') ? 'flashlight' : 'multitool'
    ) :
    product.category === 'Lifestyle & Optics' ? (product.slug.includes('sunglasses') ? 'sunglasses' : 'bottle') :
    'wallet'
  );

  const renderSimulator = () => {
    switch (simType) {
      case 'speaker':
        return <BluetoothSpeakerSimulator product={product} />;
      case 'prybar':
        return <PrybarSimulator product={product} />;
      case 'watch':
        return <WatchSimulator product={product} />;
      case 'earbuds':
        return <EarbudsSimulator product={product} />;
      case 'powerbank':
        return <PowerbankSimulator product={product} />;
      case 'smartring':
        return <SmartRingSimulator product={product} />;
      case 'macropad':
        return <MechanicalKeypadSimulator product={product} />;
      case 'backpack':
      case 'sling':
        return <BackpackSimulator product={product} />;
      case 'multitool':
        return <MultiToolSimulator product={product} />;
      case 'pen':
        return <PenSimulator product={product} />;
      case 'sunglasses':
        return <SunglassesSimulator product={product} />;
      case 'bottle':
        return <SmartBottleSimulator product={product} />;
      case 'flashlight':
      case 'torch':
        return <FlashlightSimulator product={product} />;
      case 'wallet':
      default:
        return <WalletSimulator product={product} />;
    }
  };

  const handleAdd = () => {
    soundManager.playAddToCartSound();
    if (onAddToCart) onAddToCart(product);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      width: '100%',
      color: '#FFFFFF'
    }}>
      {/* Product Mechanism Banner */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '14px',
        padding: '16px 20px',
        backgroundColor: '#1E232B',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(255, 255, 255, 0.12)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '10px',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: 'var(--accent-gold)',
              letterSpacing: '0.1em'
            }}>
              {product.category} • SIMULATION LAB
            </span>
            {product.badge && (
              <span style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                fontSize: '9px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)'
              }}>
                {product.badge}
              </span>
            )}
          </div>

          <h3 style={{
            fontSize: '18px',
            fontWeight: 800,
            color: '#FFFFFF',
            marginTop: '4px',
            fontFamily: 'var(--font-display)'
          }}>
            {product.mechanism_title || `${product.name} Interactive Mechanism`}
          </h3>
          <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px', maxWidth: '640px' }}>
            {product.subtitle || product.description}
          </p>
        </div>

        {/* Price & Add to Cart button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF' }}>
              ₹{product.price?.toLocaleString('en-IN')}
            </span>
            <span style={{ display: 'block', fontSize: '10px', color: '#9CA3AF' }}>Incl. GST</span>
          </div>

          <button
            onClick={handleAdd}
            style={{
              backgroundColor: 'var(--accent-gold-dark)',
              color: '#FFFFFF',
              border: 'none',
              padding: '10px 18px',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <ShoppingBag size={14} />
            Add to Cart
          </button>
        </div>
      </div>

      {/* The Specific Dynamic Interactive Mechanism Component */}
      <div style={{ width: '100%' }}>
        {renderSimulator()}
      </div>

      {/* Mechanism Highlights List */}
      {product.mechanism_highlights && product.mechanism_highlights.length > 0 && (
        <div style={{
          backgroundColor: '#16191E',
          borderRadius: 'var(--radius-md)',
          padding: '18px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <h4 style={{
            fontSize: '12px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--accent-gold)',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Cpu size={14} />
            Patented Engineering & Testing Breakdown
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '12px'
          }}>
            {product.mechanism_highlights.map((highlight, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontSize: '12px',
                  color: '#D1D5DB',
                  lineHeight: 1.4
                }}
              >
                <CheckCircle2 size={14} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

