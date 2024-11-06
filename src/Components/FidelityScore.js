import React from 'react';
import './CSS/FidelityScore.css';

const FidelityScore = ({ score }) => {
  const scorePosition = score !== null ? `${(score / 4) * 98}%` : '2%';

  return (
    <div className="fidelity-score-container">
      <h2>Fidelity Score</h2>
      <div className="score-bar">
        {score !== null ? (
          <div className="score-circle" style={{ left: scorePosition }}>
            {score}/4
          </div>
        ) : (
          <div className="score-circle" style={{ left: scorePosition }}>
            - / 4
          </div>
        )}
      </div>
    </div>
  );
};

export default FidelityScore;
