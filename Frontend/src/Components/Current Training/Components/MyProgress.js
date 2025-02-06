// MyProgress.jsx
import React from 'react';
import './CSS/MyProgress.css'; // Create & style your chart container

const MyProgress = () => {
  return (
    <div className="my-progress-container">
      {/* Header with dot + title */}
      <div className="progress-header">
        <span className="blue-dot" />
        <h2>My Progress</h2>
      </div>

      {/* Green divider, or any color that matches your design */}
      <div className="green-divider" />

      {/* The chart area—replace with your chart library or image */}
      <div className="chart-wrapper">
        <p>Placeholder for progress chart</p>
      </div>
    </div>
  );
};

export default MyProgress;
