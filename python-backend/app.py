# app.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
import re
from dotenv import load_dotenv
from datetime import datetime

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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request schema
class TipRequest(BaseModel):
    keyword: str = ""

# In-memory cache for daily tip
cached_tip = {"date": None, "data": None}


def parse_structured_tip(content: str, keyword: str = "Security") -> dict:
    """
    Parse AI-generated structured tip into organized sections.
    Extracts title, tip, explanation, action steps, and closing.
    """
    content = content.strip()
    lines = [line.strip() for line in content.split('\n') if line.strip()]
    
    result = {
        "title": f"🔒 {keyword} Security Tip",
        "tip": "",
        "explanation": "",
        "actionSteps": [],
        "closing": "Stay cyber safe! 🛡️"
    }
    
    current_section = None
    temp_text = []
    
    for line in lines:
        line_lower = line.lower()
        
        # Identify section headers
        if any(marker in line_lower for marker in ['📌 title:', '**title:', 'title:']):
            if temp_text and current_section:
                finalize_section(result, current_section, temp_text)
            current_section = 'title'
            temp_text = [re.sub(r'^.*?title:\s*', '', line, flags=re.IGNORECASE).strip('*').strip()]
            
        elif any(marker in line_lower for marker in ['💡 tip:', '**tip:', 'tip:']):
            if temp_text and current_section:
                finalize_section(result, current_section, temp_text)
            current_section = 'tip'
            temp_text = [re.sub(r'^.*?tip:\s*', '', line, flags=re.IGNORECASE).strip('*').strip()]
            
        elif any(marker in line_lower for marker in ['📖 explanation:', '**explanation:', 'explanation:', 'why it matters:', 'why this matters:']):
            if temp_text and current_section:
                finalize_section(result, current_section, temp_text)
            current_section = 'explanation'
            temp_text = [re.sub(r'^.*?(explanation|why.*?matters):\s*', '', line, flags=re.IGNORECASE).strip('*').strip()]
            
        elif any(marker in line_lower for marker in ['✅ action steps:', '**action steps:', 'action steps:', 'steps to take:', 'what to do:']):
            if temp_text and current_section:
                finalize_section(result, current_section, temp_text)
            current_section = 'actions'
            temp_text = []
            
        elif any(marker in line_lower for marker in ['🎯 closing:', '**closing:', 'closing:', 'remember:', 'final thought:']):
            if temp_text and current_section:
                finalize_section(result, current_section, temp_text)
            current_section = 'closing'
            temp_text = [re.sub(r'^.*?(closing|remember|final thought):\s*', '', line, flags=re.IGNORECASE).strip('*').strip()]
            
        else:
            # Add content to current section
            if current_section == 'actions':
                # Clean up action step formatting
                cleaned = re.sub(r'^[\d\.\-\•\*\)]\s*', '', line).strip()
                if cleaned and len(cleaned) > 3:
                    temp_text.append(cleaned)
            elif current_section:
                temp_text.append(line)
    
    # Finalize last section
    if temp_text and current_section:
        finalize_section(result, current_section, temp_text)
    
    # Fallback if parsing failed
    if not result['tip'] and lines:
        result['title'] = lines[0] if lines else result['title']
        result['tip'] = ' '.join(lines[1:3]) if len(lines) > 1 else "Stay vigilant online."
        result['explanation'] = ' '.join(lines[3:5]) if len(lines) > 3 else "Cybersecurity is crucial."
        result['actionSteps'] = [re.sub(r'^[\d\.\-\•\*\)]\s*', '', l).strip() for l in lines[5:8]] if len(lines) > 5 else ["Review your security settings"]
    
    return result


def finalize_section(result: dict, section: str, temp_text: list):
    """Helper to finalize a section's content."""
    if section == 'title':
        result['title'] = ' '.join(temp_text).strip()
    elif section == 'tip':
        result['tip'] = ' '.join(temp_text).strip()
    elif section == 'explanation':
        result['explanation'] = ' '.join(temp_text).strip()
    elif section == 'actions':
        result['actionSteps'] = [t for t in temp_text if t]
    elif section == 'closing':
        result['closing'] = ' '.join(temp_text).strip()


@app.get("/")
def root():
    return {"message": "Cyber Tip API is running"}


@app.get("/api/daily-tip")
async def get_daily_tip():
    try:
        today = datetime.now().strftime("%Y-%m-%d")

        # Return cached tip if available for today
        if cached_tip["date"] == today:
            return {"success": True, "data": cached_tip["data"]}

        model = genai.GenerativeModel("models/gemini-2.5-flash")

        prompt = """
You are a cybersecurity expert. Generate a daily cybersecurity tip in a clear, organized format.

Structure your response EXACTLY like this:

**Title:** [An engaging title with emoji, e.g., 🔐 Enable Two-Factor Authentication]

**Tip:** [A concise, practical tip in 1-2 sentences that users can immediately understand]

**Explanation:** [Explain why this tip matters in 2-3 sentences. Make it relatable and show the real-world impact]

**Action Steps:**
1. [First specific, actionable step]
2. [Second specific, actionable step]
3. [Third specific, actionable step]

**Closing:** [A brief, motivational message to encourage the user]

Important: Use clear, conversational language. Make it engaging and easy to understand. Focus on practical advice.
"""

        response = model.generate_content(prompt)
        content = response.text.strip()

        formatted_tip = parse_structured_tip(content, "Daily")

        # Cache today's tip
        cached_tip["date"] = today
        cached_tip["data"] = formatted_tip

        return {
            "success": True,
            "data": formatted_tip
        }

    except Exception as e:
        print(f"Error generating daily tip: {e}")
        return {
            "success": False,
            "error": "Failed to generate tip"
        }


@app.post("/api/tip-by-keyword")
async def tip_by_keyword(request: TipRequest):
    try:
        model = genai.GenerativeModel("models/gemini-2.5-flash")

        prompt = f"""
You are a cybersecurity expert. Generate a practical cybersecurity tip about "{request.keyword}".

Structure your response EXACTLY like this:

**Title:** [An engaging title about {request.keyword} with emoji]

**Tip:** [A concise, practical tip about {request.keyword} in 1-2 sentences]

**Explanation:** [Explain why {request.keyword} security matters in 2-3 sentences. Make it relatable]

**Action Steps:**
1. [First specific action related to {request.keyword}]
2. [Second specific action]
3. [Third specific action]

**Closing:** [A brief motivational message about staying safe with {request.keyword}]

Important: Use clear, conversational language. Make it engaging and actionable. Focus on practical advice users can implement today.
"""

        response = model.generate_content(prompt)
        content = response.text.strip()

        formatted_tip = parse_structured_tip(content, request.keyword)

        return {
            "success": True,
            "data": formatted_tip
        }

    except Exception as e:
        print(f"Error generating tip for keyword '{request.keyword}': {e}")
        raise HTTPException(status_code=500, detail=f"Error: {e}")