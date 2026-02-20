import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

function Login({ setIsLoggedIn }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      setLoading(true);

      const res = await api.post("/api/auth/login", { email, password });

      // save token + user
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setIsLoggedIn(true);
      setMsg("✅ Login successful!");

      // go to dashboard
      navigate("/dashboard");
    } catch (err) {
      setMsg(err.response?.data?.message || "❌ Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 520 }}>
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-1">Welcome Back</h2>
            <p className="text-muted mb-0">Login to continue on SB Works</p>
          </div>

          {msg && <div className="alert alert-info border-0 rounded-4">{msg}</div>}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input
                type="email"
                className="form-control form-control-lg rounded-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Password</label>
              <div className="input-group">
                <input
                  type={showPass ? "text" : "password"}
                  className="form-control form-control-lg rounded-start-3"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-end-3"
                  onClick={() => setShowPass((s) => !s)}
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              className="btn btn-primary btn-lg w-100 rounded-pill mt-2"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="text-center mt-4">
            <span className="text-muted">New here?</span>{" "}
            <Link to="/register" className="fw-semibold text-decoration-none">
              Create an account
            </Link>
          </div>
        </div>
      </div>

      <p className="text-center text-muted mt-3 small mb-0">
        By continuing, you agree to use SB Works responsibly.
      </p>
    </div>
  );
}

export default Login;