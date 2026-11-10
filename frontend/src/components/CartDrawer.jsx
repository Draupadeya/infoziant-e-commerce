import React from 'react';
import { X, Trash2, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}) {
  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const freeShippingThreshold = 2499.00;
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const deliveryCharge = subtotal >= freeShippingThreshold ? 0 : 99.00;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(18, 19, 22, 0.65)',
      backdropFilter: 'blur(6px)',
      zIndex: 60,
      display: 'flex',
      justifyContent: 'flex-end'
    }}
    onClick={onClose}
    >
      <div style={{
        backgroundColor: '#FFFFFF',
        width: '100%',
        maxWidth: '460px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-xl)',
        animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} color="var(--text-main)" />
            <h3 style={{ fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Your Bag ({items.reduce((acc, i) => acc + i.quantity, 0)})
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Shopping Bag"
            style={{ padding: '6px', borderRadius: '50%', backgroundColor: '#F3F4F6' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Free Shipping Progress Indicator for India */}
        <div style={{
          padding: '14px 24px',
          backgroundColor: '#F8F7F4',
          borderBottom: '1px solid var(--border-light)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
            {subtotal >= freeShippingThreshold ? (
              <span style={{ color: '#10B981', fontWeight: 700 }}>✓ Unlocked Free All-India Express Delivery!</span>
            ) : (
              <span>Add <strong>₹{amountToFreeShipping.toLocaleString('en-IN')}</strong> for Free Delivery</span>
            )}
            <span style={{ color: 'var(--text-muted)' }}>{Math.round(freeShippingProgress)}%</span>
          </div>
          <div style={{
            height: '6px',
            backgroundColor: '#E5E7EB',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${freeShippingProgress}%`,
              backgroundColor: subtotal >= freeShippingThreshold ? '#10B981' : 'var(--accent-gold-dark)',
              borderRadius: '3px',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
        </div>

        {/* Cart Item List */}
        <div style={{
          flexGrow: 1,
          overflowY: 'auto',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {items.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 0',
              color: 'var(--text-muted)'
            }}>
              <ShoppingBag size={42} color="var(--text-light)" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                Your pocket is empty
              </p>
              <p style={{ fontSize: '13px' }}>
                Explore our precision titanium protectors and wallets.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  gap: '14px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid var(--border-light)'
                }}
              >
                <div style={{
                  width: '74px',
                  height: '74px',
                  backgroundColor: '#F6F5F2',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  <img
                    src={item.image_url}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <div style={{ flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3 }}>
                      {item.name}
                    </h4>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      style={{ color: '#9CA3AF', padding: '2px' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', margin: '2px 0 8px' }}>
                    {item.color} • {item.category}
                  </span>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* Quantity controls */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-full)',
                      padding: '2px 8px',
                      gap: '8px',
                      fontSize: '12px'
                    }}>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        style={{ fontWeight: 700 }}
                      >
                        -
                      </button>
                      <span style={{ fontWeight: 800 }}>{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        style={{ fontWeight: 700 }}
                      >
                        +
                      </button>
                    </div>

                    <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)' }}>
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {items.length > 0 && (
          <div style={{
            padding: '24px',
            borderTop: '1px solid var(--border-light)',
            backgroundColor: '#FBFBFA'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Subtotal (Incl. GST)</span>
              <span style={{ fontWeight: 700 }}>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Shipping (India Express)</span>
              <span style={{ fontWeight: 700, color: subtotal >= freeShippingThreshold ? '#10B981' : 'var(--text-main)' }}>
                {subtotal >= freeShippingThreshold ? 'FREE' : '₹99'}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '20px',
              paddingTop: '10px',
              borderTop: '1px solid var(--border-light)',
              fontSize: '18px',
              fontWeight: 800
            }}>
              <span>Total Payable</span>
              <span>
                ₹{(subtotal + deliveryCharge).toLocaleString('en-IN')}
              </span>
            </div>

            <button
              onClick={onCheckout}
              style={{
                width: '100%',
                backgroundColor: 'var(--text-main)',
                color: '#FFFFFF',
                padding: '16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '14px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              Proceed to Checkout (UPI & Cards)
              <ArrowRight size={16} />
            </button>

            <div style={{
              marginTop: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '11px',
              color: 'var(--text-muted)'
            }}>
              <ShieldCheck size={14} color="#10B981" />
              UPI, NetBanking, RuPay & Visa Accepted • GST Invoice Included
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
