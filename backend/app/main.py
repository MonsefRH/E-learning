from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, courses, slides, exercices, lessons , audio
from app.configs.db import init_db

app = FastAPI(title="AI-Powered E-Learning Platform Backend")

# CORS configuration to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
init_db()

# Include routers
app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(slides.router)
app.include_router(exercices.router)
app.include_router(lessons.router)
app.include_router(audio.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the AI-Powered E-Learning Platform Backend"}