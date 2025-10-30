import google.generativeai as genai
from dotenv import load_dotenv
import os

# Load your .env file (must contain GOOGLE_API_KEY)
load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables")

# Configure Gemini
genai.configure(api_key=GOOGLE_API_KEY)

# List available models
print("Fetching available Gemini models...\n")

models = genai.list_models()

for m in models:
    print(m.name)
