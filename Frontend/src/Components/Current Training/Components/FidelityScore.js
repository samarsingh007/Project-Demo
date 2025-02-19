import React, { useState } from "react";
import "./CSS/FidelityScore.css";

const FidelityScore = ({ videoDuration, currentTime, analysisResults }) => {
  const [selectedStrategy, setSelectedStrategy] = useState("Modeling");

  const parseTime = (timeString) => {
    const [mm, ss] = timeString.split(":").map(Number);
    return mm * 60 + ss;
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${secs}`;
  };

  const filteredMessages = analysisResults.filter((message) => {
    return message["Begin-End"] && message["Strategy"] === selectedStrategy;
  });

  const sortedMessages = filteredMessages.sort((a, b) => {
    const aBegin = parseTime(a["Begin-End"].split("-")[0]);
    const bBegin = parseTime(b["Begin-End"].split("-")[0]);
    return aBegin - bBegin;
  });

  const segments = [];

  if (sortedMessages.length > 0) {
    const firstBegin = parseTime(sortedMessages[0]["Begin-End"].split("-")[0]);
    if (firstBegin > 0) {
      segments.push({
        score: "green",
        startPercentage: 0,
        widthPercentage: videoDuration ? (firstBegin / videoDuration) * 100 : 0,
      });
    }
  }

  sortedMessages.forEach((message, index) => {
    const beginStr = message["Begin-End"].split("-")[0];
    const begin = parseTime(beginStr);
    const nextBegin =
      index === sortedMessages.length - 1
        ? videoDuration
        : parseTime(sortedMessages[index + 1]["Begin-End"].split("-")[0]);
    const startPercentage = videoDuration ? (begin / videoDuration) * 100 : 0;
    const widthPercentage = videoDuration
      ? ((nextBegin - begin) / videoDuration) * 100
      : 0;
    segments.push({
      score: message["Fidelity Score"],
      startPercentage,
      widthPercentage,
    });
  });

  const cursorPosition = videoDuration
    ? (currentTime / videoDuration) * 100
    : 0;

  const scaleMarkers = [];
  for (let i = 0; i <= Math.floor(videoDuration / 60); i++) {
    const timeInSeconds = i * 60;
    const position = (timeInSeconds / videoDuration) * 100;
    scaleMarkers.push({ time: timeInSeconds, position });
  }

  return (
    <div className="fidelity-score-container">
      <h2>Fidelity Score</h2>
      <div className="strategy-radios">
        <label>
          <input
            type="radio"
            checked={selectedStrategy === "Modeling"}
            onChange={() => setSelectedStrategy("Modeling")}
          />
          Modeling
        </label>
        <label>
          <input
            type="radio"
            checked={selectedStrategy === "Mand-model"}
            onChange={() => setSelectedStrategy("Mand-model")}
          />
          Mand-Modeling
        </label>
        <label>
          <input
            type="radio"
            checked={selectedStrategy === "Time Delay"}
            onChange={() => setSelectedStrategy("Time Delay")}
          />
          Time Delay
        </label>
      </div>
      <div className="fidelity-score-bar">
        {segments.map((segment, index) => (
          <div
            key={index}
            className={`fidelity-segment fidelity-score-${segment.score}`}
            style={{
              width: `${segment.widthPercentage}%`,
              left: `${segment.startPercentage}%`,
              position: "absolute",
            }}
          />
        ))}
        <div
          className="video-cursor"
          style={{ left: `${cursorPosition}%` }}
        ></div>
      </div>
      <div className="scale-marker-container">
        {scaleMarkers.map((marker, index) => (
          <div
            key={index}
            className="scale-marker"
            style={{ left: `${marker.position}%` }}
          >
            <div className="scale-line"></div>
            <span className="scale-time">{formatTime(marker.time)}</span>
          </div>
        ))}
      </div>
      <div className="fidelity-key">
        <div className="key-item">
          <span className="key-color fidelity-score-1"></span>
          <span>Score 1</span>
        </div>
        <div className="key-item">
          <span className="key-color fidelity-score-2"></span>
          <span>Score 2</span>
        </div>
        <div className="key-item">
          <span className="key-color fidelity-score-3"></span>
          <span>Score 3</span>
        </div>
        <div className="key-item">
          <span className="key-color fidelity-score-4"></span>
          <span>Score 4</span>
        </div>
      </div>
    </div>
  );
};

export default FidelityScore;
