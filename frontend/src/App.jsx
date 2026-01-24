// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import CreateForm from "./components/CreateForm";
import SearchServicePage from "./pages/SearchServicePage";
import Layout from "./layout/Layout";

const App = () => {
  return (
    <Routes>
      {/* public */}
      <Route path="/" element={<LoginPage />} />
      {/* Layout */}
      <Route element={<Layout />} >
        <Route path="/dashboard" element={<Dashboard />} />
        {/* <Route path="/create-service" element= {<CreateForm />}/> */}
        <Route path="/search-services" element={<SearchServicePage />} />

      </Route>
    </Routes>
  );
};

export default App;
