"use client";

import { useState, useEffect, useMemo } from "react";
import ProfessorCard from "../components/ProfessorCard";
import { fetchProfessors } from "../lib/api";

// Available tags for filtering (same as TagBadge)
const FILTER_TAGS = [
  "chill",
  "strict",
  "inspiring",
  "helpful",
  "boring",
  "easy grader",
  "tough grader",
];

const DEPARTMENTS = [
  "Architecture", "Biotechnology", "Civil", "Commerce", "Computer Application",
  "Computer Science", "Computer Science (AIML)", "Design", "Electrical & Electronics",
  "Electronics & Communications", "Law", "Management Studies", "Mechanical",
  "Pharmaceutical Sciences", "Psychology", "Science & Humanities"
];

export default function HomePage() {
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedCampus, setSelectedCampus] = useState("All");
  const [error, setError] = useState("");

  // Fetch professors on mount and when search/filters change
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (minRating > 0) params.minRating = minRating;
        if (selectedDepartment !== "All") params.department = selectedDepartment;
        if (selectedCampus !== "All") params.campus = selectedCampus;
        
        const data = await fetchProfessors(params);
        setProfessors(data);
      } catch (err) {
        setError("Failed to load professors. Is the backend running?");
      } finally {
        setLoading(false);
      }
    };

    // Debounce search input
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [search, minRating, selectedDepartment, selectedCampus]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
          Rate My Prof
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          PES Edition — Find and rate your professors. Anonymous, honest, and
          helpful.
        </p>
      </div>

      {/* Search and filters */}
      <div className="max-w-4xl mx-auto mb-8 space-y-4">
        {/* Search bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search professors by name..."
            className="w-full bg-gray-900/60 border border-gray-800 rounded-xl pl-12 pr-4 py-3.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          
          <div className="flex-1 w-full">
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors outline-none cursor-pointer"
            >
              <option value={0}>All Ratings</option>
              <option value={1}>1+ Stars</option>
              <option value={2}>2+ Stars</option>
              <option value={3}>3+ Stars</option>
              <option value={4}>4+ Stars</option>
            </select>
          </div>

          <div className="flex-1 w-full">
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors outline-none cursor-pointer"
            >
              <option value="All">All Campuses</option>
              <option value="RR Campus">RR Campus</option>
              <option value="EC Campus">EC Campus</option>
            </select>
          </div>

          <div className="flex-1 w-full">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors outline-none cursor-pointer"
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="max-w-3xl mx-auto mb-6 bg-red-500/10 border border-red-500/30 rounded-xl px-6 py-4 text-center">
          <p className="text-sm text-red-400">{error}</p>
          <p className="text-xs text-gray-600 mt-1">
            Make sure MongoDB is running and the server is started on port 5000
          </p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Professor grid */}
      {!loading && !error && (
        <>
          <div className="flex items-center justify-between mb-4 max-w-3xl mx-auto lg:max-w-none">
            <p className="text-sm text-gray-500">
              {professors.length} professor{professors.length !== 1 ? "s" : ""}{" "}
              found
            </p>
          </div>
          {professors.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-500 mb-2">No professors found</p>
              <p className="text-sm text-gray-600">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {professors.map((prof) => (
                <ProfessorCard key={prof._id} professor={prof} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
