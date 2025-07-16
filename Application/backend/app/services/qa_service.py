import json
import logging
import google.generativeai as genai
import os
import base64
import asyncio

from dotenv import load_dotenv
from google.cloud import speech
from google.cloud import texttospeech
from app.models.course import Course
from fastapi import WebSocket

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket):
        await websocket.accept()
        logger.info(f"New connection accepted: {websocket.client}")
        self.active_connections.append(websocket)

    def disconnect(self, websocket):
        logger.info(f"Connection closed: {websocket.client}")
        self.active_connections.remove(websocket)

    async def send_response(self, websocket, data: dict):
        logger.info(f"Sending response to {websocket.client}: {data}")
        await websocket.send_text(json.dumps(data))

class SpeechToTextService:
    def __init__(self):
        self.client = speech.SpeechClient()

    async def transcribe_audio(self, audio_data: bytes) -> str:
        try:
            config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
                sample_rate_hertz=48000,
                language_code="en-US",
                alternative_language_codes=["fr-FR"],
                enable_automatic_punctuation=True,
            )
            audio = speech.RecognitionAudio(content=audio_data)
            response = await asyncio.get_event_loop().run_in_executor(
                None, lambda: self.client.recognize(config=config, audio=audio)
            )
            if response.results:
                return response.results[0].alternatives[0].transcript.strip()
            return None
        except Exception as e:
            logger.error(f"Speech-to-Text Error: {e}")
            return None

class TTSService:
    def __init__(self):
        self.client = texttospeech.TextToSpeechClient()

    async def synthesize_text_to_base64(self, text: str, language_code: str = "en-US") -> str:
        try:
            request = texttospeech.SynthesizeSpeechRequest(
                input=texttospeech.SynthesisInput(text=text),
                voice=texttospeech.VoiceSelectionParams(
                    language_code=language_code,
                    ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
                ),
                audio_config=texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3)
            )
            response = await asyncio.get_event_loop().run_in_executor(
                None, lambda: self.client.synthesize_speech(request)
            )
            return base64.b64encode(response.audio_content).decode('utf-8')
        except Exception as e:
            logger.error(f"TTS Error: {e}")
            return None

class QAService:
    def __init__(self):
        self.manager = ConnectionManager()
        self.speech_service = SpeechToTextService()
        self.tts_service = TTSService()
        api_key = os.getenv("GOOGLE_API_KEY", "AIzaSyC7_NPLgfg9FIZ0MvYQ2sN2TeUj7Y-0cAI")
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        self.authenticated = {}  # Store authenticated WebSocket connections

    async def process_question(self, websocket, question_text: str, course_id: str = None):
        try:
            logger.info(f"Processing question: {question_text} for course_id: {course_id}")
            if not question_text or not question_text.strip():
                await self.manager.send_response(websocket, {
                    "type": "error",
                    "message": "Question cannot be empty"
                })
                return

            context = f"Context: Course ID {course_id} if applicable. " if course_id else ""
            response = self.model.generate_content(f"{context}{question_text}")
            text_response = response.text

            await self.manager.send_response(websocket, {
                "type": "text_response",
                "text": text_response,
            })

            # audio_base64 = await self.tts_service.synthesize_text_to_base64(text_response)
            # if audio_base64:
            #     await self.manager.send_response(websocket, {
            #         "type": "audio_ready",
            #         "audio_data": audio_base64,
            #         "audio_format": "mp3",
            #     })

            # await self.manager.send_response(websocket, {
            #     "type": "animation_ready",
            #     "text": text_response,
            # })
        except Exception as e:
            logger.error(f"Error processing question: {e}")
            await self.manager.send_response(websocket, {
                "type": "error",
                "message": f"Error processing question: {str(e)}"
            })

    async def handle_voice_question(self, websocket, audio_data_b64: str):
        try:
            logger.info(f"Handling voice question with chatbot data length: {len(audio_data_b64)}")
            audio_data = base64.b64decode(audio_data_b64)
            await self.manager.send_response(websocket, {
                "type": "transcribing",
                "status": "transcribing_audio"
            })
            transcribed_text = await self.speech_service.transcribe_audio(audio_data)
            if not transcribed_text:
                await self.manager.send_response(websocket, {
                    "type": "error",
                    "message": "Failed to transcribe chatbot"
                })
                return

            await self.manager.send_response(websocket, {
                "type": "transcription_ready",
                "transcribed_text": transcribed_text,
                "status": "processing_response"
            })
            await self.process_question(websocket, transcribed_text)
        except Exception as e:
            logger.error(f"Voice processing error: {e}")
            await self.manager.send_response(websocket, {
                "type": "error",
                "message": f"Voice processing error: {str(e)}"
            })

    async def handle_auth(self, websocket, token: str):
        logger.info(f"Auth attempt from {websocket.client} with token: {token[:10]}...")
        if token:  # Replace with actual validation logic
            self.authenticated[websocket] = True
            await self.manager.send_response(websocket, {
                "type": "auth_success"
            })
        else:
            await self.manager.send_response(websocket, {
                "type": "error",
                "message": "Authentication failed"
            })

    async def transcribe_audio(self, audio_file, course_id: str = None):
        try:
            audio_data = await audio_file.read()
            transcribed_text = await self.speech_service.transcribe_audio(audio_data)
            return {"transcribed_text": transcribed_text or "Transcription failed"}
        except Exception as e:
            logger.error(f"Transcription error: {e}")
            return {"transcribed_text": "Transcription failed"}