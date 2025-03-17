import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import MainContainer from "./Components/MainContainer";
import AuthPage from "./Components/AuthPage";
import supabase from "./supabaseClient";

function App() {
  const [session, setSession] = useState(undefined);
  const [isGuest, setIsGuest] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      setLoading(true);
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {}
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
        {}
        <Route path="/login" element={<AuthPage setIsGuest={setIsGuest} />} />
        {}
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
