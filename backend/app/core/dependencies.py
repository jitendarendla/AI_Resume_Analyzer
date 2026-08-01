from typing import Optional
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_token
from app.models.models import Recruiter

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def get_current_recruiter(
    req: Request,
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Recruiter:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or session expired. Please sign in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    auth_token = token
    if not auth_token:
        auth_header = req.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            auth_token = auth_header.split(" ")[1]

    if not auth_token:
        auth_token = req.query_params.get("token")
        
    if not auth_token:
        raise credentials_exception

    recruiter_id: Optional[str] = None

    # Decode local JWT token
    payload = decode_token(auth_token)
    if payload and isinstance(payload, dict):
        recruiter_id = payload.get("sub")

    if not recruiter_id:
        recruiter_id = auth_token

    if not recruiter_id:
        raise credentials_exception

    # Query matching recruiter record from PostgreSQL
    recruiter = db.query(Recruiter).filter(
        (Recruiter.id == recruiter_id) | (Recruiter.email == recruiter_id)
    ).first()

    if not recruiter:
        raise credentials_exception

    return recruiter

def get_current_admin(recruiter: Recruiter = Depends(get_current_recruiter)) -> Recruiter:
    if not recruiter.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")
    return recruiter
