// src/pages/AdminDashboard.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../auth/AuthStore";
import "./AdminDashboard.css";

import {
  getSystemStats,
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  getTeachers,
  addTeacher,
  updateTeacher,
  deleteTeacher,
  getCourses,
  addCourse,
  updateCourse,
  deleteCourse,
  viewAllSystemAnnouncements,
  postSystemAnnouncement,
  updateSystemAnnouncement,
  deleteSystemAnnouncement,
  updateSemesterTimeline,
  updateRegistrationDates,
  setExamScheduleOne,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  updateGradingPolicies,
} from "../api/admin";

type Tab =
  | "dashboard"
  | "students"
  | "teachers"
  | "courses"
  | "announcements"
  | "semester"
  | "exams"
  | "profile";

function pickMsg(e: any): string {
  if (!e) return "Unknown error";
  if (typeof e === "string") return e;
  if (e.message && typeof e.message === "string") return e.message;
  if (e.error && typeof e.error === "string") return e.error;
  try {
    if (e.data?.message) return String(e.data.message);
    if (e.body?.message) return String(e.body.message);
    if (e.response?.message) return String(e.response.message);
  } catch {}
  return "Request failed";
}

type ExamRow = {
  courseCode: string;
  type: "Mid" | "Final";
  date: string;
  time: string;
  room: string;
};

function splitName(full: string): { first: string; last: string } {
  const clean = String(full || "")
    .trim()
    .replace(/\s+/g, " ");
  if (!clean) return { first: "", last: "" };
  const parts = clean.split(" ");
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

function pickAny(obj: any, keys: string[]): any {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return undefined;
}

function toBackendDMY(iso: string) {
  if (!iso) return "";
  const parts = iso.split("-");
  if (parts.length !== 3) return "";
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!y || !m || !d) return "";
  return `${d}/${m}/${y}`;
}

function parseISO(iso: string) {
  if (!iso) return null;
  const d = new Date(iso + "T00:00:00");
  return Number.isNaN(d.getTime()) ? null : d;
}

function diffDaysCeil(startIso: string, endIso: string) {
  const s = parseISO(startIso);
  const e = parseISO(endIso);
  if (!s || !e) return NaN;
  const ms = e.getTime() - s.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  const [active, setActive] = useState<Tab>("dashboard");
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [stats, setStats] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  const [qStudent, setQStudent] = useState("");
  const [qTeacher, setQTeacher] = useState("");
  const [qCourse, setQCourse] = useState("");
  const [qAnn, setQAnn] = useState("");

  const [stuId, setStuId] = useState("");
  const [stuFirst, setStuFirst] = useState("");
  const [stuLast, setStuLast] = useState("");
  const [stuMajor, setStuMajor] = useState("");
  const [stuEmail, setStuEmail] = useState("");
  const [stuPhone, setStuPhone] = useState("");
  const [stuPass, setStuPass] = useState("");
  const [stuMode, setStuMode] = useState<"add" | "edit">("add");

  const [tId, setTId] = useState("");
  const [tFirst, setTFirst] = useState("");
  const [tLast, setTLast] = useState("");
  const [tDept, setTDept] = useState("");
  const [tEmail, setTEmail] = useState("");
  const [tPhone, setTPhone] = useState("");
  const [tPass, setTPass] = useState("");
  const [tMode, setTMode] = useState<"add" | "edit">("add");

  const [cCode, setCCode] = useState("");
  const [cName, setCName] = useState("");
  const [cCredit, setCCredit] = useState<string>("3");
  const [cDept, setCDept] = useState("");
  const [cDays, setCDays] = useState("");
  const [cTime, setCTime] = useState("");
  const [cRoom, setCRoom] = useState("");
  const [cInstructor, setCInstructor] = useState("");
  const [cMode, setCMode] = useState<"add" | "edit">("add");

  const [aId, setAId] = useState<string | number>("");
  const [aTitle, setATitle] = useState("");
  const [aMsg, setAMsg] = useState("");
  const [aTarget, setATarget] = useState("All");
  const [aMode, setAMode] = useState<"add" | "edit">("add");

  // SEMESTER TAB 
  const [semester, setSemester] = useState("Fall2025");
  const [classStart, setClassStart] = useState("2025-12-01");
  const [classEnd, setClassEnd] = useState("2025-12-30");
  const [withdrawISO, setWithdrawISO] = useState("2025-12-15");

  const [regStart, setRegStart] = useState("2025-12-01");
  const [regEnd, setRegEnd] = useState("2025-12-15");

  // Grading Control
  const [gradingOpen, setGradingOpen] = useState(false);
  const [allowAss, setAllowAss] = useState(false);
  const [allowMid, setAllowMid] = useState(false);
  const [allowFin, setAllowFin] = useState(false);

  const [examRows, setExamRows] = useState<ExamRow[]>([
    { courseCode: "", type: "Mid", date: "", time: "", room: "" },
  ]);

  const ROOMS = useMemo(
    () => [
      "B12",
      "B13",
      "B14",
      "C4-201",
      "C4-202",
      "C4-203",
      "LAB-1",
      "LAB-2",
      "LAB-3",
      "Auditorium",
      "Online",
    ],
    []
  );

  const adminUsername = useMemo(() => {
    return (user as any)?.id || (user as any)?.username || "Admin";
  }, [user]);

  const safeName = (user as any)?.name ?? "Admin";

  const [profileTab, setProfileTab] = useState<"info" | "pass">("info");

  const [profile, setProfile] = useState<any>(null);
  const [pName, setPName] = useState("");
  const [pEmail, setPEmail] = useState("");
  const [pPhone, setPPhone] = useState("");
  const [pDepartment, setPDepartment] = useState("");
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const createRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!createRef.current) return;
      if (!createRef.current.contains(e.target as Node)) setCreateOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function clearMessages() {
    setError("");
    setHint("");
  }

  async function loadDashboard() {
    clearMessages();
    setLoading(true);
    try {
      const res = (await getSystemStats()) as any;
      const data = res?.data ?? res;
      setStats(data);
    } catch (e) {
      setError(pickMsg(e));
    } finally {
      setLoading(false);
    }
  }

  async function loadStudents() {
    clearMessages();
    setLoading(true);
    try {
      const res = (await getStudents()) as any;
      const list = Array.isArray(res) ? res : res?.data || [];
      setStudents(list);
    } catch (e) {
      setError(pickMsg(e));
    } finally {
      setLoading(false);
    }
  }

  async function loadTeachers() {
    clearMessages();
    setLoading(true);
    try {
      const res = (await getTeachers()) as any;
      const list = Array.isArray(res) ? res : res?.data || [];
      setTeachers(list);
    } catch (e) {
      setError(pickMsg(e));
    } finally {
      setLoading(false);
    }
  }

  async function loadCourses() {
    clearMessages();
    setLoading(true);
    try {
      const res = (await getCourses()) as any;
      const list = Array.isArray(res) ? res : res?.data || [];
      setCourses(list);
    } catch (e) {
      setError(pickMsg(e));
    } finally {
      setLoading(false);
    }
  }

  async function loadAnnouncements() {
    clearMessages();
    setLoading(true);
    try {
      const res = (await viewAllSystemAnnouncements()) as any;
      const list = Array.isArray(res) ? res : res?.data || [];
      setAnnouncements(list);
    } catch (e) {
      setError(pickMsg(e));
    } finally {
      setLoading(false);
    }
  }

  async function loadProfile() {
    clearMessages();
    setLoading(true);
    try {
      const res = (await getAdminProfile(adminUsername)) as any;
      const p = res?.data || res;

      setProfile(p);
      setPName(p?.fullName || "");
      setPEmail(p?.email || "");
      setPPhone(p?.phone || "");
      setPDepartment(p?.department || "");
    } catch (e) {
      setError(pickMsg(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (active === "dashboard") loadDashboard();
    if (active === "students") loadStudents();
    if (active === "teachers") loadTeachers();
    if (active === "courses") loadCourses();
    if (active === "announcements") loadAnnouncements();
    if (active === "profile") loadProfile();
    if (active === "exams") loadCourses();
  }, [active]);

  function handleLogout() {
    logout();
  }

  // ===== STUDENTS =====
  function resetStudentForm() {
    setStuId("");
    setStuFirst("");
    setStuLast("");
    setStuMajor("");
    setStuEmail("");
    setStuPhone("");
    setStuPass("");
    setStuMode("add");
  }

  function fillStudentFromRow(s: any) {
    setStuMode("edit");

    const id = String(pickAny(s, ["id", "studentId"]) ?? "");
    const first = String(pickAny(s, ["firstName", "fname"]) ?? "");
    const last = String(pickAny(s, ["lastName", "lname"]) ?? "");

    const fullName = String(pickAny(s, ["name", "fullName"]) ?? "");
    const split = fullName && (!first && !last) ? splitName(fullName) : null;

    setStuId(id);
    setStuFirst(split ? split.first : first);
    setStuLast(split ? split.last : last);

    setStuMajor(String(pickAny(s, ["major", "department", "dept"]) ?? ""));
    setStuEmail(String(pickAny(s, ["email", "mail"]) ?? ""));
    setStuPhone(String(pickAny(s, ["phone", "mobile"]) ?? ""));

    setStuPass("");
    setHint("Student loaded into form (Edit mode).");
  }

  async function submitStudent() {
    clearMessages();
    if (!stuId.trim()) return setError("Student ID is required.");
    if (stuMode === "add" && !stuPass.trim())
      return setError("Password is required when adding a new student.");

    setLoading(true);
    try {
      const payload = {
        id: stuId.trim(),
        firstName: stuFirst.trim() || undefined,
        lastName: stuLast.trim() || undefined,
        major: stuMajor.trim() || undefined,
        email: stuEmail.trim() || undefined,
        phone: stuPhone.trim() || undefined,
        password: stuPass.trim() || undefined,
      };

      let res: any;
      if (stuMode === "add") res = await addStudent(payload as any);
      else res = await updateStudent(payload as any);

      setHint((res && res.message) || "Done.");
      await loadStudents();
      resetStudentForm();
    } catch (e) {
      setError(pickMsg(e));
    } finally {
      setLoading(false);
    }
  }

  async function removeStudent(id: string) {
    clearMessages();
    if (!confirm(`Delete student ${id}?`)) return;
    setLoading(true);
    try {
      const res: any = await deleteStudent(id);
      setHint(res?.message || "Student deleted.");
      await loadStudents();
    } catch (e) {
      setError(pickMsg(e));
    } finally {
      setLoading(false);
    }
  }

  // ===== TEACHERS =====
  function resetTeacherForm() {
    setTId("");
    setTFirst("");
    setTLast("");
    setTDept("");
    setTEmail("");
    setTPhone("");
    setTPass("");
    setTMode("add");
  }

  function fillTeacherFromRow(t: any) {
    setTMode("edit");

    const id = String(pickAny(t, ["id", "teacherId"]) ?? "");
    const first = String(pickAny(t, ["firstName", "fname"]) ?? "");
    const last = String(pickAny(t, ["lastName", "lname"]) ?? "");

    const fullName = String(pickAny(t, ["name", "fullName"]) ?? "");
    const split = fullName && (!first && !last) ? splitName(fullName) : null;

    setTId(id);
    setTFirst(split ? split.first : first);
    setTLast(split ? split.last : last);

    setTDept(String(pickAny(t, ["department", "dept", "major"]) ?? ""));
    setTEmail(String(pickAny(t, ["email", "mail"]) ?? ""));
    setTPhone(String(pickAny(t, ["phone", "mobile"]) ?? ""));

    setTPass("");
    setHint("Teacher loaded into form (Edit mode).");
  }

  async function submitTeacher() {
    clearMessages();
    if (!tId.trim()) return setError("Teacher ID is required.");
    if (tMode === "add" && !tPass.trim())
      return setError("Password is required when adding a new teacher.");

    setLoading(true);
    try {
      const payload = {
        id: tId.trim(),
        firstName: tFirst.trim() || undefined,
        lastName: tLast.trim() || undefined,
        department: tDept.trim() || undefined,
        email: tEmail.trim() || undefined,
        phone: tPhone.trim() || undefined,
        password: tPass.trim() || undefined,
      };

      let res: any;
      if (tMode === "add") res = await addTeacher(payload as any);
      else res = await updateTeacher(payload as any);

      setHint(res?.message || "Done.");
      await loadTeachers();
      resetTeacherForm();
    } catch (e) {
      setError(pickMsg(e));
    } finally {
      setLoading(false);
    }
  }

  async function removeTeacher(id: string) {
    clearMessages();
    if (!confirm(`Delete teacher ${id}?`)) return;
    setLoading(true);
    try {
      const res: any = await deleteTeacher(id);
      setHint(res?.message || "Teacher deleted.");
      await loadTeachers();
    } catch (e) {
      setError(pickMsg(e));
    } finally {
      setLoading(false);
    }
  }

  // ===== COURSES =====
  function resetCourseForm() {
    setCCode("");
    setCName("");
    setCCredit("3");
    setCDept("");
    setCDays("");
    setCTime("");
    setCRoom("");
    setCInstructor("");
    setCMode("add");
  }

  function fillCourseFromRow(c: any) {
    setCMode("edit");
    setCCode(String(c?.code ?? ""));
    setCName(String(c?.name ?? ""));
    setCCredit(String(c?.creditHours ?? c?.credits ?? "3"));
    setCDept(String(c?.department ?? ""));
    setCDays(String(c?.days ?? c?.day ?? ""));
    setCTime(String(c?.time ?? ""));
    setCRoom(String(c?.room ?? ""));
    setCInstructor(String(c?.instructor ?? c?.teacherId ?? ""));
    setHint("Course loaded into form (Edit mode).");
  }

  async function submitCourse() {
    clearMessages();
    if (!cCode.trim()) return setError("Course code is required.");
    setLoading(true);
    try {
      const payload = {
        code: cCode.trim(),
        name: cName.trim() || undefined,
        creditHours: cCredit.trim() || undefined,
        department: cDept.trim() || undefined,
        days: cDays.trim() || undefined,
        time: cTime.trim() || undefined,
        room: cRoom.trim() || undefined,
        instructor: cInstructor.trim() || undefined,
      };

      let res: any;
      if (cMode === "add") res = await addCourse(payload as any);
      else res = await updateCourse(payload as any);

      setHint(res?.message || "Done.");
      await loadCourses();
      resetCourseForm();
    } catch (e) {
      setError(pickMsg(e));
    } finally {
      setLoading(false);
    }
  }

  async function removeCourse(code: string) {
    clearMessages();
    if (!confirm(`Delete course ${code}?`)) return;
    setLoading(true);
    try {
      const res: any = await deleteCourse(code);
      setHint(res?.message || "Course deleted.");
      await loadCourses();
    } catch (e) {
      setError(pickMsg(e));
    } finally {
      setLoading(false);
    }
  }

  // ===== ANNOUNCEMENTS =====
  function resetAnnForm() {
    setAId("");
    setATitle("");
    setAMsg("");
    setATarget("All");
    setAMode("add");
  }

  function fillAnnFromRow(a: any) {
    setAMode("edit");
    setAId(a?.id ?? "");
    setATitle(String(a?.title ?? ""));
    setAMsg(String(a?.message ?? a?.body ?? ""));
    const t = String(a?.target ?? "All");
    setATarget(t === "Admin" ? "All" : t);
    setHint("Announcement loaded into form (Edit mode).");
  }

  async function submitAnnouncement() {
    clearMessages();
    if (!aTitle.trim() || !aMsg.trim())
      return setError("Title and message are required.");

    const target = (aTarget || "All").trim();
    if (target === "Admin") return setError("Target 'Admin' is not allowed.");

    setLoading(true);
    try {
      const payload: any = {
        title: aTitle.trim(),
        message: aMsg.trim(),
        target,
      };

      let res: any;
      if (aMode === "add") {
        res = await postSystemAnnouncement(payload);
      } else {
        if (!aId) return setError("Announcement ID is required for edit.");
        res = await updateSystemAnnouncement({ ...payload, id: aId } as any);
      }

      setHint(res?.message || "Done.");
      await loadAnnouncements();
      resetAnnForm();
    } catch (e) {
      setError(pickMsg(e));
    } finally {
      setLoading(false);
    }
  }

  async function removeAnnouncement(id: string | number) {
    clearMessages();
    if (!confirm(`Delete announcement ${id}?`)) return;
    setLoading(true);
    try {
      const res: any = await deleteSystemAnnouncement(Number(id));
      setHint(res?.message || "Announcement deleted.");
      await loadAnnouncements();
    } catch (e) {
      setError(pickMsg(e));
    } finally {
      setLoading(false);
    }
  }

  // ===== SEMESTER =====
  async function submitSemester() {
    clearMessages();

    if (!semester.trim()) return setError("Semester name is required.");
    if (!classStart || !classEnd || !withdrawISO)
      return setError("All dates are required.");

    const s = parseISO(classStart);
    const e = parseISO(classEnd);
    const w = parseISO(withdrawISO);

    if (!s || !e || !w) return setError("Invalid date value.");

    if (s.getTime() >= e.getTime()) {
      return setError("Start Date must be before End Date.");
    }

    if (w.getTime() < s.getTime() || w.getTime() > e.getTime()) {
      return setError("Withdraw Deadline must be between Start Date and End Date.");
    }

    setLoading(true);
    try {
      const payload: any = {
        semester: semester.trim(),
        startDate: toBackendDMY(classStart),
        endDate: toBackendDMY(classEnd),
        withdrawDate: toBackendDMY(withdrawISO),
      };

      const res: any = await updateSemesterTimeline(payload);
      setHint(res?.message || "Semester updated.");
    } catch (e) {
      setError(pickMsg(e));
    } finally {
      setLoading(false);
    }
  }

  async function submitRegistration() {
    clearMessages();

    if (!regStart || !regEnd)
      return setError("Registration start/end are required.");

    const s = parseISO(regStart);
    const e = parseISO(regEnd);
    if (!s || !e) return setError("Invalid registration date value.");

    if (s.getTime() >= e.getTime()) {
      return setError("Registration start must be before end.");
    }

    const days = diffDaysCeil(regStart, regEnd);
    if (!Number.isFinite(days)) return setError("Invalid registration date range.");

    if (days > 30) {
      return setError("Registration cannot be open for more than 1 month.");
    }

    setLoading(true);
    try {
      const payload = {
        startDate: toBackendDMY(regStart),
        endDate: toBackendDMY(regEnd),
      };

      const res: any = await updateRegistrationDates(payload);
      setHint(res?.message || "Registration dates updated.");
    } catch (e) {
      setError(pickMsg(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveGradingRules() {
    clearMessages();
    setLoading(true);

    try {
      await updateGradingPolicies({
        gradingOpen,
        allowAssignment: allowAss,
        allowMidterm: allowMid,
        allowFinal: allowFin,
      });

      setHint("✅ Grading policies updated successfully.");
    } catch (e: any) {
      setError(pickMsg(e));
    } finally {
      setLoading(false);
    }
  }

  // ===== EXAMS =====
  function addExamRow() {
    setExamRows((prev) => [
      ...prev,
      { courseCode: "", type: "Mid", date: "", time: "", room: "" },
    ]);
  }

  function removeExamRow(index: number) {
    setExamRows((prev) => prev.filter((_, i) => i !== index));
  }

  function updateExamRow(index: number, key: keyof ExamRow, value: any) {
    setExamRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [key]: value } : r))
    );
  }

  async function submitAllExamRows() {
    clearMessages();

    if (!examRows.length) return setError("Add at least 1 row.");

    for (let i = 0; i < examRows.length; i++) {
      const r = examRows[i];
      if (!r.courseCode.trim()) return setError(`Row ${i + 1}: Course is required.`);
      if (!r.type) return setError(`Row ${i + 1}: Type is required.`);
      if (!r.date.trim()) return setError(`Row ${i + 1}: Date is required.`);
      if (!r.time.trim()) return setError(`Row ${i + 1}: Time is required.`);
      if (!r.room.trim()) return setError(`Row ${i + 1}: Room is required.`);
    }

    setLoading(true);
    try {
      for (let i = 0; i < examRows.length; i++) {
        const r = examRows[i];
        await setExamScheduleOne({
          courseCode: r.courseCode.trim(),
          type: r.type,
          date: r.date.trim(),
          time: r.time.trim(),
          room: r.room.trim(),
        });
      }
      setHint("Exam schedule saved.");
    } catch (e) {
      setError(pickMsg(e));
    } finally {
      setLoading(false);
    }
  }

  async function submitSingleRow(index: number) {
    clearMessages();
    const r = examRows[index];
    if (!r) return;

    if (!r.courseCode.trim()) return setError(`Row ${index + 1}: Course is required.`);
    if (!r.type) return setError(`Row ${index + 1}: Type is required.`);
    if (!r.date.trim()) return setError(`Row ${index + 1}: Date is required.`);
    if (!r.time.trim()) return setError(`Row ${index + 1}: Time is required.`);
    if (!r.room.trim()) return setError(`Row ${index + 1}: Room is required.`);

    setLoading(true);
    try {
      const res: any = await setExamScheduleOne({
        courseCode: r.courseCode.trim(),
        type: r.type,
        date: r.date.trim(),
        time: r.time.trim(),
        room: r.room.trim(),
      });
      setHint(res?.message || `Row ${index + 1} saved.`);
    } catch (e) {
      setError(pickMsg(e));
    } finally {
      setLoading(false);
    }
  }

  // ===== PROFILE =====
  async function saveProfile() {
    clearMessages();
    setLoading(true);
    try {
      const payload: any = {
        username: adminUsername,
        fullName: pName.trim(),
        email: pEmail.trim(),
        phone: pPhone.trim() || undefined,
        department: pDepartment.trim() || undefined,
      };

      const res: any = await updateAdminProfile(payload);
      setHint(res?.message || "Profile updated.");
      await loadProfile();
    } catch (e) {
      setError(pickMsg(e));
    } finally {
      setLoading(false);
    }
  }

  async function savePassword() {
    clearMessages();
    if (!oldPass.trim() || !newPass.trim())
      return setError("Enter current and new password.");
    if (newPass.trim().length < 4)
      return setError("New password must be at least 4 characters.");
    if (confirmPass && confirmPass.trim() !== newPass.trim())
      return setError("Password confirmation mismatch.");

    setLoading(true);
    try {
      const payload: any = {
        username: adminUsername,
        oldPassword: oldPass.trim(),
        newPassword: newPass.trim(),
        confirmPassword: confirmPass.trim() || newPass.trim(),
      };

      const res: any = await changeAdminPassword(payload);
      setHint(res?.message || "Password changed.");
      setOldPass("");
      setNewPass("");
      setConfirmPass("");
    } catch (e) {
      setError(pickMsg(e));
    } finally {
      setLoading(false);
    }
  }

  // ===== FILTERS =====
  const studentsFiltered = useMemo(() => {
    const q = qStudent.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => {
      const id = String(s?.id ?? "").toLowerCase();
      const n = String(
        s?.name ?? `${s?.firstName ?? ""} ${s?.lastName ?? ""}`
      ).toLowerCase();
      const m = String(s?.major ?? "").toLowerCase();
      return id.includes(q) || n.includes(q) || m.includes(q);
    });
  }, [students, qStudent]);

  const teachersFiltered = useMemo(() => {
    const q = qTeacher.trim().toLowerCase();
    if (!q) return teachers;
    return teachers.filter((t) => {
      const id = String(t?.id ?? "").toLowerCase();
      const n = String(
        t?.name ?? `${t?.firstName ?? ""} ${t?.lastName ?? ""}`
      ).toLowerCase();
      const d = String(t?.department ?? "").toLowerCase();
      return id.includes(q) || n.includes(q) || d.includes(q);
    });
  }, [teachers, qTeacher]);

  const coursesFiltered = useMemo(() => {
    const q = qCourse.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((c) => {
      const code = String(c?.code ?? "").toLowerCase();
      const name = String(c?.name ?? "").toLowerCase();
      const dept = String(c?.department ?? "").toLowerCase();
      return code.includes(q) || name.includes(q) || dept.includes(q);
    });
  }, [courses, qCourse]);

  const announcementsFiltered = useMemo(() => {
    const q = qAnn.trim().toLowerCase();
    if (!q) return announcements;
    return announcements.filter((a) => {
      const title = String(a?.title ?? "").toLowerCase();
      const msg = String(a?.message ?? a?.body ?? "").toLowerCase();
      const target = String(a?.target ?? "").toLowerCase();
      return title.includes(q) || msg.includes(q) || target.includes(q);
    });
  }, [announcements, qAnn]);

  const ringData = useMemo(() => {
    const s = stats || {};
    const rows = [
      { key: "students", label: "Students", value: Number(s.totalStudents ?? 0) },
      { key: "teachers", label: "Teachers", value: Number(s.totalTeachers ?? 0) },
      { key: "courses", label: "Courses", value: Number(s.totalCourses ?? 0) },
    ];
    const max = Math.max(1, ...rows.map((r) => r.value || 0));
    return rows.map((r) => ({
      ...r,
      percent: Math.max(0, Math.min(100, Math.round((r.value / max) * 100))),
    }));
  }, [stats]);

  function goCreate(which: "student" | "teacher" | "course" | "announcement") {
    setCreateOpen(false);
    clearMessages();

    if (which === "student") {
      resetStudentForm();
      setStuMode("add");
      setActive("students");
      setHint("Create Student: fill the form and click Add.");
      return;
    }
    if (which === "teacher") {
      resetTeacherForm();
      setTMode("add");
      setActive("teachers");
      setHint("Create Teacher: fill the form and click Add.");
      return;
    }
    if (which === "course") {
      resetCourseForm();
      setCMode("add");
      setActive("courses");
      setHint("Create Course: fill the form and click Add.");
      return;
    }
    resetAnnForm();
    setAMode("add");
    setATarget("All");
    setActive("announcements");
    setHint("Create Announcement: fill the form and click Post.");
  }

  return (
    <div className="ad-dashboard" dir="ltr">
      <header className="ad-topbar">
        <div className="ad-brand">
          <img src="/logo.png" alt="BAU" className="ad-logo" />
          <div>
            <div className="ad-brand-title">BAU Student Portal</div>
            <div className="ad-brand-sub">Admin Dashboard</div>
          </div>
        </div>

        <div className="ad-top-actions">
          <div className="ad-top-user">{safeName}</div>
          <button className="ad-logout" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </header>

      <div className="ad-shell">
        <aside className="ad-sidebar">
          <div className="ad-usercard">
            <img
              className="ad-avatar"
              src="/avatar.png"
              onError={(e) => {
                e.currentTarget.src =
                  "https://ui-avatars.com/api/?name=" +
                  encodeURIComponent(String(profile?.fullName || safeName || "Admin"));
              }}
              alt="avatar"
            />
            <div className="ad-user-meta">
              <div className="ad-user-name">{profile?.fullName || safeName}</div>
              <div className="ad-user-id">Username: {adminUsername}</div>
              <div className="ad-user-major">
                {profile?.department || "Administration"}
              </div>
            </div>
          </div>

          <nav className="ad-nav">
            <button
              className={active === "dashboard" ? "ad-link active" : "ad-link"}
              onClick={() => setActive("dashboard")}
            >
              🧾 Dashboard
            </button>
            <button
              className={active === "students" ? "ad-link active" : "ad-link"}
              onClick={() => setActive("students")}
            >
              👨‍🎓 Students
            </button>
            <button
              className={active === "teachers" ? "ad-link active" : "ad-link"}
              onClick={() => setActive("teachers")}
            >
              👨‍🏫 Teachers
            </button>
            <button
              className={active === "courses" ? "ad-link active" : "ad-link"}
              onClick={() => setActive("courses")}
            >
              📚 Courses
            </button>
            <button
              className={
                active === "announcements" ? "ad-link active" : "ad-link"
              }
              onClick={() => setActive("announcements")}
            >
              📢 Announcements
            </button>
            <button
              className={active === "semester" ? "ad-link active" : "ad-link"}
              onClick={() => setActive("semester")}
            >
              🗓️ Semester
            </button>
            <button
              className={active === "exams" ? "ad-link active" : "ad-link"}
              onClick={() => setActive("exams")}
            >
              📝 Exam Schedule
            </button>
            <button
              className={active === "profile" ? "ad-link active" : "ad-link"}
              onClick={() => setActive("profile")}
            >
              👤 Profile
            </button>
          </nav>
        </aside>

        <main className="ad-main">
          {(loading || error || hint) && (
            <div className="ad-alerts">
              {loading && <div className="ad-alert info">Loading...</div>}
              {error && <div className="ad-alert danger">{error}</div>}
              {hint && <div className="ad-alert success">{hint}</div>}
            </div>
          )}

          {/* ===== dashboard ===== */}
          {active === "dashboard" && (
            <div className="ad-center">
              <section className="ad-welcome">
                <img
                  className="ad-welcome-avatar"
                  src="/avatar.png"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://ui-avatars.com/api/?name=" +
                      encodeURIComponent(String(profile?.fullName || safeName || "Admin"));
                  }}
                  alt="avatar"
                />
                <div className="ad-welcome-text">
                  <div className="ad-welcome-title">
                    Welcome back, {safeName}!
                  </div>
                </div>

                <div className="ad-welcome-actions" ref={createRef}>
                  <button
                    className="ad-btn"
                    type="button"
                    onClick={() => setCreateOpen((v) => !v)}
                    aria-expanded={createOpen}
                  >
                    ➕ Create
                  </button>

                  {createOpen && (
                    <div className="ad-menu" role="menu">
                      <button
                        className="ad-menu-item"
                        type="button"
                        onClick={() => goCreate("student")}
                      >
                        Create Student
                      </button>
                      <button
                        className="ad-menu-item"
                        type="button"
                        onClick={() => goCreate("teacher")}
                      >
                        Create Teacher
                      </button>
                      <button
                        className="ad-menu-item"
                        type="button"
                        onClick={() => goCreate("course")}
                      >
                        Create Course
                      </button>
                      <button
                        className="ad-menu-item"
                        type="button"
                        onClick={() => goCreate("announcement")}
                      >
                        Create Announcement
                      </button>
                      <div className="ad-menu-sep" />
                      <button
                        className="ad-menu-item ghost"
                        type="button"
                        onClick={loadDashboard}
                      >
                        Refresh Stats
                      </button>
                    </div>
                  )}
                </div>
              </section>

              <section className="ad-cards">
                <div className="ad-stat-card">
                  <div className="ad-stat-top">
                    <div>
                      <div className="ad-stat-label">Students</div>
                      <div className="ad-stat-sub">Total</div>
                    </div>
                    <div className="ad-stat-ico">👨‍🎓</div>
                  </div>
                  <div className="ad-stat-num">{stats?.totalStudents ?? "-"}</div>
                </div>

                <div className="ad-stat-card">
                  <div className="ad-stat-top">
                    <div>
                      <div className="ad-stat-label">Teachers</div>
                      <div className="ad-stat-sub">Total</div>
                    </div>
                    <div className="ad-stat-ico">👨‍🏫</div>
                  </div>
                  <div className="ad-stat-num">{stats?.totalTeachers ?? "-"}</div>
                </div>

                <div className="ad-stat-card">
                  <div className="ad-stat-top">
                    <div>
                      <div className="ad-stat-label">Courses</div>
                      <div className="ad-stat-sub">Total</div>
                    </div>
                    <div className="ad-stat-ico">📚</div>
                  </div>
                  <div className="ad-stat-num">{stats?.totalCourses ?? "-"}</div>
                </div>
              </section>

              <section className="ad-card">
                <div className="ad-card-head">
                  <div>
                    <div className="ad-card-title">📈 System Snapshot</div>
                  </div>
                </div>

                <div className="ad-ring-grid">
                  {ringData.map((r) => (
                    <div key={r.key} className="ad-ring">
                      <div
                        className={`ad-ring-circle ${r.key}`}
                        style={{ ["--p" as any]: r.percent }}
                      >
                        <div className="ad-ring-inner">
                          <div className="ad-ring-value">
                            {Number.isFinite(r.value) ? r.value : "-"}
                          </div>
                          <div className="ad-ring-label">{r.label}</div>
                        </div>
                      </div>
                      <div className="ad-ring-foot">
                        <span className="ad-muted">{r.percent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ===== students ===== */}
          {active === "students" && (
            <div className="ad-tabs-wrap">
              <div className="ad-card">
                <div className="ad-card-head">
                  <div className="ad-card-title">👨‍🎓 Students</div>
                  <input
                    className="ad-search"
                    value={qStudent}
                    onChange={(e) => setQStudent(e.target.value)}
                    placeholder="Search: ID / name / major"
                  />
                </div>

                <div className="ad-form">
                  <div className="ad-form-title">
                    {stuMode === "add" ? "Add Student" : "Edit Student"}
                  </div>

                  <div className="ad-form-grid">
                    <div className="ad-field">
                      <label>Student ID *</label>
                      <input
                        value={stuId}
                        onChange={(e) => setStuId(e.target.value)}
                        placeholder="e.g. 32201234"
                      />
                    </div>

                    <div className="ad-field">
                      <label>Password {stuMode === "add" ? "*" : "(optional)"}</label>
                      <input
                        type="password"
                        value={stuPass}
                        onChange={(e) => setStuPass(e.target.value)}
                        placeholder={
                          stuMode === "add" ? "Enter password" : "Set / reset password"
                        }
                      />
                    </div>

                    <div className="ad-field">
                      <label>First Name</label>
                      <input value={stuFirst} onChange={(e) => setStuFirst(e.target.value)} />
                    </div>

                    <div className="ad-field">
                      <label>Last Name</label>
                      <input value={stuLast} onChange={(e) => setStuLast(e.target.value)} />
                    </div>

                    <div className="ad-field">
                      <label>Major</label>
                      <input value={stuMajor} onChange={(e) => setStuMajor(e.target.value)} />
                    </div>

                    <div className="ad-field">
                      <label>Email</label>
                      <input value={stuEmail} onChange={(e) => setStuEmail(e.target.value)} />
                    </div>

                    <div className="ad-field">
                      <label>Phone</label>
                      <input value={stuPhone} onChange={(e) => setStuPhone(e.target.value)} />
                    </div>
                  </div>

                  <div className="ad-form-actions">
                    <button className="ad-btn" onClick={submitStudent} type="button">
                      {stuMode === "add" ? "Add" : "Update"}
                    </button>
                    <button className="ad-btn ghost" onClick={resetStudentForm} type="button">
                      Clear
                    </button>
                    <button className="ad-btn ghost" onClick={loadStudents} type="button">
                      Refresh List
                    </button>
                  </div>
                </div>

                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Major</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsFiltered.map((s) => {
                        const id = String(s?.id ?? s?.studentId ?? "");
                        const name = String(
                          s?.name ?? `${s?.firstName ?? ""} ${s?.lastName ?? ""}`
                        ).trim();
                        const major = String(s?.major ?? "");
                        return (
                          <tr key={id || String(s?.email ?? name)}>
                            <td>{id}</td>
                            <td>{name || "-"}</td>
                            <td>{major || "-"}</td>
                            <td style={{ textAlign: "right" }}>
                              <div className="ad-actions">
                                <button
                                  className="ad-btn ghost"
                                  onClick={() => fillStudentFromRow(s)}
                                  type="button"
                                >
                                  Edit
                                </button>
                                <button
                                  className="ad-btn danger"
                                  onClick={() => removeStudent(id)}
                                  type="button"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {studentsFiltered.length === 0 && (
                        <tr>
                          <td colSpan={4} className="ad-muted" style={{ padding: 14 }}>
                            No students found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===== teachers ===== */}
          {active === "teachers" && (
            <div className="ad-tabs-wrap">
              <div className="ad-card">
                <div className="ad-card-head">
                  <div className="ad-card-title">👨‍🏫 Teachers</div>
                  <input
                    className="ad-search"
                    value={qTeacher}
                    onChange={(e) => setQTeacher(e.target.value)}
                    placeholder="Search: ID / name / department"
                  />
                </div>

                <div className="ad-form">
                  <div className="ad-form-title">
                    {tMode === "add" ? "Add Teacher" : "Edit Teacher"}
                  </div>

                  <div className="ad-form-grid">
                    <div className="ad-field">
                      <label>Teacher ID *</label>
                      <input
                        value={tId}
                        onChange={(e) => setTId(e.target.value)}
                        placeholder="e.g. T1001"
                      />
                    </div>

                    <div className="ad-field">
                      <label>Password {tMode === "add" ? "*" : "(optional)"}</label>
                      <input
                        type="password"
                        value={tPass}
                        onChange={(e) => setTPass(e.target.value)}
                        placeholder={
                          tMode === "add" ? "Enter password" : "Set / reset password"
                        }
                      />
                    </div>

                    <div className="ad-field">
                      <label>First Name</label>
                      <input value={tFirst} onChange={(e) => setTFirst(e.target.value)} />
                    </div>

                    <div className="ad-field">
                      <label>Last Name</label>
                      <input value={tLast} onChange={(e) => setTLast(e.target.value)} />
                    </div>

                    <div className="ad-field">
                      <label>Department</label>
                      <input value={tDept} onChange={(e) => setTDept(e.target.value)} />
                    </div>

                    <div className="ad-field">
                      <label>Email</label>
                      <input value={tEmail} onChange={(e) => setTEmail(e.target.value)} />
                    </div>

                    <div className="ad-field">
                      <label>Phone</label>
                      <input value={tPhone} onChange={(e) => setTPhone(e.target.value)} />
                    </div>
                  </div>

                  <div className="ad-form-actions">
                    <button className="ad-btn" onClick={submitTeacher} type="button">
                      {tMode === "add" ? "Add" : "Update"}
                    </button>
                    <button className="ad-btn ghost" onClick={resetTeacherForm} type="button">
                      Clear
                    </button>
                    <button className="ad-btn ghost" onClick={loadTeachers} type="button">
                      Refresh List
                    </button>
                  </div>
                </div>

                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Department</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachersFiltered.map((t) => {
                        const id = String(t?.id ?? t?.teacherId ?? "");
                        const name = String(
                          t?.name ?? `${t?.firstName ?? ""} ${t?.lastName ?? ""}`
                        ).trim();
                        const dept = String(t?.department ?? t?.dept ?? "");
                        return (
                          <tr key={id || String(t?.email ?? name)}>
                            <td>{id}</td>
                            <td>{name || "-"}</td>
                            <td>{dept || "-"}</td>
                            <td style={{ textAlign: "right" }}>
                              <div className="ad-actions">
                                <button
                                  className="ad-btn ghost"
                                  onClick={() => fillTeacherFromRow(t)}
                                  type="button"
                                >
                                  Edit
                                </button>
                                <button
                                  className="ad-btn danger"
                                  onClick={() => removeTeacher(id)}
                                  type="button"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {teachersFiltered.length === 0 && (
                        <tr>
                          <td colSpan={4} className="ad-muted" style={{ padding: 14 }}>
                            No teachers found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===== courses ===== */}
          {active === "courses" && (
            <div className="ad-tabs-wrap">
              <div className="ad-card">
                <div className="ad-card-head">
                  <div className="ad-card-title">📚 Courses</div>
                  <input
                    className="ad-search"
                    value={qCourse}
                    onChange={(e) => setQCourse(e.target.value)}
                    placeholder="Search: code / name / department"
                  />
                </div>

                <div className="ad-form">
                  <div className="ad-form-title">
                    {cMode === "add" ? "Add Course" : "Edit Course"}
                  </div>

                  <div className="ad-form-grid">
                    <div className="ad-field">
                      <label>Code *</label>
                      <input value={cCode} onChange={(e) => setCCode(e.target.value)} />
                    </div>

                    <div className="ad-field">
                      <label>Name</label>
                      <input value={cName} onChange={(e) => setCName(e.target.value)} />
                    </div>

                    <div className="ad-field">
                      <label>Credit Hours</label>
                      <input value={cCredit} onChange={(e) => setCCredit(e.target.value)} />
                    </div>

                    <div className="ad-field">
                      <label>Department</label>
                      <input value={cDept} onChange={(e) => setCDept(e.target.value)} />
                    </div>

                    <div className="ad-field">
                      <label>Instructor (ID/Name)</label>
                      <input
                        value={cInstructor}
                        onChange={(e) => setCInstructor(e.target.value)}
                      />
                    </div>

                    <div className="ad-field">
                      <label>Days (e.g. Sun,Tue,Thu)</label>
                      <input value={cDays} onChange={(e) => setCDays(e.target.value)} />
                    </div>

                    <div className="ad-field">
                      <label>Time (e.g. 10:00-11:00)</label>
                      <input value={cTime} onChange={(e) => setCTime(e.target.value)} />
                    </div>

                    <div className="ad-field">
                      <label>Room</label>
                      <input value={cRoom} onChange={(e) => setCRoom(e.target.value)} />
                    </div>
                  </div>

                  <div className="ad-form-actions">
                    <button className="ad-btn" onClick={submitCourse} type="button">
                      {cMode === "add" ? "Add" : "Update"}
                    </button>
                    <button className="ad-btn ghost" onClick={resetCourseForm} type="button">
                      Clear
                    </button>
                    <button className="ad-btn ghost" onClick={loadCourses} type="button">
                      Refresh List
                    </button>
                  </div>
                </div>

                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Credits</th>
                        <th>Days / Time</th>
                        <th>Instructor</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coursesFiltered.map((c) => {
                        const code = String(c?.code ?? "");
                        const name = String(c?.name ?? "");
                        const credit = String(c?.creditHours ?? "");
                        const days = String(c?.days ?? c?.day ?? "");
                        const time = String(c?.time ?? "");
                        const instructor = String(c?.instructor ?? "");
                        return (
                          <tr key={code || name}>
                            <td>{code}</td>
                            <td>{name || "-"}</td>
                            <td>{credit || "-"}</td>
                            <td>
                              {days || "-"} / {time || "-"}
                            </td>
                            <td>{instructor || "-"}</td>
                            <td style={{ textAlign: "right" }}>
                              <div className="ad-actions">
                                <button
                                  className="ad-btn ghost"
                                  onClick={() => fillCourseFromRow(c)}
                                  type="button"
                                >
                                  Edit
                                </button>
                                <button
                                  className="ad-btn danger"
                                  onClick={() => removeCourse(code)}
                                  type="button"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {coursesFiltered.length === 0 && (
                        <tr>
                          <td colSpan={6} className="ad-muted" style={{ padding: 14 }}>
                            No courses found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===== announcements ===== */}
          {active === "announcements" && (
            <div className="ad-tabs-wrap">
              <div className="ad-card">
                <div className="ad-card-head">
                  <div className="ad-card-title">📢 Announcements</div>
                  <input
                    className="ad-search"
                    value={qAnn}
                    onChange={(e) => setQAnn(e.target.value)}
                    placeholder="Search: title / message / target"
                  />
                </div>

                <div className="ad-form">
                  <div className="ad-form-title">
                    {aMode === "add" ? "Post Announcement" : "Edit Announcement"}
                  </div>

                  <div className="ad-form-grid">
                    {aMode === "edit" && (
                      <div className="ad-field">
                        <label>Announcement ID *</label>
                        <input value={String(aId)} onChange={(e) => setAId(e.target.value)} />
                      </div>
                    )}

                    <div className="ad-field" style={{ gridColumn: "1 / -1" }}>
                      <label>Title</label>
                      <input value={aTitle} onChange={(e) => setATitle(e.target.value)} />
                    </div>

                    <div className="ad-field" style={{ gridColumn: "1 / -1" }}>
                      <label>Message</label>
                      <input value={aMsg} onChange={(e) => setAMsg(e.target.value)} />
                    </div>

                    <div className="ad-field">
                      <label>Target</label>
                      <select value={aTarget} onChange={(e) => setATarget(e.target.value)}>
                        <option value="Student">Student</option>
                        <option value="Teacher">Teacher</option>
                        <option value="All">All</option>
                      </select>
                    </div>
                  </div>

                  <div className="ad-form-actions">
                    <button className="ad-btn" onClick={submitAnnouncement} type="button">
                      {aMode === "add" ? "Post" : "Update"}
                    </button>
                    <button className="ad-btn ghost" onClick={resetAnnForm} type="button">
                      Clear
                    </button>
                    <button className="ad-btn ghost" onClick={loadAnnouncements} type="button">
                      Refresh List
                    </button>
                  </div>
                </div>

                <div className="ad-ann-list">
                  {announcementsFiltered.map((a) => (
                    <div className="ad-ann" key={String(a?.id ?? "")}>
                      <div className="ad-ann-main">
                        <div className="ad-ann-title">{a?.title ?? "-"}</div>
                        <div className="ad-ann-body">{a?.message ?? a?.body ?? "-"}</div>
                        <div className="ad-muted" style={{ marginTop: 6 }}>
                          ID: {String(a?.id ?? "-")}
                          {a?.target ? ` • Target: ${a.target}` : ""}
                          {a?.date ? ` • Date: ${a.date}` : ""}
                        </div>
                      </div>
                      <div className="ad-actions">
                        <button className="ad-btn ghost" onClick={() => fillAnnFromRow(a)} type="button">
                          Edit
                        </button>
                        <button className="ad-btn danger" onClick={() => removeAnnouncement(a?.id)} type="button">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {announcementsFiltered.length === 0 && (
                    <div className="ad-muted">No announcements.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===== semester FORMS  ===== */}
          {active === "semester" && (
            <div className="ad-tabs-wrap" style={{ display: "grid", gap: 16 }}>
              {/* Form A */}
              <div className="ad-card">
                <div className="ad-card-head">
                  <div>
                    <div className="ad-card-title">🗓️ Manage Semester Duration</div>
                  </div>
                </div>

                <div className="ad-form">
                  <div className="ad-form-title">Semester Timeline (Long Duration)</div>

                  <div className="ad-form-grid">
                    <div className="ad-field">
                      <label>Semester Name</label>
                      <input
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        placeholder="Spring2026"
                      />
                    </div>

                    <div className="ad-field">
                      <label>Classes Start Date</label>
                      <input
                        type="date"
                        value={classStart}
                        onChange={(e) => setClassStart(e.target.value)}
                      />
                    </div>

                    <div className="ad-field">
                      <label>Classes End Date</label>
                      <input
                        type="date"
                        value={classEnd}
                        onChange={(e) => setClassEnd(e.target.value)}
                      />
                    </div>

                    <div className="ad-field">
                      <label>Withdraw Deadline</label>
                      <input
                        type="date"
                        value={withdrawISO}
                        onChange={(e) => setWithdrawISO(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="ad-form-actions">
                    <button className="ad-btn" type="button" onClick={submitSemester}>
                      Save Semester Timeline
                    </button>
                  </div>
                </div>
              </div>

              {/* Form B */}
              <div className="ad-card">
                <div className="ad-card-head">
                  <div>
                    <div className="ad-card-title">🧾 Open/Close Registration</div>
                  </div>
                </div>

                <div className="ad-form">
                  <div className="ad-form-title">Registration Window (Short Duration)</div>

                  <div className="ad-form-grid">
                    <div className="ad-field">
                      <label>Registration Start</label>
                      <input
                        type="date"
                        value={regStart}
                        onChange={(e) => setRegStart(e.target.value)}
                      />
                    </div>

                    <div className="ad-field">
                      <label>Registration End</label>
                      <input
                        type="date"
                        value={regEnd}
                        onChange={(e) => setRegEnd(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="ad-form-actions">
                    <button className="ad-btn" type="button" onClick={submitRegistration}>
                      Save Registration Dates
                    </button>
                  </div>
                </div>
              </div>

              {/* Form C  */}
              <div className="ad-card ad-grading-card">
                <div className="ad-card-head">
                  <div>
                    <div className="ad-card-title">🎓 Grading Control</div>
                    <div className="ad-muted">
                    </div>
                  </div>
                </div>

                <div className="ad-form ad-grading">
                  <div className="ad-form-title">Control Grading Phases</div>

                  <div className="ad-grading-list">
                    <div className="ad-checkrow">
                      <input
                        type="checkbox"
                        checked={gradingOpen}
                        onChange={(e) => setGradingOpen(e.target.checked)}
                      />
                      <div className="ad-checktext">
                        <div className="ad-checktitle">Master Grading Switch</div>
                        <div className="ad-checksub"></div>
                      </div>
                    </div>

                    <div className="ad-checkrow">
                      <input
                        type="checkbox"
                        checked={allowAss}
                        onChange={(e) => setAllowAss(e.target.checked)}
                        disabled={!gradingOpen}
                      />
                      <div className="ad-checktext">
                        <div className="ad-checktitle">Allow Assignments / Practical</div>
                      </div>
                    </div>

                    <div className="ad-checkrow">
                      <input
                        type="checkbox"
                        checked={allowMid}
                        onChange={(e) => setAllowMid(e.target.checked)}
                        disabled={!gradingOpen}
                      />
                      <div className="ad-checktext">
                        <div className="ad-checktitle">Allow Midterms</div>
                      </div>
                    </div>

                    <div className="ad-checkrow">
                      <input
                        type="checkbox"
                        checked={allowFin}
                        onChange={(e) => setAllowFin(e.target.checked)}
                        disabled={!gradingOpen}
                      />
                      <div className="ad-checktext">
                        <div className="ad-checktitle">Allow Finals</div>
                      </div>
                    </div>
                  </div>

                  <div className="ad-form-actions">
                    <button className="ad-btn" type="button" onClick={handleSaveGradingRules}>
                      Save Grading Rules
                    </button>

                    <button
                      className="ad-btn ghost"
                      type="button"
                      onClick={() => {
                        setGradingOpen(false);
                        setAllowAss(false);
                        setAllowMid(false);
                        setAllowFin(false);
                        setHint("Grading switches reset.");
                      }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== exams ===== */}
          {active === "exams" && (
            <div className="ad-tabs-wrap">
              <div className="ad-card">
                <div className="ad-card-head">
                  <div className="ad-card-title">📝 Exam Schedule</div>
                </div>

                <div className="ad-row">
                  <button className="ad-btn" type="button" onClick={addExamRow}>
                    ➕ Add Row
                  </button>
                  <button className="ad-btn" type="button" onClick={submitAllExamRows}>
                    Send All Rows
                  </button>
                  <button className="ad-btn ghost" type="button" onClick={() => loadCourses()}>
                    Refresh Courses
                  </button>
                </div>

                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Course</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Room</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {examRows.map((row, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>

                          <td>
                            <select
                              value={row.courseCode}
                              onChange={(e) => updateExamRow(idx, "courseCode", e.target.value)}
                            >
                              <option value="">Select course</option>
                              {courses.map((c) => {
                                const code = String(c?.code ?? "");
                                const name = String(c?.name ?? "");
                                return (
                                  <option key={code || name} value={code}>
                                    {code} {name ? `- ${name}` : ""}
                                  </option>
                                );
                              })}
                            </select>
                          </td>

                          <td>
                            <select
                              value={row.type}
                              onChange={(e) => updateExamRow(idx, "type", e.target.value as any)}
                            >
                              <option value="Mid">Mid</option>
                              <option value="Final">Final</option>
                            </select>
                          </td>

                          <td>
                            <input
                              type="date"
                              value={row.date}
                              onChange={(e) => updateExamRow(idx, "date", e.target.value)}
                            />
                          </td>

                          <td>
                            <input
                              value={row.time}
                              onChange={(e) => updateExamRow(idx, "time", e.target.value)}
                              placeholder="10:00-11:30"
                            />
                          </td>

                          <td>
                            <select
                              value={row.room}
                              onChange={(e) => updateExamRow(idx, "room", e.target.value)}
                            >
                              <option value="">Select room</option>
                              {ROOMS.map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td style={{ textAlign: "right" }}>
                            <div className="ad-actions">
                              <button className="ad-btn" type="button" onClick={() => submitSingleRow(idx)}>
                                Save Row
                              </button>
                              <button
                                className="ad-btn danger"
                                type="button"
                                onClick={() => removeExamRow(idx)}
                                disabled={examRows.length === 1}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===== profile ===== */}
          {active === "profile" && (
            <div className="ad-tabs-wrap">
              <div className="ad-card">
                <div className="ad-card-head">
                  <div>
                    <div className="ad-card-title">⚙️ Admin Profile</div>
                    <div className="ad-muted">
                      Username: <b>{adminUsername}</b>
                    </div>
                  </div>

                  <div className="ad-seg">
                    <button
                      className={profileTab === "info" ? "ad-seg-btn active" : "ad-seg-btn"}
                      onClick={() => setProfileTab("info")}
                      type="button"
                    >
                      Profile
                    </button>
                    <button
                      className={profileTab === "pass" ? "ad-seg-btn active" : "ad-seg-btn"}
                      onClick={() => setProfileTab("pass")}
                      type="button"
                    >
                      Password
                    </button>
                  </div>
                </div>

                <div className="ad-prof-wrap">
                  <div className="ad-prof-card">
                    <div className="ad-prof-top">
                      <img
                        className="ad-prof-avatar"
                        src="/avatar.png"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://ui-avatars.com/api/?name=" +
                            encodeURIComponent(String(profile?.fullName || pName || safeName || "Admin"));
                        }}
                        alt="avatar"
                      />
                      <div className="ad-prof-meta">
                        <div className="ad-prof-name">{profile?.fullName || pName || safeName}</div>
                        <div className="ad-muted">ADMIN</div>
                      </div>

                      <button className="ad-btn ghost" type="button" onClick={loadProfile}>
                        Reload
                      </button>
                    </div>

                    <div className="ad-prof-kv">
                      <div>
                        <span className="ad-muted">Username</span>
                        <b>{adminUsername}</b>
                      </div>
                      <div>
                        <span className="ad-muted">Email</span>
                        <b>{profile?.email || pEmail || "-"}</b>
                      </div>
                      <div>
                        <span className="ad-muted">Phone</span>
                        <b>{profile?.phone || pPhone || "-"}</b>
                      </div>
                      <div>
                        <span className="ad-muted">Department</span>
                        <b>{profile?.department || pDepartment || "-"}</b>
                      </div>
                      <div>
                        <span className="ad-muted">Role</span>
                        <b>{profile?.role || "admin"}</b>
                      </div>
                    </div>
                  </div>

                  {profileTab === "info" ? (
                    <div className="ad-form">
                      <div className="ad-form-title">Edit Profile</div>

                      <div className="ad-form-grid">
                        <div className="ad-field">
                          <label>Username</label>
                          <input value={adminUsername} disabled />
                        </div>

                        <div className="ad-field">
                          <label>Full Name</label>
                          <input
                            value={pName}
                            onChange={(e) => setPName(e.target.value)}
                            placeholder="Full name"
                          />
                        </div>

                        <div className="ad-field">
                          <label>Email</label>
                          <input
                            value={pEmail}
                            onChange={(e) => setPEmail(e.target.value)}
                            placeholder="name@bau.edu.jo"
                          />
                        </div>

                        <div className="ad-field">
                          <label>Phone</label>
                          <input
                            value={pPhone}
                            onChange={(e) => setPPhone(e.target.value)}
                            placeholder="07xxxxxxxx"
                          />
                        </div>

                        <div className="ad-field">
                          <label>Department</label>
                          <input
                            value={pDepartment}
                            onChange={(e) => setPDepartment(e.target.value)}
                            placeholder="Administration"
                          />
                        </div>
                      </div>

                      <div className="ad-form-actions">
                        <button className="ad-btn ghost" type="button" onClick={loadProfile}>
                          Cancel
                        </button>
                        <button className="ad-btn" type="button" onClick={saveProfile}>
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="ad-form">
                      <div className="ad-form-title">Change Password</div>

                      <div className="ad-form-grid">
                        <div className="ad-field">
                          <label>Current Password</label>
                          <input
                            type="password"
                            value={oldPass}
                            onChange={(e) => setOldPass(e.target.value)}
                            placeholder="Old password"
                          />
                        </div>

                        <div className="ad-field">
                          <label>New Password (≥ 4)</label>
                          <input
                            type="password"
                            value={newPass}
                            onChange={(e) => setNewPass(e.target.value)}
                            placeholder="New password"
                          />
                        </div>

                        <div className="ad-field">
                          <label>Confirm</label>
                          <input
                            type="password"
                            value={confirmPass}
                            onChange={(e) => setConfirmPass(e.target.value)}
                            placeholder="Confirm password"
                          />
                        </div>
                      </div>

                      <div className="ad-form-actions">
                        <button
                          className="ad-btn ghost"
                          type="button"
                          onClick={() => {
                            setOldPass("");
                            setNewPass("");
                            setConfirmPass("");
                          }}
                        >
                          Clear
                        </button>
                        <button className="ad-btn" type="button" onClick={savePassword}>
                          Update
                        </button>
                      </div>
                    </div>
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
