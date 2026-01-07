import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState<boolean>(
    !!localStorage.getItem("token")
  );
  const [username, setUsername] = useState<string | null>(
    localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user")!).username
      : null
  );
  const navigate = useNavigate();

  // Listen to login/logout events so navbar updates automatically
  useEffect(() => {
    const handleLoginEvent = () => {
      setLoggedIn(true);
      const user = localStorage.getItem("user");
      setUsername(user ? JSON.parse(user).username : null);
    };
    const handleLogoutEvent = () => {
      setLoggedIn(false);
      setUsername(null);
    };

    window.addEventListener("login", handleLoginEvent);
    window.addEventListener("logout", handleLogoutEvent);

    return () => {
      window.removeEventListener("login", handleLoginEvent);
      window.removeEventListener("logout", handleLogoutEvent);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLoggedIn(false);
    setUsername(null);
    navigate("/");
    window.dispatchEvent(new Event("logout")); // notify other components if needed
  };

  return (
    <nav style={{ textAlign: "center" }}>
      <h1>
        Welcome to NUS Lifters Web Forum
        {loggedIn && username ? `, ${username}!` : "!"}
      </h1>
      <Link to="/">Home</Link>
      {" | "}
      {!loggedIn ? (
        <>
          <Link to="/login">Login</Link>
          {" | "}
          <Link to="/register">Register</Link>
        </>
      ) : (
        <button
          onClick={() => {
            if (window.confirm("Are you sure you want to logout?")) {
              handleLogout();
            }
          }}
          style={{
            cursor: "pointer",
            background: "none",
            border: "none",
            padding: 0,
            color: "blue",
            textDecoration: "underline",
            font: "inherit",
          }}
        >
          Logout
        </button>
      )}
      <p style={{ fontSize: "small" }}>
        {" "}
        {!loggedIn
          ? "Log in/Register new account to create posts or comments"
          : ""}
      </p>
    </nav>
  );
};

export default Navbar;
