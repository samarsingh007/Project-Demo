import React, { useState, useEffect, useRef } from 'react';
import './CSS/VideoUpload.css';
import ChooseIcon from '../../../Assets/Choose.svg';
import'./HighlightsTimeline.js';
import HighlightsTimeline from './HighlightsTimeline.js';

const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const VideoUpload = ({ onVideoTimeUpdate, setNewVideoUploaded, setVideoId, videoId, videoDuration, seekToTime  }) => {
  const [video, setVideo] = useState(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

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

  const handleChooseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="training-video-container">
      {/* Header row: orange dot, “Training Video,” + button */}
      <div className="training-video-header">
        <div className="title-with-dot">
          <span className="orange-dot" />
          <h2>Training Video</h2>
        </div>
        <button className="choose-button" onClick={handleChooseClick}>
          <img
            src={ChooseIcon}
            alt="Choose Icon"
            className="choose-button-icon"
          />
          Choose
        </button>
      </div>

      {/* Orange divider */}
      <div className="orange-divider" />

      {/* Clickable video area */}
      <div
        className="video-area"
        onClick={() => {
          // Only trigger upload dialog if there's no video yet
          if (!video) {
            handleChooseClick();
          }
        }}
      >
        {/* If no video: show placeholder & hidden file input */}
        {!video && <div className="video-placeholder">Choose Video</div>}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleVideoUpload}
          style={{ display: 'none' }}
        />

        {/* If there's a video: show it */}
        {video && (
          <video
            ref={videoRef}
            width="100%"
            controls
            onTimeUpdate={handleTimeUpdate}
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>
      {video && videoId && videoDuration > 0 && (
        <div>
          <HighlightsTimeline
            videoId={videoId}
            videoDuration={videoDuration}
            seekToTime={seekToTime}
          />
        </div>
      )}
      {/* AI Analysis results */}
      <div className="ai-analysis-section">
        <h3>AI Analysis results</h3>
        {/* Insert AI output here */}
      </div>
    </div>
  );
};

export default VideoUpload;
