import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import UserAvatar from "../Assets/user-avatar.svg";
import Menu from "../Assets/menu.svg"
import "./CSS/MobileHomeHeader.css";
import { FaUserEdit, FaSignOutAlt, FaArrowLeft } from "react-icons/fa";

const MobileHomeHeader = ({ profile, setShowNameModal }) => {
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const userName = profile?.name || "Guest User";
  const userFirstName = (profile?.name || "").split(' ')[0];
  const userEmail = profile?.email || "No Email Found";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return settingsOpen ? (
    <div className="settings-page fade-in-settings">
        <button className="back-button-settings" onClick={() => setSettingsOpen(false)}>
          <FaArrowLeft className="back-icon" />
          Back
        </button>
      <div className="settings-header">
          <h2 className="settings-title">Settings</h2>
        </div>

        <div className="profile-avatar-section">
          <div className="avatar-circle">
            <img
              src={UserAvatar}
              alt="User Avatar"
              className="settings-avatar"
            />
          </div>
          
          <div className="profile-details">
          <div className="user-name">{userName}</div>
          <div className="user-email">{userEmail}</div>
        </div>
        </div>

        <div className="settings-section">         
        <div className="settings-item" onClick={() => { setShowNameModal(true); setSettingsOpen(false); }}>
        <div className="item-icon"><FaUserEdit /></div>
        <div className="item-text">Edit Profile</div>
        </div>

        <div className="settings-item" onClick={handleSignOut}>
        <div className="item-icon"><FaSignOutAlt /></div>
        <div className="item-text">Sign Out</div>
      </div>
        </div>
      </div>
    ) : (
    <div className="simple-header" onClick={() => setSettingsOpen(true)}>
      <div className="user-greeting">
        <div className="avatar-container">
          <img
            src={UserAvatar}
            alt="User Avatar"
            className="greeting-avatar"
          />
        </div>
        <div className="greeting-text">
          <h2 className="greeting-heading">Hey {userFirstName}!</h2>
          <p className="greeting-subtext">Welcome to PAC.AI</p>
        </div>
      </div>
      <button className="menu-button">
      <img src={Menu} alt="Menu" className="menu-icon" />
      </button>
      </div>
  );
};

export default MobileHomeHeader;