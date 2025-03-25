import React, { useState, useEffect } from "react";
import supabase from "../supabaseClient";
import "./CSS/NameInputModal.css";

const NameInputModal = ({ userId, profile, setProfile, setShowNameModal, isGuest, refreshTrigger, setRefreshTrigger }) => {
  const [parentName, setParentName] = useState("");
  const [childName, setChildName] = useState("");

  useEffect(() => {
    if (!isGuest) {
      setParentName(profile?.parent_name || "");
      setChildName(profile?.child_name || "");
    } else {
      const guestParent = sessionStorage.getItem("guest_parent_name");
      const guestChild = sessionStorage.getItem("guest_child_name");

      setParentName(guestParent || "");
      setChildName(guestChild || "");
    }
  }, [profile, isGuest, refreshTrigger]);

  const handleSave = async () => {
    const updateData = {};
    if (parentName.trim()) updateData.parent_name = parentName.trim();
    if (childName.trim()) updateData.child_name = childName.trim();

    if (Object.keys(updateData).length === 0) return; 

    if (isGuest) {
        sessionStorage.setItem("guest_parent_name", parentName.trim());
        sessionStorage.setItem("guest_child_name", childName.trim());
        setShowNameModal(false);
      } else {
        const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", userId);

    if (!error) {
      setProfile((prev) => ({ ...prev, ...updateData }));
      setShowNameModal(false);
    } else {
      console.error("Error updating profile:", error);
    }
  };
  setRefreshTrigger(prev => prev + 1);
}

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Edit Profile</h2>
        <div className="input-group">
        <label>Parent Name:</label>
        <input
          type="text"
          placeholder="Enter name"
          value={parentName}
          onChange={(e) => setParentName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
        </div>
        <div className="input-group">
        <label>Child Name:</label>        
        <input
          type="text"
          placeholder="Enter name"
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
        </div>
        <div className='button-container'>
        <button className="modal-button" onClick={() => setShowNameModal(false)}>Close</button>
        <button className="modal-button" onClick={handleSave}>Save</button>
      </div>
      </div>
    </div>
  );
};

export default NameInputModal;
