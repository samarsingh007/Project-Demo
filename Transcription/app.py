from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from moviepy.video.io.VideoFileClip import VideoFileClip
import whisper
import os
import re
from tqdm import tqdm
import constants

app = FastAPI()

def extract_audio_from_video(video_path, audio_output_path):
    """Extracts audio from the video file using moviepy."""
    try:
        video = VideoFileClip(video_path)
        video.audio.write_audiofile(audio_output_path)
    except Exception as e:
        raise Exception(f"Error extracting audio: {e}")

def transcribe_audio_with_timestamps(audio_path, model_type=constants.WHISPER_MODEL_TYPE):
    """Transcribes audio using OpenAI's Whisper ASR model."""
    model = whisper.load_model(model_type)
    result = model.transcribe(audio_path, language=constants.LANGUAGE, word_timestamps=True)
    return result

def format_time(seconds, use_min_sec_format=constants.USE_MIN_SEC_FORMAT):
    """Converts seconds into minutes:seconds format if required."""
    if not use_min_sec_format:
        return f"{seconds:.2f}"
    minutes = int(seconds // 60)
    seconds = seconds % 60
    return f"{minutes}:{seconds:02.0f}"

def format_transcript_without_speakers(transcript):
    """Formats the transcript with or without speaker information based on the format."""
    formatted_output = []
    for segment in tqdm(transcript['segments'], desc="Formatting transcript"):
        start_time = format_time(segment['start'])
        end_time = format_time(segment['end'])
        text = segment['text'].strip()

        formatted_output.append({
            "start": start_time,
            "end": end_time,
            "text": text
        })

    return formatted_output

@app.post("/transcribe")
async def transcribe_video(video: UploadFile = File(...)):
    try:
        video_path = f"temp_{video.filename}"
        with open(video_path, "wb") as f:
            f.write(await video.read())

        audio_output_path = constants.TEMP_AUDIO_PATH
        extract_audio_from_video(video_path, audio_output_path)

        transcript = transcribe_audio_with_timestamps(audio_output_path)

        formatted_output = format_transcript_without_speakers(transcript)

        os.remove(video_path)
        os.remove(audio_output_path)

        return JSONResponse(content={"transcriptions": formatted_output})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
