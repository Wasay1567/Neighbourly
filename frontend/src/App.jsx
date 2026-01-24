// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import CreateForm from "./components/CreateForm";
import SearchServicePage from "./pages/SearchServicePage";
import Layout from "./layout/Layout";
import { Provider } from "react-redux";
import { store } from "./store/store";

const App = () => {
  return (
    <Provider store={store}>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route element={<Layout />} >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/search-services" element={<SearchServicePage />} />
      </Route>
    </Routes>
    </Provider>
  );
};

export default App;
