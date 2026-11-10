import React from 'react';
import ProductCard from './ProductCard';
import { SlidersHorizontal, PackageOpen, Sparkles, Cpu } from 'lucide-react';

export default function ProductCatalog({
  products,
  activeCategory,
  onSelectCategory,
  sortBy,
  setSortBy,
  searchQuery,
  onQuickView,
  onAddToCart,
  onSimulate
}) {
  const categories = [
    { id: 'all', label: 'All Essentials' },
    { id: 'Wallets', label: 'Wallets' },
    { id: 'Watches', label: 'Timepieces' },
    { id: 'Audio & Tech', label: 'Audio & Tech' },
    { id: 'Bags & Carry', label: 'Bags & Carry' },
    { id: 'EDC Tools', label: 'EDC Tools' },
    { id: 'Lifestyle & Optics', label: 'Optics & Lifestyle' }
  ];

  return (
    <section id="catalog-section" style={{ padding: '80px 0', backgroundColor: 'var(--bg-page)' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <span style={{
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--accent-gold-dark)',
            marginBottom: '8px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Sparkles size={14} />
            VAULTEX Multi-Category Industrial Carrywear
          </span>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: 'var(--text-main)',
            marginBottom: '12px'
          }}>
            Explore Every Everyday Carry Essential
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-muted)', maxWidth: '640px' }}>
            From titanium automatic field watches, Active Noise Cancelling acoustic earbuds, and MagSafe power banks
            to weatherproof X-Pac backpacks, bolt-action titanium pens, and patented RFID aluminium wallets.
          </p>
        </div>

        {/* Filter Bar & Sort Controls */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '32px',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--border-light)'
        }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {categories.map((cat) => {
              const isSelected = activeCategory.toLowerCase() === cat.id.toLowerCase();
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '13px',
                    fontWeight: isSelected ? 800 : 500,
                    backgroundColor: isSelected ? 'var(--text-main)' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : 'var(--text-muted)',
                    border: '1px solid var(--border-light)',
                    boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Sort Dropdown & Product Count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {products.length} {products.length === 1 ? 'item' : 'items'}
            </span>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-full)',
              padding: '6px 14px'
            }}>
              <SlidersHorizontal size={14} color="var(--text-muted)" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search status notice if filtering */}
        {searchQuery && (
          <div style={{ marginBottom: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
            Showing results for <strong style={{ color: 'var(--text-main)' }}>"{searchQuery}"</strong>
          </div>
        )}

        {/* Products Grid */}
        {products.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '28px'
          }}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={onQuickView}
                onAddToCart={onAddToCart}
                onSimulate={onSimulate}
              />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)'
          }}>
            <PackageOpen size={48} color="var(--text-light)" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>No essentials found</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              We could not find any products matching your search criteria.
            </p>
            <button
              onClick={() => onSelectCategory('all')}
              style={{
                backgroundColor: 'var(--text-main)',
                color: '#FFFFFF',
                padding: '8px 20px',
                borderRadius: 'var(--radius-full)',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
