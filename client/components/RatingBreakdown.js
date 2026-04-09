"use client";

// Converts a sentiment score (-1 to 1) to a 0–100% bar width
function sentimentToPercent(score) {
  return Math.round(((score + 1) / 2) * 100);
}

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

  const hasSentiment = breakdown.averageSentimentScore !== undefined && breakdown.averageSentimentScore !== null;
  const sentimentScore = breakdown.averageSentimentScore ?? 0;
  const sentimentPct = sentimentToPercent(sentimentScore);
  const sentimentColor =
    sentimentScore > 0.2
      ? "from-emerald-500 to-green-400"
      : sentimentScore < -0.2
      ? "from-red-500 to-rose-400"
      : "from-gray-500 to-gray-400";
  const sentimentLabel =
    sentimentScore > 0.2 ? "Positive" : sentimentScore < -0.2 ? "Negative" : "Neutral";

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

      {/* Sentiment row — only shown when data is present */}
      {hasSentiment && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-gray-400">Review Sentiment</span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                sentimentScore > 0.2
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : sentimentScore < -0.2
                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                  : "bg-gray-700/50 text-gray-500 border-gray-700"
              }`}
            >
              {sentimentLabel}
            </span>
          </div>
          {/* Bar goes from 0% (hate) to 50% (neutral) to 100% (love) */}
          <div className="relative h-2.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${sentimentColor} transition-all duration-500 ease-out`}
              style={{ width: `${sentimentPct}%` }}
            />
            {/* Centre marker for neutral reference */}
            <div className="absolute top-0 left-1/2 w-px h-full bg-gray-600 opacity-50" />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-gray-600">Negative</span>
            <span className="text-[9px] text-gray-600">Positive</span>
          </div>
        </div>
      )}
    </div>
  );
}
