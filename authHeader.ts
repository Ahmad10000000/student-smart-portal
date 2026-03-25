@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&display=swap');

* {
  box-sizing: border-box;
}

html {
  direction: rtl;
}

body {
  margin: 0;
  background: #f3f4f6;
  color: #111827;
  font-family: 'Tajawal', system-ui, -apple-system, "Segoe UI", sans-serif;
  min-height: 100vh;
}

#root {
  min-height: 100vh;
}


.modern-page {
  min-height: 100vh;
  display: flex;
  background: #f3f6fb;
}

.hero-side {
  flex: 1.2;
  background-image: url("/bau.jpg");
  background-size: cover;
  background-position: center;
  position: relative;
  min-height: 100vh;
  isolation: isolate;
}

.hero-side::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    rgba(0, 104, 55, 0.35),
    rgba(0, 104, 55, 0.35)
  );
  z-index: 0;
}

.hero-side::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 160px;
  height: 160px;
  background: url("/logo.png") no-repeat center/contain;
  opacity: 0.08;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 2.5rem;
  gap: 0.5rem;
}

.hero-overlay h1 {
  font-size: 2rem;
  margin: 0;
  font-weight: 700;
}

.hero-overlay p {
  margin: 0;
  opacity: 0.8;
}

.form-side {
  flex: 0.8;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 3.2rem 3.5rem 2.5rem;
  gap: 1rem;
  min-width: 330px;
  box-shadow: -6px 0 18px rgba(0, 0, 0, 0.05);
}

.logo-wrap {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.logo-wrap img {
  width: 52px;
  height: auto;
}

.logo-wrap span {
  font-weight: 600;
  color: #0f5132;
  font-size: 0.85rem;
}

.form-side h2 {
  margin: 0.5rem 0 0;
  font-size: 1.35rem;
  color: #1f2937;
}

.subtitle {
  margin: 0;
  font-size: 0.82rem;
  color: #6b7280;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin-top: 0.6rem;
}

.login-form label {
  font-size: 0.78rem;
  color: #374151;
}

.login-form input {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.45rem 0.55rem;
  font-size: 0.83rem;
  outline: none;
  transition: 0.2s;
}

.login-form input:focus {
  border-color: #006837;
  box-shadow: 0 0 0 3px rgba(0, 104, 55, 0.15);
}


.bau-btn {
  margin-top: 0.4rem;
  background: #006837;           
  border: none;
  color: #fff;
  padding: 0.55rem 0;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: 0.15s;
  width: 100%;
  box-shadow: 0 4px 10px rgba(0, 104, 55, 0.25);
}

.bau-btn:hover {
  background: #05542c;          
}

.bau-btn:active {
  transform: translateY(1px);
}

.error-box {
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 0.4rem 0.5rem;
  font-size: 0.72rem;
  margin-top: 0.25rem;
}

.help-links {
  display: flex;
  gap: 1rem;
  font-size: 0.72rem;
}

.help-links a {
  color: #006837;
  text-decoration: none;
}

.help-links a:hover {
  text-decoration: underline;
}

.footer-text {
  font-size: 0.7rem;
  color: #9ca3af;
  margin-top: 1.5rem;
}

@media (max-width: 900px) {
  .modern-page {
    flex-direction: column;
  }
  .hero-side {
    height: 180px;
    min-height: 180px;
  }
  .hero-overlay {
    justify-content: center;
    text-align: center;
    align-items: center;
  }
  .form-side {
    width: 100%;
    min-width: 100%;
    box-shadow: none;
  }
}

.bau-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f3f4f6;
  font-family: 'Tajawal', system-ui;
}

.bau-topbar {
  height: 70px;
  background: linear-gradient(90deg, #006837 0%, #bfa544 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.8rem;
  color: #fff;
}

.bau-top-left {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.bau-top-logo {
  width: 48px;
  background: #fff;
  border-radius: 8px;
  padding: 2px;
}

.bau-top-title h1 {
  font-size: 1.05rem;
  margin: 0;
}
.bau-top-title p {
  margin: 0;
  font-size: 0.7rem;
  opacity: 0.9;
}

.bau-top-right {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.bau-user {
  text-align: right;
  line-height: 1.1;
}
.bau-user-name {
  font-weight: 600;
}
.bau-user-id {
  font-size: 0.7rem;
  opacity: 0.9;
}

.bau-logout {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.28);
  color: #fff;
  padding: 0.35rem 0.85rem;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.15s;
}
.bau-logout:hover {
  background: rgba(255,255,255,0.25);
}

.bau-body {
  flex: 1;
  display: flex;
  gap: 1.4rem;
  padding: 1.4rem 1.8rem;
}

.bau-sidebar {
  width: 210px;
  background: #fff;
  border-radius: 14px;
  padding: 1rem 0.85rem;
  border: 1px solid #e5e7eb;
  height: fit-content;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}

.bau-sidebar-title {
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.6rem;
  color: #006837;
}

.bau-side-link {
  display: block;
  width: 100%;
  text-align: right;
  background: transparent;
  border: none;
  padding: 0.5rem 0.4rem;
  border-radius: 6px;
  font-size: 0.78rem;
  color: #374151;
  cursor: pointer;
  transition: 0.15s;
}
.bau-side-link:hover {
  background: rgba(0,104,55,0.08);
}
.bau-side-link.active {
  background: rgba(0,104,55,0.15);
  color: #006837;
  font-weight: 600;
}

.bau-side-box {
  margin-top: 1rem;
  background: #ecfdf3;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 0.5rem 0.6rem;
  font-size: 0.7rem;
  color: #166534;
}

.bau-content {
  flex: 1;
}

.bau-welcome-box {
  background: #fff;
  border-radius: 14px;
  padding: 1rem 1.2rem;
  border: 1px solid #e5e7eb;
  margin-bottom: 1rem;
}
.bau-welcome-box h2 {
  margin: 0;
  font-size: 1.2rem;
}
.bau-welcome-box p {
  margin: 0.4rem 0 0;
  font-size: 0.8rem;
  color: #6b7280;
}

.bau-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.9rem;
  margin-bottom: 1.2rem;
}

.bau-stat {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.6rem 0.8rem;
}
.bau-stat .label {
  font-size: 0.7rem;
  color: #6b7280;
}
.bau-stat .value {
  font-size: 1.3rem;
  font-weight: 700;
  margin-top: 0.2rem;
}
.bau-stat .value.success {
  color: #006837;
}
.bau-stat .value.danger {
  color: #b91c1c;
}
.bau-stat .hint {
  font-size: 0.65rem;
  color: #9ca3af;
  margin-top: 0.25rem;
}

.bau-grid {
  display: grid;
  grid-template-columns: 1.4fr 0.6fr 0.6fr 0.6fr;
  gap: 1rem;
}

.bau-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 0.8rem 0.9rem 0.9rem;
  min-height: 140px;
}

.bau-card h3 {
  margin: 0 0 0.6rem;
  font-size: 0.9rem;
  color: #006837;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.bau-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.72rem;
}
.bau-table th,
.bau-table td {
  border-bottom: 1px solid #f1f5f9;
  padding: 0.35rem 0.2rem;
  text-align: right;
}
.bau-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #4b5563;
}

.bau-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.bau-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.74rem;
  border-bottom: 1px dashed #e5e7eb;
  padding-bottom: 0.3rem;
}
.bau-list.small li {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  border: none;
}
.badge {
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.65rem;
  font-weight: 600;
}
.badge.good {
  background: #dcfce7;
  color: #166534;
}
.badge.warn {
  background: #fef9c3;
  color: #854d0e;
}

@media (max-width: 980px) {
  .bau-body {
    flex-direction: column;
  }
  .bau-sidebar {
    width: 100%;
    display: flex;
    gap: 0.4rem;
    overflow-x: auto;
  }
  .bau-grid {
    grid-template-columns: 1fr;
  }
}
