import React, { useState, useEffect } from 'react';
import './CSS/FidelityScore.css';

const FidelityScore = ({videoDuration, currentTime }) => {
  const [messages, setMessages] = useState([]);
  const [selectedStrategy, setSelectedStrategy] = useState("Modeling");

  useEffect(() => {
    const fetchFidelityMessages = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/fidelity-messages');
        if (!response.ok) {
          throw new Error('Failed to fetch fidelity messages');
        }
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching fidelity messages:', error);
      }
    };

    fetchFidelityMessages();
  }, []);

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
            checked={selectedStrategy === "Mand-Modeling"}
            onChange={() => setSelectedStrategy("Mand-Modeling")}
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
