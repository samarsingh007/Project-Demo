import React, { useState, useEffect } from "react";
import "./CSS/HighlightsTimeline.css";

const HighlightsTimeline = ({
  videoId,
  videoDuration,
  seekToTime,
  analysisResults,
}) => {
  const [fidelityMessages, setFidelityMessages] = useState([]);

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

  useEffect(() => {
    if (analysisResults.length === 0) return;

    const filtered = analysisResults.filter((item) => {
      return item["Begin-End"];
    });

    setFidelityMessages(filtered);
  }, [analysisResults, videoId, videoDuration]);

  return (
    <div className="highlights-timeline-container">
      <div className="timeline">
        <div className="timeline-bar"></div>

        {fidelityMessages.map((msg, index) => {
          const [beginStr] = msg["Begin-End"].split("-");

          const beginSeconds = parseTime(beginStr);

          const position = (beginSeconds / videoDuration) * 100;

          return (
            <div
              key={index}
              className="timeline-marker"
              style={{ left: `${position}%` }}
              onClick={() => seekToTime(beginSeconds)}
              title={`Go to ${formatTime(beginSeconds)}`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default HighlightsTimeline;
