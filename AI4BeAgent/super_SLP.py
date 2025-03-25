import sys
import os
import logging
import socketio
import json
import pandas as pd
import openai
import video_manager
from ASR_Agent import generate_transcript
from video_agent import describe_video
import constants
import time
import re
from dotenv import load_dotenv
import requests
load_dotenv()


# --- Setup Logging ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- OpenAI API Key ---
openai.api_key = constants.OPENAI_API_KEY

# --- Initialize WebSocket Client ---
socket_server_url = os.getenv('SOCKET_SERVER_URL')
sio = socketio.Client()
sio.connect(socket_server_url)


# def download_from_minio(presigned_get_url, local_temp_path):
#     """Downloads file from MinIO using a presigned GET URL."""
#     logging.info(f"Downloading video from presigned GET URL: {presigned_get_url}")
#     response = requests.get(presigned_get_url, stream=True)
#     response.raise_for_status()
#     with open(local_temp_path, "wb") as f:
#         for chunk in response.iter_content(chunk_size=1024*1024):
#             f.write(chunk)
#     logging.info(f"Video downloaded to {local_temp_path}")


# --- Function to Remove Temporary Files ---
def clean_temp_files(file_paths):
    """Remove temporary files to clean up."""
    for file_path in file_paths:
        try:
            os.remove(file_path)
        except Exception as e:
            logging.warning(f"Could not delete file {file_path}: {e}")

# --- Parse LLM Output ---
import re

def parse_llm_output(llm_output, predict_label):
    """
    Parses and cleans the output from OpenAI:
    - Extracts Fidelity and Reasoning from LLM response.
    - Normalizes predict_label by stripping any leading/trailing quotes.

    Parameters:
      - llm_output (str): Raw text from OpenAI.
      - predict_label (str): Predicted strategy label, possibly wrapped in extra quotes.

    Returns:
      - fidelity (str): Extracted fidelity score.
      - reasoning (str): Extracted reasoning.
      - cleaned_label (str): Normalized predict_label with quotes removed.
    """

    # Remove any surrounding **Markdown bold** (e.g., "**Fidelity**:")
    cleaned_output = llm_output.replace('**', '')

    # Extract Reasoning and Fidelity using regex (case-insensitive)
    reasoning_match = re.search(r'(?i)reasoning\s*:\s*(.*)', cleaned_output)
    fidelity_match = re.search(r'(?i)fidelity\s*:\s*(.*)', cleaned_output)

    reasoning = reasoning_match.group(1).strip(' "*') if reasoning_match else "N/A"
    fidelity = fidelity_match.group(1).strip(' "*') if fidelity_match else "Unknown"

    # --- Normalize predict_label (remove any triple, double, or single quotes) ---
    cleaned_label = re.sub(r'^["\']+|["\']+$', '', predict_label).strip()

    return fidelity, reasoning, cleaned_label


# --- Analyze Segments and Send Real-Time Updates ---
def analyze_segments(segments, segments_times):
    output_rows = []
    for i, (predict_label, lines) in enumerate(segments, start=1):
        
        # Step 1: Normalize predict_label using parse_llm_output
        _, _, predict_label = parse_llm_output("", predict_label)

        if "None" in predict_label:
            continue
        
        start_time = segments_times[i - 1]['start']
        end_time = segments_times[i - 1]['end']
        transcript = " ".join([line['text'] for line in lines])

        # Determine appropriate prompt based on the cleaned predict_label
        if "Modeling" in predict_label:
            user_prompt = constants.modeling_prompt.format(transcript=transcript)
        elif "Mand-model" in predict_label:
            user_prompt = constants.mand_model_prompt.format(transcript=transcript)
        elif "Time Delay" in predict_label:
            user_prompt = constants.time_delay_prompt.format(transcript=transcript)
        else:
            continue  # Skip if no matching strategy

        # Step 2: OpenAI API Call
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a Speech-Language Pathologist analyzing parent-child interactions."},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.0
            )

            if response and 'choices' in response and response['choices']:
                output_text = response['choices'][0]['message']['content']
                fidelity, reasoning, _ = parse_llm_output(output_text, predict_label)  # Parse Fidelity & Reasoning
            else:
                fidelity, reasoning = "N/A", "No response from AI"

        except Exception as e:
            logging.error(f"OpenAI API Error: {e}")
            fidelity, reasoning = "N/A", f"Error: {e}"
        
        if fidelity == "0":
            continue

        # Construct real-time message
        analysis_data = {
            "videoId": video_id,
            "Begin-End": f"{start_time}-{end_time}",
            "Transcript": transcript,
            "Strategy": predict_label,  # Cleaned version
            "Fidelity Score": fidelity,
            "AI Reasoning": reasoning
        }

        # Send real-time update to WebSocket
        sio.emit('analysis_progress', analysis_data)

        # Append to final CSV output
        output_rows.append(analysis_data)

    return pd.DataFrame(output_rows)
"""
# --- Analyze Segments and Send Real-Time Updates ---
def analyze_segments(segments, segments_times):
    output_rows = []
    
    # Dummy data to simulate real analysis results
    dummy_analysis_results = [
        ("Modeling", "Look, a car!", "4", "Good modeling: parent waited 3s, used feedback."),
        ("Mand-model", "Do you want to play?", "3", "Mand-model used, but response wait time was too short."),
        ("Time Delay", "What color is this?", "2", "Joint attention missing before prompting."),
        ("Modeling", "Wow, that's big!", "4", "Excellent use of modeling with appropriate feedback."),
        ("Mand-model", "Can you say 'dog'?", "3", "Encouraged response, but needed clearer feedback."),
        ("Time Delay", "Look at this!", "1", "Expectant look missing, delay not held for 5 seconds."),
        ("Modeling", "Let's build a tower!", "4", "Good engagement and reinforcement used."),
        ("Mand-model", "Where is the ball?", "3", "Prompt used well, but joint attention was weak."),
        ("Time Delay", "Tell me what you see!", "2", "Wait time insufficient for a full response."),
        ("Modeling", "This is a train!", "4", "Great modeling technique with extended feedback.")
    ]

    for i, (predict_label, transcript, fidelity, reasoning) in enumerate(dummy_analysis_results):
        start_time = f"00:{str(5 + i * 5).zfill(2)}"
        end_time = f"00:{str(10 + i * 5).zfill(2)}"

        # Construct real-time message
        analysis_data = {
            "videoId": video_id,
            "Begin-End": f"{start_time}-{end_time}",
            "Transcript": transcript,
            "Strategy": predict_label,
            "Fidelity Score": fidelity,
            "AI Reasoning": reasoning
        }

        # Send real-time update to WebSocket
        sio.emit("analysis_progress", analysis_data)
        logging.info(f"Sent test real-time analysis: {analysis_data}")

        # Append to final CSV output
        output_rows.append(analysis_data)
        time.sleep(3)

    return pd.DataFrame(output_rows)"""

def send_transcriptions(video_id, transcript):
    for line in transcript:
        transcription_data = {
            "videoId": video_id,
            "start": line['start'],
            "end": line['end'],
            "text": line['text']
        }
        sio.emit('transcription_update', transcription_data)

"""# --- Process Video Function ---
def process_video(video_id, video_path, output_csv="output_analysis.csv"):
    temp_files = []
    try:
        logging.info("Processing started.")

        # Step 1: Generate Transcript
        transcript = [
        {"start": "00:05", "end": "00:10", "text": "Look, a car!"},
        {"start": "00:12", "end": "00:15", "text": "Do you want to play?"},
        {"start": "00:18", "end": "00:20", "text": "Wow, that's big!"}
    ]
        send_transcriptions(video_id, transcript)

        # Step 2: Split Video into Segments
        result_segments, segments_times = video_manager.split_transcript_by_multi_llm(transcript)

        # Step 3: Analyze Segments with OpenAI and WebSockets
        logging.info("Analyzing fidelity...")
        analysis_df = analyze_segments(result_segments, segments_times)

        # Step 4: Save Final Analysis to CSV
        logging.info("Saving to CSV...")
        analysis_df.to_csv(output_csv, index=False)
        logging.info(f"Analysis saved to {output_csv}")

        # Notify WebSocket that analysis is complete
        sio.emit('analysis_complete', {"csvPath": output_csv})
        logging.info("Sent final analysis completion message.")

    except Exception as e:
        logging.error(f"Processing failed: {e}")
    finally:
        clean_temp_files(temp_files)"""

def process_video(video_id, video_path, output_csv="output_analysis.csv", is_demo=False):
    temp_files = []
    try:
        logging.info("Processing started.")

        # Step 1: Generate Transcript
        transcript = generate_transcript(video_path)
        send_transcriptions(video_id, transcript)
        
        if is_demo:
            time.sleep(5)
            logging.info("Demo video detected. Skipping further analysis.")
            return

        # Step 2: Split Video into Segments
        result_segments, segments_times = video_manager.split_transcript_by_multi_llm(transcript)

        # Step 3: Analyze Segments with OpenAI and WebSockets
        logging.info("Analyzing fidelity...")
        analysis_df = analyze_segments(result_segments, segments_times)

        # Step 4: Save Final Analysis to CSV
        logging.info("Saving to CSV...")
        analysis_df.to_csv(output_csv, index=False)
        logging.info(f"Analysis saved to {output_csv}")

        # Notify WebSocket that analysis is complete
        sio.emit('analysis_complete', {"csvPath": output_csv, "videoId": video_id})
        logging.info("Sent final analysis completion message.")

    except Exception as e:
        logging.error(f"Processing failed: {e}")
    finally:
        clean_temp_files(temp_files)


# --- Main Execution ---
if __name__ == "__main__":
    video_id = sys.argv[1]
    video_file_path = sys.argv[2]
    output_file_path = sys.argv[3]
    is_demo = sys.argv[4].lower() == "true"
    process_video(video_id, video_file_path, output_file_path, is_demo)

    # video_id = sys.argv[1]
    # presigned_get_url = sys.argv[2]    
    # output_file_path = sys.argv[3]
    # is_demo = sys.argv[4].lower() == "true"

    # local_temp_path = f"/home/samarpra/Project-Demo/AI4BeAgent/temp/{video_id}.mp4"
    # download_from_minio(presigned_get_url, local_temp_path)
    # process_video(video_id, local_temp_path, output_file_path, is_demo)
    # try:
    #     os.remove(local_temp_path)
    # except:
    #     pass
