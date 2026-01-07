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

      // Store token
      localStorage.setItem("token", res.data.token);

      // Store user info as a single object
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Dispatch login event so Navbar updates immediately
      window.dispatchEvent(new Event("login"));

      alert("Login successful!");
      navigate("/forum");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data || "Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ textAlign: "center" }}>
      <input style={{ marginRight: 20}}
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
      <button type="submit" style={{ marginLeft: 10 }}  >Login</button>
    </form>
  );
};

export default Login;
