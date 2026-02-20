import React, { useState } from "react";
import api from "../api";

function Register() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("freelancer");
  const [msg, setMsg] = useState("");

  const handleRegister = async (e) => {

    e.preventDefault();

    setMsg("");

    try {

      const res = await api.post("/api/auth/register", {
        name,
        email,
        password,
        role
      });

      setMsg("Registration successful ✅");

      setName("");
      setEmail("");
      setPassword("");
      setRole("freelancer");

      console.log(res.data);

    } catch (err) {

      setMsg(err.response?.data?.message || "Registration failed");

    }

  };

  return (

    <div className="container mt-5" style={{ maxWidth: "400px" }}>

      <h2 className="mb-4 text-center">Register</h2>

      {msg && <div className="alert alert-info">{msg}</div>}

      <form onSubmit={handleRegister}>

        <div className="mb-3">
          <label>Name</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label>Role</label>
          <select
            className="form-control"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="freelancer">Freelancer</option>
            <option value="client">Client</option>
          </select>
        </div>

        <button type="submit" className="btn btn-success w-100">
          Register
        </button>

      </form>

    </div>

  );

}

export default Register;
