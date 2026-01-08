from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uvicorn
import io
import time

# -----------------------------
# IMPORT ML SERVICE
# -----------------------------
from detection_service import predict as ml_predict
from translation_service import translator_service

# -----------------------------
# APP INIT
# -----------------------------
app = FastAPI(title="Sign Language API")

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

print("[BOOT] CORS configured with origins:", origins)

# -----------------------------
# REQUEST MODELS
# -----------------------------
class SpeakRequest(BaseModel):
    text: str
    language: str = "en"

# -----------------------------
# HEALTH CHECK
# -----------------------------
@app.get("/")
def root():
    print("[GET /] Health check called")
    return {
        "status": "online",
        "message": "Sign Language Backend is running"
    }

# -----------------------------
# PREDICT ENDPOINT (REAL ML)
# -----------------------------
@app.post("/predict")
async def predict_sign(file: UploadFile = File(...)):
    print("[POST /predict] Request received")

    if not file.content_type.startswith("image/"):
        print("[POST /predict] Invalid file type:", file.content_type)
        raise HTTPException(status_code=400, detail="File must be an image")

    image_bytes = await file.read()

    print(f"[POST /predict] Image received | Size: {len(image_bytes)} bytes")

    try:
        start = time.time()
        result = ml_predict(image_bytes)
        end = time.time()

        print(
            "[POST /predict] Prediction result:",
            result,
            f"| Time taken: {end - start:.3f}s"
        )

        return result

    except Exception as e:
        print("[POST /predict][ERROR]", e)
        raise HTTPException(status_code=500, detail=str(e))

# -----------------------------
# SPEAK ENDPOINT
# -----------------------------
@app.post("/speak")
async def speak_text(request: SpeakRequest):
    print(
        f"[POST /speak] Request received | "
        f"text='{request.text}' | lang='{request.language}'"
    )

    try:
        translated_text = translator_service.translate(
            request.text,
            request.language
        )

        print("[POST /speak] Translated text:", translated_text)

        if not translated_text:
            raise HTTPException(status_code=500, detail="Translation failed")

        audio_stream = translator_service.text_to_speech(
            translated_text,
            request.language
        )

        if not audio_stream:
            raise HTTPException(status_code=500, detail="Audio generation failed")

        print("[POST /speak] Audio stream generated successfully")

        return StreamingResponse(
            audio_stream,
            media_type="audio/mpeg",
            headers={
                "X-Translated-Text": translated_text
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        print("[POST /speak][ERROR]", e)
        raise HTTPException(status_code=500, detail=str(e))

# -----------------------------
# SERVER ENTRY
# -----------------------------
if __name__ == "__main__":
    print("[BOOT] Starting Uvicorn server on port 8000")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )


