import React, { useState } from "react";
import supabase from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "./CSS/AuthPage.css";
import logo from "../Assets/Logo.svg";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    setError("");
    setMessage("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill in both fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error("Reset password error:", error.message);
        setError(error.message);
      } else {
        setMessage("Password updated successfully! Please log in again.");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="logo-container">
        <img src={logo} alt="Robot Logo" className="logo" />
      </div>
      <div className="wave-background">
        <svg
          id="svg"
          viewBox="0 0 1440 690"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition duration-300 ease-in-out delay-150"
        >
          <path
            d="M 0,700 L 0,131 C 92.92307692307693,156.84358974358975 185.84615384615387,182.6871794871795 266,190 C 346.15384615384613,197.3128205128205 413.53846153846155,186.09487179487178 474,168 C 534.4615384615385,149.90512820512822 588,124.93333333333334 684,132 C 780,139.06666666666666 918.4615384615383,178.17179487179484 1000,174 C 1081.5384615384617,169.82820512820516 1106.1538461538462,122.37948717948717 1170,108 C 1233.8461538461538,93.62051282051283 1336.923076923077,112.31025641025641 1440,131 L 1440,700 L 0,700 Z"
            stroke="none"
            strokeWidth="0"
            fill="#5030e5"
            fillOpacity="0.1"
            className="transition-all duration-300 ease-in-out delay-150 path-0"
          ></path>
          <path
            d="M 0,700 L 0,306 C 86.29743589743589,292.38461538461536 172.59487179487178,278.7692307692307 255,267 C 337.4051282051282,255.23076923076925 415.9179487179488,245.30769230769232 496,255 C 576.0820512820512,264.6923076923077 657.7333333333332,294 734,305 C 810.2666666666668,316 881.1487179487178,308.6923076923077 962,295 C 1042.8512820512822,281.3076923076923 1133.6717948717949,261.2307692307692 1215,262 C 1296.3282051282051,262.7692307692308 1368.1641025641024,284.38461538461536 1440,306 L 1440,700 L 0,700 Z"
            stroke="none"
            strokeWidth="0"
            fill="#5030e5"
            fillOpacity="0.03"
            className="transition-all duration-300 ease-in-out delay-150 path-1"
          ></path>
          <path
            d="M 0,700 L 0,481 C 82.97179487179488,480.4384615384615 165.94358974358977,479.87692307692305 246,491 C 326.05641025641023,502.12307692307695 403.19743589743587,524.9307692307692 478,503 C 552.8025641025641,481.0692307692308 625.2666666666668,414.4 704,421 C 782.7333333333332,427.6 867.7358974358973,507.46923076923076 943,531 C 1018.2641025641027,554.5307692307692 1083.7897435897437,521.723076923077 1165,504 C 1246.2102564102563,486.276923076923 1343.105128205128,483.6384615384615 1440,481 L 1440,700 L 0,700 Z"
            stroke="none"
            strokeWidth="0"
            fill="#5030e5"
            fillOpacity="0.02"
            className="transition-all duration-300 ease-in-out delay-150 path-2"
          ></path>
        </svg>
      </div>
      <div className="auth-content">
        <h1>Parent's AI Coach (PAC)</h1>
        <div className="toggle-auth">
          <h2>Reset Your Password</h2>

          {error && <p className="error">{error}</p>}
          {message && <p className="message">{message}</p>}

          <input
            className="input-box"
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
          />
          <input
            className="input-box"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
          />
          <div className="login-button">
            <button onClick={handleResetPassword}>Update Password</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
