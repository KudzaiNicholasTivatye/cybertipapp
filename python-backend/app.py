# app.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables")

# Configure Gemini
genai.configure(api_key=GOOGLE_API_KEY)

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (for development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request schema
class TipRequest(BaseModel):
    keyword: str = ""

@app.get("/")
def root():
    return {"message": "Cyber Tip API is running"}

# ✅ Daily tip route
@app.get("/api/daily-tip")
async def get_daily_tip():
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")  # reliable and stable
        prompt = (
            "Generate a daily cybersecurity tip in strict JSON format with the following keys:\n"
            "{title, tip, explanation, actionSteps, closing}"
        )

        response = model.generate_content(prompt)
        content = response.text.strip()

        # Try to extract JSON safely
        data = json.loads(content)
        return {"success": True, "data": data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {e}")

# ✅ Keyword-based tip route
@app.post("/api/tip-by-keyword")
async def tip_by_keyword(request: TipRequest):
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = (
            f"Generate a concise cybersecurity tip about '{request.keyword}' "
            "in strict JSON format with these keys:\n"
            "{title, tip, explanation, actionSteps, closing}"
        )

        response = model.generate_content(prompt)
        content = response.text.strip()

        data = json.loads(content)
        return {"success": True, "data": data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {e}")
