from typing import List
import os
import shutil
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.dependencies import get_current_recruiter
from app.models.models import Recruiter, UploadSession, Candidate, CandidateMatch, UploadHistory, DownloadHistory, AuditLog, Report
from app.schemas.schemas import CandidateResponse, UploadHistoryResponse, DownloadHistoryResponse
from app.services.excel_service import generate_excel_report

router = APIRouter(prefix="/api/reports", tags=["Reports & History"])

@router.delete("/purge-all")
def purge_all_recruiter_data(recruiter: Recruiter = Depends(get_current_recruiter), db: Session = Depends(get_db)):
    db.query(CandidateMatch).filter(CandidateMatch.candidate_id.in_(
        db.query(Candidate.id).filter(Candidate.recruiter_id == recruiter.id)
    )).delete(synchronize_session=False)

    db.query(Candidate).filter(Candidate.recruiter_id == recruiter.id).delete(synchronize_session=False)
    db.query(UploadSession).filter(UploadSession.recruiter_id == recruiter.id).delete(synchronize_session=False)
    db.query(Report).filter(Report.recruiter_id == recruiter.id).delete(synchronize_session=False)
    db.query(UploadHistory).filter(UploadHistory.recruiter_id == recruiter.id).delete(synchronize_session=False)
    db.query(DownloadHistory).filter(DownloadHistory.recruiter_id == recruiter.id).delete(synchronize_session=False)
    db.query(AuditLog).filter(AuditLog.recruiter_id == recruiter.id).delete(synchronize_session=False)
    db.commit()

    storage_dirs = ['storage/uploads', 'storage/reports', 'app/uploads', 'app/reports']
    for sdir in storage_dirs:
        if os.path.exists(sdir):
            for item in os.listdir(sdir):
                item_path = os.path.join(sdir, item)
                try:
                    if os.path.isfile(item_path) or os.path.islink(item_path):
                        os.unlink(item_path)
                    elif os.path.isdir(item_path):
                        shutil.rmtree(item_path)
                except Exception:
                    pass

    return {"message": "All recruiter candidates, reports, sessions, and history purged successfully."}

@router.get("/export/{identifier}")
def export_excel_report(
    identifier: str,
    req: Request,
    recruiter: Recruiter = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    session_obj = db.query(UploadSession).filter(
        UploadSession.id == identifier,
        UploadSession.recruiter_id == recruiter.id
    ).first()

    if not session_obj:
        hist = db.query(UploadHistory).filter(
            UploadHistory.id == identifier,
            UploadHistory.recruiter_id == recruiter.id
        ).first()
        if hist and hist.session_id:
            session_obj = db.query(UploadSession).filter(UploadSession.id == hist.session_id).first()
        elif hist:
            session_obj = db.query(UploadSession).filter(
                UploadSession.report_name == hist.report_name,
                UploadSession.recruiter_id == recruiter.id
            ).order_by(UploadSession.created_at.desc()).first()

    if not session_obj:
        session_obj = db.query(UploadSession).filter(
            UploadSession.recruiter_id == recruiter.id
        ).order_by(UploadSession.created_at.desc()).first()

    if not session_obj:
        raise HTTPException(status_code=404, detail="No resume analysis session found to export.")

    candidates = db.query(Candidate).filter(Candidate.session_id == session_obj.id).all()
    if not candidates:
        candidates = db.query(Candidate).filter(Candidate.recruiter_id == recruiter.id).all()

    cand_data = []
    for c in candidates:
        cand_dict = CandidateResponse.model_validate(c).model_dump()
        cand_data.append(cand_dict)

    excel_path = generate_excel_report(session_obj.report_name, cand_data)

    dl_log = DownloadHistory(
        recruiter_id=recruiter.id,
        report_name=session_obj.report_name,
        excel_file=excel_path
    )
    db.add(dl_log)

    audit = AuditLog(
        recruiter_id=recruiter.id,
        action=f"Downloaded Excel report '{session_obj.report_name}'",
        ip_address=req.client.host if req.client else "127.0.0.1",
        user_agent=req.headers.get("user-agent", "")
    )
    db.add(audit)
    db.commit()

    return FileResponse(
        path=excel_path,
        filename=f"{session_obj.report_name.replace(' ', '_')}_Report.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

@router.delete("/export/{identifier}")
def delete_excel_report(
    identifier: str,
    recruiter: Recruiter = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    entry = db.query(UploadHistory).filter(
        UploadHistory.id == identifier,
        UploadHistory.recruiter_id == recruiter.id
    ).first()

    if not entry:
        entry = db.query(UploadHistory).filter(
            UploadHistory.session_id == identifier,
            UploadHistory.recruiter_id == recruiter.id
        ).first()

    if entry:
        db.delete(entry)

    session_obj = db.query(UploadSession).filter(
        UploadSession.id == identifier,
        UploadSession.recruiter_id == recruiter.id
    ).first()
    if session_obj:
        db.delete(session_obj)

    db.commit()
    return {"message": "Generated report deleted successfully."}

@router.get("/history/uploads", response_model=List[UploadHistoryResponse])
def get_upload_history(recruiter: Recruiter = Depends(get_current_recruiter), db: Session = Depends(get_db)):
    history = db.query(UploadHistory).filter(UploadHistory.recruiter_id == recruiter.id).order_by(UploadHistory.created_at.desc()).all()
    return history

@router.delete("/history/uploads/{upload_id}")
def delete_upload_history(upload_id: str, recruiter: Recruiter = Depends(get_current_recruiter), db: Session = Depends(get_db)):
    entry = db.query(UploadHistory).filter(UploadHistory.id == upload_id, UploadHistory.recruiter_id == recruiter.id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Upload history record not found.")
    db.delete(entry)
    db.commit()
    return {"message": "Upload history deleted."}

@router.get("/history/downloads", response_model=List[DownloadHistoryResponse])
def get_download_history(recruiter: Recruiter = Depends(get_current_recruiter), db: Session = Depends(get_db)):
    history = db.query(DownloadHistory).filter(DownloadHistory.recruiter_id == recruiter.id).order_by(DownloadHistory.download_date.desc()).all()
    return history

@router.delete("/history/downloads/{download_id}")
def delete_download_history(download_id: str, recruiter: Recruiter = Depends(get_current_recruiter), db: Session = Depends(get_db)):
    entry = db.query(DownloadHistory).filter(DownloadHistory.id == download_id, DownloadHistory.recruiter_id == recruiter.id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Download history record not found.")
    db.delete(entry)
    db.commit()
    return {"message": "Download history deleted."}

@router.get("/stats")
def get_dashboard_stats(recruiter: Recruiter = Depends(get_current_recruiter), db: Session = Depends(get_db)):
    total_reports = db.query(UploadHistory).filter(UploadHistory.recruiter_id == recruiter.id).count()
    total_resumes = db.query(Candidate).filter(Candidate.recruiter_id == recruiter.id).count()
    total_downloads = db.query(DownloadHistory).filter(DownloadHistory.recruiter_id == recruiter.id).count()

    recent_uploads = db.query(UploadHistory).filter(UploadHistory.recruiter_id == recruiter.id).order_by(UploadHistory.created_at.desc()).limit(5).all()
    recent_uploads_data = [UploadHistoryResponse.model_validate(u) for u in recent_uploads]

    candidates = db.query(Candidate).filter(Candidate.recruiter_id == recruiter.id).all()
    skill_counts = {}
    exp_brackets = {"0-2 Yrs": 0, "2-5 Yrs": 0, "5-8 Yrs": 0, "8+ Yrs": 0}

    session_map = {}
    sessions_all = db.query(UploadSession).filter(UploadSession.recruiter_id == recruiter.id).all()
    for s in sessions_all:
        session_map[s.id] = s.report_name or "General Batch"

    folder_skills_raw = {}
    folder_exp_raw = {}

    for c in candidates:
        folder_name = session_map.get(c.session_id) or "General Batch"
        if folder_name not in folder_skills_raw:
            folder_skills_raw[folder_name] = {}
        if folder_name not in folder_exp_raw:
            folder_exp_raw[folder_name] = {"0-2 Yrs": 0, "2-5 Yrs": 0, "5-8 Yrs": 0, "8+ Yrs": 0}

        if c.skills and isinstance(c.skills, list):
            for sk in c.skills:
                skill_counts[sk] = skill_counts.get(sk, 0) + 1
                folder_skills_raw[folder_name][sk] = folder_skills_raw[folder_name].get(sk, 0) + 1
        
        years = c.experience_years or 0
        if years < 2:
            exp_brackets["0-2 Yrs"] += 1
            folder_exp_raw[folder_name]["0-2 Yrs"] += 1
        elif years < 5:
            exp_brackets["2-5 Yrs"] += 1
            folder_exp_raw[folder_name]["2-5 Yrs"] += 1
        elif years < 8:
            exp_brackets["5-8 Yrs"] += 1
            folder_exp_raw[folder_name]["5-8 Yrs"] += 1
        else:
            exp_brackets["8+ Yrs"] += 1
            folder_exp_raw[folder_name]["8+ Yrs"] += 1

    top_skills = dict(sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:8])

    skills_by_folder = {"All Folders": top_skills}
    for fname, f_counts in folder_skills_raw.items():
        skills_by_folder[fname] = dict(sorted(f_counts.items(), key=lambda x: x[1], reverse=True)[:8])

    exp_by_folder = {"All Folders": exp_brackets}
    for fname, f_exp in folder_exp_raw.items():
        exp_by_folder[fname] = f_exp

    history_all = db.query(UploadHistory).filter(UploadHistory.recruiter_id == recruiter.id).all()
    folder_counts = {}
    for h in history_all:
        fname = h.report_name or "General Batch"
        folder_counts[fname] = folder_counts.get(fname, 0) + (h.resume_count or 1)

    sorted_folders = sorted(folder_counts.items(), key=lambda x: x[1], reverse=True)
    folder_distribution = []
    if len(sorted_folders) <= 5:
        folder_distribution = [{"name": name, "value": count} for name, count in sorted_folders]
    else:
        top4 = sorted_folders[:4]
        other_sum = sum(count for _, count in sorted_folders[4:])
        folder_distribution = [{"name": name, "value": count} for name, count in top4]
        if other_sum > 0:
            folder_distribution.append({"name": "Other Folders", "value": other_sum})

    if not folder_distribution:
        folder_distribution = [{"name": "No Folders Yet", "value": 0}]

    now = datetime.now()
    date_counts = {}
    for h in history_all:
        if h.created_at:
            d_str = h.created_at.strftime("%b %d")
            date_counts[d_str] = date_counts.get(d_str, 0) + (h.resume_count or 1)

    date_wise_trends = []
    for i in range(9, -1, -1):
        dt = now - timedelta(days=i)
        dt_str = dt.strftime("%b %d")
        date_wise_trends.append({"label": dt_str, "count": date_counts.get(dt_str, 0)})

    week_counts = {"Week 1": 0, "Week 2": 0, "Week 3": 0, "Week 4": 0}
    for h in history_all:
        if h.created_at:
            delta_days = (now - h.created_at).days
            if delta_days < 7:
                week_counts["Week 4"] += (h.resume_count or 1)
            elif delta_days < 14:
                week_counts["Week 3"] += (h.resume_count or 1)
            elif delta_days < 21:
                week_counts["Week 2"] += (h.resume_count or 1)
            elif delta_days < 28:
                week_counts["Week 1"] += (h.resume_count or 1)

    week_wise_trends = [{"label": w, "count": week_counts[w]} for w in ["Week 1", "Week 2", "Week 3", "Week 4"]]

    return {
        "total_reports": total_reports,
        "total_resumes": total_resumes,
        "total_downloads": total_downloads,
        "ai_processing_status": "System Operational" if total_resumes > 0 else "Ready for Uploads",
        "recent_uploads": recent_uploads_data,
        "skills_distribution": top_skills,
        "skills_by_folder": skills_by_folder,
        "experience_distribution": exp_brackets,
        "exp_by_folder": exp_by_folder,
        "folder_distribution": folder_distribution,
        "date_wise_trends": date_wise_trends,
        "week_wise_trends": week_wise_trends,
        "upload_trends": date_wise_trends
    }
