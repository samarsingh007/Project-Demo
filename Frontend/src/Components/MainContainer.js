import React, { useState } from 'react';
import ProcessDiagram from './ProcessDiagram';
import VideoUpload from './VideoUpload';
import FidelityScore from './FidelityScore';
import TranscriptionWindow from './TranscriptionWindow';
import ChatInterface from './ChatInterface';
import HighlightsTimeline from './HighlightsTimeline';
import './CSS/MainContainer.css';

const MainContainer = () => {
  const [leftWidth, setLeftWidth] = useState(30);
  const [videoTime, setVideoTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [newVideoUploaded, setNewVideoUploaded] = useState(false);
  const [videoId, setVideoId] = useState(null);

  const handleMouseDown = (e) => {
    e.preventDefault();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth > 15 && newWidth < 45) {
      setLeftWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleVideoTimeUpdate = (time, duration) => {
    setVideoTime(time);
    setVideoDuration(duration);
  };

  const seekToTime = (time) => {
    const video = document.querySelector("video");
    if (video) {
      video.currentTime = time;
    }
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
            setNewVideoUploaded={setNewVideoUploaded} 
            setVideoId={setVideoId}
          />
          <div className="video-details">
          {videoDuration > 0 && videoId && (
            <HighlightsTimeline videoId={videoId} videoDuration={videoDuration} seekToTime={seekToTime}/>
          )}
            <TranscriptionWindow videoId={videoId} videoTime={videoTime} />
            <FidelityScore videoDuration={videoDuration} currentTime={videoTime}/>
          </div>
        </div>
        <div className='chat-section'>
          <ChatInterface 
            videoTime={videoTime} 
            videoDuration={videoDuration}
            newVideoUploaded={newVideoUploaded} 
            setNewVideoUploaded={setNewVideoUploaded}
            seekToTime={seekToTime}
          />
        </div>
      </div>
    </div>
  );
};

export default MainContainer;
