import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <App />
    </main>
  </StrictMode>
);
