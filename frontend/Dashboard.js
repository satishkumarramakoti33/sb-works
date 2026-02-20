import React, { useEffect, useMemo, useState } from "react";
import api from "../api";

function Dashboard() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  const [postedJobs, setPostedJobs] = useState([]); // client
  const [assignedJobs, setAssignedJobs] = useState([]); // freelancer
  const [appliedJobs, setAppliedJobs] = useState([]); // ✅ freelancer applied jobs

  const [expandedJobId, setExpandedJobId] = useState(null);
  const [actionMsg, setActionMsg] = useState("");
  const [busyId, setBusyId] = useState(null);

  const role = useMemo(() => {
    return (me?.role || "").toString().trim().toLowerCase();
  }, [me]);

  const stats = useMemo(() => {
    const postedCount = postedJobs.length;
    const completedClient = postedJobs.filter((j) => j.status === "completed").length;

    const assignedCount = assignedJobs.length;
    const completedFreelancer = assignedJobs.filter((j) => j.status === "completed").length;

    const applicationsCountClient = postedJobs.reduce(
      (sum, job) => sum + (Array.isArray(job.applications) ? job.applications.length : 0),
      0
    );

    const appliedCount = appliedJobs.length;

    return {
      postedCount,
      completedClient,
      applicationsCountClient,
      assignedCount,
      completedFreelancer,
      appliedCount,
    };
  }, [postedJobs, assignedJobs, appliedJobs]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setActionMsg("");

        const meRes = await api.get("/api/auth/me");
        const userObj = meRes.data?.user ? meRes.data.user : meRes.data;

        setMe(userObj);
        localStorage.setItem("user", JSON.stringify(userObj));

        const normalizedRole = (userObj?.role || "").toString().trim().toLowerCase();

        if (normalizedRole === "client") {
          const jobsRes = await api.get("/api/jobs/my-jobs");
          setPostedJobs(jobsRes.data || []);

          setAssignedJobs([]);
          setAppliedJobs([]);
        } else if (normalizedRole === "freelancer") {
          const assignedRes = await api.get("/api/jobs/assigned/me");
          setAssignedJobs(assignedRes.data || []);

          // ✅ load applied jobs
          const appliedRes = await api.get("/api/jobs/me/applied");
          setAppliedJobs(appliedRes.data || []);

          setPostedJobs([]);
        } else {
          setActionMsg(`❌ Unknown role: "${userObj?.role}"`);
          setPostedJobs([]);
          setAssignedJobs([]);
          setAppliedJobs([]);
        }
      } catch (err) {
        const status = err.response?.status;
        const message = err.response?.data?.message;
        console.log("Dashboard error:", status, message, err.message);

        if (status === 401) setActionMsg("❌ Unauthorized. Please login again.");
        else if (status === 403) setActionMsg(`❌ Forbidden: ${message || "role/token issue"}`);
        else setActionMsg(`❌ Failed to load dashboard: ${message || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const toggleApplicants = (jobId) => {
    setExpandedJobId((prev) => (prev === jobId ? null : jobId));
  };

  const acceptFreelancer = async (jobId, freelancerId) => {
    try {
      setActionMsg("");
      setBusyId(jobId);

      await api.post(`/api/jobs/${jobId}/accept/${freelancerId}`);

      setActionMsg("✅ Freelancer accepted successfully!");

      const jobsRes = await api.get("/api/jobs/my-jobs");
      setPostedJobs(jobsRes.data || []);
    } catch (err) {
      console.log("Accept error:", err.response?.status, err.response?.data);
      setActionMsg(err.response?.data?.message || "❌ Failed to accept freelancer.");
    } finally {
      setBusyId(null);
    }
  };

  const deleteJob = async (jobId) => {
    try {
      const ok = window.confirm("Are you sure you want to delete this project?");
      if (!ok) return;

      setActionMsg("");
      setBusyId(jobId);

      const res = await api.delete(`/api/jobs/${jobId}`);
      setActionMsg(res.data.message || "✅ Job deleted");

      const jobsRes = await api.get("/api/jobs/my-jobs");
      setPostedJobs(jobsRes.data || []);
    } catch (err) {
      console.log("Delete error:", err.response?.status, err.response?.data);
      setActionMsg(err.response?.data?.message || "❌ Failed to delete job");
    } finally {
      setBusyId(null);
    }
  };

  const badgeForStatus = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "open") return "bg-success";
    if (s === "assigned") return "bg-primary";
    if (s === "completed") return "bg-secondary";
    return "bg-dark";
  };

  if (loading) {
    return (
      <div className="container py-5">
        <h2 className="fw-bold mb-1">Dashboard</h2>
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Dashboard</h2>
          <p className="text-muted mb-0">
            Welcome{me?.name ? `, ${me.name}` : ""}{" "}
            {me?.role ? <span className="badge bg-dark ms-2 text-uppercase">{me.role}</span> : null}
          </p>
        </div>

        <div className="d-flex gap-2">
          <span className="badge bg-light text-dark border rounded-pill px-3 py-2">
            🛡️ Secure JWT Auth
          </span>
          <span className="badge bg-light text-dark border rounded-pill px-3 py-2">
            ⚡ Role-based Access
          </span>
        </div>
      </div>

      {/* Message */}
      {actionMsg && <div className="alert alert-info border-0 shadow-sm rounded-4">{actionMsg}</div>}

      {/* Stats */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body text-center p-4">
              <div className="fs-1 mb-2">📌</div>
              <h6 className="text-muted mb-1">
                {role === "client" ? "Posted Projects" : "Assigned Projects"}
              </h6>
              <h2 className="fw-bold text-primary mb-0">
                {role === "client" ? stats.postedCount : stats.assignedCount}
              </h2>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body text-center p-4">
              <div className="fs-1 mb-2">{role === "client" ? "🧾" : "📝"}</div>
              <h6 className="text-muted mb-1">
                {role === "client" ? "Applications" : "Applied Projects"}
              </h6>
              <h2 className="fw-bold text-success mb-0">
                {role === "client" ? stats.applicationsCountClient : stats.appliedCount}
              </h2>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body text-center p-4">
              <div className="fs-1 mb-2">🏁</div>
              <h6 className="text-muted mb-1">Completed</h6>
              <h2 className="fw-bold text-warning mb-0">
                {role === "client" ? stats.completedClient : stats.completedFreelancer}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* CLIENT SECTION */}
      {role === "client" && (
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h4 className="fw-bold mb-1">Your Posted Jobs</h4>
                <p className="text-muted mb-0">View applicants, assign, or delete projects.</p>
              </div>
              <span className="badge bg-light text-dark border rounded-pill px-3 py-2">
                Total: {postedJobs.length}
              </span>
            </div>

            {postedJobs.length === 0 ? (
              <div className="text-center py-5">
                <div className="fs-1 mb-2">📝</div>
                <h6 className="mb-1">No jobs posted yet</h6>
                <p className="text-muted mb-0">Go to “Post Project” to create your first job.</p>
              </div>
            ) : (
              <div className="list-group list-group-flush">
                {postedJobs.map((job) => (
                  <div key={job._id} className="list-group-item py-3 px-0 border-0 border-top">
                    <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                      <div>
                        <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                          <h5 className="fw-bold mb-0">{job.title}</h5>
                          <span className={`badge ${badgeForStatus(job.status)}`}>
                            {(job.status || "").toUpperCase()}
                          </span>
                          <span className="badge bg-light text-dark border">₹{job.budget}</span>
                          <span className="badge bg-light text-dark border">
                            {job.category || "General"}
                          </span>
                        </div>

                        <p className="text-muted mb-1">{job.description}</p>

                        <small className="text-muted">
                          Applicants:{" "}
                          <b>{Array.isArray(job.applications) ? job.applications.length : 0}</b>
                        </small>
                      </div>

                      <div className="d-flex gap-2 align-items-start flex-wrap">
                        <button
                          className="btn btn-outline-primary rounded-pill px-3"
                          onClick={() => toggleApplicants(job._id)}
                        >
                          {expandedJobId === job._id ? "Hide Applicants" : "View Applicants"}
                        </button>

                        {/* ✅ BEST: show Delete only when job is OPEN */}
                        {job.status === "open" && (
                          <button
                            className="btn btn-outline-danger rounded-pill px-3"
                            onClick={() => deleteJob(job._id)}
                            disabled={busyId === job._id}
                            title="Delete project"
                          >
                            {busyId === job._id ? "Deleting..." : "Delete"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Applicants Panel */}
                    {expandedJobId === job._id && (
                      <div className="mt-3 p-3 bg-light rounded-4 border">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="fw-bold mb-0">Applicants</h6>
                          <span className="badge bg-white text-dark border">
                            {job.applications?.length || 0}
                          </span>
                        </div>

                        {!job.applications || job.applications.length === 0 ? (
                          <p className="text-muted mb-0">No one has applied yet.</p>
                        ) : (
                          <div className="table-responsive">
                            <table className="table table-sm align-middle mb-0">
                              <thead>
                                <tr>
                                  <th>Freelancer</th>
                                  <th>Cover Letter</th>
                                  <th style={{ width: 150 }}>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {job.applications.map((app, idx) => (
                                  <tr key={app._id || idx}>
                                    <td className="fw-semibold">
                                      {app.freelancer?.name || "Freelancer"}
                                      <div className="text-muted small">
                                        {app.freelancer?.email || ""}
                                      </div>
                                    </td>
                                    <td className="text-muted">{app.coverLetter || "-"}</td>
                                    <td>
                                      <button
                                        className="btn btn-success btn-sm rounded-pill px-3"
                                        disabled={job.status !== "open" || busyId === job._id}
                                        onClick={() =>
                                          acceptFreelancer(job._id, app.freelancer?._id)
                                        }
                                      >
                                        {busyId === job._id ? "Working..." : "Accept"}
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>

                            {job.status !== "open" && (
                              <div className="text-muted small mt-2">
                                Accept is disabled because this job is not open.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FREELANCER SECTION */}
      {role === "freelancer" && (
        <>
          {/* Assigned Jobs */}
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h4 className="fw-bold mb-1">Your Assigned Jobs</h4>
                  <p className="text-muted mb-0">Projects that client accepted for you.</p>
                </div>
                <span className="badge bg-light text-dark border rounded-pill px-3 py-2">
                  Total: {assignedJobs.length}
                </span>
              </div>

              {assignedJobs.length === 0 ? (
                <div className="text-center py-5">
                  <div className="fs-1 mb-2">📭</div>
                  <h6 className="mb-1">No assigned jobs yet</h6>
                  <p className="text-muted mb-0">Wait until a client accepts your application.</p>
                </div>
              ) : (
                <div className="row g-4">
                  {assignedJobs.map((job) => (
                    <div className="col-12 col-md-6" key={job._id}>
                      <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h5 className="fw-bold mb-1">{job.title}</h5>
                              <p className="text-muted small mb-2">
                                {job.category || "General"} •{" "}
                                <span className={`badge ${badgeForStatus(job.status)}`}>
                                  {(job.status || "").toUpperCase()}
                                </span>
                              </p>
                            </div>
                            <span className="badge bg-light text-dark border">₹{job.budget}</span>
                          </div>

                          <p className="text-secondary mb-0">{job.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ✅ Applied Jobs */}
          <div className="card border-0 shadow-sm rounded-4 mt-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h4 className="fw-bold mb-1">Jobs You Applied For</h4>
                  <p className="text-muted mb-0">These are pending until a client accepts you.</p>
                </div>
                <span className="badge bg-light text-dark border rounded-pill px-3 py-2">
                  Total: {appliedJobs.length}
                </span>
              </div>

              {appliedJobs.length === 0 ? (
                <div className="text-center py-4">
                  <div className="fs-1 mb-2">🧾</div>
                  <h6 className="mb-1">No applied jobs yet</h6>
                  <p className="text-muted mb-0">Go to Projects and apply to jobs.</p>
                </div>
              ) : (
                <div className="row g-4">
                  {appliedJobs.map((job) => (
                    <div className="col-12 col-md-6" key={job._id}>
                      <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h5 className="fw-bold mb-1">{job.title}</h5>
                              <p className="text-muted small mb-2">
                                {job.category || "General"} •{" "}
                                <span className="badge bg-warning text-dark">PENDING</span>
                              </p>
                            </div>
                            <span className="badge bg-light text-dark border">₹{job.budget}</span>
                          </div>

                          <p className="text-secondary mb-0">{job.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
