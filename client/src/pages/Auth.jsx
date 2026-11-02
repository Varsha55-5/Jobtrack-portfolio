import { useState } from "react";
import { api } from "../api";

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isRegister = mode === "register";

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const user = await api(`/auth/${mode}`, { method: "POST", body: form });
      onAuth(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth">
      <div className="auth-intro">
        <h1>JobTrack</h1>
        <p>Keep every application, interview and offer in one place.</p>
      </div>

      <form className="panel auth-form" onSubmit={submit}>
        <h2>{isRegister ? "Create your account" : "Log in"}</h2>

        {isRegister && (
          <label>
            Name
            <input name="name" value={form.name} onChange={update} required />
          </label>
        )}
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={update} required />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            minLength={6}
            value={form.password}
            onChange={update}
            required
          />
        </label>

        {error && <p className="error" role="alert">{error}</p>}

        <button className="btn primary" disabled={busy}>
          {busy ? "Please wait…" : isRegister ? "Create account" : "Log in"}
        </button>

        <p className="switch">
          {isRegister ? "Already have an account?" : "New here?"}{" "}
          <button
            type="button"
            className="link"
            onClick={() => {
              setMode(isRegister ? "login" : "register");
              setError("");
            }}
          >
            {isRegister ? "Log in" : "Create an account"}
          </button>
        </p>
      </form>
    </main>
  );
}
