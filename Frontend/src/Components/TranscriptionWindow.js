import React, { useEffect, useState } from 'react';
import './CSS/TranscriptionWindow.css';

const TranscriptionWindow = ({ videoTime }) => {
  const [activeTranscription, setActiveTranscription] = useState("No transcription available");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullTranscriptions, setFullTranscriptions] = useState([]);

  useEffect(() => {
    if (videoTime > 0) {
      const fetchTranscriptions = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/transcriptions?videoTime=${videoTime}`);
          if (!response.ok) {
            throw new Error('Failed to fetch transcriptions');
          }

          const data = await response.json();
          setFullTranscriptions(data);

          if (data.length > 0) {
            setActiveTranscription(data[data.length - 1].text);
          } else {
            setActiveTranscription("No transcription available");
          }
        } catch (error) {
          console.error('Error fetching transcriptions:', error);
          setActiveTranscription("No transcription available");
        }
      };

      fetchTranscriptions();
    } else {
      setActiveTranscription("No transcription available");
      setFullTranscriptions([]);
    }
  }, [videoTime]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="transcription-window">
      <div className="transcription-header">
        <h2>Transcriptions</h2>
        <button className="view-full-btn" onClick={openModal}>View Full</button>
      </div>
      <p>{activeTranscription}</p>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Full Transcription</h2>
            {fullTranscriptions.length > 0 ? (
              fullTranscriptions.map((t, index) => (
                <p key={index}>{t.text}</p>
              ))
            ) : (
              <p>No transcriptions available</p>
            )}
            <button className="close-modal-btn" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranscriptionWindow;
