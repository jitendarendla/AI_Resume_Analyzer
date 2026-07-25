import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Resume Analyzer"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database Settings
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "Sonu@801"
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str = "resume_analyzer_db"
    
    # Security / JWT
    SECRET_KEY: str = "9e8a71c42f0b4d21e8a93019d1e34a6b29f0e1d2c3b4a567890abcdef123456"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days

    # Resend Email Service Settings
    RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "")
    RESEND_FROM_EMAIL: str = os.getenv("RESEND_FROM_EMAIL", "AI Resume Analyzer <onboarding@resend.dev>")

    # CORS Security Origins
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://10.38.200.105:3000",
        "http://192.168.56.1:3000"
    ]
    
    # Upload limits
    MAX_FILE_SIZE_MB: int = 10
    MAX_RESUMES_PER_UPLOAD: int = 1000
    ALLOWED_EXTENSIONS: set[str] = {"pdf", "doc", "docx", "txt"}
    UPLOAD_DIR: str = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
    QUARANTINE_DIR: str = os.path.join(os.path.dirname(__file__), "..", "..", "quarantine")
    REPORTS_DIR: str = os.path.join(os.path.dirname(__file__), "..", "..", "generated_reports")
    
    # OpenAI optional
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.QUARANTINE_DIR, exist_ok=True)
os.makedirs(settings.REPORTS_DIR, exist_ok=True)
