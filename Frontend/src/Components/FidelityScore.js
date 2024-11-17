import React, { useState } from 'react';
import './CSS/FidelityScore.css';

const FidelityScore = ({ messages, videoDuration, currentTime }) => {
  const [selectedStrategy, setSelectedStrategy] = useState("Modeling");

  const filteredMessages = messages.filter(
    (message) => message.strategy === selectedStrategy
  );

  const segments = [];

  if (filteredMessages.length > 0 && filteredMessages[0].timestamp > 0) {
    segments.push({
      score: 'green',
      startPercentage: 0,
      widthPercentage: videoDuration ? (filteredMessages[0].timestamp / videoDuration) * 100 : 0,
    });
  }

  filteredMessages.forEach((message, index) => {
    const start = message.timestamp;
    const end = index === filteredMessages.length - 1 ? videoDuration : filteredMessages[index + 1].timestamp;
    const startPercentage = videoDuration ? (start / videoDuration) * 100 : 0;
    const widthPercentage = videoDuration ? ((end - start) / videoDuration) * 100 : 0;

    segments.push({
      score: message.fidelityScore,
      startPercentage,
      widthPercentage,
    });
  });

  const cursorPosition = videoDuration ? (currentTime / videoDuration) * 100 : 0;

  const scaleMarkers = [];
  for (let i = 0; i <= Math.floor(videoDuration / 60); i++) {
    const timeInSeconds = i * 60;
    const position = (timeInSeconds / videoDuration) * 100;
    scaleMarkers.push({ time: timeInSeconds, position });
  }

  return (
    <div className="fidelity-score-container">
      <h2>Fidelity Score</h2>
      <div className="strategy-dropdown">
        <label>Choose Strategy:</label>
        <select onChange={(e) => setSelectedStrategy(e.target.value)} value={selectedStrategy}>
          <option value="Modeling">Modeling</option>
          <option value="Mand-Modeling">Mand-Modeling</option>
          <option value="Time Delay">Time Delay</option>
        </select>
      </div>
      <div className="fidelity-score-bar">
        {segments.map((segment, index) => (
          <div
            key={index}
            className={`fidelity-segment fidelity-score-${segment.score}`}
            style={{
              width: `${segment.widthPercentage}%`,
              left: `${segment.startPercentage}%`,
              position: 'absolute',
            }}
          />
        ))}
        <div className="video-cursor" style={{ left: `${cursorPosition}%` }}></div>
      </div>
      <div className="scale-marker-container">
        {scaleMarkers.map((marker, index) => (
          <div key={index} className="scale-marker" style={{ left: `${marker.position}%` }}>
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

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}`;
};

export default FidelityScore;
