import React, { useEffect, useState } from "react";

import API from "../api";
import AuthPage from "./AuthPage";
import Dashboard from "./Dashboard";
import TopBar from "./TopBar";

const Home = () => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setCheckingAuth(false);
        return;
      }

      try {
        const response = await API.get("/auth/me");
        setUser(response.data.data);
        localStorage.setItem("user", JSON.stringify(response.data.data));
      } catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    verifyUser();
  }, []);

  const handleAuthSuccess = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  if (checkingAuth) {
    return <p style={{ padding: "24px" }}>Checking authentication...</p>;
  }

  if (!user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <>
      <TopBar user={user} onLogout={handleLogout} />
      <Dashboard />
    </>
  );
};

export default Home;
