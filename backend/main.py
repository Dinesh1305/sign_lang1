from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uvicorn
import io
import time
import urllib.parse  # ✅ ADDED: For header encoding

# -----------------------------
# IMPORT ML & TRANSLATION SERVICES
# -----------------------------
from detection_service import predict as ml_predict
from translation_service import translator_service

# -----------------------------
# APP INIT
# -----------------------------
app = FastAPI(title="Sign Language AI (Hybrid)")

print("[BOOT] FastAPI application starting...")

# -----------------------------
# CORS CONFIG
# -----------------------------
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://localhost:5173",
    "https://127.0.0.1:5173",
    "https://10.155.136.214:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# MODELS
# -----------------------------
class SpeakRequest(BaseModel):
    text: str
    language: str = "en"


# -----------------------------
# ENDPOINTS
# -----------------------------
@app.get("/")
def root():
    return {"status": "online", "message": "Hybrid Backend Running"}


# 1. CAMERA PREDICTION
@app.post("/predict")
async def predict_sign(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    image_bytes = await file.read()

    try:
        # Run ML Model
        result = ml_predict(image_bytes)
        return result
    except Exception as e:
        print("[POST /predict][ERROR]", e)
        raise HTTPException(status_code=500, detail=str(e))


# 2. TEXT TO SPEECH (For Manual & Auto)
@app.post("/speak")
async def speak_text(request: SpeakRequest):
    print(f"[POST /speak] '{request.text}' -> {request.language}")

    try:
        # Translate
        translated_text = translator_service.translate(
            request.text,
            request.language
        )

        # Generate Audio
        audio_stream = translator_service.text_to_speech(
            translated_text,
            request.language
        )

        if not audio_stream:
            raise HTTPException(status_code=500, detail="Audio generation failed")

        # ✅ FIX: URL Encode the header value to prevent crash on non-Latin characters
        safe_header_text = urllib.parse.quote(translated_text)

        return StreamingResponse(
            audio_stream,
            media_type="audio/mpeg",
            headers={"X-Translated-Text": safe_header_text}
        )

    except Exception as e:
        print("[POST /speak][ERROR]", e)
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)