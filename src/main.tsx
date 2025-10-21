import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "./components/ThemeProvider";
import { LanguageProvider } from "./contexts/LanguageContext";
import { PiProvider } from "./contexts/PiContext";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <LanguageProvider>
      <PiProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </PiProvider>
    </LanguageProvider>
  </ThemeProvider>
);
  