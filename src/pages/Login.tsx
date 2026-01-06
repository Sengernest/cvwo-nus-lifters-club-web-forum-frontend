import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await API.post("/login", { username, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user.id.toString());
      localStorage.setItem("username", res.data.user.username);
      alert("Login successful!");
      navigate("/forum");
    } catch (err: any) {
        console.error()
      alert(err.response?.data || "Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
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
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
