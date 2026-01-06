import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // remove JWT
    navigate("/login"); // redirect to login page
  };

  return (
    <nav style={{ marginBottom: "16px" }}>
        <p>Welcome to NUS Lifters Web Forum!</p>
      <Link to="/">Home</Link>
      {" | "}
      {!token && <Link to="/login">Login</Link>}
      {" | "}
      {!token && <Link to="/register">Register</Link>}
      {token && <Link to="/forum">Forum</Link>}
      {token && (
        <>
          {" | "}
          <button onClick={handleLogout} style={{ cursor: "pointer" }}>
            Logout
          </button>
        </>
      )}
    </nav>
  );
};

export default Navbar;
