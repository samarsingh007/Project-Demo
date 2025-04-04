// src/Pages/AuthCallback.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "./supabaseClient";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(() => {
      // Add a slight delay if needed to wait for Supabase to settle
      setTimeout(() => {
        navigate("/Project-Demo");
      }, 300);
    });
  }, [navigate]);

  return <p style={{ padding: "2rem" }}>Signing you in...</p>;
};

export default AuthCallback;
