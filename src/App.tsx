import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Forum from "./pages/Forum";
import PrivateRoute from "./components/PrivateRoute"; 
import Navbar from "./components/Navbar";

const App: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/forum" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/forum"
          element={
            <PrivateRoute>
              <Forum />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
