import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./CSS/TranscriptionWindow.css";

const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const TranscriptionWindow = ({ videoId, videoTime, seekToTime }) => {
  const [allTranscriptions, setAllTranscriptions] = useState([]);
  const [activeTranscription, setActiveTranscription] = useState(null);
  const [expanded, setExpanded] = useState(false);

  // Convert timestamp string (MM:SS) to seconds
  const parseTime = (timeString) => {
    const [mm, ss] = timeString.split(":").map(Number);
    return mm * 60 + ss;
  };

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${secs}`;
  };

  /**
   * 1. Fetch the entire transcription once based on videoId.
   *    (You may need a separate endpoint that returns all transcriptions
   *     for a given video, or modify your existing endpoint to allow
   *     "videoTime" to be omitted for full data.)
   */
  useEffect(() => {
    if (!videoId) return;

    const fetchAllTranscriptions = async () => {
      try {
        // Example: /api/transcriptions/:videoId/all or ?full=true
        // Make sure your backend supports returning the full transcription.
        const response = await fetch(
          `${REACT_APP_API_BASE_URL}/api/transcriptions/${videoId}?full=true`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch all transcriptions");
        }

        const data = await response.json();

        // If your backend returns { status: 'processing' } when not ready:
        if (data.status === "processing") {
          setAllTranscriptions([]);
          setActiveTranscription({
            text: "Transcription is being processed...",
            start: null,
          });
        } else {
          setAllTranscriptions(data); // store the entire transcript array
        }
      } catch (error) {
        console.error("Error fetching all transcriptions:", error);
      }
    };

    fetchAllTranscriptions();
  }, [videoId]);

  /**
   * 2. Whenever videoTime changes, find the relevant (active) snippet
   *    from allTranscriptions. We do local filtering here.
   */
  useEffect(() => {
    if (!allTranscriptions.length || videoTime < 0) return;
  
    // 1. Sort transcriptions by start time (if not already sorted)
    const sorted = [...allTranscriptions].sort(
      (a, b) => parseTime(a.start) - parseTime(b.start)
    );
  
    // 2. Find the last snippet whose start <= videoTime
    let active = null;
    for (const snippet of sorted) {
      if (parseTime(snippet.start) <= videoTime) {
        active = snippet;
      } else {
        // snippet.start is now beyond videoTime, so stop
        break;
      }
    }
  
    if (active) {
      // we found a snippet that started before or exactly videoTime
      setActiveTranscription({
        text: active.text,
        start: active.start,
      });
    } else {
      // If no snippet even starts before videoTime,
      // user might be before the first snippet’s start time
      // or no valid transcriptions at all:
      setActiveTranscription(null);
    }
  }, [allTranscriptions, videoTime]);
  

  useEffect(() => {
    if (!videoId) return;
    const socket = io(REACT_APP_API_BASE_URL);

    // When the server pushes a new piece of transcription data
    socket.on("transcription_updated", (data) => {
      // Only update if it matches our current videoId
      if (data.videoId === videoId) {
        // We can just push the new snippet to state, or refetch entirely
        setAllTranscriptions((prev) => [
          ...prev,
          { start: data.start, end: data.end, text: data.text },
        ]);
      }
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, [videoId]);

  return (
      <div
        className={`transcription-window ${expanded ? "expanded" : ""}`}
        // We’ll rely on CSS to expand to ~500px when expanded
      >
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
          /** Show ALL transcriptions in the same format when expanded */
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
          /** Collapsed view: only show the currently active snippet */
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
