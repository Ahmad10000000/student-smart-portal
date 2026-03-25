// src/api/admin.ts
import { apiFetch } from "./http";

const base = "/admin";

export type AdminProfile = {
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  department?: string;
  role?: string;
};

export type SystemStats = {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalAdmins?: number;
  activeSemester?: string;
};

export type CoursePayload = {
  code: string;
  name?: string;
  creditHours?: number | string;
  department?: string;
  day?: string;
  days?: string;
  time?: string;
  room?: string;
  instructor?: string;
};

export type StudentPayload = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  major?: string;
  password?: string;
};

export type TeacherPayload = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  department?: string;
  password?: string;
};

export type SemesterTimelinePayload =
  | {
      id?: number;
      term: string;
      startDate: string;
      endDate: string;
      examsEndDate?: string;
    }
  | {
      semester: string;
      startDate: string;
      endDate: string;
      withdrawDate: string;
    };

export type RegistrationDatesPayload = {
  startDate: string;
  endDate: string;
};

export type SystemAnnouncementPayload = {
  id?: number | string;
  title: string;
  message: string;
  target: string;
};

export type ExamSchedulePayload = {
  courseCode: string;
  type: "Mid" | "Final" | "Midterm";
  date: string;
  time: string;
  room: string;
};

export type GradingRulesPayload = {
  gradingOpen: boolean;
  allowAssignment: boolean;
  allowMidterm: boolean;
  allowFinal: boolean;
};

// ================= PROFILE =================

export function getAdminProfile(username: string) {
  return apiFetch(`${base}/profile/${encodeURIComponent(username)}`);
}

export function updateAdminProfile(payload: {
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  department?: string;
}) {
  return apiFetch(`${base}/profile/update`, {
    method: "PUT",
    body: payload,
  });
}

export function changeAdminPassword(payload: {
  username: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword?: string;
}) {
  return apiFetch(`${base}/profile/password`, {
    method: "POST",
    body: {
      username: payload.username,
      oldPassword: payload.oldPassword,
      newPassword: payload.newPassword,
      confirmPassword: payload.confirmPassword || payload.newPassword,
    },
  });
}

// ================= DASHBOARD =================

export function getSystemStats() {
  return apiFetch(`${base}/stats`) as Promise<SystemStats>;
}

export function cleanupSystem() {
  return apiFetch(`${base}/cleanup`, { method: "POST" });
}

// ================= COURSES =================

export function addCourse(payload: CoursePayload) {
  return apiFetch(`${base}/course/add`, {
    method: "POST",
    body: payload,
  });
}

export function updateCourse(payload: CoursePayload) {
  return apiFetch(`${base}/course/update`, {
    method: "PUT",
    body: payload,
  });
}

export function deleteCourse(code: string) {
  return apiFetch(`${base}/course/delete`, {
    method: "POST",
    body: { code },
  });
}

export function getCourses() {
  return apiFetch(`${base}/courses`);
}

// ================= STUDENTS =================

export function addStudent(payload: StudentPayload) {
  return apiFetch(`${base}/student/add`, {
    method: "POST",
    body: payload,
  });
}

export function updateStudent(payload: StudentPayload) {
  return apiFetch(`${base}/student/update`, {
    method: "PUT",
    body: payload,
  });
}

export function deleteStudent(id: string) {
  return apiFetch(`${base}/student/delete`, {
    method: "POST",
    body: { id },
  });
}

export function getStudents() {
  return apiFetch(`${base}/students`);
}

// ================= TEACHERS =================

export function addTeacher(payload: TeacherPayload) {
  return apiFetch(`${base}/teacher/add`, {
    method: "POST",
    body: payload,
  });
}

export function updateTeacher(payload: TeacherPayload) {
  return apiFetch(`${base}/teacher/update`, {
    method: "PUT",
    body: payload,
  });
}

export function deleteTeacher(id: string) {
  return apiFetch(`${base}/teacher/delete`, {
    method: "POST",
    body: { id },
  });
}

export function getTeachers() {
  return apiFetch(`${base}/teachers`);
}

// ================= ANNOUNCEMENTS =================

export function postSystemAnnouncement(payload: SystemAnnouncementPayload) {
  const safe = {
    title: payload.title?.trim() || "",
    message: payload.message?.trim() || "",
    target: payload.target?.trim() || "",
  };

  return apiFetch(`${base}/system-announcement/add`, {
    method: "POST",
    body: safe,
  });
}

export function updateSystemAnnouncement(payload: SystemAnnouncementPayload) {
  if (payload.id === undefined || payload.id === null || payload.id === "")
    throw new Error("Announcement id is required for update.");

  const safe = {
    id: Number(payload.id),
    title: payload.title?.trim(),
    message: payload.message?.trim(),
    target: payload.target?.trim(),
  };

  return apiFetch(`${base}/system-announcement/update`, {
    method: "PUT",
    body: safe,
  });
}

export function deleteSystemAnnouncement(id: string | number) {
  return apiFetch(`${base}/system-announcement/delete`, {
    method: "POST",
    body: { id: Number(id) },
  });
}

export function viewAllSystemAnnouncements() {
  return apiFetch(`${base}/system-announcements`);
}

// ================= SEMESTER / REGISTRATION / EXAMS =================

export function updateSemesterTimeline(payload: {
  semester: string;
  startDate: string;
  endDate: string;
  withdrawDate: string;
}) {
  const safe = {
    semester: String(payload.semester || "").trim(),
    startDate: String(payload.startDate || "").trim(),
    endDate: String(payload.endDate || "").trim(),
    withdrawDate: String(payload.withdrawDate || "").trim(),
  };

  return apiFetch(`${base}/system/semester`, {
    method: "POST",
    body: safe,
  });
}

export function updateRegistrationDates(payload: RegistrationDatesPayload) {
  const safe = {
    startDate: String(payload.startDate || "").trim(),
    endDate: String(payload.endDate || "").trim(),
  };

  return apiFetch(`${base}/update-registration-dates`, {
    method: "POST",
    body: safe,
  });
}

export function updateGradingPolicies(payload: GradingRulesPayload) {
  const safe: GradingRulesPayload = {
    gradingOpen: !!payload.gradingOpen,
    allowAssignment: !!payload.allowAssignment,
    allowMidterm: !!payload.allowMidterm,
    allowFinal: !!payload.allowFinal,
  };

  return apiFetch(`${base}/system/grading-rules`, {
    method: "POST",
    body: safe,
  });
}

export function setExamSchedule(payload: any) {
  return apiFetch(`${base}/exams/set`, {
    method: "POST",
    body: payload,
  });
}

export function setExamScheduleOne(payload: ExamSchedulePayload) {
  const safe: ExamSchedulePayload = {
    courseCode: String(payload.courseCode || "").trim(),
    type: (payload.type || "Mid") as any,
    date: String(payload.date || "").trim(),
    time: String(payload.time || "").trim(),
    room: String(payload.room || "").trim(),
  };

  return apiFetch(`${base}/exams/set`, {
    method: "POST",
    body: safe,
  });
}
