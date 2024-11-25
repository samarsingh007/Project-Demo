import React, { useState, useEffect } from 'react';
import './CSS/ProcessDiagram.css';

const ProcessDiagram = ({ videoTime }) => {
  const [highlightPosition, setHighlightPosition] = useState({ top: '6%', left: '40%' });
  const [currentStep, setCurrentStep] = useState(null);
  const [isStepCorrect, setIsStepCorrect] = useState(null);
  const [stepsTimeline, setStepsTimeline] = useState([]);
  const [dagImageUrl, setDagImageUrl] = useState('');
  const [relativePositions, setRelativePositions] = useState({});

  // Fetch the steps timeline
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

  // Fetch the relative positions for the steps
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

  // Fetch the DAG as an image
  useEffect(() => {
    const fetchDagImage = async () => {
      try {
        const response = await fetch('http://localhost:5000/generate-dag');
        if (!response.ok) {
          throw new Error('Failed to fetch DAG image');
        }

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setDagImageUrl(imageUrl);
      } catch (error) {
        console.error('Error fetching DAG image:', error);
      }
    };

    fetchDagImage();
  }, []);

  // Determine the current step based on video time
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

  // Update the highlight position
  useEffect(() => {
    if (!currentStep) return;

    const stepPosition = relativePositions[currentStep] || { top: '6%', left: '40%' };
    setHighlightPosition(stepPosition);
  }, [currentStep, relativePositions]);

  return (
    <div className="process-diagram-container">
      <h2>Process Diagram</h2>

      <div className="process-illustration-container">
        {dagImageUrl ? (
          <div className="image-wrapper">
            <img
              src={dagImageUrl}
              alt="Process Diagram"
              className="process-diagram"
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
        ) : (
          <p>Loading process diagram...</p>
        )}
      </div>
    </div>
  );
};

export default ProcessDiagram;
