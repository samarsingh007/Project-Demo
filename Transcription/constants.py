# constants.py

# Path to the folder containing video files
VIDEO_FOLDER_PATH = "D:/Downloads/Project-demo/Project-Demo/video"

# Path to store extracted audio files temporarily
TEMP_AUDIO_PATH = "temp_audio.wav"

# Whisper ASR model type (base, small, medium, large)
WHISPER_MODEL_TYPE = "base"

# Pyannote speaker diarization model name
PYANNOTE_MODEL_NAME = "pyannote/speaker-diarization@2.1"

# Output format options: 'json' or 'text'
OUTPUT_FORMAT = "json"

# Supported video file formats
SUPPORTED_VIDEO_FORMATS = [".MOV", ".mov", ".mp4", ".avi", ".mkv"]

# Maximum segment length to consider for transcription
MAX_SEGMENT_LENGTH = 60

# Language setting for transcription
LANGUAGE = "en"

# Number of threads to use for computation
NUM_THREADS = 1

# New parameter to toggle timestamp format (True for minutes:seconds format)
USE_MIN_SEC_FORMAT = True