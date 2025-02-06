// HomePage.jsx
import React, { useState } from 'react';
import ChatInterface from './Components/ChatInterface';
import MyProgress from './Components/MyProgress';
import VideoUpload from './Components/VideoUpload';
import FidelityScore from './Components/FidelityScore';
import TranscriptionWindow from './Components/TranscriptionWindow';
import ProcessDiagram from './Components/ProcessDiagram';
import './HomePage.css';

const HomePage = () => {
  // States for video handling:
  const [videoTime, setVideoTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [newVideoUploaded, setNewVideoUploaded] = useState(false);
  const [videoId, setVideoId] = useState(null);

  // Handler when video time updates
  const handleVideoTimeUpdate = (time, duration) => {
    setVideoTime(time);
    setVideoDuration(duration);
  };

  // Seek the <video> to a specific time
  const seekToTime = (time) => {
    const video = document.querySelector('video');
    if (video) {
      video.currentTime = time;
    }
  };

  return (
    <div className="homepage-container">
      {/* 1) Top: Chat + MyProgress side by side */}
      <div className="top-section">
        <div className="top-left">
          <ChatInterface
            videoTime={videoTime}
            videoDuration={videoDuration}
            newVideoUploaded={newVideoUploaded}
            setNewVideoUploaded={setNewVideoUploaded}
            seekToTime={seekToTime}
          />
        </div>
        <div className="top-right">
          <MyProgress />
        </div>
      </div>

      {/* 2) Bottom: Video + Diagram */}
      <div className="bottom-container">
        <div className="bottom-left">
          <VideoUpload
            onVideoTimeUpdate={handleVideoTimeUpdate}
            setNewVideoUploaded={setNewVideoUploaded}
            setVideoId={setVideoId}
            videoId={videoId}
            videoDuration={videoDuration}
            seekToTime={seekToTime}
          />
          <TranscriptionWindow videoId={videoId} videoTime={videoTime} />
          <FidelityScore videoDuration={videoDuration} currentTime={videoTime} />
        </div>
        <div className="bottom-right">
          <ProcessDiagram videoTime={videoTime} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
