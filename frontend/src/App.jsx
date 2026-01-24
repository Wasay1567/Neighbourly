// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import CreateForm from "./components/CreateForm";
import SearchServicePage from "./pages/SearchServicePage";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/create-service" element = {<CreateForm />} />
      <Route path="/search-service" element = {<SearchServicePage />} />
    </Routes>
  );
};

export default App;
