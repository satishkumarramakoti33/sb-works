import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function PostProject() {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const role = (user?.role || "").toString().trim().toLowerCase();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [category, setCategory] = useState("");

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setBudget("");
    setCategory("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    const token = localStorage.getItem("token");
    if (!token) {
      setMsg("❌ Please login first.");
      return;
    }

    if (role !== "client") {
      setMsg("❌ Only clients can post projects. Please login as client.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/api/jobs", {
        title,
        description,
        budget: Number(budget),
        category,
      });

      setMsg("✅ Project posted successfully!");
      console.log("Created:", res.data);
      resetForm();
    } catch (err) {
      setMsg(err.response?.data?.message || "❌ Failed to post project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 840 }}>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Post a Project</h2>
          <p className="text-muted mb-0">
            Create a new project and start receiving applications.
          </p>
        </div>

        <div className="d-flex gap-2">
          <Link to="/dashboard" className="btn btn-outline-dark rounded-pill px-3">
            Dashboard
          </Link>
          <Link to="/projects" className="btn btn-outline-primary rounded-pill px-3">
            Browse Projects
          </Link>
        </div>
      </div>

      {msg && (
        <div className="alert alert-info border-0 shadow-sm rounded-4">{msg}</div>
      )}

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4 p-md-5">
          <div className="row g-4">
            {/* Left side info */}
            <div className="col-12 col-md-4">
              <div className="p-3 bg-light rounded-4 border h-100">
                <h5 className="fw-bold mb-2">Tips</h5>
                <ul className="text-muted small mb-0">
                  <li>Write clear requirements.</li>
                  <li>Set realistic budget.</li>
                  <li>Add category for better matching.</li>
                  <li>After posting, check applicants in Dashboard.</li>
                </ul>

                <hr />

                <div className="small text-muted">
                  Logged in as:{" "}
                  <span className="badge bg-dark text-uppercase">{role || "unknown"}</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="col-12 col-md-8">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Project Title</label>
                  <input
                    className="form-control form-control-lg rounded-3"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Build a Portfolio Website"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea
                    className="form-control rounded-3"
                    rows="6"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Explain requirements, features, and deadline..."
                    required
                  />
                </div>

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold">Budget (₹)</label>
                    <input
                      type="number"
                      className="form-control form-control-lg rounded-3"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="e.g. 5000"
                      required
                      min="0"
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold">Category</label>
                    <input
                      className="form-control form-control-lg rounded-3"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Web Development, Design"
                    />
                  </div>
                </div>

                <div className="d-flex gap-2 mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg rounded-pill px-4"
                    disabled={loading}
                  >
                    {loading ? "Posting..." : "Post Project"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-lg rounded-pill px-4"
                    onClick={resetForm}
                    disabled={loading}
                  >
                    Reset
                  </button>
                </div>

                {role !== "client" && (
                  <div className="mt-3 text-muted small">
                    Note: Only <b>clients</b> can post projects. If you are a freelancer,
                    login with a client account.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}