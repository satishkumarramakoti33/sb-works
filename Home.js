import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <>
      {/* HERO SECTION */}
      <div
        className="text-light py-5"
        style={{
          background: "linear-gradient(135deg, #0d6efd, #0b5ed7, #212529)",
        }}
      >
        <div className="container text-center py-5">

          <h1 className="display-4 fw-bold mb-3">
            Welcome to SB Works
          </h1>

          <p className="lead mb-4 text-light opacity-75">
            Connect with skilled freelancers and manage your projects efficiently.
          </p>

          <div className="d-flex justify-content-center gap-3 flex-wrap">

            <Link
              to="/projects"
              className="btn btn-light btn-lg rounded-pill px-4 shadow-sm"
            >
              Browse Projects
            </Link>

            <Link
              to="/post-project"
              className="btn btn-outline-light btn-lg rounded-pill px-4"
            >
              Post a Project
            </Link>

          </div>

        </div>
      </div>

      {/* FEATURES SECTION */}
      <div className="container py-5">

        <div className="row g-4">

          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm rounded-4 text-center p-4">

              <div className="card-body">

                <div className="mb-3 fs-1 text-primary">
                  💼
                </div>

                <h5 className="fw-bold">
                  Post Projects
                </h5>

                <p className="text-muted mb-0">
                  Clients can post projects with budget and detailed requirements.
                </p>

              </div>

            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm rounded-4 text-center p-4">

              <div className="card-body">

                <div className="mb-3 fs-1 text-success">
                  👨‍💻
                </div>

                <h5 className="fw-bold">
                  Find Freelancers
                </h5>

                <p className="text-muted mb-0">
                  Freelancers can browse and apply for projects easily.
                </p>

              </div>

            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm rounded-4 text-center p-4">

              <div className="card-body">

                <div className="mb-3 fs-1 text-warning">
                  📊
                </div>

                <h5 className="fw-bold">
                  Manage Work
                </h5>

                <p className="text-muted mb-0">
                  Track applications, assign freelancers, and complete projects.
                </p>

              </div>

            </div>
          </div>

        </div>

      </div>

      {/* FOOTER */}
      <div className="bg-dark text-light text-center py-3 mt-5">
        <small>
          © {new Date().getFullYear()} SB Works. All rights reserved.
        </small>
      </div>
    </>
  );
}

export default Home;