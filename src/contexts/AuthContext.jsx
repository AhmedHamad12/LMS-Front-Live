import React, { useState } from "react";
import { AuthContext } from "./AuthContext.js";

export const AuthProvider = ({ children }) => {
  const [showUnauthorized, setShowUnauthorized] = useState(false);
  const [unauthorizedMessage, setUnauthorizedMessage] = useState("");

  const showUnauthorizedOverlay = (message) => {
    setUnauthorizedMessage(message);
    setShowUnauthorized(true);
  };

  const hideUnauthorizedOverlay = () => {
    setShowUnauthorized(false);
    setUnauthorizedMessage("");
  };

  const value = {
    showUnauthorized,
    unauthorizedMessage,
    showUnauthorizedOverlay,
    hideUnauthorizedOverlay,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
