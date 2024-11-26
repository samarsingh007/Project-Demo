import React, { useState, useEffect } from 'react';
import './CSS/ProcessDiagram.css';

const ProcessDiagram = ({ videoTime }) => {
  const [highlightPosition, setHighlightPosition] = useState({ top: '6%', left: '40%' });
  const [currentStep, setCurrentStep] = useState(null);
  const [isStepCorrect, setIsStepCorrect] = useState(null);
  const [stepsTimeline, setStepsTimeline] = useState([]);
  const [dagImageUrl, setDagImageUrl] = useState('');
  const [relativePositions, setRelativePositions] = useState({});
  const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchStepsTimeline = async () => {
      try {
        const response = await fetch(`${REACT_APP_API_BASE_URL}/api/steps-timeline`);
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
  }, [REACT_APP_API_BASE_URL]);

  useEffect(() => {
    const fetchRelativePositions = async () => {
      try {
        const response = await fetch(`${REACT_APP_API_BASE_URL}/api/relative-positions`);
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
  }, [REACT_APP_API_BASE_URL]);

  useEffect(() => {
    const fetchDagImage = async () => {
      try {
        const response = await fetch(`${REACT_APP_API_BASE_URL}/generate-dag`);
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
  }, [REACT_APP_API_BASE_URL]);

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
