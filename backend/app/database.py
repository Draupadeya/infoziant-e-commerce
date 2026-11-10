import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

logger = logging.getLogger("uvicorn.error")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://shopuser:shoppassword123@db:5432/shopdb")

# Attempt Postgres engine; provide SQLite fallback for standalone local host testing
try:
    if DATABASE_URL.startswith("postgresql"):
        engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args={"connect_timeout": 5})
        # Test connection
        with engine.connect() as conn:
            pass
    else:
        engine = create_engine(DATABASE_URL)
except Exception as e:
    logger.warning(f"PostgreSQL connection at {DATABASE_URL} failed ({e}). Falling back to local SQLite.")
    db_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "shop_dev.db")
    DATABASE_URL = f"sqlite:///{db_file}"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
