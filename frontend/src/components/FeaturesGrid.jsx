import React from 'react';
import { ShieldCheck, Cpu, Factory, RefreshCw, Zap, Sparkles } from 'lucide-react';

export default function FeaturesGrid() {
  const features = [
    {
      icon: <Cpu size={26} color="var(--accent-gold-dark)" />,
      title: "Interactive Physical Mechanism",
      description: "Every shopping item features dedicated mechanical simulations — sweeping second hands, ANC wave cancellation, MagSafe induction, and lever card ejections."
    },
    {
      icon: <Factory size={26} color="var(--accent-gold-dark)" />,
      title: "Aerospace Metallurgy & Craft",
      description: "Forged with Grade 5 titanium, 6063 aerospace aluminium, German FIDLOCK magnetic hardware, and full-grain vegetable-tanned leather."
    },
    {
      icon: <ShieldCheck size={26} color="#10B981" />,
      title: "Faraday Defense & Smart Safety",
      description: "Solid extruded aluminium walls block 13.56MHz wireless skimming, while smart circuits regulate temperature, surge, and short circuits."
    },
    {
      icon: <RefreshCw size={26} color="var(--accent-gold-dark)" />,
      title: "Engineered for Indian Commutes",
      description: "IPX6 monsoon waterproofing, 100m water resistance, modular serviceable parts, and an official 2-year warranty across 19,000+ PIN codes."
    }
  ];

  return (
    <section style={{
      padding: '70px 0',
      backgroundColor: '#FFFFFF',
      borderTop: '1px solid var(--border-light)',
      borderBottom: '1px solid var(--border-light)'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '32px'
        }}>
          {features.map((feat, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#F7F6F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {feat.icon}
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)' }}>
                {feat.title}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
