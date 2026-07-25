# Enterprise-Grade AI Resume Analyzer Web Application

Production-ready, enterprise-grade AI Resume Analyzer Web Application designed for recruiters and HR teams. Allows recruiters to securely upload 1000+ resumes at once, analyze them using AI/NLP, match candidates against Job Descriptions (JDs), calculate ATS scores, generate downloadable Excel reports, and maintain complete upload/download audit history with multi-tenant data isolation.

---

## 🛠 Tech Stack

### Backend
- **FastAPI**: Asynchronous Python Web Framework
- **SQLAlchemy ORM & PostgreSQL**: Database with automatic setup and fallback
- **JWT Authentication**: Access & Refresh Token security with Passlib/Bcrypt password hashing
- **SlowAPI**: Rate limiting on critical endpoints (Register, Login, Upload, Change Password, Reset)
- **AI & NLP Extraction Engine**: Custom heuristic & regex parser for PDF, DOC, DOCX, TXT files
- **Excel Report Generator**: Pandas & OpenPyXL styled workbook exporter
- **pytest**: Automated unit and integration testing suite

### Frontend
- **Next.js 16 (App Router)**: Modern React Framework with TypeScript
- **Tailwind CSS v4**: Dark Mode Glassmorphism SaaS UI Design
- **Framer Motion & Lucide Icons**: Micro-animations and rich icons
- **Axios Interceptors**: Automated JWT token handling & error redirects
- **Recharts**: Interactive Dashboard charts for trends, skills, and experience distribution

---

## 🔒 Enterprise Security Features

1. **JWT Auth**: Access & Refresh token rotation with automatic token revocation on logout.
2. **Bcrypt Password Hashing**: Passwords stored securely with bcrypt hashing.
3. **Route Protection & Tenant Isolation**: Every candidate, upload session, report, and download log is tied to a specific `recruiter_id`. No recruiter can access another recruiter's data.
4. **File Security & Virus Scanner**: Upload validator enforces maximum 1000 resumes, max 10MB per file, allowed extensions (`.pdf`, `.doc`, `.docx`, `.txt`), magic byte signature verification (rejects `.exe`, `.zip`, `.js`, `.bat`), and isolates malicious files into a `quarantine/` folder.
5. **Rate Limiting**: Protected register (3/min), login (5/min), upload (5/min), change password (5/min), forgot password (3/min).
6. **Password Complexity Policy**: Minimum 8 characters, uppercase, lowercase, digit, and special character.
7. **Security Headers**: `X-Frame-Options`, `X-Content-Type-Options`, `Content-Security-Policy`, `Referrer-Policy`, `Permissions-Policy`.
8. **Audit Logging**: Full system audit trail tracking logins, logouts, uploads, downloads, IP addresses, browser user-agent, and timestamps.

---

## 🚀 Quick Setup Instructions

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m pip install email-validator

# Run FastAPI Server
python -m uvicorn app.main:app --reload --port 8000
```

Access OpenAPI Swagger Documentation at: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your web browser.

---

## 🐳 Docker Deployment

To launch PostgreSQL, FastAPI Backend, and Next.js Frontend together in Docker:

```bash
docker-compose up --build -d
```

---

## 🧪 Running Automated Unit Tests

```bash
cd backend
python -m pytest
```

---

## 📂 Project Structure

```text
ai-resume-analyzer/
├── backend/
│   ├── app/
│   │   ├── core/           # Config, Database, Security, Middleware, Dependencies
│   │   ├── models/         # SQLAlchemy ORM Database Schemas
│   │   ├── schemas/        # Pydantic v2 Request/Response Schemas
│   │   ├── services/       # Parser, JD Matcher, Excel Exporter, Virus Scanner
│   │   ├── routers/        # Auth, Upload, Analysis, Reports, Admin API Endpoints
│   │   └── main.py         # FastAPI App Entry Point
│   ├── tests/              # pytest unit & integration tests
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js App Router (Dashboard, Upload, Candidates, Reports, Admin)
│   │   ├── components/     # Sidebar, Navbar, StatCard, CandidateModal
│   │   ├── context/        # Auth Context Provider
│   │   └── lib/            # Axios API Client
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```
