import React, { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box, Link } from "@mui/material";
import ConfirmDialog from "./ConfirmDialog";

const Navbar: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState<boolean>(
    !!localStorage.getItem("token")
  );

  const [username, setUsername] = useState<string | null>(() => {
    const userRaw = localStorage.getItem("user");
    try {
      return userRaw ? JSON.parse(userRaw).username : null;
    } catch {
      return null;
    }
  });

  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const navigate = useNavigate();

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
    window.dispatchEvent(new Event("logout"));
  };

  return (
    <>
      <AppBar position="sticky">
        <Toolbar sx={{ gap: 1 }}>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h6" noWrap>
              NUS Lifters Web Forum
              {loggedIn && username ? ` — ${username}` : ""}
            </Typography>
            {!loggedIn && (
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Log in / Register to create posts or comments
              </Typography>
            )}
          </Box>

          <Button color="inherit" component={RouterLink} to="/forum">
            Forum
          </Button>

          {!loggedIn ? (
            <>
              <Button color="inherit" component={RouterLink} to="/login">
                Login
              </Button>
              <Button color="inherit" component={RouterLink} to="/register">
                Register
              </Button>
            </>
          ) : (
            <Button color="inherit" onClick={() => setConfirmLogoutOpen(true)}>
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <ConfirmDialog
        open={confirmLogoutOpen}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        onConfirm={handleLogout}
        onClose={() => setConfirmLogoutOpen(false)}
      />
    </>
  );
};

export default Navbar;
