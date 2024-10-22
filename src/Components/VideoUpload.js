import React, { useState, useRef, useEffect } from 'react';
import './CSS/VideoUpload.css';

const VideoUpload = () => {
  const [video, setVideo] = useState(null);
  const videoRef = useRef(null);

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setVideo(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (video && videoRef.current) {
      videoRef.current.src = video;
      videoRef.current.load();
    }
  }, [video]);

  return (
    <div className="video-upload-section">
      <h2>Upload Video</h2>
      <input type="file" accept="video/*" onChange={handleVideoUpload} />
      {video && (
        <video ref={videoRef} width="100%" controls>
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
};

export default VideoUpload;
