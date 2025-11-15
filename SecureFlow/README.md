# SecureFlow

Contextual data privacy layer for LLM pipelines. Detects sensitive entities in prompts/logs, sanitizes/redacts per policy, and stores encrypted audit logs.

## Stack
- Backend: Node.js + Express + MongoDB, AES-256-GCM encryption
- ML Service: FastAPI + spaCy + regex
- Frontend: React (Vite)

## Quick Start (3 terminals)

### 1) ML Service
```bash
cd ml_service
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
# Optional: python -m spacy download en_core_web_sm
uvicorn app:app --reload --host 127.0.0.1 --port 8000
