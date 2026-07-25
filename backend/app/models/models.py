import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Recruiter(Base):
    __tablename__ = "recruiters"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, nullable=False, index=True)
    company = Column(String(100), nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    sessions = relationship("UploadSession", back_populates="recruiter", cascade="all, delete-orphan")
    candidates = relationship("Candidate", back_populates="recruiter", cascade="all, delete-orphan")
    upload_history = relationship("UploadHistory", back_populates="recruiter", cascade="all, delete-orphan")
    download_history = relationship("DownloadHistory", back_populates="recruiter", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="recruiter", cascade="all, delete-orphan")

class UploadSession(Base):
    __tablename__ = "upload_sessions"

    id = Column(String, primary_key=True, default=generate_uuid)
    recruiter_id = Column(String, ForeignKey("recruiters.id", ondelete="CASCADE"), nullable=False)
    report_name = Column(String(150), nullable=False)
    job_description = Column(Text, nullable=True)
    total_files = Column(Integer, default=0)
    processed_files = Column(Integer, default=0)
    status = Column(String(50), default="PROCESSING") # PROCESSING, COMPLETED, FAILED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    recruiter = relationship("Recruiter", back_populates="sessions")
    candidates = relationship("Candidate", back_populates="session", cascade="all, delete-orphan")

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(String, primary_key=True, default=generate_uuid)
    session_id = Column(String, ForeignKey("upload_sessions.id", ondelete="CASCADE"), nullable=False)
    recruiter_id = Column(String, ForeignKey("recruiters.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), default="Unknown Candidate")
    email = Column(String(120), default="")
    phone = Column(String(50), default="")
    location = Column(String(100), default="")
    skills = Column(JSON, default=list)
    education = Column(String(255), default="")
    experience_years = Column(Float, default=0.0)
    certifications = Column(JSON, default=list)
    linkedin = Column(String(255), default="")
    github = Column(String(255), default="")
    projects = Column(JSON, default=list)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    raw_text = Column(Text, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    recruiter = relationship("Recruiter", back_populates="candidates")
    session = relationship("UploadSession", back_populates="candidates")
    match = relationship("CandidateMatch", back_populates="candidate", uselist=False, cascade="all, delete-orphan")

class CandidateMatch(Base):
    __tablename__ = "candidate_matches"

    id = Column(String, primary_key=True, default=generate_uuid)
    candidate_id = Column(String, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, unique=True)
    ats_score = Column(Float, default=0.0)
    skill_match_pct = Column(Float, default=0.0)
    matched_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    ranking = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    candidate = relationship("Candidate", back_populates="match")

class Report(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, default=generate_uuid)
    session_id = Column(String, ForeignKey("upload_sessions.id", ondelete="CASCADE"), nullable=False)
    recruiter_id = Column(String, ForeignKey("recruiters.id", ondelete="CASCADE"), nullable=False)
    report_name = Column(String(150), nullable=False)
    excel_path = Column(String(500), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class UploadHistory(Base):
    __tablename__ = "upload_history"

    id = Column(String, primary_key=True, default=generate_uuid)
    session_id = Column(String, nullable=True)
    recruiter_id = Column(String, ForeignKey("recruiters.id", ondelete="CASCADE"), nullable=False)
    report_name = Column(String(150), nullable=False)
    resume_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    recruiter = relationship("Recruiter", back_populates="upload_history")

class DownloadHistory(Base):
    __tablename__ = "download_history"

    id = Column(String, primary_key=True, default=generate_uuid)
    recruiter_id = Column(String, ForeignKey("recruiters.id", ondelete="CASCADE"), nullable=False)
    report_name = Column(String(150), nullable=False)
    excel_file = Column(String(255), nullable=False)
    download_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    recruiter = relationship("Recruiter", back_populates="download_history")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    recruiter_id = Column(String, ForeignKey("recruiters.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False)
    ip_address = Column(String(50), default="127.0.0.1")
    user_agent = Column(String(255), default="")
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    recruiter = relationship("Recruiter", back_populates="audit_logs")

class OTP(Base):
    __tablename__ = "otps"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String(120), nullable=False, index=True)
    otp_code = Column(String(6), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
