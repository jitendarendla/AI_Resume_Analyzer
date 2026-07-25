import random
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field, EmailStr

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from app.core.config import settings
from app.core.dependencies import get_current_recruiter
from app.models.models import Recruiter, AuditLog, OTP
from app.schemas.schemas import (
    RecruiterRegister,
    RecruiterLogin,
    Token,
    ChangePassword,
    ForgotPasswordRequest,
    ForgotPasswordReset
)
from app.services.email_service import send_resend_otp_email

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class ProfileUpdate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    company: str = Field(..., min_length=2, max_length=100)

class SendOTPRequest(BaseModel):
    email: EmailStr

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp_code: str = Field(..., min_length=6, max_length=6)

class ResetPasswordOTPRequest(BaseModel):
    email: EmailStr
    otp_code: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)

@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
def register_recruiter(data: RecruiterRegister, req: Request, db: Session = Depends(get_db)):
    existing = db.query(Recruiter).filter(Recruiter.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Recruiter email already registered."
        )

    # Check if first user -> make Admin
    total_users = db.query(Recruiter).count()
    is_admin = True if total_users == 0 else False

    hashed_pw = get_password_hash(data.password)
    new_recruiter = Recruiter(
        name=data.name,
        email=data.email,
        company=data.company,
        password_hash=hashed_pw,
        is_admin=is_admin
    )
    db.add(new_recruiter)
    db.commit()
    db.refresh(new_recruiter)

    audit = AuditLog(
        recruiter_id=new_recruiter.id,
        action="Recruiter Account Registered",
        ip_address=req.client.host if req.client else "127.0.0.1",
        user_agent=req.headers.get("user-agent", "")
    )
    db.add(audit)
    db.commit()

    return {"message": "Recruiter account created successfully. Please login."}

@router.post("/login", response_model=Token)
def login_recruiter(data: RecruiterLogin, req: Request, db: Session = Depends(get_db)):
    recruiter = db.query(Recruiter).filter(Recruiter.email == data.email).first()
    if not recruiter or not verify_password(data.password, recruiter.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    access_token = create_access_token(data={"sub": recruiter.id})
    refresh_token = create_refresh_token(data={"sub": recruiter.id})

    audit = AuditLog(
        recruiter_id=recruiter.id,
        action="Recruiter Logged In",
        ip_address=req.client.host if req.client else "127.0.0.1",
        user_agent=req.headers.get("user-agent", "")
    )
    db.add(audit)
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "recruiter_id": recruiter.id,
        "email": recruiter.email,
        "name": recruiter.name,
        "company": recruiter.company or "Recruitment Agency",
        "is_admin": recruiter.is_admin
    }

@router.post("/send-otp")
def send_otp(body: SendOTPRequest, db: Session = Depends(get_db)):
    # Verify user exists
    recruiter = db.query(Recruiter).filter(Recruiter.email == body.email).first()
    if not recruiter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No recruiter account found registered with this email."
        )

    # Invalidate existing unused OTPs
    db.query(OTP).filter(OTP.email == body.email, OTP.is_used == False).update({"is_used": True})
    db.commit()

    # Generate 6-digit numeric OTP
    generated_code = str(random.randint(100000, 999999))
    expiration = datetime.now(timezone.utc) + timedelta(minutes=10)

    new_otp = OTP(
        email=body.email,
        otp_code=generated_code,
        expires_at=expiration,
        is_used=False
    )
    db.add(new_otp)
    db.commit()

    # Dispatch email via Resend Service
    email_res = send_resend_otp_email(body.email, generated_code)

    return {
        "message": f"Verification OTP code sent to {body.email} via Resend Email Service. Please check your inbox.",
        "resend_status": email_res.get("status", "sent")
    }

@router.post("/verify-otp")
def verify_otp(body: VerifyOTPRequest, db: Session = Depends(get_db)):
    otp_record = db.query(OTP).filter(
        OTP.email == body.email,
        OTP.otp_code == body.otp_code,
        OTP.is_used == False
    ).order_by(OTP.created_at.desc()).first()

    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP code. Please check your email inbox."
        )

    # Check expiration
    now_utc = datetime.now(timezone.utc)
    record_expires = otp_record.expires_at
    if record_expires.tzinfo is None:
        record_expires = record_expires.replace(tzinfo=timezone.utc)

    if record_expires < now_utc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP code has expired. Please request a new OTP."
        )

    otp_record.is_used = True
    db.commit()

    return {
        "message": "Email verified successfully! You may now reset your password.",
        "verified": True
    }

@router.post("/reset-password-with-otp")
def reset_password_with_otp(body: ResetPasswordOTPRequest, db: Session = Depends(get_db)):
    if body.new_password != body.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match."
        )

    recruiter = db.query(Recruiter).filter(Recruiter.email == body.email).first()
    if not recruiter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recruiter account not found."
        )

    # Check recent verified OTP record
    recent_otp = db.query(OTP).filter(
        OTP.email == body.email,
        OTP.otp_code == body.otp_code,
        OTP.is_used == True
    ).order_by(OTP.created_at.desc()).first()

    if not recent_otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email verification incomplete. Please verify your OTP code first."
        )

    recruiter.password_hash = get_password_hash(body.new_password)
    db.commit()

    return {
        "message": "Password updated successfully! Please login with your new password."
    }

@router.put("/profile")
def update_profile(
    body: ProfileUpdate,
    recruiter: Recruiter = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    recruiter.name = body.name
    recruiter.company = body.company
    db.commit()
    return {
        "message": "Profile updated successfully",
        "user": {
            "recruiter_id": recruiter.id,
            "email": recruiter.email,
            "name": recruiter.name,
            "company": recruiter.company,
            "is_admin": recruiter.is_admin
        }
    }

@router.post("/change-password")
def change_password(
    body: ChangePassword,
    recruiter: Recruiter = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    if not verify_password(body.current_password, recruiter.password_hash):
        raise HTTPException(status_code=400, detail="Current password incorrect.")
    if body.new_password != body.confirm_password:
        raise HTTPException(status_code=400, detail="New passwords do not match.")

    recruiter.password_hash = get_password_hash(body.new_password)
    db.commit()
    return {"message": "Password updated successfully."}
