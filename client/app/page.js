"use client";

import { useState, useEffect, useMemo } from "react";
import ProfessorCard from "../components/ProfessorCard";
import RequestProfessorModal from "../components/RequestProfessorModal";
import { fetchProfessors } from "../lib/api";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFound, setTotalFound] = useState(0);
  const limit = 12;

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setPage(1);
  }, [search, minRating, selectedDepartment, selectedCampus]);

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
        
        // Add pagination params
        params.page = page;
        params.limit = limit;
        
        const data = await fetchProfessors(params);
        setProfessors(data.professors);
        setTotalPages(data.pages);
        setTotalFound(data.total);
      } catch (err) {
        setError("Failed to load professors. Is the backend running?");
      } finally {
        setLoading(false);
      }
    };

    // Debounce search input
    const timer = setTimeout(load, page === 1 ? 50 : 300); // Faster load for page changes
    return () => clearTimeout(timer);
  }, [search, minRating, selectedDepartment, selectedCampus, page]);

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
              Showing page {page} of {totalPages} ({totalFound} total)
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
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {professors.map((prof) => (
                  <ProfessorCard key={prof._id} professor={prof} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, i) => {
                      const pNum = i + 1;
                      // Logic to show only adjacent pages if many
                      if (
                        totalPages > 7 &&
                        pNum !== 1 &&
                        pNum !== totalPages &&
                        Math.abs(pNum - page) > 1
                      ) {
                        if (pNum === page - 2 || pNum === page + 2) return <span key={pNum} className="px-1 text-gray-600">...</span>;
                        return null;
                      }

                      return (
                        <button
                          key={pNum}
                          onClick={() => setPage(pNum)}
                          className={`
                            min-w-[40px] h-10 rounded-xl font-bold text-sm transition-all
                            ${page === pNum 
                              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                              : 'bg-gray-900 border border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white'}
                          `}
                        >
                          {pNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Missing Professor Link */}
      <div className="mt-16 text-center border-t border-gray-800/60 pt-8 pb-12">
        <p className="text-gray-400 text-sm mb-3">Can't find your professor in the directory?</p>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900/80 hover:bg-gray-800 text-gray-300 hover:text-white transition-all border border-gray-700 hover:border-gray-500 text-sm font-medium shadow-sm cursor-pointer"
        >
          <AlertCircle className="w-4 h-4 text-amber-400" />
          Missing Professor? Report Here
        </button>
      </div>

      <RequestProfessorModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
