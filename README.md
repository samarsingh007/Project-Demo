# Instructions to Run the Project\n\n
### To run the Frontend:\n
```\n cd ./Frontend\n npm start\n```\n\n
### To run the Backend:\n
```\n cd ./Backend\nnpm start\n```\n\n
### To run the Transcription Service:\n
```\n cd ./Transcription\nuvicorn app:app --host [host] --port [port no.]\n```\n\n
### Environment Variables:\n- The **Frontend** and **Backend** have their own `.env` files to manage environment variables.\n\n
- The **Transcription Service** can simply be run using the `uvicorn` command as mentioned above, where the host and port can be specified dynamically in the command.
