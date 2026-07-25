import pytest
from app.services.parser_service import parse_resume_content
from app.services.matching_service import match_candidate_to_jd
from app.services.excel_service import generate_excel_report

def test_resume_parser_extraction():
    text = """
    Jitendar Endla
    Email: jitendarendla@gmail.com
    Phone: +91 98765 43210
    Location: Hyderabad, India
    
    Skills: Python, FastAPI, React, PostgreSQL, Docker, AWS
    Education: Bachelor of Technology in Computer Science
    Experience: 5+ years of experience in software development
    LinkedIn: linkedin.com/in/jitendarendla
    GitHub: github.com/jitendarendla
    Certifications: AWS Certified Developer
    Projects: AI Resume Analyzer Platform
    """
    
    parsed = parse_resume_content(text, "Jitendar_Resume.pdf")
    
    assert parsed["email"] == "jitendarendla@gmail.com"
    assert "Python" in parsed["skills"]
    assert "FastAPI" in parsed["skills"]
    assert parsed["experience_years"] == 5.0

def test_jd_matching_engine():
    cand_skills = ["Python", "FastAPI", "React", "Docker"]
    raw_text = "Experienced software developer in Python, FastAPI, React, and Docker."
    jd_text = "Looking for Senior Engineer with Python, FastAPI, React, PostgreSQL, Docker experience."
    
    match = match_candidate_to_jd(cand_skills, raw_text, jd_text)
    
    assert match["ats_score"] > 50.0
    assert "Python" in match["matched_skills"]

def test_excel_report_generation(tmp_path):
    cand_data = [{
        "name": "Jitendar Endla",
        "email": "jitendarendla@gmail.com",
        "phone": "+91 98765 43210",
        "experience_years": 5.0,
        "education": "B.Tech CS",
        "skills": ["Python", "FastAPI", "React"],
        "match": {
            "ats_score": 85.0,
            "skill_match_pct": 90.0,
            "matched_skills": ["Python", "FastAPI"],
            "missing_skills": ["Docker"]
        },
        "file_name": "resume.pdf",
        "linkedin": "linkedin.com/in/jitendarendla",
        "github": "github.com/jitendarendla",
        "location": "Hyderabad, India"
    }]
    
    filepath = generate_excel_report("Production Batch Report", cand_data)
    assert filepath.endswith(".xlsx")
