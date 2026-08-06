from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc

from app.core.database import get_db
from app.core.dependencies import get_current_recruiter
from app.models.models import Recruiter, Candidate, CandidateMatch, UploadSession, UploadHistory
from app.schemas.schemas import CandidateResponse
from app.services.parser_service import clean_candidate_name, clean_candidate_location, extract_technology_title

router = APIRouter(prefix="/api/analysis", tags=["Candidate Analysis"])

@router.get("/candidates", response_model=dict)
def get_candidates(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=5000),
    search: Optional[str] = Query(None),
    min_ats_score: float = Query(0.0),
    report_name: Optional[str] = Query(None),
    sort_by: str = Query("ats_score"),
    sort_order: str = Query("desc"),
    recruiter: Recruiter = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    query = db.query(Candidate).filter(Candidate.recruiter_id == recruiter.id)
    joined_match = False

    if report_name and report_name.strip() and report_name != "All Folders":
        sessions = db.query(UploadSession.id).filter(
            UploadSession.recruiter_id == recruiter.id,
            UploadSession.report_name == report_name
        ).all()
        histories = db.query(UploadHistory.session_id).filter(
            UploadHistory.recruiter_id == recruiter.id,
            UploadHistory.report_name == report_name
        ).all()
        hist_ids_raw = db.query(UploadHistory.id).filter(
            UploadHistory.recruiter_id == recruiter.id,
            UploadHistory.report_name == report_name
        ).all()
        
        s_ids = [s[0] for s in sessions if s[0]]
        h_ids = [h[0] for h in histories if h[0]]
        hist_ids = [hi[0] for hi in hist_ids_raw if hi[0]]
        
        all_ids = list(set(s_ids + h_ids + hist_ids))
        if all_ids:
            query = query.filter(Candidate.session_id.in_(all_ids))

    if search and search.strip():
        s = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                Candidate.name.ilike(s),
                Candidate.email.ilike(s),
                Candidate.phone.ilike(s),
                Candidate.education.ilike(s),
                Candidate.raw_text.ilike(s)
            )
        )

    # Filter by min ATS score
    if min_ats_score > 0:
        query = query.join(CandidateMatch).filter(CandidateMatch.ats_score >= min_ats_score)
        joined_match = True

    # Sorting
    if sort_by in ["ats_score", "match_pct"]:
        if not joined_match:
            query = query.outerjoin(CandidateMatch)
            joined_match = True
        order_col = CandidateMatch.ats_score if sort_by == "ats_score" else CandidateMatch.skill_match_pct
    elif sort_by == "name":
        order_col = Candidate.name
    elif sort_by == "experience":
        order_col = Candidate.experience_years
    else:
        order_col = Candidate.created_at

    if sort_order == "desc":
        query = query.order_by(desc(order_col))
    else:
        query = query.order_by(asc(order_col))

    total = query.count()
    candidates = query.offset((page - 1) * limit).limit(limit).all()

    results = []
    for idx, cand in enumerate(candidates, start=(page - 1) * limit + 1):
        cand_dict = CandidateResponse.model_validate(cand)
        
        c_name = clean_candidate_name(cand.name, cand.file_name, cand.email, cand.raw_text or "")
        c_loc = clean_candidate_location(cand.location, cand.raw_text or "")
        c_title = extract_technology_title(cand.raw_text or "", cand.file_name, cand.skills or [])
        
        cand_dict.name = c_name
        cand_dict.location = c_loc
        cand_dict.technology_title = c_title

        if cand_dict.match:
            cand_dict.match.ranking = idx
        results.append(cand_dict)

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit if limit > 0 else 1,
        "total_count": total,
        "candidates": results
    }

@router.get("/candidates/{candidate_id}", response_model=CandidateResponse)
def get_candidate_details(
    candidate_id: str,
    recruiter: Recruiter = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    candidate = db.query(Candidate).filter(
        Candidate.id == candidate_id,
        Candidate.recruiter_id == recruiter.id
    ).first()

    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found.")

    return CandidateResponse.model_validate(candidate)
