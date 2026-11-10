from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False, index=True)
    slug = Column(String(120), unique=True, index=True)
    subtitle = Column(String(200), nullable=True)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)
    category = Column(String(60), nullable=False, index=True) # Wallets, Watches, Audio & Tech, Bags & Carry, EDC Tools, Lifestyle & Optics
    simulation_type = Column(String(50), default="wallet")
    material = Column(String(100), nullable=False) # European Bovine Leather, Anodised Aluminium, etc.
    color = Column(String(60), nullable=False)
    dimensions = Column(String(60), default="65 x 102 x 16 mm")
    weight = Column(String(30), default="72 g")
    card_capacity = Column(String(40), default="4-6 embossed cards")
    rfid_protection = Column(Boolean, default=True)
    in_stock = Column(Boolean, default=True)
    image_url = Column(String(500), nullable=False)
    badge = Column(String(40), nullable=True) # "Bestseller", "New", "Signature", "Patented"
    rating = Column(Float, default=4.9)
    created_at = Column(DateTime, default=datetime.utcnow)

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_code = Column(String(32), unique=True, index=True)
    customer_name = Column(String(120), nullable=False)
    customer_email = Column(String(150), nullable=False)
    shipping_address = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)
    country = Column(String(80), nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String(50), default="processing")
    created_at = Column(DateTime, default=datetime.utcnow)

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, nullable=False)
    product_name = Column(String(120), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
