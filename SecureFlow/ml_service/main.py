from fastapi import FastAPI
from pydantic import BaseModel
import re

app = FastAPI()

class InputText(BaseModel):
    text: str

def detect_entities(text):
    entities = []

    email_pattern = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
    phone_pattern = r"\b\d{10}\b"  # Detect any 10-digit phone number
    aadhaar_pattern = r"\b\d{4}\s?\d{4}\s?\d{4}\b"
    pan_pattern = r"\b[A-Z]{5}[0-9]{4}[A-Z]\b"
    password_pattern = r"(password\s*[:=]\s*\S+)"

    if re.search(email_pattern, text):
        entities.append("EMAIL")
    if re.search(phone_pattern, text):
        entities.append("PHONE")
    if re.search(aadhaar_pattern, text):
        entities.append("AADHAAR")
    if re.search(pan_pattern, text):
        entities.append("PAN")
    if re.search(password_pattern, text, re.IGNORECASE):
        entities.append("PASSWORD")

    return entities

@app.post("/analyze")
def analyze_text(input: InputText):
    text = input.text
    entities = detect_entities(text)

    return {
        "entities": entities,
        "count": len(entities),
        "sanitized_text": text
    }
