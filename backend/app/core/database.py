import urllib.parse
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

encoded_password = urllib.parse.quote_plus(settings.POSTGRES_PASSWORD)
PG_URL = f"postgresql://{settings.POSTGRES_USER}:{encoded_password}@{settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"
PG_SERVER_URL = f"postgresql://{settings.POSTGRES_USER}:{encoded_password}@{settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}/postgres"

def init_db_engine():
    try:
        temp_engine = create_engine(PG_SERVER_URL, isolation_level="AUTOCOMMIT")
        with temp_engine.connect() as conn:
            result = conn.execute(text(f"SELECT 1 FROM pg_database WHERE datname='{settings.POSTGRES_DB}'"))
            if not result.scalar():
                conn.execute(text(f"CREATE DATABASE {settings.POSTGRES_DB}"))
        temp_engine.dispose()
        
        engine = create_engine(PG_URL, pool_pre_ping=True, pool_size=10, max_overflow=20)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            # Auto-migration for missing columns if table already exists
            try:
                conn.execute(text("ALTER TABLE upload_history ADD COLUMN IF NOT EXISTS session_id VARCHAR;"))
                conn.commit()
            except Exception:
                pass
        print("[INFO] Successfully connected to PostgreSQL Database.")
        return engine
    except Exception as e:
        print(f"[WARNING] Could not connect to PostgreSQL: {e}. Falling back to local SQLite database.")
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
