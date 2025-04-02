import React from "react";
import "./CSS/MyProgress.css";
import Chart from "../../../Assets/Chart.png"

const MyProgress = () => {
  return (
    <div className="my-progress-container">
      <div className="progress-header">
        <span className="blue-dot" />
        <h2>My Progress</h2>
      </div>
      <div className="green-divider" />
      <div className="chart-wrapper">
      <img src={Chart} alt="Progress Chart" className="progress-chart" />
      </div>
    </div>
  );
};

export default MyProgress;
