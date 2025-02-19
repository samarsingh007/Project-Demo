import cv2
import os
import openai
import torch
from transformers import CLIPProcessor, CLIPModel
from deep_seek.janus.janusflow.models import MultiModalityCausalLM, VLChatProcessor
from deep_seek.janus.utils.io import load_pil_images
from constants import OPENAI_API_KEY, FRAME_RATE
TEMP_FOLDER = "./temp"  # Temporary folder to store extracted frames

# Set your OpenAI API key
openai.api_key = OPENAI_API_KEY

# Initialize the JanusFlow model and processor
model_path = "deepseek-ai/JanusFlow-1.3B"
vl_chat_processor: VLChatProcessor = VLChatProcessor.from_pretrained(model_path)
tokenizer = vl_chat_processor.tokenizer

vl_gpt = MultiModalityCausalLM.from_pretrained(model_path, trust_remote_code=True)
vl_gpt = vl_gpt.to(torch.bfloat16).cuda().eval()


def extract_frames(video_path, interval=10):
    """
    Extract frames from a video at a given interval and save them to the temp folder.
    """
    if not os.path.exists(TEMP_FOLDER):
        os.makedirs(TEMP_FOLDER)

    cap = cv2.VideoCapture(video_path)
    frame_count = 0
    saved_frames = []
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_interval = int(fps * interval)  # Convert seconds to frame interval

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        if frame_count % frame_interval == 0:
            frame_path = os.path.join(TEMP_FOLDER, f"frame_{frame_count}.jpg")
            cv2.imwrite(frame_path, frame)  # Save the frame as a file
            saved_frames.append(frame_path)

        frame_count += 1

    cap.release()
    return saved_frames


def describe_frame(frame_path):
    """
    Generate a description for a single video frame using JanusFlow.
    """

    # Prepare the conversation for JanusFlow
    conversation = [
        {
            "role": "User",
            "content": (
                "<image_placeholder>\n"
                "This image is from a parent-child interaction video. "
                "Please describe the contents in detail, focusing on:\n"
                "• The parent's actions and gestures\n"
                "• The child's actions or reactions\n"
                "• Are the parent and child having joint attention? (Look at the same thing)"
                "• Any objects, books, toys, or visual cues in the frame\n\n"
                "Try to include details that might indicate the parent's teaching approach, "
                "such as modeling language, prompting the child (mand-model), or pausing for the child’s turn. "
                "However, do not provide a final classification label. Just give a factual, thorough description "
                "to help us determine the teaching strategy later."
            ),
            "images": [frame_path],  # Replace with the actual frame path
        },
        {"role": "Assistant", "content": ""},
    ]

    # Load the PIL images and prepare inputs
    pil_images = load_pil_images(conversation)
    prepare_inputs = vl_chat_processor(
        conversations=conversation, images=pil_images, force_batchify=True
    ).to(vl_gpt.device)

    # Run the image encoder to get the image embeddings
    inputs_embeds = vl_gpt.prepare_inputs_embeds(**prepare_inputs)

    # Generate the response
    outputs = vl_gpt.language_model.generate(
        inputs_embeds=inputs_embeds,
        attention_mask=prepare_inputs.attention_mask,
        pad_token_id=tokenizer.eos_token_id,
        bos_token_id=tokenizer.bos_token_id,
        eos_token_id=tokenizer.eos_token_id,
        max_new_tokens=512,
        do_sample=False,
        use_cache=True,
    )

    # Decode the response
    answer = tokenizer.decode(outputs[0].cpu().tolist(), skip_special_tokens=True)
    print(answer)
    return answer

def generate_video_description(frame_descriptions):
    """
    Use GPT to generate a detailed description of the video based on frame descriptions.
    """
    prompt = (
        "Given the following frame descriptions, generate a cohesive and detailed "
        "description of the video:\n\n" + "\n".join(frame_descriptions)
    )
    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": "You are a helpful assistant."},
                  {"role": "user", "content": prompt}],
    )
    return response['choices'][0]['message']['content']

def describe_video(video_path):
    frames = extract_frames(video_path, interval= FRAME_RATE)
    frame_descriptions = [describe_frame(frame) for frame in frames]
    video_description = generate_video_description(frame_descriptions)
    print("Detailed Video Description:\n", video_description)

# Run the pipeline
# video_path = "./data/A.L_10.14.20_Baseline_1.mov"
# describe_video(video_path)
