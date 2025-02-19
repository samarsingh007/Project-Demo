# Video Analysis with Whisper and Diarization

This project provides a Python-based pipeline to analyze video files for parent-child interactions. The pipeline extracts audio, transcribes it using OpenAI Whisper API, performs speaker diarization, and generates an analysis CSV file with timestamps, transcripts, strategies, fidelity scores, and AI reasoning.

## Prerequisites

- **Python**: Ensure Python 3.8 or higher is installed.
- **Anaconda**: Install [Anaconda](https://www.anaconda.com/products/distribution) for environment management.
- **OpenAI API Key**: Obtain an API key from [OpenAI](https://platform.openai.com/signup/).

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. **Create and Activate an Anaconda Environment**
   ```bash
   conda create --name video_analysis_env python=3.8 -y
   conda activate video_analysis_env
   ```

3. **Install Dependencies**
   Ensure `requirements.txt` is in the project folder. Run the following command:
   ```bash
   pip install -r requirements.txt
   pip install moviepy==1.0.3
   ```
   Ensure Deep_seek model works in the deep_seek folder, run janus.py test it. Run the following command:
   ```bash
   cd deep_seek
   pip install -e .
   pip install diffusers[torch]
   ```

4. **Set OpenAI API Key**
   Export your OpenAI API key as an environment variable:
   ```bash
   export OPENAI_API_KEY="your_openai_api_key"
   ```
   Replace `openai_api_key` with your actual API key.

## Usage

1. **Prepare Your Video File**
   Place your input video file in the project directory and update the `video_file_path` in the script to point to the video file.

2. **Run the Script**
   Execute the script to process the video and generate the analysis:
   ```bash
   python super_SLP.py
   ```

3. **Output**
   The script will generate a CSV file (`output_analysis.csv`) in the project directory containing:
   - Timestamps (`Begin-End`)
   - Speaker (`Parent`/`Child`)
   - Transcript
   - Strategy used
   - Fidelity Score (0-5)
   - AI Reasoning

## Cleaning Up

Temporary audio files will be automatically removed after processing. Ensure you have write permissions in the working directory.

## Example

Given an input video, the generated CSV might look like this:

| Begin-End | Speaker  | Transcript              | Strategy       | Fidelity Score | AI Reasoning                          |
|-----------|----------|-------------------------|----------------|----------------|---------------------------------------|
| 0.00-5.00 | Parent   | "Hello, how are you?"  | Positive Talk  | 4              | "Parent used a warm tone to engage." |
| 5.00-8.00 | Child    | "I'm good, thank you." | Responsive     | 5              | "Child responded promptly."          |

## Notes

- Ensure the video file format is supported (e.g., MP4).
- Review the API usage limits of OpenAI to prevent unexpected charges.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Troubleshooting

- **Dependency Issues**: Ensure all dependencies in `requirements.txt` are installed.
- **API Errors**: Verify your OpenAI API key and network connectivity.
- **Speaker Diarization**: Ensure the `pyannote.audio` model is downloaded correctly.

For further assistance, contact the project maintainer.

