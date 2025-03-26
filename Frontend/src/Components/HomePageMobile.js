import React, { useState, useEffect } from "react";
import MobileTopBar from "./MobileTopBar";
import MobileBottomBar from "./MobileBottomBar";
import "./CSS/HomePageMobile.css";
import ChatInterface from "./Current Training/Components/ChatInterface";
import AIAnalysis from "./Current Training/Components/AIAnalysis";
import ProcessDiagram from "./Current Training/Components/ProcessDiagram";
import VideoUpload from "./Current Training/Components/VideoUpload";
import HighlightsTimeline from "./Current Training/Components/HighlightsTimeline";
import TranscriptionWindow from "./Current Training/Components/TranscriptionWindow";
import { io } from "socket.io-client";
import TrainingHistory from "./Training History/TrainingHistory";

const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const HomePageMobile = ({ userId, onAppReload, profile, setShowNameModal, isGuest, isMobile, refreshTrigger }) => {
  const [selectedPage, setSelectedPage] = useState("home");
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
      if (data.videoId === videoId) {
      console.log("Received real-time analysis:", data);
      setAnalysisResults((prevResults) => [...prevResults, data]);
    }
  });

    return () => {
      socket.disconnect();
    };
  }, [videoId]);

  const handleTranscriptionToggle = () => {
    setShowTranscription((prev) => !prev);
  };

  return (
    <div className="home-mobile-wrapper">
      <MobileTopBar profile={profile} setShowNameModal={setShowNameModal} />
      <div className="mobile-content">
      <div
          className="chat-container-mobile fade-in"
          style={{
            display: selectedPage === "home" ? "block" : "none",
          }}
        >
          <TrainingHistory userId = {userId} isMobile={isMobile}/>
        </div>
        <div
          className="chat-container-mobile fade-in"
          style={{
            display: selectedPage === "chat" ? "block" : "none",
          }}
        >
          <ChatInterface
            videoTime={videoTime}
            videoDuration={videoDuration}
            newVideoUploaded={newVideoUploaded}
            setNewVideoUploaded={setNewVideoUploaded}
            seekToTime={seekToTime}
            videoId={videoId}
            profile={profile}
            isGuest={isGuest}
            refreshTrigger={refreshTrigger}
          />
        </div>
        <div
          className="review-container-mobile fade-in"
          style={{
            display: selectedPage === "review" ? "block" : "none",
          }}
        >
          <VideoUpload
            onAppReload={onAppReload}
            onVideoTimeUpdate={handleVideoTimeUpdate}
            setNewVideoUploaded={setNewVideoUploaded}
            setVideoId={setVideoId}
            videoId={videoId}
            videoDuration={videoDuration}
            seekToTime={seekToTime}
            handleTranscription={handleTranscriptionToggle}
            profile={profile}
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
                isMobile={isMobile}
              />
            )}
          </div>
          {videoId && (
            <AIAnalysis
              analysisResults={analysisResults}
              videoId={videoId}
              seekToTime={seekToTime}
              isMobile={isMobile}
            />
          )}
        </div>
        <div
          className="diagram-container-mobile fade-in"
          style={{
            display: selectedPage === "diagram" ? "block" : "none",
          }}
        >
          {" "}
          <ProcessDiagram />
        </div>
      </div>
      <MobileBottomBar
        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}
        setShowNameModal={setShowNameModal}
      />
    </div>
  );
};

export default HomePageMobile;
