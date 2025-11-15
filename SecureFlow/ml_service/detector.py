import re
from typing import List, Dict

try:
    import spacy
    _nlp = spacy.load("en_core_web_sm")
except Exception:
    _nlp = None

EMAIL = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b')
PHONE = re.compile(r'(?:(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4})')
CREDIT_CARD = re.compile(r'\b(?:\d[ -]*?){13,19}\b')
IPV4 = re.compile(r'\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d?\d)(?:\.|$)){4}\b')
SSN = re.compile(r'\b\d{3}-\d{2}-\d{4}\b')
DOB = re.compile(r'\b(?:\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})\b')
ACCOUNT = re.compile(r'\b(?:ACCT|ACCOUNT|ACC)[ :\-]?\d{6,}\b', re.I)

def _regex_entities(text: str) -> List[Dict]:
    ents = []
    for regex, etype in [
        (EMAIL, "EMAIL"),
        (PHONE, "PHONE"),
        (CREDIT_CARD, "CREDIT_CARD"),
        (IPV4, "IP_ADDRESS"),
        (SSN, "SSN"),
        (DOB, "DATE"),
        (ACCOUNT, "ACCOUNT")
    ]:
        for m in regex.finditer(text):
            ents.append({"type": etype, "start": m.start(), "end": m.end(), "text": m.group(0)})
    return ents

def detect_entities(text: str) -> Dict:
    entities: List[Dict] = []

    if _nlp is not None:
        doc = _nlp(text)
        for ent in doc.ents:
            entities.append({
                "type": ent.label_,
                "start": ent.start_char,
                "end": ent.end_char,
                "text": ent.text
            })

    entities.extend(_regex_entities(text))

    entities.sort(key=lambda x: (x["start"], -(x["end"]-x["start"])))
    filtered = []
    last_end = -1
    for e in entities:
        if e["start"] >= last_end:
            filtered.append(e)
            last_end = e["end"]

    summary = {}
    for e in filtered:
        summary[e["type"]] = summary.get(e["type"], 0) + 1

    return {"entities": filtered, "summary": summary}
