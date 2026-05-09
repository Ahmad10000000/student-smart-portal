// src/types.ts

export interface Suggestion {
  courseCode: string;
  courseName: string;
  grade: number;
  reason: string;
}

export interface ScholarshipData {
  gpa: number;
  status: "Safe" | "Warning" | "Not Qualified";
  message: string;
  badgeColor: "green" | "orange" | "red";
  suggestions: Suggestion[];
}
