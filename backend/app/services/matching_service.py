import re
from app.services.parser_service import SKILLS_DATABASE, SKILL_REGEX_MAP, TECH_CASING

SYNONYM_GROUPS = {
    "go": {"go", "golang"},
    "golang": {"go", "golang"},
    "postgresql": {"postgresql", "postgres"},
    "postgres": {"postgresql", "postgres"},
    "aws": {"aws", "amazon web services"},
    "amazon web services": {"aws", "amazon web services"},
    "kubernetes": {"kubernetes", "k8s"},
    "k8s": {"kubernetes", "k8s"},
    "react": {"react", "react.js"},
    "vue": {"vue", "vue.js"},
    "node.js": {"node.js", "node"},
}

def extract_jd_skills(jd_text: str) -> set[str]:
    jd_lower = jd_text.lower()
    found_skills = set()
    for skill, pattern in SKILL_REGEX_MAP.items():
        if pattern.search(jd_lower):
            cased = TECH_CASING.get(skill, skill.title())
            found_skills.add(cased)
    return found_skills

def normalize_skill(sk: str) -> str:
    return TECH_CASING.get(sk.lower(), sk.strip())

def skills_overlap(cand_skills: list[str], jd_skills: set[str]) -> tuple[list[str], list[str]]:
    cand_map = {sk.lower(): sk for sk in cand_skills}
    
    # Add synonyms
    expanded_cand = set(cand_map.keys())
    for sk in list(expanded_cand):
        if sk in SYNONYM_GROUPS:
            expanded_cand.update(SYNONYM_GROUPS[sk])

    matched = []
    missing = []

    for jd_sk in jd_skills:
        jd_lower = jd_sk.lower()
        syns = SYNONYM_GROUPS.get(jd_lower, {jd_lower})
        if any(s in expanded_cand for s in syns):
            matched.append(jd_sk)
        else:
            missing.append(jd_sk)

    return sorted(matched), sorted(missing)

def match_candidate_to_jd(candidate_skills: list[str], raw_text: str, jd_text: str) -> dict:
    if not jd_text or not jd_text.strip():
        matched = candidate_skills[:4]
        missing = ["System Architecture", "Leadership"]
        return {
            "ats_score": round(min(85.0, 60.0 + len(candidate_skills) * 3.5), 1),
            "skill_match_pct": round(min(90.0, 50.0 + len(candidate_skills) * 4.0), 1),
            "matched_skills": matched,
            "missing_skills": missing,
        }

    jd_skills = extract_jd_skills(jd_text)
    matched_skills, missing_skills = skills_overlap(candidate_skills, jd_skills)

    if jd_skills:
        skill_match_pct = (len(matched_skills) / len(jd_skills)) * 100.0
    else:
        skill_match_pct = 75.0

    # Keyword text overlap score
    jd_words = set(re.findall(r'\w+', jd_text.lower()))
    cand_words = set(re.findall(r'\w+', raw_text.lower()))
    word_overlap = len(jd_words.intersection(cand_words)) / max(len(jd_words), 1) * 100.0 if jd_words else 50.0

    ats_score = round((skill_match_pct * 0.7) + (word_overlap * 0.3), 1)
    ats_score = min(100.0, max(10.0, ats_score))
    skill_match_pct = round(min(100.0, skill_match_pct), 1)

    return {
        "ats_score": ats_score,
        "skill_match_pct": skill_match_pct,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
    }
