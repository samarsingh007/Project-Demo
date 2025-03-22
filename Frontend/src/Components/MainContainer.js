import React, { useState } from "react";
import Sidebar from "./SideBar";
import TopBar from "./TopBar";
import HomePage from ".//Current Training/HomePage";
import TrainingHistory from "./Training History/TrainingHistory";
import DiagramLibrary from "./Diagram Library/DiagramLibrary";
import "./CSS/MainContainer.css";
import HomePageMobile from "./HomePageMobile";

const MainContainer = ({ profile, setShowNameModal, isGuest, isMobile }) => {
  const [selectedPage, setSelectedPage] = useState("currentTraining");
  if (isMobile) {
    return (
      <HomePageMobile
        profile={profile}
        setShowNameModal={setShowNameModal}
        isGuest={isGuest}
        isMobile={isMobile}
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
          <HomePage profile={profile} isGuest={isGuest}/>
        </div>
        <div
          style={{
            display: selectedPage === "trainingHistory" ? "block" : "none",
          }}
        >
          <TrainingHistory />
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
