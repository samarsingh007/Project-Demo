import React, { useState, useEffect, useRef, useMemo } from 'react';
import './CSS/ProcessDiagram.css';

const ProcessDiagram = ({ videoTime }) => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [highlightPosition, setHighlightPosition] = useState({ top: '6%', left: '40%' });
  const [currentStep, setCurrentStep] = useState(null);
  const [isStepCorrect, setIsStepCorrect] = useState(null);
  const imageRef = useRef(null);

  const stepsTimeline = useMemo(() => [
    { timestamp: 88, step: 1, isCorrect: true},
    { timestamp: 96, step: 4, isCorrect: true},
    { timestamp: 100, step: null, isCorrect: true},
    { timestamp: 103, step: null, isCorrect: true},
    { timestamp: 107, step: 3, isCorrect: true},
    { timestamp: 112, step: 6, isCorrect: false},
    { timestamp: 216, step: null, isCorrect: true},
    { timestamp: 393, step: 4, isCorrect: false}
  ], []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
    }
  };

  useEffect(() => {
    if (!imageRef.current) return;

    const relativePositions = {
      1: { top: '6%', left: '40%' },
      2: { top: '18%', left: '40%' },
      3: { top: '31%', left: '40%' },
      4: { top: '44%', left: '20%' },
      5: { top: '56%', left: '20%' },
      6: { top: '44%', left: '60%' },
    };

    const stepPosition = relativePositions[currentStep] || { top: '6%', left: '40%' };
    setHighlightPosition(stepPosition);
  }, [currentStep]);

  useEffect(() => {
    const lastStepInTime = stepsTimeline
      .filter((step) => step.timestamp <= videoTime)
      .pop();

    if (lastStepInTime) {
      setCurrentStep(lastStepInTime.step);
      setIsStepCorrect(lastStepInTime.isCorrect);
    } else {
      setCurrentStep(null);
      setIsStepCorrect(null);
    }
  }, [videoTime, stepsTimeline]);

  return (
    <div className="process-diagram-container">
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
