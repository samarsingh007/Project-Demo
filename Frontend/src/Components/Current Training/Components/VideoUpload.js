import React, { useState, useEffect, useRef } from "react";
import "./CSS/VideoUpload.css";
import ChooseIcon from "../../../Assets/Choose.svg";
import "./HighlightsTimeline.js";

const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const VideoUpload = ({
  onVideoTimeUpdate,
  setNewVideoUploaded,
  setVideoId,
  videoId,
  videoDuration,
  seekToTime,
}) => {
  const [video, setVideo] = useState(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    setVideo(previewURL);

    const formData = new FormData();
    formData.append("video", file);

    fetch(`${REACT_APP_API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setNewVideoUploaded(true);
          setVideoId(data.videoId);
          console.log("Video is being processed in the background.");
        }
      })
      .catch((error) => {
        console.error("Error uploading video for processing:", error);
      });
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      onVideoTimeUpdate(currentTime, duration);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      onVideoTimeUpdate(0, duration);
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

      <div className="orange-divider" />

      <div
        className="video-area"
        onClick={() => {
          if (!video) {
            handleChooseClick();
          }
        }}
      >
        {!video && <div className="video-placeholder">Choose Video</div>}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleVideoUpload}
          style={{ display: "none" }}
        />

        {video && (
          <video
            ref={videoRef}
            width="100%"
            controls
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    </div>
  );
};

export default VideoUpload;
