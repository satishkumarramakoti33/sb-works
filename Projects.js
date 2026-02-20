import React, { useEffect, useState } from "react";
import api from "../api";

export default function Projects() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/api/jobs");
        setJobs(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load projects");
      }
    };

    fetchJobs();
  }, []);

  const handleApply = async (jobId) => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user")); // saved on login

      if (!token) {
        alert("Please login first");
        return;
      }

      // ✅ Role check (IMPORTANT)
      if (user?.role !== "freelancer") {
        alert("Only freelancers can apply. Please login as freelancer.");
        return;
      }

      const res = await api.post(`/api/jobs/${jobId}/apply`, {
        coverLetter: "Hi, I am interested in this project.",
      });

      alert(res.data.message || "Applied successfully ✅");
    } catch (err) {
      alert(err.response?.data?.message || "Apply failed");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2 style={{ marginBottom: "20px" }}>Available Projects</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {jobs.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          {jobs.map((job) => (
            <div
              key={job._id}
              style={{
                width: "320px",
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "20px",
                background: "#fff",
              }}
            >
              <h3>{job.title}</h3>
              <p>{job.description}</p>

              <p>
                <b>Budget:</b> ₹{job.budget}
              </p>

              <p>
                <b>Category:</b> {job.category || "General"}
              </p>

              <button
                style={{
                  marginTop: "10px",
                  width: "100%",
                  padding: "10px",
                  background: "#0d6efd",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
                onClick={() => handleApply(job._id)}
              >
                Apply
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}