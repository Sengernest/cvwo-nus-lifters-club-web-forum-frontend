import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import API from "../services/api";
import PageContainer from "../components/PageContainer";
import ConfirmDialog from "../components/ConfirmDialog";

const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const navigate = useNavigate();

  const doRegister = async () => {
    try {
      await API.post("/register", { username, password });
      alert("Registered successfully! Please login with your new account!");
      navigate("/login");
    } catch (err: any) {
      alert(err.response?.data || "Registration failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmOpen(true);
  };

  return (
    <PageContainer maxWidth="sm">
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Register a New Account
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />

          <Button type="submit" variant="contained">
            Register
          </Button>
        </Box>
      </Paper>

      <ConfirmDialog
        open={confirmOpen}
        title="Register"
        message="Are you sure you want to register with this account?"
        confirmText="Register"
        onConfirm={doRegister}
        onClose={() => setConfirmOpen(false)}
      />
    </PageContainer>
  );
};

export default Register;
