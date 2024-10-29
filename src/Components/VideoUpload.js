import React, { useState, useEffect, useRef } from 'react';
import './CSS/VideoUpload.css';
import ChatInterface from './ChatInterface';

const VideoUpload = ({ onVideoTimeUpdate }) => {
  const [video, setVideo] = useState(null);
  const [videoId, setVideoId] = useState(null);
  const [newVideoUploaded, setNewVideoUploaded] = useState(false);
  const videoRef = useRef(null);

  const seekToTime = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setVideo(URL.createObjectURL(file));
      setVideoId(Date.now());
      setNewVideoUploaded(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      onVideoTimeUpdate(currentTime);
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
      <div className={`video-upload-section ${video ? 'uploaded' : ''}`}>
        <h2>Upload Video</h2>
        <input type="file" accept="video/*" onChange={handleVideoUpload} />
        {video && (
          <video ref={videoRef} width="100%" controls onTimeUpdate={handleTimeUpdate}>
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      <ChatInterface
        videoTime={videoRef.current ? videoRef.current.currentTime : 0}
        videoId={videoId}
        newVideoUploaded={newVideoUploaded}
        setNewVideoUploaded={setNewVideoUploaded}
        seekToTime={seekToTime}
      />
    </div>
  );
};

export default VideoUpload;
