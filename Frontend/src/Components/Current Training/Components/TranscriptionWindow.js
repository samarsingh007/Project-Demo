import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./CSS/TranscriptionWindow.css";

const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const TranscriptionWindow = ({ videoId, videoTime, seekToTime }) => {
  const [allTranscriptions, setAllTranscriptions] = useState([]);
  const [activeTranscription, setActiveTranscription] = useState(null);
  const [expanded, setExpanded] = useState(false);

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
    if (!videoId) return;

    const fetchAllTranscriptions = async () => {
      try {
        const response = await fetch(
          `${REACT_APP_API_BASE_URL}/api/transcriptions/${videoId}?full=true`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch all transcriptions");
        }

        const data = await response.json();

        if (data.status === "processing") {
          setAllTranscriptions([]);
          setActiveTranscription({
            text: "Transcription is being processed...",
            start: null,
          });
        } else {
          setAllTranscriptions(data);
        }
      } catch (error) {
        console.error("Error fetching all transcriptions:", error);
      }
    };

    fetchAllTranscriptions();
  }, [videoId]);

  useEffect(() => {
    if (!allTranscriptions.length || videoTime < 0) return;

    const sorted = [...allTranscriptions].sort(
      (a, b) => parseTime(a.start) - parseTime(b.start)
    );

    let active = null;
    for (const snippet of sorted) {
      if (parseTime(snippet.start) <= videoTime) {
        active = snippet;
      } else {
        break;
      }
    }

    if (active) {
      setActiveTranscription({
        text: active.text,
        start: active.start,
      });
    } else {
      setActiveTranscription(null);
    }
  }, [allTranscriptions, videoTime]);

  useEffect(() => {
    if (!videoId) return;
    const socket = io(REACT_APP_API_BASE_URL);

    socket.on("transcription_updated", (data) => {
      if (data.videoId === videoId) {
        setAllTranscriptions((prev) => [
          ...prev,
          { start: data.start, end: data.end, text: data.text },
        ]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [videoId]);

  return (
    <div className={`transcription-window ${expanded ? "expanded" : ""}`}>
      <div className="transcription-header">
        <h2>Transcriptions</h2>
        {!allTranscriptions.length ? null : (
          <button
            className="view-full-btn"
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? "View Less" : "View Full"}
          </button>
        )}
      </div>

      {expanded ? (
        allTranscriptions.length > 0 ? (
          allTranscriptions.map((trans, index) => (
            <p key={index}>
              <button
                className="timestamp-button"
                onClick={() => seekToTime(parseTime(trans.start))}
              >
                {formatTime(parseTime(trans.start))}
              </button>
              {trans.text}
            </p>
          ))
        ) : (
          <p>Transcription is being processed...</p>
        )
      ) : (
        <>
          {activeTranscription ? (
            <p>
              {activeTranscription.start && (
                <button
                  className="timestamp-button"
                  onClick={() =>
                    seekToTime(parseTime(activeTranscription.start))
                  }
                >
                  {formatTime(parseTime(activeTranscription.start))}
                </button>
              )}
              {activeTranscription.text}
            </p>
          ) : (
            <p>No transcription available at this time</p>
          )}
        </>
      )}
    </div>
  );
};

export default TranscriptionWindow;
