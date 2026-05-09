// src/App.tsx
import { useAuth } from "./auth/AuthStore";
import Login from "./pages/Login";

import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function AppInner() {
  const { user } = useAuth();

  if (!user) return <Login />;
  if (user.role === "teacher") return <TeacherDashboard />;
  if (user.role === "admin") return <AdminDashboard />;
  return <StudentDashboard />;
}

export default function App() {
  return <AppInner />;
}
