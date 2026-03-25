// src/pages/Login.tsx
import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../auth/AuthStore";
import { apiFetch } from "../api/http";
import "./Login.css";

type Role = "student" | "teacher" | "admin";

function detectFirstRole(id: string): Role {
  const t = id.trim().toLowerCase();
  if (t === "admin") return "admin";
  if (t.startsWith("t")) return "teacher";
  return "student";
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="lp-eyeIcon" aria-hidden="true">
      <path d="M12 6.5c4.95 0 9.27 2.89 11 7-1.73 4.11-6.05 7-11 7s-9.27-2.89-11-7c1.73-4.11 6.05-7 11-7zm0 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0-2c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="lp-eyeIcon" aria-hidden="true">
      <path d="M12 6c3.79 0 7.17 2.13 8.82 5.5-.47.96-1.12 1.82-1.92 2.53l1.42 1.42c1.21-1.09 2.19-2.43 2.86-3.95C21.35 7.94 16.99 5 12 5c-1.52 0-2.98.27-4.33.77l1.63 1.63C10.12 6.9 11.04 6 12 6zm-9.19-.81 2.02 2.02C3.22 8.34 1.9 10 1 11.5 2.73 15.61 7.05 18.5 12 18.5c1.68 0 3.28-.34 4.73-.95l2.06 2.06 1.27-1.27L4.08 3.92 2.81 5.19zM12 17.5c-3.79 0-7.17-2.13-8.82-5.5.72-1.46 1.78-2.72 3.07-3.7l1.5 1.5c-.24.55-.38 1.15-.38 1.78 0 2.49 2.01 4.5 4.5 4.5.63 0 1.23-.14 1.78-.38l1.56 1.56c-.99.29-2.04.44-3.21.44zm-2.72-7.94 4.16 4.16c.04-.2.06-.41.06-.62 0-1.66-1.34-3-3-3-.21 0-.42.02-.62.06z" />
    </svg>
  );
}

function niceErrorMessage(e: any) {
  const msg = String(e?.message || "").trim();
  if (!msg) return "Connection problem with the server.";
  if (msg.includes("HTTP 404")) return "Login endpoint not found (wrong path on backend).";
  if (msg.toLowerCase().includes("cors")) return "CORS blocked the request (backend not allowing browser origin).";
  if (msg.includes("HTTP 500")) return "Backend crashed (500). Check backend logs / payload.";
  return msg;
}

export default function Login() {
  const { login } = useAuth();

  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  const [err, setErr] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const heroImg = "/login-illustration.png";

  async function tryStudentLogin(studentId: string, pass: string) {
    const paths = ["/login", "/student/login"];
    let lastErr: any = null;

    for (const p of paths) {
      try {
        return await apiFetch(p, {
          method: "POST",
          body: { id: studentId, password: pass },
        });
      } catch (e: any) {
        lastErr = e;
        if (String(e?.message || "").includes("HTTP 404")) continue;
        throw e;
      }
    }
    throw lastErr || new Error("Student login failed.");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr("");

    const trimmedId = id.trim();
    const trimmedPass = password.trim();

    if (!trimmedId || !trimmedPass) {
      setErr("Please enter username and password.");
      return;
    }

    try {
      setLoading(true);

      let data: any = null;
      let detected: Role | null = null;

      const first = detectFirstRole(trimmedId);
      const all: Role[] = ["student", "teacher", "admin"];
      const rolesToTry: Role[] = [first, ...all.filter((r) => r !== first)];

      for (const role of rolesToTry) {
        try {
          if (role === "student") {
            data = await tryStudentLogin(trimmedId, trimmedPass);
          } else if (role === "teacher") {
            data = await apiFetch("/teacher/login", {
              method: "POST",
              body: { id: trimmedId, password: trimmedPass },
            });
          } else {
            data = await apiFetch("/admin/login", {
              method: "POST",
              body: { username: trimmedId, password: trimmedPass },
            });
          }

          detected = role;
          break;
        } catch {
        }
      }

      if (!data || !detected) throw new Error("Invalid credentials.");

      if (detected === "teacher") {
        localStorage.setItem("teacherId", String(data.id ?? data.teacherId ?? data.username ?? trimmedId));
      }

      const token = String(data.token ?? data.access_token ?? data.jwt ?? "");

      login({
        id: String(data.id ?? data.studentId ?? data.teacherId ?? data.username ?? trimmedId),
        name: data.fullName ?? data.name ?? data.username ?? (detected === "admin" ? "Admin" : "User"),
        role: detected,
        token,
      });
    } catch (e: any) {
      setErr(niceErrorMessage(e) || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="lp-root" dir="ltr">
      <div className="lp-shell">
        <div className="lp-heroSide" aria-hidden="true">
          <img className="lp-heroImg" src={heroImg} alt="" />
        </div>

        <div className="lp-formSide">
          <div className="lp-header">
            <div className="lp-badge">Student Portal System</div>
            <h1 className="lp-title">Sign in</h1>
            <p className="lp-subtitle">Student / Teacher / Admin Login</p>
          </div>

          <form className="lp-form" onSubmit={onSubmit}>
            <div className="lp-field">
              <label className="lp-label" htmlFor="login-id">Username / ID</label>
              <input
                id="login-id"
                className="lp-input"
                placeholder="e.g. 32301001037 or T123 or admin"
                value={id}
                onChange={(e) => setId(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="lp-field">
              <label className="lp-label" htmlFor="login-pass">Password</label>

              <div className="lp-passWrap">
                <input
                  id="login-pass"
                  className="lp-input lp-passInput"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="lp-passToggle"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                  title={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="lp-row">
              <label className="lp-check">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                <span>Remember me</span>
              </label>

              <button type="button" className="lp-link" onClick={() => alert("Connect this to your backend later.")}>
                Forgot password?
              </button>
            </div>

            {err && <div className="lp-error">{err}</div>}

            <button className="lp-submit" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="lp-foot">
            <span>Graduation Project</span>
          </div>
        </div>
      </div>
    </div>
  );
}
