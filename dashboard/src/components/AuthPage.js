import React, { useState } from "react";

import API from "../api";

const AuthPage = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/signup";
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;
      const response = await API.post(endpoint, payload);
      const { token, user } = response.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      onAuthSuccess(user);
    } catch (err) {
      setError(
        err.response?.data?.message || "Authentication failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin((prevMode) => !prevMode);
    setError("");
  };

  return (
    <main className="auth-page">
      <section className="auth-showcase">
        <div className="auth-brand">
          <img src="logo.png" alt="Zerodha" />
          <span>Kite Clone</span>
        </div>

        <div className="auth-copy">
          <p className="auth-eyebrow">Live portfolio workspace</p>
          <h1>Trade, track, and manage your market day.</h1>
          <p>
            Secure access to your holdings, positions, orders, and watchlist
            powered by your MongoDB backend.
          </p>
        </div>

        <div className="auth-market-card">
          <div>
            <span>NIFTY 50</span>
            <strong>22,462.10</strong>
          </div>
          <small>+0.78%</small>
        </div>

        <div className="auth-stats">
          <div>
            <strong>13</strong>
            <span>Holdings</span>
          </div>
          <div>
            <strong>2</strong>
            <span>Positions</span>
          </div>
          <div>
            <strong>JWT</strong>
            <span>Secured</span>
          </div>
        </div>
      </section>

      <section className="auth-panel">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-card-header">
            <p>{isLogin ? "Welcome back" : "Start trading smarter"}</p>
            <h2>{isLogin ? "Login to dashboard" : "Create your account"}</h2>
          </div>

        {!isLogin && (
          <label className="auth-field">
            <span>Name</span>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
            />
          </label>
        )}

        <label className="auth-field">
          <span>Email</span>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
          />
        </label>

        <label className="auth-field">
          <span>Password</span>
          <input
            type="password"
            name="password"
            placeholder="Minimum 6 characters"
            value={formData.password}
            onChange={handleChange}
          />
        </label>

        {error && <p className="auth-error">{error}</p>}

        <button
          type="submit"
          className="auth-submit"
          disabled={loading}
        >
          {loading ? "Please wait..." : isLogin ? "Login" : "Sign up"}
        </button>

        <button
          type="button"
          className="auth-switch"
          onClick={toggleMode}
        >
          {isLogin
            ? "New user? Create an account"
            : "Already have an account? Login"}
        </button>
      </form>
      </section>
    </main>
  );
};

export default AuthPage;
