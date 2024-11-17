import React, { useState, useEffect, useRef } from 'react';
import './CSS/ProcessDiagram.css';

const ProcessDiagram = ({ videoTime }) => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [highlightPosition, setHighlightPosition] = useState({ top: '6%', left: '40%' });
  const [currentStep, setCurrentStep] = useState(null);
  const [isStepCorrect, setIsStepCorrect] = useState(null);
  const [stepsTimeline, setStepsTimeline] = useState([]);
  const [relativePositions, setRelativePositions] = useState({});
  const imageRef = useRef(null);

  useEffect(() => {
    const fetchStepsTimeline = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/steps-timeline');
        if (!response.ok) {
          throw new Error('Failed to fetch steps timeline');
        }
        const data = await response.json();
        setStepsTimeline(data);
      } catch (error) {
        console.error('Error fetching steps timeline:', error);
      }
    };

    fetchStepsTimeline();
  }, []);

  useEffect(() => {
    const fetchRelativePositions = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/relative-positions');
        if (!response.ok) {
          throw new Error('Failed to fetch relative positions');
        }
        const data = await response.json();
        setRelativePositions(data);
      } catch (error) {
        console.error('Error fetching relative positions:', error);
      }
    };

    fetchRelativePositions();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await fetch('http://localhost:5000/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload image');
        }

        const { imageUrl } = await response.json();
        setUploadedImage(imageUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

  useEffect(() => {
    if (!imageRef.current || !currentStep) return;

    const stepPosition = relativePositions[currentStep] || { top: '6%', left: '40%' };
    setHighlightPosition(stepPosition);
  }, [currentStep, relativePositions]);

  useEffect(() => {
    const lastStepInTime = stepsTimeline.filter((step) => step.timestamp <= videoTime).pop();

    if (lastStepInTime) {
      setCurrentStep(lastStepInTime.step);
      setIsStepCorrect(lastStepInTime.isCorrect);
    } else {
      setCurrentStep(null);
      setIsStepCorrect(null);
    }
  }, [videoTime, stepsTimeline]);

  return (
    <div className={`process-diagram-container ${uploadedImage ? 'uploaded' : ''}`}>
      <h2>Process Diagram</h2>

      <div className="upload-section">
        <input type="file" accept="image/*" onChange={handleImageUpload} />
      </div>

      {uploadedImage && (
        <div className="process-illustration-container">
          <div className="image-wrapper">
            <img
              src={uploadedImage}
              alt="Process Diagram"
              className="process-diagram"
              ref={imageRef}
            />
            {currentStep !== null && (
              <div
                className={`pulsating-circle ${isStepCorrect ? 'correct' : 'error'}`}
                style={{
                  top: highlightPosition.top,
                  left: highlightPosition.left,
                }}
              ></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessDiagram;
