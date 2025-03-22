import React from "react";
import "./CSS/AIReasoningModal.css";

const AIReasoningModal = ({ rowData, onClose }) => {
  if (!rowData) return null;

  const { time, score, reasoning } = rowData;

  return (
    <div className="reasoning-modal-overlay">
      <div className="reasoning-modal-content">
        <button className="close-modal-btn" onClick={onClose}>
          ✖
        </button>
        <h2>Analysis Details</h2>

        <div className="row-detail">
          <strong>Time:</strong> {time}
        </div>
        <div className="row-detail">
          <strong>Score:</strong> {score}
        </div>
        <div className="row-detail">
          <strong>Reasoning:</strong> {reasoning}
        </div>
      </div>
    </div>
  );
};

export default AIReasoningModal;
