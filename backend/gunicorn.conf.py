import os
import multiprocessing

# Gunicorn Multi-Worker Load Balancer Configuration for Production Deployment

bind = f"0.0.0.0:{os.getenv('PORT', '8000')}"

# Calculate optimal worker count based on CPU cores (min 2, max 8 for server instance memory safety)
cores = multiprocessing.cpu_count()
workers = int(os.getenv("WEB_CONCURRENCY", max(2, min(cores * 2 + 1, 8))))

worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 1000
timeout = 120
keepalive = 5

# Logging & Monitoring
loglevel = os.getenv("LOG_LEVEL", "info")
accesslog = "-"
errorlog = "-"

# Preload application code for faster worker fork and shared memory utilization
preload_app = True

print(f"[LOAD BALANCER] Starting Gunicorn Cluster with {workers} Uvicorn Workers bound to {bind}")
