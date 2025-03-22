import React, { useState, useEffect, useRef } from "react";
import "./CSS/ProcessDiagram.css";
import ChooseIcon from "../../../Assets/Choose2.svg";
import DiagramSvg from "../../../Assets/diagram.svg";

const ProcessDiagram = ({ videoTime }) => {
  const [highlightPosition, setHighlightPosition] = useState({
    top: "6%",
    left: "40%",
  });
  const [currentStep, setCurrentStep] = useState(null);
  const [isStepCorrect, setIsStepCorrect] = useState(null);
  const [stepsTimeline, setStepsTimeline] = useState([]);
  const [relativePositions, setRelativePositions] = useState({});
  const fileInputRef = useRef(null);

  const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchStepsTimeline = async () => {
      try {
        const response = await fetch(
          `${REACT_APP_API_BASE_URL}/api/steps-timeline`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch steps timeline");
        }
        const data = await response.json();
        setStepsTimeline(data);
      } catch (error) {
        console.error("Error fetching steps timeline:", error);
      }
    };
    fetchStepsTimeline();
  }, [REACT_APP_API_BASE_URL]);

  useEffect(() => {
    const fetchRelativePositions = async () => {
      try {
        const response = await fetch(
          `${REACT_APP_API_BASE_URL}/api/relative-positions`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch relative positions");
        }
        const data = await response.json();
        setRelativePositions(data);
      } catch (error) {
        console.error("Error fetching relative positions:", error);
      }
    };
    fetchRelativePositions();
  }, [REACT_APP_API_BASE_URL]);

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

  useEffect(() => {
    if (!currentStep) return;
    const stepPosition = relativePositions[currentStep] || {
      top: "6%",
      left: "40%",
    };
    setHighlightPosition(stepPosition);
  }, [currentStep, relativePositions]);

  const handleChooseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="process-diagram-container">
      {}
      <div className="process-diagram-header">
        <div className="title-with-dot-process">
          <span className="purple-dot" />
          <h2>Process Diagram</h2>
        </div>
        <button className="choose-button-process" onClick={handleChooseClick}>
          <img
            src={ChooseIcon}
            alt="Choose Icon"
            className="choose-button-icon-process"
          />
          Choose
        </button>
      </div>

      <div className="purple-divider" />

      <div className="process-illustration-container">
        <div className="image-wrapper">
          <img
            src={DiagramSvg}
            alt="Process Diagram"
            className="process-diagram"
          />
          {currentStep !== null && (
            <div
              className={`pulsating-circle ${
                isStepCorrect ? "correct" : "error"
              }`}
              style={{
                top: highlightPosition.top,
                left: highlightPosition.left,
              }}
            ></div>
          )}
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/svg+xml"
        style={{ display: "none" }}
      />
    </div>
  );
};

export default ProcessDiagram;
