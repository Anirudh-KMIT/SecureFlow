from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class TextRequest(BaseModel):
    text: str

@app.post("/analyze")
def analyze_text(req: TextRequest):
    text = req.text
    entities = []

    if "@" in text:
        entities.append("EMAIL")

    sanitized = text.replace("@", "[at]")

    return {
        "sanitized_text": sanitized,
        "entities": entities,
        "confidence": 0.97
    }
