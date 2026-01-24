import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            style: { background: "#22c55e", color: "#fff" },
          },
          error: {
            style: { background: "#ef4444", color: "#fff" },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
