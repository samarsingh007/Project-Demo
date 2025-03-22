import React from "react";
import "./CSS/TranscriptionModalMobile.css";

const TranscriptionModal = ({
  allTranscriptions,
  onClose,
  parseTime,
  formatTime,
  seekToTime,
}) => {
  return (
    <div className="transcription-modal-overlay">
      <div className="transcription-modal-content">
        <button className="close-modal-btn" onClick={onClose}>
          ✖
        </button>
        <h2>Full Transcription</h2>
        {allTranscriptions.length > 0 ? (
          allTranscriptions.map((trans, index) => (
            <p key={index}>
              <button
                className="timestamp-button-modal"
                onClick={() => {
                  seekToTime(parseTime(trans.start));
                  onClose();
                }}
              >
                {formatTime(parseTime(trans.start))}
              </button>
              {trans.text}
            </p>
          ))
        ) : (
          <p>Transcription is being processed...</p>
        )}
      </div>
    </div>
  );
};

export default TranscriptionModal;
