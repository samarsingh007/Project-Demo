import React, { useEffect, useState } from 'react';
import './CSS/TranscriptionWindow.css';

const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const TranscriptionWindow = ({ videoId, videoTime }) => {
  const [activeTranscription, setActiveTranscription] = useState("No transcription available");

  useEffect(() => {
    if (videoId && videoTime >= 0) {
      const fetchTranscriptions = async () => {
        try {
          const response = await fetch(
            `${REACT_APP_API_BASE_URL}/api/transcriptions/${videoId}?videoTime=${videoTime}`
          );
          if (!response.ok) {
            throw new Error('Failed to fetch transcriptions');
          }

          const data = await response.json();

          if (data.status === "processing") {
            setActiveTranscription("Transcription is being processed...");
          } else if (data.length > 0) {
            setActiveTranscription(data[data.length - 1].text);
          }
        } catch (error) {
          console.error('Error fetching transcriptions:', error);
        }
      };

      fetchTranscriptions();
    }
  }, [videoId, videoTime]);

  return (
    <div className="transcription-window">
      <div className="transcription-header">
        <h2>Transcriptions</h2>
      </div>
      <p>{activeTranscription}</p>
    </div>
  );
};

export default TranscriptionWindow;
