import React from "react";
import Login from "../components/Login";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = (credentials) => {
    console.log("Logging in with:", credentials);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Login/>
    </div>
  );
};

export default LoginPage;
