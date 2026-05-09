// src/pages/ScholarshipDashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthStore";
import { getScholarshipStatus } from "../api/student";
import type { ScholarshipData, Suggestion } from "../types";

export default function ScholarshipDashboard() {
  const { user } = useAuth();
  const studentId = user?.id || "";

  const [data, setData] = useState<ScholarshipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!studentId) {
      setErr("Missing student id.");
      setLoading(false);
      return;
    }

    let alive = true;
    setLoading(true);
    setErr("");

    getScholarshipStatus(studentId)
      .then((d) => {
        if (!alive) return;
        setData(d);
        setLoading(false);
      })
      .catch((e) => {
        if (!alive) return;
        setErr(e?.message || "Failed to load scholarship status.");
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [studentId]);

  const theme = useMemo(() => {
    const color = data?.badgeColor;
    switch (color) {
      case "green":
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          text: "text-emerald-800",
          icon: "✅",
          title: "text-emerald-900",
        };
      case "orange":
        return {
          bg: "bg-amber-50",
          border: "border-amber-200",
          text: "text-amber-800",
          icon: "⚠️",
          title: "text-amber-900",
        };
      case "red":
      default:
        return {
          bg: "bg-rose-50",
          border: "border-rose-200",
          text: "text-rose-800",
          icon: "🛑",
          title: "text-rose-900",
        };
    }
  }, [data?.badgeColor]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Calculating Status...</div>;
  }

  if (err) {
    return <div className="p-8 text-center text-rose-600 font-semibold">{err}</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-rose-600 font-semibold">System Error</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className={`rounded-2xl border ${theme.border} ${theme.bg} p-8 shadow-sm`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{theme.icon}</span>
              <h1 className={`text-3xl font-bold ${theme.title}`}>{data.status}</h1>
            </div>
            <p className={`text-lg font-medium ${theme.text} opacity-90`}>{data.message}</p>
          </div>

          <div className="text-center bg-white/60 p-4 rounded-xl min-w-[160px]">
            <div className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-1">
              Current GPA
            </div>
            <div className={`text-5xl font-black ${theme.title}`}>{data.gpa.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {data.suggestions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">🚀 GPA Boost Opportunities</h3>
              <p className="text-sm text-gray-500">
                Retaking these specific courses will have the highest impact.
              </p>
            </div>

            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
              {data.suggestions.length} Suggestions
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {data.suggestions.map((course: Suggestion) => (
              <div
                key={course.courseCode}
                className="p-5 flex justify-between items-center hover:bg-gray-50 transition-colors group gap-4"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="bg-gray-100 p-3 rounded-lg text-gray-700 font-bold group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
                    {course.courseCode}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-900 truncate">{course.courseName}</h4>
                    <p className="text-sm text-amber-700 font-medium mt-0.5">💡 {course.reason}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-gray-400 font-medium uppercase">Old Grade</div>
                  <div className="text-xl font-bold text-gray-800 group-hover:text-rose-600 transition-colors">
                    {course.grade}%
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 p-4 text-center text-xs text-gray-500 border-t border-gray-100">
            * Contact your academic advisor before registering.
          </div>
        </div>
      )}
    </div>
  );
}
