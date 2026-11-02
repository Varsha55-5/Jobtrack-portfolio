const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// One small helper used for every request to the backend.
// credentials: "include" sends the session cookie so the server knows who we are.
export async function api(path, { method = "GET", body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}
