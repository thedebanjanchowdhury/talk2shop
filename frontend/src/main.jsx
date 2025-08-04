import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BackgroundBeams } from "./components/ui/background-beams.jsx";
import { HeroUIProvider } from "@heroui/react";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HeroUIProvider>
      <App />
      <BackgroundBeams />
    </HeroUIProvider>
  </StrictMode>
);
