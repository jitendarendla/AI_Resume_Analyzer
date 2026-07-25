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
        detail="Could not validate credentials or token expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    auth_token = token
    if not auth_token:
        auth_token = req.query_params.get("token")
        
    if not auth_token:
        raise credentials_exception

    payload = decode_token(auth_token)
    if payload is None:
        raise credentials_exception
    
    recruiter_id: str = payload.get("sub")
    if recruiter_id is None:
        raise credentials_exception
        
    recruiter = db.query(Recruiter).filter(Recruiter.id == recruiter_id).first()
    if recruiter is None:
        raise credentials_exception
    return recruiter

def get_current_admin(recruiter: Recruiter = Depends(get_current_recruiter)) -> Recruiter:
    if not recruiter.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")
    return recruiter
