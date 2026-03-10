import os
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from groq import AsyncGroq

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="ArogyaAI Backend Chat API")

# Configure CORS so Next.js frontend can communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    language: str = "english"

LANGUAGE_MAP = {
    "en": "English",
    "hi": "Hindi",
    "kn": "Kannada",
    "te": "Telugu",
    "ta": "Tamil"
}

SYSTEM_PROMPT = """You are ArogyaAI, a supportive health assistant.
Respond strictly in the following language: {language}."""

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    groq_api_key = os.getenv("GROQ_API_KEY", "")
    
    if not groq_api_key:
        print("Warning: GROQ_API_KEY not found.")
        return JSONResponse(status_code=500, content={"error": "API key misconfiguration: GROQ_API_KEY is missing"})

    try:
        lang_name = LANGUAGE_MAP.get(request.language, request.language)
        sys_prompt = SYSTEM_PROMPT.format(language=lang_name)
        
        # Connect to Groq API
        client = AsyncGroq(api_key=groq_api_key)
        
        try:
            # Call Groq API with specific model requirement
            completion = await client.chat.completions.create(
                model="llama3-8b-8192",
                messages=[
                    {"role": "system", "content": sys_prompt},
                    {"role": "user", "content": request.message}
                ],
                temperature=0.5,
                max_tokens=1024,
            )
        except Exception as api_err:
            if "decommissioned" in str(api_err) or "model_not_found" in str(api_err):
                # Fallback to working model if required model is removed
                completion = await client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=[
                        {"role": "system", "content": sys_prompt},
                        {"role": "user", "content": request.message}
                    ],
                    temperature=0.5,
                    max_tokens=1024,
                )
            else:
                raise api_err
        
        reply = completion.choices[0].message.content
        
        # Defensive check to ensure the disclaimer is present
        if "This is not a medical diagnosis. Please consult a healthcare professional for proper medical advice." not in reply:
            reply += "\n\nDisclaimer:\nThis is not a medical diagnosis. Please consult a healthcare professional for proper medical advice."

        return {"response": reply}
        
    except Exception as e:
        print(f"Error calling Groq API: {e}")
        # Return structured error response instead of breaking UI
        fallback_msg = (
            "AI service is temporarily unavailable. Here is some basic advice:\n"
            "- Stay hydrated and drink plenty of water.\n"
            "- Get adequate rest to help your body recover.\n"
            "- Maintain a balanced diet.\n\n"
            "Disclaimer:\nThis is not a medical diagnosis. Please consult a healthcare professional for proper medical advice."
        )
        return JSONResponse(status_code=503, content={"error": fallback_msg})

