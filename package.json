// src/pages/TeacherDashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthStore";

import {
  getTeacherCourses,
  getCourseStudents,
  getCourseGrades,
  getCourseAnnouncements,
  updateStudentAbsence,
  saveStudentGrade,
  postCourseAnnouncement,
  getTeacherSystemAnnouncements,
  getTeacherExamSchedule,
  updateTeacherProfile,
  changeTeacherPassword,
  deleteTeacherAnnouncement,
  updateTeacherAnnouncement,
  getAttendanceHistory,
  getTeacherGradingRules,
  type TeacherGradingRules,
  type TeacherCourse,
  type CourseStudent,
  type CourseGradeRow,
  type CourseAnnouncement,
  type TeacherSystemAnnouncement,
  type TeacherExamItem,
  type AttendanceHistoryItem,
} from "../api/teacher";

import "./TeacherDashboard.css";

type Tab = "students" | "grades" | "announcements" | "system" | "exams" | "profile";

function toNum(v: any): number | undefined {
  if (v === null || v === undefined) return undefined;
  if (typeof v === "number") return Number.isFinite(v) ? v : undefined;
  const s = String(v).trim();
  if (s === "") return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function normalizeGrade(field: "mid" | "practical" | "final", v: any) {
  const n0 = toNum(v);
  if (typeof n0 !== "number") return undefined;
  if (field === "mid") return clamp(n0, 0, 30);
  if (field === "practical") return clamp(n0, 0, 20);
  return clamp(n0, 0, 50);
}

function calcTotal(r: Pick<CourseGradeRow, "mid" | "practical" | "final">) {
  const a = typeof r.mid === "number" ? r.mid : 0;
  const b = typeof r.practical === "number" ? r.practical : 0;
  const c = typeof r.final === "number" ? r.final : 0;
  return a + b + c;
}

function normalizeApiList<T>(data: any): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as T[];
  if (Array.isArray(data.data)) return data.data as T[];
  if (Array.isArray(data.items)) return data.items as T[];
  if (Array.isArray(data?.data?.data)) return data.data.data as T[];
  return [];
}

function fmtDateTime(d?: string, t?: string) {
  const a = (d ?? "").toString().trim();
  const b = (t ?? "").toString().trim();
  if (a && b) return `${a} • ${b}`;
  return a || b || "-";
}

function tabLabel(t: Tab) {
  switch (t) {
    case "students":
      return "Students";
    case "grades":
      return "Grades";
    case "announcements":
      return "Course Announcements";
    case "system":
      return "System Announcements";
    case "exams":
      return "Exam Schedule";
    case "profile":
      return "Profile";
    default:
      return t;
  }
}

function pickMsg(e: any): string {
  if (!e) return "Request failed.";
  if (typeof e === "string") return e;
  if (e.message && typeof e.message === "string") return e.message;
  try {
    if (e.data?.message) return String(e.data.message);
    if (e.body?.message) return String(e.body.message);
    if (e.response?.message) return String(e.response.message);
  } catch {}
  return "Request failed.";
}

export default function TeacherDashboard() {
  const { user, logout } = useAuth();

  const [teacherId, setTeacherId] = useState<string>(() => {
    return localStorage.getItem("teacherId") || (user as any)?.id || "";
  });

  useEffect(() => {
    const id = localStorage.getItem("teacherId") || (user as any)?.id || "";
    if (id && id !== teacherId) setTeacherId(id);
  }, [user]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [selected, setSelected] = useState<TeacherCourse | null>(null);
  const [tab, setTab] = useState<Tab>("students");

  const [students, setStudents] = useState<CourseStudent[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  const [grades, setGrades] = useState<CourseGradeRow[]>([]);
  const [gradesLoading, setGradesLoading] = useState(false);

  const [rulesLoading, setRulesLoading] = useState(false);
  const [gradingRules, setGradingRules] = useState<TeacherGradingRules>({
    gradingOpen: false,
    allowAssignment: false,
    allowMidterm: false,
    allowFinal: false,
  });

  const [savingGrades, setSavingGrades] = useState(false);

  const [ann, setAnn] = useState<CourseAnnouncement[]>([]);
  const [annLoading, setAnnLoading] = useState(false);
  const [annTitle, setAnnTitle] = useState("");
  const [annMessage, setAnnMessage] = useState("");
  const [postingAnn, setPostingAnn] = useState(false);

  const [editingAnnId, setEditingAnnId] = useState<string | number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingMessage, setEditingMessage] = useState("");
  const [editingOldTitle, setEditingOldTitle] = useState("");
  const [updatingAnn, setUpdatingAnn] = useState(false);

  const [sysAnn, setSysAnn] = useState<TeacherSystemAnnouncement[]>([]);
  const [sysLoading, setSysLoading] = useState(false);

  const [exams, setExams] = useState<TeacherExamItem[]>([]);
  const [examsLoading, setExamsLoading] = useState(false);

  // ===================== PROFILE  =====================
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [avatarPreview] = useState<string>(() => localStorage.getItem("teacherAvatar") || "");

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [savingPass, setSavingPass] = useState(false);

  const selectedSafeSection = useMemo(() => {
    return selected?.section && String(selected.section).trim() ? String(selected.section) : "1";
  }, [selected]);

  const selectedKey = useMemo(() => {
    if (!selected) return "";
    return `${selected.code}__${selectedSafeSection}`;
  }, [selected, selectedSafeSection]);

  const displayedId = teacherId || (user as any)?.id || "-";
  const displayedName = (user as any)?.name || "Doctor";

  const profileBadges = useMemo(() => {
    const role = "Doctor";
    return [
      `ID: ${displayedId}`,
      `Role: ${role}`,
      `Courses: ${courses.length}`,
      `Total Students: ${courses.reduce((s, c) => s + (typeof c.studentsCount === "number" ? c.studentsCount : 0), 0)}`,
    ];
  }, [displayedId, courses]);

  const [attOpen, setAttOpen] = useState(false);
  const [attStudent, setAttStudent] = useState<{ studentId: string; fullName: string } | null>(null);
  const [attLoading, setAttLoading] = useState(false);
  const [attError, setAttError] = useState<string | null>(null);
  const [attRows, setAttRows] = useState<AttendanceHistoryItem[]>([]);
  const [attendanceBlocked, setAttendanceBlocked] = useState(false);

  async function openAttendanceHistory(s: CourseStudent) {
    if (!selected) return;

    setAttOpen(true);
    setAttStudent({ studentId: s.studentId, fullName: s.fullName });
    setAttRows([]);
    setAttError(null);

    setAttLoading(true);
    try {
      const data = await getAttendanceHistory({
        studentId: s.studentId,
        courseCode: selected.code,
        section: selectedSafeSection,
        teacherId,
      } as any);
      setAttRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setAttError(e?.message || "Failed to load attendance history.");
      setAttRows([]);
    } finally {
      setAttLoading(false);
    }
  }

  function closeAttendanceHistory() {
    setAttOpen(false);
    setAttStudent(null);
    setAttRows([]);
    setAttError(null);
    setAttLoading(false);
  }

  async function loadCourses() {
    if (!teacherId) {
      setErr("teacherId is missing. Save it in localStorage after login.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErr(null);
    try {
      const res: any = await getTeacherCourses(teacherId);
      const list = normalizeApiList<TeacherCourse>(res);

      const fixed = (list || []).map((c) => ({
        ...c,
        section: c.section && String(c.section).trim() ? String(c.section) : "1",
      }));

      setCourses(fixed);
      if (fixed.length) setSelected((prev) => prev ?? fixed[0]);
    } catch (e: any) {
      setErr(pickMsg(e) || "Failed to load teacher courses");
    } finally {
      setLoading(false);
    }
  }

  async function loadStudents(c: TeacherCourse) {
    if (!teacherId) return;

    const sec = c.section && String(c.section).trim() ? String(c.section) : "1";
    setStudentsLoading(true);
    setErr(null);
    try {
      const res: any = await getCourseStudents(teacherId, c.code, sec);
      setStudents(normalizeApiList<CourseStudent>(res));
    } catch (e: any) {
      setErr(pickMsg(e) || "Failed to load course students");
    } finally {
      setStudentsLoading(false);
    }
  }

  async function loadGrades(c: TeacherCourse) {
    if (!teacherId) return;

    const sec = c.section && String(c.section).trim() ? String(c.section) : "1";
    setGradesLoading(true);
    setErr(null);

    try {
      const res: any = await getCourseGrades(teacherId, c.code, sec);

      const raw = normalizeApiList<any>(res);

      const fixed: CourseGradeRow[] = (raw || []).map((r: any) => {
        const mid = normalizeGrade("mid", r.mid ?? r.midterm);
        const practical = normalizeGrade("practical", r.practical ?? r.assignment);
        const fin = normalizeGrade("final", r.final);

        const total =
          typeof r.total === "number"
            ? r.total
            : calcTotal({ mid, practical, final: fin });

        return {
          studentId: String(r.studentId ?? ""),
          fullName: String(r.fullName ?? r.studentName ?? ""),
          mid,
          practical,
          final: fin,
          total,
          locked: !!r.locked,
        };
      });

      setGrades(fixed);
    } catch (e: any) {
      setErr(pickMsg(e) || "Failed to load course grades");
    } finally {
      setGradesLoading(false);
    }
  }

  async function loadGradingRules() {
    setRulesLoading(true);
    setErr(null);
    try {
      const res: any = await getTeacherGradingRules();
      const maybe = res?.data ?? res;
      const rules = (maybe?.data ?? maybe) as any;

      const normalized: TeacherGradingRules = {
        gradingOpen: !!rules?.gradingOpen,
        allowAssignment: !!rules?.allowAssignment,
        allowMidterm: !!rules?.allowMidterm,
        allowFinal: !!rules?.allowFinal,
      };
      setGradingRules(normalized);
    } catch (e: any) {
      setGradingRules({ gradingOpen: false, allowAssignment: false, allowMidterm: false, allowFinal: false });
      setErr(pickMsg(e) || "Failed to load grading rules");
    } finally {
      setRulesLoading(false);
    }
  }

  async function loadAnnouncements(c: TeacherCourse) {
    if (!teacherId) return;

    const sec = c.section && String(c.section).trim() ? String(c.section) : "1";
    setAnnLoading(true);
    setErr(null);
    try {
      const res: any = await getCourseAnnouncements(teacherId, c.code, sec);
      setAnn(normalizeApiList<CourseAnnouncement>(res));
    } catch (e: any) {
      setErr(pickMsg(e) || "Failed to load announcements");
    } finally {
      setAnnLoading(false);
    }
  }

  async function loadSystemAnnouncements() {
    if (!teacherId) return;

    setSysLoading(true);
    setErr(null);
    try {
      const data = await getTeacherSystemAnnouncements(teacherId);
      setSysAnn(normalizeApiList<TeacherSystemAnnouncement>(data));
    } catch (e: any) {
      setErr(pickMsg(e) || "Failed to load system announcements");
    } finally {
      setSysLoading(false);
    }
  }

  async function loadExamSchedule() {
    if (!teacherId) return;

    setExamsLoading(true);
    setErr(null);
    try {
      const data = await getTeacherExamSchedule(teacherId);
      setExams(normalizeApiList<TeacherExamItem>(data));
    } catch (e: any) {
      setErr(pickMsg(e) || "Failed to load exam schedule");
    } finally {
      setExamsLoading(false);
    }
  }

  useEffect(() => {
    if (!teacherId) {
      setLoading(false);
      return;
    }
    loadCourses();
  }, [teacherId]);

  useEffect(() => {
    const u: any = user ?? {};
    setProfileEmail(u.email ?? "");
    setProfilePhone(u.phone ?? "");
  }, [user]);

  useEffect(() => {
    if (!selected) return;

    if (tab === "students") loadStudents(selected);

    if (tab === "grades") {
      loadGradingRules().finally(() => {
        loadGrades(selected);
      });
    }

    if (tab === "announcements") loadAnnouncements(selected);

  }, [selectedKey, tab]);

  useEffect(() => {
    if (tab === "system") loadSystemAnnouncements();
    if (tab === "exams") loadExamSchedule();
  }, [tab]);

  async function changeAbsence(studentId: string, delta: number) {
    if (!selected) return;
    if (!teacherId) return;

    if (attendanceBlocked) {
      setErr("Attendance editing is currently blocked because registration is open.");
      return;
    }

    setErr(null);

    try {
      await updateStudentAbsence({
        teacherId,
        studentId,
        courseCode: selected.code,
        section: selectedSafeSection,
        delta,
      } as any);

      await loadStudents(selected);
    } catch (e: any) {
      const msg = pickMsg(e);

      if (String(msg).toLowerCase().includes("registration is open")) {
        setAttendanceBlocked(true);
        setErr("Attendance editing is blocked: Registration is OPEN.");
      } else {
        setErr(msg);
      }

      await loadStudents(selected);
    }
  }

  function updateGradeCell(studentId: string, field: "mid" | "practical" | "final", value: string) {
    const n = normalizeGrade(field, value);

    setGrades((prev) =>
      prev.map((r) => {
        if (r.studentId !== studentId) return r;
        if (r.locked) return r;

        const updated: CourseGradeRow = { ...r, [field]: n };
        updated.total = calcTotal(updated);
        return updated;
      })
    );
  }

  function isDisabledByRules(field: "mid" | "practical" | "final") {
    if (!gradingRules.gradingOpen) return true;
    if (field === "practical") return !gradingRules.allowAssignment;
    if (field === "mid") return !gradingRules.allowMidterm;
    return !gradingRules.allowFinal;
  }

  async function submitGradesBulk() {
    if (!selected) return;

    setSavingGrades(true);
    setErr(null);

    try {
      const midAllowed = gradingRules.gradingOpen && gradingRules.allowMidterm;
      const assAllowed = gradingRules.gradingOpen && gradingRules.allowAssignment;
      const finAllowed = gradingRules.gradingOpen && gradingRules.allowFinal;

      const editable = grades.filter((r) => !r.locked);

      for (const r of editable) {
        await saveStudentGrade({
          teacherId,
          courseCode: selected.code,
          section: selectedSafeSection,
          studentId: r.studentId,

          midterm: midAllowed ? (toNum(r.mid) ?? 0) : undefined,
          assignment: assAllowed ? (toNum(r.practical) ?? 0) : undefined,
          final: finAllowed ? (toNum(r.final) ?? 0) : undefined, 
        });
      }

      await loadGrades(selected);
      setErr("✅ Grades saved.");
    } catch (e: any) {
      setErr(pickMsg(e) || "Failed to save grades");
    } finally {
      setSavingGrades(false);
    }
  }

  async function submitAnnouncement() {
    if (!selected) return;

    if (!annTitle.trim() || !annMessage.trim()) {
      setErr("Title and message are required.");
      return;
    }

    if (!teacherId) return;

    setPostingAnn(true);
    setErr(null);
    try {
      await postCourseAnnouncement({
        teacherId,
        courseCode: selected.code,
        section: selectedSafeSection,
        title: annTitle.trim(),
        message: annMessage.trim(),
      } as any);

      setAnnTitle("");
      setAnnMessage("");
      await loadAnnouncements(selected);
    } catch (e: any) {
      setErr(pickMsg(e) || "Failed to post announcement");
    } finally {
      setPostingAnn(false);
    }
  }

  function startEditAnnouncement(a: CourseAnnouncement) {
    setEditingAnnId(a.id);
    setEditingOldTitle(a.title);
    setEditingTitle(a.title);
    setEditingMessage(a.message);
    setErr(null);
  }

  function cancelEditAnnouncement() {
    setEditingAnnId(null);
    setEditingOldTitle("");
    setEditingTitle("");
    setEditingMessage("");
    setErr(null);
  }

  async function submitEditAnnouncement() {
    if (!selected) return;
    if (!editingAnnId) return;

    if (!editingTitle.trim() || !editingMessage.trim()) {
      setErr("Title and message are required.");
      return;
    }

    if (!teacherId) return;

    setUpdatingAnn(true);
    setErr(null);
    try {
      await updateTeacherAnnouncement({
        teacherId,
        courseCode: selected.code,
        section: selectedSafeSection,
        id: editingAnnId,
        oldTitle: editingOldTitle,
        title: editingTitle.trim(),
        message: editingMessage.trim(),
        newMessage: editingMessage.trim(),
      } as any);

      cancelEditAnnouncement();
      await loadAnnouncements(selected);
    } catch (e: any) {
      setErr(pickMsg(e) || "Failed to update announcement");
    } finally {
      setUpdatingAnn(false);
    }
  }

  async function removeAnnouncement(a: CourseAnnouncement) {
    if (!selected) return;
    if (!teacherId) return;

    setErr(null);
    try {
      await deleteTeacherAnnouncement({
        teacherId,
        courseCode: selected.code,
        section: selectedSafeSection,
        id: a.id,
        title: a.title,
      } as any);

      await loadAnnouncements(selected);
    } catch (e: any) {
      setErr(pickMsg(e) || "Failed to delete announcement");
    }
  }

  async function submitProfile() {
    if (!teacherId) return;

    setSavingProfile(true);
    setErr(null);
    try {
      await updateTeacherProfile({
        teacherId,
        email: profileEmail.trim() || undefined,
        phone: profilePhone.trim() || undefined,
      } as any);
      setErr("✅ Profile updated.");
    } catch (e: any) {
      setErr(pickMsg(e) || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function submitPassword() {
    if (!teacherId) return;

    if (!oldPass || !newPass) {
      setErr("Enter current and new password.");
      return;
    }
    if (confirmPass && confirmPass !== newPass) {
      setErr("Password confirmation does not match.");
      return;
    }

    setSavingPass(true);
    setErr(null);
    try {
      await changeTeacherPassword({
        teacherId,
        oldPassword: oldPass,
        newPassword: newPass,
        confirmPassword: confirmPass || undefined,
      } as any);
      setErr("✅ Password changed.");
      setOldPass("");
      setNewPass("");
      setConfirmPass("");
    } catch (e: any) {
      setErr(pickMsg(e) || "Failed to change password");
    } finally {
      setSavingPass(false);
    }
  }

  const anyLoading =
    studentsLoading ||
    gradesLoading ||
    annLoading ||
    savingGrades ||
    postingAnn ||
    updatingAnn ||
    sysLoading ||
    examsLoading ||
    savingProfile ||
    savingPass ||
    rulesLoading;

  if (loading) {
    return (
      <div className="tp-dashboard" style={{ padding: 18 }}>
        Loading teacher dashboard...
      </div>
    );
  }

  const avatarSrc =
    avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayedName || "Doctor")}`;

  return (
    <div className="tp-dashboard">
      <header className="tp-topbar">
        <div className="tp-brand">
          <img src="/logo.png" alt="University logo" className="tp-logo" />
          <div>
            <div className="tp-brand-title">Al-Balqa Applied University</div>
            <div className="tp-brand-sub">Teacher Portal</div>
          </div>
        </div>

        <div className="tp-top-actions">
          <div className="tp-userchip">
            <div className="tp-user-name">{displayedName}</div>
            <div className="tp-user-id">ID: {displayedId}</div>
          </div>
          <button onClick={logout} className="tp-logout">
            Logout
          </button>
        </div>
      </header>

      <div className="tp-shell">
        <aside className="tp-sidebar">
          <div className="tp-usercard">
            <div className="tp-userbadge">{(displayedName || "D").slice(0, 1).toUpperCase()}</div>
            <div>
              <div className="tp-usercard-name">{displayedName}</div>
              <div className="tp-usercard-id">{displayedId}</div>
              <div className="tp-usercard-meta">Teacher Portal</div>
            </div>
          </div>

          <div className="tp-nav">
            <button
              onClick={() => setTab("students")}
              className={tab === "students" ? "tp-link active" : "tp-link"}
              disabled={!selected}
            >
              Students
            </button>
            <button
              onClick={() => setTab("grades")}
              className={tab === "grades" ? "tp-link active" : "tp-link"}
              disabled={!selected}
            >
              Grades
            </button>
            <button
              onClick={() => setTab("announcements")}
              className={tab === "announcements" ? "tp-link active" : "tp-link"}
              disabled={!selected}
            >
              Course Announcements
            </button>

            <div className="tp-sep" />

            <button onClick={() => setTab("system")} className={tab === "system" ? "tp-link active" : "tp-link"}>
              System Announcements
            </button>
            <button onClick={() => setTab("exams")} className={tab === "exams" ? "tp-link active" : "tp-link"}>
              Exam Schedule
            </button>
            <button onClick={() => setTab("profile")} className={tab === "profile" ? "tp-link active" : "tp-link"}>
              Profile
            </button>
          </div>

          <div className="tp-side-card">
            <div className="tp-side-title">Assigned Courses</div>

            {!teacherId && (
              <div className="tp-alert danger" style={{ marginTop: 10 }}>
                teacherId is missing in localStorage.
              </div>
            )}

            <div className="tp-course-list">
              {courses.map((c) => {
                const sec = c.section && String(c.section).trim() ? String(c.section) : "1";
                const isActive = selected?.code === c.code && selectedSafeSection === sec;

                return (
                  <button
                    key={`${c.code}-${sec}`}
                    onClick={() => {
                      setSelected({ ...c, section: sec });
                      setAttendanceBlocked(false);
                    }}
                    className={isActive ? "tp-course active" : "tp-course"}
                  >
                    <div className="tp-course-name">{c.name}</div>
                    <div className="tp-course-sub">
                      {c.code} • Section {sec}
                      {typeof c.studentsCount === "number" ? ` • ${c.studentsCount} students` : ""}
                    </div>
                  </button>
                );
              })}
              {!courses.length && <div className="tp-muted">No assigned courses.</div>}
            </div>
          </div>
        </aside>

        <main className="tp-main">
          {(anyLoading || err) && (
            <div className="tp-alerts">
              {anyLoading && <div className="tp-alert info">Processing request...</div>}
              {err && <div className={`tp-alert ${String(err).startsWith("✅") ? "success" : "danger"}`}>{err}</div>}
            </div>
          )}

          {!selected && (tab === "students" || tab === "grades" || tab === "announcements") ? (
            <div className="tp-card">
              <div className="tp-card-head">
                <div className="tp-card-title">Select a course</div>
              </div>
              <div className="tp-muted">Select a course from the sidebar to view Students / Grades / Announcements.</div>
            </div>
          ) : (
            <>
              {selected && (tab === "students" || tab === "grades" || tab === "announcements") && (
                <div className="tp-welcome">
                  <div>
                    <div className="tp-welcome-title">
                      {selected.name} <span className="tp-muted">({selected.code})</span>
                    </div>
                    <div className="tp-welcome-sub">Section: {selectedSafeSection}</div>
                  </div>
                  <div className="tp-welcome-pills">
                    <span className="tp-pill">{tabLabel(tab)}</span>
                    {typeof selected.studentsCount === "number" && (
                      <span className="tp-pill">{selected.studentsCount} students</span>
                    )}
                  </div>
                </div>
              )}

              {/* ================= GRADES ================= */}
              {tab === "grades" && selected && (
                <div className="tp-card">
                  <div className="tp-card-head">
                    <div className="tp-card-title">Grades</div>

                    <div className="tp-actions">
                      <button className="tp-btn tp-btn-blue" onClick={submitGradesBulk} disabled={savingGrades || gradesLoading}>
                        {savingGrades ? "..." : "Save"}
                      </button>
                    </div>
                  </div>

                  <div className="tp-muted" style={{ marginBottom: 10 }}>
                    Rules: <b>{gradingRules.gradingOpen ? "OPEN" : "CLOSED"}</b>
                    {" • "}
                    Assignment: <b>{gradingRules.allowAssignment ? "ON" : "OFF"}</b>
                    {" • "}
                    Midterm: <b>{gradingRules.allowMidterm ? "ON" : "OFF"}</b>
                    {" • "}
                    Final: <b>{gradingRules.allowFinal ? "ON" : "OFF"}</b>
                    {rulesLoading ? " • loading rules..." : ""}
                  </div>

                  <div className="tp-table-wrap">
                    <table className="tp-table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Mid / 30</th>
                          <th>Practical / 20</th>
                          <th>Final / 50</th>
                          <th>Total</th>
                          <th>Locked</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grades.map((r) => {
                          const midDisabled = !!r.locked || isDisabledByRules("mid");
                          const prDisabled = !!r.locked || isDisabledByRules("practical");
                          const finDisabled = !!r.locked || isDisabledByRules("final");

                          return (
                            <tr key={r.studentId}>
                              <td>
                                <div style={{ fontWeight: 1000 }}>{r.fullName}</div>
                                <div className="tp-muted">{r.studentId}</div>
                              </td>

                              <td>
                                <input
                                  className="tp-input"
                                  type="number"
                                  min={0}
                                  max={30}
                                  value={typeof r.mid === "number" ? r.mid : ""}
                                  disabled={midDisabled}
                                  onChange={(e) => updateGradeCell(r.studentId, "mid", e.target.value)}
                                />
                              </td>

                              <td>
                                <input
                                  className="tp-input"
                                  type="number"
                                  min={0}
                                  max={20}
                                  value={typeof r.practical === "number" ? r.practical : ""}
                                  disabled={prDisabled}
                                  onChange={(e) => updateGradeCell(r.studentId, "practical", e.target.value)}
                                />
                              </td>

                              <td>
                                <input
                                  className="tp-input"
                                  type="number"
                                  min={0}
                                  max={50}
                                  value={typeof r.final === "number" ? r.final : ""}
                                  disabled={finDisabled}
                                  onChange={(e) => updateGradeCell(r.studentId, "final", e.target.value)}
                                />
                              </td>

                              <td>{typeof r.total === "number" ? r.total : calcTotal(r)}</td>
                              <td>
                                <span className={r.locked ? "tp-badge tp-badge-red" : "tp-badge tp-badge-green"}>
                                  {r.locked ? "Yes" : "No"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}

                        {!gradesLoading && !grades.length && (
                          <tr>
                            <td colSpan={6} className="tp-muted">
                              No grade rows.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ================= STUDENTS ================= */}
              {tab === "students" && selected && (
                <div className="tp-card">
                  <div className="tp-card-head">
                    <div className="tp-card-title">Students</div>
                    {attendanceBlocked && (
                      <div className="tp-alert danger" style={{ margin: 0 }}>
                        Registration is open — attendance editing is blocked.
                      </div>
                    )}
                  </div>

                  <div className="tp-table-wrap">
                    <table className="tp-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Absences</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((s) => (
                          <tr key={s.studentId}>
                            <td>{s.studentId}</td>
                            <td>{s.fullName}</td>
                            <td>{s.absences}</td>
                            <td>{s.status || "-"}</td>
                            <td>
                              <div className="tp-row-actions">
                                <button
                                  className="tp-btn tp-btn-blue"
                                  onClick={() => changeAbsence(s.studentId, +1)}
                                  disabled={attendanceBlocked}
                                >
                                  +1
                                </button>
                                <button
                                  className="tp-btn tp-btn-red"
                                  onClick={() => changeAbsence(s.studentId, -1)}
                                  disabled={attendanceBlocked || (s.absences ?? 0) <= 0}
                                >
                                  -1
                                </button>
                                <button
                                  className="tp-btn tp-btn-gray"
                                  type="button"
                                  onClick={() => openAttendanceHistory(s)}
                                  disabled={!selected}
                                  title="View attendance history"
                                >
                                  Details
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {!studentsLoading && !students.length && (
                          <tr>
                            <td colSpan={5} className="tp-muted">
                              No students found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ================= ANNOUNCEMENTS ================= */}
              {tab === "announcements" && selected && (
                <div className="tp-card">
                  <div className="tp-card-head">
                    <div className="tp-card-title">Course Announcements</div>
                  </div>

                  <div className="tp-form">
                    <input
                      className="tp-input"
                      placeholder="Announcement title"
                      value={annTitle}
                      onChange={(e) => setAnnTitle(e.target.value)}
                    />
                    <textarea
                      className="tp-textarea"
                      placeholder="Write your announcement..."
                      value={annMessage}
                      onChange={(e) => setAnnMessage(e.target.value)}
                      rows={4}
                    />
                    <button className="tp-btn tp-btn-blue" onClick={submitAnnouncement} disabled={postingAnn}>
                      {postingAnn ? "..." : "Publish"}
                    </button>
                  </div>

                  <div className="tp-sep" style={{ margin: "14px 0" }} />

                  <ul className="tp-list">
                    {ann.map((a) => {
                      const isEditing = editingAnnId === a.id;
                      return (
                        <li key={String(a.id)} className="tp-list-item">
                          <div style={{ flex: 1 }}>
                            {!isEditing ? (
                              <>
                                <div style={{ fontWeight: 1000 }}>{a.title}</div>
                                <div style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>{a.message}</div>
                                <div className="tp-muted" style={{ marginTop: 6 }}>
                                  {a.createdAt ? new Date(a.createdAt).toLocaleString() : "-"}
                                </div>
                              </>
                            ) : (
                              <div className="tp-form">
                                <input
                                  className="tp-input"
                                  value={editingTitle}
                                  onChange={(e) => setEditingTitle(e.target.value)}
                                  placeholder="Title"
                                />
                                <textarea
                                  className="tp-textarea"
                                  value={editingMessage}
                                  onChange={(e) => setEditingMessage(e.target.value)}
                                  rows={4}
                                  placeholder="Message"
                                />
                                <div className="tp-row-actions">
                                  <button className="tp-btn tp-btn-blue" onClick={submitEditAnnouncement} disabled={updatingAnn}>
                                    {updatingAnn ? "..." : "Save changes"}
                                  </button>
                                  <button className="tp-btn tp-btn-red" onClick={cancelEditAnnouncement} disabled={updatingAnn}>
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {!isEditing && (
                            <div className="tp-row-actions" style={{ alignItems: "start" }}>
                              <button className="tp-btn tp-btn-blue" onClick={() => startEditAnnouncement(a)}>
                                Edit
                              </button>
                              <button className="tp-btn tp-btn-red" onClick={() => removeAnnouncement(a)}>
                                Delete
                              </button>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>

                  {!annLoading && !ann.length && (
                    <div className="tp-muted" style={{ marginTop: 10 }}>
                      No announcements yet.
                    </div>
                  )}
                </div>
              )}

              {/* ================= SYSTEM ================= */}
              {tab === "system" && (
                <div className="tp-card">
                  <div className="tp-card-head">
                    <div className="tp-card-title">System Announcements</div>
                  </div>

                  <div style={{ marginTop: 10 }}>
                    {sysAnn.map((a, idx) => (
                      <div key={idx} className="tp-alert info" style={{ marginBottom: 8 }}>
                        <div style={{ fontWeight: 1000 }}>{a.title}</div>
                        <div style={{ whiteSpace: "pre-wrap" }}>{a.message}</div>
                        <div className="tp-muted">{a.date ? new Date(a.date).toLocaleString() : ""}</div>
                      </div>
                    ))}
                    {!sysLoading && !sysAnn.length && <div className="tp-muted">No system announcements.</div>}
                  </div>
                </div>
              )}

              {/* ================= EXAMS ================= */}
              {tab === "exams" && (
                <div className="tp-card">
                  <div className="tp-card-head">
                    <div className="tp-card-title">Exam Schedule</div>
                  </div>

                  <div className="tp-table-wrap">
                    <table className="tp-table">
                      <thead>
                        <tr>
                          <th>Course</th>
                          <th>Mid</th>
                          <th>Final</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exams.map((e, idx) => (
                          <tr key={`${e.courseCode}-${idx}`}>
                            <td>
                              <div style={{ fontWeight: 1000 }}>{e.courseName || e.courseCode}</div>
                              <div className="tp-muted">{e.courseCode}</div>
                            </td>
                            <td>
                              <div>{e.midDate || "-"}</div>
                              <div>{e.midTime || "-"}</div>
                              <div className="tp-muted">{e.midRoom || "-"}</div>
                            </td>
                            <td>
                              <div>{e.finalDate || "-"}</div>
                              <div>{e.finalTime || "-"}</div>
                              <div className="tp-muted">{e.finalRoom || "-"}</div>
                            </td>
                          </tr>
                        ))}
                        {!examsLoading && !exams.length && (
                          <tr>
                            <td colSpan={3} className="tp-muted">
                              No exam schedule.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ================= PROFILE ================= */}
              {tab === "profile" && (
                <div className="tp-tabs-wrap">
                  <div className="tp-profile-grid-student">
                    <div className="tp-card tp-profile-card">
                      <div className="tp-card-head">
                        <div className="tp-card-title">Profile</div>
                      </div>

                      <div className="tp-profile-top">
                        <img className="tp-profile-avatar-small" src={avatarSrc} alt="avatar" />
                        <div className="tp-profile-meta">
                          <div className="tp-profile-name bigger">{displayedName}</div>
                          <div className="tp-profile-sub">
                            {profileBadges.map((b, i) => (
                              <span className="tp-badge" key={i}>
                                {b}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="tp-profile-stats">
                        <div className="tp-stat">
                          <div className="tp-stat-label">Assigned Courses</div>
                          <div className="tp-stat-value">{courses.length}</div>
                        </div>
                        <div className="tp-stat">
                          <div className="tp-stat-label">Total Students</div>
                          <div className="tp-stat-value">
                            {courses.reduce((s, c) => s + (typeof c.studentsCount === "number" ? c.studentsCount : 0), 0)}
                          </div>
                        </div>
                        <div className="tp-stat">
                          <div className="tp-stat-label">System Announcements</div>
                          <div className="tp-stat-value">{sysAnn.length}</div>
                        </div>
                        <div className="tp-stat">
                          <div className="tp-stat-label">Exam Items</div>
                          <div className="tp-stat-value">{exams.length}</div>
                        </div>
                      </div>
                    </div>

                    <div className="tp-card">
                      <div className="tp-card-head">
                        <div className="tp-card-title">Contact Info</div>
                      </div>

                      <div className="tp-form-student">
                        <label>Email</label>
                        <input
                          className="tp-input"
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          placeholder="doctor@bau.edu.jo"
                        />

                        <label>Phone</label>
                        <input
                          className="tp-input"
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          placeholder="07xxxxxxxx"
                        />

                        <button
                          className="tp-btn tp-btn-blue tp-btn-wide"
                          type="button"
                          onClick={submitProfile}
                          disabled={savingProfile}
                        >
                          {savingProfile ? "..." : "Save"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="tp-card">
                    <div className="tp-card-head">
                      <div className="tp-card-title">Change Password</div>
                    </div>

                    <div className="tp-form-student">
                      <label>Current Password</label>
                      <input className="tp-input" type="password" value={oldPass} onChange={(e) => setOldPass(e.target.value)} />

                      <label>New Password</label>
                      <input className="tp-input" type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />

                      <label>Confirm Password</label>
                      <input
                        className="tp-input"
                        type="password"
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                      />

                      <button
                        className="tp-btn tp-btn-blue tp-btn-wide"
                        type="button"
                        onClick={submitPassword}
                        disabled={savingPass}
                      >
                        {savingPass ? "..." : "Update"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Attendance History */}
          {attOpen && (
            <div
              role="dialog"
              aria-modal="true"
              onClick={closeAttendanceHistory}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,.45)",
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 14,
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "min(920px, 100%)",
                  background: "#fff",
                  borderRadius: 14,
                  overflow: "hidden",
                  boxShadow: "0 20px 60px rgba(0,0,0,.25)",
                }}
              >
                <div
                  style={{
                    padding: "12px 14px",
                    borderBottom: "1px solid rgba(0,0,0,.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 1000, fontSize: 16 }}>Attendance History</div>
                    <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>
                      {selected ? `${selected.name} (${selected.code}) • Section ${selectedSafeSection}` : ""}
                      {attStudent ? ` • ${attStudent.fullName} (${attStudent.studentId})` : ""}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="tp-btn tp-btn-gray" type="button" onClick={closeAttendanceHistory}>
                      Close
                    </button>
                  </div>
                </div>

                <div style={{ padding: 14 }}>
                  {attLoading && <div className="tp-alert info">Loading attendance history...</div>}
                  {!attLoading && attError && <div className="tp-alert danger">{attError}</div>}

                  {!attLoading && !attError && (
                    <>
                      {attRows.length === 0 ? (
                        <div className="tp-muted">No records.</div>
                      ) : (
                        <div className="tp-table-wrap" style={{ marginTop: 6 }}>
                          <table className="tp-table">
                            <thead>
                              <tr>
                                <th>Date / Time</th>
                                <th>Status</th>
                                <th>Note</th>
                              </tr>
                            </thead>
                            <tbody>
                              {attRows.map((r, idx) => (
                                <tr key={idx}>
                                  <td>{fmtDateTime((r as any).date, (r as any).time)}</td>
                                  <td style={{ fontWeight: 900 }}>{(r as any).status ?? (r as any).state ?? (r as any).type ?? "-"}</td>
                                  <td style={{ whiteSpace: "pre-wrap" }}>{(r as any).note ?? (r as any).message ?? (r as any).reason ?? "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
