import React from "react";
import "./CSS/MyProgress.css";

const MyProgress = () => {
  return (
    <div className="my-progress-container">
      {}
      <div className="progress-header">
        <span className="blue-dot" />
        <h2>My Progress</h2>
      </div>

      {}
      <div className="green-divider" />

      {}
      <div className="chart-wrapper">
        <p>Placeholder for progress chart</p>
      </div>
    </div>
  );
};

export default MyProgress;
