// src/api/teacher.ts
import { apiFetch } from "./http";

export type TeacherCourse = {
  code: string;
  name: string;
  section: string;
  creditHours?: number;
  studentsCount?: number;
  days?: string;
  time?: string;
  room?: string;
};

export type CourseStudent = {
  studentId: string;
  fullName: string;
  absences: number;
  status?: "Safe" | "Warning" | "Failed";
};

export type CourseGradeRow = {
  studentId: string;
  fullName: string;
  mid?: number;
  practical?: number;
  final?: number;
  total?: number;
  locked?: boolean;
};

export type CourseAnnouncement = {
  id: number | string;
  title: string;
  message: string;
  createdAt?: string;
};

export type TeacherSystemAnnouncement = { title: string; message: string; date?: string };

export type TeacherExamItem = {
  courseCode: string;
  courseName?: string;
  midDate?: string;
  midTime?: string;
  midRoom?: string;
  finalDate?: string;
  finalTime?: string;
  finalRoom?: string;
};

export type AttendanceHistoryItem = {
  date?: string;
  time?: string;
  status?: string;
  note?: string;
  courseCode?: string;
  section?: string;
};

export type TeacherGradingRules = {
  gradingOpen: boolean;
  allowAssignment: boolean;
  allowMidterm: boolean;
  allowFinal: boolean;
};

/** ===== Helpers ===== */
function normalizeArray<T = any>(res: any): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res as T[];
  if (Array.isArray(res.data)) return res.data as T[];
  if (Array.isArray(res.items)) return res.items as T[];
  if (Array.isArray(res?.data?.data)) return res.data.data as T[];
  if (Array.isArray(res?.result)) return res.result as T[];
  return [];
}

function safeSection(section?: string) {
  const s = (section ?? "").toString().trim();
  return s ? s : "1";
}

/** ===== COURSES ===== */
export function getTeacherCourses(teacherId: string) {
  return apiFetch(`/teacher/${encodeURIComponent(teacherId)}/courses`) as Promise<any>;
}

export function getCourseStudents(teacherId: string, courseCode: string, section: string) {
  return apiFetch(
    `/teacher/${encodeURIComponent(teacherId)}/course/${encodeURIComponent(courseCode)}/${encodeURIComponent(
      safeSection(section)
    )}/students`
  ) as Promise<any>;
}

export function getCourseGrades(teacherId: string, courseCode: string, section: string) {
  return apiFetch(
    `/teacher/${encodeURIComponent(teacherId)}/course/${encodeURIComponent(courseCode)}/${encodeURIComponent(
      safeSection(section)
    )}/grades`
  ) as Promise<any>;
}

export function getCourseAnnouncements(teacherId: string, courseCode: string, section: string) {
  return apiFetch(
    `/teacher/${encodeURIComponent(teacherId)}/course/${encodeURIComponent(courseCode)}/${encodeURIComponent(
      safeSection(section)
    )}/announcements`
  ) as Promise<any>;
}

/** ===== GRADES =====*/
export function saveStudentGrade(payload: {
  teacherId?: string;
  courseCode: string;
  section?: string;
  studentId: string;
  midterm?: number | null;    
  assignment?: number | null;  
  final?: number | null;       
}) {
  const body: any = {
    courseCode: payload.courseCode,
    section: safeSection(payload.section),
    studentId: payload.studentId,
  };

  if (payload.teacherId) body.teacherId = payload.teacherId;

  if (payload.midterm !== undefined) body.midterm = payload.midterm;
  if (payload.assignment !== undefined) body.assignment = payload.assignment;
  if (payload.final !== undefined) body.final = payload.final;

  return apiFetch(`/teacher/course/grades`, {
    method: "POST",
    body,
  }) as Promise<any>;
}

/** ===== ABSENCE ===== */
export function updateStudentAbsence(payload: {
  teacherId?: string;
  studentId: string;
  courseCode: string;
  section?: string;
  delta: number;
}) {
  const body: any = {
    studentId: payload.studentId,
    courseCode: payload.courseCode,
    section: safeSection(payload.section),
    delta: payload.delta,
  };
  if (payload.teacherId) body.teacherId = payload.teacherId;

  return apiFetch(`/teacher/course/absence`, {
    method: "POST",
    body,
  }) as Promise<any>;
}

/** ===== ANNOUNCEMENTS ===== */
export function postCourseAnnouncement(payload: {
  teacherId: string;
  courseCode: string;
  section?: string;
  title: string;
  message: string;
}) {
  const body: any = {
    teacherId: payload.teacherId,
    courseCode: payload.courseCode,
    section: safeSection(payload.section),
    title: payload.title,
    message: payload.message,
  };

  return apiFetch(`/teacher/course/announcement`, {
    method: "POST",
    body,
  }) as Promise<any>;
}

export function updateTeacherAnnouncement(payload: {
  teacherId?: string;
  courseCode: string;
  section?: string;
  id?: string | number;
  oldTitle?: string;
  title?: string;
  message?: string;
  newMessage?: string;
}) {
  const body: any = {
    courseCode: payload.courseCode,
    section: safeSection(payload.section),
  };
  if (payload.teacherId) body.teacherId = payload.teacherId;

  if (payload.id !== undefined) body.id = payload.id;
  if (payload.oldTitle) body.oldTitle = payload.oldTitle;
  if (payload.title) body.title = payload.title;

  const msg = payload.newMessage ?? payload.message;
  if (msg !== undefined) body.newMessage = msg;

  return apiFetch(`/teacher/announcement/update`, {
    method: "PUT",
    body,
  }) as Promise<any>;
}

export function deleteTeacherAnnouncement(payload: {
  teacherId?: string;
  courseCode: string;
  section?: string;
  id?: string | number;
  title?: string;
}) {
  const body: any = {
    courseCode: payload.courseCode,
    section: safeSection(payload.section),
  };
  if (payload.teacherId) body.teacherId = payload.teacherId;

  if (payload.id !== undefined) body.id = payload.id;
  if (payload.title) body.title = payload.title;

  return apiFetch(`/teacher/announcement/delete`, {
    method: "POST",
    body,
  }) as Promise<any>;
}

/** ===== PROFILE ===== */
export function updateTeacherProfile(payload: { teacherId: string; email?: string; phone?: string }) {
  return apiFetch(`/teacher/profile/update`, {
    method: "PUT",
    body: payload,
  }) as Promise<any>;
}

export function changeTeacherPassword(payload: {
  teacherId: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword?: string;
}) {
  return apiFetch(`/teacher/profile/password`, {
    method: "POST",
    body: payload,
  }) as Promise<any>;
}

/** ===== SYSTEM ANNOUNCEMENTS ===== */
export function getTeacherSystemAnnouncements(teacherId: string) {
  return apiFetch(`/teacher/${encodeURIComponent(teacherId)}/system-announcements`) as Promise<any>;
}

/** ===== EXAMS ===== */
export function getTeacherExamSchedule(teacherId: string) {
  return apiFetch(`/teacher/${encodeURIComponent(teacherId)}/exams`) as Promise<any>;
}

/** ===== ATTENDANCE HISTORY ===== */
function toQuery(payload: { studentId: string; courseCode: string; section?: string; teacherId?: string }) {
  const qs = new URLSearchParams();
  qs.set("studentId", payload.studentId);
  qs.set("courseCode", payload.courseCode);
  qs.set("section", safeSection(payload.section));
  if (payload.teacherId) qs.set("teacherId", payload.teacherId);
  return qs.toString();
}

export async function getAttendanceHistory(payload: {
  studentId: string;
  courseCode: string;
  section?: string;
  teacherId?: string;
}) {
  const q = toQuery(payload);
  const res = await apiFetch(`/teacher/attendance/history?${q}`, { method: "GET" });
  return normalizeArray<AttendanceHistoryItem>(res);
}

export function getTeacherGradingRules() {
  return apiFetch(`/teacher/grading-rules`, { method: "GET" }) as Promise<any>;
}
