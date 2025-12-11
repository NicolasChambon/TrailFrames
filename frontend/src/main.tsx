import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { fetchCsrfToken } from "./lib/api.ts";

fetchCsrfToken()
  .then(() => {
    createRoot(document.getElementById("root")!).render(
      <StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </StrictMode>
    );
  })
  .catch((error) => {
    console.error("Failed to initialize application:", error);
    document.getElementById("root")!.innerText = `
      <div style="padding: 20px; text-align: center;">
        <h1>Failed to initialize application</h1>
        <p>Please refresh the page or contact support.</p>
      </div>
    `;
  });
