import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow border">
        <header className="px-4 py-3 border-b">
          <h1 className="text-lg font-semibold">WebSocket Chat</h1>
        </header>
        <App />
      </div>
    </main>
  </StrictMode>
);
