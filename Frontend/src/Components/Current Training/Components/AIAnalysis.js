import React, { useEffect, useState } from "react";
import "./CSS/AIAnalysis.css";
import AIReasoningModal from "./AIReasoningModal";

const AIAnalysis = ({ analysisResults, videoId, seekToTime, isMobile }) => {
  const [overallScore, setOverallScore] = useState(0);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailData, setDetailData] = useState(null);

  useEffect(() => {
    if (analysisResults.length === 0) return;

    const totalScore = analysisResults.reduce(
      (sum, result) => sum + (parseInt(result["Fidelity Score"], 10) / 4) * 100,
      0
    );

    setOverallScore((totalScore / analysisResults.length).toFixed(0));
  }, [analysisResults]);

  const handleSeek = (timestamp) => {
    const [minutes, seconds] = timestamp.split(":").map(Number);
    const timeInSeconds = minutes * 60 + seconds;
    seekToTime(timeInSeconds);
  };

  const truncateText = (text, limit = 100) => {
    if (!text) return "";
    if (text.length <= limit) return text;
    return text.slice(0, limit) + "...";
  };

  const handleReadMore = (rowObj) => {
    setDetailData(rowObj);
    setShowDetailModal(true);
  };

  return (
    <div className="ai-analysis-section">
      <div className="ai-header">
        <h3>AI Analysis Results</h3>
        <span className="overall-score">Overall Score: {overallScore}</span>
      </div>
      <div
        className={`ai-table-container ${isMobile ? "mobile" : ""}`}
        style={
          !isMobile ? { height: `${analysisResults.length * 45}px` } : undefined
        }
      >
        {analysisResults.length === 0 ? (
          <p style={{ color: "#333" }}>Waiting for analysis...</p>
        ) : (
          <table className="ai-analysis-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Score</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {analysisResults.map((result, index) => {
                const time = result["Begin-End"].split("-")[0];
                const fullReasoning = result["AI Reasoning"] || "";
                const truncated = truncateText(fullReasoning, 100);

                return (
                  <tr key={index} className="fade-in">
                    <td
                      className="timestamp-button-analysis"
                      onClick={() => handleSeek(time)}
                    >
                      {time}
                    </td>
                    <td style={{ fontWeight: "bold", textAlign: "center" }}>
                      {result["Fidelity Score"]}
                    </td>
                    <td>
                      {isMobile ? (
                        <>
                          {truncated}
                          {fullReasoning.length > 100 && (
                            <button
                              className="read-more-btn"
                              onClick={() =>
                                handleReadMore({
                                  time,
                                  score: result["Fidelity Score"],
                                  reasoning: fullReasoning,
                                })
                              }
                            >
                              Read More
                            </button>
                          )}
                        </>
                      ) : (
                        fullReasoning
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {isMobile && showDetailModal && (
        <AIReasoningModal
          rowData={detailData}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
};

export default AIAnalysis;
