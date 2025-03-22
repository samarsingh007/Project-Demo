import React, { useState, useEffect, useRef } from "react";
import "./CSS/VideoUpload.css";
import ChooseIcon from "../../../Assets/Choose.svg";
import transcriptionIcon from "../../../Assets/transcription.svg";

const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const VideoUpload = ({
  onVideoTimeUpdate,
  setNewVideoUploaded,
  setVideoId,
  videoId,
  videoDuration,
  seekToTime,
  handleTranscription,
  profile,
}) => {
  const [video, setVideo] = useState(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [isTranscriptionActive, setIsTranscriptionActive] = useState(false);

  const handlePlayDemoVideo = async () => {
    setIsDemoActive((prev) => !prev);
    try {
      setVideo(process.env.PUBLIC_URL + "/demo/demo.MOV");
      const userId = profile ? profile.id : null;
      const response = await fetch(`${REACT_APP_API_BASE_URL}/api/start-demo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
        }),
      });
      const data = await response.json();

      if (data.videoId) {
        setVideoId(data.videoId);
        setNewVideoUploaded(true);
      }
      console.log("Demo video analysis started successfully.");
    } catch (error) {
      console.error("Error loading demo video:", error);
    }
  };

  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const userId = profile ? profile.id : null;

    const previewURL = URL.createObjectURL(file);
    setVideo(previewURL);

    const formData = new FormData();
    formData.append("video", file);
    formData.append("userId", userId);

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

  // const handleVideoUpload = async (event) => {
  //   const file = event.target.files[0];
  //   if (!file) return;

  //   const previewURL = URL.createObjectURL(file);
  //   setVideo(previewURL);

  //   try {
  //     const presignedUrlResponse = await fetch(
  //       `${REACT_APP_API_BASE_URL}/api/get-presigned-url?filename=${file.name}`
  //     );

  //     if (!presignedUrlResponse.ok) {
  //       throw new Error("Failed to get presigned URL");
  //     }

  //     const { videoId, presignedUrl, objectName } = await presignedUrlResponse.json();
  //     console.log("File uploaded with object name:", objectName);

  //     setIsUploading(true);
  //     setUploadProgress(0);

  //         await new Promise((resolve, reject) => {
  //           const xhr = new XMLHttpRequest();
  //           xhr.open("PUT", presignedUrl);

  //           xhr.upload.onprogress = (e) => {
  //             if (e.lengthComputable) {
  //               const percent = Math.round((e.loaded / e.total) * 100);
  //               setUploadProgress(percent);
  //             }
  //           };

  //           xhr.onload = () => {
  //             if (xhr.status === 200) {
  //               console.log("✅ Video uploaded successfully to MinIO.");
  //               resolve();
  //             } else {
  //               console.error("Upload failed with status", xhr.status);
  //               reject(new Error("Failed to upload video to MinIO"));
  //             }
  //           };

  //           xhr.onerror = () => {
  //             reject(new Error("Network error during upload"));
  //           };

  //           xhr.send(file);
  //         });

  //         console.log("✅ Video uploaded successfully to MinIO.");

  //     // ✅ Step 3: Notify the backend to start video analysis
  //     const analysisResponse = await fetch(
  //       `${REACT_APP_API_BASE_URL}/api/start-analysis`,
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ videoId }),
  //       }
  //     );

  //     if (!analysisResponse.ok) {
  //       throw new Error("Failed to start analysis");
  //     }

  //     console.log("✅ Analysis started successfully.");

  //     setNewVideoUploaded(true);
  //     setVideoId(videoId);
  //   } catch (error) {
  //     console.error("Error uploading video:", error);
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };

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
    setIsDemoActive(false);
  };

  return (
    <div className="training-video-container">
      <div className="training-video-header">
        <div className="title-with-dot">
          <span className="orange-dot" />
          <h2>Training Video</h2>
        </div>
        <div className="training-video-buttons">
          <button className="choose-button" onClick={handleChooseClick}>
            <img
              src={ChooseIcon}
              alt="Choose Icon"
              className="choose-button-icon"
            />
            Choose
          </button>
          <button
            className={`demo-button ${isDemoActive ? "active" : ""}`}
            onClick={(e) => {
              handlePlayDemoVideo();
            }}
          >
            <img
              src={ChooseIcon}
              alt="Choose Icon"
              className="choose-button-icon"
            />
            Demo Video
          </button>
          <button
            className={`transcription-button ${isTranscriptionActive ? "active" : ""}`}
            onClick={() => {
              handleTranscription();
              setIsTranscriptionActive((prev) => !prev);
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
      </div>

      <div className="orange-divider" />

      <div
        className={`video-area ${video ? "active" : ""}`}
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
            playsInline
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
