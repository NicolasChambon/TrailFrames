import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { fetchCsrfToken } from "./lib/api.ts";

fetchCsrfToken()
  .then(() => {
    createRoot(document.getElementById("root")!).render(
      <StrictMode>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </StrictMode>
    );
  })
  .catch((error) => {
    console.error("Failed to initialize application:", error);
    // TODO: Display a dedicated page/component for initialization errors
    document.getElementById("root")!.innerText = `
      <div style="padding: 20px; text-align: center;">
        <h1>Failed to initialize application</h1>
        <p>Please refresh the page or contact support.</p>
      </div>
    `;
  });
