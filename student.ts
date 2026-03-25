// src/api/auth.ts
import { apiFetch } from "./http";

export async function loginStudent(id: string, password: string) {
  return apiFetch("/login", {
    method: "POST",
    body: JSON.stringify({ id, password }),
  });
}

export async function loginTeacher(id: string, password: string) {
  return apiFetch("/teacher/login", {
    method: "POST",
    body: JSON.stringify({ id, password }),
  });
}

export async function loginAdmin(username: string, password: string) {
  return apiFetch("/admin/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function loginByRole(
  idOrUsername: string,
  password: string,
  role: "student" | "teacher" | "doctor" | "admin"
) {
  if (role === "student") {
    return loginStudent(idOrUsername, password);
  }
  if (role === "teacher" || role === "doctor") {
    return loginTeacher(idOrUsername, password);
  }
  if (role === "admin") {
    return loginAdmin(idOrUsername, password);
  }
  throw new Error("Invalid role");
}
