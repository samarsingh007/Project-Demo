import React from "react";
import "./CSS/MobileBottomBar.css";
import MessageIcon from "../Assets/message.svg";
import TaskIcon from "../Assets/task-square.svg";
import ListIcon from "../Assets/List-two.svg";
import HomeIcon from "../Assets/home.svg";

const MobileBottomBar = ({ selectedPage, setSelectedPage }) => {
  return (
    <div className="mobile-bottom-bar">
      <button
        onClick={() => setSelectedPage("chat")}
        className={selectedPage === "chat" ? "active" : ""}
      >
        <img src={MessageIcon} alt="chat" />
        <span>Chat</span>
      </button>

      <button
        onClick={() => setSelectedPage("review")}
        className={selectedPage === "review" ? "active" : ""}
      >
        <img src={TaskIcon} alt="review" />
        <span>Review</span>
      </button>

      <button
        onClick={() => setSelectedPage("diagram")}
        className={selectedPage === "diagram" ? "active" : ""}
      >
        <img src={ListIcon} alt="Diagram" />
        <span>Diagram</span>
      </button>
      <button
        onClick={() => setSelectedPage("home")}
        className={selectedPage === "home" ? "active" : "home-inactive"}
      >
        <img src={HomeIcon} alt="Home" className="home-img"/>
        <span>Home</span>
      </button>
    </div>
  );
};

export default MobileBottomBar;
