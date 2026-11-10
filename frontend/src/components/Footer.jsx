import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Server, Shield, MapPin, Phone, Mail } from 'lucide-react';
import { soundManager } from '../utils/audio';

export default function Footer({ onOpenArchitecture }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      soundManager.playAddToCartSound();
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <footer style={{
      backgroundColor: '#111317',
      color: '#E5E7EB',
      padding: '70px 0 30px',
      borderTop: '1px solid #23272F'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px',
          marginBottom: '50px'
        }}>
          {/* Brand & Manifesto */}
          <div style={{ maxWidth: '320px' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '26px',
              fontWeight: 800,
              letterSpacing: '0.14em',
              color: '#FFFFFF',
              display: 'block',
              marginBottom: '6px'
            }}>
              VAULTEX
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--accent-gold)',
              display: 'block',
              marginBottom: '16px'
            }}>
              Modern Industrial Titanium & Pocketwear
            </span>
            <p style={{ fontSize: '13px', color: '#9CA3AF', lineHeight: 1.6, marginBottom: '20px' }}>
              We design pocket-sized essentials engineered with aerospace aluminium, titanium, and full-grain leather.
              Shipped across 19,000+ PIN codes in India with an official 2-year warranty and GST invoices.
            </p>
            <button
              onClick={onOpenArchitecture}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                color: 'var(--accent-gold)',
                padding: '8px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.16)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
            >
              <Server size={12} />
              EC2 Cloud Architecture Spec
            </button>
          </div>

          {/* India Flagship & Support */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#FFFFFF', marginBottom: '16px' }}>
              Vaultex Experience Lab
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#9CA3AF' }}>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <MapPin size={16} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Flagship Design Studio:</strong><br />
                  Level 4, Brigade Tech Gardens, Brookefield, Bengaluru, Karnataka 560066
                </span>
              </li>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Phone size={15} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
                <span>+91 (080) 4192-8000 / +91 98450 12345</span>
              </li>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Mail size={15} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
                <span>support@vaultex.in</span>
              </li>
              <li style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                GSTIN: 29AAECV9421M1Z5 • ISO 9001:2015 Certified
              </li>
            </ul>
          </div>

          {/* Technology & Security */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#FFFFFF', marginBottom: '16px' }}>
              Engineering & Security
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#9CA3AF' }}>
              <li><a href="#mechanism-demo" style={{ color: 'inherit' }}>Patented Counter-Spring Lever</a></li>
              <li><a href="#mechanism-demo" style={{ color: 'inherit' }}>Faraday RFID Skimming Shield</a></li>
              <li><span style={{ color: '#9CA3AF' }}>Grade 5 Titanium & 6063-T6 Alloy</span></li>
              <li><span style={{ color: '#9CA3AF' }}>European Bovine Leather</span></li>
              <li><span style={{ color: '#9CA3AF' }}>Blue Dart Air Express Delivery</span></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#FFFFFF', marginBottom: '16px' }}>
              Vaultex Insider
            </h4>
            <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '12px' }}>
              Receive exclusive invites to limited leather drops and engineering masterclasses.
            </p>
            <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex' }}>
                <input
                  type="email"
                  placeholder="Enter email address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    backgroundColor: '#1E2127',
                    border: '1px solid #374151',
                    borderRadius: 'var(--radius-full) 0 0 var(--radius-full)',
                    padding: '10px 14px',
                    fontSize: '13px',
                    color: '#FFFFFF',
                    outline: 'none',
                    flexGrow: 1
                  }}
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: 'var(--accent-gold-dark)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '0 var(--radius-full) var(--radius-full) 0',
                    padding: '0 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ArrowRight size={16} />
                </button>
              </div>
              {subscribed && (
                <span style={{ fontSize: '12px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={13} /> Dhanyavaad! Welcome to Vaultex.
                </span>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar with Port Verification Details */}
        <div style={{
          paddingTop: '24px',
          borderTop: '1px solid #23272F',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          fontSize: '12px',
          color: '#6B7280'
        }}>
          <div>
            © 2026 VAULTEX LUXURY POCKETWEAR PVT. LTD. • All Prices in Indian Rupees (INR) • Incl. GST
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>Live on Ubuntu EC2</span>
            <span>•</span>
            <span style={{ color: '#10B981' }}>Secure Production Server</span>
            <span>•</span>
            <span style={{ color: '#9CA3AF' }}>FastAPI & Postgres Backend</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
