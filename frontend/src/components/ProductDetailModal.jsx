import React, { useState } from 'react';
import { X, Shield, ShoppingBag, CheckCircle2, Star, Truck, Award, Cpu, Eye, FileText, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import ProductImage from './ProductImage';
import ItemSimulator from './simulations/ItemSimulator';
import { soundManager } from '../utils/audio';

export default function ProductDetailModal({ product, onClose, onAddToCart, initialTab = 'specs' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [activeAngleIndex, setActiveAngleIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const imagesList = product.images && product.images.length > 0
    ? product.images
    : [{ url: product.image_url, angle: "Hero / Front View" }];

  const currentImage = imagesList[activeAngleIndex] || imagesList[0];

  const handlePrevAngle = () => {
    soundManager.playMechanicalClick(1200, 0.03);
    setActiveAngleIndex(prev => (prev === 0 ? imagesList.length - 1 : prev - 1));
  };

  const handleNextAngle = () => {
    soundManager.playMechanicalClick(1500, 0.03);
    setActiveAngleIndex(prev => (prev === imagesList.length - 1 ? 0 : prev + 1));
  };

  const handleAdd = () => {
    soundManager.playAddToCartSound();
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(18, 19, 22, 0.82)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '20px'
    }}
    onClick={onClose}
    >
      <div style={{
        backgroundColor: activeTab === 'simulation' ? '#14171E' : '#FFFFFF',
        color: activeTab === 'simulation' ? '#FFFFFF' : 'var(--text-main)',
        borderRadius: 'var(--radius-lg)',
        maxWidth: '920px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: 'var(--shadow-xl)',
        position: 'relative',
        border: '1px solid var(--border-light)',
        transition: 'background-color 0.3s ease'
      }}
      onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar: Close Button & Mode Switch Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: activeTab === 'simulation' ? '1px solid rgba(255,255,255,0.12)' : '1px solid var(--border-light)',
          backgroundColor: activeTab === 'simulation' ? '#191C24' : '#FBFBF9'
        }}>
          {/* Tabs: Specs vs Simulation Lab */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('specs')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '12px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                backgroundColor: activeTab === 'specs' ? 'var(--text-main)' : 'transparent',
                color: activeTab === 'specs' ? '#FFFFFF' : (activeTab === 'simulation' ? '#9CA3AF' : 'var(--text-muted)'),
                border: activeTab === 'specs' ? 'none' : '1px solid rgba(255,255,255,0.15)',
                cursor: 'pointer'
              }}
            >
              <FileText size={13} />
              Specifications & Details
            </button>

            <button
              onClick={() => setActiveTab('simulation')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '12px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                backgroundColor: activeTab === 'simulation' ? 'var(--accent-gold-dark)' : 'transparent',
                color: activeTab === 'simulation' ? '#FFFFFF' : (activeTab === 'simulation' ? '#9CA3AF' : 'var(--accent-gold-dark)'),
                border: activeTab === 'simulation' ? 'none' : '1px solid var(--accent-gold)',
                cursor: 'pointer'
              }}
            >
              <Cpu size={14} />
              Interactive Simulation Mechanism
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close Modal"
            style={{
              backgroundColor: activeTab === 'simulation' ? 'rgba(255,255,255,0.1)' : '#FFFFFF',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-light)',
              cursor: 'pointer'
            }}
          >
            <X size={18} color={activeTab === 'simulation' ? '#FFFFFF' : 'var(--text-main)'} />
          </button>
        </div>

        {/* Modal Content Body */}
        {activeTab === 'specs' ? (
          /* STANDARD SPECIFICATIONS VIEW */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))'
          }}>
            {/* Left: Product Multi-Angle Studio Visual Gallery */}
            <div style={{
              backgroundColor: '#F6F5F2',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative'
            }}>
              {/* Top Bar on Image: Badge & Angle Tag */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                alignItems: 'center',
                marginBottom: '12px',
                zIndex: 2
              }}>
                {product.badge ? (
                  <span style={{
                    backgroundColor: 'var(--text-main)',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)'
                  }}>
                    {product.badge}
                  </span>
                ) : <div />}

                {/* Angle Tag Pill */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'rgba(20, 21, 23, 0.85)',
                  color: '#F9FAFB',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '10px',
                  fontWeight: 700
                }}>
                  <Camera size={11} color="var(--accent-gold)" />
                  <span>Angle {activeAngleIndex + 1}/{imagesList.length}: {currentImage.angle}</span>
                </div>
              </div>

              {/* Main Image Viewport with Left/Right Nav Arrows */}
              <div style={{
                position: 'relative',
                width: '100%',
                height: '290px',
                overflow: 'hidden',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ProductImage
                  src={currentImage.url}
                  alt={`${product.name} - ${currentImage.angle}`}
                  category={product.category}
                  simulationType={product.simulation_type}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />

                {/* Left Arrow Button */}
                <button
                  onClick={handlePrevAngle}
                  aria-label="Previous Angle"
                  style={{
                    position: 'absolute',
                    left: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid var(--border-light)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 3
                  }}
                >
                  <ChevronLeft size={16} color="#1F2937" />
                </button>

                {/* Right Arrow Button */}
                <button
                  onClick={handleNextAngle}
                  aria-label="Next Angle"
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid var(--border-light)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 3
                  }}
                >
                  <ChevronRight size={16} color="#1F2937" />
                </button>
              </div>

              {/* Row of 5 Angle Thumbnail Preview Buttons */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${imagesList.length}, 1fr)`,
                gap: '8px',
                width: '100%',
                marginTop: '12px'
              }}>
                {imagesList.map((imgItem, idx) => {
                  const isActive = idx === activeAngleIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        soundManager.playMechanicalClick(1400, 0.02);
                        setActiveAngleIndex(idx);
                      }}
                      title={imgItem.angle}
                      style={{
                        position: 'relative',
                        height: '52px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        border: isActive ? '2px solid var(--accent-gold)' : '1px solid var(--border-light)',
                        boxShadow: isActive ? '0 0 10px rgba(192, 160, 104, 0.5)' : 'none',
                        backgroundColor: '#FFFFFF',
                        cursor: 'pointer',
                        padding: '2px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <img
                        src={imgItem.url}
                        alt={imgItem.angle}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Simulation CTA Pill */}
              <button
                onClick={() => setActiveTab('simulation')}
                style={{
                  marginTop: '16px',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  backgroundColor: '#111317',
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--accent-gold)',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
              >
                <Cpu size={14} color="var(--accent-gold)" />
                Test Drive Simulation Mechanism
              </button>
            </div>

            {/* Right: Product Details & Purchase Form */}
            <div style={{ padding: '36px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--accent-gold-dark)'
                  }}>
                    {product.category}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#F59E0B' }}>
                    <Star size={13} fill="#F59E0B" />
                    <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{product.rating} / 5.0</span>
                  </div>
                </div>

                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '24px',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  marginBottom: '8px'
                }}>
                  {product.name}
                </h2>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)' }}>
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  {product.original_price && (
                    <span style={{ fontSize: '16px', color: 'var(--text-light)', textDecoration: 'line-through' }}>
                      ₹{product.original_price.toLocaleString('en-IN')}
                    </span>
                  )}
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Inclusive of all taxes (GST)</span>
                </div>

                <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
                  {product.description}
                </p>

                {/* Technical Specifications */}
                <div style={{
                  backgroundColor: '#F9F8F5',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  marginBottom: '24px',
                  border: '1px solid var(--border-light)'
                }}>
                  <h4 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                    Technical Specifications
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '13px' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Capacity / Spec</span>
                      <strong>{product.card_capacity}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Material</span>
                      <strong>{product.material}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Dimensions</span>
                      <strong>{product.dimensions}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Weight</span>
                      <strong>{product.weight}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                  {/* Quantity selector */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-full)',
                    padding: '4px'
                  }}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      style={{ width: '32px', height: '32px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', border: 'none', background: 'none' }}
                    >
                      -
                    </button>
                    <span style={{ padding: '0 12px', fontSize: '14px', fontWeight: 800 }}>{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      style={{ width: '32px', height: '32px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', border: 'none', background: 'none' }}
                    >
                      +
                    </button>
                  </div>

                  {/* Add to cart button */}
                  <button
                    onClick={handleAdd}
                    style={{
                      flexGrow: 1,
                      backgroundColor: added ? '#10B981' : 'var(--text-main)',
                      color: '#FFFFFF',
                      padding: '14px 24px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '14px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: 'var(--shadow-md)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {added ? (
                      <>
                        <CheckCircle2 size={16} />
                        Added to Pocket ({quantity})
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={16} />
                        Add to Cart • ₹{(product.price * quantity).toLocaleString('en-IN')}
                      </>
                    )}
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '18px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Truck size={14} /> Free All-India Express Delivery over ₹2,499
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Award size={14} /> 2-Year Official VAULTEX Warranty
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* LIVE SIMULATION MECHANISM VIEW */
          <div style={{ padding: '28px 24px' }}>
            <ItemSimulator product={product} onAddToCart={onAddToCart} />
          </div>
        )}
      </div>
    </div>
  );
}
