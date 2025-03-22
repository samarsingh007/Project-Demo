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
import ResetPassword from "./Components/ResetPassword";
import NameInputModal from "./Components/NameInputModal"

function App() {
  const [session, setSession] = useState(undefined);
  const [isGuest, setIsGuest] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNameModal, setShowNameModal] = useState(false);
  const [parentName, setParentName] = useState("");
  const [childName, setChildName] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
        if (!userProfile?.parent_name || !userProfile?.child_name) {
          setShowNameModal(true);
        }
      }
  };
  useEffect(() => {
    if (isGuest && (!parentName || !childName)) {
      setShowNameModal(true);
    }
  }, [isGuest, parentName, childName]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      {showNameModal && (
        <NameInputModal
          userId={session?.user?.id}
          setProfile={setProfile}
          setShowNameModal={setShowNameModal}
          setParentName={setParentName}
          setChildName={setChildName}
          isGuest={isGuest}
          profile={profile}
        />
      )}
      <Routes>
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
        <Route path="/login" element={<AuthPage setIsGuest={setIsGuest} />} />
        <Route
          path="/Project-Demo"
          element={
            session || isGuest ? (
              <MainContainer profile={profile} setShowNameModal={setShowNameModal} isGuest={isGuest} isMobile={isMobile}/>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;
