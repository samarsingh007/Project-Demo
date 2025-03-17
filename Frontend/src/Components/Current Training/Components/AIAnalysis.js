import React, { useEffect, useState } from "react";
import "./CSS/AIAnalysis.css";

const AIAnalysis = ({ analysisResults, videoId, seekToTime }) => {
  const [overallScore, setOverallScore] = useState(0);

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

  return (
    <div className="ai-analysis-section">
      <div className="ai-header">
        <h3>AI Analysis Results</h3>
        <span className="overall-score">Overall Score: {overallScore}</span>
      </div>
      <div
        className="ai-table-container"
        style={{
          minHeight: "60px",
          height: `${analysisResults.length * 45}px`,
          maxHeight: "300px",
        }}
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
              {analysisResults.map((result, index) => (
                <tr key={index} className="fade-in">
                  <td
                    className="timestamp-button"
                    onClick={() =>
                      handleSeek(result["Begin-End"].split("-")[0])
                    }
                  >
                    {result["Begin-End"].split("-")[0]}
                  </td>
                  <td style={{ fontWeight: "bold" }}>
                    {result["Fidelity Score"]}
                  </td>
                  <td>{result["AI Reasoning"]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AIAnalysis;
