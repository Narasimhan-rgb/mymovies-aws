import { createRoot } from "react-dom/client";
import "./index.css";
const root = createRoot(document.getElementById("root")!);
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  root.render(<main style={{ padding: "3rem", maxWidth: "45rem", margin: "auto" }}><h1>MyMovies setup required</h1><p>Configure the public Supabase URL and publishable key in .env.local, then restart the development server or rebuild. See README.md for setup.</p></main>);
} else {
  import("./App.tsx").then(({ default: App }) => root.render(<App />)).catch(() => {
    root.render(<main role="alert">MyMovies could not start. Check the application configuration and reload.</main>);
  });
}
