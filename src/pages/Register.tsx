import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

      if (
        !window.confirm("Are you sure you want to register with this account?")
      ) {
        return;
      }
      
    try {
      const res = await API.post("/register", { username, password });
      alert("Registered successfully! Please login with your new account!");
      navigate("/login");
    } catch (err: any) {
      alert(err.response?.data || "Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ textAlign: "center" }}>
      <input
        style={{ marginRight: 20 }}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit" style={{ marginLeft: 10 }}>
        Register
      </button>
    </form>
  );
};

export default Register;
