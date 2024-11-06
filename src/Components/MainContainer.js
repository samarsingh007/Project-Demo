import React, { useState } from 'react';
import ProcessDiagram from './ProcessDiagram';
import VideoUpload from './VideoUpload';
import FidelityScore from './FidelityScore';
import TranscriptionWindow from './TranscriptionWindow';
import ChatInterface from './ChatInterface';
import './CSS/MainContainer.css';

const MainContainer = () => {
  const [leftWidth, setLeftWidth] = useState(30);
  const [videoTime, setVideoTime] = useState(0);
  const [videoId, setVideoId] = useState(null);
  const [newVideoUploaded, setNewVideoUploaded] = useState(false);
  const [fidelityScore, setFidelityScore] = useState(null);

  const handleFidelityScoreUpdate = (score) => {
    setFidelityScore(score);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth > 20 && newWidth < 60) {
      setLeftWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleVideoTimeUpdate = (time) => {
    setVideoTime(time);
  };

  return (
    <div className="content-container">
      <div className="left-container" style={{ width: `${leftWidth}%` }}>
        <ProcessDiagram videoTime={videoTime} />
      </div>

      <div className="divider" onMouseDown={handleMouseDown} />

      <div className="right-container" style={{ width: `${100 - leftWidth}%` }}>
        <div className="video-section">
          <VideoUpload 
            onVideoTimeUpdate={handleVideoTimeUpdate} 
            setVideoId={setVideoId} 
            setNewVideoUploaded={setNewVideoUploaded} 
          />
          <div className="video-details">
            <TranscriptionWindow videoTime={videoTime} className="transcription-window" />
            <FidelityScore score={fidelityScore} className="fidelity-score" />
          </div>
        </div>
        <div className='chat-section'>
        <ChatInterface 
          videoTime={videoTime} 
          videoId={videoId} 
          newVideoUploaded={newVideoUploaded} 
          setNewVideoUploaded={setNewVideoUploaded} 
          seekToTime={(time) => {
            document.querySelector("video").currentTime = time; 
          }}
          onFidelityScoreUpdate={handleFidelityScoreUpdate} // Pass fidelity score update function
        />
      </div>
      </div>
    </div>
  );
};

export default MainContainer;
