import React from "react";
import "./CSS/TopBar.css";
import QuestionIcon from "../Assets/question.svg"; // example icons
import BellIcon from "../Assets/bell.svg";
import UserAvatar from "../Assets/user-avatar.svg"; // user profile image
import ArrowDown from "../Assets/arrow-down.svg";

const TopBar = () => {
  return (
    <div className="topbar-container">
      <div className="notification-section">
        <div className="icon-container">
          <img src={QuestionIcon} alt="Help" className="topbar-icon" />
        </div>
        <div className="icon-container notification">
          <img src={BellIcon} alt="Notifications" className="topbar-icon" />
          <span className="notification-dot" />
        </div>
      </div>

      <div className="profile-section">
        <div className="user-info">
          <div className="user-name">Samar Singh</div>
          <div className="user-location">Buffalo, NY</div>
        </div>
        <img src={UserAvatar} alt="User Avatar" className="user-avatar" />
        <img src={ArrowDown} alt="Arrow Down" className="arrow-down" />
      </div>
    </div>
  );
};

export default TopBar;
