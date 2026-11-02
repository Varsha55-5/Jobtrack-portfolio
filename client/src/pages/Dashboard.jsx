import { useCallback, useEffect, useState } from "react";
import { api } from "../api";

const STATUSES = ["Applied", "Interview", "Offer", "Rejected"];

function emptyForm() {
  return {
    company: "",
    role: "",
    status: "Applied",
    applied_date: new Date().toISOString().slice(0, 10),
    notes: "",
  };
}

export default function Dashboard({ user, onLogout }) {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [stats, setStats] = useState({ Applied: 0, Interview: 0, Offer: 0, Rejected: 0 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(null); // null = form closed
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page, limit: 8 });
      if (search) params.set("search", search);
      if (status) params.set("status", status);

      const [list, counts] = await Promise.all([
        api(`/applications?${params}`),
        api("/applications/stats"),
      ]);
      setRows(list.data);
      setMeta({ page: list.page, pages: list.pages, total: list.total });
      setStats(counts);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }, [page, search, status]);

  useEffect(() => {
    load();
  }, [load]);

  async function save(e) {
    e.preventDefault();
    try {
      if (form.id) {
        await api(`/applications/${form.id}`, { method: "PUT", body: form });
      } else {
        await api("/applications", { method: "POST", body: form });
      }
      setForm(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this application?")) return;
    try {
      await api(`/applications/${id}`, { method: "DELETE" });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  function updateForm(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <div className="shell">
      <header className="topbar">
        <h1>JobTrack</h1>
        <div className="topbar-right">
          <span>{user.name}</span>
          <button className="btn" onClick={onLogout}>Log out</button>
        </div>
      </header>

      <section className="stats">
        {STATUSES.map((s) => (
          <div key={s} className={`stat tag-${s.toLowerCase()}`}>
            <strong>{stats[s]}</strong>
            <span>{s}</span>
          </div>
        ))}
      </section>

      <section className="panel">
        <div className="toolbar">
          <input
            placeholder="Search company or role"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <button className="btn primary" onClick={() => setForm(emptyForm())}>
            Add application
          </button>
        </div>

        {error && <p className="error" role="alert">{error}</p>}

        {form && (
          <form className="entry-form" onSubmit={save}>
            <h2>{form.id ? "Edit application" : "New application"}</h2>
            <div className="grid">
              <label>
                Company
                <input name="company" value={form.company} onChange={updateForm} required />
              </label>
              <label>
                Role
                <input name="role" value={form.role} onChange={updateForm} required />
              </label>
              <label>
                Status
                <select name="status" value={form.status} onChange={updateForm}>
                  {STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>
                Date applied
                <input
                  name="applied_date"
                  type="date"
                  value={form.applied_date}
                  onChange={updateForm}
                />
              </label>
            </div>
            <label>
              Notes
              <textarea name="notes" rows="2" value={form.notes || ""} onChange={updateForm} />
            </label>
            <div className="actions">
              <button className="btn primary">Save</button>
              <button type="button" className="btn" onClick={() => setForm(null)}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {rows.length === 0 ? (
          <p className="empty">
            No applications yet. Select “Add application” to log your first one.
          </p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.company}</td>
                    <td>{r.role}</td>
                    <td>
                      <span className={`pill tag-${r.status.toLowerCase()}`}>{r.status}</span>
                    </td>
                    <td>{r.applied_date}</td>
                    <td className="row-actions">
                      <button className="link" onClick={() => setForm({ ...r })}>
                        Edit
                      </button>
                      <button className="link danger" onClick={() => remove(r.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pager">
          <button
            className="btn"
            disabled={meta.page <= 1}
            onClick={() => setPage(meta.page - 1)}
          >
            Previous
          </button>
          <span>
            Page {meta.page} of {meta.pages} ({meta.total} total)
          </span>
          <button
            className="btn"
            disabled={meta.page >= meta.pages}
            onClick={() => setPage(meta.page + 1)}
          >
            Next
          </button>
        </div>
      </section>
    </div>
  );
}
