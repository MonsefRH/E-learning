from fastapi import APIRouter, WebSocket
import whisper
import tempfile
import os
import logging

router = APIRouter(prefix="/audio", tags=["audio"])

# Initialize Whisper model (loaded once for efficiency)
whisper_model = whisper.load_model("base")  # Use "small" or "medium" for better accuracy

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.websocket("/ws/transcribe")
async def transcribe_audio(websocket: WebSocket):
    await websocket.accept()
    try:
        # Receive audio data
        audio_data = await websocket.receive_bytes()
        logger.info("Received audio data")

        # Save audio to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_audio:
            temp_audio.write(audio_data)
            temp_audio_path = temp_audio.name

        # Transcribe with Whisper
        try:
            result = whisper_model.transcribe(temp_audio_path, language="en" , fp16=False)  # Specify language if known
            transcription = result["text"]
            logger.info(f"Transcription: {transcription}")
        except Exception as e:
            logger.error(f"Whisper transcription failed: {str(e)}")
            await websocket.send_json({"error": f"Transcription failed: {str(e)}"})
            return
        finally:
            os.remove(temp_audio_path)  # Clean up

        # Send transcription back
        await websocket.send_json({"transcription": transcription})
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        await websocket.send_json({"error": str(e)})
    finally:
        await websocket.close()