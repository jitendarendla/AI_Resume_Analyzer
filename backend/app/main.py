from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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

# Custom Rate Limit Handler with CORS
@app.exception_handler(RateLimitExceeded)
async def custom_rate_limit_handler(request: Request, exc: RateLimitExceeded):
    origin = request.headers.get("origin", "*")
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded. Please wait a minute before retrying."},
        headers={
            "Access-Control-Allow-Origin": origin if origin else "*",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

# Custom HTTP Exception Handler with CORS
@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    origin = request.headers.get("origin", "*")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers={
            "Access-Control-Allow-Origin": origin if origin else "*",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

# Custom General Exception Handler with CORS
@app.exception_handler(Exception)
async def custom_general_exception_handler(request: Request, exc: Exception):
    origin = request.headers.get("origin", "*")
    print(f"[ERROR] Exception on {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"},
        headers={
            "Access-Control-Allow-Origin": origin if origin else "*",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

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

    try:
        response = await call_next(request)
    except Exception as exc:
        print(f"[UNHANDLED ERROR] {request.method} {request.url.path}: {exc}")
        origin_val = origin if origin else "*"
        response = JSONResponse(
            status_code=500,
            content={"detail": f"Server Error: {str(exc)}"},
            headers={
                "Access-Control-Allow-Origin": origin_val,
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "*",
                "Access-Control-Allow-Headers": "*",
            }
        )

    # Attach CORS headers to EVERY response (200, 400, 401, 404, 429, 500)
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
