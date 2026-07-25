from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc

from app.core.database import get_db
from app.core.dependencies import get_current_recruiter
from app.models.models import Recruiter, Candidate, CandidateMatch, UploadSession
from app.schemas.schemas import CandidateResponse

router = APIRouter(prefix="/api/analysis", tags=["Candidate Analysis"])

@router.get("/candidates")
def search_and_list_candidates(
    search: Optional[str] = Query(None, description="Search by Candidate Name, Email, Phone, Skill, Company, or Report"),
    session_id: Optional[str] = Query(None),
    report_name: Optional[str] = Query(None, description="Filter candidates folder-wise / batch-wise"),
    min_ats_score: Optional[float] = Query(0.0),
    sort_by: Optional[str] = Query("ats_score", description="ats_score, match_pct, name, experience"),
    sort_order: Optional[str] = Query("desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    recruiter: Recruiter = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    query = db.query(Candidate).filter(Candidate.recruiter_id == recruiter.id)

    joined_session = False
    joined_match = False

    if session_id:
        query = query.filter(Candidate.session_id == session_id)

    if report_name and report_name.strip() and report_name != "All Folders":
        query = query.join(UploadSession).filter(UploadSession.report_name == report_name.strip())
        joined_session = True

    if search and search.strip():
        s = f"%{search.strip().lower()}%"
        if not joined_session:
            query = query.join(UploadSession)
            joined_session = True
        query = query.filter(
            or_(
                Candidate.name.ilike(s),
                Candidate.email.ilike(s),
                Candidate.phone.ilike(s),
                Candidate.education.ilike(s),
                UploadSession.report_name.ilike(s),
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
        if cand_dict.match:
            cand_dict.match.ranking = idx
        results.append(cand_dict)

    return {
        "total": total,
        "page": page,
        "limit": limit,
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
