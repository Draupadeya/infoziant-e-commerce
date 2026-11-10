import React, { useState } from 'react';
import { Sparkles, SlidersHorizontal, Cpu, ShieldCheck, Zap } from 'lucide-react';
import ItemSimulator from './simulations/ItemSimulator';
import { INITIAL_PRODUCTS } from '../data/products';
import { soundManager } from '../utils/audio';

export default function InteractiveMechanism({ products = INITIAL_PRODUCTS, onAddToCart }) {
  const catalog = products && products.length > 0 ? products : INITIAL_PRODUCTS;
  const [selectedProductId, setSelectedProductId] = useState(catalog[0]?.id || 1);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'Wallets', label: 'Wallets' },
    { id: 'Watches', label: 'Timepieces' },
    { id: 'Audio & Tech', label: 'Audio & Tech' },
    { id: 'Bags & Carry', label: 'Bags & Carry' },
    { id: 'EDC Tools', label: 'EDC Tools' },
    { id: 'Lifestyle & Optics', label: 'Optics & Lifestyle' }
  ];

  const filteredItems = catalog.filter(p => {
    if (activeCategoryFilter === 'all') return true;
    return p.category.toLowerCase() === activeCategoryFilter.toLowerCase();
  });

  const activeProduct = catalog.find(p => p.id === selectedProductId) || catalog[0];

  const handleSelectProduct = (product) => {
    soundManager.playAddToCartSound();
    setSelectedProductId(product.id);
  };

  return (
    <section id="mechanism-demo" style={{
      padding: '95px 0',
      backgroundColor: '#111317',
      color: '#FFFFFF',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background ambient lighting */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(192, 160, 104, 0.12) 0%, transparent 65%)',
        pointerEvents: 'none'
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: 'var(--radius-full)',
            padding: '6px 16px',
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--accent-gold)',
            marginBottom: '16px'
          }}>
            <Sparkles size={13} />
            VAULTEX Multi-Product Simulation Physics Lab
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: '16px'
          }}>
            Interactive Mechanism & Physics Simulator
          </h2>

          <p style={{
            fontSize: '15px',
            color: '#9CA3AF',
            lineHeight: 1.6
          }}>
            Test and simulate the engineering mechanism of <strong>every single shopping item</strong> in our collection.
            Actuate watch sweeping second hands, test ANC audio wave inversion, snap MagSafe induction coils, cock bolt-action titanium pens, and trigger wallet RFID Faraday cages.
          </p>
        </div>

        {/* Category Filter Tabs for Simulator */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '24px'
        }}>
          {categories.map(cat => {
            const isCatActive = activeCategoryFilter.toLowerCase() === cat.id.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => {
                  soundManager.playAddToCartSound();
                  setActiveCategoryFilter(cat.id);
                  // auto select first item in category
                  const firstInCat = catalog.find(p => cat.id === 'all' || p.category.toLowerCase() === cat.id.toLowerCase());
                  if (firstInCat) setSelectedProductId(firstInCat.id);
                }}
                style={{
                  padding: '7px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '12px',
                  fontWeight: isCatActive ? 800 : 500,
                  backgroundColor: isCatActive ? 'var(--accent-gold-dark)' : 'rgba(255,255,255,0.06)',
                  color: isCatActive ? '#FFFFFF' : '#9CA3AF',
                  border: isCatActive ? '1px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.12)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Product Carousel / Selection Strip */}
        <div style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          paddingBottom: '16px',
          marginBottom: '36px',
          scrollbarWidth: 'thin'
        }}>
          {filteredItems.map(item => {
            const isSelected = item.id === activeProduct.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectProduct(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isSelected ? 'rgba(192, 160, 104, 0.2)' : '#191C22',
                  border: isSelected ? '2px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.1)',
                  color: isSelected ? '#FFFFFF' : '#9CA3AF',
                  cursor: 'pointer',
                  flexShrink: 0,
                  textAlign: 'left',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '11px',
                  color: isSelected ? 'var(--accent-gold)' : '#9CA3AF'
                }}>
                  <Cpu size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: isSelected ? '#FFFFFF' : '#E5E7EB' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '11px', color: isSelected ? 'var(--accent-gold)' : '#6B7280' }}>
                    {item.category} • ₹{item.price?.toLocaleString('en-IN')}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* The Live Interactive Simulation Stage for the Selected Product */}
        <div style={{
          backgroundColor: '#191C22',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '36px 28px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)'
        }}>
          <ItemSimulator
            product={activeProduct}
            onAddToCart={onAddToCart}
          />
        </div>
      </div>
    </section>
  );
}
