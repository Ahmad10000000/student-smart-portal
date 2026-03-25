// src/api/student.ts
import { apiFetch } from "./http";
import type { ScholarshipData } from "../types";

export interface StudentInfo {
  id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  major?: string;
  level?: string | number;
  gpa?: number | string;
  creditsFinished?: number;
  creditsRemaining?: number;
  creditsRequired?: number;
}

export interface StudentCourse {
  code: string;
  name: string;
  creditHours?: number | string;
  section?: string;

  days?: string;
  instructor?: string;

  day?: string;
  teacherName?: string;

  time?: string;
  room?: string;

  absences?: number;
  status?: string;

  enrolledCount?: number;
  maxCapacity?: number;
  isFull?: boolean;
  isRecommended?: boolean;
}

export interface StudentAnnouncement {
  id: number | string;
  title: string;
  message?: string;
  body?: string;
  createdAt?: string;
  date?: string;
  type?: string;
  courseCode?: string;
}

export interface ExamItem {
  courseCode?: string;
  courseName?: string;
  type?: string;
  date?: string;
  time?: string;
  room?: string;
}

function unwrap<T = any>(res: any): T {
  return (res?.data ?? res) as T;
}

function unwrapArray<T = any>(res: any): T[] {
  const d = res?.data ?? res;

  if (Array.isArray(d)) return d as T[];

  const candidates = [
    d?.data,
    d?.items,
    d?.rows,
    d?.list,
    d?.result,
    d?.results,

    d?.announcements,
    d?.systemAnnouncements,
    d?.teacherAnnouncements,
    d?.courseAnnouncements,
    d?.messages,

    d?.semesters,
    d?.grades,

    d?.exams,
    d?.schedule,
  ];

  for (const c of candidates) {
    if (Array.isArray(c)) return c as T[];
  }

  return [];
}

function toNumOrUndef(x: any): number | undefined {
  if (x == null || x === "") return undefined;
  const n = Number(x);
  return Number.isFinite(n) ? n : undefined;
}

function toBoolOrUndef(x: any): boolean | undefined {
  if (x == null) return undefined;
  if (typeof x === "boolean") return x;
  if (typeof x === "number") return x === 1;

  if (typeof x === "string") {
    const t = x.trim().toLowerCase();
    if (t === "true" || t === "yes" || t === "y" || t === "1") return true;
    if (t === "false" || t === "no" || t === "n" || t === "0") return false;
    if (t === "full") return true;
    if (t === "open") return false;
  }

  return undefined;
}

function normalizeDay(x: any): string {
  const v = String(x ?? "").trim();
  if (!v) return "-";

  const n = Number(v);
  if (Number.isFinite(n)) {
    const mapNum: Record<number, string> = {
      1: "الأحد",
      2: "الإثنين",
      3: "الثلاثاء",
      4: "الأربعاء",
      5: "الخميس",
      6: "السبت",
      7: "الجمعة",
    };
    return mapNum[n] ?? v;
  }

  const low = v.toLowerCase();
  const mapEn: Record<string, string> = {
    sun: "الأحد",
    sunday: "الأحد",
    mon: "الإثنين",
    monday: "الإثنين",
    tue: "الثلاثاء",
    tuesday: "الثلاثاء",
    wed: "الأربعاء",
    wednesday: "الأربعاء",
    thu: "الخميس",
    thursday: "الخميس",
    fri: "الجمعة",
    friday: "الجمعة",
    sat: "السبت",
    saturday: "السبت",
  };

  return mapEn[low] ?? v;
}


function assertBackendOk(res: any, fallbackMsg: string) {
  const status = String(res?.status ?? res?.Status ?? "").toLowerCase();
  if (status === "fail" || status === "error" || status === "failed") {
    const msg =
      res?.message ??
      res?.Message ??
      res?.error ??
      res?.Error ??
      fallbackMsg ??
      "Request failed.";
    throw new Error(String(msg));
  }
  return res;
}

// ===================== INFO =====================

export async function getStudentInfo(id: string) {
  return unwrap<StudentInfo>(await apiFetch(`/student/${encodeURIComponent(id)}`));
}

// ===================== COURSES =====================

export async function getStudentCourses(id: string) {
  const res = await apiFetch(`/student/${encodeURIComponent(id)}/courses`);
  const arr = unwrapArray<StudentCourse>(res);

  return arr.map((c: any) => ({
    ...c,
    day: c.day ?? c.days,
    teacherName: c.teacherName ?? c.instructor,
  }));
}

export async function getAvailableCourses(id: string) {
  const res = await apiFetch(`/student/${encodeURIComponent(id)}/available-courses`);
  const arr = unwrapArray<StudentCourse>(res);

  return arr.map((c: any) => ({
    ...c,
    day: c.day ?? c.days,
    teacherName: c.teacherName ?? c.instructor,

    enrolledCount: toNumOrUndef(c.enrolledCount ?? c.EnrolledCount),
    maxCapacity: toNumOrUndef(c.maxCapacity ?? c.MaxCapacity),

    isFull: toBoolOrUndef(c.isFull ?? c.IsFull ?? c.full ?? c.Full ?? c.status),
    isRecommended: toBoolOrUndef(c.isRecommended ?? c.IsRecommended ?? c.recommended ?? c.Recommended),
  }));
}

// ===================== GRADES =====================

export async function getStudentGrades(studentId: string) {
  const res: any = await apiFetch(`/student/${encodeURIComponent(studentId)}/grades`);

  const rows =
    res?.data ??
    res?.semesters ??
    res?.grades ??
    res?.items ??
    res?.rows ??
    res?.result ??
    res?.results ??
    [];

  return {
    ...res,
    semesters: Array.isArray(rows) ? rows : [],
  };
}

// ===================== ANNOUNCEMENTS =====================

export async function getStudentAnnouncements(id: string) {
  const res = await apiFetch(`/student/${encodeURIComponent(id)}/announcements`);
  return unwrapArray<StudentAnnouncement>(res);
}

export async function getStudentSystemAnnouncements(studentId: string) {
  const sid = encodeURIComponent(studentId);

  const tries = [
    `/student/${sid}/system-announcements`,
    `/student/${sid}/system/announcements`,
    `/student/system-announcements`,
    `/student/system/announcements`,
    `/system/announcements`,
    `/announcements/system`,
  ];

  for (const p of tries) {
    try {
      const res = await apiFetch(p);
      const arr = unwrapArray<StudentAnnouncement>(res);
      if (arr.length) return arr;
    } catch {
      // ignore
    }
  }

  return [] as StudentAnnouncement[];
}

// ===================== SCHEDULE =====================

export async function getStudentSchedule(id: string) {
  const mapSchedule = (arr: any[]) =>
    arr.map((s) => ({
      ...s,
      day: normalizeDay(s.day ?? s.days ?? s.Day ?? s.dayName),
    }));

  try {
    const res = await apiFetch(`/student/${encodeURIComponent(id)}/schedule`);
    const arr = unwrapArray<any>(res);
    return mapSchedule(arr);
  } catch {
    const res2 = await apiFetch(`/student/${encodeURIComponent(id)}/timetable`);
    const arr2 = unwrapArray<any>(res2);
    return mapSchedule(arr2);
  }
}

// ===================== EXAMS =====================

export async function getStudentExams(studentId: string) {
  const res = await apiFetch(`/student/${encodeURIComponent(studentId)}/exams`);
  const arr = unwrapArray<any>(res);

  return arr.map(
    (e: any): ExamItem => ({
      courseCode: e.courseCode ?? e.code ?? e.CourseCode ?? e.Code,
      courseName: e.courseName ?? e.name ?? e.CourseName ?? e.Name,
      type: e.type ?? e.Type ?? e.examType,
      date: e.date ?? e.Date,
      time: e.time ?? e.Time,
      room: e.room ?? e.Room,
    })
  );
}

// ===================== RECOMMENDED =====================

export interface RecommendedCourse {
  code: string;
  name: string;
  creditHours?: number | string;
  reason?: string;
  priority?: string;
}

export interface RecommendedCoursesResponse {
  status?: string;
  totalRecommendedHours?: number;
  data?: RecommendedCourse[];
  message?: string;
}

export async function getRecommendedCourses(id: string) {
  const res = await apiFetch(`/student/${encodeURIComponent(id)}/recommended-courses`);
  const d: any = unwrap(res);

  return {
    status: d?.status,
    totalRecommendedHours: d?.totalRecommendedHours,
    data: Array.isArray(d?.data) ? d.data : unwrapArray<RecommendedCourse>(d),
    message: d?.message,
  } as RecommendedCoursesResponse;
}

// ===================== SCHOLARSHIP =====================

export async function getScholarshipStatus(studentId: string): Promise<ScholarshipData> {
  return (await apiFetch(`/student/${encodeURIComponent(studentId)}/scholarship`)) as ScholarshipData;
}

// ===================== ACTIONS =====================

export async function registerCourse(payload: { studentId: string; courseCode: string; section?: string }) {
  const res = await apiFetch(`/student/register`, {
    method: "POST",
    body: payload,
  });

  assertBackendOk(res, "Register failed.");
  return res;
}

export async function dropCourse(payload: { studentId: string; courseCode: string }) {
  const res = await apiFetch(`/student/drop`, {
    method: "POST",
    body: payload,
  });

  assertBackendOk(res, "Drop failed.");
  return res;
}


export async function withdrawCourse(payload: { studentId: string; courseCode: string; section?: string }) {
  const res = await apiFetch(`/student/course/withdraw`, {
    method: "POST",
    body: {
      studentId: payload.studentId,
      courseCode: payload.courseCode,
      section: payload.section,
    },
  });

  assertBackendOk(res, "Withdraw failed.");
  return res;
}

export function updateStudentInfo(payload: { studentId: string; email?: string; phone?: string }) {
  return apiFetch(`/student/profile/update`, {
    method: "PUT",
    body: payload,
  });
}

export function updateStudentPassword(payload: {
  studentId: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword?: string;
}) {
  return apiFetch(`/student/profile/password`, {
    method: "POST",
    body: payload,
  });
}

// ===================== REGISTRATION STATUS  =====================

export type RegistrationStatus = {
  isOpen: boolean;
  endDate?: string;
  message?: string;
};

export async function getRegistrationStatus(): Promise<RegistrationStatus> {
  const tries = ["/system/registration-status", "/system/registeration-status"];

  let lastErr: any = null;

  for (const p of tries) {
    try {
      const res: any = await apiFetch(p);

     
      const d = res?.data?.data ?? res?.data ?? res ?? {};
      const isOpen = Boolean(d?.isOpen ?? d?.open ?? d?.IsOpen ?? d?.Open);
      const endDate = d?.endDate ?? d?.EndDate ?? d?.until ?? d?.Until;
      const message = d?.message ?? d?.Message;

      return {
        isOpen,
        endDate: endDate ? String(endDate) : undefined,
        message: message ? String(message) : undefined,
      };
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr ?? new Error("Failed to load registration status.");
}
