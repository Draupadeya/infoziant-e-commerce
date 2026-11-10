-- Database initialization script for Secrid Storefront
-- Automatically executed on first PostgreSQL container boot

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    subtitle VARCHAR(200),
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2),
    category VARCHAR(60) NOT NULL,
    simulation_type VARCHAR(50) DEFAULT 'wallet',
    material VARCHAR(100) NOT NULL,
    color VARCHAR(60) NOT NULL,
    dimensions VARCHAR(60) DEFAULT '65 x 102 x 16 mm',
    weight VARCHAR(30) DEFAULT '72 g',
    card_capacity VARCHAR(40) DEFAULT '4-6 embossed cards',
    rfid_protection BOOLEAN DEFAULT TRUE,
    in_stock BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(500) NOT NULL,
    badge VARCHAR(40),
    rating NUMERIC(3, 2) DEFAULT 4.90,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_code VARCHAR(32) UNIQUE NOT NULL,
    customer_name VARCHAR(120) NOT NULL,
    customer_email VARCHAR(150) NOT NULL,
    shipping_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(80) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL,
    product_name VARCHAR(120) NOT NULL,
    quantity INTEGER NOT NULL,
    price NUMERIC(10, 2) NOT NULL
);

-- Performance indices
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_order_code ON orders(order_code);
