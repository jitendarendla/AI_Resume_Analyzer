from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

# Auth Schemas
class RecruiterRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    company: str = Field(..., min_length=2, max_length=100)
    password: str

class RecruiterLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    recruiter_id: str
    email: str
    name: str
    company: Optional[str] = "Enterprise Corp"
    is_admin: bool

class ChangePassword(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ForgotPasswordReset(BaseModel):
    email: EmailStr
    otp_code: str
    new_password: str

# Candidate & Match Schemas
class CandidateMatchSchema(BaseModel):
    ats_score: float
    skill_match_pct: float
    matched_skills: List[str]
    missing_skills: List[str]
    ranking: int = 0

    class Config:
        from_attributes = True

class CandidateResponse(BaseModel):
    id: str
    session_id: str
    name: str
    email: str
    phone: str
    location: str
    skills: List[str]
    education: str
    experience_years: float
    certifications: List[str]
    linkedin: str
    github: str
    projects: List[str]
    file_name: str
    created_at: datetime
    match: Optional[CandidateMatchSchema] = None

    class Config:
        from_attributes = True

# Upload Session Schema
class UploadSessionResponse(BaseModel):
    session_id: str
    report_name: str
    total_files: int
    processed_files: int
    status: str
    created_at: datetime

# Upload History & Download History
class UploadHistoryResponse(BaseModel):
    id: str
    session_id: Optional[str] = ""
    report_name: str
    resume_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class DownloadHistoryResponse(BaseModel):
    id: str
    report_name: str
    excel_file: str
    download_date: datetime

    class Config:
        from_attributes = True

# Audit Log Schema
class AuditLogResponse(BaseModel):
    id: str
    recruiter_id: Optional[str]
    action: str
    ip_address: str
    user_agent: str
    timestamp: datetime

    class Config:
        from_attributes = True

# Dashboard Stats Schema
class DashboardStats(BaseModel):
    total_reports: int
    total_resumes: int
    total_downloads: int
    ai_processing_status: str
    recent_uploads: List[UploadHistoryResponse]
    skills_distribution: dict
    experience_distribution: dict
    upload_trends: List[dict]
