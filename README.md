# Instructions to Run the Project
### To run the Frontend:
```cd ./Frontend npm start```
### To run the Backend:
```cd ./Backend npm start```
### To run the Transcription Service:
```cd ./Transcription\nuvicorn app:app --host [host] --port [port no.]```
### Environment Variables:- The **Frontend** and **Backend** have their own `.env` files to manage environment variables.
The **Transcription Service** can simply be run using the `uvicorn` command as mentioned above, where the host and port can be specified dynamically in the command.
