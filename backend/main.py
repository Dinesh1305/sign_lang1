from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from detection_service import detector
import uvicorn

app = FastAPI(title="Sign Language API")

# Configure CORS to allow requests from your React Frontend
# Assuming Vite runs on http://localhost:5173
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://10.155.136.214:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"status": "online", "message": "Sign Language Backend is running"}


@app.post("/predict")
async def predict_sign(file: UploadFile = File(...)):
    """
    Endpoint to receive an image frame and return the detected sign.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        # Read image bytes
        image_bytes = await file.read()

        # Get prediction from our service
        result = detector.predict(image_bytes)

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

