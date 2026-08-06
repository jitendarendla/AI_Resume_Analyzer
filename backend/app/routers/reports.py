from datetime import datetime, timedelta, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_recruiter
from app.models.models import Recruiter, UploadHistory, DownloadHistory, AuditLog, Candidate, UploadSession
from app.schemas.schemas import UploadHistoryResponse, DownloadHistoryResponse
from app.services.excel_service import generate_excel_report

router = APIRouter(prefix="/api/reports", tags=["Reports & History"])

@router.get("/export/{identifier}")
def export_excel_report(
    identifier: str,
    req: Request,
    recruiter: Recruiter = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    try:
        session_obj = db.query(UploadSession).filter(
            UploadSession.id == identifier,
            UploadSession.recruiter_id == recruiter.id
        ).first()

        report_name = "Resume Report"
        target_session_id = identifier

        if session_obj:
            report_name = session_obj.report_name
            target_session_id = session_obj.id
        else:
            hist_obj = db.query(UploadHistory).filter(
                (UploadHistory.id == identifier) | (UploadHistory.session_id == identifier) | (UploadHistory.report_name == identifier),
                UploadHistory.recruiter_id == recruiter.id
            ).first()

            if hist_obj:
                report_name = hist_obj.report_name
                target_session_id = hist_obj.session_id or hist_obj.id

        candidates = db.query(Candidate).filter(
            Candidate.recruiter_id == recruiter.id,
            Candidate.session_id == target_session_id
        ).all()

        if not candidates:
            # Fallback to query candidates for this recruiter if specific session not found
            candidates = db.query(Candidate).filter(
                Candidate.recruiter_id == recruiter.id
            ).limit(500).all()

        cand_data = []
        for c in candidates:
            cand_data.append({
                "name": c.name or "",
                "email": c.email or "",
                "phone": c.phone or "",
                "file_name": c.file_name or "",
                "location": c.location or "",
                "skills": c.skills or [],
                "raw_text": c.raw_text or ""
            })

        excel_path = generate_excel_report(report_name, cand_data)

        dl_log = DownloadHistory(
            recruiter_id=recruiter.id,
            report_name=report_name,
            excel_file=excel_path
        )
        db.add(dl_log)

        audit = AuditLog(
            recruiter_id=recruiter.id,
            action=f"Downloaded Excel report '{report_name}'",
            ip_address=req.client.host if req.client else "127.0.0.1",
            user_agent=req.headers.get("user-agent", "")
        )
        db.add(audit)
        db.commit()

        return FileResponse(
            path=excel_path,
            filename=f"{report_name.replace(' ', '_')}_Report.xlsx",
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
    except Exception as err:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Excel report export error: {str(err)}")

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
    history_all = db.query(UploadHistory).filter(UploadHistory.recruiter_id == recruiter.id).all()
    for h in history_all:
        if h.session_id:
            session_map[h.session_id] = h.report_name or "General Batch"
        session_map[h.id] = h.report_name or "General Batch"

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

    now = datetime.now(timezone.utc)
    date_counts = {}
    for h in history_all:
        if h.created_at:
            created = h.created_at
            if created.tzinfo is None:
                created = created.replace(tzinfo=timezone.utc)
            d_str = created.strftime("%b %d")
            date_counts[d_str] = date_counts.get(d_str, 0) + (h.resume_count or 1)

    date_wise_trends = []
    for i in range(9, -1, -1):
        dt = now - timedelta(days=i)
        dt_str = dt.strftime("%b %d")
        date_wise_trends.append({"label": dt_str, "count": date_counts.get(dt_str, 0)})

    week_counts = {"Week 1": 0, "Week 2": 0, "Week 3": 0, "Week 4": 0}
    for h in history_all:
        if h.created_at:
            created = h.created_at
            if created.tzinfo is None:
                created = created.replace(tzinfo=timezone.utc)
            delta_days = (now - created).days
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
