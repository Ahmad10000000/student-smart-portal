/* =========== AdminDashboard.css =========== */

.ad-dashboard {
  background: #f5f7fb;
  min-height: 100vh;
  color: #111827;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}

/* ============ TOPBAR ============ */
.ad-dashboard .ad-topbar {
  height: 72px;
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
}

.ad-dashboard .ad-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ad-dashboard .ad-logo {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.ad-dashboard .ad-brand-title {
  font-weight: 800;
  letter-spacing: 0.2px;
}

.ad-dashboard .ad-brand-sub {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.ad-dashboard .ad-top-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ad-dashboard .ad-top-user {
  font-weight: 600;
  color: #111827;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.08);
}

.ad-dashboard .ad-logout {
  background: #dc2626;
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 8px 14px;
  cursor: pointer;
  font-weight: 700;
}
.ad-dashboard .ad-logout:hover {
  filter: brightness(0.95);
}

/* ============ SHELL LAYOUT ============ */
.ad-dashboard .ad-shell {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px;

  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 16px;
  align-items: start;
}

.ad-dashboard .ad-sidebar {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 18px;
  padding: 14px;
  position: sticky;
  top: 88px;
  height: fit-content;
}

.ad-dashboard .ad-main {
  min-width: 0;
}

/* ============ SIDEBAR ============ */
.ad-dashboard .ad-usercard {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 16px;
  background: #f6f8ff;
  border: 1px solid rgba(37, 99, 235, 0.1);
  margin-bottom: 12px;
}

.ad-dashboard .ad-avatar {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  object-fit: cover;
  background: #e5e7eb;
}

.ad-dashboard .ad-user-meta {
  min-width: 0;
}

.ad-dashboard .ad-user-name {
  font-weight: 800;
  line-height: 1.1;
}

.ad-dashboard .ad-user-id,
.ad-dashboard .ad-user-major {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ad-dashboard .ad-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}

.ad-dashboard .ad-link {
  all: unset;
  cursor: pointer;
  border-radius: 14px;
  padding: 10px 12px;
  font-weight: 650;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 10px;
}

.ad-dashboard .ad-link:hover {
  background: rgba(37, 99, 235, 0.08);
}

.ad-dashboard .ad-link.active {
  background: #2563eb;
  color: #fff;
}

/* ============ ALERTS ============ */
.ad-dashboard .ad-alerts {
  display: grid;
  gap: 10px;
  margin-bottom: 12px;
}

.ad-dashboard .ad-alert {
  border-radius: 14px;
  padding: 10px 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #ffffff;
  font-weight: 600;
}

.ad-dashboard .ad-alert.info {
  background: rgba(37, 99, 235, 0.08);
  border-color: rgba(37, 99, 235, 0.18);
}

.ad-dashboard .ad-alert.success {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.22);
}

.ad-dashboard .ad-alert.danger {
  background: rgba(220, 38, 38, 0.1);
  border-color: rgba(220, 38, 38, 0.22);
}

/* ============ COMMON CARD ============ */
.ad-dashboard .ad-card,
.ad-dashboard .ad-widget {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 18px;
  padding: 14px;
}

.ad-dashboard .ad-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.ad-dashboard .ad-card-title {
  font-weight: 900;
  font-size: 16px;
}

.ad-dashboard .ad-muted {
  color: #6b7280;
  font-size: 12px;
}

/* Welcome box */
.ad-dashboard .ad-welcome {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 18px;
  padding: 14px;
  margin-bottom: 14px;
}

.ad-dashboard .ad-welcome-avatar {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  object-fit: cover;
  background: #e5e7eb;
}

.ad-dashboard .ad-welcome-title {
  font-weight: 900;
  font-size: 18px;
}

.ad-dashboard .ad-welcome-text {
  min-width: 0;
  flex: 1;
}

.ad-dashboard .ad-welcome-actions {
  position: relative;
}

/* Dropdown menu */
.ad-dashboard .ad-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  width: 230px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 14px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
  padding: 8px;
  z-index: 50;
}

.ad-dashboard .ad-menu-item {
  width: 100%;
  text-align: left;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 10px 10px;
  border-radius: 12px;
  font-weight: 800;
  color: #111827;
}
.ad-dashboard .ad-menu-item:hover {
  background: rgba(37, 99, 235, 0.08);
}
.ad-dashboard .ad-menu-item.ghost {
  color: #1d4ed8;
  background: #eef2ff;
  border: 1px solid rgba(37, 99, 235, 0.22);
}
.ad-dashboard .ad-menu-item.ghost:hover {
  filter: brightness(0.98);
}
.ad-dashboard .ad-menu-sep {
  height: 1px;
  margin: 8px 4px;
  background: rgba(0, 0, 0, 0.08);
}

/* Stats cards */
.ad-dashboard .ad-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.ad-dashboard .ad-stat-card {
  background: linear-gradient(180deg, #2b6fff 0%, #1f56db 100%);
  color: #fff;
  border-radius: 18px;
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.ad-dashboard .ad-stat-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.ad-dashboard .ad-stat-label {
  font-weight: 800;
  font-size: 14px;
}
.ad-dashboard .ad-stat-sub {
  font-size: 12px;
  opacity: 0.9;
}
.ad-dashboard .ad-stat-ico {
  font-size: 18px;
  opacity: 0.95;
}
.ad-dashboard .ad-stat-num {
  font-size: 32px;
  font-weight: 950;
  margin-top: 10px;
}

/* Buttons */
.ad-dashboard .ad-btn {
  border: none;
  cursor: pointer;
  border-radius: 14px;
  padding: 10px 12px;
  font-weight: 800;
  background: #2563eb;
  color: #fff;
}
.ad-dashboard .ad-btn:hover {
  filter: brightness(0.95);
}
.ad-dashboard .ad-btn.ghost {
  background: #eef2ff;
  color: #1d4ed8;
  border: 1px solid rgba(37, 99, 235, 0.22);
}
.ad-dashboard .ad-btn.danger {
  background: rgba(220, 38, 38, 0.1);
  color: #b91c1c;
  border: 1px solid rgba(220, 38, 38, 0.22);
}

.ad-dashboard .ad-actions {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.ad-dashboard .ad-ring-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(180px, 1fr));
  gap: 14px;
}

.ad-dashboard .ad-ring {
  display: grid;
  place-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 18px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #fafafa;
}

.ad-dashboard .ad-ring-circle {
  width: 140px;
  height: 140px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: conic-gradient(#2563eb calc(var(--p) * 1%), rgba(37, 99, 235, 0.1) 0);
  border: 1px solid rgba(37, 99, 235, 0.2);
}
.ad-dashboard .ad-ring-circle.teachers {
  background: conic-gradient(#1d4ed8 calc(var(--p) * 1%), rgba(29, 78, 216, 0.1) 0);
  border-color: rgba(29, 78, 216, 0.2);
}
.ad-dashboard .ad-ring-circle.courses {
  background: conic-gradient(#3b82f6 calc(var(--p) * 1%), rgba(59, 130, 246, 0.1) 0);
  border-color: rgba(59, 130, 246, 0.2);
}

.ad-dashboard .ad-ring-inner {
  width: 110px;
  height: 110px;
  border-radius: 999px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  display: grid;
  place-items: center;
  text-align: center;
  padding: 8px;
}

.ad-dashboard .ad-ring-value {
  font-weight: 950;
  font-size: 22px;
  line-height: 1;
}
.ad-dashboard .ad-ring-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 800;
  margin-top: 6px;
}
.ad-dashboard .ad-ring-foot {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* Search */
.ad-dashboard .ad-search {
  width: min(420px, 100%);
  border-radius: 999px;
  padding: 10px 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: #fff;
  outline: none;
}
.ad-dashboard .ad-search:focus {
  border-color: rgba(37, 99, 235, 0.45);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
}

/* ============ FORMS ============ */
.ad-dashboard .ad-form {
  margin-top: 12px;
  padding: 14px;
  border-radius: 18px;
  background: #f9fafb;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.ad-dashboard .ad-form-title {
  font-weight: 950;
  margin-bottom: 12px;
}

.ad-dashboard .ad-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.ad-dashboard .ad-field label {
  display: block;
  font-size: 12px;
  color: #6b7280;
  font-weight: 800;
  margin-bottom: 6px;
}

.ad-dashboard .ad-field input,
.ad-dashboard .ad-field select {
  width: 100%;
  height: 40px;
  border-radius: 12px;
  padding: 0 12px;
  border: 1px solid rgba(0, 0, 0, 0.14);
  background: #fff;
  outline: none;
}

.ad-dashboard .ad-field input:focus,
.ad-dashboard .ad-field select:focus {
  border-color: rgba(37, 99, 235, 0.45);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
}

.ad-dashboard .ad-form-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 12px;
}

/* ============ TABLE ============ */
.ad-dashboard .ad-table-wrap {
  margin-top: 12px;
  overflow: auto;
  border-radius: 18px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #fff;
}

.ad-dashboard .ad-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 760px;
}

.ad-dashboard .ad-table thead th {
  text-align: left;
  font-size: 12px;
  color: #6b7280;
  padding: 12px;
  background: #f9fafb;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.ad-dashboard .ad-table tbody td {
  padding: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  color: #111827;
}

.ad-dashboard .ad-table tbody tr:hover {
  background: rgba(37, 99, 235, 0.04);
}

.ad-dashboard .ad-table .ad-btn {
  padding: 8px 10px;
  border-radius: 12px;
  font-weight: 900;
}

/* ============ ANNOUNCEMENTS LIST ============ */
.ad-dashboard .ad-ann-list {
  display: grid;
  gap: 12px;
  margin-top: 12px;
}

.ad-dashboard .ad-ann {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: start;
  padding: 12px;
  border-radius: 18px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #fff;
}

.ad-dashboard .ad-ann-title {
  font-weight: 950;
}
.ad-dashboard .ad-ann-body {
  color: #374151;
  margin-top: 6px;
  line-height: 1.4;
}

/* ============ ROW  ============ */
.ad-dashboard .ad-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin: 10px 0;
}

/* ============ SEGMENT CONTROL ============ */
.ad-dashboard .ad-seg {
  display: inline-flex;
  gap: 8px;
  padding: 6px;
  border-radius: 999px;
  background: #f3f4f6;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.ad-dashboard .ad-seg-btn {
  border: none;
  cursor: pointer;
  border-radius: 999px;
  padding: 8px 12px;
  font-weight: 900;
  background: transparent;
  color: #1f2937;
}

.ad-dashboard .ad-seg-btn.active {
  background: #2563eb;
  color: #fff;
}

/* ===== Profile ===== */
.ad-dashboard .ad-prof-wrap {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 16px;
  margin-top: 12px;
  align-items: start;
}

.ad-dashboard .ad-prof-card {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 18px;
  padding: 14px;
}

.ad-dashboard .ad-prof-top {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: space-between;
}

.ad-dashboard .ad-prof-avatar {
  width: 54px;
  height: 54px;
  border-radius: 999px;
  object-fit: cover;
  background: #e5e7eb;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.ad-dashboard .ad-prof-meta {
  min-width: 0;
  flex: 1;
}

.ad-dashboard .ad-prof-name {
  font-weight: 950;
  font-size: 18px;
  line-height: 1.1;
}

.ad-dashboard .ad-prof-kv {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.ad-dashboard .ad-prof-kv > div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  padding: 10px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #fafafa;
}

.ad-dashboard .ad-prof-kv b {
  font-weight: 950;
  color: #111827;
}

/* ============ RESPONSIVE ============ */
@media (max-width: 1100px) {
  .ad-dashboard .ad-cards {
    grid-template-columns: repeat(3, minmax(160px, 1fr));
  }
  .ad-dashboard .ad-ring-grid {
    grid-template-columns: repeat(3, minmax(160px, 1fr));
  }
}

@media (max-width: 980px) {
  .ad-dashboard .ad-shell {
    grid-template-columns: 1fr;
  }
  .ad-dashboard .ad-sidebar {
    position: relative;
    top: 0;
  }
  .ad-dashboard .ad-cards {
    grid-template-columns: repeat(2, minmax(160px, 1fr));
  }
  .ad-dashboard .ad-ring-grid {
    grid-template-columns: repeat(2, minmax(160px, 1fr));
  }
  .ad-dashboard .ad-form-grid {
    grid-template-columns: 1fr;
  }
  .ad-dashboard .ad-prof-wrap {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .ad-dashboard .ad-topbar {
    height: auto;
    padding: 12px;
    gap: 10px;
    flex-direction: column;
    align-items: stretch;
  }
  .ad-dashboard .ad-top-actions {
    justify-content: space-between;
  }
  .ad-dashboard .ad-cards {
    grid-template-columns: 1fr;
  }
  .ad-dashboard .ad-ring-grid {
    grid-template-columns: 1fr;
  }
}
/* ===== Grading Control  ===== */
.ad-dashboard .ad-grading-card { overflow: hidden; }

.ad-dashboard .ad-grading .ad-grading-list{
  display: grid;
  gap: 12px;
  margin-top: 6px;
}

.ad-dashboard .ad-grading .ad-checkrow{
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid rgba(0,0,0,0.08);
  background: #fff;
  border-radius: 14px;
}

.ad-dashboard .ad-grading .ad-checkrow input[type="checkbox"]{
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
}

.ad-dashboard .ad-grading .ad-checktext{
  min-width: 0;
}

.ad-dashboard .ad-grading .ad-checktitle{
  font-weight: 900;
  color: #111827;
}

.ad-dashboard .ad-grading .ad-checksub{
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}
