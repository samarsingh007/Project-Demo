import React, { useState, useEffect, useRef } from 'react';
import './CSS/VideoUpload.css';
const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const VideoUpload = ({ onVideoTimeUpdate, setNewVideoUploaded, setVideoId }) => {
  const [video, setVideo] = useState(null);
  const videoRef = useRef(null);

  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('video', file);
  
      const response = await fetch(`${REACT_APP_API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
  
      if (data.success) {
        setVideo(data.videoUrl);
        setNewVideoUploaded(true);
        setVideoId(data.videoId);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      onVideoTimeUpdate(currentTime, duration);
    }
  };

  useEffect(() => {
    if (video && videoRef.current) {
      videoRef.current.src = video;
      videoRef.current.load();
    }
  }, [video]);

  return (
    <div className={`video-upload-section ${video ? 'uploaded' : ''}`}>
      <h2>Upload Video</h2>
      <input type="file" accept="video/*" onChange={handleVideoUpload} />
      {video && (
        <video ref={videoRef} width="100%" controls onTimeUpdate={handleTimeUpdate}>
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
};

export default VideoUpload;
