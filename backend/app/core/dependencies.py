from typing import Optional
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_token, get_password_hash
from app.models.models import Recruiter

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def get_current_recruiter(
    req: Request,
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Recruiter:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or token expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    auth_token = token
    if not auth_token:
        auth_token = req.query_params.get("token")
        
    if not auth_token:
        raise credentials_exception

    recruiter_id: Optional[str] = None

    # 1. Try decoding local JWT token
    payload = decode_token(auth_token)
    if payload and isinstance(payload, dict):
        recruiter_id = payload.get("sub")

    # 2. Fallback to Clerk User ID or Session Token
    if not recruiter_id:
        if auth_token.startswith("user_") or "clerk" in auth_token.lower() or len(auth_token) >= 5:
            recruiter_id = auth_token

    if not recruiter_id:
        raise credentials_exception

    # 3. Fetch or auto-provision UNIQUE isolated Recruiter record for this specific user
    recruiter = db.query(Recruiter).filter(
        (Recruiter.id == recruiter_id) | (Recruiter.email == recruiter_id)
    ).first()

    if not recruiter:
        user_email = recruiter_id if "@" in recruiter_id else f"{recruiter_id}@clerk.user"
        recruiter = Recruiter(
            id=recruiter_id,
            email=user_email,
            name="Recruiter User",
            company="Recruitment Agency",
            hashed_password=get_password_hash("ClerkSecurePass123!"),
            is_admin=False
        )
        db.add(recruiter)
        db.commit()
        db.refresh(recruiter)

    return recruiter

def get_current_admin(recruiter: Recruiter = Depends(get_current_recruiter)) -> Recruiter:
    if not recruiter.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")
    return recruiter
