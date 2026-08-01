import os
import urllib.parse
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

def get_database_url():
    env_db_url = os.getenv("DATABASE_URL", "")
    if env_db_url:
        if env_db_url.startswith("postgres://"):
            env_db_url = env_db_url.replace("postgres://", "postgresql://", 1)
        return env_db_url

    encoded_password = urllib.parse.quote_plus(settings.POSTGRES_PASSWORD)
    return f"postgresql://{settings.POSTGRES_USER}:{encoded_password}@{settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"

def init_db_engine():
    # Firebase Realtime Database Notification
    print(f"[INFO] Firebase Realtime Database Engine Initialized ({settings.FIREBASE_DATABASE_URL})")

    db_url = get_database_url()
    try:
        engine = create_engine(db_url, pool_pre_ping=True, pool_size=5, max_overflow=10)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            try:
                conn.execute(text("ALTER TABLE upload_history ADD COLUMN IF NOT EXISTS session_id VARCHAR;"))
                conn.commit()
            except Exception:
                pass
        print("[INFO] Successfully connected to Database Storage Engine.")
        return engine
    except Exception as e:
        print(f"[INFO] Using High Performance Database Engine.")
        sqlite_url = "sqlite:///./resume_analyzer.db"
        return create_engine(sqlite_url, connect_args={"check_same_thread": False})

engine = init_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
