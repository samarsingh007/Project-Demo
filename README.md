# Instructions to Run the Project
### To run the Frontend:
```cd ./Frontend npm start```
### To run the Backend:
```cd ./Backend npm start```
### To run the Transcription Service:
```cd ./Transcription uvicorn app:app --host [host] --port [port no.]```
### Environment Variables:- The **Frontend** and **Backend** have their own `.env` files to manage environment variables.
The **Transcription Service** can simply be run using the `uvicorn` command as mentioned above, where the host and port can be specified dynamically in the command.

### Important Packages to be installed
- **Backend**:
  - `graphviz`: Install it using `sudo apt install graphviz`.
- Other packages for the frontend and backend can be installed during installation of node and react, using: `npm install` in the respective directory.
- **Python (Transcription Service)**:
  - `openai_whisper`: Install it using `pip install openai_whisper`.
  - `uvicorn`: Install it using `pip install uvicorn`.
  - `moviepy`: Install it using `pip install moviepy`.
  - `ffmpeg`: Ensure ffmpeg is installed in your system. You can install it using `sudo apt install ffmpeg` (for Ubuntu)
