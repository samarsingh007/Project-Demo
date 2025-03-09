import React, { useState, useEffect, useRef } from "react";
import "./CSS/VideoUpload.css";
import ChooseIcon from "../../../Assets/Choose.svg";
import transcriptionIcon from "../../../Assets/transcription.svg"
import "./HighlightsTimeline.js";

const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const VideoUpload = ({
  onVideoTimeUpdate,
  setNewVideoUploaded,
  setVideoId,
  videoId,
  videoDuration,
  seekToTime,
  handleTranscription,
}) => {
  const [video, setVideo] = useState(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    setVideo(previewURL);

    const formData = new FormData();
    formData.append("video", file);

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${REACT_APP_API_BASE_URL}/upload`, true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          setNewVideoUploaded(true);
          setVideoId(data.videoId);
          console.log("Video successfully uploaded.");
        } else {
          console.error("Failed to upload video.");
        }
        setIsUploading(false);
      };

      xhr.onerror = () => {
        console.error("Error during video upload.");
        setIsUploading(false);
      };

      xhr.send(formData);
    } catch (error) {
      console.error("Error uploading video:", error);
      setIsUploading(false);
    }
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
        <button
           className="transcription-button"
              onClick={(e) => {
                handleTranscription(); // Toggle transcription visibility
                e.target.classList.toggle("active"); // Toggle active class on the button
              }}
            >
            <img
            src={transcriptionIcon}
            alt="Transcription Icon"
            className="choose-button-icon"
          />
          Transcription
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
        {isUploading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <span className="progress-text">
                Uploading Video... {uploadProgress}%
              </span>
              <div
                className="progress-fill"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoUpload;
