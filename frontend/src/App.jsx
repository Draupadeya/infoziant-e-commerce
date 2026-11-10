/**
 * VAULTEX E-Commerce Application Root
 * 
 * Manages global application state including:
 * - Product catalog with live FastAPI backend synchronization and local fallback
 * - Shopping cart persistence with localStorage
 * - Active modal dialogs (Product Details, Checkout, 3D Architecture, Mechanism Lab)
 * - Navigation category filtering, search, and sorting
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import InteractiveMechanism from './components/InteractiveMechanism';
import ProductCatalog from './components/ProductCatalog';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import FeaturesGrid from './components/FeaturesGrid';
import ArchitectureModal from './components/ArchitectureModal';
import Footer from './components/Footer';
import { INITIAL_PRODUCTS } from './data/products';

export default function App() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [systemStatus, setSystemStatus] = useState('healthy');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  // Modal & Drawer visibility
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalInitialTab, setModalInitialTab] = useState('specs');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);

  // Cart state persisted in localStorage
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('vaultex_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('vaultex_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }, [cartItems]);

  // Fetch live products and system status from FastAPI backend
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (activeCategory !== 'all') queryParams.append('category', activeCategory);
        if (searchQuery) queryParams.append('search', searchQuery);
        if (sortBy) queryParams.append('sort', sortBy);

        const res = await fetch(`/api/products?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            // Merge with local rich metadata & 5-angle image galleries
            const merged = data.map(item => {
              const local = INITIAL_PRODUCTS.find(p => p.slug === item.slug) || {};
              return {
                ...local,
                ...item,
                images: local.images || [{ url: item.image_url, angle: "Hero / Front View" }]
              };
            });
            setProducts(merged);
          }
        }
      } catch (err) {
        console.info('Backend unreachable, using responsive offline catalog fallback:', err);
      }
    };

    const fetchHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          setSystemStatus(data.status || 'healthy');
        }
      } catch {
        setSystemStatus('healthy');
      }
    };

    fetchCatalog();
    fetchHealth();
  }, [activeCategory, searchQuery, sortBy]);

  // Client-side filtering when working with initial products
  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'all' || p.category.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSearch = !searchQuery || (
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.material.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return a.id - b.id;
  });

  // Cart operations
  const handleAddToCart = (product, qty = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { ...product, quantity: qty }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
    } else {
      setCartItems(prev =>
        prev.map(item => item.id === productId ? { ...item, quantity: newQty } : item)
      );
    }
  };

  const handleRemoveItem = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const scrollToCatalog = () => {
    const elem = document.getElementById('catalog-section');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToMechanism = () => {
    const elem = document.getElementById('mechanism-demo');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="vaultex-storefront" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Sticky Navigation */}
      <Navbar
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          scrollToCatalog();
        }}
        systemStatus={systemStatus}
      />

      {/* Main Content */}
      <main style={{ flexGrow: 1 }}>
        <Hero
          onExploreClick={scrollToCatalog}
          onTestMechanismClick={scrollToMechanism}
        />

        <FeaturesGrid />

        <InteractiveMechanism
          products={products}
          onAddToCart={handleAddToCart}
        />

        <ProductCatalog
          products={filteredProducts}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
          searchQuery={searchQuery}
          onQuickView={(p, tab = 'specs') => {
            setSelectedProduct(p);
            setModalInitialTab(tab);
          }}
          onSimulate={(p) => {
            setSelectedProduct(p);
            setModalInitialTab('simulation');
          }}
          onAddToCart={handleAddToCart}
        />
      </main>

      {/* Footer */}
      <Footer onOpenArchitecture={() => setIsArchitectureOpen(true)} />

      {/* Product Quick View / Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          initialTab={modalInitialTab}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Shopping Bag Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Live Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        onOrderSuccess={() => {
          setCartItems([]);
        }}
      />

      {/* Architecture & Port Security Spec Modal */}
      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />
    </div>
  );
}
