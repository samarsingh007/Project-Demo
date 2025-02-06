import React, { useState } from 'react';
import Sidebar from './SideBar';
import TopBar from './TopBar';
import HomePage from './/Current Training/HomePage';
import TrainingHistory from './Training History/TrainingHistory';
import DiagramLibrary from './Diagram Library/DiagramLibrary';
import './CSS/MainContainer.css';

const MainContainer = () => {
  const [selectedPage, setSelectedPage] = useState('currentTraining');
  return (
    <div className="main-wrapper">
      <Sidebar selectedPage={selectedPage} setSelectedPage={setSelectedPage} />
      <div className="content-container">
        <TopBar />
        <div style={{ display: selectedPage === 'currentTraining' ? 'block' : 'none' }}>
        <HomePage />
        </div>
        <div style={{ display: selectedPage === 'trainingHistory' ? 'block' : 'none' }}>
        <TrainingHistory />
        </div>
        <div style={{ display: selectedPage === 'diagramLibrary' ? 'block' : 'none' }}>
        <DiagramLibrary />
        </div>
      </div>
    </div>
  );
};

export default MainContainer;
