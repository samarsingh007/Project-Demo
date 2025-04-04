import React, { useState } from "react";
import Sidebar from "./SideBar";
import TopBar from "./TopBar";
import HomePage from ".//Current Training/HomePage";
import TrainingHistory from "./Training History/TrainingHistory";
import DiagramLibrary from "./Diagram Library/DiagramLibrary";
import "./CSS/MainContainer.css";
import MainContainerMobile from "./MainContainerMobile";

const MainContainer = ({ onAppReload, userId, profile, setShowNameModal, isGuest, isMobile, refreshTrigger }) => {
  const [selectedPage, setSelectedPage] = useState("currentTraining");
  if (isMobile) {
    return (
      <MainContainerMobile
        userId = {userId}
        onAppReload={onAppReload}
        profile={profile}
        setShowNameModal={setShowNameModal}
        isGuest={isGuest}
        isMobile={isMobile}
        refreshTrigger={refreshTrigger}
      />
    );
  }

  return (
    <div className="main-wrapper">
      <Sidebar selectedPage={selectedPage} setSelectedPage={setSelectedPage} />
      <div className="content-container">
        <TopBar profile={profile} setShowNameModal={setShowNameModal}/>
        <div
          style={{
            display: selectedPage === "currentTraining" ? "block" : "none",
          }}
        >
          <HomePage onAppReload={onAppReload} profile={profile} isGuest={isGuest} refreshTrigger={refreshTrigger}/>
        </div>
        <div
          style={{
            display: selectedPage === "trainingHistory" ? "block" : "none",
          }}
        >
          <TrainingHistory userId = {userId}/>
        </div>
        <div
          style={{
            display: selectedPage === "diagramLibrary" ? "block" : "none",
          }}
        >
          <DiagramLibrary />
        </div>
      </div>
    </div>
  );
};

export default MainContainer;
