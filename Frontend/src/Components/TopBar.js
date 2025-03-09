import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import "./CSS/TopBar.css";
import QuestionIcon from "../Assets/question.svg";
import BellIcon from "../Assets/bell.svg";
import UserAvatar from "../Assets/user-avatar.svg";
import ArrowDown from "../Assets/arrow-down.svg";

const TopBar = ({ profile }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login"); // Redirect to login page
  };

  // Fallbacks if profile is null:
  const userName = profile?.name || "Guest User";
  const userLocation = profile?.location || "Unknown";
  const userEmail = profile?.email || "No Email Found"; // Must ensure your `profiles` table has an "email" column

  return (
    <div className="topbar-container">
      {/* Notification Section */}
      <div className="notification-section">
        <div className="icon-container">
          <img src={QuestionIcon} alt="Help" className="topbar-icon" />
        </div>
        <div className="icon-container notification">
          <img src={BellIcon} alt="Notifications" className="topbar-icon" />
          <span className="notification-dot" />
        </div>
      </div>

      {/* Profile Section */}
      <div
        className="profile-section"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <div className="user-info">
          <div className="user-name">{userName}</div>
          <div className="user-location">{userLocation}</div>
        </div>
        <img src={UserAvatar} alt="User Avatar" className="user-avatar" />
        <img
          src={ArrowDown}
          alt="Arrow Down"
          className={`arrow-down ${dropdownOpen ? "open" : ""}`}
        />
      </div>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-item email-text">{userEmail}</div>
          <button className="dropdown-item" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default TopBar;
