import os
import shutil
import concurrent.futures
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.database import get_db, SessionLocal
from app.core.config import settings
from app.core.dependencies import get_current_recruiter
from app.models.models import Recruiter, UploadSession, Candidate, CandidateMatch, UploadHistory, AuditLog
from app.services.security_service import validate_and_scan_file
from app.services.parser_service import extract_text_from_file, parse_resume_content
from app.services.matching_service import match_candidate_to_jd

router = APIRouter(prefix="/api/upload", tags=["Resume Upload"])
limiter = Limiter(key_func=get_remote_address)

thread_pool = concurrent.futures.ThreadPoolExecutor(max_workers=32)

def process_single_resume(session_id: str, recruiter_id: str, file_path: str, filename: str, job_description: str):
    db: Session = SessionLocal()
    try:
        raw_text = extract_text_from_file(file_path)
        parsed = parse_resume_content(raw_text, filename)

        candidate = Candidate(
            session_id=session_id,
            recruiter_id=recruiter_id,
            name=parsed["name"],
            email=parsed["email"],
            phone=parsed["phone"],
            location=parsed["location"],
            skills=parsed["skills"],
            education=parsed["education"],
            experience_years=parsed["experience_years"],
            certifications=parsed["certifications"],
            linkedin=parsed["linkedin"],
            github=parsed["github"],
            projects=parsed["projects"],
            file_name=filename,
            file_path=file_path,
            raw_text=raw_text
        )
        db.add(candidate)
        db.flush()

        match_res = match_candidate_to_jd(parsed["skills"], raw_text, job_description)
        match_obj = CandidateMatch(
            candidate_id=candidate.id,
            ats_score=match_res["ats_score"],
            skill_match_pct=match_res["skill_match_pct"],
            matched_skills=match_res["matched_skills"],
            missing_skills=match_res["missing_skills"]
        )
        db.add(match_obj)
        db.commit()

        # Atomic PostgreSQL counter increment (thread-safe)
        db.query(UploadSession).filter(UploadSession.id == session_id).update(
            {UploadSession.processed_files: UploadSession.processed_files + 1}
        )
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error processing resume {filename}: {e}")
    finally:
        db.close()

def run_bulk_processing(session_id: str, recruiter_id: str, file_tuples: list, job_description: str):
    futures = [
        thread_pool.submit(process_single_resume, session_id, recruiter_id, fp, fname, job_description)
        for fp, fname in file_tuples
    ]
    concurrent.futures.wait(futures)

    # Mark batch status COMPLETED in database
    db: Session = SessionLocal()
    try:
        session_obj = db.query(UploadSession).filter(UploadSession.id == session_id).first()
        if session_obj:
            session_obj.status = "COMPLETED"
            session_obj.processed_files = len(file_tuples)
            db.commit()
    except Exception as e:
        db.rollback()
    finally:
        db.close()

def run_reanalyze_processing(session_id: str, job_description: str):
    db: Session = SessionLocal()
    try:
        candidates = db.query(Candidate).filter(Candidate.session_id == session_id).all()
        for cand in candidates:
            raw_text = cand.raw_text or extract_text_from_file(cand.file_path)
            parsed = parse_resume_content(raw_text, cand.file_name)

            cand.name = parsed["name"]
            cand.email = parsed["email"]
            cand.phone = parsed["phone"]
            cand.location = parsed["location"]
            cand.skills = parsed["skills"]
            cand.education = parsed["education"]
            cand.experience_years = parsed["experience_years"]
            cand.certifications = parsed["certifications"]
            cand.linkedin = parsed["linkedin"]
            cand.github = parsed["github"]
            cand.projects = parsed["projects"]

            match_res = match_candidate_to_jd(parsed["skills"], raw_text, job_description)
            match_obj = db.query(CandidateMatch).filter(CandidateMatch.candidate_id == cand.id).first()
            if match_obj:
                match_obj.ats_score = match_res["ats_score"]
                match_obj.skill_match_pct = match_res["skill_match_pct"]
                match_obj.matched_skills = match_res["matched_skills"]
                match_obj.missing_skills = match_res["missing_skills"]
            else:
                match_obj = CandidateMatch(
                    candidate_id=cand.id,
                    ats_score=match_res["ats_score"],
                    skill_match_pct=match_res["skill_match_pct"],
                    matched_skills=match_res["matched_skills"],
                    missing_skills=match_res["missing_skills"]
                )
                db.add(match_obj)

            db.query(UploadSession).filter(UploadSession.id == session_id).update(
                {UploadSession.processed_files: UploadSession.processed_files + 1}
            )
            db.commit()

        session_obj = db.query(UploadSession).filter(UploadSession.id == session_id).first()
        if session_obj:
            session_obj.status = "COMPLETED"
            db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error during re-analysis of session {session_id}: {e}")
    finally:
        db.close()

@router.post("")
@router.post("/")
@router.post("/resumes")
@router.post("/bulk")
@limiter.limit("15/minute")
async def upload_resumes(
    request: Request,
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    report_name: Optional[str] = Form("Resume Report"),
    job_description: Optional[str] = Form(""),
    recruiter: Recruiter = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    if not files or len(files) == 0:
        raise HTTPException(status_code=400, detail="No files provided.")

    if len(files) > settings.MAX_RESUMES_PER_UPLOAD:
        raise HTTPException(status_code=400, detail=f"Maximum allowed resumes per batch is {settings.MAX_RESUMES_PER_UPLOAD}.")

    session_obj = UploadSession(
        recruiter_id=recruiter.id,
        report_name=report_name,
        job_description=job_description,
        total_files=len(files),
        processed_files=0,
        status="PROCESSING"
    )
    db.add(session_obj)
    db.commit()
    db.refresh(session_obj)

    session_upload_dir = os.path.join(settings.UPLOAD_DIR, session_obj.id)
    os.makedirs(session_upload_dir, exist_ok=True)

    file_tuples = []
    rejected_files = []

    for file in files:
        clean_filename = os.path.basename(file.filename)
        is_safe, msg = validate_and_scan_file(file)
        if not is_safe:
            rejected_files.append({"filename": clean_filename, "reason": msg})
            continue

        save_path = os.path.join(session_upload_dir, clean_filename)
        os.makedirs(os.path.dirname(save_path), exist_ok=True)

        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        file_tuples.append((save_path, clean_filename))

    if not file_tuples:
        session_obj.status = "FAILED"
        db.commit()
        raise HTTPException(status_code=400, detail="All uploaded files failed security validation.")

    session_obj.total_files = len(file_tuples)
    
    # Store upload history
    history = UploadHistory(
        session_id=session_obj.id,
        recruiter_id=recruiter.id,
        report_name=report_name,
        resume_count=len(file_tuples)
    )
    db.add(history)

    # Log audit
    audit = AuditLog(
        recruiter_id=recruiter.id,
        action=f"Uploaded batch of {len(file_tuples)} resumes for report '{report_name}'",
        ip_address=request.client.host if request.client else "127.0.0.1",
        user_agent=request.headers.get("user-agent", "")
    )
    db.add(audit)
    db.commit()

    background_tasks.add_task(run_bulk_processing, session_obj.id, recruiter.id, file_tuples, job_description)

    return {
        "session_id": session_obj.id,
        "report_name": report_name,
        "total_uploaded": len(file_tuples),
        "rejected_count": len(rejected_files),
        "rejected_files": rejected_files,
        "status": "PROCESSING"
    }

@router.get("/status/{session_id}")
def get_upload_status(session_id: str, recruiter: Recruiter = Depends(get_current_recruiter), db: Session = Depends(get_db)):
    session_obj = db.query(UploadSession).filter(
        UploadSession.id == session_id,
        UploadSession.recruiter_id == recruiter.id
    ).first()

    if not session_obj:
        raise HTTPException(status_code=404, detail="Upload session not found.")

    progress_pct = round((session_obj.processed_files / session_obj.total_files * 100), 1) if session_obj.total_files > 0 else 100.0

    return {
        "session_id": session_obj.id,
        "report_name": session_obj.report_name,
        "total_files": session_obj.total_files,
        "processed_files": session_obj.processed_files,
        "progress_percentage": progress_pct,
        "status": session_obj.status
    }

@router.post("/reanalyze/{session_id}")
def reanalyze_session(
    session_id: str,
    background_tasks: BackgroundTasks,
    job_description: Optional[str] = Form(None),
    recruiter: Recruiter = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    session_obj = db.query(UploadSession).filter(
        UploadSession.id == session_id,
        UploadSession.recruiter_id == recruiter.id
    ).first()

    if not session_obj:
        session_obj = db.query(UploadSession).filter(
            UploadSession.recruiter_id == recruiter.id
        ).order_by(UploadSession.created_at.desc()).first()

    if not session_obj:
        raise HTTPException(status_code=404, detail="No resume session found to re-analyze.")

    target_jd = job_description if (job_description and job_description.strip()) else session_obj.job_description

    session_obj.processed_files = 0
    session_obj.status = "PROCESSING"
    if target_jd:
        session_obj.job_description = target_jd
    db.commit()

    background_tasks.add_task(run_reanalyze_processing, session_obj.id, target_jd or "")

    return {"message": "Re-analyzing all resumes in background.", "session_id": session_obj.id, "total_files": session_obj.total_files}

@router.post("/cancel/{session_id}")
def cancel_upload(session_id: str, recruiter: Recruiter = Depends(get_current_recruiter), db: Session = Depends(get_db)):
    session_obj = db.query(UploadSession).filter(
        UploadSession.id == session_id,
        UploadSession.recruiter_id == recruiter.id
    ).first()

    if not session_obj:
        raise HTTPException(status_code=404, detail="Upload session not found.")

    session_obj.status = "CANCELLED"
    db.commit()
    return {"message": "Upload processing cancelled."}
