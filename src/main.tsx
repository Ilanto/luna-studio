import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { StudioProvider } from "./hooks/useStudio";
import { ToastProvider } from "./hooks/useToast";
import "./index.css";

const root = document.getElementById("root");
if (!root) throw new Error("#root not found");

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <StudioProvider>
          <App />
        </StudioProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
);
