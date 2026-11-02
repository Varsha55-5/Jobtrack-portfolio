import { useEffect, useState } from "react";
import { api } from "./api";
import Auth from "./pages/Auth.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  // On first load, ask the server if we already have a logged-in session.
  useEffect(() => {
    api("/auth/me")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  async function logout() {
    await api("/auth/logout", { method: "POST" });
    setUser(null);
  }

  if (checking) return <p className="center-note">Loading…</p>;
  if (!user) return <Auth onAuth={setUser} />;
  return <Dashboard user={user} onLogout={logout} />;
}
