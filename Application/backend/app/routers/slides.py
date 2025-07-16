
from fastapi import APIRouter, Depends, HTTPException
from fastapi.params import Path
from fastapi.responses import HTMLResponse, Response
from sqlalchemy.orm import Session
from typing import List
import os
import json
from app.configs.db import get_db
from app.routers.auth import get_current_user
from app.models.user import User
from fastapi.responses import StreamingResponse


router = APIRouter(prefix="/slides", tags=["slides"])



@router.get("/api/presentations/{course_id}/slides")
async def get_slides_data(course_id: str):
    try:
        # Path vers le fichier JSON
        slides_file_path = f"presentations/{course_id}/slides.json"

        if not os.path.exists(slides_file_path):
            raise HTTPException(status_code=404, detail="Slides data not found")

        with open(slides_file_path, 'r', encoding='utf-8') as file:
            slides_data = json.load(file)

        return {"slides": slides_data}

    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Slides data file not found")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid JSON format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/presentations/{course_id}/slide/{slide_number}", response_class=HTMLResponse)
async def get_slide_html(course_id: str, slide_number: int):
    try:
        html_file_path = f"presentations/{course_id}/slides/slide{slide_number}.html"
        if not os.path.exists(html_file_path):
            raise HTTPException(status_code=404, detail="Slide not found")
        with open(html_file_path, 'r', encoding='utf-8') as file:
            html_content = file.read()
        return HTMLResponse(content=html_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




@router.get("/api/presentations/{course_id}/audio/{slide_number}")
async def get_audio(course_id: int, slide_number: int):
    def generate():
        with open(f"presentations/{course_id}/audios/audio{slide_number}.mp3", "rb") as audio_file:
            yield from audio_file

    return StreamingResponse(
        generate(),
        media_type="chatbot/mpeg",
        headers={
            "Accept-Ranges": "bytes",
            "Cache-Control": "public, max-age=3600"
        }
    )