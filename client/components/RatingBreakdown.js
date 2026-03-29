"use client";

// RatingBreakdown – horizontal bar chart showing category averages
export default function RatingBreakdown({ breakdown }) {
  if (!breakdown) return null;

  const categories = [
    { label: "Overall Rating", value: breakdown.overall, color: "from-indigo-500 to-purple-500" },
    { label: "Teaching Quality", value: breakdown.teachingQuality, color: "from-cyan-500 to-blue-500" },
    { label: "Difficulty", value: breakdown.difficulty, color: "from-orange-500 to-red-500" },
    { label: "Grading Strictness", value: breakdown.gradingStrictness, color: "from-amber-500 to-yellow-500" },
    { label: "Attendance Strictness", value: breakdown.attendanceStrictness, color: "from-pink-500 to-rose-500" },
  ];

  return (
    <div className="space-y-4">
      {categories.map(({ label, value, color }) => (
        <div key={label}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-gray-400">{label}</span>
            <span className="text-sm font-semibold text-white">
              {value ? value.toFixed(1) : "–"} / 5
            </span>
          </div>
          <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500 ease-out`}
              style={{ width: `${(value / 5) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
