import React, { useState } from 'react';
import ProcessDiagram from './ProcessDiagram';
import VideoUpload from './VideoUpload';
import "./CSS/MainContainer.css";

const MainContainer = () => {
  const [leftWidth, setLeftWidth] = useState(30);
  const [videoTime, setVideoTime] = useState(0);

  const handleMouseDown = (e) => {
    e.preventDefault();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth > 20 && newWidth < 60) {
      setLeftWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="content-container">
      <div className="left-container" style={{ width: `${leftWidth}%` }}>
        <ProcessDiagram videoTime={videoTime} />
      </div>

      <div className="divider" onMouseDown={handleMouseDown} />

      <div className="right-container" style={{ width: `${100 - leftWidth}%` }}>
        <VideoUpload onVideoTimeUpdate={setVideoTime} />
      </div>
    </div>
  );
};

export default MainContainer;
