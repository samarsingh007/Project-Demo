import React, { useState } from "react";
import supabase from "../supabaseClient";
import "./CSS/AuthPage.css";
import logo from "../Assets/Logo.svg";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const AuthPage = ({ setIsGuest }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showGuestWarning, setShowGuestWarning] = useState(false);
  const [name, setName] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleAuth = async () => {
    setError("");
    setMessage("");

    if (isSignUp) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        console.log("Sign-up response:", JSON.stringify(data, null, 2));

        if (error) {
          console.error("Sign-up error:", error.message);
          setError(error.message);
          return;
        }

        if (data?.user) {
          console.log("User data:", JSON.stringify(data.user, null, 2));

          if (data.user.identities && data.user.identities.length > 0) {
            console.log(
              "✅ Sign-up successful! Check your email for confirmation."
            );
            setMessage("Check your email for a confirmation link!");

            const { error: profileError } = await supabase
              .from("profiles")
              .insert([{ id: data.user.id, name, email }]);

            if (profileError) {
              console.error("Error saving profile:", profileError.message);
            }
          } else {
            console.warn(
              "⚠️ Email address is already taken. Attempting sign-in..."
            );

            const { error: signInError } =
              await supabase.auth.signInWithPassword({
                email,
                password,
              });

            if (signInError) {
              console.error("❌ Sign-in failed:", signInError.message);
              setError("Email already exists. Please try signing in.");
            } else {
              console.log("✅ Successfully signed in existing user!");
              setMessage("Welcome back! You are now signed in.");
              navigate("/Project-Demo");
            }
          }
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred. Please try again.");
      }
    } else {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setError(error.message);
        } else {
          setMessage("Login successful!");
          navigate("/Project-Demo");
        }
      } catch (err) {
        console.error("Unexpected sign-in error:", err);
        setError("An unexpected error occurred during sign-in.");
      }
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email to reset your password.");
      return;
    }

    try {
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id", { head: false })
        .eq("email", email)
        .single();

      if (!existingUser) {
        setError(
          "No account found with this email. Would you like to sign up instead?"
        );
        return;
      }

      const redirectUrl =
        window.location.hostname === "localhost"
          ? "http://localhost:3000/reset-password"
          : "https://ai4behavior.xlabub.com/reset-password";

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error("Password reset error:", error.message);
        setError(error.message);
      } else {
        setMessage("Password reset link sent! Check your email.");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  const continueWithoutSignIn = () => {
    setShowGuestWarning(true);
  };

  const proceedAsGuest = () => {
    setIsGuest(true);
    navigate("/Project-Demo");
  };

  return (
    <div className="auth-container">
      <div className="logo-container">
        <img src={logo} alt="Robot Logo" className="logo" />
      </div>
      <div className="content-wrapper">
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
      <div className="auth-card-header"> 
        <div className="auth-header">
        <h1>PAC.AI</h1>
        <h2>{isSignUp ? "Create Account" : "Welcome"}</h2>
        <p className="subtitle">
            {isSignUp 
              ? "Join our community and get started" 
              : "Sign in to continue your journey"}
          </p>
          </div>
          {/* <div className="role-selector">
          <div className="role-label">I am a:</div>
          <div className="role-options">
            <input
              type="radio"
              id="role-parent"
              name="role"
              value="parent"
              defaultChecked
            />
            <label htmlFor="role-parent">
              Parent
            </label>
            
            <input
              type="radio"
              id="role-prof"
              name="role"
              value="professional"
            />
            <label htmlFor="role-prof">
              Professional
            </label>
          </div>
        </div> */}
        </div>
        <div className="auth-card">
          <h2>{isSignUp ? "Sign Up" : "Sign In"}</h2>

          {error && <div className="alert alert-error">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          <form className="auth-form" onSubmit={e => { e.preventDefault(); if (showForgotPassword) {
                  handleForgotPassword();
                } else {
                  handleAuth();
                } }}>
          {isSignUp && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <span className="input-icon"><FaUser /></span>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon"><FaEnvelope /></span>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>
          {!showForgotPassword && (
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon"><FaLock /></span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  required
                />
                <button 
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
            </div>
          )}
          <div className="action-buttons">
            <button type="submit" className="primary-button">
              {showForgotPassword 
                ? "Reset Password" 
                : isSignUp 
                  ? "Create Account" 
                  : "Sign In"}
            </button>
            
            <button 
              type="button"
              className="guest-button" 
              onClick={continueWithoutSignIn}
            >
              Continue as Guest
            </button>
          </div>
        </form>

        {/* Secondary Actions */}
        <div className="auth-footer">
          {!isSignUp && !showForgotPassword && (
            <button 
              type="button"
              className="text-button"
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot your password?
            </button>
          )}
          
          {showForgotPassword && (
            <button 
              type="button"
              className="text-button"
              onClick={() => setShowForgotPassword(false)}
            >
              Back to Sign In
            </button>
          )}
          
          <button
            type="button"
            className="text-button switch-mode"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setShowForgotPassword(false);
            }}
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Need an account? Sign up"}
          </button>
        </div>
      </div>
      {showGuestWarning && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>⚠️ Guest Session Warning</h3>
            <p>Your data and progress will not be saved when using a guest account.</p>
            <p>Are you sure you want to continue?</p>
            <div className="modal-actions">
              <button 
                className="secondary-button"
                onClick={() => setShowGuestWarning(false)}
              >
                Cancel
              </button>
              <button 
                className="danger-button"
                onClick={proceedAsGuest}
              >
                Continue as Guest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
);
};
export default AuthPage;
