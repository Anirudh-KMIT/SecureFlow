# ml_service/app.py
from fastapi import FastAPI, Request
from pydantic import BaseModel

app = FastAPI()

class TextRequest(BaseModel):
    text: str

@app.post("/analyze")
async def analyze(request: TextRequest):
    text = request.text
    # Example logic – your real model replaces this
    return {
        "sanitized_text": text.replace("john.doe@acme.com", "[REDACTED_EMAIL]"),
        "entities": ["EMAIL"],
        "confidence": 0.97
    }
