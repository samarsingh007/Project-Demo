import React, { useState } from "react";
import "./CSS/SideBar.css";
import MainLogo from "../Assets/main-logo.svg";
import Hide from "../Assets/Hide.svg";
import Show from "../Assets/Show.svg";
import Message from "../Assets/message.svg";
import List from "../Assets/List-two.svg";
import Task from "../Assets/task-square.svg";

const Sidebar = ({ selectedPage, setSelectedPage }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`sidebar-container ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="brand">
          <span className="brand-logo">
            <img src={MainLogo} alt="Logo" className="logo-img" />
          </span>
          {!isCollapsed && <span className="brand-text">ParentCoach.AI</span>}
        </div>

        <button className="collapse-btn" onClick={toggleSidebar}>
          {isCollapsed ? (
            <img src={Show} alt="Show" />
          ) : (
            <img src={Hide} alt="Hide" />
          )}
        </button>
      </div>

      <nav className="menu-items">
        <ul>
          <li
            onClick={() => setSelectedPage("currentTraining")}
            className={selectedPage === "currentTraining" ? "active" : ""}
          >
            <img src={Message} alt="Message" />
            {!isCollapsed && <span className="label">Current Training</span>}
          </li>

          <li
            onClick={() => setSelectedPage("trainingHistory")}
            className={selectedPage === "trainingHistory" ? "active" : ""}
          >
            <img src={Task} alt="Task" />
            {!isCollapsed && <span className="label">Training History</span>}
          </li>

          <li
            onClick={() => setSelectedPage("diagramLibrary")}
            className={selectedPage === "diagramLibrary" ? "active" : ""}
          >
            <img src={List} alt="List" />
            {!isCollapsed && <span className="label">Diagram Library</span>}
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
