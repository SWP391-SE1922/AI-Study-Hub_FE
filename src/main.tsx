
  import { createRoot } from "react-dom/client";
  import { GoogleOAuthProvider } from "@react-oauth/google";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1234567890-mockclientid.apps.googleusercontent.com';

  createRoot(document.getElementById("root")!).render(
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  );
  