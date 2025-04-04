import React, { useEffect, useState } from "react";
import axios from "axios";
import "./TrainingHistory.css";
import dropdownIcon from "../../Assets/arrow-down.svg";
import { io } from "socket.io-client";

const TrainingHistory = ({ userId, isMobile, onBack, showAnalysisView, setShowAnalysisView }) => {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [analysisDetails, setAnalysisDetails] = useState([]);
  const [expandedDates, setExpandedDates] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user sessions initially
  useEffect(() => {
    if (!userId) return;
    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/api/sessions/${userId}`)
      .then((res) => {setSessions(res.data); 
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching sessions", err);
        setIsLoading(false);
      });
  }, [userId]);

  // Render the final summary from the DB
  const renderAnalysisSummary = () => {
    if (!selectedSessionId) {
      return (
        <div className="analysis-summary">
          <div className="title-with-dot">
            <span className="orange-dot" />
            <h2>Training Summary</h2>
          </div>
          <div className="orange-divider" />
          <div className="empty-message">
            <p>Please select a session to view its analysis summary.</p>
          </div>
        </div>
      );
    }

    // If we do have a session
    return (
      <div className="analysis-summary">
        <div className="title-with-dot">
          <span className="orange-dot" />
          <h2>Training Summary</h2>
        </div>
        <div className="orange-divider" />
        {typeof analysisDetails?.summary !== "object" ||
        analysisDetails.summary === null ? (
          <div className="empty-message">
            <p>⚠️ No analysis summary found for this session.</p>
          </div>
        ) : (
          <div className="structured-summary">
            <h4 className="summary-section-title">AI Feedback</h4>
            <p className="summary-paragraph">
            {analysisDetails.summary.feedback
            .split(/\n{1,2}/)
            .filter(Boolean)
            .map((para, idx) => (
              <p key={idx} className="summary-paragraph">{para.trim()}</p>
            ))}
            </p>

            <h4 className="summary-section-title">Self-Reflection Q&A</h4>
            <ul className="summary-bullet-list">
              {analysisDetails.summary.chatTranscript?.map((entry, idx) => (
                <li key={idx}>
                  <strong>{entry.role === "assistant" ? "Q" : "A"}:</strong> {entry.message}
                </li>
              ))}
            </ul>

            <h4 className="summary-section-title">Reflection Summary</h4>
            <p className="summary-paragraph">
              {analysisDetails.summary.chatSummary}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Called when user clicks a session
  const handleSessionClick = (sessionId) => {
    setSelectedSessionId(sessionId);
    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/api/analysis-details/${sessionId}`)
      .then((res) => {
        let data = res.data;
        // Possibly parse the stored summary if it's a string
        if (typeof data.summary === "string") {
          try {
            data.summary = JSON.parse(data.summary);
          } catch (err) {
            console.error("Failed to parse summary JSON:", err);
          }
        }
        setAnalysisDetails(data);
        if (isMobile) {
          setShowAnalysisView(true);
        }
      })
      .catch((err) => console.error("Error fetching analysis", err));
  };

  // Listen for analysis completion in real-time
  useEffect(() => {
    if (!userId) return;

    const socket = io(process.env.REACT_APP_API_BASE_URL);

    // Refresh sessions
    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/api/sessions/${userId}`)
      .then((res) => setSessions(res.data))
      .catch((err) => console.error("Error fetching sessions", err));

    socket.on("analysis_complete", (data) => {
      if (data.userId === userId) {
        // Refresh session list 
        axios
          .get(`${process.env.REACT_APP_API_BASE_URL}/api/sessions/${userId}`)
          .then((res) => setSessions(res.data))
          .catch((err) => console.error("Error refreshing sessions", err));

        // If user is viewing the session, also refresh analysis
        if (data.videoId === selectedSessionId) {
          axios
            .get(`${process.env.REACT_APP_API_BASE_URL}/api/analysis-details/${data.videoId}`)
            .then((res) => {
              let refreshedData = res.data;
              if (typeof refreshedData.summary === "string") {
                try {
                  refreshedData.summary = JSON.parse(refreshedData.summary);
                } catch (e) {
                  console.error("Error parsing refreshed summary:", e);
                }
              }
              setAnalysisDetails(refreshedData);
            })
            .catch((err) => console.error("Error refreshing analysis", err));
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, selectedSessionId]);

  // Toggle a date group open/closed
  const toggleDateGroup = (date) => {
    setExpandedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  // Group sessions by EST date
  const groupedByDate = sessions
    .filter((s) => s.status !== "processing")
    .reduce((acc, session) => {
      const estDate = new Date(session.created_at).toLocaleDateString("en-US", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      if (!acc[estDate]) acc[estDate] = [];
      acc[estDate].push(session);
      return acc;
    }, {});

  // Helper to format only the EST time
  const formatDateTime = (isoString) => {
    const options = {
      timeZone: "America/New_York",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
    return new Date(isoString).toLocaleTimeString("en-US", options) + " EST";
  };

  // Render
  if (isLoading) {
    return (
      <div className="training-container loading-state">
        <div className="loading-message">
          <div className="spinner" />
          <p>Loading your training history...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="training-container fade-in-training">
      {!isMobile || !showAnalysisView ? (
        <div className="training-sidebar">
          <h2>Your Training History</h2>
          {Object.keys(groupedByDate).length === 0 ? (
          <div className="empty-message">
            <p>📭 You haven’t uploaded any sessions yet.</p>
            <p>Once you upload a video, it’ll show up here for review.</p>
          </div>
        ) : (
          <ul className="date-group-list">
            {Object.keys(groupedByDate).map((date) => (
              <li key={date} className="date-group">
                <div 
                  className="date-toggle" 
                  onClick={() => toggleDateGroup(date)}
                >
                  <img
                    src={dropdownIcon}
                    alt="toggle"
                    className={`dropdown-arrow ${expandedDates[date] ? "" : "rotated"}`}
                  />
                  {date}
                </div>
                <div className={`session-collapse ${expandedDates[date] ? "expanded" : ""}`}>
                  {expandedDates[date] && (
                    <ul className="session-list">
                      {groupedByDate[date].map((s, index) => (
                        <li key={s.id}>
                            <button
                              className={`session-button ${s.id === selectedSessionId ? "active" : ""}`}
                              onClick={() => handleSessionClick(s.id)}
                            >
                              <div className="session-info-row">
                                <span className="session-number">{index + 1}.</span>
                                <span className="session-type">{s.is_demo ? "Demo Video" : "User Upload"}</span>
                              </div>
                              <span className="session-time">{formatDateTime(s.created_at)}</span>
                            </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    ) : null}

      {isMobile && showAnalysisView ? (
        <div className="analysis-panel">
          <button
            className="back-button-training"
            onClick={() => {
              setShowAnalysisView(false);
            }}
          >
            ← Back
          </button>
          {renderAnalysisSummary()}
        </div>
      ) : (
        // Desktop
        !isMobile && (
          <div className="analysis-panel">
            {renderAnalysisSummary()}
          </div>
        )
      )}
    </div>
  );
};

export default TrainingHistory;
