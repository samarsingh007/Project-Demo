import React, { useState, useEffect, useRef } from 'react';
import './CSS/VideoUpload.css';
import ChatInterface from './ChatInterface';

const VideoUpload = () => {
  const [video, setVideo] = useState(null);
  const [videoTime, setVideoTime] = useState(0);
  const [videoId, setVideoId] = useState(null);
  const [newVideoUploaded, setNewVideoUploaded] = useState(false);
  const videoRef = useRef(null);

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setVideo(URL.createObjectURL(file));
      setVideoId(Date.now());
      setVideoTime(0);
      setNewVideoUploaded(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setVideoTime(videoRef.current.currentTime);
    }
  };

  useEffect(() => {
    if (video && videoRef.current) {
      videoRef.current.src = video;
      videoRef.current.load();
    }
  }, [video]);

  return (
    <div className="video-chat-container">
      <div className="video-upload-section">
        <h2>Upload Video</h2>
        <input type="file" accept="video/*" onChange={handleVideoUpload} />
        {video && (
          <video ref={videoRef} width="100%" controls onTimeUpdate={handleTimeUpdate}>
            Your browser does not support the video tag.
          </video>
        )}
      </div>
      <ChatInterface videoTime={videoTime} videoId={videoId} newVideoUploaded={newVideoUploaded} setNewVideoUploaded={setNewVideoUploaded} />
    </div>
  );
};

export default VideoUpload;
