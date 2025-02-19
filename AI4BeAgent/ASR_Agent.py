import whisper
from moviepy.editor import VideoFileClip
import os
from tqdm import tqdm  # Import tqdm for progress bars
import constants  # Import the constants file
import re

def extract_audio_from_video(video_path, audio_output_path):
    """Extracts audio from the video file using moviepy."""
    try:
        video = VideoFileClip(video_path)
        print(f"Extracting audio from video: {video_path}")
        video.audio.write_audiofile(audio_output_path)
    except Exception as e:
        print(f"Error extracting audio: {e}")
        return None

def transcribe_audio_with_timestamps(audio_path, model_type=constants.WHISPER_MODEL_TYPE):
    """Transcribes audio using OpenAI's Whisper ASR model."""
    print(f"Transcribing audio using Whisper model '{model_type}'...")
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

def save_transcript_to_file(transcript, output_file_path):
    """Saves the formatted transcript to a file."""
    with open(output_file_path, "w") as f:
        for entry in transcript:
            f.write(f"[{entry['start']} - {entry['end']}]: {entry['text']}\n")

def generate_transcript(video_file, model_type=constants.WHISPER_MODEL_TYPE):
    """Generates transcript for a given video file."""
    # Define file paths
    audio_output_path = constants.TEMP_AUDIO_PATH

    # Step 1: Extract audio from video
    extract_audio_from_video(video_file, audio_output_path)

    # Step 2: Perform ASR using Whisper
    transcript = transcribe_audio_with_timestamps(audio_output_path, model_type=model_type)

    # Step 3: Format the transcript without speaker information
    formatted_output = format_transcript_without_speakers(transcript)
    os.remove(audio_output_path)

    return formatted_output

# Main function to process all videos in the folder
def main():
    # Get the path of the folder containing videos
    video_folder = constants.VIDEO_FOLDER_PATH
    video_files = [f for f in os.listdir(video_folder) if os.path.splitext(f)[1].lower() in constants.SUPPORTED_VIDEO_FORMATS]

    # Use tqdm to show progress for processing each video
    for filename in tqdm(video_files, desc="Processing video files"):
        video_file_path = os.path.join(video_folder, filename)
        print(f"Processing file: {video_file_path}")

        # Generate the transcript for the video file
        transcript_output = generate_transcript(video_file_path)

        # Normalize the filename by replacing special characters
        normalized_filename = re.sub(r"[^a-zA-Z0-9]", "_", os.path.splitext(filename)[0])

        # Save the transcript to a file with the cleaned filename
        output_file_path = os.path.join(video_folder, f"{normalized_filename}.txt")
        save_transcript_to_file(transcript_output, output_file_path)

        print(f"Transcript saved to: {output_file_path}")

if __name__ == "__main__":
    main()
