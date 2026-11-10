import React, { useState } from 'react';
import { ShoppingBag, Eye, Shield, Star, Heart, Cpu, Sparkles } from 'lucide-react';
import ProductImage from './ProductImage';
import { soundManager } from '../utils/audio';

export default function ProductCard({ product, onQuickView, onAddToCart, onSimulate }) {
  const [isLiked, setIsLiked] = useState(false);
  const [cardAngleIndex, setCardAngleIndex] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const imagesList = product.images && product.images.length > 0
    ? product.images
    : [{ url: product.image_url, angle: "Hero View" }];

  const activeCardImg = imagesList[cardAngleIndex] || imagesList[0];

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const handleAdd = () => {
    soundManager.playAddToCartSound();
    onAddToCart(product);
  };

  const toggleLike = (e) => {
    e.stopPropagation();
    soundManager.playAddToCartSound();
    setIsLiked(!isLiked);
  };

  const handleSimulateClick = (e) => {
    e.stopPropagation();
    soundManager.playAddToCartSound();
    if (onSimulate) {
      onSimulate(product);
    } else {
      onQuickView(product, 'simulation');
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transform: `perspective(1000px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
        transition: 'transform 0.15s ease-out, box-shadow 0.25s ease',
        boxShadow: tilt.x !== 0 ? 'var(--shadow-lg)' : 'none'
      }}
    >
      {/* Product Image Area */}
      <div style={{
        position: 'relative',
        height: '240px',
        backgroundColor: '#F7F6F3',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Badge */}
        {product.badge && (
          <span style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            zIndex: 3,
            backgroundColor: product.badge === 'Bestseller' ? '#141517' : 'var(--accent-gold-dark)',
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
        )}

        {/* Wishlist Heart Toggle */}
        <button
          onClick={toggleLike}
          aria-label="Save to Wishlist"
          style={{
            position: 'absolute',
            top: '12px',
            right: product.rfid_protection ? '68px' : '12px',
            zIndex: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            boxShadow: 'var(--shadow-sm)',
            transform: isLiked ? 'scale(1.15)' : 'scale(1)',
            cursor: 'pointer',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          <Heart size={14} color={isLiked ? '#EF4444' : '#6B7280'} fill={isLiked ? '#EF4444' : 'none'} />
        </button>

        {/* RFID Safe indicator if present */}
        {product.rfid_protection && (
          <span style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(4px)',
            color: '#10B981',
            fontSize: '10px',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            <Shield size={11} />
            RFID
          </span>
        )}

        {/* High-Resolution Product Image with Intelligent Fallback */}
        <ProductImage
          src={activeCardImg.url}
          alt={`${product.name} - ${activeCardImg.angle}`}
          category={product.category}
          simulationType={product.simulation_type}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          className="product-card-img"
        />

        {/* 5-Angle Indicator Dots */}
        {imagesList.length > 1 && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              bottom: '50px',
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '4px',
              zIndex: 3
            }}
          >
            {imagesList.map((_, idx) => (
              <span
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  soundManager.playMechanicalClick(1400, 0.02);
                  setCardAngleIndex(idx);
                }}
                title={imagesList[idx].angle}
                style={{
                  width: idx === cardAngleIndex ? '14px' : '5px',
                  height: '5px',
                  borderRadius: '3px',
                  backgroundColor: idx === cardAngleIndex ? 'var(--accent-gold)' : 'rgba(0,0,0,0.25)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              />
            ))}
          </div>
        )}

        {/* Quick Actions Hover Strip */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          right: '12px',
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          zIndex: 4
        }}>
          {/* Simulate Mechanism Button */}
          <button
            onClick={handleSimulateClick}
            style={{
              backgroundColor: '#111317',
              color: 'var(--accent-gold)',
              border: '1px solid var(--accent-gold)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-gold-dark)';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#111317';
              e.currentTarget.style.color = 'var(--accent-gold)';
            }}
          >
            <Cpu size={12} />
            Simulate
          </button>

          {/* Quick Specs Button */}
          <button
            onClick={() => {
              soundManager.playAddToCartSound();
              onQuickView(product, 'specs');
            }}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(6px)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-light)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer'
            }}
          >
            <Eye size={12} />
            Specs
          </button>
        </div>
      </div>

      {/* Product Information Body */}
      <div style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        justifyContent: 'space-between'
      }}>
        <div>
          {/* Collection & Rating */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px'
          }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--accent-gold-dark)'
            }}>
              {product.category}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#F59E0B' }}>
              <Star size={12} fill="#F59E0B" />
              <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{product.rating}</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 style={{
            fontSize: '15px',
            fontWeight: 800,
            color: 'var(--text-main)',
            marginBottom: '6px',
            lineHeight: 1.3
          }}>
            {product.name}
          </h3>

          {/* Subtitle / Mechanism Hint */}
          <p style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginBottom: '10px',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {product.subtitle || product.material}
          </p>
        </div>

        {/* Pricing in Indian Rupees and Add to Cart Action */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-light)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)' }}>
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.original_price && (
                <span style={{ fontSize: '12px', color: 'var(--text-light)', textDecoration: 'line-through' }}>
                  ₹{product.original_price.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Incl. GST
            </span>
          </div>

          <button
            onClick={handleAdd}
            style={{
              backgroundColor: 'var(--text-main)',
              color: '#FFFFFF',
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              border: 'none',
              transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-gold-dark)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--text-main)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <ShoppingBag size={14} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
