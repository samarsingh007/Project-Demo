import React, { useEffect, useState } from "react";
import axios from "axios";
import "./TrainingHistory.css";
import dropdownIcon from "../../Assets/arrow-down.svg";
import { io } from "socket.io-client";

const TrainingHistory = ({ userId, isMobile}) => {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [analysisDetails, setAnalysisDetails] = useState([]);
  const [expandedDates, setExpandedDates] = useState({});
  const [showAnalysisView, setShowAnalysisView] = useState(false);


  useEffect(() => {
    if (!userId) return;
    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/api/sessions/${userId}`)
      .then((res) => setSessions(res.data))
      .catch((err) => console.error("Error fetching sessions", err));
  }, [userId]);

  const renderAnalysisSummary = () => (
      selectedSessionId ? (
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
              <h4 className="summary-section-title">Date</h4>
              <p className="summary-paragraph">
                {analysisDetails.summary.date}
              </p>

              <h4 className="summary-section-title">Topic</h4>
              <p className="summary-paragraph">
                {analysisDetails.summary.topic}
              </p>

              <h4 className="summary-section-title">Identified Problems</h4>
              <ul className="summary-bullet-list">
                {analysisDetails.summary.identified_problems?.map(
                  (item, idx) => (
                    <li key={idx}>{item}</li>
                  )
                )}
              </ul>

              <h4 className="summary-section-title">Suggestions</h4>
              <ul className="summary-bullet-list">
                {analysisDetails.summary.suggestions?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>

              <h4 className="summary-section-title">Key Highlights</h4>
              <ul className="summary-bullet-list">
                {analysisDetails.summary.key_highlights?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>

              <h4 className="summary-section-title">Learning Outcomes</h4>
              <ul className="summary-bullet-list">
                {analysisDetails.summary.learning_outcomes?.map(
                  (item, idx) => (
                    <li key={idx}>{item}</li>
                  )
                )}
              </ul>

              <h4 className="summary-section-title">Next Steps</h4>
              <ul className="summary-bullet-list">
                {analysisDetails.summary.next_steps?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : ( <div className="analysis-summary">
          <div className="title-with-dot">
            <span className="orange-dot" />
            <h2>Training Summary</h2>
          </div>
          <div className="orange-divider" />
          <div className="empty-message">
            <p>Please select a session to view its analysis summary.</p>
          </div>
        </div>
      )
    );

  const handleSessionClick = (sessionId) => {
    setSelectedSessionId(sessionId);
    axios
      .get(
        `${process.env.REACT_APP_API_BASE_URL}/api/analysis-details/${sessionId}`
      )
      .then((res) => {
        const data = res.data;
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

  useEffect(() => {
    if (!userId) return;

    const socket = io(process.env.REACT_APP_API_BASE_URL);

    
    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/api/sessions/${userId}`)
      .then((res) => setSessions(res.data))
      .catch((err) => console.error("Error fetching sessions", err));

    
    socket.on("analysis_complete", (data) => {
      if (data.userId === userId) {
        
        axios
          .get(`${process.env.REACT_APP_API_BASE_URL}/api/sessions/${userId}`)
          .then((res) => setSessions(res.data))
          .catch((err) => console.error("Error refreshing sessions", err));

        
        if (data.videoId === selectedSessionId) {
          axios
            .get(
              `${process.env.REACT_APP_API_BASE_URL}/api/analysis-details/${data.videoId}`
            )
            .then((res) => {
              const refreshedData = res.data;
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

  const toggleDateGroup = (date) => {
    setExpandedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  const groupedByDate = sessions
    .filter((session) => session.status !== "processing")
    .reduce((acc, session) => {
      const date = session.created_at?.split("T")[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(session);
      return acc;
    }, {});

    return (
      <div className="training-container">
        {!isMobile || !showAnalysisView ? (
          <div className="training-sidebar">
            <h2>Your Training History</h2>
            <ul className="date-group-list">
              {Object.keys(groupedByDate).map((date) => (
                <li key={date} className="date-group">
                  <button className="date-toggle" onClick={() => toggleDateGroup(date)}>
                    <img
                      src={dropdownIcon}
                      alt="toggle"
                      className={`dropdown-arrow ${expandedDates[date] ? "" : "rotated"}`}
                    />
                    {date}
                  </button>
                  <div className={`session-collapse ${expandedDates[date] ? "expanded" : ""}`}>
                    {expandedDates[date] && (
                      <ul>
                        {groupedByDate[date].map((s, index) => (
                          <li key={s.id}>
                            <button
                              className={s.id === selectedSessionId ? "active" : ""}
                              onClick={() => handleSessionClick(s.id)}
                            >
                              {index + 1}. {s.is_demo ? "Demo Video" : "User Upload"}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
    
        {isMobile && showAnalysisView ? (
          <div className="analysis-panel">
            <button className="back-button" onClick={() => setShowAnalysisView(false)}>← Back</button>
            {renderAnalysisSummary()}
          </div>
        ) : (
          !isMobile && <div className="analysis-panel">{renderAnalysisSummary()}</div>
        )}
      </div>
    );
  };    

export default TrainingHistory;
