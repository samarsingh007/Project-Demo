import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import "./CSS/TopBar.css";
import BellIcon from "../Assets/bell.svg";
import UserAvatar from "../Assets/user-avatar.svg";
import ArrowDown from "../Assets/arrow-down.svg";

const TopBar = ({ profile, setShowNameModal }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const userName = profile?.name || "Guest User";
  const userEmail = profile?.email || "No Email Found";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="topbar-container">
      <div
        className={`notification-section ${notifOpen ? "open" : ""}`}
        ref={notifRef}
      >
        <img
          src={BellIcon}
          alt="Notifications"
          className="topbar-icon"
          onClick={() => setNotifOpen(!notifOpen)}
        />
        <div className={`notification-dropdown ${notifOpen ? "open" : ""}`}>
          <h3>Welcome!</h3>
          <p>There are no new notifications.</p>
        </div>
        {/* <span className="notification-dot" /> */}
      </div>
      <div className="profile-dropdown-container" ref={dropdownRef}>
        <div
          className={`profile-section ${dropdownOpen ? "open" : ""}`}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <div className="user-name">{userName}</div>
          <img src={UserAvatar} alt="User Avatar" className="user-avatar" />
          <img
            src={ArrowDown}
            alt="Arrow Down"
            className={`arrow-down ${dropdownOpen ? "open" : ""}`}
          />
        </div>
        <div className={`dropdown-menu ${dropdownOpen ? "open" : ""}`}>
          <div className="dropdown-item email-text">{userEmail}</div>
          <button
            className="dropdown-item"
            onClick={() => {
              setShowNameModal(true);
              setDropdownOpen(false);
            }}
          >
            Edit Profile
          </button>
          <button className="dropdown-item" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
