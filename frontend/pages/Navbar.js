import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const role = (user?.role || "").toString().toLowerCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          SB Works
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#sbNavbar"
          aria-controls="sbNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="sbNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/projects">
                Projects
              </Link>
            </li>

            {isLoggedIn && (
              <>
                {role === "client" && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/post-project">
                      Post Project
                    </Link>
                  </li>
                )}

                {role === "freelancer" && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/my-jobs">
                      My Jobs
                    </Link>
                  </li>
                )}

                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">
                    Dashboard
                  </Link>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2">
            {isLoggedIn ? (
              <>
                <span className="text-light small d-none d-lg-inline">
                  {user?.name ? user.name : "User"}{" "}
                  {role ? (
                    <span className="badge bg-secondary ms-2 text-uppercase">
                      {role}
                    </span>
                  ) : null}
                </span>

                <button
                  className="btn btn-outline-light btn-sm rounded-pill px-3"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="btn btn-outline-light btn-sm rounded-pill px-3" to="/login">
                  Login
                </Link>
                <Link className="btn btn-warning btn-sm rounded-pill px-3" to="/register">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;