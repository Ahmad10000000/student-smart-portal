// src/pages/StudentDashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthStore";
import {
  getStudentInfo,
  getStudentCourses,
  getStudentGrades,
  getStudentSchedule,
  getStudentAnnouncements,
  getStudentSystemAnnouncements,
  getAvailableCourses,
  getRecommendedCourses,
  getScholarshipStatus,
  getStudentExams,
  registerCourse,
  dropCourse,
  withdrawCourse,
  updateStudentInfo,
  updateStudentPassword,
  getRegistrationStatus, 
} from "../api/student";

import type { ScholarshipData } from "../types";
import "./StudentDashboard.css";

type Course = {
  code: string;
  name: string;
  creditHours?: number | string;
  section?: string;
  day?: string;
  time?: string;
  room?: string;
  teacherName?: string;
  absences?: number;
  status?: string;

  enrolledCount?: number;
  maxCapacity?: number;
  isFull?: boolean;
  isRecommended?: boolean;
};

type RecommendedCourse = {
  code: string;
  name: string;
  creditHours?: number | string;
  reason?: string;
  priority?: string;
};

type ScheduleItem = {
  courseCode: string;
  courseName: string;
  day: string;
  time: string;
  room?: string;
};

type StudentInfo = {
  StudentID?: string;
  FirstName?: string;
  LastName?: string;
  Major?: string;
  CumulativeGPA?: string | number;
  Level?: string | number;
  Email?: string;

  id?: string;
  name?: string;
  fullName?: string;
  college?: string;
  major?: string;
  level?: string | number;
  gpa?: string | number;
  email?: string;
  phone?: string;
  address?: string;

  creditsFinished?: number;
  creditsRemaining?: number;
  creditsRequired?: number;
};

type Announcement = {
  id: string | number;
  title: string;
  body?: string;
  message?: string;
  createdAt?: string;
  date?: string;
  type?: string;
  courseCode?: string;
};

type GradesCourse = {
  assignment?: number;
  practical?: number;
  midterm?: number;
  final?: number;
  total?: number;
  grade?: string;
  letter?: string;
  creditHours?: number | string;
  courseCode: string;
  courseName: string;
};

type GradesSemester = {
  semesterName?: string;
  semesterGPA?: string | number;
  cumulativeGPA?: string | number;
  courses: GradesCourse[];
};

type ExamRow = {
  courseCode: string;
  courseName: string;
  midDate?: string;
  midTime?: string;
  midRoom?: string;
  finalDate?: string;
  finalTime?: string;
  finalRoom?: string;
};

type Tab =
  | "dashboard"
  | "courses"
  | "withdraw"
  | "schedule"
  | "exams"
  | "grades"
  | "announcements"
  | "scholarship"
  | "profile";

function toNumber(x: any): number {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}

function toNumOrUndef(x: any): number | undefined {
  if (x == null || x === "") return undefined;
  const n = Number(x);
  return Number.isFinite(n) ? n : undefined;
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function expandDayKeys(raw?: string): Array<"sun" | "mon" | "tue" | "wed" | "thu" | "sat"> {
  const s = (raw ?? "").toLowerCase();

  const parts = s
    .replace(/&/g, ",")
    .replace(/\s+/g, " ")
    .split(/[,/|]+/g)
    .map((x) => x.trim())
    .filter(Boolean);

  const out: Array<"sun" | "mon" | "tue" | "wed" | "thu" | "sat"> = [];
  function pushIf(k: (typeof out)[number]) {
    if (!out.includes(k)) out.push(k);
  }

  const items = parts.length ? parts : [s];
  for (const p of items) {
    if (p.includes("sun") || p.includes("الأحد")) pushIf("sun");
    else if (p.includes("mon") || p.includes("الاث") || p.includes("الإث")) pushIf("mon");
    else if (p.includes("tue") || p.includes("الثلا")) pushIf("tue");
    else if (p.includes("wed") || p.includes("الأرب")) pushIf("wed");
    else if (p.includes("thu") || p.includes("الخمي")) pushIf("thu");
    else if (p.includes("sat") || p.includes("السبت")) pushIf("sat");
  }

  return out.length ? out : ["sun"];
}

const formatScore = (val: any) => {
  if (val == null || val === "") return "-";
  return val;
};

function percentToLetter(v: any): string {
  if (v == null || v === "") return "-";
  if (typeof v === "string") {
    const t = v.trim();
    if (/^[A-DF][+-]?$/.test(t.toUpperCase())) return t.toUpperCase();
    const n = Number(t.replace("%", ""));
    if (Number.isFinite(n)) return percentToLetter(n);
    return t;
  }
  const n = Number(v);
  if (!Number.isFinite(n)) return "-";
  if (n === 0) return "-";
  if (n >= 90) return "A";
  if (n >= 85) return "A-";
  if (n >= 80) return "B+";
  if (n >= 75) return "B";
  if (n >= 70) return "B-";
  if (n >= 65) return "C+";
  if (n >= 60) return "C";
  if (n >= 55) return "C-";
  if (n >= 50) return "D+";
  if (n >= 45) return "D";
  return "F";
}

function parseSemestersFromGradesResponse(input: any): GradesSemester[] {
  const root = input?.data ?? input?.semesters ?? input?.result ?? input ?? null;
  if (!root) return [];

  const arr = Array.isArray(root) ? root : Array.isArray(root?.data) ? root.data : [];
  if (!Array.isArray(arr)) return [];

  return arr
    .map((sem: any) => {
      const coursesArr = Array.isArray(sem?.courses) ? sem.courses : [];
      const courses: GradesCourse[] = coursesArr.map((c: any) => ({
        courseCode: c.courseCode ?? c.code ?? c.CourseCode ?? "-",
        courseName: c.courseName ?? c.name ?? c.CourseName ?? "-",
        creditHours: c.creditHours ?? c.CreditHours,
        assignment: c.assignment ?? c.Assignment,
        practical: c.practical ?? c.Practical,
        midterm: c.midterm ?? c.midTerm ?? c.mid ?? c.Midterm ?? c.Mid,
        final: c.final ?? c.Final,
        total: c.total ?? c.Total,
        grade: c.grade ?? c.Grade,
        letter: c.letter ?? c.Letter,
      }));

      return {
        semesterName: sem?.semesterName ?? sem?.name ?? sem?.SemesterName,
        semesterGPA: sem?.semesterGPA ?? sem?.gpa ?? sem?.SemesterGPA,
        cumulativeGPA: sem?.cumulativeGPA ?? sem?.CumulativeGPA,
        courses,
      } as GradesSemester;
    })
    .filter((x) => x.courses.length > 0);
}

function pickBestCumulativeGpa(semesters: GradesSemester[]): number | undefined {
  for (let i = semesters.length - 1; i >= 0; i--) {
    const v = semesters[i]?.cumulativeGPA;
    const n = toNumOrUndef(v);
    if (n != null && n > 0) return n;
  }
  return undefined;
}

function isSemesterAllZeros(sem: GradesSemester): boolean {
  const courses = Array.isArray(sem?.courses) ? sem.courses : [];
  if (!courses.length) return true;

  return courses.every((c) => {
    const nums = [
      Number(c.assignment ?? 0),
      Number(c.practical ?? 0),
      Number(c.midterm ?? 0),
      Number(c.final ?? 0),
      Number(c.total ?? 0),
    ];
    return nums.every((n) => !Number.isFinite(n) || n === 0);
  });
}

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const safeUserName = user?.name ?? "";
  const displayedId = user?.id ?? "-";

  const [info, setInfo] = useState<StudentInfo | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [systemAnnouncements, setSystemAnnouncements] = useState<Announcement[]>([]);

  const [recommended, setRecommended] = useState<RecommendedCourse[]>([]);
  const [recommendedHours, setRecommendedHours] = useState<number>(0);

  const [gradeSemesters, setGradeSemesters] = useState<GradesSemester[]>([]);
  const [exams, setExams] = useState<ExamRow[]>([]);

  const [active, setActive] = useState<Tab>("dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [schData, setSchData] = useState<ScholarshipData | null>(null);
  const [schLoading, setSchLoading] = useState(false);
  const [schError, setSchError] = useState("");

  const [regClosed, setRegClosed] = useState(false);
  const [regNotice, setRegNotice] = useState("");
  const [regEndDate, setRegEndDate] = useState<string>("");

  const normalizeCourses = (arr: any): Course[] => {
    if (!Array.isArray(arr)) return [];
    return arr.map((c: any) => ({
      code: c.code ?? c.courseCode ?? c.CourseCode ?? c.Code ?? "-",
      name: c.name ?? c.courseName ?? c.CourseName ?? c.Name ?? "-",
      creditHours: c.creditHours ?? c.credits ?? c.CreditHours,
      section: c.section ?? c.Section,
      day: c.day ?? c.days ?? c.Day,
      time: c.time ?? c.Time,
      room: c.room ?? c.Room,
      teacherName: c.teacherName ?? c.instructor ?? c.TeacherName,
      absences: c.absences ?? c.Absences,
      status: c.status ?? c.Status,
      enrolledCount: c.enrolledCount ?? c.EnrolledCount,
      maxCapacity: c.maxCapacity ?? c.MaxCapacity,
      isFull: c.isFull ?? c.IsFull,
      isRecommended: c.isRecommended ?? c.IsRecommended ?? c.recommended ?? c.Recommended,
    }));
  };

  const normalizeSchedule = (arr: any): ScheduleItem[] => {
    if (!Array.isArray(arr)) return [];
    return arr.map((s: any) => ({
      courseCode: s.courseCode ?? s.code ?? s.CourseCode ?? s.Code ?? "-",
      courseName: s.courseName ?? s.name ?? s.CourseName ?? s.Name ?? "",
      day: s.day ?? s.days ?? s.Day ?? "-",
      time: s.time ?? s.Time ?? "-",
      room: s.room ?? s.Room,
    }));
  };

  const normalizeAnnouncements = (input: any): Announcement[] => {
    const d = input?.data ?? input;
    const arr =
      Array.isArray(d) ? d : Array.isArray(d?.items) ? d.items : Array.isArray(d?.messages) ? d.messages : [];
    if (!Array.isArray(arr)) return [];

    return arr.map((a: any) => ({
      id: a.id ?? a.ID ?? a.announcementId ?? `${a.title ?? "ann"}_${a.date ?? ""}`,
      title: a.title ?? a.Title ?? a.subject ?? "Announcement",
      body: a.body ?? a.Body,
      message: a.message ?? a.Message ?? a.content,
      createdAt: a.createdAt ?? a.CreatedAt,
      date: a.date ?? a.Date,
      type: a.type ?? a.Type,
      courseCode: a.courseCode ?? a.CourseCode,
    }));
  };

  function dedupAnns(arr: Announcement[]): Announcement[] {
    const seen = new Set<string>();
    const out: Announcement[] = [];
    for (const a of arr) {
      const key = `${String(a.id)}|${a.title}|${(a.body ?? a.message ?? "").slice(0, 60)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(a);
    }
    return out;
  }

  const normalizeExams = (input: any): ExamRow[] => {
    const root = input?.data ?? input;
    const arr = Array.isArray(root) ? root : Array.isArray(root?.data) ? root.data : [];
    if (!Array.isArray(arr)) return [];

    return arr.map((e: any) => ({
      courseCode: e.courseCode ?? e.code ?? e.CourseCode ?? "-",
      courseName: e.courseName ?? e.name ?? e.CourseName ?? "-",
      midDate: e.midDate ?? e.MidDate ?? "-",
      midTime: e.midTime ?? e.MidTime ?? "-",
      midRoom: e.midRoom ?? e.MidRoom ?? "-",
      finalDate: e.finalDate ?? e.FinalDate ?? "-",
      finalTime: e.finalTime ?? e.FinalTime ?? "-",
      finalRoom: e.finalRoom ?? e.FinalRoom ?? "-",
    }));
  };

  const totalHours = useMemo(() => courses.reduce((sum, c) => sum + toNumber(c.creditHours), 0), [courses]);
  const creditsMax = 18;
  const creditPct = clamp((totalHours / Math.max(1, creditsMax)) * 100, 0, 100);

  const visibleSemesters = useMemo(() => {
    const arr = Array.isArray(gradeSemesters) ? gradeSemesters : [];
    if (arr.length === 0) return [];

    const last = arr[arr.length - 1];
    const lastName = String(last?.semesterName ?? "").trim();

    return arr.filter((s) => {
      const name = String(s?.semesterName ?? "").trim();
      if (!name) return false;
      if (name === lastName) return true;
      return !isSemesterAllZeros(s);
    });
  }, [gradeSemesters]);

  const cumulativeFromGrades = useMemo(() => pickBestCumulativeGpa(visibleSemesters), [visibleSemesters]);
  const gpaFromInfo = useMemo(() => toNumOrUndef(info?.gpa), [info?.gpa]);
  const finalGpa = cumulativeFromGrades ?? gpaFromInfo;

  const gpaMax = 4;
  const gpaValue = finalGpa != null ? clamp(finalGpa, 0, gpaMax) : undefined;
  const gpaPct = gpaValue != null ? clamp((gpaValue / gpaMax) * 100, 0, 100) : 0;

  const profileGpaText = useMemo(() => {
    if (finalGpa != null) return finalGpa.toFixed(2);
    const s = String(info?.gpa ?? "-");
    return s === "0" ? "-" : s;
  }, [finalGpa, info?.gpa]);

  const availByCode = useMemo(() => {
    const mp = new Map<string, Course[]>();
    for (const c of availableCourses) {
      const key = String(c.code);
      if (!mp.has(key)) mp.set(key, []);
      mp.get(key)!.push(c);
    }
    return mp;
  }, [availableCourses]);

  const creditsFinished = useMemo(() => {
    const d: any = info ?? {};
    return toNumOrUndef(d.creditsFinished ?? d.CreditsFinished ?? d.finishedCredits ?? d.creditsDone);
  }, [info]);

  const creditsRequired = useMemo(() => {
    const d: any = info ?? {};
    return toNumOrUndef(d.creditsRequired ?? d.CreditsRequired ?? d.requiredCredits);
  }, [info]);

  const creditsRemaining = useMemo(() => {
    const d: any = info ?? {};
    const direct = toNumOrUndef(d.creditsRemaining ?? d.CreditsRemaining ?? d.remainingCredits);
    if (direct != null) return direct;
    if (creditsFinished != null && creditsRequired != null) return Math.max(0, creditsRequired - creditsFinished);
    return undefined;
  }, [info, creditsFinished, creditsRequired]);

  const weekCols = [
    { k: "sun", label: "Sun" },
    { k: "mon", label: "Mon" },
    { k: "tue", label: "Tue" },
    { k: "wed", label: "Wed" },
    { k: "thu", label: "Thu" },
    { k: "sat", label: "Sat" },
  ] as const;

  const scheduleByDay = useMemo(() => {
    const map: Record<string, Array<{ courseName: string; time: string; room?: string; title?: string }>> = {
      sun: [],
      mon: [],
      tue: [],
      wed: [],
      thu: [],
      sat: [],
    };

    for (const s of schedule) {
      const keys = expandDayKeys(s.day);
      for (const k of keys) {
        if (!(k in map)) continue;
        map[k].push({
          courseName: s.courseName || s.courseCode || "-",
          time: s.time || "-",
          room: s.room,
          title: s.courseName ? `${s.courseName} • ${s.time ?? "-"}` : s.courseCode,
        });
      }
    }
    for (const k of Object.keys(map)) map[k].sort((a, b) => String(a.time).localeCompare(String(b.time)));
    return map;
  }, [schedule]);

  const creditsByCourseCode = useMemo(() => {
    const mp = new Map<string, number | string>();
    for (const c of courses) mp.set(String(c.code), c.creditHours ?? "-");
    for (const c of availableCourses) {
      const key = String(c.code);
      if (!mp.has(key)) mp.set(key, c.creditHours ?? "-");
    }
    return mp;
  }, [courses, availableCourses]);

  const scheduleTableRows = useMemo(() => {
    return schedule.map((s) => ({
      ...s,
      credits: creditsByCourseCode.get(String(s.courseCode)) ?? "-",
    }));
  }, [schedule, creditsByCourseCode]);

  function buildRegNotice(isOpen: boolean, endDate?: string, msg?: string) {
    if (isOpen) {
      if (endDate) return `Registration is OPEN until ${endDate}.`;
      return "Registration is OPEN.";
    }
    if (msg) return `Registration is CLOSED. (${msg})`;
    return "Registration is CLOSED.";
  }

  useEffect(() => {
    if (!user || !user.id || user.role !== "student") return;
    const studentId = String(user.id);

    async function loadAll() {
      try {
        setLoading(true);
        setError("");
        setMessage("");

        const st = await getRegistrationStatus();
        const isOpen = Boolean(st?.isOpen);
        setRegClosed(!isOpen);
        setRegEndDate(String(st?.endDate ?? ""));
        setRegNotice(buildRegNotice(isOpen, st?.endDate, st?.message));

        const [infoObj, coursesArr, gradesRes, scheduleArr, annRes, sysAnnRes, examsRes] = await Promise.all([
          getStudentInfo(studentId),
          getStudentCourses(studentId),
          getStudentGrades(studentId),
          getStudentSchedule(studentId),
          getStudentAnnouncements(studentId),
          getStudentSystemAnnouncements(studentId),
          getStudentExams(studentId).catch(() => []),
        ]);

        let availableArr: any = [];
        let recRes: any = { data: [], totalRecommendedHours: 0 };

        if (isOpen) {
          const [av, rec] = await Promise.all([getAvailableCourses(studentId), getRecommendedCourses(studentId)]);
          availableArr = av;
          recRes = rec;
        }

        const d: any = infoObj ?? {};
        const fixedInfo: StudentInfo = {
          ...d,
          fullName: d.fullName || [d.FirstName, d.LastName].filter(Boolean).join(" ") || d.name || safeUserName,
          major: d.major ?? d.Major,
          gpa: d.gpa ?? d.CumulativeGPA ?? d.GPA ?? "-",
          level: d.level ?? d.Level ?? d.CurrentLevel ?? "-",
          email: d.email ?? d.Email ?? d.UniversityEmail,
          phone: d.phone ?? d.Phone,
          id: d.id ?? d.StudentID ?? studentId,

          creditsFinished: toNumOrUndef(d.creditsFinished ?? d.CreditsFinished ?? d.creditsDone) ?? undefined,
          creditsRemaining: toNumOrUndef(d.creditsRemaining ?? d.CreditsRemaining) ?? undefined,
          creditsRequired: toNumOrUndef(d.creditsRequired ?? d.CreditsRequired) ?? undefined,
        };

        setInfo(fixedInfo);
        setContactEmail(fixedInfo.email ?? "");
        setContactPhone(fixedInfo.phone ?? "");

        setCourses(normalizeCourses(coursesArr));
        setAvailableCourses(normalizeCourses(availableArr));
        setRecommended(Array.isArray(recRes?.data) ? (recRes.data as any) : []);
        setRecommendedHours(Number(recRes?.totalRecommendedHours ?? 0));

        setSchedule(normalizeSchedule(scheduleArr));

        const ann = dedupAnns(normalizeAnnouncements(annRes));
        const sys = dedupAnns(normalizeAnnouncements(sysAnnRes));
        setAnnouncements(ann);
        setSystemAnnouncements(sys);

        setGradeSemesters(parseSemestersFromGradesResponse(gradesRes));
        setExams(normalizeExams(examsRes));
      } catch (e) {
        console.error(e);
        setError("⚠️ Failed to fetch data from backend.");

        setRegClosed(true);
        setRegEndDate("");
        setRegNotice("Registration status unavailable.");
        setAvailableCourses([]);
        setRecommended([]);
        setRecommendedHours(0);
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, [user, safeUserName]);

  useEffect(() => {
    if (active !== "scholarship") return;
    if (!user?.id) return;

    const studentId = String(user.id);
    let alive = true;

    async function loadScholarship() {
      try {
        setSchLoading(true);
        setSchError("");
        const d = await getScholarshipStatus(studentId);
        if (!alive) return;
        setSchData(d);
      } catch (e: any) {
        console.error(e);
        if (!alive) return;
        setSchError(e?.message || "Failed to load scholarship status.");
        setSchData(null);
      } finally {
        if (!alive) return;
        setSchLoading(false);
      }
    }

    loadScholarship();
    return () => {
      alive = false;
    };
  }, [active, user?.id]);

  async function reloadCoursesAndScheduleAndGrades() {
    if (!user?.id) return;
    const studentId = String(user.id);

    try {
      const st = await getRegistrationStatus();
      const isOpen = Boolean(st?.isOpen);
      setRegClosed(!isOpen);
      setRegEndDate(String(st?.endDate ?? ""));
      setRegNotice(buildRegNotice(isOpen, st?.endDate, st?.message));

      const [coursesArr, scheduleArr, gradesRes, annRes, sysAnnRes, examsRes] = await Promise.all([
        getStudentCourses(studentId),
        getStudentSchedule(studentId),
        getStudentGrades(studentId),
        getStudentAnnouncements(studentId),
        getStudentSystemAnnouncements(studentId),
        getStudentExams(studentId).catch(() => []),
      ]);

      setCourses(normalizeCourses(coursesArr));
      setSchedule(normalizeSchedule(scheduleArr));
      setGradeSemesters(parseSemestersFromGradesResponse(gradesRes));

      const ann = dedupAnns(normalizeAnnouncements(annRes));
      const sys = dedupAnns(normalizeAnnouncements(sysAnnRes));
      setAnnouncements(ann);
      setSystemAnnouncements(sys);

      setExams(normalizeExams(examsRes));

      if (isOpen) {
        const [availableArr, recRes] = await Promise.all([getAvailableCourses(studentId), getRecommendedCourses(studentId)]);
        setAvailableCourses(normalizeCourses(availableArr));
        setRecommended(Array.isArray((recRes as any)?.data) ? ((recRes as any).data as any) : []);
        setRecommendedHours(Number((recRes as any)?.totalRecommendedHours ?? 0));
      } else {
        setAvailableCourses([]);
        setRecommended([]);
        setRecommendedHours(0);
      }
    } catch (e) {
      console.error(e);
      setError("⚠️ Failed to refresh data from backend.");
    }
  }

  async function handleRegister(courseCode: string, section?: string) {
    if (!user?.id) return alert("No user logged in.");
    const studentId = String(user.id);
    const trimmed = courseCode.trim();
    if (!trimmed) return alert("Invalid course code.");

    if (regClosed) return alert(regNotice || "Registration is CLOSED.");

    try {
      setError("");
      setMessage("");
      await registerCourse({ studentId, courseCode: trimmed, section });
      setMessage("Registered successfully ✅");
      await reloadCoursesAndScheduleAndGrades();
    } catch (err: any) {
      console.error("Register error", err);
      setError(err?.message || "Register failed.");
    }
  }

  async function handleDrop(courseCode: string) {
    if (!user?.id) return alert("No user logged in.");
    const studentId = String(user.id);

    try {
      setError("");
      setMessage("");
      await dropCourse({ studentId, courseCode });
      setMessage("Dropped successfully ✅");
      await reloadCoursesAndScheduleAndGrades();
    } catch (err: any) {
      console.error("Drop error", err);
      setError(err?.message || "Drop failed.");
    }
  }

  async function handleWithdraw(courseCode: string, section?: string) {
    if (!user?.id) return alert("No user logged in.");
    const studentId = String(user.id);

    const ok = window.confirm(`Are you sure you want to withdraw ${courseCode}?`);
    if (!ok) return;

    try {
      setError("");
      setMessage("");
      await withdrawCourse({ studentId, courseCode, section });
      setMessage("Withdrawn successfully (W) ✅");
      await reloadCoursesAndScheduleAndGrades();
    } catch (err: any) {
      console.error("Withdraw error", err);
      setError(err?.message || "Withdraw failed.");
    }
  }

  async function handleUpdateContact() {
    if (!user?.id) return alert("No user logged in.");
    const studentId = String(user.id);

    try {
      setError("");
      setMessage("");

      await updateStudentInfo({
        studentId,
        email: contactEmail || undefined,
        phone: contactPhone || undefined,
      });

      const d: any = await getStudentInfo(studentId);

      setInfo((prev) => {
        const merged: any = { ...(prev ?? {}), ...(d ?? {}) };
        return {
          ...merged,
          fullName:
            merged.fullName || [merged.FirstName, merged.LastName].filter(Boolean).join(" ") || merged.name || safeUserName,
          major: merged.major ?? merged.Major,
          gpa: merged.gpa ?? merged.CumulativeGPA ?? merged.GPA ?? "-",
          level: merged.level ?? merged.Level ?? merged.CurrentLevel ?? "-",
          email: merged.email ?? merged.Email ?? merged.UniversityEmail,
          phone: merged.phone ?? merged.Phone,
          id: merged.id ?? merged.StudentID ?? studentId,
        };
      });

      setMessage("Contact updated ✅");
    } catch (err: any) {
      console.error("Update info error", err);
      setError(err?.message || "Update failed.");
    }
  }

  async function handleUpdatePassword() {
    if (!user?.id) return alert("No user logged in.");
    const studentId = String(user.id);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Fill all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password mismatch.");
      return;
    }

    try {
      setError("");
      setMessage("");

      await updateStudentPassword({
        studentId,
        oldPassword,
        newPassword,
        confirmPassword,
      });

      setMessage("Password updated ✅");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Update password error", err);
      setError(err?.message || "Password update failed.");
    }
  }

  function schTheme(color?: ScholarshipData["badgeColor"]) {
    if (color === "green") return { bg: "#ecfdf5", border: "#a7f3d0", text: "#065f46", title: "#064e3b" };
    if (color === "orange") return { bg: "#fffbeb", border: "#fcd34d", text: "#92400e", title: "#78350f" };
    return { bg: "#fff1f2", border: "#fda4af", text: "#9f1239", title: "#881337" };
  }

  return (
    <div className="bau-dashboard" dir="ltr">
      <header className="sp-topbar" dir="ltr">
        <div className="sp-brand" dir="ltr">
          <img src="/logo.png" alt="BAU" className="sp-logo" />
          <div>
            <div className="sp-brand-title">BAU Student Portal</div>
            <div className="sp-brand-sub">Student Dashboard</div>
          </div>
        </div>

        <div className="sp-top-actions" dir="ltr">
          <button className="sp-logout" onClick={logout}>
            Log Out
          </button>
        </div>
      </header>

      <div className="sp-shell">
        <aside className="sp-sidebar" dir="ltr">
          <div className="sp-usercard">
            <img
              className="sp-avatar"
              src="/avatar.png"
              onError={(e) => {
                e.currentTarget.src =
                  "https://ui-avatars.com/api/?name=" + encodeURIComponent(info?.fullName ?? safeUserName ?? "Student");
              }}
              alt="avatar"
            />
            <div className="sp-user-meta">
              <div className="sp-user-name">{info?.fullName ?? user?.name ?? "Student"}</div>
              <div className="sp-user-id">ID: {displayedId}</div>
              <div className="sp-user-major">{info?.major ?? "Computer Science"}</div>
            </div>
          </div>

          <nav className="sp-nav">
            <button className={active === "dashboard" ? "sp-link active" : "sp-link"} onClick={() => setActive("dashboard")}>
              🧾 Dashboard
            </button>

            <button
              className={active === "courses" ? "sp-link active" : "sp-link"}
              onClick={() => setActive("courses")}
              title={regClosed ? regNotice : ""}
              style={regClosed ? { opacity: 0.8 } : undefined}
            >
              📚 Course Registration
            </button>

            <button className={active === "withdraw" ? "sp-link active" : "sp-link"} onClick={() => setActive("withdraw")}>
              🧾 Withdraw
            </button>

            <button className={active === "schedule" ? "sp-link active" : "sp-link"} onClick={() => setActive("schedule")}>
              📅 Schedule
            </button>

            <button className={active === "exams" ? "sp-link active" : "sp-link"} onClick={() => setActive("exams")}>
              📝 Exam Schedule
            </button>

            <button className={active === "grades" ? "sp-link active" : "sp-link"} onClick={() => setActive("grades")}>
              📊 Grades
            </button>

            <button
              className={active === "announcements" ? "sp-link active" : "sp-link"}
              onClick={() => setActive("announcements")}
            >
              📢 Announcements
            </button>

            <button className={active === "scholarship" ? "sp-link active" : "sp-link"} onClick={() => setActive("scholarship")}>
              🎓 Scholarship
            </button>

            <button className={active === "profile" ? "sp-link active" : "sp-link"} onClick={() => setActive("profile")}>
              👤 Profile
            </button>
          </nav>
        </aside>

        <main className="sp-main" dir="ltr">
          {(loading || error || message) && (
            <div className="sp-alerts" dir="ltr">
              {loading && <div className="sp-alert info">Loading...</div>}
              {error && <div className="sp-alert danger">{error}</div>}
              {message && <div className="sp-alert success">{message}</div>}
            </div>
          )}

          {active === "courses" && regNotice && (
            <div className="sp-alerts" dir="ltr" style={{ marginBottom: 12 }}>
              <div className={`sp-alert ${regClosed ? "info" : "success"}`}>{regNotice}</div>
            </div>
          )}

          {/* DASHBOARD */}
          {active === "dashboard" && (
            <div className="sp-grid">
              <div className="sp-center">
                <section className="sp-welcome">
                  <img
                    className="sp-welcome-avatar"
                    src="/avatar.png"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://ui-avatars.com/api/?name=" + encodeURIComponent(info?.fullName ?? safeUserName ?? "Student");
                    }}
                    alt="avatar"
                  />
                  <div className="sp-welcome-text">
                    <div className="sp-welcome-title">Welcome Back, {(info?.fullName ?? user?.name ?? "Student") + "!"}</div>
                    <div className="sp-welcome-sub">Ready for your semester?</div>
                  </div>
                </section>

                <section className="sp-card sp-summary">
                  <div className="sp-card-head">
                    <div className="sp-card-title">Academic Summary</div>
                  </div>

                  <div className="sp-kpis">
                    <div className="sp-kpi">
                      <div className="sp-kpi-label">Cumulative GPA</div>
                      <div className="sp-kpi-value">{profileGpaText}</div>
                      <div className="sp-kpi-sub">Overall</div>
                    </div>

                    <div className="sp-kpi">
                      <div className="sp-kpi-label">Credits Finished</div>
                      <div className="sp-kpi-value">{creditsFinished != null ? creditsFinished : "—"}</div>
                      <div className="sp-kpi-sub">Completed</div>
                    </div>

                    <div className="sp-kpi">
                      <div className="sp-kpi-label">Credits Remaining</div>
                      <div className="sp-kpi-value">{creditsRemaining != null ? creditsRemaining : "—"}</div>
                      <div className="sp-kpi-sub">To graduate</div>
                    </div>

                    <div className="sp-kpi">
                      <div className="sp-kpi-label">Required Credits</div>
                      <div className="sp-kpi-value">{creditsRequired != null ? creditsRequired : "—"}</div>
                      <div className="sp-kpi-sub">Program plan</div>
                    </div>
                  </div>
                </section>

                <section className="sp-card sp-overview">
                  <div className="sp-card-head">
                    <div className="sp-card-title">Course Overview</div>
                  </div>

                  {courses.length === 0 ? (
                    <div className="sp-muted">No registered courses.</div>
                  ) : (
                    <div className="sp-table-wrap">
                      <table className="sp-table">
                        <thead>
                          <tr>
                            <th>Course</th>
                            <th>Credits</th>
                            <th>Time</th>
                            <th>Instructor</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {courses.slice(0, 8).map((c) => (
                            <tr key={`${c.code}-${c.section ?? ""}`}>
                              <td>
                                <div style={{ fontWeight: 900 }}>{c.name}</div>
                                <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 800 }}>{c.code}</div>
                              </td>
                              <td style={{ fontWeight: 900 }}>{toNumber(c.creditHours) || "-"}</td>
                              <td>{(c.day ?? "-") + " • " + (c.time ?? "-")}</td>
                              <td>{c.teacherName ?? "-"}</td>
                              <td style={{ textAlign: "right" }}>
                                {!regClosed && (
                                  <button className="sp-drop" onClick={() => handleDrop(c.code)}>
                                    Drop
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="sp-info-row">
                    <div className="sp-info-pill ok">✅ Warnings: No conflicts detected.</div>
                    <div className="sp-info-pill tip">💡 Tip: Maintain a minimum of 12 credits.</div>
                  </div>
                </section>
              </div>

              <aside className="sp-right">
                <section className="sp-widget">
                  <div className="sp-widget-title">Credit Summary</div>
                  <div className="sp-donut-row">
                    <div className="sp-donut" style={{ ["--p" as any]: `${creditPct}%` }}>
                      <div className="sp-donut-center">
                        <div className="sp-donut-big">
                          {totalHours}/{creditsMax}
                        </div>
                        <div className="sp-donut-sub">Credits Registered</div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="sp-widget">
                  <div className="sp-widget-title">GPA</div>
                  <div className="sp-donut-row">
                    <div className="sp-donut" style={{ ["--p" as any]: `${gpaPct}%` }}>
                      <div className="sp-donut-center">
                        <div className="sp-donut-big">{gpaValue != null ? gpaValue.toFixed(2) : "-"}</div>
                        <div className="sp-donut-sub">Current GPA</div>
                      </div>
                    </div>
                  </div>
                </section>
              </aside>
            </div>
          )}

          {/* COURSES */}
          {active === "courses" && (
            <div className="sp-tabs-wrap">
              <div className="sp-card">
                <div className="sp-card-head">
                  <div className="sp-card-title">Registered Courses</div>
                </div>

                {courses.length === 0 ? (
                  <div className="sp-muted">No registered courses.</div>
                ) : (
                  <div className="sp-table-wrap">
                    <table className="sp-table">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Course</th>
                          <th>Credits</th>
                          <th>Day</th>
                          <th>Time</th>
                          <th>Room</th>
                          <th>Instructor</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.map((c) => (
                          <tr key={`${c.code}-${c.section ?? ""}`}>
                            <td style={{ fontWeight: 900 }}>{c.code}</td>
                            <td>{c.name}</td>
                            <td style={{ fontWeight: 900 }}>{toNumber(c.creditHours) || "-"}</td>
                            <td>{c.day ?? "-"}</td>
                            <td>{c.time ?? "-"}</td>
                            <td>{c.room ?? "-"}</td>
                            <td>{c.teacherName ?? "-"}</td>
                            <td style={{ textAlign: "right" }}>
                              {!regClosed && (
                                <button className="sp-drop" onClick={() => handleDrop(c.code)}>
                                  Drop
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Suggested only if OPEN */}
              {!regClosed && (
                <div className="sp-card">
                  <div className="sp-card-head">
                    <div className="sp-card-title">
                      Suggested Courses
                      {recommendedHours ? (
                        <span style={{ marginLeft: 10, fontSize: 12, opacity: 0.8 }}>Total: {recommendedHours} credits</span>
                      ) : null}
                    </div>
                  </div>

                  {recommended.length === 0 ? (
                    <div className="sp-muted">No suggestions.</div>
                  ) : (
                    <div className="sp-table-wrap">
                      <table className="sp-table">
                        <thead>
                          <tr>
                            <th>Code</th>
                            <th>Course</th>
                            <th>Credits</th>
                            <th>Day</th>
                            <th>Time</th>
                            <th>Reason</th>
                            <th>Priority</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {recommended.map((rc) => {
                            const avail = (availByCode.get(String(rc.code)) ?? [])[0];
                            const isFull = Boolean(avail?.isFull) || String(avail?.status ?? "").toLowerCase().includes("full");

                            return (
                              <tr key={rc.code}>
                                <td style={{ fontWeight: 900 }}>{rc.code}</td>
                                <td>{rc.name}</td>
                                <td style={{ fontWeight: 900 }}>{toNumber(rc.creditHours) || "-"}</td>
                                <td>{avail?.day ?? "-"}</td>
                                <td>{avail?.time ?? "-"}</td>
                                <td>{rc.reason ?? "Suggested"}</td>
                                <td>{rc.priority ?? "-"}</td>
                                <td style={{ textAlign: "right" }}>
                                  <button className="sp-btn" disabled={isFull} onClick={() => handleRegister(rc.code, avail?.section)}>
                                    {isFull ? "Full" : "Register"}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Available only if OPEN */}
              {!regClosed && (
                <div className="sp-card">
                  <div className="sp-card-head">
                    <div className="sp-card-title">Available Courses</div>
                  </div>

                  {availableCourses.length === 0 ? (
                    <div className="sp-muted">No available courses.</div>
                  ) : (
                    <div className="sp-table-wrap">
                      <table className="sp-table">
                        <thead>
                          <tr>
                            <th>Code</th>
                            <th>Course</th>
                            <th>Credits</th>
                            <th>Day</th>
                            <th>Time</th>
                            <th>Room</th>
                            <th>Instructor</th>
                            <th>Capacity</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {availableCourses.map((c) => {
                            const isFull = Boolean(c.isFull) || String(c.status ?? "").toLowerCase().includes("full");
                            const capText =
                              c.enrolledCount != null && c.maxCapacity != null
                                ? `${Number(c.enrolledCount)}/${Number(c.maxCapacity)}`
                                : "-";

                            return (
                              <tr key={`${c.code}-${c.section ?? ""}`}>
                                <td style={{ fontWeight: 900 }}>{c.code}</td>
                                <td>{c.name}</td>
                                <td style={{ fontWeight: 900 }}>{toNumber(c.creditHours) || "-"}</td>
                                <td>{c.day ?? "-"}</td>
                                <td>{c.time ?? "-"}</td>
                                <td>{c.room ?? "-"}</td>
                                <td>{c.teacherName ?? "-"}</td>
                                <td>{capText}</td>

                                <td style={{ textAlign: "right" }}>
                                  <button className="sp-btn" disabled={isFull} onClick={() => handleRegister(c.code, c.section)}>
                                    {isFull ? "Full" : "Register"}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* WITHDRAW */}
          {active === "withdraw" && (
            <div className="sp-tabs-wrap">
              <div className="sp-card">
                <div className="sp-card-head">
                  <div className="sp-card-title">Withdraw Courses</div>
                </div>

                {courses.length === 0 ? (
                  <div className="sp-muted">No registered courses.</div>
                ) : (
                  <div className="sp-table-wrap">
                    <table className="sp-table">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Course</th>
                          <th>Credits</th>
                          <th>Day</th>
                          <th>Time</th>
                          <th>Instructor</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.map((c) => (
                          <tr key={`w_${c.code}-${c.section ?? ""}`}>
                            <td style={{ fontWeight: 900 }}>{c.code}</td>
                            <td>{c.name}</td>
                            <td style={{ fontWeight: 900 }}>{toNumber(c.creditHours) || "-"}</td>
                            <td>{c.day ?? "-"}</td>
                            <td>{c.time ?? "-"}</td>
                            <td>{c.teacherName ?? "-"}</td>
                            <td style={{ textAlign: "right", display: "flex", gap: 8, justifyContent: "flex-end" }}>
                              {!regClosed && (
                                <button className="sp-drop" onClick={() => handleDrop(c.code)}>
                                  Drop
                                </button>
                              )}
                              <button className="sp-btn" onClick={() => handleWithdraw(c.code, c.section)}>
                                Withdraw
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="sp-muted" style={{ marginTop: 10 }}>
                      If registration is still open, backend may refuse withdraw and tell you to use Drop.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SCHEDULE */}
          {active === "schedule" && (
            <div className="sp-tabs-wrap">
              <div className="sp-card">
                <div className="sp-card-head">
                  <div className="sp-card-title">Schedule (Courses)</div>
                </div>

                {scheduleTableRows.length === 0 ? (
                  <div className="sp-muted">No schedule.</div>
                ) : (
                  <div className="sp-table-wrap">
                    <table className="sp-table">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Course</th>
                          <th>Credits</th>
                          <th>Day</th>
                          <th>Time</th>
                          <th>Room</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scheduleTableRows.map((s, idx) => (
                          <tr key={`${s.courseCode}_${idx}`}>
                            <td style={{ fontWeight: 900 }}>{s.courseCode}</td>
                            <td>{s.courseName}</td>
                            <td style={{ fontWeight: 900 }}>{toNumber((s as any).credits) || "-"}</td>
                            <td>{s.day ?? "-"}</td>
                            <td>{s.time ?? "-"}</td>
                            <td>{s.room ?? "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="sp-card">
                <div className="sp-card-head">
                  <div className="sp-card-title">Weekly Schedule</div>
                </div>

                {schedule.length === 0 ? (
                  <div className="sp-muted">No schedule.</div>
                ) : (
                  <div className="sp-week-big">
                    {weekCols.map((c) => (
                      <div className="sp-week-col big" key={c.k}>
                        <div className="sp-week-head big">{c.label}</div>
                        <div className="sp-week-body big">
                          {(scheduleByDay[c.k]?.length ?? 0) === 0 ? (
                            <div className="sp-week-empty big">—</div>
                          ) : (
                            scheduleByDay[c.k].map((s, i) => (
                              <div className="sp-week-item big" key={i} title={s.title}>
                                <div className="sp-week-time big">{s.time ?? "—"}</div>
                                <div className="sp-week-course big">{s.courseName ?? "—"}</div>
                                {s.room ? <div className="sp-week-room">Room: {s.room}</div> : null}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EXAMS */}
          {active === "exams" && (
            <div className="sp-tabs-wrap">
              <div className="sp-card">
                <div className="sp-card-head">
                  <div className="sp-card-title">Exam Schedule</div>
                </div>

                {exams.length === 0 ? (
                  <div className="sp-muted">No exam schedule.</div>
                ) : (
                  <div className="sp-table-wrap">
                    <table className="sp-table">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Course</th>
                          <th>Mid Date</th>
                          <th>Mid Time</th>
                          <th>Mid Room</th>
                          <th>Final Date</th>
                          <th>Final Time</th>
                          <th>Final Room</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exams.map((e, idx) => (
                          <tr key={`${e.courseCode}_${idx}`}>
                            <td style={{ fontWeight: 900 }}>{e.courseCode}</td>
                            <td>{e.courseName}</td>
                            <td>{e.midDate ?? "-"}</td>
                            <td>{e.midTime ?? "-"}</td>
                            <td>{e.midRoom ?? "-"}</td>
                            <td>{e.finalDate ?? "-"}</td>
                            <td>{e.finalTime ?? "-"}</td>
                            <td>{e.finalRoom ?? "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* GRADES */}
          {active === "grades" && (
            <div className="sp-tabs-wrap">
              <div className="sp-card">
                <div className="sp-card-head">
                  <div className="sp-card-title">Grades</div>
                </div>

                {visibleSemesters.length === 0 ? (
                  <div className="sp-muted">No grades.</div>
                ) : (
                  <div className="sp-grades-wrap">
                    {visibleSemesters.map((sem, idx) => {
                      const semName = sem.semesterName ?? `Semester ${idx + 1}`;
                      const semGpa = toNumOrUndef(sem.semesterGPA);
                      const cumGpa = toNumOrUndef(sem.cumulativeGPA);

                      return (
                        <div key={semName + idx} className="sp-semester">
                          <div className="sp-semester-head">
                            <div className="sp-semester-title">{semName}</div>
                            <div className="sp-semester-meta">
                              <span className="sp-pill">Semester GPA: {semGpa != null ? semGpa.toFixed(2) : "-"}</span>
                              <span className="sp-pill">Cumulative GPA: {cumGpa != null ? cumGpa.toFixed(2) : "-"}</span>
                            </div>
                          </div>

                          <div className="sp-table-wrap">
                            <table className="sp-table">
                              <thead>
                                <tr>
                                  <th>Code</th>
                                  <th>Course</th>
                                  <th>Credits</th>
                                  <th>Practical/Assignment</th>
                                  <th>Midterm</th>
                                  <th>Final</th>
                                  <th>Total</th>
                                  <th>Grade</th>
                                </tr>
                              </thead>
                              <tbody>
                                {sem.courses.map((course, i) => {
                                  const practicalVal = course.practical ?? course.assignment ?? "-";
                                  const letter = course.grade ?? course.letter ?? percentToLetter(course.total);

                                  const totalNum = Number(course.total);
                                  const hasRealTotal = Number.isFinite(totalNum) && totalNum > 0;

                                  const isFail =
                                    hasRealTotal && (String(letter).toUpperCase() === "F" || (totalNum > 0 && totalNum < 60));

                                  return (
                                    <tr key={course.courseCode + "_" + i}>
                                      <td style={{ fontWeight: 900 }}>{course.courseCode}</td>
                                      <td>{course.courseName}</td>
                                      <td style={{ fontWeight: 900 }}>{toNumber(course.creditHours) || "-"}</td>
                                      <td>{formatScore(practicalVal)}</td>
                                      <td>{formatScore(course.midterm)}</td>
                                      <td>{formatScore(course.final)}</td>
                                      <td>
                                        <strong>{formatScore(course.total)}</strong>
                                      </td>
                                      <td>
                                        <span className={isFail ? "sp-grade fail" : "sp-grade pass"}>{letter}</span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ANNOUNCEMENTS */}
          {active === "announcements" && (
            <div className="sp-tabs-wrap">
              <div className="sp-card">
                <div className="sp-card-head">
                  <div className="sp-card-title">System Announcements</div>
                </div>

                {systemAnnouncements.length === 0 ? (
                  <div className="sp-muted">No system announcements.</div>
                ) : (
                  <div className="sp-list">
                    {systemAnnouncements.map((a) => (
                      <div className="sp-ann" key={`sys_${a.id}`}>
                        <div className="sp-ann-title">{a.title}</div>
                        <div className="sp-ann-body">{a.body ?? a.message ?? ""}</div>
                        {(a.createdAt || a.date) && <div className="sp-ann-date">{a.createdAt ?? a.date}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="sp-card">
                <div className="sp-card-head">
                  <div className="sp-card-title">Course Announcements</div>
                </div>

                {announcements.length === 0 ? (
                  <div className="sp-muted">No announcements.</div>
                ) : (
                  <div className="sp-list">
                    {announcements.map((a) => (
                      <div className="sp-ann" key={a.id}>
                        <div className="sp-ann-title">{a.title}</div>
                        <div className="sp-ann-body">{a.body ?? a.message ?? ""}</div>
                        {(a.createdAt || a.date) && <div className="sp-ann-date">{a.createdAt ?? a.date}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SCHOLARSHIP */}
          {active === "scholarship" && (
            <div className="sp-tabs-wrap">
              <div className="sp-card">
                <div className="sp-card-head">
                  <div className="sp-card-title">Scholarship Dashboard</div>
                </div>

                {schLoading && <div className="sp-muted">Calculating status...</div>}
                {!schLoading && schError && <div className="sp-alert danger">{schError}</div>}

                {!schLoading &&
                  !schError &&
                  schData &&
                  (() => {
                    const t = schTheme(schData.badgeColor);
                    const badgeText = schData.status === "Safe" ? "Safe" : schData.status === "Warning" ? "Warning" : "Not Qualified";

                    return (
                      <div style={{ display: "grid", gap: 14 }}>
                        <div style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 16, padding: 16 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                            <div>
                              <div style={{ fontSize: 22, fontWeight: 800, color: t.title }}>🎓 {badgeText}</div>
                              <div style={{ marginTop: 6, color: t.text, fontWeight: 600 }}>{schData.message}</div>
                            </div>

                            <div
                              style={{
                                minWidth: 160,
                                background: "rgba(255,255,255,.65)",
                                borderRadius: 14,
                                padding: 12,
                                textAlign: "center",
                              }}
                            >
                              <div style={{ fontSize: 12, opacity: 0.75, fontWeight: 800, letterSpacing: 1 }}>CURRENT GPA</div>
                              <div style={{ fontSize: 40, fontWeight: 900, color: t.title, marginTop: 2 }}>
                                {Number(schData.gpa).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {schData.suggestions?.length ? (
                          <div className="sp-card" style={{ padding: 0, overflow: "hidden" }}>
                            <div className="sp-card-head" style={{ background: "#f8fafc", borderBottom: "1px solid rgba(0,0,0,.06)" }}>
                              <div className="sp-card-title">🚀 Smart Suggestions to Improve GPA</div>
                              <div style={{ fontSize: 12, opacity: 0.75 }}>{schData.suggestions.length} suggestion(s)</div>
                            </div>

                            <div className="sp-table-wrap" style={{ margin: 0 }}>
                              <table className="sp-table">
                                <thead>
                                  <tr>
                                    <th>Code</th>
                                    <th>Course</th>
                                    <th>Old Grade</th>
                                    <th>Reason</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {schData.suggestions.map((sug) => (
                                    <tr key={sug.courseCode}>
                                      <td style={{ fontWeight: 900 }}>{sug.courseCode}</td>
                                      <td>{sug.courseName}</td>
                                      <td style={{ fontWeight: 900 }}>{percentToLetter(sug.grade)}</td>
                                      <td>{sug.reason}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            <div style={{ padding: 12, fontSize: 12, opacity: 0.75, textAlign: "center", background: "#f8fafc" }}>
                              * Retaking these courses with a high grade will boost your GPA.
                            </div>
                          </div>
                        ) : (
                          <div className="sp-muted">No suggestions — keep it up.</div>
                        )}
                      </div>
                    );
                  })()}
              </div>
            </div>
          )}

          {/* PROFILE */}
          {active === "profile" && (
            <div className="sp-tabs-wrap">
              <div className="sp-profile-grid">
                <div className="sp-card sp-profile-card">
                  <div className="sp-card-head">
                    <div className="sp-card-title">Profile</div>
                  </div>

                  <div className="sp-profile-top">
                    <img
                      className="sp-profile-avatar"
                      src="/avatar.png"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://ui-avatars.com/api/?name=" + encodeURIComponent(info?.fullName ?? safeUserName ?? "Student");
                      }}
                      alt="avatar"
                    />
                    <div className="sp-profile-meta">
                      <div className="sp-profile-name bigger">{info?.fullName ?? safeUserName ?? "Student"}</div>
                      <div className="sp-profile-sub">
                        <span className="sp-badge">ID: {displayedId}</span>
                        <span className="sp-badge">Major: {info?.major ?? "-"}</span>
                        <span className="sp-badge">Level: {String(info?.level ?? "—")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="sp-profile-stats">
                    <div className="sp-stat">
                      <div className="sp-stat-label">Cumulative GPA</div>
                      <div className="sp-stat-value">{profileGpaText}</div>
                    </div>
                    <div className="sp-stat">
                      <div className="sp-stat-label">Finished</div>
                      <div className="sp-stat-value">{creditsFinished ?? "—"}</div>
                    </div>
                    <div className="sp-stat">
                      <div className="sp-stat-label">Remaining</div>
                      <div className="sp-stat-value">{creditsRemaining ?? "—"}</div>
                    </div>
                    <div className="sp-stat">
                      <div className="sp-stat-label">Required</div>
                      <div className="sp-stat-value">{creditsRequired ?? "—"}</div>
                    </div>
                  </div>
                </div>

                <div className="sp-card">
                  <div className="sp-card-head">
                    <div className="sp-card-title">Contact Info</div>
                  </div>

                  <div className="sp-form">
                    <label>Email</label>
                    <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="example@bau.edu.jo" />

                    <label>Phone</label>
                    <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="07xxxxxxxx" />

                    <button className="sp-btn wide" onClick={handleUpdateContact}>
                      Save
                    </button>
                  </div>
                </div>
              </div>

              <div className="sp-card">
                <div className="sp-card-head">
                  <div className="sp-card-title">Change Password</div>
                </div>

                <div className="sp-form">
                  <label>Current Password</label>
                  <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />

                  <label>New Password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />

                  <label>Confirm Password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

                  <button className="sp-btn wide" onClick={handleUpdatePassword}>
                    Update
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
