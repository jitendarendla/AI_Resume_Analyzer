from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.core.config import settings
from app.core.database import engine, Base
from app.core.middleware import SecurityHeadersMiddleware

from app.routers import auth, upload, analysis, reports, admin

# Safely create database tables on startup
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"[WARNING] Database table creation notice: {e}")

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise-Grade AI Resume Analyzer API for Recruiters & HR teams.",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 1. Add Security Headers Middleware
app.add_middleware(SecurityHeadersMiddleware)

# 2. Add CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=[
        "Content-Disposition",
        "Content-Length",
        "X-Total-Count"
    ],
    max_age=600
)

# Catch-all OPTIONS preflight handler for CORS
@app.options("/{full_path:path}")
async def options_handler(full_path: str, request: Request):
    origin = request.headers.get("origin", "*")
    return JSONResponse(
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": origin if origin else "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400",
        }
    )

# Include Routers
app.include_router(auth.router)
app.include_router(upload.router)
app.include_router(analysis.router)
app.include_router(reports.router)
app.include_router(admin.router)

# Root & Health check routes supporting GET and HEAD for Render deployment probes
@app.api_route("/", methods=["GET", "HEAD"])
def root():
    return {
        "status": "online",
        "message": f"Welcome to {settings.PROJECT_NAME} API v{settings.VERSION}",
        "docs": "/docs"
    }

@app.api_route("/health", methods=["GET", "HEAD"])
@app.api_route("/healthz", methods=["GET", "HEAD"])
@app.api_route("/api/health", methods=["GET", "HEAD"])
def health_check():
    return {"status": "healthy", "service": "ai-resume-analyzer-backend"}
