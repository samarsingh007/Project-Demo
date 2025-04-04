import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import TrainingHistory from "./Training History/TrainingHistory";
import MyProgressPlot from "./Current Training/Components/MyProgress";
import MobileHomeHeader from "./MobileHomeHeader";
import "./CSS/MobileHomePage.css";

const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const MobileHomePage = ({ profile, userId, isMobile, setShowNameModal }) => {
  const [viewHistory, setViewHistory] = useState(false);
  const [totalSessions, setTotalSessions] = useState(0);
  const scrollContainerRef = useRef(null);
  const [displayedCount, setDisplayedCount] = useState(0);
  const [showAnalysisView, setShowAnalysisView] = useState(false); 

  useEffect(() => {
  let start = 0;
  const duration = 1000; // total duration of the animation in ms
  const increment = totalSessions / (duration / 16); // ~60fps
  let animationFrame;

  const animate = () => {
    start += increment;
    if (start < totalSessions) {
      setDisplayedCount(Math.floor(start));
      animationFrame = requestAnimationFrame(animate);
    } else {
      setDisplayedCount(totalSessions); // ensure final value is exact
    }
  };

  animate();
  return () => cancelAnimationFrame(animationFrame); // cleanup
}, [totalSessions]);

    
  // Scroll to top when viewing history
  useEffect(() => {
    if (viewHistory && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [viewHistory]);

  // Fetch user sessions
  useEffect(() => {
    if (!userId) return;
    axios
      .get(`${REACT_APP_API_BASE_URL}/api/sessions/${userId}`)
      .then((res) => {
        setTotalSessions(res.data.length);
      })
      .catch((err) => console.error("Error fetching session count:", err));
  }, [userId]);

  // Default landing view
  return viewHistory ? (
      <div className="mobile-dashboard-wrapper" ref={scrollContainerRef}>
      {!showAnalysisView && (
        <button className="back-button-training" onClick={() => setViewHistory(false)}>
        ← Back
      </button>
      )}
      <TrainingHistory userId={userId} isMobile={isMobile} showAnalysisView={showAnalysisView} setShowAnalysisView={setShowAnalysisView}/>
  </div>
  ) : (
    <div className="mobile-dashboard-wrapper" ref={scrollContainerRef}>
      {/* New header component */}
      <MobileHomeHeader profile={profile} setShowNameModal={setShowNameModal} />

      {/* Main content */}
      <div className="mobile-homepage">
        {/* Greeting section */}
        <div className="welcome-card">
        <p className="welcome-tagline">Reflect, improve, and grow — one session at a time.</p>
        <p className="welcome-description">
          Review your parent-child interaction videos, reflect meaningfully, and get AI-powered insights to guide your next steps.
        </p>
      </div>
        {/* Plot Card */}
        <div className="card plot-card">
          <MyProgressPlot userId={userId} />
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <div className="stat-card">
            <h3 className="section-title">Total Sessions</h3>
            <p className="stat-number">{displayedCount}</p>
          </div>
          
          <div className="history-card">
          <h3 className="section-title">Past Training</h3>
          <p className="section-description">
            View summaries and insights from your previous sessions.
          </p>
          <button
            className="history-button"
            onClick={() => setViewHistory(true)}
          >
            View History →
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default MobileHomePage;