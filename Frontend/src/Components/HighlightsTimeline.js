import React, { useState, useEffect } from 'react';
import './CSS/HighlightsTimeline.css';

const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const HighlightsTimeline = ({ videoId, videoDuration, seekToTime }) => {
  const [fidelityMessages, setFidelityMessages] = useState([]);

  useEffect(() => {
    if (!videoId || !videoDuration) return;

    const fetchFidelityMessages = async () => {
      try {
        const response = await fetch(`${REACT_APP_API_BASE_URL}/api/fidelity-messages`);
        if (!response.ok) {
          throw new Error('Failed to fetch fidelity messages');
        }
        const data = await response.json();
        setFidelityMessages(data);
      } catch (error) {
        console.error('Error fetching fidelity messages:', error);
      }
    };

    fetchFidelityMessages();
  }, [videoId, videoDuration]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
  };

  return (
    <div className="highlights-timeline-container">
      <div className="timeline">
        <div className="timeline-bar"></div>
        {fidelityMessages.map((msg, index) => {
          const { timestamp } = msg;
          const position = (timestamp / videoDuration) * 100;
          return (
            <div
              key={index}
              className="timeline-marker"
              style={{ left: `${position}%` }}
              onClick={() => seekToTime(timestamp)}
              title={`Go to ${formatTime(timestamp)}`}
            >
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HighlightsTimeline;
