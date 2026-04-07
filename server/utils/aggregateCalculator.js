const Review = require("../models/Review");
const Professor = require("../models/Professor");

/**
 * Re-calculate and update the aggregate ratings for a specific professor.
 *
 * IMPORTANT: Only reviews with isHidden = false are included in aggregates.
 * Shadow-banned users' reviews are silently excluded from all rating calculations.
 *
 * @param {string} professorId - The ID of the professor to update.
 */
async function updateProfessorAggregates(professorId) {
  try {
    // ─── Only count visible (non-hidden) reviews ───
    const visibleReviews = await Review.find({ professorId, isHidden: false });
    const professor = await Professor.findById(professorId);

    if (!professor) return;

    const count = visibleReviews.length;

    if (count === 0) {
      // Set to defaults if no visible reviews exist
      professor.totalReviews = 0;
      professor.averageRating = 0;
      professor.averageTeachingQuality = 0;
      professor.averageDifficulty = 0;
      professor.averageGradingStrictness = 0;
      professor.averageAttendanceStrictness = 0;
    } else {
      const sum = (field) => visibleReviews.reduce((acc, r) => acc + (r[field] || 0), 0);

      professor.totalReviews = count;
      professor.averageRating = parseFloat((sum("rating") / count).toFixed(2));
      professor.averageTeachingQuality = parseFloat((sum("teachingQuality") / count).toFixed(2));
      professor.averageDifficulty = parseFloat((sum("difficulty") / count).toFixed(2));
      professor.averageGradingStrictness = parseFloat((sum("gradingStrictness") / count).toFixed(2));
      professor.averageAttendanceStrictness = parseFloat((sum("attendanceStrictness") / count).toFixed(2));
    }

    await professor.save();
    return professor;
  } catch (error) {
    console.error(`Error updating professor aggregates for ${professorId}:`, error);
    throw error;
  }
}

module.exports = { updateProfessorAggregates };

