import React, { useState, useEffect } from "react";
import ChatInterface from "./Components/ChatInterface";
import MyProgress from "./Components/MyProgress";
import VideoUpload from "./Components/VideoUpload";
// import FidelityScore from "./Components/FidelityScore";
import TranscriptionWindow from "./Components/TranscriptionWindow";
import ProcessDiagram from "./Components/ProcessDiagram";
import AIAnalysis from "./Components/AIAnalysis";
import HighlightsTimeline from "./Components/HighlightsTimeline";
import { io } from "socket.io-client";
import "./HomePage.css";

const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const HomePage = () => {
  const [videoTime, setVideoTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [newVideoUploaded, setNewVideoUploaded] = useState(false);
  const [videoId, setVideoId] = useState(null);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [showTranscription, setShowTranscription] = useState(false);

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

  useEffect(() => {
    if (!videoId) return;

    const socket = io(REACT_APP_API_BASE_URL);

    socket.on("analysis_progress", (data) => {
      console.log("Received real-time analysis:", data);
      setAnalysisResults((prevResults) => [...prevResults, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, [videoId]);

  const handleTranscriptionToggle = () => {
    setShowTranscription((prev) => !prev);
  };

  return (
    <div className="homepage-container">
      {}
      <div className="top-section">
        <div className="top-left">
          <ChatInterface
            videoTime={videoTime}
            videoDuration={videoDuration}
            newVideoUploaded={newVideoUploaded}
            setNewVideoUploaded={setNewVideoUploaded}
            seekToTime={seekToTime}
            videoId={videoId}
          />
        </div>
        <div className="top-right">
          <MyProgress />
        </div>
      </div>
      <div className="bottom-container">
        <div className="bottom-left">
          <VideoUpload
            onVideoTimeUpdate={handleVideoTimeUpdate}
            setNewVideoUploaded={setNewVideoUploaded}
            setVideoId={setVideoId}
            videoId={videoId}
            videoDuration={videoDuration}
            seekToTime={seekToTime}
            handleTranscription={handleTranscriptionToggle}
          />
          {videoId && analysisResults.length > 0 && (
            <HighlightsTimeline
              videoId={videoId}
              videoDuration={videoDuration}
              seekToTime={seekToTime}
              analysisResults={analysisResults}
            />
          )}
          <div
            className={`transcription-container ${
              showTranscription ? "visible" : ""
            }`}
          >
            {showTranscription && (
              <TranscriptionWindow
                videoId={videoId}
                videoTime={videoTime}
                seekToTime={seekToTime}
              />
            )}
          </div>
          {videoId && (
            <AIAnalysis
              analysisResults={analysisResults}
              videoId={videoId}
              seekToTime={seekToTime}
            />
          )}
          {/* <FidelityScore
            analysisResults={analysisResults}
            videoDuration={videoDuration}
            currentTime={videoTime}
          /> */}
        </div>
        <div className="bottom-right">
          <ProcessDiagram videoTime={videoTime} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
