// API helper functions – wraps fetch calls to Express backend
// Consistently use the env var in production for Vercel
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Fetch all professors with optional filters.
 * @param {Object} params - { search, minRating, department, campus }
 */
/**
 * Fetch all professors with optional filters and pagination.
 */
export async function fetchProfessors(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.minRating) query.set("minRating", params.minRating);
  if (params.department) query.set("department", params.department);
  if (params.campus) query.set("campus", params.campus);
  if (params.page) query.set("page", params.page);
  if (params.limit) query.set("limit", params.limit);

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
export async function fetchReviews(professorId, token) {
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/reviews/${professorId}`, {
    headers
  });
  if (!res.ok) throw new Error("Failed to fetch reviews");
  return res.json();
}

/**
 * Submit a new review.
 */
export async function submitReview(reviewData, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/reviews`, {
    method: "POST",
    headers,
    body: JSON.stringify(reviewData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to submit review");
  return data;
}

/**
 * Update an existing review.
 */
export async function updateReview(id, reviewData, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/reviews/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(reviewData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update review");
  return data;
}

/**
 * Delete a review (Admin).
 */
export async function deleteReview(id, token) {
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/reviews/${id}`, {
    method: "DELETE",
    headers,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete review");
  return data;
}
/**
 * Submit a request for a missing professor.
 */
export async function submitProfessorRequest(requestData, token) {
    const headers = { "Content-Type": "application/json" };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/api/requests`, {
        method: "POST",
        headers,
        body: JSON.stringify(requestData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to submit request");
    return data;
}

/**
 * Fetch all missing professor requests (Admin).
 */
export async function fetchRequests(token) {
    const headers = {};
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/api/requests`, {
        headers
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch requests");
    return data;
}

/**
 * Update the status of a professor request (Admin).
 */
export async function updateRequestStatus(id, status, updateData, token) {
    const headers = { "Content-Type": "application/json" };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/api/requests/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status, updateData }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update request");
    return data;
}
