from fastapi import FastAPI

app = FastAPI(title="VoicePay AI Backend")


@app.get("/")
def home():
    return {"message": "VoicePay AI backend is running"}