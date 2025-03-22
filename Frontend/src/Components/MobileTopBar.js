import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import BellIcon from "../Assets/bell.svg";
import UserAvatar from "../Assets/user-avatar.svg";
import ArrowDown from "../Assets/arrow-down.svg";
import "./CSS/MobileTopBar.css";

const MobileTopBar = ({ profile, setShowNameModal }) => {
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };
  const userName = profile?.name || "Guest User";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }

      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userEmail = profile?.email || "No Email Found";

  return (
    <div className="mobile-topbar">
      {}
      <div className={`left-section`} ref={notifRef}>
        <img
          src={BellIcon}
          alt="Notifications"
          className={`notification-icon-mobile  ${notifOpen ? "open" : ""}`}
          onClick={() => setNotifOpen(!notifOpen)}
        />
        <div
          className={`notification-dropdown-mobile ${notifOpen ? "open" : ""}`}
        >
          <h3>Welcome!</h3>
          <p>There are no new notifications.</p>
        </div>
        {}
      </div>

      {}
      <div className="center-section">
        <h3 className="topbar-title">PAC.AI</h3>
      </div>

      {}
      <div className="right-section" ref={dropdownRef}>
        <div
          className={`profile-icon-mobile ${dropdownOpen ? "open" : ""}`}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <img
            src={UserAvatar}
            alt="User Avatar"
            className="user-avatar-mobile"
          />
          <img
            src={ArrowDown}
            alt="Arrow Down"
            className={`arrow-down-mobile ${dropdownOpen ? "open" : ""}`}
          />
        </div>
        <div
          className={`profile-dropdown-mobile ${dropdownOpen ? "open" : ""}`}
        >
          <div className="details-container-mobile">
          <button className="dropdown-item-mobile name-email">
            {userName}
          </button>
          <button className="dropdown-item-mobile name-email">
            {userEmail}
          </button>
          </div>
          <div className="button-container-mobile">
          <button
            className="dropdown-item-mobile"
            onClick={() => {
              setShowNameModal(true);
              setDropdownOpen(false);
            }}
          >
            Edit Profile
          </button>
          <button className="dropdown-item-mobile" onClick={handleSignOut}>
            Sign Out
          </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileTopBar;
