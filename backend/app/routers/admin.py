import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.core.config import settings
from app.models.models import Recruiter, AuditLog, UploadSession, Candidate
from app.schemas.schemas import AuditLogResponse

router = APIRouter(prefix="/api/admin", tags=["Admin Operations"])

@router.get("/recruiters")
def list_all_recruiters(admin: Recruiter = Depends(get_current_admin), db: Session = Depends(get_db)):
    recruiters = db.query(Recruiter).all()
    results = []
    for r in recruiters:
        upload_count = db.query(UploadSession).filter(UploadSession.recruiter_id == r.id).count()
        candidate_count = db.query(Candidate).filter(Candidate.recruiter_id == r.id).count()
        results.append({
            "id": r.id,
            "name": r.name,
            "email": r.email,
            "company": r.company,
            "is_admin": r.is_admin,
            "created_at": r.created_at,
            "upload_sessions": upload_count,
            "total_candidates": candidate_count
        })
    return results

@router.delete("/recruiters/{recruiter_id}")
def delete_recruiter(recruiter_id: str, admin: Recruiter = Depends(get_current_admin), db: Session = Depends(get_db)):
    if recruiter_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account.")

    recruiter = db.query(Recruiter).filter(Recruiter.id == recruiter_id).first()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter not found.")

    db.delete(recruiter)
    db.commit()
    return {"message": "Recruiter deleted successfully."}

@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_system_audit_logs(
    limit: int = 100,
    admin: Recruiter = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return logs

@router.get("/system-stats")
def get_admin_system_stats(admin: Recruiter = Depends(get_current_admin), db: Session = Depends(get_db)):
    total_recruiters = db.query(Recruiter).count()
    total_candidates = db.query(Candidate).count()
    total_sessions = db.query(UploadSession).count()
    total_logs = db.query(AuditLog).count()

    def get_dir_size(path):
        total = 0
        if os.path.exists(path):
            for root, dirs, files in os.walk(path):
                for f in files:
                    fp = os.path.join(root, f)
                    if os.path.exists(fp):
                        total += os.path.getsize(fp)
        return round(total / (1024 * 1024), 2) # MB

    uploads_size = get_dir_size(settings.UPLOAD_DIR)
    reports_size = get_dir_size(settings.REPORTS_DIR)
    quarantine_size = get_dir_size(settings.QUARANTINE_DIR)

    return {
        "total_recruiters": total_recruiters,
        "total_candidates": total_candidates,
        "total_upload_sessions": total_sessions,
        "total_audit_logs": total_logs,
        "storage_usage_mb": {
            "uploads_folder": uploads_size,
            "reports_folder": reports_size,
            "quarantine_folder": quarantine_size,
            "total_storage_mb": uploads_size + reports_size + quarantine_size
        }
    }
