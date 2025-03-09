import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainContainer from "./Components/MainContainer";
import AuthPage from "./Components/AuthPage";
import supabase from "./supabaseClient";

function App() {
  const [session, setSession] = useState(undefined); // Start as `undefined` so we know we're still checking
  const [isGuest, setIsGuest] = useState(false); 
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      setLoading(true); // show loader / suspense
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session || null);
      setLoading(false);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    };

    getSession();

    // Listen for any auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session || null);
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    // Cleanup
    return () => {
      authListener.subscription?.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId) => {
    const { data: userProfile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error) {
      setProfile(userProfile);
    }
  };

  // If we're still checking if the user is logged in, show a simple loader
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* If session or isGuest, go to Project-Demo; else go to /login */}
        <Route
          path="/"
          element={
            session || isGuest ? (
              <Navigate to="/Project-Demo" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        {/* Public login route */}
        <Route path="/login" element={<AuthPage setIsGuest={setIsGuest} />} />
        {/* Private route that requires session or isGuest */}
        <Route
          path="/Project-Demo"
          element={
            session || isGuest ? (
              <MainContainer profile={profile} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
