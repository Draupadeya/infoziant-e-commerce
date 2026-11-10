from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    slug: str
    subtitle: Optional[str] = None
    description: str
    price: float
    original_price: Optional[float] = None
    category: str
    simulation_type: Optional[str] = "wallet"
    material: str
    color: str
    dimensions: str
    weight: str
    card_capacity: str
    rfid_protection: bool
    in_stock: bool
    image_url: str
    badge: Optional[str] = None
    rating: float

class ProductResponse(ProductBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class OrderItemCreate(BaseModel):
    product_id: int
    product_name: str
    quantity: int
    price: float

class OrderItemResponse(OrderItemCreate):
    id: int

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    customer_name: str
    customer_email: str
    shipping_address: str
    city: str
    country: str
    items: List[OrderItemCreate]

class OrderResponse(BaseModel):
    id: int
    order_code: str
    customer_name: str
    customer_email: str
    shipping_address: str
    city: str
    country: str
    total_amount: float
    status: str
    created_at: datetime
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True

class HealthResponse(BaseModel):
    status: str
    service: str
    database: str
    engine: str
    open_port: int
    private_ports: List[int]
    timestamp: datetime
