FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for PostgreSQL, PyMuPDF, and compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    python3-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir email-validator psutil

COPY . .

# Create required storage directories
RUN mkdir -p /app/uploads /app/quarantine /app/generated_reports

EXPOSE 8000

# Run with Gunicorn multi-worker cluster load balancer
CMD ["gunicorn", "-c", "gunicorn.conf.py", "app.main:app"]
