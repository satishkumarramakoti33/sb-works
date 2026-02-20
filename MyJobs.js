import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function MyJobs() {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);
  const role = (user?.role || "").toString().trim().toLowerCase();

  const [jobs, setJobs] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const badgeForStatus = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "open") return "bg-success";
    if (s === "assigned") return "bg-primary";
    if (s === "completed") return "bg-secondary";
    return "bg-dark";
  };

  const fetchMyJobs = async () => {
    try {
      setMsg("");
      setLoading(true);

      if (role !== "freelancer") {
        setJobs([]);
        setMsg("❌ Only freelancers can view My Jobs. Login as freelancer.");
        return;
      }

      const res = await api.get("/api/jobs/assigned/me");
      setJobs(res.data || []);
    } catch (err) {
      console.log(err);
      setMsg(err.response?.data?.message || "❌ Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
    // eslint-disable-next-line
  }, []);

  const markCompleted = async (jobId) => {
    try {
      setBusyId(jobId);
      setMsg("");

      const res = await api.post(`/api/jobs/${jobId}/complete`);
      setMsg(res.data.message || "✅ Marked as completed!");

      // refresh list
      await fetchMyJobs();
    } catch (err) {
      setMsg(err.response?.data?.message || "❌ Failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">My Assigned Jobs</h2>
          <p className="text-muted mb-0">
            Track assigned projects and update completion status.
          </p>
        </div>

        <div className="d-flex gap-2">
          <Link to="/projects" className="btn btn-outline-primary rounded-pill px-3">
            Browse Projects
          </Link>
          <Link to="/dashboard" className="btn btn-outline-dark rounded-pill px-3">
            Dashboard
          </Link>
        </div>
      </div>

      {msg && <div className="alert alert-info border-0 shadow-sm rounded-4">{msg}</div>}

      {/* Loading */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status" />
          <p className="text-muted mt-3 mb-0">Loading your jobs...</p>
        </div>
      ) : role !== "freelancer" ? (
        <div className="text-center py-5">
          <h6 className="mb-1">Not available</h6>
          <p className="text-muted mb-0">Login as freelancer to access this page.</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-5">
          <div className="fs-1 mb-2">📭</div>
          <h6 className="mb-1">No assigned jobs yet</h6>
          <p className="text-muted mb-0">
            Apply to projects from the Projects page to get assigned.
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {jobs.map((job) => (
            <div className="col-12 col-md-6" key={job._id}>
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    <div>
                      <h5 className="fw-bold mb-1">{job.title}</h5>
                      <div className="d-flex flex-wrap gap-2 mb-2">
                        <span className={`badge ${badgeForStatus(job.status)}`}>
                          {(job.status || "").toUpperCase()}
                        </span>
                        <span className="badge bg-light text-dark border">
                          ₹{job.budget}
                        </span>
                        <span className="badge bg-light text-dark border">
                          {job.category || "General"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-secondary mb-3">{job.description}</p>

                  {job.status === "assigned" ? (
                    <button
                      className="btn btn-success w-100 rounded-pill"
                      onClick={() => markCompleted(job._id)}
                      disabled={busyId === job._id}
                    >
                      {busyId === job._id ? "Updating..." : "Mark as Completed"}
                    </button>
                  ) : (
                    <button className="btn btn-outline-secondary w-100 rounded-pill" disabled>
                      {job.status === "completed" ? "Completed ✅" : "Not Available"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}