import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import TrainingHistory from "./Training History/TrainingHistory";
import MyProgressPlot from "./Current Training/Components/MyProgress"; // adjust path if needed
import "./CSS/MobileHomeDashboard.css";

const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const MobileHomeDashboard = ({ userId, isMobile }) => {
    const [viewHistory, setViewHistory] = useState(false);
    const [totalSessions, setTotalSessions] = useState(0);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        if (viewHistory && scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, [viewHistory]);      
  
    // Fetch user sessions to get total count
    useEffect(() => {
      if (!userId) return;
      axios
        .get(`${REACT_APP_API_BASE_URL}/api/sessions/${userId}`)
        .then((res) => {
          setTotalSessions(res.data.length);
        })
        .catch((err) => console.error("Error fetching session count:", err));
    }, [userId]);
  
    // If user clicked to see history
    if (viewHistory) {
      return (
        <div className="mobile-dashboard-wrapper" ref={scrollContainerRef}>
          <button className="back-button" onClick={() => setViewHistory(false)}>
            ← Back
          </button>
          <TrainingHistory userId={userId} isMobile={isMobile} />
        </div>
      );
    }
  
    // Default landing view
    return (
      <div className="mobile-dashboard-wrapper" ref={scrollContainerRef}>
        {/* Greeting / Intro Section */}
        <div className="greeting-section">
        <h2 className="greeting-title">Welcome Back!</h2>
        <p className="greeting-subtitle">Let’s reflect, improve, and grow — one session at a time.</p>
        </div>
  
        <div className="intro-message">
          <p>
          Review your parent-child interaction videos, reflect meaningfully, and get AI-powered insights to guide your next steps.
          </p>
        </div>
  
        {/* Plot Card */}
        <div className="card plot-card">
          <MyProgressPlot userId={userId} />
        </div>
        <div className="stats-section">
          <div className="stat-card">
            <h3 className="section-title">Total Sessions</h3>
            <p>{totalSessions}</p>
            <div className="history-entry">
          <h3 className="section-title">View Past Sessions</h3>
          <button
            className="history-button"
            onClick={() => setViewHistory(true)}
          >
            Open Training History →
          </button>
        </div>
          </div>
        </div>
      </div>
      
    );
  };
  
  export default MobileHomeDashboard;