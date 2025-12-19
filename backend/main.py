from fastapi import FastAPI, UploadFile, File, Form
import fitz  # PyMuPDF
import re
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from skills import SKILLS
from fastapi.middleware.cors import CORSMiddleware




# ===============================
# App Initialization
# ===============================
app = FastAPI(title="Smart Recruitment API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = SentenceTransformer("all-MiniLM-L6-v2")

# ===============================
# Utility Functions
# ===============================

def extract_text_from_pdf(file_bytes):
    text = ""
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        for page in doc:
            text += page.get_text()
    return text.strip()


def extract_skills(text):
    text = text.lower()
    found_skills = set()

    for skill in SKILLS:
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, text):
            found_skills.add(skill)

    return list(found_skills)

# ===============================
# API Endpoints
# ===============================

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    pdf_bytes = await file.read()
    resume_text = extract_text_from_pdf(pdf_bytes)
    return {
        "resume_text_preview": resume_text[:1000]
    }


@app.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    # -------- Extract resume text --------
    pdf_bytes = await file.read()
    resume_text = extract_text_from_pdf(pdf_bytes)

    # -------- Rule-based skill extraction --------
    resume_skills = extract_skills(resume_text)
    jd_skills = extract_skills(job_description)

    matched_skills = list(set(resume_skills) & set(jd_skills))
    missing_skills = list(set(jd_skills) - set(resume_skills))

    if len(jd_skills) == 0:
        skill_match_score = 0.0
    else:
        skill_match_score = len(matched_skills) / len(jd_skills)

    # -------- Semantic similarity (SBERT) --------
    resume_embedding = model.encode([resume_text])
    jd_embedding = model.encode([job_description])

    semantic_score = cosine_similarity(resume_embedding, jd_embedding)[0][0]
    semantic_score = float(semantic_score)  # NumPy → Python float

    # -------- Final Hybrid Score --------
    final_score = (0.6 * semantic_score) + (0.4 * skill_match_score)

    # -------- Response --------
    return {
        "semantic_match_percentage": round(semantic_score * 100, 2),
        "skill_match_percentage": round(skill_match_score * 100, 2),
        "final_match_percentage": round(final_score * 100, 2),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills
    }