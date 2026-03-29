// API helper functions – wraps fetch calls to Express backend
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || ((typeof window !== "undefined" && window.location.hostname) 
  ? `${window.location.protocol}//${window.location.hostname}:5000`
  : "http://localhost:5000");

/**
 * Fetch all professors with optional filters.
 * @param {Object} params - { search, minRating, department, campus }
 */
export async function fetchProfessors(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.minRating) query.set("minRating", params.minRating);
  if (params.department) query.set("department", params.department);
  if (params.campus) query.set("campus", params.campus);

  const res = await fetch(`${API_BASE}/professors?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch professors");
  return res.json();
}

/**
 * Fetch a single professor by ID.
 */
export async function fetchProfessor(id) {
  const res = await fetch(`${API_BASE}/professors/${id}`);
  if (!res.ok) throw new Error("Failed to fetch professor");
  return res.json();
}

/**
 * Fetch reviews for a professor, including breakdown averages.
 */
export async function fetchReviews(professorId) {
  const res = await fetch(`${API_BASE}/reviews/${professorId}`);
  if (!res.ok) throw new Error("Failed to fetch reviews");
  return res.json();
}

/**
 * Submit a new review.
 */
export async function submitReview(reviewData) {
  const res = await fetch(`${API_BASE}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reviewData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to submit review");
  return data;
}
