# constants.py

# Path to the folder containing video files
VIDEO_FOLDER_PATH = "videos/"

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

# Frame interval
FRAME_RATE = 20

# Language setting for transcription
LANGUAGE = "en"

# Number of threads to use for computation
NUM_THREADS = 1

# New parameter to toggle timestamp format (True for minutes:seconds format)
USE_MIN_SEC_FORMAT = True

# trigger words for segmentation
TRIGGER_WORDS = ["Can", "What", "Where"]

OPENAI_API_KEY = "OPENAI_API_KEY"

Rev_API_key = "Your_API_Key"

HUGGINGFACE_ACCESS_TOKEN = "Your_API_Key"

# Define three specialized prompts for the LLM
modeling_prompt = """
You are a Speech-Language Pathologist evaluating a parent's use of the **Modeling** strategy in a parent-child interaction.

**Fidelity Scoring (1 to 4)**:
Award +1 point for each of the following:
1. Presenting a verbal or gestural model
2. Establishing joint attention
3. Waiting ~3 seconds for the child's response
4. Providing verbal feedback that is NOT a simple “Yes/No” question

Thus, the maximum possible fidelity score is 4.

Now, read the following **transcript** and evaluate based on the fidelity criteria above.
Here is the transcript:
{transcript}

---

Please respond **only** in the following format (without additional commentary):

1. **Reasoning**: <your explanation>  
2. **Fidelity**: <1 | 2 | 3 | 4>  
""".strip()

mand_model_prompt = """
You are a Speech-Language Pathologist evaluating a parent's use of the **Mand-model** strategy in a parent-child interaction.

**Fidelity Scoring (1 to 4)**:
Award **+1 point** for each of the following:
1. Presenting a **verbal prompt** in the form of a question, choice, or mand.
2. Establishing **joint attention** with the child before/while prompting.
3. **Waiting ~3 seconds** for the child’s response before continuing.
4. Providing **verbal feedback** that is **not** a simple “Yes/No” question.

Thus, the maximum possible fidelity score is **4**.

---

Now, read the following **transcript** and evaluate using the fidelity criteria above.
Here is the transcript:
{transcript}

---
Please respond **only** in the following format (without additional commentary):

1. **Reasoning**: <your explanation>  
2. **Fidelity**: <1 | 2 | 3 | 4>  

""".strip()

time_delay_prompt = """
You are a Speech-Language Pathologist evaluating a parent's use of the **Time Delay** strategy in a parent-child interaction.

**Fidelity Scoring (1 to 4)**:
Award **+1 point** for each of the following:
1. Looking **expectantly** at the child (i.e., cueing them to respond)
2. Establishing **joint attention** with the child
3. Maintaining that expectant look for **5–7 seconds** before continuing
4. Providing **verbal feedback** that is **not** a simple “Yes/No” question

Thus, the maximum possible fidelity score is **4**.

Now, read the following **transcript** and evaluate using the fidelity criteria above.
Here is the transcript:
{transcript}

---
Please respond **only** in the following format (without additional commentary):

1. **Reasoning**: <your explanation>  
2. **Fidelity**: <1 | 2 | 3 | 4> 

""".strip()