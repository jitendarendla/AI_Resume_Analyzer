from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.core.config import settings
from app.core.database import engine, Base

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

# Custom Bulletproof CORS & Security Middleware
@app.middleware("http")
async def cors_and_security_middleware(request: Request, call_next):
    origin = request.headers.get("origin")
    
    # Handle preflight OPTIONS requests immediately with 200 OK & full CORS headers
    if request.method == "OPTIONS":
        response = Response(status_code=200)
        response.headers["Access-Control-Allow-Origin"] = origin if origin else "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Max-Age"] = "86400"
        return response

    response = await call_next(request)

    # Attach CORS headers to every response (200, 400, 401, 404, 500)
    response.headers["Access-Control-Allow-Origin"] = origin if origin else "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Expose-Headers"] = "Content-Disposition, Content-Length, X-Total-Count"

    # Security Headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "no-referrer-when-downgrade"
    response.headers["Cross-Origin-Resource-Policy"] = "cross-origin"

    return response

# Standard CORSMiddleware as additional fallback
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "Content-Length", "X-Total-Count"],
    max_age=86400,
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
