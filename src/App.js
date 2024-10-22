import React from 'react';
import './App.css';
import VideoUpload from './Components/VideoUpload';
import ChatInterface from './Components/ChatInterface';


function App() {
  return (
    <div className="app-container">
      <header>
        <h1>Welcome to the Project Demo!</h1>
      </header>
      <div className="content-container">
        <VideoUpload />
        <ChatInterface />
      </div>
    </div>
  );
}

export default App;
